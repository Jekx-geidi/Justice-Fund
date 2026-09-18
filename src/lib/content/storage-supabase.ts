import 'server-only';
import { createClient } from '@supabase/supabase-js';
import type { ContentStorage } from './storage';
import type { ContentVersion, SiteContent } from './types';
import { buildSeedContent } from './seed';

export function isSupabaseConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

function getClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error('Supabase is not configured (NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY missing).');
  }
  // Service role key server-side only — never send this client to the browser.
  return createClient(url, key, { auth: { persistSession: false } });
}

async function readVersion(version: ContentVersion): Promise<SiteContent> {
  const client = getClient();
  const { data, error } = await client
    .from('site_content')
    .select('content')
    .eq('version', version)
    .maybeSingle();

  if (error) throw new Error(`Supabase read failed: ${error.message}`);

  if (!data) {
    // First run: seed this version so subsequent reads are stable.
    const seed = buildSeedContent();
    await writeVersion(version, seed);
    return seed;
  }

  return data.content as SiteContent;
}

async function writeVersion(version: ContentVersion, content: SiteContent): Promise<void> {
  const client = getClient();
  const { error } = await client
    .from('site_content')
    .upsert({ version, content, updated_at: new Date().toISOString() }, { onConflict: 'version' });

  if (error) throw new Error(`Supabase write failed: ${error.message}`);
}

export const supabaseStorage: ContentStorage = {
  readLive: () => readVersion('live'),
  writeLive: (content) => writeVersion('live', content),
  readDraft: () => readVersion('draft'),
  writeDraft: (content) => writeVersion('draft', content),
};
