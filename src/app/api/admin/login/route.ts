import { NextResponse } from 'next/server';
import { loginSchema } from '@/lib/content/schemas';
import { findAdminByEmail } from '@/lib/auth/admin';
import { verifyPassword } from '@/lib/auth/password';
import { setSessionCookie } from '@/lib/auth/session';
import { isRateLimited, recordFailure, recordSuccess } from '@/lib/auth/rateLimit';
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
  await setSessionCookie(admin.email);
  audit({ event: 'login_success', admin: admin.email, result: 'success' });
  return NextResponse.json({ ok: true });
}
