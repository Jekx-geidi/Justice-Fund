import 'server-only';
import type { Metadata } from 'next';
import { getDesign, getSiteContent } from '@/lib/content/content';
import type { SitePage } from '@/lib/content/types';

/** Per-page title and description from the page's SEO fields, falling back to the site-wide settings. */
export async function corePageMetadata(coreKey: NonNullable<SitePage['coreKey']>, fallbackTitle: string): Promise<Metadata> {
  const [content, design] = await Promise.all([getSiteContent('live'), getDesign('live')]);
  const page = content.pages.find((p) => p.coreKey === coreKey);
  const pageTitle = page?.seo.title?.trim();
  return {
    // Home follows the settings panel; the other pages' stored SEO titles are already complete, so skip the template.
    title: coreKey === 'home' ? { absolute: design.seo.title } : pageTitle ? { absolute: pageTitle } : fallbackTitle,
    description: page?.seo.description?.trim() || design.seo.description,
  };
}
