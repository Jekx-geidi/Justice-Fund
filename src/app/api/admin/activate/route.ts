import { NextResponse } from 'next/server';
import { activateAdminAccount } from '@/lib/auth/adminUsers';
import { activateAccountSchema } from '@/lib/auth/validation';
import { audit } from '@/lib/security/log';
import { isTrustedOrigin } from '@/lib/security/origin';

/** Pre-login route — a fresh account has no session yet, so this deliberately doesn't call requireAdminSession. */
export async function POST(request: Request) {
  if (!isTrustedOrigin(request)) {
    audit({ event: 'authorisation_failure', result: 'failure' });
    return NextResponse.json({ error: 'Request rejected.' }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const parsed = activateAccountSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid input.' }, { status: 400 });
  }

  const result = await activateAdminAccount(parsed.data.token, parsed.data.password);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  audit({ event: 'admin_account_activated', admin: result.email, result: 'success' });
  return NextResponse.json({ ok: true });
}
