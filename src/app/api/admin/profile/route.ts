import { NextResponse } from 'next/server';
import { requireAdminSession } from '@/lib/auth/guard';
import { updateAdminUserAvatar } from '@/lib/auth/adminUsers';
import { updateProfileSchema } from '@/lib/auth/validation';
import { audit } from '@/lib/security/log';

/** Self-service only — updates the signed-in admin's own profile picture, never another admin's. */
export async function PATCH(request: Request) {
  const session = await requireAdminSession(request);
  if (session instanceof NextResponse) return session;

  const body = await request.json().catch(() => null);
  const parsed = updateProfileSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid input.' }, { status: 400 });
  }

  const ok = await updateAdminUserAvatar(session, parsed.data.avatar);
  if (!ok) return NextResponse.json({ error: 'Could not update your profile picture.' }, { status: 500 });

  audit({ event: 'admin_user_updated', admin: session, resourceId: session, result: 'success' });
  return NextResponse.json({ ok: true });
}
