import 'server-only';
import type { ContentVersion, SitePage, SiteContent } from './types';
import { localFileStorage } from './storage-local';

/**
 * Single content service used by every public page and every admin route.
 * No component should read `data/*.json` (or a future GCS bucket) directly.
 */
const storage = localFileStorage;

export async function getSiteContent(version: ContentVersion): Promise<SiteContent> {
  return version === 'live' ? storage.readLive() : storage.readDraft();
}

export async function saveDraft(content: SiteContent): Promise<void> {
  await storage.writeDraft({ ...content, updatedAt: new Date().toISOString() });
}

/** Copies the current draft into live and stamps publishedAt on published pages. */
export async function publishDraft(): Promise<void> {
  const draft = await storage.readDraft();
  const now = new Date().toISOString();
  const published: SiteContent = {
    ...draft,
    updatedAt: now,
    pages: draft.pages.map((page) =>
      page.status === 'published' ? { ...page, publishedAt: page.publishedAt ?? now } : page
    ),
  };
  await storage.writeLive(published);
  // Draft continues from the just-published state so future edits diff from live.
  await storage.writeDraft(published);
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
