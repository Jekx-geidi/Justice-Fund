# PRD — Brand & Design Control Panel

**Status:** Implemented (documents existing behaviour; nothing here is a proposal)
**Date:** 2026-09-22
**Owner:** Justice Fund site (Paul deploys; Astro/Vercel)
**Scope:** The preview-only system that lets a visitor try different colour
directions, type pairings, logo/mark concepts and generated artwork on the
live site, and have the choice persist as they browse.

---

## 1. Problem

The fund has not yet picked a final colour direction, typeface pairing, logo
mark or hero artwork. Rather than mock these up in a static deck, the site
itself can render any combination, so a stakeholder can click through real
pages — not a comp — in the version they're judging. That capability is the
"control panel": a floating widget plus two internal comparison pages.

It must never reach a production visitor. The fund's own site should render
exactly one direction, one pairing, and no widget, with zero extra
JavaScript or font requests for the paths not taken.

## 2. Audience

Internal only: the client (comparing directions), the fund's team, and
whoever is deploying (Paul, via `npx vercel deploy` for preview builds).
Not indexed, not linked from any public page, not shipped to
`justicefund.geidi.ai` production traffic.

## 3. Components

### 3.1 The floating chooser (`src/components/BrandChooser.astro`)

A fixed panel, bottom-right, rendered on every page when enabled. Two rows,
one per independent axis:

- **Colour direction** — one button per entry in `BRANDS`
  (`src/lib/brands.ts`: **Card** / **Paper** / **Slate**, ids `a`/`b`/`c`),
  plus a **Compare** link to `/brand`.
- **Type pairing** — one button per entry in `TYPEFACES`
  (`src/lib/typefaces.ts`: eleven pairings, `t1`–`t11`) plus a **Default**
  button that clears the preference. Below 640px these collapse behind a
  **Type ▾** toggle (`aria-expanded`/`aria-controls`) so the widget's
  resting footprint stays small on a phone; above 640px all eleven are
  always visible.

Clicking a button writes the choice to `localStorage` **and** applies it to
the live document immediately (`document.documentElement.dataset.brand` /
`.dataset.type`), so the change is visible without a reload. The active
choice on each axis is marked with `aria-pressed="true"` and the accent
colour, not a heavier border, so the widget never changes size as you click
through.

### 3.2 `/brand` — direction, mark and type comparison

The full comparison surface, `noindex`:

- **Logo concepts** — twelve full concepts (mark + wordmark together,
  drawn black-on-white so shape can be judged before colour;
  `src/lib/logo-concepts.ts`). "Prefer this concept" writes to
  `localStorage['logo']`; the preferred one then replaces the wordmark in
  the header and appears in the footer as you browse the rest of the site.
- **Abstract marks** — six earlier, more abstract explorations
  (`src/lib/marks.ts`), kept for comparison. "Prefer this mark" writes to
  `localStorage['mark']`.
- **Type pairings** — the same eleven pairings as the floating widget, each
  card rendering itself in the pairing it describes (a live specimen, not a
  static image) so the choice is judged in situ.
- **Directions** — three columns, each painted in its own tokens end to
  end, so what's on screen is what the whole site looks like in that
  direction. "Use this on the site" writes `localStorage['brand']`.

### 3.3 `/brand/artwork` — generated artwork comparison

A second internal page, `noindex`, for the image/video programme
(`src/lib/artwork.ts`):

- **Heroes** — grouped per direction (a hero only means anything against
  the ground it sits on); "Use as hero" sets that direction's home-page
  hero via `localStorage['hero:<direction>']`. Choosing a hero for one
  direction doesn't touch the other two.
- **Video loops** — the eight-second silent motion loop per direction;
  "Loop on/off" toggles `localStorage['loop:<direction>']`.
- **Issue images**, **logos**, **textures** and the **OG social card** —
  shown for reference; issue images are the same "Use as X" pattern keyed
  by `localStorage['issue:<slug>']`.

## 4. State model

| Key | Set by | Read by | Default when absent/invalid |
|---|---|---|---|
| `brand` | Chooser, `/brand`, `?brand=` query | `BaseLayout` pre-paint script | direction `a` |
| `type` | Chooser, `/brand` | `BaseLayout` pre-paint script | the active direction's own pairing (no `data-type` set) |
| `mark` | `/brand` | `SiteHeader` | none — mark stays hidden |
| `logo` | `/brand` | `SiteHeader`, `SiteFooter` | none — full wordmark text stands |
| `hero:<direction>` | `/brand/artwork` | home page (`index.astro`) | that direction's `DEFAULT_HERO` |
| `loop:<direction>` | `/brand/artwork` | home page | loop on |
| `issue:<slug>` | `/brand/artwork` | `/issues/[slug]` | that issue's `DEFAULT_ISSUE_IMAGE` |

