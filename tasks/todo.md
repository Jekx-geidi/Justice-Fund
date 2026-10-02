# Todo: April's Oct 1 base template + colour themes

Plan: `tasks/plan.md`. Checks: `npm test`, `npm run typecheck`, `npm run lint`, `npm run build`, `npm run test:ui`.

## Phase 1: April's base template

### Task 1 (done): Make April's Oct 1 export the default design
Replace `DEFAULT_DESIGN` with the values in April's `iejf-design-2026-10-01.html` (table in plan.md).
`customUrl` becomes `''`. Update the doc comment ("April's export of 1 Oct").

**Acceptance criteria:**
- [x] `DEFAULT_DESIGN` equals April's exported `design` field for field (except `customUrl: ''`)
- [x] `siteDesignSchema.parse(DEFAULT_DESIGN)` passes
- [x] "Restore original design" returns to the Oct 1 look

**Verification:**
- [x] `npm test` (update `types.test.ts` expectations; add a test pinning the Oct 1 values)
- [x] `npm run typecheck`, `npm run build`
- [x] `npm run test:ui`: a11y, phone overflow and "every control changes the page" green on all four pages

**Dependencies:** None
**Files:** `src/lib/design/types.ts`, `src/lib/design/types.test.ts`, maybe `scripts/qa.mjs` (background is now a colour, not white)
**Scope:** S

### Task 2: Set April's Oct 1 design as the stored live and draft design (staging)
Written 2 Oct by Reil (script: replaces only `content.design` on both rows). Backups in
`.report/design-backups/site_content-{live,draft}-2026-10-02T03-06-32-887Z.json` (not committed). The replaced design
was older than her export (rows saved 30 Sep 08:37 / 09:06 UTC, export 13:04 UTC): Cormorant, centred Home and header.

**Acceptance criteria:**
- [x] Current `site_content.design` (live + draft) backed up before writing; any field differing from her 30 Sep export is reported to Reil first
- [x] Live and draft both equal April's Oct 1 design
- [ ] Staging shows it on Home, About, Insights and Contact without opening Site settings

**Verification:**
- [x] Read the row back and diff against her export JSON (0 design differences, 0 other content changes)
- [x] Local (localhost:3000, same Supabase): all four pages render her colours, fonts, sizes and heading
- [ ] Manual: open staging, check all four pages and the phone menu

**Dependencies:** Task 1 (so validation and defaults agree). **Needs Reil's OK before writing to Supabase.**
**Files:** none in the repo (data change)
**Scope:** XS

## Checkpoint A
- [ ] All checks green
- [ ] Staging shows the Oct 1 look; every Site settings control still changes the page
- [ ] Reil reviews before Phase 2

## Phase 2: Colour themes

### Task 3 (done): Theme presets
New `src/lib/design/themes.ts`: `COLOUR_THEMES` (the six in plan.md), `applyTheme(design, theme)` returning a
new design with only the theme's fields changed, and `activeTheme(design)` returning the matching theme id or null.
Also sets the Home text to white, since every theme's Home box is dark.

**Acceptance criteria:**
- [x] Every theme applied to `DEFAULT_DESIGN` passes `siteDesignSchema`
- [x] `applyTheme` changes only colour fields listed in the plan (fonts, sizes, layout, photos, text, other page backgrounds untouched)
- [x] `activeTheme(DEFAULT_DESIGN)` is "April's pick"; after any single colour edit it is null

**Verification:**
- [x] `npm test` (new `themes.test.ts`, 9 tests)
- [x] `npm run typecheck`

**Dependencies:** Task 1
**Files:** `src/lib/design/themes.ts`, `src/lib/design/themes.test.ts`
**Scope:** S

### Task 4: "Colour theme" row in Site settings
A group at the top of the panel's colour controls: one button per theme showing a small swatch strip and name,
`aria-pressed` on the active one, "Custom" shown when none matches. Clicking previews instantly like any other control.

**Acceptance criteria:**
- [x] Clicking a theme recolours header, footer, button, accent lines, menu hover, headings and boxes on the current page immediately
- [ ] "Undo preview" and "Restore original design" still work after picking a theme; publishing a theme saves and reloads correctly (not checked by hand yet; the row's state is derived from the design, so it follows both)
- [x] Every existing colour control is still there and still overrides the theme; the panel width does not jump when switching

**Verification:**
- [x] `npm run test:ui`: extend `scripts/qa.mjs` to click each theme and assert the CSS variables change; a11y green
- [x] `npm run lint`, `npm run build`
- [ ] Manual: pick each theme on all four pages, then Export design and open the .html offline

**Dependencies:** Task 3
**Files:** `src/ui/site-settings/SiteSettingsPanel.tsx`, its stylesheet, `scripts/qa.mjs`
**Scope:** M

## Checkpoint B
- [ ] All checks green
- [ ] Offline export of a themed design shows the theme
- [ ] Reil reviews the six themes on staging

## Phase 3: Hand-off

### Task 5: Deploy to staging and reply to Junrey
**Acceptance criteria:**
- [ ] Staging deploy QA-green
- [ ] Reply drafted for the IEJF Teams chat (Oct 1 design is now the base, everything still toggles, six colour themes added, where to find them); sent only after Reil approves the wording

**Verification:**
- [ ] `npm run test:ui` against staging
- [ ] Reil approves the message

**Dependencies:** Checkpoint B
**Files:** `tasks/plan.md` (mark done)
**Scope:** XS
