import { NextResponse } from 'next/server';
import { requireAdminSession } from '@/lib/auth/guard';
import { getDesign, saveDesignDraft } from '@/lib/content/content';
import { siteDesignSchema } from '@/lib/design/validation';
import { audit } from '@/lib/security/log';

export async function GET(request: Request) {
  const session = await requireAdminSession(request);
  if (session instanceof NextResponse) return session;

  const [draft, live] = await Promise.all([getDesign('draft'), getDesign('live')]);
  return NextResponse.json({ draft, live });
}

export async function PUT(request: Request) {
  const session = await requireAdminSession(request);
  if (session instanceof NextResponse) return session;

  const parsed = siteDesignSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid settings.' }, { status: 400 });
  }

  await saveDesignDraft(parsed.data);
  audit({ event: 'draft_save', admin: session, result: 'success' });
  return NextResponse.json({ ok: true });
}
