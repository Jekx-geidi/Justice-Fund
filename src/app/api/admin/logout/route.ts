import { NextResponse } from 'next/server';
import { getSessionEmail, clearSessionCookie } from '@/lib/auth/session';
import { audit } from '@/lib/security/log';

export async function POST() {
  const email = await getSessionEmail();
  await clearSessionCookie();
  audit({ event: 'logout', admin: email ?? undefined, result: 'success' });
  return NextResponse.json({ ok: true });
}
