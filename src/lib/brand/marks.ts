export interface MarkConcept {
  id: string;
  label: string;
  description: string;
  /** Trusted, hand-authored SVG child markup (not user input) — viewBox is always "0 0 48 48". */
  svg: string;
}

/**
 * Six abstract explorations, kept for comparison against the twelve fuller
 * logo concepts. Placeholder geometry — simple primitives, not finished
 * artwork — swappable for real mark drawings later without touching how
 * they're resolved or rendered.
 */
export const MARKS: MarkConcept[] = [
  {
    id: 'm1',
    label: 'Concentric arcs',
    description: 'Three nested arcs — generations, one inside the next.',
    svg: '<circle cx="24" cy="24" r="20" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="24" cy="24" r="13" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="24" cy="24" r="6" fill="none" stroke="currentColor" stroke-width="2"/>',
  },
  {
    id: 'm2',
    label: 'Ascending bars',
    description: 'Four bars stepping upward — growth, progress.',
    svg: '<rect x="6" y="30" width="6" height="12" fill="currentColor"/><rect x="16" y="22" width="6" height="20" fill="currentColor"/><rect x="26" y="14" width="6" height="28" fill="currentColor"/><rect x="36" y="6" width="6" height="36" fill="currentColor"/>',
  },
  {
    id: 'm3',
    label: 'Interlocking rings',
    description: 'Two overlapping rings — continuity between generations.',
    svg: '<circle cx="18" cy="24" r="14" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="30" cy="24" r="14" fill="none" stroke="currentColor" stroke-width="2"/>',
  },
  {
    id: 'm4',
    label: 'Horizon',
    description: 'A rising line over a base — the long view.',
    svg: '<line x1="6" y1="34" x2="42" y2="34" stroke="currentColor" stroke-width="2"/><path d="M6 34 L18 16 L28 26 L42 8" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>',
  },
  {
    id: 'm5',
    label: 'Seedling',
    description: 'Two abstracted leaves on a stem — the environment.',
    svg: '<line x1="24" y1="42" x2="24" y2="18" stroke="currentColor" stroke-width="2"/><path d="M24 26 C14 26 10 18 10 12 C20 12 24 18 24 26 Z" fill="currentColor"/><path d="M24 20 C34 20 38 13 38 8 C28 8 24 13 24 20 Z" fill="currentColor"/>',
  },
  {
    id: 'm6',
    label: 'Shield arc',
    description: 'A single protective arc over a grounded base — justice.',
    svg: '<path d="M24 6 C33 10 38 12 38 12 L38 24 C38 34 32 40 24 43 C16 40 10 34 10 24 L10 12 C10 12 15 10 24 6 Z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>',
  },
];

export const MARK_IDS = MARKS.map((m) => m.id);

/** No preference resolves to `null` — the mark stays hidden. */
export function resolveMark(value: string | null | undefined): string | null {
  if (value && MARK_IDS.includes(value)) return value;
  return null;
}

export function getMark(id: string): MarkConcept | undefined {
  return MARKS.find((m) => m.id === id);
}
