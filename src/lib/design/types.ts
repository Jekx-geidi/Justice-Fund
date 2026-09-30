/** Site-wide look and copy that April edits from the on-page "Site settings" panel. Shared by server and browser. */

import { SITE_LOGO_IDS } from '../brand/logo-concepts.ts';
import { HOME_HERO } from '../content/home-sections.ts';

/** Uploaded backgrounds were retired: only the approved photos or plain white. An old uploaded URL stays stored in customUrl, unused. */
export type BackgroundKind = 'image' | 'white';
export type HomeLayout = 'centred' | 'split' | 'band';
export type PageLayout = 'stacked' | 'side' | 'centred';
export type HeaderStyle = 'split' | 'centred';

export interface SiteDesign {
  background: { kind: BackgroundKind; imageId: string; customUrl: string };
  homeLayout: HomeLayout;
  pageLayout: PageLayout;
  headingFont: string;
  bodyFont: string;
  /** Percent of the default size, 80–140. */
  headingSize: number;
  /** Pixels. */
  bodySize: number;
  /** Pixels. */
  menuSize: number;
  headingColour: string;
  headerStyle: HeaderStyle;
  /** A logo concept id (src/lib/brand/logo-concepts.ts); empty shows the name as text. Used by the header and admin login. */
  logo: string;
  text: { homeHeading: string; homeTagline: string; contactEmail: string; abn: string };
  seo: { title: string; description: string; keywords: string };
  /** Hex values from PAGE_COLOURS: the Home box, or the page frame on About, Insights and Contact. */
  pageColours: PageColours;
}

/** A Site settings text field; page markup marks where each one shows with data-design-text. */
export type TextKey = keyof SiteDesign['text'];

export interface BackgroundOption {
  id: string;
  label: string;
  url: string;
  thumb: string;
}

const bg = (id: string, label: string): BackgroundOption => ({
  id,
  label,
  url: `/images/backgrounds/${id}.webp`,
  thumb: `/images/backgrounds/${id}-thumb.webp`,
});

/** The four approved desert photos (Pexels originals, kept outside the repo), converted to 2400×1800 WebP. The first is the default. */
export const BACKGROUND_IMAGES: BackgroundOption[] = [
  bg('desert', 'Pale dunes'),
  bg('desert-field', 'Dune field'),
  bg('desert-red', 'Red dunes'),
  bg('desert-ridges', 'Dune ridges'),
];

export interface FontOption {
  name: string;
  /** Google Fonts family spec; empty for fonts bundled with the site. */
  google: string;
  stack: string;
}

export const FONTS: FontOption[] = [
  { name: 'Poppins', google: '', stack: "'Poppins', system-ui, sans-serif" },
  { name: 'Inter', google: 'Inter:wght@400;500;600;700', stack: "'Inter', system-ui, sans-serif" },
  { name: 'DM Sans', google: 'DM+Sans:wght@400;500;600;700', stack: "'DM Sans', system-ui, sans-serif" },
  { name: 'Work Sans', google: 'Work+Sans:wght@400;500;600;700', stack: "'Work Sans', system-ui, sans-serif" },
  { name: 'Playfair Display', google: 'Playfair+Display:wght@500;600;700', stack: "'Playfair Display', Georgia, serif" },
  { name: 'Libre Baskerville', google: 'Libre+Baskerville:wght@400;700', stack: "'Libre Baskerville', Georgia, serif" },
  { name: 'Fraunces', google: 'Fraunces:wght@500;600;700', stack: "'Fraunces', Georgia, serif" },
  { name: 'Cormorant Garamond', google: 'Cormorant+Garamond:wght@500;600;700', stack: "'Cormorant Garamond', Georgia, serif" },
];

export const HEADING_COLOURS: { name: string; value: string }[] = [
  { name: 'Brown', value: '#6b4a2e' },
  { name: 'Dark brown', value: '#4a3222' },
  { name: 'Warm tan', value: '#8a6440' },
  { name: 'Gold', value: '#9a7432' },
  { name: 'Black', value: '#231f20' },
  { name: 'Dark blue', value: '#1f3a5f' },
  { name: 'Teal', value: '#1f6b6b' },
];

/** Background and text colours April can set per page: the natural colour with dark brown, black, dark blue and teal (29 Sep). */
/** `light` swatches get a dark tick in the panel. */
export const PAGE_COLOURS: { name: string; value: string; light?: boolean }[] = [
  { name: 'White', value: '#ffffff', light: true },
  { name: 'Natural', value: '#f5f3f1', light: true },
  { name: 'Dark brown', value: '#4a3222' },
  { name: 'Black', value: '#231f20' },
  { name: 'Dark blue', value: '#1f3a5f' },
  { name: 'Teal', value: '#1f6b6b' },
];

/**
 * The site's pages, in menu order: their own colours, photo and offline-export section. Each page view marks its content
 * with data-page="<id>". The flags say what Site settings can change there, so it only offers controls that visibly work:
 * `pageText` (text outside dark boxes, for the page text colour) and `colouredHeading` (a section heading for Heading colour).
 */
