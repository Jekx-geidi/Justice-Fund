import { NextResponse } from 'next/server';
import { getSessionEmail, clearSessionCookie } from '@/lib/auth/session';
import { terminateSession } from '@/lib/auth/sessionStore';
import { audit } from '@/lib/security/log';

export async function POST() {
  const email = await getSessionEmail();
  if (email) await terminateSession(email);
  await clearSessionCookie();
  audit({ event: 'logout', admin: email ?? undefined, result: 'success' });
  return NextResponse.json({ ok: true });
}
