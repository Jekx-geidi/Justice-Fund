/**
 * The artwork programme: one typed catalogue of every generated image and
 * loop that ships under public/brand/art/.
 *
 * The data is copied in rather than read from the generating manifest at
 * runtime, so the catalogue is type-checked, tree-shakeable, and has no
 * filesystem dependency in the browser. tests/brand/artwork.test.ts asserts
 * every file named here actually exists under public/.
 *
 * Nothing in here is a claim about the fund. The notes describe what an
 * image shows and which model made it, for the client to react to on
 * /brand/artwork — they are never rendered on a public page.
 */

export type Direction = 'a' | 'b' | 'c';
export type ArtworkKind = 'hero' | 'issue' | 'logo' | 'og' | 'texture' | 'loop';

/** The issues that have artwork. Other issues render without an image
 * rather than borrowing one that does not describe them. */
export type IssueSlug = 'plastic-pollution' | 'climate-change' | 'disease-prevention';

export interface Artwork {
	id: string;
	kind: ArtworkKind;
	/** The brand direction this was made for; 'any' reads in all three. */
	direction: Direction | 'any';
	title: string;
	/** The model that generated it, shown on /brand/artwork so the client
	 * can tell two renderings of the same brief apart. */
	model: string;
	note: string;
	/** Path under public/, so it works as an <img> src unchanged. */
	file: string;
	/** Loops only: the WebM alternate source. */
	webm?: string;
	/** Loops only: the poster frame. */
	poster?: string;
	/** Loops only: the id of the still the loop was animated from. */
	still?: string;
	/** Intrinsic pixel size of `file` (of `poster`, for a loop). Rendered as
	 * width/height attributes so the hero box is reserved before the image
	 * arrives and the page never shifts. */
	width: number;
	height: number;
}

