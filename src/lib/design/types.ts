/** Site-wide look and copy that April edits from the on-page "Site settings" panel. Shared by server and browser. */

import { SITE_LOGO_IDS } from '../brand/logo-concepts.ts';
import type { PhotoFrame } from './page-photos.ts';

/** Uploaded backgrounds were retired: only the approved photos or plain white. An old uploaded URL stays stored in customUrl, unused. */
export type BackgroundKind = 'image' | 'white' | 'colour';
export type HomeLayout = 'centred' | 'split' | 'band';
export type PageLayout = 'stacked' | 'side' | 'centred';
export type HeaderStyle = 'split' | 'centred';

export interface SiteDesign {
  /** `colour` is a PAGE_COLOURS hex, used when kind is 'colour'. */
  background: { kind: BackgroundKind; imageId: string; customUrl: string; colour: string };
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
  /** The Get Involved button's background, a DARK_COLOURS hex; its text is always white. */
  buttonColour: string;
  /** Site-wide: header background (PAGE_COLOURS; its text turns white when dark), footer (DARK_COLOURS), accent lines (ACCENT_COLOURS). */
  headerColour: string;
  footerColour: string;
  accentColour: string;
  /** The colour menu links turn on hover (DARK_COLOURS); lightened automatically on a dark header. */
  hoverColour: string;
  headerStyle: HeaderStyle;
  stickyHeader: boolean;
  /** A logo concept id (src/lib/brand/logo-concepts.ts); empty shows the name as text. Used by the header and admin login. */
  logo: string;
  text: { homeHeading: string; homeTagline: string; contactEmail: string; abn: string };
  seo: { title: string; description: string; keywords: string };
  /** Hex values from PAGE_COLOURS: the Home box, or the page frame on About, Insights and Contact. */
  pageColours: PageColours;
  /** Each page's photo, an id from that page's PHOTO_OPTIONS. */
  photos: Record<SitePage, string>;
  /** Each page photo's position, zoom and opacity (Site settings: drag the photo, Zoom, Opacity). */
  photoFrames: Record<SitePage, PhotoFrame>;
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
/** Colours for things with white text (the Get Involved button, title boxes, content boxes): all at least 4.5:1. */
export const DARK_COLOURS: { name: string; value: string }[] = [
  { name: 'Teal', value: '#1f6b6b' },
  { name: 'Dark blue', value: '#1f3a5f' },
  { name: 'Dark brown', value: '#4a3222' },
  { name: 'Black', value: '#231f20' },
  { name: 'Charcoal', value: '#444142' },
  { name: 'Slate', value: '#1f2428' },
  { name: 'Maroon', value: '#7b2d26' },
];

/** The accent: box top borders, the menu underline, link underlines. */
export const ACCENT_COLOURS: { name: string; value: string }[] = [
  { name: 'Gold', value: '#c9a15a' },
  { name: 'Teal', value: '#1f6b6b' },
  { name: 'Dark blue', value: '#1f3a5f' },
  { name: 'Maroon', value: '#7b2d26' },
  { name: 'Dark brown', value: '#4a3222' },
];

export const PAGE_COLOURS: { name: string; value: string; light?: boolean }[] = [
  { name: 'White', value: '#ffffff', light: true },
  { name: 'Natural', value: '#f5f3f1', light: true },
  { name: 'Dark brown', value: '#4a3222' },
  { name: 'Black', value: '#231f20' },
  // April's Home box in her export: black at 85% over white.
  { name: 'Charcoal', value: '#444142' },
  { name: 'Slate', value: '#1f2428' },
  { name: 'Dark blue', value: '#1f3a5f' },
  { name: 'Teal', value: '#1f6b6b' },
];

/**
 * The site's pages, in menu order: their own colours, photo and offline-export section. Each page view marks its content
 * with data-page="<id>". The flags say what Site settings can change there, so it only offers controls that visibly work:
 * `pageText` (text outside dark boxes, for the page text colour), `colouredHeading` (a section heading for Heading colour),
 * `photo` (a page photo) and `titleBox` (the coloured box behind the page title).
 * `live: false` hides a page (April, 6 Oct: About and Insights): out of the menu and the offline export, its address
 * redirects to Home, and its colours and photo stay saved. Setting it back to true brings the page back.
 */
export const SITE_PAGES = [
  { id: 'home', path: '/', label: 'Home', live: true, pageText: true, colouredHeading: true, photo: false, titleBox: false },
  { id: 'about', path: '/about', label: 'About', live: false, pageText: true, colouredHeading: true, photo: true, titleBox: true },
  { id: 'insights', path: '/insights', label: 'Insights', live: false, pageText: false, colouredHeading: false, photo: true, titleBox: true },
  { id: 'contact', path: '/contact', label: 'Contact', live: true, pageText: false, colouredHeading: false, photo: true, titleBox: false },
] as const;
export type SitePage = (typeof SITE_PAGES)[number]['id'];

export const LIVE_PAGES = SITE_PAGES.filter((p) => p.live);

/** False for a hidden core page; custom pages (no core key) are always live. */
export function isLivePage(coreKey: string | undefined): boolean {
  return SITE_PAGES.find((p) => p.id === coreKey)?.live ?? true;
}
/** `title` is the page title box, `box` the dark content boxes (focus cards, Insights entries, Contact card): DARK_COLOURS. */
export type PageColours = Record<SitePage, { background: string; text: string; title: string; box: string }>;

/** April's export of 6 Oct (iejf-design-2026-10-06.html), after her live edit with Ange: the design to sign off. */
export const DEFAULT_DESIGN: SiteDesign = {
  background: { kind: 'colour', imageId: 'desert-field', customUrl: '', colour: '#231f20' },
  homeLayout: 'split',
  pageLayout: 'stacked',
  headingFont: 'Poppins',
  bodyFont: 'Poppins',
  headingSize: 96,
  bodySize: 18,
  menuSize: 15,
  headingColour: '#1f6b6b',
  buttonColour: '#1f2428',
  headerColour: '#231f20',
  footerColour: '#1f2428',
  accentColour: '#c9a15a',
  hoverColour: '#1f2428',
  headerStyle: 'split',
  stickyHeader: true,
  logo: '',
  pageColours: {
    home: { background: '#1f6b6b', text: '#ffffff', title: '#231f20', box: '#1f6b6b' },
    about: { background: '#f5f3f1', text: '#231f20', title: '#1f6b6b', box: '#1f6b6b' },
    insights: { background: '#f5f3f1', text: '#231f20', title: '#1f3a5f', box: '#1f3a5f' },
    contact: { background: '#1f2428', text: '#231f20', title: '#1f6b6b', box: '#1f6b6b' },
  },
  photos: { home: 'earth-hurricane', about: 'sierra-leone-planting', insights: 'rainforest-river', contact: 'perth-skyline-night' },
  photoFrames: {
    home: { x: 50, y: 55, zoom: 100, opacity: 100 },
    about: { x: 50, y: 70, zoom: 100, opacity: 100 },
    insights: { x: 50, y: 60, zoom: 100, opacity: 100 },
    contact: { x: 50, y: 50, zoom: 100, opacity: 100 },
  },
  text: {
    homeHeading: 'We use the law to drive systemic change, targeting issues that will cause escalating harm to future generations if left unaddressed',
    homeTagline: '',
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
    photos: { ...d.photos, ...saved.photos },
    photoFrames: Object.fromEntries(
      SITE_PAGES.map(({ id }) => [id, { ...d.photoFrames[id], ...saved.photoFrames?.[id] }])
    ) as Record<SitePage, PhotoFrame>,
  };
}

export function fontByName(name: string): FontOption {
  return FONTS.find((f) => f.name === name) ?? FONTS[0];
}

export function backgroundUrl(design: SiteDesign): string | null {
  const bg = design.background;
  if (bg.kind !== 'image') return null;
  return (BACKGROUND_IMAGES.find((b) => b.id === bg.imageId) ?? BACKGROUND_IMAGES[0]).url;
}

/** Whether dark text reads better than white on this hex colour (WCAG relative luminance). */
function isLight(hex: string): boolean {
  const [r, g, b] = [1, 3, 5]
    .map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  const l = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return (l + 0.05) / 0.05 > 1.05 / (l + 0.05);
}

/** Black or white, whichever reads better on this background. */
export function readableText(hex: string): string {
  return isLight(hex) ? '#231f20' : '#ffffff';
}

export const sameDesign = (a: SiteDesign, b: SiteDesign) => JSON.stringify(a) === JSON.stringify(b);

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
    `.site-shell .site-header{position:${design.stickyHeader === false ? 'static' : 'sticky'};}`,
    `:root{--font-heading:${heading.stack};--font-body:${body.stack};--heading-scale:${design.headingSize / 100};--body-size:${design.bodySize}px;--menu-size:${design.menuSize}px;--heading-colour:${design.headingColour};--button-bg:${design.buttonColour};--header-bg:${design.headerColour};--header-text:${readableText(design.headerColour)};--footer-bg:${design.footerColour};--gold:${design.accentColour};--hover:${isLight(design.headerColour) ? design.hoverColour : `color-mix(in srgb,${design.hoverColour} 35%,#fff)`};--hover-raw:${design.hoverColour};}`,
    bg
      ? `html body{background:#e9e2d6 ${cssUrl(bg)} center/cover no-repeat fixed;}`
      : `html body{background:${design.background.kind === 'colour' && design.background.colour ? design.background.colour : '#fff'};}`,
    ...SITE_PAGES.map(({ id }) => `[data-page="${id}"]{--page-bg:${design.pageColours[id].background};--page-text:${design.pageColours[id].text};--page-title:${design.pageColours[id].title};--page-box:${design.pageColours[id].box};--photo-x:${design.photoFrames[id].x}%;--photo-y:${design.photoFrames[id].y}%;--photo-zoom:${design.photoFrames[id].zoom / 100};--photo-opacity:${design.photoFrames[id].opacity / 100};}`),
    // The focus cards below the Home heading (April, 6 Oct) sit outside its [data-page] box.
    `.home-sections{--page-box:${design.pageColours.home.box};}`
  );
  return lines.join('\n');
}
