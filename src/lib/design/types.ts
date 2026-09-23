/** Site-wide look and copy that April edits from the on-page "Site settings" panel. Shared by server and browser. */

import { SITE_LOGO_IDS } from '@/lib/brand/logo-concepts';

export type BackgroundKind = 'image' | 'white' | 'custom';
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
}

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
];

export const DEFAULT_DESIGN: SiteDesign = {
  background: { kind: 'image', imageId: 'desert', customUrl: '' },
  homeLayout: 'centred',
  pageLayout: 'stacked',
  headingFont: 'Poppins',
  bodyFont: 'Poppins',
  headingSize: 100,
  bodySize: 16,
  menuSize: 13,
  headingColour: '#6b4a2e',
  headerStyle: 'split',
  logo: '',
  text: {
    homeHeading: 'Intergenerational Justice Fund',
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
  const logo = saved.logo && SITE_LOGO_IDS.includes(saved.logo) ? saved.logo : '';
  return {
    ...d,
    ...saved,
    logo,
    background,
    text: { ...d.text, ...saved.text },
    seo: { ...d.seo, ...saved.seo },
  };
}

export function fontByName(name: string): FontOption {
  return FONTS.find((f) => f.name === name) ?? FONTS[0];
}

export function backgroundUrl(design: SiteDesign): string | null {
  const bg = design.background;
  if (bg.kind === 'white') return null;
  if (bg.kind === 'custom') return bg.customUrl || null;
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
      : 'html body{background:#fff;}'
  );
  return lines.join('\n');
}
