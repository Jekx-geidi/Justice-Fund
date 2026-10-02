/**
 * One-click colour themes for Site settings (April, 1 Oct: "more colour theme options"). A theme only sets colour
 * fields that already exist, so every control still fine-tunes it afterwards and nothing new is saved.
 * All values come from the palettes in types.ts, so a themed design always validates.
 */

import { SITE_PAGES, type PageColours, type SiteDesign, type SitePage } from './types.ts';

type Boxes = Record<SitePage, { title: string; box: string }>;

export interface ColourTheme {
  id: string;
  name: string;
  header: string;
  footer: string;
  button: string;
  accent: string;
  hover: string;
  heading: string;
  /** The Home box; its text is always white, as every Home background here is dark. */
  home: string;
  /** Each page's title box and content boxes. */
  boxes: Boxes;
}

const everyPage = (hex: string): Boxes =>
  Object.fromEntries(SITE_PAGES.map(({ id }) => [id, { title: hex, box: hex }])) as Boxes;

export const COLOUR_THEMES: ColourTheme[] = [
  {
    // April's export of 1 Oct, so she can always get back to it.
    id: 'april',
    name: 'April’s pick',
    header: '#231f20',
    footer: '#1f2428',
    button: '#1f2428',
    accent: '#c9a15a',
    hover: '#1f2428',
    heading: '#1f6b6b',
    home: '#1f6b6b',
    boxes: {
      home: { title: '#231f20', box: '#231f20' },
      about: { title: '#1f6b6b', box: '#1f6b6b' },
      insights: { title: '#1f3a5f', box: '#1f3a5f' },
      contact: { title: '#7b2d26', box: '#7b2d26' },
    },
  },
  {
    // Her 29 Sep export: white header, black boxes, teal button.
    id: 'classic',
    name: 'Classic',
    header: '#ffffff',
    footer: '#231f20',
    button: '#1f6b6b',
    accent: '#c9a15a',
    hover: '#7b2d26',
    heading: '#6b4a2e',
    home: '#231f20',
    boxes: everyPage('#231f20'),
  },
  {
    id: 'navy-gold',
    name: 'Navy & Gold',
    header: '#ffffff',
    footer: '#1f3a5f',
    button: '#1f3a5f',
    accent: '#c9a15a',
    hover: '#1f3a5f',
    heading: '#1f3a5f',
    home: '#1f3a5f',
    boxes: everyPage('#1f3a5f'),
  },
  {
    id: 'earth',
    name: 'Earth',
    header: '#f5f3f1',
    footer: '#4a3222',
    button: '#4a3222',
    accent: '#c9a15a',
    hover: '#7b2d26',
    heading: '#6b4a2e',
    home: '#4a3222',
    boxes: everyPage('#4a3222'),
  },
  {
    id: 'ocean',
    name: 'Ocean',
    header: '#ffffff',
    footer: '#1f6b6b',
    button: '#1f6b6b',
    accent: '#1f3a5f',
    hover: '#1f6b6b',
    heading: '#1f6b6b',
    home: '#1f6b6b',
    boxes: everyPage('#1f6b6b'),
  },
  {
    id: 'charcoal',
    name: 'Charcoal',
    header: '#444142',
    footer: '#231f20',
    button: '#7b2d26',
    accent: '#c9a15a',
    hover: '#7b2d26',
    heading: '#231f20',
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
        ...(id === 'home' ? { background: theme.home, text: '#ffffff' } : {}),
      },
    ])
  ) as PageColours;
  return {
    ...design,
    headerColour: theme.header,
    footerColour: theme.footer,
    buttonColour: theme.button,
    accentColour: theme.accent,
    hoverColour: theme.hover,
    headingColour: theme.heading,
    pageColours,
  };
}

/** The theme the design currently matches, or null once any of its colours has been changed by hand. */
export function activeTheme(design: SiteDesign): ColourTheme | null {
  const key = (d: SiteDesign) =>
    JSON.stringify([
      d.headerColour,
      d.footerColour,
      d.buttonColour,
      d.accentColour,
      d.hoverColour,
      d.headingColour,
      d.pageColours.home.background,
      d.pageColours.home.text,
      SITE_PAGES.map(({ id }) => [d.pageColours[id].title, d.pageColours[id].box]),
    ]);
  const current = key(design);
  return COLOUR_THEMES.find((theme) => key(applyTheme(design, theme)) === current) ?? null;
}
