import 'server-only';
import type { ContentVersion, SitePage, SiteContent } from './types';
import { localFileStorage } from './storage-local';
import { supabaseStorage, isSupabaseConfigured } from './storage-supabase';
import { resolveMediaReferences } from './resolveMedia';
import { recordRevisionsForPublish } from './revisions';
import { withDefaults, type SiteDesign } from '@/lib/design/types';

/**
 * Single content service used by every public page and every admin route.
 * No component should read `data/*.json` or query Supabase directly.
 * Supabase is used whenever it's configured (real persistence, survives
 * redeploys); local JSON is the zero-setup fallback for a fresh checkout.
 */
const storage = isSupabaseConfigured() ? supabaseStorage : localFileStorage;

export async function getSiteContent(version: ContentVersion): Promise<SiteContent> {
  const content = version === 'live' ? await storage.readLive() : await storage.readDraft();
  return resolveMediaReferences(content);
}

export async function saveDraft(content: SiteContent): Promise<void> {
  await storage.writeDraft({ ...content, updatedAt: new Date().toISOString() });
}

/** Copies the current draft into live, stamps publishedAt, and snapshots a revision per published page. */
export async function publishDraft(publishedBy: string | null = null): Promise<void> {
  const draft = await storage.readDraft();
  const now = new Date().toISOString();
  const published: SiteContent = {
    ...draft,
    updatedAt: now,
    pages: draft.pages.map((page) =>
      page.status === 'published' ? { ...page, publishedAt: page.publishedAt ?? now } : page
    ),
  };
  // Site settings have their own Publish button, so page publishes leave both design versions as they were.
  const live = await storage.readLive();
  await storage.writeLive({ ...published, design: live.design });
  // Draft continues from the just-published state so future edits diff from live.
  await storage.writeDraft(published);
  await recordRevisionsForPublish(published.pages, publishedBy);
}

export async function getDesign(version: ContentVersion): Promise<SiteDesign> {
  const content = version === 'live' ? await storage.readLive() : await storage.readDraft();
  return withDefaults(content.design);
}

export async function saveDesignDraft(design: SiteDesign): Promise<void> {
  const draft = await storage.readDraft();
  await storage.writeDraft({ ...draft, design });
}

export async function publishDesign(): Promise<SiteDesign> {
  const [draft, live] = await Promise.all([storage.readDraft(), storage.readLive()]);
  const design = withDefaults(draft.design);
  await storage.writeLive({ ...live, design, updatedAt: new Date().toISOString() });
  return design;
}

/** Throws away unpublished settings changes. */
export async function resetDesignDraft(): Promise<SiteDesign> {
  const [draft, live] = await Promise.all([storage.readDraft(), storage.readLive()]);
  const design = withDefaults(live.design);
  await storage.writeDraft({ ...draft, design });
  return design;
}

export function pageRoute(page: SitePage): string {
  return page.coreKey === 'home' ? '/' : `/${page.slug}`;
}

export async function getPageBySlug(
  slug: string,
  version: ContentVersion = 'live'
): Promise<SitePage | null> {
  const content = await getSiteContent(version);
  const normalized = slug.replace(/^\/+/, '');
  return content.pages.find((page) => (page.coreKey === 'home' ? normalized === '' : page.slug === normalized)) ?? null;
}

export async function getPageById(id: string, version: ContentVersion = 'draft'): Promise<SitePage | null> {
  const content = await getSiteContent(version);
  return content.pages.find((page) => page.id === id) ?? null;
}

export interface NavItem {
  id: string;
  label: string;
  href: string;
}

export function deriveNavigation(content: SiteContent): NavItem[] {
  return content.pages
    .filter((page) => page.status === 'published' && page.showInNavigation)
    .sort((a, b) => a.navOrder - b.navOrder)
    .map((page) => ({ id: page.id, label: page.navLabel, href: pageRoute(page) }));
}

export async function getPublicNavigation(): Promise<NavItem[]> {
  const content = await getSiteContent('live');
  return deriveNavigation(content);
}

export function isSlugTaken(content: SiteContent, slug: string, excludePageId?: string): boolean {
  return content.pages.some((page) => page.slug === slug && page.id !== excludePageId);
}

export function nextNavOrder(content: SiteContent): number {
  return content.pages.reduce((max, page) => Math.max(max, page.navOrder), -1) + 1;
}
