import { NextResponse } from 'next/server';
import { requireAdminSession } from '@/lib/auth/guard';
import { listAdminUsers, createAdminUser } from '@/lib/auth/adminUsers';
import { createAdminUserSchema } from '@/lib/auth/validation';
import { audit } from '@/lib/security/log';

export async function GET(request: Request) {
  const session = await requireAdminSession(request);
  if (session instanceof NextResponse) return session;

  const users = await listAdminUsers();
  return NextResponse.json({ users });
}

export async function POST(request: Request) {
  const session = await requireAdminSession(request);
  if (session instanceof NextResponse) return session;

  const body = await request.json().catch(() => null);
  const parsed = createAdminUserSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid input.' }, { status: 400 });
  }

  const result = await createAdminUser(parsed.data.name, parsed.data.email);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  audit({ event: 'admin_user_created', admin: session, resourceId: parsed.data.email, result: 'success' });

  const proto = request.headers.get('x-forwarded-proto') ?? 'https';
  const host = request.headers.get('host');
  const activationUrl = `${proto}://${host}/admin/activate?token=${result.activationToken}`;
  return NextResponse.json({ activationUrl });
}