export const ARTWORK: Artwork[] = [
	{
		id: 'hero-a1-basalt-seam',
		kind: 'hero',
		direction: 'a',
		title: 'Basalt with an ochre seam',
		model: 'GPT Image 2.5',
		note: 'Layered basalt under a moonless sky, one seam of ochre mineral.',
		file: '/brand/art/hero-a1-basalt-seam.webp',
		width: 2304,
		height: 1296,
	},
	{
		id: 'hero-a1-basalt-seam-seedream',
		kind: 'hero',
		direction: 'a',
		title: 'Basalt seam, alternate',
		model: 'Seedream 5 Pro',
		note: 'Same brief, a quieter, smaller formation.',
		file: '/brand/art/hero-a1-basalt-seam-seedream.webp',
		width: 2400,
		height: 1350,
	},
	{
		id: 'hero-a2-obsidian-fog',
		kind: 'hero',
		direction: 'a',
		title: 'Obsidian in fog',
		model: 'GPT Image 2.5',
		note: 'Painterly shards receding into off-white fog, a vein of ochre.',
		file: '/brand/art/hero-a2-obsidian-fog.webp',
		width: 2304,
		height: 1296,
	},
	{
		id: 'hero-a3-salt-flat-line',
		kind: 'hero',
		direction: 'a',
		title: 'Salt flat at blue hour',
		model: 'GPT Image 2.5',
		note: 'A single line of ochre light on a flat horizon.',
		file: '/brand/art/hero-a3-salt-flat-line.webp',
		width: 2304,
		height: 1296,
	},
	{
		id: 'hero-a4-basalt-honeycomb',
		kind: 'hero',
		direction: 'a',
		title: 'Basalt honeycomb',
		model: 'GPT Image 2.5',
		note: 'Hexagonal basalt columns end-on, one inlaid with brushed ochre metal.',
		file: '/brand/art/hero-a4-basalt-honeycomb.webp',
		width: 2304,
		height: 1296,
	},
	{
		id: 'hero-a5-dark-corridor',
		kind: 'hero',
		direction: 'a',
		title: 'Dark corridor',
		model: 'GPT Image 2.5',
		note: 'A basalt corridor with a brass line leading to daylight.',
		file: '/brand/art/hero-a5-dark-corridor.webp',
		width: 2304,
		height: 1296,
	},
	{
		id: 'hero-b1-archival-paper',
		kind: 'hero',
		direction: 'b',
		title: 'Archival paper',
		model: 'GPT Image 2.5',
		note: 'Aged folios stacked like strata, a green marbled edge.',
		file: '/brand/art/hero-b1-archival-paper.webp',
		width: 2304,
		height: 1296,
	},
	{
		id: 'hero-b2-riverbed-aerial',
		kind: 'hero',
		direction: 'b',
		title: 'Dry riverbed from above',
		model: 'GPT Image 2.5',
		note: 'Dendritic channels in pale sand, one mesa crowned with green.',
		file: '/brand/art/hero-b2-riverbed-aerial.webp',
		width: 2304,
		height: 1296,
	},
	{
		id: 'hero-b2-riverbed-seedream',
		kind: 'hero',
		direction: 'b',
		title: 'Riverbed, alternate',
		model: 'Seedream 5 Pro',
		note: 'Same brief, harder shadows.',
		file: '/brand/art/hero-b2-riverbed-seedream.webp',
		width: 2400,
		height: 1350,
	},
	{
		id: 'hero-b3-marbled-endpaper',
		kind: 'hero',
		direction: 'b',
		title: 'Marbled endpaper',
		model: 'GPT Image 2.5',
		note: 'Hand-marbled cream paper with ink and deep-green veins.',
		file: '/brand/art/hero-b3-marbled-endpaper.webp',
		width: 2304,
		height: 1296,
	},
	{
		id: 'hero-b4-sandstone-gorge',
		kind: 'hero',
		direction: 'b',
		title: 'Sandstone gorge',
		model: 'GPT Image 2.5',
		note: 'Strata stacked like a ledger, a seam of moss.',
		file: '/brand/art/hero-b4-sandstone-gorge.webp',
		width: 2304,
		height: 1296,
	},
	{
		id: 'hero-b5-backlit-paper-ribbon',
		kind: 'hero',
		direction: 'b',
		title: 'Backlit paper',
		model: 'GPT Image 2.5',
		note: 'A deckled sheet lit from behind, a green ribbon across it.',
		file: '/brand/art/hero-b5-backlit-paper-ribbon.webp',
		width: 2304,
		height: 1296,
	},
	{
		id: 'hero-c6-slate-quarry-copper',
		kind: 'hero',
		direction: 'c',
		title: 'Slate quarry',
		model: 'GPT Image 2.5',
		note: 'Wet slate cleavage, one seam of copper.',
		file: '/brand/art/hero-c6-slate-quarry-copper.webp',
		width: 2304,
		height: 1296,
	},
	{
		id: 'hero-c7-slate-sea-copper-band',
		kind: 'hero',
		direction: 'c',
		title: 'Sea at dusk',
		model: 'GPT Image 2.5',
		note: 'A flat horizon, a copper band of last light on the water.',
		file: '/brand/art/hero-c7-slate-sea-copper-band.webp',
		width: 2304,
		height: 1296,
	},
	{
		id: 'hero-c8-slate-copper-fracture',
		kind: 'hero',
		direction: 'c',
		title: 'Copper fracture',
		model: 'GPT Image 2.5',
		note: 'A hairline fracture in honed slate, mended with copper.',
		file: '/brand/art/hero-c8-slate-copper-fracture.webp',
		width: 2304,
		height: 1296,
	},
	{
		id: 'issue-plastic-polymer-shards',
		kind: 'issue',
		direction: 'any',
		title: 'Polymer shards',
		model: 'GPT Image 2.5',
		note: 'Clear polymer fragments in dark fluid. For plastic pollution.',
		file: '/brand/art/issue-plastic-polymer-shards.webp',
		width: 2016,
		height: 1344,
	},
	{
		id: 'issue-plastic-wan',
		kind: 'issue',
		direction: 'any',
		title: 'Polymer shards, alternate',
		model: 'Wan 2.7',
		note: 'Sparser, colder. For plastic pollution.',
		file: '/brand/art/issue-plastic-wan.webp',
		width: 2400,
		height: 1598,
	},
	{
		id: 'issue-climate-melting-crystal',
		kind: 'issue',
		direction: 'any',
		title: 'Melting crystal',
		model: 'GPT Image 2.5',
		note: 'An ice crystal collapsing into dark turbulent fluid. For climate change.',
		file: '/brand/art/issue-climate-melting-crystal.webp',
		width: 2016,
		height: 1344,
	},
	{
		id: 'issue-climate-wan',
		kind: 'issue',
		direction: 'any',
		title: 'Melting crystal, alternate',
		model: 'Wan 2.7',
		note: 'A single shard in a ripple. For climate change.',
		file: '/brand/art/issue-climate-wan.webp',
		width: 2400,
		height: 1598,
	},
	{
		id: 'issue-health-protein-crystals',
		kind: 'issue',
		direction: 'any',
		title: 'Protein crystals',
		model: 'GPT Image 2.5',
		note: 'Crystalline structures fracturing in viscous fluid. For disease prevention.',
		file: '/brand/art/issue-health-protein-crystals.webp',
		width: 2016,
		height: 1344,
	},
	{
		id: 'issue-health-wan',
		kind: 'issue',
		direction: 'any',
		title: 'Protein crystals, alternate',
		model: 'Wan 2.7',
		note: 'Warmer, a single fracture. For disease prevention.',
		file: '/brand/art/issue-health-wan.webp',
		width: 2400,
		height: 1598,
	},
	{
		id: 'logo-strata',
		kind: 'logo',
		direction: 'any',
		title: 'Strata reference',
		model: 'GPT Image 2.5',
		note: 'Raster reference only; the vector mark is redrawn in the repo.',
		file: '/brand/art/logo-strata.webp',
		width: 1200,
		height: 1200,
	},
	{
		id: 'logo-horizon',
		kind: 'logo',
		direction: 'any',
		title: 'Horizon reference',
		model: 'GPT Image 2.5',
		note: 'Raster reference only.',
		file: '/brand/art/logo-horizon.webp',
		width: 1200,
		height: 1200,
	},
	{
		id: 'logo-balance',
		kind: 'logo',
		direction: 'any',
		title: 'Balance reference',
		model: 'GPT Image 2.5',
		note: 'Raster reference only.',
		file: '/brand/art/logo-balance.webp',
		width: 1200,
		height: 1200,
	},
	{
		id: 'logo-monogram-ij',
		kind: 'logo',
		direction: 'any',
		title: 'Monogram reference',
		model: 'GPT Image 2.5',
		note: 'Raster reference only.',
		file: '/brand/art/logo-monogram-ij.webp',
		width: 1200,
		height: 1200,
	},
	{
		id: 'og-basalt-studio',
		kind: 'og',
		direction: 'any',
		title: 'Social card background',
		model: 'GPT Image 2.5',
		note: 'Basalt block in a white studio; the upper two-thirds are clear for the wordmark.',
		file: '/brand/art/og-basalt-studio.webp',
		width: 2304,
		height: 1296,
	},
	{
		id: 'texture-a-basalt',
		kind: 'texture',
		direction: 'a',
		title: 'Basalt grain',
		model: 'Wan 2.7',
		note: 'Very low-contrast section background.',
		file: '/brand/art/texture-a-basalt.webp',
		width: 2400,
		height: 1352,
	},
	{
		id: 'texture-b-laid-paper',
		kind: 'texture',
		direction: 'b',
		title: 'Laid paper',
		model: 'Wan 2.7',
		note: 'Very low-contrast section background.',
		file: '/brand/art/texture-b-laid-paper.webp',
		width: 2400,
		height: 1352,
	},
	{
		id: 'texture-c-slate',
		kind: 'texture',
		direction: 'c',
		title: 'Honed slate',
		model: 'Wan 2.7',
		note: 'Very low-contrast section background.',
		file: '/brand/art/texture-c-slate.webp',
		width: 2400,
		height: 1352,
	},
	{
		id: 'hero-a-loop',
		kind: 'loop',
		direction: 'a',
		title: 'Hero loop for direction A',
		model: 'Veo 3.1',
		note: 'Eight-second muted loop animated from hero-a1-basalt-seam.',
		file: '/brand/art/video/hero-a1-loop.mp4',
		webm: '/brand/art/video/hero-a1-loop.webm',
		poster: '/brand/art/video/hero-a1-loop-poster.jpg',
		still: 'hero-a1-basalt-seam',
		width: 1440,
		height: 810,
	},
	{
		id: 'hero-b-loop',
		kind: 'loop',
		direction: 'b',
		title: 'Hero loop for direction B',
		model: 'Veo 3.1',
		note: 'Eight-second muted loop animated from hero-b2-riverbed-aerial.',
		file: '/brand/art/video/hero-b2-loop.mp4',
		webm: '/brand/art/video/hero-b2-loop.webm',
		poster: '/brand/art/video/hero-b2-loop-poster.jpg',
		still: 'hero-b2-riverbed-aerial',
		width: 1440,
		height: 810,
	},
	{
		id: 'hero-c-loop',
		kind: 'loop',
		direction: 'c',
		title: 'Hero loop for direction C',
		model: 'Veo 3.1',
		note: 'Eight-second muted loop animated from hero-c7-slate-sea-copper-band.',
		file: '/brand/art/video/hero-c7-loop.mp4',
		webm: '/brand/art/video/hero-c7-loop.webm',
		poster: '/brand/art/video/hero-c7-loop-poster.jpg',
		still: 'hero-c7-slate-sea-copper-band',
		width: 1440,
		height: 810,
	},
];

