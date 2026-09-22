import { NextResponse } from 'next/server';
import { mfaResendSchema } from '@/lib/auth/validation';
import { resendMfaChallenge } from '@/lib/auth/mfa';
import { isRateLimited, recordFailure, recordSuccess } from '@/lib/auth/rateLimit';
import { audit } from '@/lib/security/log';
import { isTrustedOrigin } from '@/lib/security/origin';

function clientKey(request: Request): string {
  return `mfa-resend:${request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'}`;
}

// Each resend already carries its own 60s per-challenge cooldown, so this
// just catches spraying many different challenges from one IP.
const MFA_RESEND_MAX_ATTEMPTS = 10;

export async function POST(request: Request) {
  if (!isTrustedOrigin(request)) {
    audit({ event: 'authorisation_failure', result: 'failure' });
    return NextResponse.json({ error: 'Request rejected.' }, { status: 403 });
  }

  const key = clientKey(request);
  if (isRateLimited(key, MFA_RESEND_MAX_ATTEMPTS)) {
    return NextResponse.json({ error: 'Too many attempts. Try again later.' }, { status: 429 });
  }

  const parsed = mfaResendSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    recordFailure(key);
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }

  const result = await resendMfaChallenge(parsed.data.challengeId);
  if (!result.ok) {
    recordFailure(key);
    audit({ event: 'mfa_challenge_failed', result: 'failure', resourceId: parsed.data.challengeId });
    return NextResponse.json({ error: result.error, retryAfterSeconds: result.retryAfterSeconds }, { status: result.retryAfterSeconds ? 429 : 400 });
  }

  recordSuccess(key);
  audit({ event: 'mfa_resend', result: 'success', resourceId: result.challengeId });
  return NextResponse.json({ challengeId: result.challengeId, maskedEmail: result.maskedEmail, cooldownSeconds: 60 });
}
