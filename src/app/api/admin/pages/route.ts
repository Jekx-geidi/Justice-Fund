import { NextResponse } from 'next/server';
import { randomUUID } from 'node:crypto';
import { requireAdminSession } from '@/lib/auth/guard';
import { getSiteContent, isSlugTaken, nextNavOrder, saveDraft } from '@/lib/content/content';
import { pageWriteSchema } from '@/lib/content/schemas';
import { sanitizeRichText } from '@/lib/security/sanitize';
import { audit } from '@/lib/security/log';
import type { ContentBlock, SitePage } from '@/lib/content/types';

function sanitizeBlocks(blocks: ContentBlock[]): ContentBlock[] {
  return blocks.map((block) => (block.type === 'richText' ? { ...block, body: sanitizeRichText(block.body) } : block));
}

export async function POST(request: Request) {
  const session = await requireAdminSession(request);
  if (session instanceof NextResponse) return session;

  const body = await request.json().catch(() => null);
  const parsed = pageWriteSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid page.', issues: parsed.error.issues }, { status: 400 });
  }

  const draft = await getSiteContent('draft');
  if (isSlugTaken(draft, parsed.data.slug)) {
    return NextResponse.json({ error: 'That URL is already in use.' }, { status: 409 });
  }

  const now = new Date().toISOString();
  // Recommended safe defaults (Admin.md §50): a brand-new page never goes
  // live or into navigation until an explicit follow-up publish action,
  // and it always appends at the end of the nav order.
  const page: SitePage = {
    id: randomUUID(),
    title: parsed.data.title,
    slug: parsed.data.slug,
    navLabel: parsed.data.navLabel,
    isCore: false,
    showInNavigation: false,
    navOrder: nextNavOrder(draft),
    status: 'draft',
    seo: parsed.data.seo,
    blocks: sanitizeBlocks(parsed.data.blocks),
    createdAt: now,
    updatedAt: now,
    publishedAt: null,
  };

  await saveDraft({ ...draft, pages: [...draft.pages, page], updatedAt: now });
  audit({ event: 'page_created', admin: session, resourceId: page.id, result: 'success' });
  return NextResponse.json({ page }, { status: 201 });
}
