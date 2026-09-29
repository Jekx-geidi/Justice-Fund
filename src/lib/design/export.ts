import type { SiteDesign } from './types.ts';

const pad = (n: number) => String(n).padStart(2, '0');

/** `iejf-design-2026-09-29.pdf`: every format shares the local export date. */
export function exportFilename(now: Date, ext: string) {
  return `iejf-design-${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}.${ext}`;
}

/**
 * The file a visitor downloads from Site settings and emails to us, so their picks can be loaded
 * into the site later. `design` is the full SiteDesign, unchanged, so it can be saved as-is.
 */
export function designExport(design: SiteDesign, page: string, now: Date) {
  const file = { kind: 'iejf-site-design', version: 1, exportedAt: now.toISOString(), page, design };
  return { filename: exportFilename(now, 'json'), json: JSON.stringify(file, null, 2) };
}
