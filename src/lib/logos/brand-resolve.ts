export interface ResolveBrandOptions {
	query: string | null;
	stored: string | null;
	ids: string[];
}

/**
 * Picks the brand id to apply: a valid `?brand=` query value wins, then a
 * valid stored value, then the 'a' default. "Valid" means present in `ids` —
 * anything else (missing, empty, or unknown) is ignored rather than applied.
 */
export function resolveBrand({ query, stored, ids }: ResolveBrandOptions): string {
	if (query && ids.includes(query)) return query;
	if (stored && ids.includes(stored)) return stored;
	return 'a';
}
