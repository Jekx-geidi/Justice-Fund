import { NextResponse } from 'next/server';
import { requireAdminSession } from '@/lib/auth/guard';
import { getSiteContent, saveDraft } from '@/lib/content/content';
import { reorderSchema } from '@/lib/content/schemas';

export async function POST(request: Request) {
  const session = await requireAdminSession(request);
  if (session instanceof NextResponse) return session;

  const body = await request.json().catch(() => null);
  const parsed = reorderSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid order.' }, { status: 400 });
  }

  const draft = await getSiteContent('draft');
  const orderIndex = new Map(parsed.data.orderedIds.map((id, index) => [id, index]));

  const missing = draft.pages.some((page) => !orderIndex.has(page.id));
  if (missing || orderIndex.size !== draft.pages.length) {
    return NextResponse.json({ error: 'Order must include every page exactly once.' }, { status: 400 });
  }

  const now = new Date().toISOString();
  const pages = draft.pages.map((page) => ({ ...page, navOrder: orderIndex.get(page.id)!, updatedAt: now }));

  await saveDraft({ ...draft, pages, updatedAt: now });
  return NextResponse.json({ ok: true });
}
