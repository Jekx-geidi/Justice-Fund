import 'server-only';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { createClient } from '@supabase/supabase-js';

export interface PreviewDevicePreset {
  id: string;
  name: string;
  width: number;
  enabled: boolean;
  builtIn: boolean;
}

export const AUTO_SAVE_DELAY_OPTIONS = [1, 2, 3, 5] as const;
export type AutoSaveDelaySeconds = (typeof AUTO_SAVE_DELAY_OPTIONS)[number];

export interface EditorPreferences {
  livePreviewEnabled: boolean;
  autoSaveEnabled: boolean;
  autoSaveDelaySeconds: AutoSaveDelaySeconds;
  previewDevices: PreviewDevicePreset[];
  defaultPreviewDeviceId: string;
  rememberLastPreviewDevice: boolean;
  highlightActiveField: boolean;
  warnUnsavedChanges: boolean;
  updatedAt: string | null;
}

export type EditorPreferencesPatch = Partial<Omit<EditorPreferences, 'updatedAt'>>;

export const BUILT_IN_PREVIEW_DEVICES: PreviewDevicePreset[] = [
  { id: 'desktop', name: 'Desktop', width: 1440, enabled: true, builtIn: true },
  { id: 'tablet', name: 'Tablet', width: 820, enabled: true, builtIn: true },
  { id: 'mobile', name: 'Mobile', width: 390, enabled: true, builtIn: true },
];

const DEFAULTS: EditorPreferences = {
  livePreviewEnabled: true,
  autoSaveEnabled: false,
  autoSaveDelaySeconds: 2,
  previewDevices: BUILT_IN_PREVIEW_DEVICES,
  defaultPreviewDeviceId: 'desktop',
  rememberLastPreviewDevice: true,
  highlightActiveField: true,
  warnUnsavedChanges: true,
  updatedAt: null,
};

const DATA_DIR = path.join(process.cwd(), 'data');
const PREFS_PATH = path.join(DATA_DIR, 'editor-preferences.json');

function isSupabaseConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

function getClient() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false },
  });
}

function merge(stored: Partial<EditorPreferences> | null | undefined): EditorPreferences {
  return {
    ...DEFAULTS,
    ...stored,
    previewDevices: stored?.previewDevices?.length ? stored.previewDevices : DEFAULTS.previewDevices,
  };
}

export async function getEditorPreferences(): Promise<EditorPreferences> {
  if (!isSupabaseConfigured()) {
    try {
      return merge(JSON.parse(await readFile(PREFS_PATH, 'utf8')));
    } catch {
      return DEFAULTS;
    }
  }

  const client = getClient();
  const { data, error } = await client.from('editor_preferences').select('preferences, updated_at').eq('id', true).maybeSingle();
  if (error || !data) return DEFAULTS;
  return { ...merge(data.preferences as Partial<EditorPreferences>), updatedAt: data.updated_at ?? null };
}

export async function updateEditorPreferences(patch: EditorPreferencesPatch): Promise<EditorPreferences> {
  const current = await getEditorPreferences();
  const next: EditorPreferences = { ...current, ...patch, updatedAt: new Date().toISOString() };
  const { updatedAt, ...toPersist } = next;

  if (!isSupabaseConfigured()) {
    await mkdir(DATA_DIR, { recursive: true });
    await writeFile(PREFS_PATH, JSON.stringify(next, null, 2), 'utf8');
    return next;
  }

  const client = getClient();
  const { error } = await client
    .from('editor_preferences')
    .upsert({ id: true, preferences: toPersist, updated_at: updatedAt }, { onConflict: 'id' });
  if (error) throw new Error(`Supabase editor_preferences upsert failed: ${error.message}`);
  return next;
}
