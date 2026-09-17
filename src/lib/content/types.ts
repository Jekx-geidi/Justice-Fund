export type PageStatus = 'draft' | 'published' | 'unpublished';

export interface MediaReference {
  id: string;
  url: string;
  alt: string;
  width?: number;
  height?: number;
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

export type ContentBlock =
  | HeroBlock
  | RichTextBlock
  | ImageTextBlock
  | CardGridBlock
  | QuoteBlockContent
  | CtaBlock;

/** Page-specific structured fields for the four protected core pages (section 8.1). */
export interface HomeFields {
  eyebrow: string;
  heading: string;
  mission: string;
  heroImage?: MediaReference | null;
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

  createdAt: string;
  updatedAt: string;
  publishedAt?: string | null;
}

export interface SiteContent {
  site: {
    name: string;
  };
  pages: SitePage[];
  insights: InsightEntry[];
  updatedAt: string;
}

export type ContentVersion = 'live' | 'draft';
