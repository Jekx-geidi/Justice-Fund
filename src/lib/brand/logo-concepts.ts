export interface LogoConcept {
  id: string;
  name: string;
  /** Full 1200x1200 image, under public/. */
  file: string;
  /** 600-wide derivative used in the grid, under public/. */
  thumb: string;
  note: string;
}

const concept = (id: string, slug: string, name: string, note: string): LogoConcept => ({
  id,
  name,
  file: `/brand/logos/concept-${id}-${slug}.webp`,
  thumb: `/brand/logos/concept-${id}-${slug}-600.webp`,
  note,
});

export const LOGO_CONCEPTS: LogoConcept[] = [
  concept('01', 'seal-sun-strata', 'Seal', 'A circular seal, sun over layered strata.'),
  concept('02', 'interlocking-rings', 'Rings', 'Two linked rings, one generation and the next.'),
  concept('03', 'hourglass-strata', 'Hourglass', 'Time passing, layered into the lower half.'),
  concept('04', 'growth-rings', 'Growth rings', 'Concentric arcs, open at the top; time accumulating.'),
  concept('05', 'stepped-column', 'Stepped column', 'Three blocks stepping forward under a lintel.'),
  concept('06', 'bridge-arch', 'Bridge', 'An arch connecting two shores.'),
  concept('07', 'monogram-seal', 'Monogram seal', 'I J F as a stamp, ruled above and below.'),
  concept('08', 'open-ledger', 'Ledger', 'An open book with a horizon across the pages.'),
  concept('09', 'compass-star', 'Compass', 'An eight-point star, north elongated.'),
  concept('10', 'layered-wave', 'Wave', 'Three layered curves in a rounded square.'),
  concept('11', 'keystone', 'Keystone', 'The wedge that holds the arch.'),
  concept('12', 'wordmark-horizon', 'Wordmark', "Type-led; the g's descender becomes a horizon."),
];

export const LOGO_CONCEPT_IDS = LOGO_CONCEPTS.map((c) => c.id);

/** The shortlist offered in Site settings (the cleanest two); the rest stay for the /brand comparison pages. */
export const SITE_LOGOS: LogoConcept[] = LOGO_CONCEPTS.filter((c) => c.id === '01' || c.id === '04');
export const SITE_LOGO_IDS = SITE_LOGOS.map((c) => c.id);

export function getLogoConcept(id: string): LogoConcept | undefined {
  return LOGO_CONCEPTS.find((c) => c.id === id);
}

export function resolveLogoConcept(value: string | null | undefined): string | null {
  if (value && LOGO_CONCEPT_IDS.includes(value)) return value;
  return null;
}
