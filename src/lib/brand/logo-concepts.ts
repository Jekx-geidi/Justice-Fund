import { MARKS, type MarkConcept } from './marks';

export type LogoLayout = 'inline' | 'stacked';

export interface LogoConcept {
  id: string;
  label: string;
  mark: MarkConcept;
  layout: LogoLayout;
}

/**
 * Twelve full concepts: each of the six abstract marks, drawn both inline
 * (mark beside the wordmark) and stacked (mark above it) — full concept
 * covering both header and footer proportions.
 */
export const LOGO_CONCEPTS: LogoConcept[] = MARKS.flatMap((mark, index) =>
  (['inline', 'stacked'] as const).map((layout) => ({
    id: `l${index * 2 + (layout === 'inline' ? 1 : 2)}`,
    label: `${mark.label} — ${layout === 'inline' ? 'inline' : 'stacked'}`,
    mark,
    layout,
  }))
);

export const LOGO_CONCEPT_IDS = LOGO_CONCEPTS.map((c) => c.id);

/** No preference resolves to `null` — the full wordmark text stands, no mark. */
export function resolveLogoConcept(value: string | null | undefined): string | null {
  if (value && LOGO_CONCEPT_IDS.includes(value)) return value;
  return null;
}

export function getLogoConcept(id: string): LogoConcept | undefined {
  return LOGO_CONCEPTS.find((c) => c.id === id);
}
