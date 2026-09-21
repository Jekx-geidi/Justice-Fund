import 'server-only';
import { createClient } from '@supabase/supabase-js';
import type { SitePage } from './types';

export interface PageRevision {
  id: string;
  pageId: string;
  revisionNumber: number;
  snapshot: SitePage;
  publishedBy: string | null;
  publishedAt: string;
}

function isSupabaseConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

function getClient() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false },
  });
}

function fromRow(row: Record<string, unknown>): PageRevision {
  return {
    id: row.id as string,
    pageId: row.page_id as string,
    revisionNumber: row.revision_number as number,
    snapshot: row.snapshot as SitePage,
    publishedBy: (row.published_by as string | null) ?? null,
    publishedAt: row.published_at as string,
  };
}

/**
 * Snapshots every page that's actually published, once per publish — not
 * only pages that changed. Simpler and safer than diffing, and revision
 * volume is a non-issue at this site's scale (Phase 2 §8, §21).
 * No-ops without Supabase configured (local-JSON dev fallback has no
 * durable per-page history store).
 */
export async function recordRevisionsForPublish(pages: SitePage[], publishedBy: string | null): Promise<void> {
  if (!isSupabaseConfigured()) return;
  const client = getClient();

  for (const page of pages) {
    if (page.status !== 'published') continue;

    const { data: last } = await client
      .from('page_revisions')
      .select('revision_number')
      .eq('page_id', page.id)
      .order('revision_number', { ascending: false })
      .limit(1)
      .maybeSingle();

    const nextNumber = (last?.revision_number ?? 0) + 1;
    await client.from('page_revisions').insert({
      page_id: page.id,
      revision_number: nextNumber,
      snapshot: page,
      published_by: publishedBy,
    });
  }
}

export async function listRevisions(pageId: string): Promise<PageRevision[]> {
  if (!isSupabaseConfigured()) return [];
  const client = getClient();
  const { data, error } = await client
    .from('page_revisions')
    .select('id, page_id, revision_number, snapshot, published_by, published_at')
    .eq('page_id', pageId)
    .order('revision_number', { ascending: false })
    .limit(50);

  if (error || !data) return [];
  return data.map(fromRow);
}

export async function getRevision(pageId: string, revisionNumber: number): Promise<PageRevision | null> {
  if (!isSupabaseConfigured()) return null;
  const client = getClient();
  const { data, error } = await client
    .from('page_revisions')
    .select('id, page_id, revision_number, snapshot, published_by, published_at')
    .eq('page_id', pageId)
    .eq('revision_number', revisionNumber)
    .maybeSingle();

  if (error || !data) return null;
  return fromRow(data);
}
