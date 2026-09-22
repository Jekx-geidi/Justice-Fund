import { NextResponse } from 'next/server';
import { mfaVerifySchema } from '@/lib/auth/validation';
import { verifyMfaChallenge } from '@/lib/auth/mfa';
import { setSessionCookie } from '@/lib/auth/session';
import { startSession } from '@/lib/auth/sessionStore';
import { isRateLimited, recordFailure, recordSuccess } from '@/lib/auth/rateLimit';
import { audit } from '@/lib/security/log';
import { isTrustedOrigin } from '@/lib/security/origin';

function clientKey(request: Request): string {
  return `mfa-verify:${request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'}`;
}

// Above the per-challenge attempt cap (5, enforced in the DB row) so that
// cap — not this coarser IP-wide one — is what a legitimate admin hits
// first if they mistype a code a few times across a resend or two.
const MFA_VERIFY_MAX_ATTEMPTS = 20;

// Distinct, non-leaky copy per state — Factor 1 already succeeded, so these
// don't reveal anything about account existence, only about this one code.
const MESSAGES: Record<string, string> = {
  not_found: 'This verification session has expired. Please sign in again.',
  used: 'This code has already been used. Please sign in again.',
  expired: 'This code has expired. Request a new one.',
  locked: 'Too many incorrect attempts. Please sign in again.',
  invalid: 'That code is incorrect.',
};

export async function POST(request: Request) {
  if (!isTrustedOrigin(request)) {
    audit({ event: 'authorisation_failure', result: 'failure' });
    return NextResponse.json({ error: 'Request rejected.' }, { status: 403 });
  }

  const key = clientKey(request);
  if (isRateLimited(key, MFA_VERIFY_MAX_ATTEMPTS)) {
    return NextResponse.json({ error: 'Too many attempts. Try again later.' }, { status: 429 });
  }

  const parsed = mfaVerifySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    recordFailure(key);
    return NextResponse.json({ error: 'Enter the 6-digit code.', status: 'invalid' }, { status: 400 });
  }

  const { challengeId, otp } = parsed.data;
  const result = await verifyMfaChallenge(challengeId, otp);

  if (result.status !== 'ok') {
    recordFailure(key);
    const event = result.status === 'expired' ? 'mfa_expired' : result.status === 'locked' ? 'mfa_max_attempts_reached' : 'mfa_verify_failure';
    audit({ event, result: 'failure', resourceId: challengeId });
    return NextResponse.json({ error: MESSAGES[result.status] ?? MESSAGES.invalid, status: result.status }, { status: 401 });
  }

  recordSuccess(key);
  const email = result.adminEmail!;
  const sessionId = await startSession(email, request.headers.get('user-agent'));
  await setSessionCookie(email, sessionId);
  audit({ event: 'mfa_verify_success', admin: email, result: 'success', resourceId: challengeId });
  audit({ event: 'login_success', admin: email, result: 'success' });
  return NextResponse.json({ ok: true });
}
