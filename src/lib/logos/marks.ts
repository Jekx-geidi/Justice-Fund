export type MarkId = '01' | '02' | '03' | '04' | '05' | '06';

export interface MarkConcept {
	id: MarkId;
	slug: string;
	name: string;
	/** Path under public/, so it works as an <img> src and as a CSS mask URL. */
	file: string;
	/** One line the client can judge the concept by, shown on /brand. */
	rationale: string;
}

export const MARKS: MarkConcept[] = [
	{
		id: '01',
		slug: 'generations',
		name: 'Generations',
		file: '/brand/marks/01-generations.svg',
		rationale: 'What one generation leaves to the next.',
	},
	{
		id: '02',
		slug: 'horizon',
		name: 'Horizon',
		file: '/brand/marks/02-horizon.svg',
		rationale: 'A horizon line across a sun: what is still to come.',
	},
	{
		id: '03',
		slug: 'balance',
		name: 'Balance',
		file: '/brand/marks/03-balance.svg',
		rationale: 'The scales, without the cliché: one beam, one point of balance.',
	},
	{
		id: '04',
		slug: 'rings',
		name: 'Rings',
		file: '/brand/marks/04-rings.svg',
		rationale: 'Time accumulating; what we do now compounds.',
	},
	{
		id: '05',
		slug: 'forward',
		name: 'Forward',
		file: '/brand/marks/05-forward.svg',
		rationale: 'Passed forward, protected.',
	},
	{
		id: '06',
		slug: 'monogram',
		name: 'Monogram',
		file: '/brand/marks/06-monogram.svg',
		rationale: 'A letterform for the name, for when the wordmark is too long.',
	},
];

/**
 * Picks the mark id to apply from a stored preference. "Valid" means present
 * in `ids` — anything else (missing, empty, or unknown) resolves to null, so
 * the caller renders no mark rather than a broken one. Unlike brand
 * directions there is no default: the fund has not chosen a mark yet.
 */
export function resolveMark(stored: string | null, ids: string[]): string | null {
	if (stored && ids.includes(stored)) return stored;
	return null;
}
