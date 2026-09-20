import 'server-only';
import { createClient } from '@supabase/supabase-js';
import type { MediaReference, SiteContent, SitePage } from './types';

/**
 * Page content embeds a MediaReference snapshot (id + url + alt + focal
 * point) rather than a bare media id, so existing content keeps working
 * with no schema migration. The trade-off: without this step, "Replace
 * Image" or a later focal-point edit in the Media Library would only
 * update the library record — every page that already picked that image
 * would keep showing the stale url/focal point forever. This refreshes
 * url/width/height/focalX/focalY from the media table by id on every read,
 * while leaving the per-placement `alt` text (which an admin may have
 * customised for that specific usage) untouched. Falls back to the
 * embedded snapshot untouched when Supabase isn't configured or a
 * referenced media row no longer exists.
 */

function isSupabaseConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function collectMediaIds(content: SiteContent): Set<string> {
  const ids = new Set<string>();
  const add = (ref?: MediaReference | null) => {
    if (ref?.id) ids.add(ref.id);
  };

  for (const page of content.pages) {
    add(page.home?.heroImage);
    for (const block of page.blocks) {
      if (block.type === 'hero' || block.type === 'imageText') add(block.image);
      if (block.type === 'cardGrid') for (const card of block.cards) add(card.image);
    }
  }
  for (const entry of content.insights) add(entry.image);

  return ids;
}

function refreshRef(ref: MediaReference, fresh: Map<string, MediaReference>): MediaReference {
  const row = fresh.get(ref.id);
  if (!row) return ref;
  return { ...ref, url: row.url, width: row.width, height: row.height, focalX: row.focalX, focalY: row.focalY };
}

function refreshRefOrNull(ref: MediaReference | null | undefined, fresh: Map<string, MediaReference>): MediaReference | null | undefined {
  if (!ref) return ref;
  return refreshRef(ref, fresh);
}

export async function resolveMediaReferences(content: SiteContent): Promise<SiteContent> {
  if (!isSupabaseConfigured()) return content;

  // Seed/placeholder content (e.g. the Insights blank-state example) can carry
  // non-UUID ids that were never real media rows. `.in('id', …)` against a
  // `uuid` column throws for the whole batch on just one malformed value, so
  // those are filtered out here rather than left to silently break
  // resolution for every real reference alongside them.
  const ids = Array.from(collectMediaIds(content)).filter((id) => UUID_RE.test(id));
  if (ids.length === 0) return content;

  const client = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false },
  });

  const { data, error } = await client.from('media').select('id, url, width, height, focal_x, focal_y').in('id', ids);
  if (error || !data) return content;

  const fresh = new Map<string, MediaReference>(
    data.map((row) => [
      row.id,
      { id: row.id, url: row.url, alt: '', width: row.width ?? undefined, height: row.height ?? undefined, focalX: row.focal_x ?? undefined, focalY: row.focal_y ?? undefined },
    ])
  );

  const pages: SitePage[] = content.pages.map((page) => ({
    ...page,
    home: page.home ? { ...page.home, heroImage: refreshRefOrNull(page.home.heroImage, fresh) } : page.home,
    blocks: page.blocks.map((block) => {
      if (block.type === 'hero' || block.type === 'imageText') {
        return { ...block, image: refreshRefOrNull(block.image, fresh) };
      }
      if (block.type === 'cardGrid') {
        return { ...block, cards: block.cards.map((card) => ({ ...card, image: refreshRefOrNull(card.image, fresh) })) };
      }
      return block;
    }),
  }));

  const insights = content.insights.map((entry) => ({ ...entry, image: refreshRefOrNull(entry.image, fresh) }));

  return { ...content, pages, insights };
}
