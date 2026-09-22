import { NextResponse } from 'next/server';
import { loginSchema } from '@/lib/content/schemas';
import { findAdminByEmail } from '@/lib/auth/admin';
import { verifyPassword } from '@/lib/auth/password';
import { setSessionCookie } from '@/lib/auth/session';
import { startSession } from '@/lib/auth/sessionStore';
import { isRateLimited, recordFailure, recordSuccess } from '@/lib/auth/rateLimit';
import { createMfaChallenge, isMfaConfigured } from '@/lib/auth/mfa';
import { audit } from '@/lib/security/log';
import { isTrustedOrigin } from '@/lib/security/origin';

function clientKey(request: Request): string {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
}

const GENERIC_ERROR = { error: 'Invalid email or password.' };
// Any well-formed bcrypt hash — compared against when no account matches
// the email, so response timing doesn't reveal whether it exists.
const DUMMY_HASH = '$2b$12$cjmLWW7mAAfZlKcEHIMlleJ2BonzCnKdAHzRNH9cwIIX68pM6kZqi';

export async function POST(request: Request) {
  if (!isTrustedOrigin(request)) {
    audit({ event: 'authorisation_failure', result: 'failure' });
    return NextResponse.json({ error: 'Request rejected.' }, { status: 403 });
  }

  const key = clientKey(request);
  if (isRateLimited(key)) {
    return NextResponse.json({ error: 'Too many attempts. Try again later.' }, { status: 429 });
  }

  const parsed = loginSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    recordFailure(key);
    return NextResponse.json(GENERIC_ERROR, { status: 401 });
  }

  const { email, password } = parsed.data;
  const admin = await findAdminByEmail(email);

  // Always run the hash comparison, even when no account matches, so
  // response timing doesn't reveal whether the email exists (Admin.md 17.1).
  const passwordMatches = await verifyPassword(password, admin?.passwordHash ?? DUMMY_HASH);

  if (!admin || !passwordMatches) {
    recordFailure(key);
    audit({ event: 'login_failure', admin: email, result: 'failure' });
    return NextResponse.json(GENERIC_ERROR, { status: 401 });
  }

  recordSuccess(key);

  // TEMPORARY (requested 2026-09-22, pending Sir Jun's network/IP whitelist):
  // admin@justicefund.org.au is exempt from MFA so this one account can keep
  // logging in without email OTP delivery while the whitelist is set up.
  // Every other admin account still goes through MFA unconditionally below.
  // Remove MFA_EXEMPT_EMAILS once the whitelist is live — this is a
  // deliberate, time-boxed exception, not a reversal of the MFA policy.
  const MFA_EXEMPT_EMAILS = ['admin@justicefund.org.au'];
  const isMfaExempt = MFA_EXEMPT_EMAILS.includes(admin.email.toLowerCase());

  // Local dev without Supabase configured has nowhere to persist an MFA
  // challenge — same graceful-degradation fallback already used for
  // single-session enforcement (sessionStore.ts). Every real deployment has
  // Supabase configured, so MFA is enforced there unconditionally (except
  // the temporary exemption above).
  if (!isMfaConfigured() || isMfaExempt) {
    const sessionId = await startSession(admin.email, request.headers.get('user-agent'));
    await setSessionCookie(admin.email, sessionId);
    audit({
      event: 'login_success',
      admin: admin.email,
      result: 'success',
      metadata: isMfaExempt ? { mfaExempt: true, reason: 'temporary-whitelist-pending' } : undefined,
    });
    return NextResponse.json({ ok: true });
  }

  const challenge = await createMfaChallenge(admin.email);
  if (!challenge.ok) {
    audit({ event: 'mfa_challenge_failed', admin: admin.email, result: 'failure' });
    return NextResponse.json({ error: challenge.error }, { status: 500 });
  }

  audit({ event: 'mfa_challenge_created', admin: admin.email, result: 'success' });
  audit({ event: 'mfa_email_sent', admin: admin.email, result: 'success' });
  return NextResponse.json({ mfaRequired: true, challengeId: challenge.challengeId, maskedEmail: challenge.maskedEmail });
}
