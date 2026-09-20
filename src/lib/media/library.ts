import 'server-only';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { createClient } from '@supabase/supabase-js';
import type { SiteContent } from '../content/types';
import { getSiteContent } from '../content/content';
import type { UploadedImage } from './upload';
import { removeStoredFile } from './upload';
import type { MediaCategory, MediaItem, MediaMetadataPatch, MediaUsageRef } from './types';

const DATA_DIR = path.join(process.cwd(), 'data');
const LIBRARY_PATH = path.join(DATA_DIR, 'media.json');

function isSupabaseConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

function getSupabaseClient() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false },
  });
}

// --- Usage detection — always derived from real page/insight content, never a stored field ---

function collectUsageFromContent(content: SiteContent, mediaId: string): MediaUsageRef[] {
  const refs: MediaUsageRef[] = [];

  for (const page of content.pages) {
    const editHref = `/admin/pages/${page.id}`;

    if (page.home?.heroImage?.id === mediaId) {
      refs.push({ pageId: page.id, pageTitle: page.title, location: 'Hero image', editHref });
    }

    for (const block of page.blocks) {
      if (block.type === 'hero' && block.image?.id === mediaId) {
        refs.push({ pageId: page.id, pageTitle: page.title, location: 'Hero block', editHref });
      }
      if (block.type === 'imageText' && block.image?.id === mediaId) {
        refs.push({ pageId: page.id, pageTitle: page.title, location: 'Image + text block', editHref });
      }
      if (block.type === 'cardGrid') {
        for (const card of block.cards) {
          if (card.image?.id === mediaId) {
            refs.push({
              pageId: page.id,
              pageTitle: page.title,
              location: `Cards → ${card.title || 'Untitled card'}`,
              editHref,
            });
          }
        }
      }
    }
  }

  for (const entry of content.insights) {
    if (entry.image?.id === mediaId) {
      refs.push({
        pageId: entry.id,
        pageTitle: 'Insights',
        location: entry.title || 'Untitled entry',
        editHref: '/admin/insights',
      });
    }
  }

  return refs;
}

function mergeUsage(draftRefs: MediaUsageRef[], liveRefs: MediaUsageRef[]): MediaUsageRef[] {
  const merged = [...draftRefs];
  const seen = new Set(draftRefs.map((ref) => `${ref.pageId}::${ref.location}`));
  for (const ref of liveRefs) {
    const key = `${ref.pageId}::${ref.location}`;
    if (!seen.has(key)) {
      merged.push(ref);
      seen.add(key);
    }
  }
  return merged;
}

/** Usage across both draft and live — a media item still referenced in either is not safe to delete. */
export async function getMediaUsageMap(mediaIds: string[]): Promise<Map<string, MediaUsageRef[]>> {
  const [draft, live] = await Promise.all([getSiteContent('draft'), getSiteContent('live')]);
  const map = new Map<string, MediaUsageRef[]>();
  for (const id of mediaIds) {
    map.set(id, mergeUsage(collectUsageFromContent(draft, id), collectUsageFromContent(live, id)));
  }
  return map;
}

export async function getMediaUsage(mediaId: string): Promise<MediaUsageRef[]> {
  const map = await getMediaUsageMap([mediaId]);
  return map.get(mediaId) ?? [];
}

export async function isMediaReferenced(mediaId: string): Promise<boolean> {
  return (await getMediaUsage(mediaId)).length > 0;
}

// --- Local JSON fallback (no Supabase configured) --------------------------

type LocalMediaRow = Omit<MediaItem, 'usage'>;

