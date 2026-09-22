import 'server-only';
import { createHmac, randomInt, timingSafeEqual } from 'node:crypto';
import { createClient } from '@supabase/supabase-js';
import { getSecret } from './session';
import { sendMail, isMailerConfigured } from '@/lib/email/mailer';

/**
 * Email-delivered 6-digit OTP as Factor 2, required after password
 * verification (Admin MFA PRD) and before a real admin session is issued.
 * Challenges are persisted in `admin_mfa_challenges` (migration 0013) —
 * only the HMAC hash of the code is stored, never the raw digits.
 */

export const MFA_OTP_TTL_MS = 10 * 60 * 1000;
export const MFA_MAX_ATTEMPTS = 5;
export const MFA_RESEND_COOLDOWN_MS = 60 * 1000;

export type MfaVerifyStatus = 'ok' | 'not_found' | 'used' | 'expired' | 'locked' | 'invalid';

export interface MfaChallengeRow {
  id: string;
  admin_email: string;
  otp_hash: string;
  expires_at: string;
  attempts: number;
  max_attempts: number;
  resend_available_at: string;
  used_at: string | null;
}

export function isMfaConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

function getClient() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false },
  });
}

/** Cryptographically secure — never Math.random(). */
function generateOtp(): string {
  return randomInt(0, 1_000_000).toString().padStart(6, '0');
}

function hashOtp(otp: string): string {
  return createHmac('sha256', getSecret()).update(otp).digest('hex');
}

function otpMatches(otp: string, hash: string): boolean {
  const a = Buffer.from(hashOtp(otp));
  const b = Buffer.from(hash);
  return a.length === b.length && timingSafeEqual(a, b);
}

/** `r***@justicefund.org.au` — shown in the MFA UI so the admin can confirm which inbox to check without exposing the full address. */
export function maskEmail(email: string): string {
  const [local, domain] = email.split('@');
  if (!local || !domain) return email;
  return `${local[0]}${'*'.repeat(Math.max(local.length - 1, 3))}@${domain}`;
}

function otpEmailBody(otp: string): { text: string; html: string } {
  const text = [
    'Intergenerational Justice Fund',
    '',
    `Your verification code is: ${otp}`,
    '',
    'This code expires in 10 minutes.',
    '',
    'If you did not attempt to sign in, you can ignore this email.',
  ].join('\n');

  const html = `
    <div style="font-family:sans-serif;color:#231f20;line-height:1.6;max-width:480px">
      <p style="letter-spacing:0.08em;text-transform:uppercase;font-size:12px;color:#806032">Intergenerational Justice Fund</p>
      <p>Your verification code is:</p>
      <p style="font-size:32px;font-weight:600;letter-spacing:0.1em">${otp}</p>
      <p style="color:#5b5758;font-size:13px">This code expires in 10 minutes.</p>
      <p style="color:#5b5758;font-size:13px">If you did not attempt to sign in, you can ignore this email.</p>
    </div>
  `;

  return { text, html };
}

async function deliverOtp(email: string, otp: string): Promise<{ ok: true } | { ok: false; error: string }> {
  const { text, html } = otpEmailBody(otp);
  return sendMail({ to: email, subject: 'Your IEJF admin verification code', text, html });
}

type CreateResult = { ok: true; challengeId: string; maskedEmail: string } | { ok: false; error: string };

/** Invalidates any still-pending challenge for this admin, creates a fresh one, and emails the code. Fails closed on any DB or SMTP error. */
export async function createMfaChallenge(email: string): Promise<CreateResult> {
  const client = getClient();
  const now = new Date();

  const { error: invalidateError } = await client
    .from('admin_mfa_challenges')
    .update({ used_at: now.toISOString(), updated_at: now.toISOString() })
    .ilike('admin_email', email)
    .is('used_at', null);
  if (invalidateError) return { ok: false, error: 'Could not start verification. Please try again.' };

  const otp = generateOtp();
  const { data, error } = await client
    .from('admin_mfa_challenges')
    .insert({
      admin_email: email,
      otp_hash: hashOtp(otp),
      expires_at: new Date(now.getTime() + MFA_OTP_TTL_MS).toISOString(),
      resend_available_at: new Date(now.getTime() + MFA_RESEND_COOLDOWN_MS).toISOString(),
    })
    .select('id')
    .single();

  if (error || !data) return { ok: false, error: 'Could not start verification. Please try again.' };

  const delivery = await deliverOtp(email, otp);
  if (!delivery.ok) {
    // Never leave a challenge the admin has no way to complete — invalidate it
    // rather than reporting success (Admin MFA PRD §11: never bypass MFA, but
    // also never dangle a challenge that can't be fulfilled).
    await client.from('admin_mfa_challenges').update({ used_at: new Date().toISOString() }).eq('id', data.id as string);
    return { ok: false, error: "We couldn't send your verification code. Please try again." };
  }

  return { ok: true, challengeId: data.id as string, maskedEmail: maskEmail(email) };
}

export interface MfaVerifyResult {
  status: MfaVerifyStatus;
  adminEmail?: string;
}

export async function verifyMfaChallenge(challengeId: string, otp: string): Promise<MfaVerifyResult> {
  const client = getClient();
  const { data, error } = await client.from('admin_mfa_challenges').select('*').eq('id', challengeId).maybeSingle();
  if (error || !data) return { status: 'not_found' };

  const row = data as MfaChallengeRow;
  if (row.used_at) return { status: 'used' };
  if (row.attempts >= row.max_attempts) return { status: 'locked' };
  if (new Date(row.expires_at).getTime() < Date.now()) return { status: 'expired' };

  if (!otpMatches(otp, row.otp_hash)) {
    const nextAttempts = row.attempts + 1;
    await client
      .from('admin_mfa_challenges')
      .update({ attempts: nextAttempts, updated_at: new Date().toISOString() })
      .eq('id', challengeId);
    return { status: nextAttempts >= row.max_attempts ? 'locked' : 'invalid' };
  }

  // Guard against a concurrent second request racing this same challenge to success.
  const { data: claimed } = await client
    .from('admin_mfa_challenges')
    .update({ used_at: new Date().toISOString(), updated_at: new Date().toISOString() })
    .eq('id', challengeId)
    .is('used_at', null)
    .select('id')
    .maybeSingle();

  if (!claimed) return { status: 'used' };
  return { status: 'ok', adminEmail: row.admin_email };
}

export type ResendResult =
  | { ok: true; challengeId: string; maskedEmail: string }
  | { ok: false; error: string; retryAfterSeconds?: number };

export async function resendMfaChallenge(challengeId: string): Promise<ResendResult> {
  const client = getClient();
  const { data, error } = await client.from('admin_mfa_challenges').select('*').eq('id', challengeId).maybeSingle();
  if (error || !data) return { ok: false, error: 'This verification session has expired. Please sign in again.' };

  const row = data as MfaChallengeRow;
  if (row.used_at) return { ok: false, error: 'This verification session has expired. Please sign in again.' };

  const cooldownRemainingMs = new Date(row.resend_available_at).getTime() - Date.now();
  if (cooldownRemainingMs > 0) {
    return { ok: false, error: 'Please wait before requesting another code.', retryAfterSeconds: Math.ceil(cooldownRemainingMs / 1000) };
  }

  const created = await createMfaChallenge(row.admin_email);
  if (!created.ok) return created;
  return { ok: true, challengeId: created.challengeId, maskedEmail: created.maskedEmail };
}

export { isMailerConfigured };
