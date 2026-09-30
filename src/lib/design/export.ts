import type { SiteDesign } from './types.ts';

const pad = (n: number) => String(n).padStart(2, '0');

/** `iejf-design-2026-09-29.html`, dated by the local export day. */
export function exportFilename(now: Date, ext: string) {
  return `iejf-design-${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}.${ext}`;
}

/**
 * The visitor's picks as JSON, embedded in the offline export so they can be loaded into the site later.
 * `design` is the full SiteDesign, unchanged, so it can be saved as-is.
 */
export function designJson(design: SiteDesign, page: string, now: Date) {
  return JSON.stringify({ kind: 'iejf-site-design', version: 1, exportedAt: now.toISOString(), page, design }, null, 2);
}