const byId = new Map(ARTWORK.map((art) => [art.id, art]));

export function artworkById(id: string): Artwork | undefined {
	return byId.get(id);
}

export function artworkByKind(kind: ArtworkKind): Artwork[] {
	return ARTWORK.filter((art) => art.kind === kind);
}

/** The heroes offered for one direction, in catalogue order. */
export function heroesFor(direction: Direction): Artwork[] {
	return ARTWORK.filter((art) => art.kind === 'hero' && art.direction === direction);
}

/** Which issue each issue image belongs to. An explicit map rather than a
 * filename convention, so renaming a file can never silently move an image
 * onto the wrong issue. */
const ISSUE_IMAGE_IDS: Record<IssueSlug, string[]> = {
	'plastic-pollution': ['issue-plastic-polymer-shards', 'issue-plastic-wan'],
	'climate-change': ['issue-climate-melting-crystal', 'issue-climate-wan'],
	'disease-prevention': ['issue-health-protein-crystals', 'issue-health-wan'],
};

export const ISSUE_SLUGS = Object.keys(ISSUE_IMAGE_IDS) as IssueSlug[];

export function issueImagesFor(slug: IssueSlug): Artwork[] {
	return ISSUE_IMAGE_IDS[slug]
		.map((id) => byId.get(id))
		.filter((art): art is Artwork => art !== undefined);
}

