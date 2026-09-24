/**
 * The twelve full logo concepts shown on /brand: mark and wordmark together,
 * drawn black on white so the shape can be judged before any colour is
 * applied. These are raster references to react to, not finished artwork —
 * the concept the client chooses is redrawn as clean vector and recoloured
 * for the chosen direction, the same way the six abstract marks in
 * ./marks.ts are.
 *
 * tests/brand/logo-concepts.test.ts asserts every `file` and `thumb` named
 * here actually exists under public/.
 */

export type LogoConceptId =
	| '01'
	| '02'
	| '03'
	| '04'
	| '05'
	| '06'
	| '07'
	| '08'
	| '09'
	| '10'
	| '11'
	| '12';

export interface LogoConcept {
	id: LogoConceptId;
	slug: string;
	name: string;
	/** Path under public/, the full 1200x1200 image. */
	file: string;
	/** Path under public/, the 600-wide derivative used in the grid. */
	thumb: string;
	/** One line the client can judge the concept by, shown on /brand. */
	note: string;
}

export const LOGO_CONCEPTS: LogoConcept[] = [
	{
		id: '01',
		slug: 'seal-sun-strata',
		name: 'Seal',
		file: '/brand/logos/concept-01-seal-sun-strata.webp',
		thumb: '/brand/logos/concept-01-seal-sun-strata-600.webp',
		note: 'A circular seal, sun over layered strata.',
	},
	{
		id: '02',
		slug: 'interlocking-rings',
		name: 'Rings',
		file: '/brand/logos/concept-02-interlocking-rings.webp',
		thumb: '/brand/logos/concept-02-interlocking-rings-600.webp',
		note: 'Two linked rings, one generation and the next.',
	},
	{
		id: '03',
		slug: 'hourglass-strata',
		name: 'Hourglass',
		file: '/brand/logos/concept-03-hourglass-strata.webp',
		thumb: '/brand/logos/concept-03-hourglass-strata-600.webp',
		note: 'Time passing, layered into the lower half.',
	},
	{
		id: '04',
		slug: 'growth-rings',
		name: 'Growth rings',
		file: '/brand/logos/concept-04-growth-rings.webp',
		thumb: '/brand/logos/concept-04-growth-rings-600.webp',
		note: 'Concentric arcs, open at the top; time accumulating.',
	},
	{
		id: '05',
		slug: 'stepped-column',
		name: 'Stepped column',
		file: '/brand/logos/concept-05-stepped-column.webp',
		thumb: '/brand/logos/concept-05-stepped-column-600.webp',
		note: 'Three blocks stepping forward under a lintel.',
	},
	{
		id: '06',
		slug: 'bridge-arch',
		name: 'Bridge',
		file: '/brand/logos/concept-06-bridge-arch.webp',
		thumb: '/brand/logos/concept-06-bridge-arch-600.webp',
		note: 'An arch connecting two shores.',
	},
	{
		id: '07',
		slug: 'monogram-seal',
		name: 'Monogram seal',
		file: '/brand/logos/concept-07-monogram-seal.webp',
		thumb: '/brand/logos/concept-07-monogram-seal-600.webp',
		note: 'I J F as a stamp, ruled above and below.',
	},
	{
		id: '08',
		slug: 'open-ledger',
		name: 'Ledger',
		file: '/brand/logos/concept-08-open-ledger.webp',
		thumb: '/brand/logos/concept-08-open-ledger-600.webp',
		note: 'An open book with a horizon across the pages.',
	},
	{
		id: '09',
		slug: 'compass-star',
		name: 'Compass',
		file: '/brand/logos/concept-09-compass-star.webp',
		thumb: '/brand/logos/concept-09-compass-star-600.webp',
		note: 'An eight-point star, north elongated.',
	},
	{
		id: '10',
		slug: 'layered-wave',
		name: 'Wave',
		file: '/brand/logos/concept-10-layered-wave.webp',
		thumb: '/brand/logos/concept-10-layered-wave-600.webp',
		note: 'Three layered curves in a rounded square.',
	},
	{
		id: '11',
		slug: 'keystone',
		name: 'Keystone',
		file: '/brand/logos/concept-11-keystone.webp',
		thumb: '/brand/logos/concept-11-keystone-600.webp',
		note: 'The wedge that holds the arch.',
	},
	{
		id: '12',
		slug: 'wordmark-horizon',
		name: 'Wordmark',
		file: '/brand/logos/concept-12-wordmark-horizon.webp',
		thumb: '/brand/logos/concept-12-wordmark-horizon-600.webp',
		note: "Type-led; the g's descender becomes a horizon.",
	},
];

/**
 * Picks the logo concept id to apply from a stored preference, in the
 * resolveMark style: "valid" means present in `ids` — anything else
 * (missing, empty, or unknown) resolves to null, so the caller renders no
 * selection rather than a broken one. There is no default: the fund has not
 * chosen a concept yet.
 */
export function resolveLogoConcept(stored: string | null, ids: string[]): string | null {
	if (stored && ids.includes(stored)) return stored;
	return null;
}
