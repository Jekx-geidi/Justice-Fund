/**
 * Everything the control panel does — widget, `/brand` and `/brand/artwork`
 * query/localStorage handling, the extra Google Fonts stylesheet — only
 * exists when this is `true` at build time (Preview only; unset/false in
 * Production). Reading `process.env.NEXT_PUBLIC_*` as a bare expression
 * (not through a function) lets Next.js inline and dead-code-eliminate the
 * `false` branch at build time, so a production build carries none of it.
 */
export const BRAND_CHOOSER_ENABLED = process.env.NEXT_PUBLIC_BRAND_CHOOSER === 'true';
