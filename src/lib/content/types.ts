import type { SiteDesign } from '@/lib/design/types';

export type PageStatus ='draft' | 'published' | 'unpublished';

export interface MediaReference {
  id: string;
  url: string;
  alt: string;
  width?: number;
  height?: number;
  /** Normalized 0–1 focal point, applied as `object-position` when rendering. Omitted = default centring. */
  focalX?: number;
  focalY?: number;
}

export interface HeroBlock {
  id: string;
  type: 'hero';
  eyebrow?: string;
  heading: string;
  body?: string;
  image?: MediaReference | null;
  alignment?: 'left' | 'center';
}

export interface RichTextBlock {
  id: string;
  type: 'richText';
  heading?: string;
  body: string;
}

export interface ImageTextBlock {
  id: string;
  type: 'imageText';
  image?: MediaReference | null;
  heading: string;
  body: string;
  imageSide: 'left' | 'right';
}

export interface CardGridCard {
  id: string;
  title: string;
  description: string;
  image?: MediaReference | null;
}

export interface CardGridBlock {
  id: string;
  type: 'cardGrid';
  heading?: string;
  cards: CardGridCard[];
}

export interface QuoteBlockContent {
  id: string;
  type: 'quote';
  quote: string;
  attribution?: string;
}

export interface CtaBlock {
  id: string;
  type: 'cta';
  heading: string;
  body?: string;
  buttonLabel?: string;
  buttonUrl?: string;
}

export interface FeatureImageBlock {
  id: string;
  type: 'featureImage';
  image?: MediaReference | null;
  caption?: string;
  displayStyle: 'full' | 'contained';
}

export interface DividerBlock {
  id: string;
  type: 'divider';
}

export type ContentBlock =
  | HeroBlock
  | RichTextBlock
  | ImageTextBlock
  | CardGridBlock
  | QuoteBlockContent
  | CtaBlock
  | FeatureImageBlock
  | DividerBlock;

/**
 * A block placed into a core page's "additional sections" zone — appended
 * after that page's fixed core content, before the footer. Same block types
 * as custom pages' free-form `blocks`, plus an independent show/hide flag so
 * admins can hide a section without losing/deleting its content.
 */
export type PageSection = ContentBlock & { hidden?: boolean };

/** Page-specific structured fields for the four protected core pages (section 8.1). */
export interface HomeQuote {
  text: string;
  attribution: string;
}

export interface HomeFields {
  eyebrow: string;
  heading: string;
  mission: string;
  heroImage?: MediaReference | null;
  quotes: HomeQuote[];
  bottomLine: string;
}

export interface AboutFocusArea {
  title: string;
  description: string;
  entity: string;
  abn: string;
}

export interface AboutFields {
  intro: string;
  body: string;
  image?: MediaReference | null;
  focusAreas: AboutFocusArea[];
}

export interface ContactFields {
  location: string;
  email: string;
}

export interface InsightEntry {
  id: string;
  title: string;
  slug?: string;
  category?: string;
  summary: string;
  image?: MediaReference | null;
  status: PageStatus;
  order: number;
  date?: string;
}

export interface SitePage {
  id: string;
  title: string;
  slug: string;
  navLabel: string;
  isCore: boolean;
  /** Which built-in template a core page uses; undefined for custom pages. */
  coreKey?: 'home' | 'about' | 'insights' | 'contact';
  showInNavigation: boolean;
  navOrder: number;
  status: PageStatus;

  seo: {
    title?: string;
    description?: string;
  };

  home?: HomeFields;
  about?: AboutFields;
  contact?: ContactFields;

  blocks: ContentBlock[];
  /** Core pages only — sections an admin has appended beyond the fixed core fields. See PageSection. */
  additionalSections?: PageSection[];

  createdAt: string;
  updatedAt: string;
  publishedAt?: string | null;
}

export interface SiteContent {
  site: {
    name: string;
  };
  /** Site settings panel values; published separately from pages (see publishDesign). */
  design?: Partial<SiteDesign>;
  pages: SitePage[];
  insights: InsightEntry[];
  updatedAt: string;
}

export type ContentVersion = 'live' | 'draft';
