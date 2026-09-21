import { NextResponse } from 'next/server';
import { requireAdminSession } from '@/lib/auth/guard';
import { getSiteContent, saveDraft } from '@/lib/content/content';
import { draftPatchSchema } from '@/lib/content/schemas';
import { sanitizeRichText } from '@/lib/security/sanitize';
import { audit } from '@/lib/security/log';
import type { ContentBlock, SitePage } from '@/lib/content/types';

export async function GET(request: Request) {
  const session = await requireAdminSession(request);
  if (session instanceof NextResponse) return session;

  const draft = await getSiteContent('draft');
  return NextResponse.json(draft);
}

function sanitizeBlocks<T extends ContentBlock>(blocks: T[]): T[] {
  return blocks.map((block) => (block.type === 'richText' ? { ...block, body: sanitizeRichText(block.body) } : block));
}

export async function PUT(request: Request) {
  const session = await requireAdminSession(request);
  if (session instanceof NextResponse) return session;

  const body = await request.json().catch(() => null);
  const parsed = draftPatchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid content.', issues: parsed.error.issues }, { status: 400 });
  }

  const draft = await getSiteContent('draft');
  const now = new Date().toISOString();

  const pagesById = new Map(draft.pages.map((page) => [page.id, page]));
  for (const patch of parsed.data.pages) {
    const existing = pagesById.get(patch.id);
    if (!existing) {
      return NextResponse.json({ error: `Page ${patch.id} does not exist.` }, { status: 404 });
    }

    // About body isn't a rich-text block in this model but still passes
    // through user-authored HTML-free plain text, so no sanitisation needed
    // there; only generic richText blocks carry HTML that needs it.
    const updated: SitePage = {
      ...existing,
      ...patch,
      blocks: patch.blocks ? sanitizeBlocks(patch.blocks) : existing.blocks,
      additionalSections: patch.additionalSections ? sanitizeBlocks(patch.additionalSections) : existing.additionalSections,
      updatedAt: now,
    };
    pagesById.set(patch.id, updated);
  }

  const nextContent = {
    ...draft,
    pages: draft.pages.map((page) => pagesById.get(page.id) ?? page),
    insights: parsed.data.insights ?? draft.insights,
    updatedAt: now,
  };

  await saveDraft(nextContent);
  audit({ event: 'draft_save', result: 'success' });
  return NextResponse.json({ ok: true });
}
