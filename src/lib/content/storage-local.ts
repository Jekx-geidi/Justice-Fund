import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import type { ContentStorage } from './storage';
import type { SiteContent } from './types';
import { buildSeedContent } from './seed';

const DATA_DIR = path.join(process.cwd(), 'data');
const LIVE_PATH = path.join(DATA_DIR, 'content.live.json');
const DRAFT_PATH = path.join(DATA_DIR, 'content.draft.json');

async function ensureSeeded(): Promise<void> {
  await mkdir(DATA_DIR, { recursive: true });
  const exists = await readFile(LIVE_PATH, 'utf8').then(
    () => true,
    () => false
  );
  if (exists) return;
  const seed = buildSeedContent();
  await writeFile(LIVE_PATH, JSON.stringify(seed, null, 2), 'utf8');
  await writeFile(DRAFT_PATH, JSON.stringify(seed, null, 2), 'utf8');
}

async function readJson(filePath: string): Promise<SiteContent> {
  await ensureSeeded();
  const raw = await readFile(filePath, 'utf8');
  return JSON.parse(raw) as SiteContent;
}

async function writeJson(filePath: string, content: SiteContent): Promise<void> {
  await mkdir(DATA_DIR, { recursive: true });
  await writeFile(filePath, JSON.stringify(content, null, 2), 'utf8');
}

export const localFileStorage: ContentStorage = {
  readLive: () => readJson(LIVE_PATH),
  writeLive: (content) => writeJson(LIVE_PATH, content),
  readDraft: () => readJson(DRAFT_PATH),
  writeDraft: (content) => writeJson(DRAFT_PATH, content),
};