export const SITE_PAGES = [
  { id: 'home', path: '/', label: 'Home', pageText: true, colouredHeading: true },
  { id: 'about', path: '/about', label: 'About', pageText: true, colouredHeading: true },
  { id: 'insights', path: '/insights', label: 'Insights', pageText: false, colouredHeading: false },
  { id: 'contact', path: '/contact', label: 'Contact', pageText: false, colouredHeading: false },
] as const;
export type SitePage = (typeof SITE_PAGES)[number]['id'];
export type PageColours = Record<SitePage, { background: string; text: string }>;

/** April's export of 29 Sep: the look they approved to build on. */
export const DEFAULT_DESIGN: SiteDesign = {
  background: { kind: 'white', imageId: 'desert', customUrl: '' },
  homeLayout: 'split',
  pageLayout: 'stacked',
  headingFont: 'Poppins',
  bodyFont: 'Poppins',
  headingSize: 80,
  bodySize: 16,
  menuSize: 13,
  headingColour: '#6b4a2e',
  headerStyle: 'split',
  logo: '',
  pageColours: {
    home: { background: '#231f20', text: '#ffffff' },
    about: { background: '#f5f3f1', text: '#231f20' },
    insights: { background: '#f5f3f1', text: '#231f20' },
    contact: { background: '#f5f3f1', text: '#231f20' },
  },
  text: {
    homeHeading: HOME_HERO.heading,
    homeTagline: HOME_HERO.paragraph,
    contactEmail: 'hello@justicefund.org.au',
    abn: '51 656 623 719',
  },
  seo: {
    title: 'Intergenerational Justice Fund',
    description:
      'We use the law to drive systemic change, targeting issues that will cause escalating harm to future generations if left unaddressed.',
    // Placeholder until Ang supplies the approved keyword list.
    keywords: 'intergenerational justice, strategic litigation, environmental law, public interest law, charity Perth',
  },
};

export const LEGAL_NAME = 'Intergenerational Justice Fund Limited';

/** The dashboard's "Open Site Editor" link adds this query to the homepage so the Site settings panel opens straight away. */
export const OPEN_EDITOR_PARAM = 'editor';
export const SITE_EDITOR_HREF = `/?${OPEN_EDITOR_PARAM}`;

/** Fills any fields missing from older saved settings with defaults. */
export function withDefaults(saved: Partial<SiteDesign> | null | undefined): SiteDesign {
  const d = DEFAULT_DESIGN;
  if (!saved) return d;
  const background = { ...d.background, ...saved.background };
  // A photo that has since been retired from the list falls back to the default, so saves still validate.
  if (!BACKGROUND_IMAGES.some((b) => b.id === background.imageId)) background.imageId = d.background.imageId;
  if ((background.kind as string) === 'custom') background.kind = 'image';
  const logo = saved.logo && SITE_LOGO_IDS.includes(saved.logo) ? saved.logo : '';
  return {
    ...d,
    ...saved,
    logo,
    background,
    text: { ...d.text, ...saved.text },
    seo: { ...d.seo, ...saved.seo },
    pageColours: Object.fromEntries(
      SITE_PAGES.map(({ id }) => [id, { ...d.pageColours[id], ...saved.pageColours?.[id] }])
    ) as PageColours,
  };
}

export function fontByName(name: string): FontOption {
  return FONTS.find((f) => f.name === name) ?? FONTS[0];
}

export function backgroundUrl(design: SiteDesign): string | null {
  const bg = design.background;
  if (bg.kind === 'white') return null;
  return (BACKGROUND_IMAGES.find((b) => b.id === bg.imageId) ?? BACKGROUND_IMAGES[0]).url;
}

function cssUrl(url: string): string {
  return `url("${url.replace(/["\\\n\r<>]/g, '')}")`;
}

/**
 * The whole look as one stylesheet. The server renders it into a <style> tag,
 * and the settings panel rewrites that same tag's text for instant previews.
 */
export function designCss(design: SiteDesign): string {
  const heading = fontByName(design.headingFont);
  const body = fontByName(design.bodyFont);
  const families = [heading, body].filter((f) => f.google).map((f) => `family=${f.google}`);
  const bg = backgroundUrl(design);
  const lines: string[] = [];
  if (families.length) {
    lines.push(`@import url("https://fonts.googleapis.com/css2?${[...new Set(families)].join('&')}&display=swap");`);
  }
  lines.push(
    `:root{--font-heading:${heading.stack};--font-body:${body.stack};--heading-scale:${design.headingSize / 100};--body-size:${design.bodySize}px;--menu-size:${design.menuSize}px;--heading-colour:${design.headingColour};}`,
    bg
      ? `html body{background:#e9e2d6 ${cssUrl(bg)} center/cover no-repeat fixed;}`
      : 'html body{background:#fff;}',
    ...SITE_PAGES.map(({ id }) => `[data-page="${id}"]{--page-bg:${design.pageColours[id].background};--page-text:${design.pageColours[id].text};}`)
  );
  return lines.join('\n');
}
