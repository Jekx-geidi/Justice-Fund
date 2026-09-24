import { DEFAULT_TYPEFACE, TYPEFACES } from './typefaces';

export interface BrandDirection {
	id: 'a' | 'b' | 'c';
	name: string;
	/** One line, shown under the name on /brand so the client can tell the
	 * three directions apart without reading the spec. */
	description: string;
	/** The Google Fonts request for this direction's default pairing. Derived
	 * from DEFAULT_TYPEFACE rather than written out here, so the faces have
	 * exactly one home now that typography is its own axis. Kept on the
	 * object so the root layout can load fonts per direction. */
	fontsHref: string;
	wordmark: string;
	mark: string;
}

const fontsFor = (id: 'a' | 'b' | 'c'): string =>
	(TYPEFACES.find((t) => t.id === DEFAULT_TYPEFACE[id]) as (typeof TYPEFACES)[number]).fontsHref;

export const BRANDS: BrandDirection[] = [
	{
		id: 'a',
		name: 'Card',
		description: 'Extends the business card.',
		fontsHref: fontsFor('a'),
		wordmark: '/brand/a/wordmark.svg',
		mark: '/brand/a/mark.svg',
	},
	{
		id: 'b',
		name: 'Paper',
		description: 'Reads as a journal or chambers.',
		fontsHref: fontsFor('b'),
		wordmark: '/brand/b/wordmark.svg',
		mark: '/brand/b/mark.svg',
	},
	{
		id: 'c',
		name: 'Slate',
		description: 'Cool stone, copper accent.',
		fontsHref: fontsFor('c'),
		wordmark: '/brand/c/wordmark.svg',
		mark: '/brand/c/mark.svg',
	},
];
