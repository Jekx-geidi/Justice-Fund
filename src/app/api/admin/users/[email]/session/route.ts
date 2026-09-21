import { NextResponse } from 'next/server';
import { requireAdminSession } from '@/lib/auth/guard';
import { terminateSession } from '@/lib/auth/sessionStore';
import { audit } from '@/lib/security/log';

export async function DELETE(request: Request, { params }: { params: Promise<{ email: string }> }) {
  const session = await requireAdminSession(request);
  if (session instanceof NextResponse) return session;

  const { email: encodedEmail } = await params;
  const targetEmail = decodeURIComponent(encodedEmail);

  await terminateSession(targetEmail);
  audit({ event: 'admin_session_terminated', admin: session, resourceId: targetEmail, result: 'success' });
  return NextResponse.json({ ok: true });
}
