export interface TypefaceRole {
  /** Google Fonts family name, used both in the `family=` query param and in CSS `font-family`. */
  family: string;
  weights: number[];
}

export interface TypePairing {
  id: string;
  label: string;
  heading: TypefaceRole;
  body: TypefaceRole;
}

/**
 * Eleven pairings. t1 (Poppins/Poppins) matches the site's current default
 * (@fontsource/poppins, already loaded) so it never needs a Google Fonts
 * request of its own.
 */
export const TYPEFACES: TypePairing[] = [
  { id: 't1', label: 'Poppins / Poppins', heading: { family: 'Poppins', weights: [600, 700] }, body: { family: 'Poppins', weights: [400, 500] } },
  { id: 't2', label: 'Fraunces / Inter', heading: { family: 'Fraunces', weights: [500, 600] }, body: { family: 'Inter', weights: [400, 500] } },
  { id: 't3', label: 'Playfair Display / Source Sans 3', heading: { family: 'Playfair Display', weights: [600, 700] }, body: { family: 'Source Sans 3', weights: [400, 500] } },
  { id: 't4', label: 'Space Grotesk / IBM Plex Sans', heading: { family: 'Space Grotesk', weights: [500, 700] }, body: { family: 'IBM Plex Sans', weights: [400, 500] } },
  { id: 't5', label: 'DM Serif Display / DM Sans', heading: { family: 'DM Serif Display', weights: [400] }, body: { family: 'DM Sans', weights: [400, 500] } },
  { id: 't6', label: 'Libre Baskerville / Work Sans', heading: { family: 'Libre Baskerville', weights: [400, 700] }, body: { family: 'Work Sans', weights: [400, 500] } },
  { id: 't7', label: 'Archivo Black / Archivo', heading: { family: 'Archivo Black', weights: [400] }, body: { family: 'Archivo', weights: [400, 500] } },
  { id: 't8', label: 'Cormorant Garamond / Karla', heading: { family: 'Cormorant Garamond', weights: [600, 700] }, body: { family: 'Karla', weights: [400, 500] } },
  { id: 't9', label: 'Sora / Sora', heading: { family: 'Sora', weights: [600, 700] }, body: { family: 'Sora', weights: [400] } },
  { id: 't10', label: 'Newsreader / Inter', heading: { family: 'Newsreader', weights: [500, 600] }, body: { family: 'Inter', weights: [400, 500] } },
  { id: 't11', label: 'Bricolage Grotesque / Public Sans', heading: { family: 'Bricolage Grotesque', weights: [600, 700] }, body: { family: 'Public Sans', weights: [400, 500] } },
];

export const TYPEFACE_IDS = TYPEFACES.map((t) => t.id);
export const DEFAULT_TYPEFACE = 't1';

/** No stored/query preference resolves to `null` — the active direction's own pairing applies (no `data-type` set). */
export function resolveTypeface(value: string | null | undefined): string | null {
  if (value && TYPEFACE_IDS.includes(value)) return value;
  return null;
}

export function getTypeface(id: string): TypePairing {
  return TYPEFACES.find((t) => t.id === id) ?? TYPEFACES[0];
}

/** `https://fonts.googleapis.com/css2?family=...&family=...&display=swap` for every family this pairing needs beyond Poppins (already loaded locally). */
export function googleFontsUrl(pairing: TypePairing): string | null {
  const families = new Map<string, Set<number>>();
  for (const role of [pairing.heading, pairing.body]) {
    if (role.family === 'Poppins') continue;
    const weights = families.get(role.family) ?? new Set<number>();
    role.weights.forEach((w) => weights.add(w));
    families.set(role.family, weights);
  }
  if (families.size === 0) return null;
  const params = [...families.entries()]
    .map(([family, weights]) => `family=${family.replace(/ /g, '+')}:wght@${[...weights].sort((a, b) => a - b).join(';')}`)
    .join('&');
  return `https://fonts.googleapis.com/css2?${params}&display=swap`;
}

/** One combined stylesheet URL covering every pairing — used only by the `/brand` comparison page so all eleven live specimens render in their real fonts at once. */
export function googleFontsUrlForAll(pairings: TypePairing[]): string {
  const families = new Map<string, Set<number>>();
  for (const pairing of pairings) {
    for (const role of [pairing.heading, pairing.body]) {
      if (role.family === 'Poppins') continue;
      const weights = families.get(role.family) ?? new Set<number>();
      role.weights.forEach((w) => weights.add(w));
      families.set(role.family, weights);
    }
  }
  const params = [...families.entries()]
    .map(([family, weights]) => `family=${family.replace(/ /g, '+')}:wght@${[...weights].sort((a, b) => a - b).join(';')}`)
    .join('&');
  return `https://fonts.googleapis.com/css2?${params}&display=swap`;
}
