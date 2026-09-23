import { BRAND_IDS } from './brands';

export interface ArtworkOption {
  id: string;
  label: string;
  /** CSS `background` value — placeholder for a real generated image, swappable later without touching the picker/resolver logic. */
  swatch: string;
}

/**
 * Everything here is a placeholder standing in for real generated
 * artwork (photography, illustration, video) that doesn't exist yet.
 * Real assets slot into the same `swatch`/`id` shape later — the
 * catalogue, resolver and picker UI don't need to change.
 */
export const HEROES: Record<string, ArtworkOption[]> = {
  a: [
    { id: 'a-hero-1', label: 'Card — dawn field', swatch: 'linear-gradient(135deg, #f7f1e6, #e8ddc9 60%, #b5793c)' },
    { id: 'a-hero-2', label: 'Card — paper grain', swatch: 'linear-gradient(160deg, #f7f1e6, #d8c9a8)' },
  ],
  b: [
    { id: 'b-hero-1', label: 'Paper — charcoal horizon', swatch: 'linear-gradient(135deg, #231f20, #5b5758 60%, #c9a15a)' },
    { id: 'b-hero-2', label: 'Paper — gold wash', swatch: 'linear-gradient(160deg, #1a1717, #c9a15a)' },
  ],
  c: [
    { id: 'c-hero-1', label: 'Slate — steel water', swatch: 'linear-gradient(135deg, #1f2428, #5c6770 60%, #5b7a99)' },
    { id: 'c-hero-2', label: 'Slate — cool fog', swatch: 'linear-gradient(160deg, #15181b, #5b7a99)' },
  ],
};

export const DEFAULT_HERO: Record<string, string> = { a: 'a-hero-1', b: 'b-hero-1', c: 'c-hero-1' };

export function resolveHero(direction: string, value: string | null | undefined): string {
  const options = HEROES[direction] ?? [];
  if (value && options.some((o) => o.id === value)) return value;
  return DEFAULT_HERO[direction] ?? options[0]?.id ?? '';
}

export function getHero(direction: string, id: string): ArtworkOption | undefined {
  return HEROES[direction]?.find((o) => o.id === id);
}

/** Loop preference defaults to on. */
export function resolveLoop(value: string | null | undefined): boolean {
  return value !== '0';
}

export const TEXTURES: ArtworkOption[] = [
  { id: 'tex-1', label: 'Fine grain', swatch: 'repeating-linear-gradient(45deg, #00000008 0 2px, transparent 2px 4px)' },
  { id: 'tex-2', label: 'Paper fibre', swatch: 'repeating-radial-gradient(circle at 30% 30%, #00000006 0 1px, transparent 1px 6px)' },
  { id: 'tex-3', label: 'Linen weave', swatch: 'repeating-linear-gradient(90deg, #00000007 0 1px, transparent 1px 5px), repeating-linear-gradient(0deg, #00000007 0 1px, transparent 1px 5px)' },
];

export const OG_CARD: ArtworkOption = {
  id: 'og-1',
  label: 'Social card — wordmark on ink',
  swatch: 'linear-gradient(135deg, #231f20, #454041)',
};

export interface SampleIssue {
  slug: string;
  label: string;
}

/**
 * Reference-only sample slugs — the real Insights list has no image slot
 * in its current CMS schema/markup (docs/approved-content.html ports it as
 * a plain bordered text list), so `issue:<slug>` picks are shown here for
 * comparison only and aren't wired into the live `/insights` render.
 */
export const SAMPLE_ISSUES: SampleIssue[] = [
  { slug: 'river-catchment-protection', label: 'River catchment protection' },
  { slug: 'youth-climate-standing', label: 'Youth climate standing' },
  { slug: 'old-growth-forest-appeal', label: 'Old-growth forest appeal' },
];

export const ISSUE_IMAGES: Record<string, ArtworkOption[]> = Object.fromEntries(
  SAMPLE_ISSUES.map((issue, index) => [
    issue.slug,
    [
      { id: `${issue.slug}-1`, label: `${issue.label} — option 1`, swatch: `linear-gradient(135deg, #e3e0dd, #c9a15a)` },
      { id: `${issue.slug}-2`, label: `${issue.label} — option 2`, swatch: `linear-gradient(135deg, #dde2e6, #5b7a99)` },
    ],
  ])
);

export function resolveIssueImage(slug: string, value: string | null | undefined): string {
  const options = ISSUE_IMAGES[slug] ?? [];
  const fallback = options[0]?.id ?? '';
  if (value && options.some((o) => o.id === value)) return value;
  return fallback;
}

export { BRAND_IDS };
