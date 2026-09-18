import 'server-only';
import { mkdir, readFile, writeFile, unlink } from 'node:fs/promises';
import path from 'node:path';
import type { MediaReference } from '../content/types';
import { getSiteContent } from '../content/content';

const DATA_DIR = path.join(process.cwd(), 'data');
const LIBRARY_PATH = path.join(DATA_DIR, 'media.json');
const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads');

async function readLibrary(): Promise<MediaReference[]> {
  try {
    const raw = await readFile(LIBRARY_PATH, 'utf8');
    return JSON.parse(raw) as MediaReference[];
  } catch {
    return [];
  }
}

async function writeLibrary(items: MediaReference[]): Promise<void> {
  await mkdir(DATA_DIR, { recursive: true });
  await writeFile(LIBRARY_PATH, JSON.stringify(items, null, 2), 'utf8');
}

export async function listMedia(): Promise<MediaReference[]> {
  return readLibrary();
}

export async function addMediaRecord(ref: MediaReference): Promise<void> {
  const items = await readLibrary();
  items.push(ref);
  await writeLibrary(items);
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
  const items = await readLibrary();
  const match = items.find((item) => item.id === mediaId);
  if (!match) return;

  await writeLibrary(items.filter((item) => item.id !== mediaId));

  const filename = path.basename(match.url);
  await unlink(path.join(UPLOAD_DIR, filename)).catch(() => undefined);
}
