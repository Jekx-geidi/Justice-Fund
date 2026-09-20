export const MEDIA_CATEGORIES = ['home', 'about', 'insights', 'custom', 'shared', 'uncategorized'] as const;
export type MediaCategory = (typeof MEDIA_CATEGORIES)[number];

export const MEDIA_CATEGORY_LABELS: Record<MediaCategory, string> = {
  home: 'Home',
  about: 'About',
  insights: 'Insights',
  custom: 'Custom Pages',
  shared: 'Shared',
  uncategorized: 'Uncategorized',
};

/** Where a media item is referenced, for the "Used in" list — always derived from real page/insight content, never manually set. */
export interface MediaUsageRef {
  pageId: string;
  pageTitle: string;
  /** e.g. "Hero", "Cards → Environment", "Insights → Litigation update" */
  location: string;
  editHref: string;
}

/** Full media library record — what `/admin/media` reads and writes. */
export interface MediaItem {
  id: string;
  path: string;
  url: string;
  title: string | null;
  altText: string;
  caption: string | null;
  description: string | null;
  category: MediaCategory;
  mimeType: string;
  size: number;
  width?: number;
  height?: number;
  focalX: number;
  focalY: number;
  uploadedBy: string | null;
  createdAt: string;
  updatedAt: string;
  usage: MediaUsageRef[];
}

export interface MediaMetadataPatch {
  title?: string | null;
  altText?: string;
  caption?: string | null;
  description?: string | null;
  category?: MediaCategory;
  focalX?: number;
  focalY?: number;
}

/** Display name shown in the library grid/list — falls back through title → alt text → storage filename. */
export function mediaDisplayName(item: Pick<MediaItem, 'title' | 'altText' | 'path'>): string {
  return item.title?.trim() || item.altText?.trim() || item.path;
}
