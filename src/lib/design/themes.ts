/**
 * One-click colour themes for Site settings (April, 1 Oct: "more colour theme options"). A theme only sets colour
 * fields that already exist, so every control still fine-tunes it afterwards and nothing new is saved.
 * All values come from the palettes in types.ts, so a themed design always validates.
 */

import { DEFAULT_DESIGN, SITE_PAGES, readableText, sameDesign, type PageColours, type SiteDesign, type SitePage } from './types.ts';

type Boxes = Record<SitePage, { title: string; box: string }>;

export interface ColourTheme {
  id: string;
  name: string;
  colours: Pick<SiteDesign, 'headerColour' | 'footerColour' | 'buttonColour' | 'accentColour' | 'hoverColour' | 'headingColour'>;
  /** The Home box. */
  home: string;
  /** Each page's title box and content boxes. */
  boxes: Boxes;
}

const everyPage = (hex: string): Boxes =>
  Object.fromEntries(SITE_PAGES.map(({ id }) => [id, { title: hex, box: hex }])) as Boxes;

/** A design's own colours as a theme, so April's base template is always one of the choices. */
function themeOf(design: SiteDesign): Omit<ColourTheme, 'id' | 'name'> {
  const { headerColour, footerColour, buttonColour, accentColour, hoverColour, headingColour, pageColours } = design;
  return {
    colours: { headerColour, footerColour, buttonColour, accentColour, hoverColour, headingColour },
    home: pageColours.home.background,
    boxes: Object.fromEntries(SITE_PAGES.map(({ id }) => [id, { title: pageColours[id].title, box: pageColours[id].box }])) as Boxes,
  };
}

export const COLOUR_THEMES: ColourTheme[] = [
  { id: 'april', name: 'April’s pick', ...themeOf(DEFAULT_DESIGN) },
  {
    // Her 29 Sep export: white header, black boxes, teal button.
    id: 'classic',
    name: 'Classic',
    colours: { headerColour: '#ffffff', footerColour: '#231f20', buttonColour: '#1f6b6b', accentColour: '#c9a15a', hoverColour: '#7b2d26', headingColour: '#6b4a2e' },
    home: '#231f20',
    boxes: everyPage('#231f20'),
  },
  {
    id: 'navy-gold',
    name: 'Navy & Gold',
    colours: { headerColour: '#ffffff', footerColour: '#1f3a5f', buttonColour: '#1f3a5f', accentColour: '#c9a15a', hoverColour: '#1f3a5f', headingColour: '#1f3a5f' },
    home: '#1f3a5f',
    boxes: everyPage('#1f3a5f'),
  },
  {
    id: 'earth',
    name: 'Earth',
    colours: { headerColour: '#f5f3f1', footerColour: '#4a3222', buttonColour: '#4a3222', accentColour: '#c9a15a', hoverColour: '#7b2d26', headingColour: '#6b4a2e' },
    home: '#4a3222',
    boxes: everyPage('#4a3222'),
  },
  {
    id: 'ocean',
    name: 'Ocean',
    colours: { headerColour: '#ffffff', footerColour: '#1f6b6b', buttonColour: '#1f6b6b', accentColour: '#1f3a5f', hoverColour: '#1f6b6b', headingColour: '#1f6b6b' },
    home: '#1f6b6b',
    boxes: everyPage('#1f6b6b'),
  },
  {
    id: 'charcoal',
    name: 'Charcoal',
    colours: { headerColour: '#444142', footerColour: '#231f20', buttonColour: '#7b2d26', accentColour: '#c9a15a', hoverColour: '#7b2d26', headingColour: '#231f20' },
    home: '#444142',
    boxes: everyPage('#444142'),
  },
];

/** The design with the theme's colours; everything else (fonts, layout, photos, other page backgrounds) is kept. */
export function applyTheme(design: SiteDesign, theme: ColourTheme): SiteDesign {
  const pageColours = Object.fromEntries(
    SITE_PAGES.map(({ id }) => [
      id,
      {
        ...design.pageColours[id],
        ...theme.boxes[id],
        ...(id === 'home' ? { background: theme.home, text: readableText(theme.home) } : {}),
      },
    ])
  ) as PageColours;
  return { ...design, ...theme.colours, pageColours };
}

/** The theme the design currently matches, or null once any of its colours has been changed by hand. */
export function activeTheme(design: SiteDesign): ColourTheme | null {
  return COLOUR_THEMES.find((theme) => sameDesign(applyTheme(design, theme), design)) ?? null;
}
