import type { SiteDesign } from './types.ts';

/**
 * The file a visitor downloads from Site settings and emails to us, so their picks can be loaded
 * into the site later. `design` is the full SiteDesign, unchanged, so it can be saved as-is.
 */
export function designExport(design: SiteDesign, page: string, now: Date) {
  const pad = (n: number) => String(n).padStart(2, '0');
  const date = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
  const file = { kind: 'iejf-site-design', version: 1, exportedAt: now.toISOString(), page, design };
  return { filename: `iejf-design-${date}.json`, json: JSON.stringify(file, null, 2) };
}