async function readLocalLibrary(): Promise<LocalMediaRow[]> {
  try {
    const raw = await readFile(LIBRARY_PATH, 'utf8');
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

async function writeLocalLibrary(items: LocalMediaRow[]): Promise<void> {
  await mkdir(DATA_DIR, { recursive: true });
  await writeFile(LIBRARY_PATH, JSON.stringify(items, null, 2), 'utf8');
}

// --- Public API --------------------------------------------------------

export async function listMedia(): Promise<MediaItem[]> {
  const rows: LocalMediaRow[] = isSupabaseConfigured() ? await listSupabaseRows() : await readLocalLibrary();
  const usageMap = await getMediaUsageMap(rows.map((row) => row.id));
  return rows.map((row) => ({ ...row, usage: usageMap.get(row.id) ?? [] }));
}

async function listSupabaseRows(): Promise<LocalMediaRow[]> {
  const client = getSupabaseClient();
  const { data, error } = await client
    .from('media')
    .select(
      'id, path, url, title, alt_text, caption, description, category, mime_type, size, width, height, focal_x, focal_y, uploaded_by, created_at, updated_at'
    )
    .order('created_at', { ascending: false });

  if (error) throw new Error(`Supabase media list failed: ${error.message}`);
  return (data ?? []).map(rowFromSupabase);
}

function rowFromSupabase(row: Record<string, unknown>): LocalMediaRow {
  return {
    id: row.id as string,
    path: row.path as string,
    url: row.url as string,
    title: (row.title as string | null) ?? null,
    altText: row.alt_text as string,
    caption: (row.caption as string | null) ?? null,
    description: (row.description as string | null) ?? null,
    category: (row.category as MediaCategory) ?? 'uncategorized',
    mimeType: row.mime_type as string,
    size: row.size as number,
    width: (row.width as number | null) ?? undefined,
    height: (row.height as number | null) ?? undefined,
    focalX: (row.focal_x as number | null) ?? 0.5,
    focalY: (row.focal_y as number | null) ?? 0.5,
    uploadedBy: (row.uploaded_by as string | null) ?? null,
    createdAt: row.created_at as string,
    updatedAt: (row.updated_at as string | null) ?? (row.created_at as string),
  };
}

export interface AddMediaOptions {
  title?: string;
  category?: MediaCategory;
  uploadedBy?: string | null;
}

export async function addMediaRecord(image: UploadedImage, options: AddMediaOptions = {}): Promise<MediaItem> {
  const now = new Date().toISOString();
  const category = options.category ?? 'uncategorized';

  if (!isSupabaseConfigured()) {
    const items = await readLocalLibrary();
    const row: LocalMediaRow = {
      id: image.id,
      path: image.path,
      url: image.url,
      title: options.title ?? null,
      altText: image.alt,
      caption: null,
      description: null,
      category,
      mimeType: image.mimeType,
      size: image.size,
      width: image.width,
      height: image.height,
      focalX: 0.5,
      focalY: 0.5,
      uploadedBy: options.uploadedBy ?? null,
      createdAt: now,
      updatedAt: now,
    };
    items.push(row);
    await writeLocalLibrary(items);
    return { ...row, usage: [] };
  }

  const client = getSupabaseClient();
  const { data, error } = await client
    .from('media')
    .insert({
      id: image.id,
      path: image.path,
      url: image.url,
      title: options.title ?? null,
      alt_text: image.alt,
      category,
      mime_type: image.mimeType,
      size: image.size,
      width: image.width,
      height: image.height,
      uploaded_by: options.uploadedBy ?? null,
    })
    .select(
      'id, path, url, title, alt_text, caption, description, category, mime_type, size, width, height, focal_x, focal_y, uploaded_by, created_at, updated_at'
    )
    .single();

  if (error) throw new Error(`Supabase media insert failed: ${error.message}`);
  return { ...rowFromSupabase(data), usage: [] };
}

export async function updateMediaRecord(mediaId: string, patch: MediaMetadataPatch): Promise<MediaItem | null> {
  const now = new Date().toISOString();

  if (!isSupabaseConfigured()) {
    const items = await readLocalLibrary();
    const index = items.findIndex((item) => item.id === mediaId);
    if (index === -1) return null;
    const updated: LocalMediaRow = {
      ...items[index],
      title: patch.title !== undefined ? patch.title : items[index].title,
      altText: patch.altText !== undefined ? patch.altText : items[index].altText,
      caption: patch.caption !== undefined ? patch.caption : items[index].caption,
      description: patch.description !== undefined ? patch.description : items[index].description,
      category: patch.category ?? items[index].category,
      focalX: patch.focalX ?? items[index].focalX,
      focalY: patch.focalY ?? items[index].focalY,
      updatedAt: now,
    };
    items[index] = updated;
    await writeLocalLibrary(items);
    return { ...updated, usage: await getMediaUsage(mediaId) };
  }

  const client = getSupabaseClient();
  const update: Record<string, unknown> = { updated_at: now };
  if (patch.title !== undefined) update.title = patch.title;
  if (patch.altText !== undefined) update.alt_text = patch.altText;
  if (patch.caption !== undefined) update.caption = patch.caption;
  if (patch.description !== undefined) update.description = patch.description;
  if (patch.category !== undefined) update.category = patch.category;
  if (patch.focalX !== undefined) update.focal_x = patch.focalX;
  if (patch.focalY !== undefined) update.focal_y = patch.focalY;

  const { data, error } = await client
    .from('media')
    .update(update)
    .eq('id', mediaId)
    .select(
      'id, path, url, title, alt_text, caption, description, category, mime_type, size, width, height, focal_x, focal_y, uploaded_by, created_at, updated_at'
    )
    .maybeSingle();

  if (error) throw new Error(`Supabase media update failed: ${error.message}`);
  if (!data) return null;
  return { ...rowFromSupabase(data), usage: await getMediaUsage(mediaId) };
}

/**
 * Swaps the underlying file for an existing media record — the id, title,
 * alt text, caption, category and every page reference stay put; only the
 * storage object and its derived fields (path/url/mime/size/dimensions)
 * change. This is what lets "Replace Image" avoid updating every page that
 * uses the photo.
 */
export async function replaceMediaFile(mediaId: string, image: UploadedImage): Promise<MediaItem | null> {
  const now = new Date().toISOString();

  if (!isSupabaseConfigured()) {
    const items = await readLocalLibrary();
    const index = items.findIndex((item) => item.id === mediaId);
    if (index === -1) return null;
    const oldPath = items[index].path;
    const updated: LocalMediaRow = {
      ...items[index],
      path: image.path,
      url: image.url,
      mimeType: image.mimeType,
      size: image.size,
      width: image.width,
      height: image.height,
      updatedAt: now,
    };
    items[index] = updated;
    await writeLocalLibrary(items);
    if (oldPath !== image.path) await removeStoredFile(oldPath);
    return { ...updated, usage: await getMediaUsage(mediaId) };
  }

  const client = getSupabaseClient();
  const { data: existing, error: readError } = await client.from('media').select('path').eq('id', mediaId).maybeSingle();
  if (readError) throw new Error(`Supabase media lookup failed: ${readError.message}`);
  if (!existing) return null;

  const { data, error } = await client
    .from('media')
    .update({
      path: image.path,
      url: image.url,
      mime_type: image.mimeType,
      size: image.size,
      width: image.width,
      height: image.height,
      updated_at: now,
    })
    .eq('id', mediaId)
    .select(
      'id, path, url, title, alt_text, caption, description, category, mime_type, size, width, height, focal_x, focal_y, uploaded_by, created_at, updated_at'
    )
    .maybeSingle();

  if (error) throw new Error(`Supabase media update failed: ${error.message}`);
  if (!data) return null;

  if (existing.path !== image.path) await removeStoredFile(existing.path);
  return { ...rowFromSupabase(data), usage: await getMediaUsage(mediaId) };
}

export async function removeMediaRecord(mediaId: string): Promise<void> {
  if (!isSupabaseConfigured()) {
    const items = await readLocalLibrary();
    const match = items.find((item) => item.id === mediaId);
    if (!match) return;
    await writeLocalLibrary(items.filter((item) => item.id !== mediaId));
    await removeStoredFile(match.path);
    return;
  }

  const client = getSupabaseClient();
  const { data: match, error: readError } = await client.from('media').select('path').eq('id', mediaId).maybeSingle();
  if (readError) throw new Error(`Supabase media lookup failed: ${readError.message}`);
  if (!match) return;

  await client.from('media').delete().eq('id', mediaId);
  await removeStoredFile(match.path);
}