Every resolver (`resolveBrand`, `resolveTypeface` in `src/lib/typefaces.ts`,
`resolveMark` in `src/lib/marks.ts`, `resolveLogoConcept` in
`src/lib/logo-concepts.ts`) follows the same shape: a value is only applied
if it's present in the known-ids list; anything missing, empty, or unknown
falls through to the default rather than rendering broken. `?brand=` and
`?type=` query parameters are also honoured (highest precedence, then
persisted to `localStorage`) so a link can open directly into a given
combination; no other axis has a query-string form.

**No-flash guarantee:** the same resolver functions are embedded into an
inline pre-paint `<script>` in `BaseLayout.astro` via `.toString()`, so the
stored/query choice is applied to `<html data-brand>`/`data-type` before
first paint — never re-implemented separately, so the check-time logic and
the paint-time logic cannot drift apart. `SiteHeader`/`SiteFooter`/
`index.astro`/`[slug].astro` do the equivalent for mark, logo, hero, loop
and issue image, each gated on `hidden`/no-op until its own script runs.

## 5. Environment gating

Everything above only exists when `PUBLIC_BRAND_CHOOSER=true` at build
time (`.env.example`; `true` for the Preview Vercel environment, `false`/
unset for Production):

- The floating widget is not rendered.
- `/brand` and `/brand/artwork` still build (they're useful with the
  chooser off too, for a fixed-in-code look) but nothing links to them from
  a public page, and both are `noindex` and excluded from the sitemap and
  robots.
- The `?brand=`/`?type=` query handling and all localStorage lookups for
  mark/logo/hero/loop/issue are skipped entirely — the scripts that would
  do the lookups aren't emitted.
- `BaseLayout` loads exactly one Google Fonts stylesheet (the active
  direction's own default pairing via `DEFAULT_TYPEFACE`), not all eleven.
- `<html data-brand>` is hardcoded at build time (currently `"b"`) instead
  of being resolved at runtime.

This means a production visitor never pays for the comparison tooling —
no extra script, no extra font requests, no chooser markup.

## 6. Accessibility

- The widget is a labelled region (`role="region"`, `aria-label`) with two
  labelled groups (`role="group"`) for the two axes.
- Every choice button reports its state via `aria-pressed`, not colour
  alone.
- The phone-width type-pairing toggle uses `aria-expanded` +
  `aria-controls`, standard disclosure-button pattern.
- All choice controls are real `<button>`/`<a>` elements — keyboard and
  screen-reader operable without extra wiring.

## 7. Non-goals

- Not a CMS or admin panel — nothing here is a durable content edit; every
  choice is per-visitor `localStorage`, not written back to the repo or a
  database. Adopting a choice for real means an engineer hardcodes it
  (e.g. changing `DEFAULT_TYPEFACE`, `data-brand` in `BaseLayout`, or the
  chosen logo concept getting redrawn as production artwork).
- Not multi-user or shared state — two people comparing see independent
  choices; there is no "the client's pick" record beyond what they tell the
  team.
- Does not cover copy, layout, or content decisions — colour, type, mark
  and generated imagery only.

## 8. Implementation map

| Concern | File |
|---|---|
| Floating widget | `src/components/BrandChooser.astro` |
| Direction catalogue | `src/lib/brands.ts` |
| Type pairing catalogue | `src/lib/typefaces.ts` |
| Abstract mark catalogue | `src/lib/marks.ts` |
| Full logo concept catalogue | `src/lib/logo-concepts.ts` |
| Generated artwork catalogue | `src/lib/artwork.ts` |
| Brand resolution logic | `src/lib/brand-resolve.ts` |
| Pre-paint script, font loading, env gating | `src/layouts/BaseLayout.astro` |
| Direction/mark/type/logo comparison page | `src/pages/brand.astro` |
| Artwork comparison page | `src/pages/brand/artwork.astro` |
| Token definitions applied per direction | `src/styles/tokens.css`, `src/styles/brands/{a,b,c}.css` |
| Type-axis token overrides | `src/styles/typefaces.css` |
