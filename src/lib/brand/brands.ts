export interface BrandTokens {
  ink: string;
  deep: string;
  paper: string;
  line: string;
  gold: string;
  slate: string;
}

export interface BrandDirection {
  id: string;
  label: string;
  description: string;
  tokens: BrandTokens;
}

/**
 * Three colour directions. "b" (Paper) is the tokens already shipped in
 * globals.css :root — the approved production look — so it's the one
 * direction that never needs a `[data-brand="b"]` override rule.
 */
export const BRANDS: BrandDirection[] = [
  {
    id: 'a',
    label: 'Card',
    description: 'Warm ivory card-stock with a burnt-amber accent.',
    tokens: {
      ink: '#2b2420',
      deep: '#1f1a16',
      paper: '#f7f1e6',
      line: '#e8ddc9',
      gold: '#b5793c',
      slate: '#6b5f52',
    },
  },
  {
    id: 'b',
    label: 'Paper',
    description: 'The current site: Abaddon Black on warm off-white, gold accent.',
    tokens: {
      ink: '#231f20',
      deep: '#1a1717',
      paper: '#f5f3f1',
      line: '#e3e0dd',
      gold: '#c9a15a',
      slate: '#5b5758',
    },
  },
  {
    id: 'c',
    label: 'Slate',
    description: 'Cool grey-blue with a steel-blue accent replacing gold.',
    tokens: {
      ink: '#1f2428',
      deep: '#15181b',
      paper: '#eef1f3',
      line: '#dde2e6',
      gold: '#5b7a99',
      slate: '#5c6770',
    },
  },
];

export const BRAND_IDS = BRANDS.map((brand) => brand.id);
export const DEFAULT_BRAND = 'a';

/** A value is only applied if it's a known id — anything else falls through to the default. */
export function resolveBrand(value: string | null | undefined): string {
  if (value && BRAND_IDS.includes(value)) return value;
  return DEFAULT_BRAND;
}

export function getBrand(id: string): BrandDirection {
  return BRANDS.find((brand) => brand.id === id) ?? BRANDS[0];
}
