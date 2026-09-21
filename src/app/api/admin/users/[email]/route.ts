import { NextResponse } from 'next/server';
import { requireAdminSession } from '@/lib/auth/guard';
import { listAdminUsers, updateAdminUserName, setAdminUserActive } from '@/lib/auth/adminUsers';
import { updateAdminUserSchema } from '@/lib/auth/validation';
import { audit } from '@/lib/security/log';

export async function PATCH(request: Request, { params }: { params: Promise<{ email: string }> }) {
  const session = await requireAdminSession(request);
  if (session instanceof NextResponse) return session;

  const { email: encodedEmail } = await params;
  const targetEmail = decodeURIComponent(encodedEmail);

  const body = await request.json().catch(() => null);
  const parsed = updateAdminUserSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid input.' }, { status: 400 });
  }

  if (parsed.data.isActive === false) {
    if (targetEmail.toLowerCase() === session.toLowerCase()) {
      return NextResponse.json({ error: 'You cannot disable your own account.' }, { status: 400 });
    }
    const users = await listAdminUsers();
    const otherActiveAdmins = users.filter((user) => user.isActive && !user.pending && user.email.toLowerCase() !== targetEmail.toLowerCase());
    if (otherActiveAdmins.length === 0) {
      return NextResponse.json({ error: 'At least one active Admin account must remain.' }, { status: 400 });
    }
  }

  if (parsed.data.name !== undefined) {
    const ok = await updateAdminUserName(targetEmail, parsed.data.name);
    if (!ok) return NextResponse.json({ error: 'Could not update the account.' }, { status: 500 });
  }

  if (parsed.data.isActive !== undefined) {
    const ok = await setAdminUserActive(targetEmail, parsed.data.isActive);
    if (!ok) return NextResponse.json({ error: 'Could not update the account.' }, { status: 500 });
    audit({
      event: parsed.data.isActive ? 'admin_user_reactivated' : 'admin_user_disabled',
      admin: session,
      resourceId: targetEmail,
      result: 'success',
    });
  } else if (parsed.data.name !== undefined) {
    audit({ event: 'admin_user_updated', admin: session, resourceId: targetEmail, result: 'success' });
  }

  return NextResponse.json({ ok: true });
}
