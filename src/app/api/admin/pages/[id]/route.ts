import { NextResponse } from 'next/server';
import { requireAdminSession } from '@/lib/auth/guard';
import { getSiteContent, isSlugTaken, saveDraft } from '@/lib/content/content';
import { pageWriteSchema } from '@/lib/content/schemas';
import { sanitizeRichText } from '@/lib/security/sanitize';
import { audit } from '@/lib/security/log';
import type { ContentBlock } from '@/lib/content/types';

function sanitizeBlocks(blocks: ContentBlock[]): ContentBlock[] {
  return blocks.map((block) => (block.type === 'richText' ? { ...block, body: sanitizeRichText(block.body) } : block));
}

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PUT(request: Request, { params }: RouteParams) {
  const session = await requireAdminSession(request);
  if (session instanceof NextResponse) return session;
  const { id } = await params;

  const body = await request.json().catch(() => null);
  const parsed = pageWriteSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid page.', issues: parsed.error.issues }, { status: 400 });
  }

  const draft = await getSiteContent('draft');
  const existing = draft.pages.find((page) => page.id === id);
  if (!existing) {
    return NextResponse.json({ error: 'Page no longer exists.' }, { status: 404 });
  }

  // Core page routes are part of the public contract and never change slug.
  const slug = existing.isCore ? existing.slug : parsed.data.slug;
  if (!existing.isCore && slug !== existing.slug && isSlugTaken(draft, slug, existing.id)) {
    return NextResponse.json({ error: 'That URL is already in use.' }, { status: 409 });
  }

  const now = new Date().toISOString();
  const updated = {
    ...existing,
    title: parsed.data.title,
    slug,
    navLabel: parsed.data.navLabel,
    showInNavigation: parsed.data.showInNavigation,
    navOrder: parsed.data.navOrder,
    status: parsed.data.status,
    seo: parsed.data.seo,
    blocks: sanitizeBlocks(parsed.data.blocks),
    updatedAt: now,
  };

  await saveDraft({
    ...draft,
    pages: draft.pages.map((page) => (page.id === id ? updated : page)),
    updatedAt: now,
  });

  audit({ event: 'page_updated', admin: session, resourceId: id, result: 'success' });
  return NextResponse.json({ page: updated });
}

export async function DELETE(request: Request, { params }: RouteParams) {
  const session = await requireAdminSession(request);
  if (session instanceof NextResponse) return session;
  const { id } = await params;

  const body = await request.json().catch(() => ({}));
  if (body?.confirm !== true) {
    return NextResponse.json({ error: 'Deletion requires explicit confirmation.' }, { status: 400 });
  }

  const draft = await getSiteContent('draft');
  const existing = draft.pages.find((page) => page.id === id);
  if (!existing) {
    return NextResponse.json({ error: 'Page no longer exists.' }, { status: 404 });
  }
  if (existing.isCore) {
    return NextResponse.json({ error: 'Core pages cannot be deleted.' }, { status: 403 });
  }

  const now = new Date().toISOString();
  await saveDraft({
    ...draft,
    pages: draft.pages.filter((page) => page.id !== id),
    updatedAt: now,
  });

  audit({ event: 'page_deleted', admin: session, resourceId: id, result: 'success' });
  return NextResponse.json({ ok: true });
}
