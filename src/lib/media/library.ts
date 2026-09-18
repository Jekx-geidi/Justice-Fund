import 'server-only';
import { mkdir, readFile, writeFile, unlink } from 'node:fs/promises';
import path from 'node:path';
import { createClient } from '@supabase/supabase-js';
import type { MediaReference } from '../content/types';
import { getSiteContent } from '../content/content';
import type { UploadedImage } from './upload';

const BUCKET = 'IMAGES IEJF';
const DATA_DIR = path.join(process.cwd(), 'data');
const LIBRARY_PATH = path.join(DATA_DIR, 'media.json');
const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads');

function isSupabaseConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

function getSupabaseClient() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false },
  });
}

// --- Local JSON fallback (no Supabase configured) --------------------------

async function readLocalLibrary(): Promise<(MediaReference & { path: string })[]> {
  try {
    const raw = await readFile(LIBRARY_PATH, 'utf8');
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

async function writeLocalLibrary(items: (MediaReference & { path: string })[]): Promise<void> {
  await mkdir(DATA_DIR, { recursive: true });
  await writeFile(LIBRARY_PATH, JSON.stringify(items, null, 2), 'utf8');
}

// --- Public API --------------------------------------------------------

export async function listMedia(): Promise<MediaReference[]> {
  if (!isSupabaseConfigured()) {
    const items = await readLocalLibrary();
    return items.map(({ id, url, alt, width, height }) => ({ id, url, alt, width, height }));
  }

  const client = getSupabaseClient();
  const { data, error } = await client
    .from('media')
    .select('id, url, alt_text, width, height')
    .order('created_at', { ascending: false });

  if (error) throw new Error(`Supabase media list failed: ${error.message}`);
  return (data ?? []).map((row) => ({ id: row.id, url: row.url, alt: row.alt_text, width: row.width, height: row.height }));
}

export async function addMediaRecord(image: UploadedImage): Promise<void> {
  if (!isSupabaseConfigured()) {
    const items = await readLocalLibrary();
    items.push({ id: image.id, url: image.url, alt: image.alt, width: image.width, height: image.height, path: image.path });
    await writeLocalLibrary(items);
    return;
  }

  const client = getSupabaseClient();
  const { error } = await client.from('media').insert({
    id: image.id,
    path: image.path,
    url: image.url,
    alt_text: image.alt,
    mime_type: image.mimeType,
    size: image.size,
    width: image.width,
    height: image.height,
  });
  if (error) throw new Error(`Supabase media insert failed: ${error.message}`);
}

/** Admin.md §15.3 — never silently delete media that's still used on the live site. */
export async function isMediaReferencedInLive(mediaId: string): Promise<boolean> {
  const live = await getSiteContent('live');

  const inPages = live.pages.some((page) => {
    if (page.home?.heroImage?.id === mediaId) return true;
    if (page.blocks.some((block) => 'image' in block && block.image?.id === mediaId)) return true;
    if (
      page.blocks.some(
        (block) => block.type === 'cardGrid' && block.cards.some((card) => card.image?.id === mediaId)
      )
    )
      return true;
    return false;
  });
  if (inPages) return true;

  return live.insights.some((entry) => entry.image?.id === mediaId);
}

export async function removeMediaRecord(mediaId: string): Promise<void> {
  if (!isSupabaseConfigured()) {
    const items = await readLocalLibrary();
    const match = items.find((item) => item.id === mediaId);
    if (!match) return;
    await writeLocalLibrary(items.filter((item) => item.id !== mediaId));
    await unlink(path.join(UPLOAD_DIR, match.path)).catch(() => undefined);
    return;
  }

  const client = getSupabaseClient();
  const { data: match, error: readError } = await client.from('media').select('path').eq('id', mediaId).maybeSingle();
  if (readError) throw new Error(`Supabase media lookup failed: ${readError.message}`);
  if (!match) return;

  await client.from('media').delete().eq('id', mediaId);
  await client.storage.from(BUCKET).remove([match.path]);
}
