/**
 * Typography as its own axis.
 *
 * Colour and type used to move together: picking direction C meant taking
 * its faces with it. The client wanted to judge the two separately, so the
 * eleven pairings below apply to any ground. `data-type` on <html> selects
 * one (src/styles/typefaces.css), and each direction still declares a
 * default pairing in its own brand file, which is what renders when no
 * `data-type` is set — production never sets one.
 */

export type TypefaceId = 't1' | 't2' | 't3' | 't4' | 't5' | 't6' | 't7' | 't8' | 't9' | 't10' | 't11';

export interface Typeface {
	id: TypefaceId;
	name: string;
	/** Human-readable display face, for the chooser and the specimen cards. */
	display: string;
	/** Human-readable body face. */
	body: string;
	/** One Google Fonts request covering both faces of the pairing. */
	fontsHref: string;
	/** One line the client can judge the pairing by, shown on /brand. */
	note: string;
}

export const TYPEFACES: Typeface[] = [
	{
		id: 't1',
		name: 'Grotesk',
		display: 'Space Grotesk',
		body: 'Inter',
		fontsHref:
			'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;700&family=Inter:wght@400;600&display=swap',
		note: 'Geometric and direct; extends the business card.',
	},
	{
		id: 't2',
		name: 'Editorial',
		display: 'Fraunces',
		body: 'Source Sans 3',
		// 600 is the pairing's display weight; 700 rides along because the
		// base layer sets headings at 700 and a variable face that stops at
		// 600 would be faked rather than rendered.
		fontsHref:
			'https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600;9..144,700&family=Source+Sans+3:wght@400;600&display=swap',
		note: 'Journal or chambers.',
	},
	{
		id: 't3',
		name: 'Humanist',
		display: 'Instrument Serif',
		body: 'Manrope',
		fontsHref:
			'https://fonts.googleapis.com/css2?family=Instrument+Serif&family=Manrope:wght@400;600&display=swap',
		note: 'Warm, contemporary, quiet.',
	},
	{
		id: 't4',
		name: 'Modern',
		display: 'DM Serif Display',
		body: 'DM Sans',
		fontsHref:
			'https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Sans:wght@400;600&display=swap',
		note: 'Crisp editorial with a modern sans.',
	},
	{
		id: 't5',
		name: 'Classic',
		display: 'Playfair Display',
		body: 'Lato',
		fontsHref:
			'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=Lato:wght@400;700&display=swap',
		note: 'The most-used serif-and-sans pairing on the web.',
	},
	{
		id: 't6',
		name: 'Corporate',
		display: 'Montserrat',
		body: 'Open Sans',
		fontsHref:
			'https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700&family=Open+Sans:wght@400;600&display=swap',
		note: 'Wide geometric headings, neutral body.',
	},
	{
		id: 't7',
		name: 'Reader',
		display: 'Merriweather',
		body: 'Roboto',
		fontsHref:
			'https://fonts.googleapis.com/css2?family=Merriweather:wght@400;700&family=Roboto:wght@400;600&display=swap',
		note: 'Built for long reading on screens.',
	},
	{
		id: 't8',
		name: 'Friendly',
		display: 'Poppins',
		body: 'Nunito Sans',
		fontsHref:
			'https://fonts.googleapis.com/css2?family=Poppins:wght@400;700&family=Nunito+Sans:wght@400;600&display=swap',
		note: 'Rounded, approachable, contemporary.',
	},
	{
		id: 't9',
		name: 'Literary',
		display: 'Lora',
		body: 'Work Sans',
		fontsHref:
			'https://fonts.googleapis.com/css2?family=Lora:wght@400;700&family=Work+Sans:wght@400;600&display=swap',
		note: 'Calligraphic serif, plain sans.',
	},
	{
		id: 't10',
		name: 'Airy',
		display: 'Raleway',
		body: 'Source Serif 4',
		// Raleway leans light at its default weight, so headings are asked at
		// 500 and 700 rather than 400 and 700 — see the [data-type="t10"]
		// heading-weight rule in typefaces.css, which pins headings to 700 so
		// they don't read thin next to the other pairings.
		fontsHref:
			'https://fonts.googleapis.com/css2?family=Raleway:wght@500;700&family=Source+Serif+4:opsz,wght@8..60,400;8..60,600&display=swap',
		note: 'Light sans headings over a serif body.',
	},
	{
		id: 't11',
		name: 'Bookish',
		display: 'Libre Baskerville',
		body: 'Karla',
		fontsHref:
			'https://fonts.googleapis.com/css2?family=Libre+Baskerville:wght@400;700&family=Karla:wght@400;600&display=swap',
		note: 'Traditional book serif, compact sans.',
	},
];

/**
 * Picks the pairing to apply from a stored preference. "Valid" means present
 * in `ids` — anything else (missing, empty, or unknown) resolves to null,
 * which means "leave `data-type` unset and let the direction's own default
 * pairing stand", the same shape as resolveMark in ./marks.ts.
 *
 * Closes over nothing, so a pre-paint inline script can serialise it with `.toString()`.
 */
export function resolveTypeface(stored: string | null, ids: string[]): string | null {
	if (stored && ids.indexOf(stored) !== -1) return stored;
	return null;
}

/** The pairing each direction ships with when nothing is chosen. These are
 * the same faces the direction's own brand CSS file declares — the two must
 * agree, and tests/brand/typefaces.test.ts checks that they do. */
export const DEFAULT_TYPEFACE: Record<'a' | 'b' | 'c', TypefaceId> = {
	a: 't1',
	b: 't2',
	c: 't4',
};

const byId = new Map(TYPEFACES.map((t) => [t.id, t]));

export function typefaceById(id: string): Typeface | undefined {
	return byId.get(id as TypefaceId);
}
