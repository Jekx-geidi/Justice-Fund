export type CollectionKey = 'issues' | 'cases' | 'people' | 'organisations' | 'posts';

export type Related = Partial<Record<CollectionKey, string[]>>;

export interface RelatedEntry<TData = Record<string, unknown>> {
  id: string;
  collection: CollectionKey;
  data: TData & { draft?: boolean; related?: Related };
}

/** Where entries come from. Next has no built-in content collections, so callers supply their own (CMS, filesystem, DB). */
export interface EntrySource<TData = Record<string, unknown>> {
  getEntry(collection: CollectionKey, slug: string): Promise<RelatedEntry<TData> | undefined>;
  getCollection(collection: CollectionKey): Promise<RelatedEntry<TData>[]>;
}

export type Grouped<TData = Record<string, unknown>> = Record<CollectionKey, RelatedEntry<TData>[]>;

const COLLECTION_KEYS: CollectionKey[] = ['issues', 'cases', 'people', 'organisations', 'posts'];

function emptyGroups<TData>(): Grouped<TData> {
  return { issues: [], cases: [], people: [], organisations: [], posts: [] };
}

/**
 * Resolves a `related` object into the live entries it points to. Throws if
 * any slug does not resolve: a broken related link is a content bug, not
 * something to silently drop.
 */
export async function resolveRelated<TData>(source: EntrySource<TData>, related: Related): Promise<Grouped<TData>> {
  const result = emptyGroups<TData>();

  for (const key of COLLECTION_KEYS) {
    for (const slug of related[key] ?? []) {
      const entry = await source.getEntry(key, slug);
      if (!entry) throw new Error(`Unresolved related slug "${slug}" in ${key}`);
      result[key].push(entry);
    }
  }

  return result;
}

/** Every non-draft entry, across every collection, whose `related` lists `slug` under `collection`. */
export async function backlinksFor<TData>(
  source: EntrySource<TData>,
  collection: CollectionKey,
  slug: string
): Promise<Grouped<TData>> {
  const result = emptyGroups<TData>();

  for (const sourceKey of COLLECTION_KEYS) {
    const entries = await source.getCollection(sourceKey);
    for (const entry of entries) {
      if (entry.data.draft) continue;
      if ((entry.data.related?.[collection] ?? []).includes(slug)) result[sourceKey].push(entry);
    }
  }

  return result;
}

/** Drops backlinks already rendered under "Related", so mutually linked entries don't appear twice. */
export function dedupeBacklinks<TData>(backlinks: Grouped<TData>, resolved: Grouped<TData>): Grouped<TData> {
  const result = emptyGroups<TData>();

  for (const key of COLLECTION_KEYS) {
    const shown = new Set(resolved[key].map((entry) => entry.id));
    result[key] = backlinks[key].filter((entry) => !shown.has(entry.id));
  }

  return result;
}

const ROUTE_PREFIX: Record<CollectionKey, string> = {
  issues: '/issues',
  cases: '/cases',
  people: '/people',
  organisations: '/organisations',
  posts: '/blog',
};

export function hrefFor(collection: CollectionKey, slug: string): string {
  return `${ROUTE_PREFIX[collection]}/${slug}`;
}