export function isIssueSlug(slug: string): slug is IssueSlug {
	return Object.prototype.hasOwnProperty.call(ISSUE_IMAGE_IDS, slug);
}

/**
 * Picks the hero id to render for a direction: a valid stored preference
 * wins, otherwise the direction's default. "Valid" means present in `ids` —
 * a stale or hand-edited localStorage value is ignored rather than applied,
 * the same shape as resolveBrand in src/lib/brand-resolve.ts.
 *
 * The defaults are declared inside the function body rather than read from a
 * module-level constant because the inline pre-paint script serialises this
 * function with `.toString()`: anything it closed over would be undefined by
 * the time the browser ran it.
 */
export function resolveHero(direction: Direction, stored: string | null, ids: string[]): string {
	const defaults: Record<string, string> = {
		a: 'hero-a1-basalt-seam',
		b: 'hero-b2-riverbed-aerial',
		c: 'hero-c7-slate-sea-copper-band',
	};
	if (stored && ids.indexOf(stored) !== -1) return stored;
	return defaults[direction] || defaults.a;
}

/**
 * The same rule for an issue's image. Returns null for an issue with no
 * artwork, so that page renders no image rather than one that does not
 * describe it. Serialisable for the same reason as resolveHero.
 */
export function resolveIssueImage(slug: string, stored: string | null, ids: string[]): string | null {
	const defaults: Record<string, string> = {
		'plastic-pollution': 'issue-plastic-polymer-shards',
		'climate-change': 'issue-climate-melting-crystal',
		'disease-prevention': 'issue-health-protein-crystals',
	};
	if (stored && ids.indexOf(stored) !== -1) return stored;
	return defaults[slug] || null;
}

/** Derived from resolveHero so the defaults have exactly one home: passing
 * no valid stored id is the "fall through to the default" case. */
export const DEFAULT_HERO: Record<Direction, string> = {
	a: resolveHero('a', null, []),
	b: resolveHero('b', null, []),
	c: resolveHero('c', null, []),
};

export const DEFAULT_ISSUE_IMAGE: Record<IssueSlug, string> = {
	'plastic-pollution': resolveIssueImage('plastic-pollution', null, []) as string,
	'climate-change': resolveIssueImage('climate-change', null, []) as string,
	'disease-prevention': resolveIssueImage('disease-prevention', null, []) as string,
};

export const LOOPS: Record<Direction, Artwork> = {
	a: byId.get('hero-a-loop') as Artwork,
	b: byId.get('hero-b-loop') as Artwork,
	c: byId.get('hero-c-loop') as Artwork,
};

/** The social card. JPEG, not the webp source: several crawlers still drop a
 * webp og:image without reporting an error. */
export const OG_IMAGE = {
	file: '/brand/art/og-default.jpg',
	width: 1200,
	height: 630,
};

/** The widths scripts/derive-art.mjs writes next to every hero and issue
 * image. Declared here so the markup and the derivative script cannot
 * disagree about which files exist. */
export const DERIVATIVE_WIDTHS = [800, 1200];

/**
 * Builds the srcset for a hero or issue image from its own intrinsic width,
 * skipping any derivative that would be an upscale.
 */
export function srcsetFor(art: Pick<Artwork, 'file' | 'width'>): string {
	const base = art.file.replace(/\.webp$/, '');
	const sources = DERIVATIVE_WIDTHS.filter((w) => w < art.width).map((w) => `${base}-${w}.webp ${w}w`);
	sources.push(`${art.file} ${art.width}w`);
	return sources.join(', ');
}
