import 'server-only';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { createClient } from '@supabase/supabase-js';

export interface SiteSettings {
  orgName: string;
  contactEmail: string;
  location: string;
  footerText: string;
  seoTitle: string;
  seoDescription: string;
  logoUrl: string;
  updatedAt: string | null;
}

export type SiteSettingsPatch = Partial<Omit<SiteSettings, 'updatedAt'>>;

const EMPTY: SiteSettings = {
  orgName: '',
  contactEmail: '',
  location: '',
  footerText: '',
  seoTitle: '',
  seoDescription: '',
  logoUrl: '',
  updatedAt: null,
};

const DATA_DIR = path.join(process.cwd(), 'data');
const SETTINGS_PATH = path.join(DATA_DIR, 'site-settings.json');

function isSupabaseConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

function getClient() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false },
  });
}

export async function getSiteSettings(): Promise<SiteSettings> {
  if (!isSupabaseConfigured()) {
    try {
      return { ...EMPTY, ...JSON.parse(await readFile(SETTINGS_PATH, 'utf8')) };
    } catch {
      return EMPTY;
    }
  }

  const client = getClient();
  const { data, error } = await client
    .from('site_settings')
    .select('org_name, contact_email, location, footer_text, seo_title, seo_description, logo_url, updated_at')
    .eq('id', true)
    .maybeSingle();

  if (error || !data) return EMPTY;
  return {
    orgName: data.org_name ?? '',
    contactEmail: data.contact_email ?? '',
    location: data.location ?? '',
    footerText: data.footer_text ?? '',
    seoTitle: data.seo_title ?? '',
    seoDescription: data.seo_description ?? '',
    logoUrl: data.logo_url ?? '',
    updatedAt: data.updated_at ?? null,
  };
}

export async function updateSiteSettings(patch: SiteSettingsPatch): Promise<SiteSettings> {
  const now = new Date().toISOString();

  if (!isSupabaseConfigured()) {
    const current = await getSiteSettings();
    const next = { ...current, ...patch, updatedAt: now };
    await mkdir(DATA_DIR, { recursive: true });
    await writeFile(SETTINGS_PATH, JSON.stringify(next, null, 2), 'utf8');
    return next;
  }

  const client = getClient();
  const update: Record<string, unknown> = { id: true, updated_at: now };
  if (patch.orgName !== undefined) update.org_name = patch.orgName;
  if (patch.contactEmail !== undefined) update.contact_email = patch.contactEmail;
  if (patch.location !== undefined) update.location = patch.location;
  if (patch.footerText !== undefined) update.footer_text = patch.footerText;
  if (patch.seoTitle !== undefined) update.seo_title = patch.seoTitle;
  if (patch.seoDescription !== undefined) update.seo_description = patch.seoDescription;
  if (patch.logoUrl !== undefined) update.logo_url = patch.logoUrl;

  const { error } = await client.from('site_settings').upsert(update, { onConflict: 'id' });
  if (error) throw new Error(`Supabase site_settings upsert failed: ${error.message}`);
  return getSiteSettings();
}
