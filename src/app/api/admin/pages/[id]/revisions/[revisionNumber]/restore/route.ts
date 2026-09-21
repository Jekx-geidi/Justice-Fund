import { NextResponse } from 'next/server';
import { requireAdminSession } from '@/lib/auth/guard';
import { getSiteContent, saveDraft } from '@/lib/content/content';
import { getRevision } from '@/lib/content/revisions';
import { audit } from '@/lib/security/log';

interface RouteParams {
  params: Promise<{ id: string; revisionNumber: string }>;
}

/**
 * Restores a prior published revision into the current DRAFT only — never
 * live. The admin still has to Save Draft is implicit (this already writes
 * the draft) and then explicitly Publish for it to go live (Phase 2 §8.4:
 * "Do not directly overwrite live content without review").
 */
export async function POST(request: Request, { params }: RouteParams) {
  const session = await requireAdminSession(request);
  if (session instanceof NextResponse) return session;
  const { id, revisionNumber } = await params;

  const parsedNumber = Number.parseInt(revisionNumber, 10);
  if (!Number.isInteger(parsedNumber) || parsedNumber < 1) {
    return NextResponse.json({ error: 'Invalid revision.' }, { status: 400 });
  }

  const revision = await getRevision(id, parsedNumber);
  if (!revision) {
    return NextResponse.json({ error: 'Revision not found.' }, { status: 404 });
  }

  const draft = await getSiteContent('draft');
  const exists = draft.pages.some((page) => page.id === id);
  if (!exists) {
    return NextResponse.json({ error: 'Page no longer exists.' }, { status: 404 });
  }

  const now = new Date().toISOString();
  const restoredPage = { ...revision.snapshot, updatedAt: now };

  await saveDraft({
    ...draft,
    pages: draft.pages.map((page) => (page.id === id ? restoredPage : page)),
    updatedAt: now,
  });

  audit({ event: 'revision_restored', admin: session, resourceId: id, result: 'success' });
  return NextResponse.json({ page: restoredPage });
}
