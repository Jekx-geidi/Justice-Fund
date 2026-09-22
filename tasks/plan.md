# Plan: Revert public site to Yudi's mockup (docs/approved-content.html)

Source of truth for visual style: `docs/approved-content.html` (Poppins, charcoal
`#231F20` / paper `#F5F3F1` / gold `#C9A15A`, no photos, no placeholder
quotes/CTAs). Content source of truth: current CMS data via `getSiteContent`.
Admin (`/admin`, auth/MFA, Supabase, draft/preview/publish) is out of scope and
must keep working — `PageEditorClient`'s Live Preview renders these same
public view components, so restyling them restyles preview automatically.

No test runner exists in this repo (only `lint`, `typecheck`, `build`). Each
task is verified with those three plus a manual dev-server check, not unit
tests.

## Tasks

1. **[done] Typography + token pass** — swap `--font-sans`/body font from
   Marcellus to Poppins in `src/app/globals.css` (matching the mockup's
   Google Fonts import), confirm charcoal/paper/gold tokens already match the
   mockup. No component changes.
2. **Remove decorative hero/about photography** — stop rendering
   `EditorialArt`'s photo on Home (`hero-visual`/`hero-photo`/portrait accents)
   and About (`about-art`/`editorial-photo`); keep `heroImage`/`about.image`
   CMS fields and Media Library untouched, just don't render them publicly.
   Restyle hero/about layout to a single-column, text-only layout matching
   the mockup's `.hero-home`/`.about-grid`.
3. **Remove the "In the news" placeholder quote-wall from Home** — this
   section is explicitly flagged as placeholder/unverified in both the
   mockup (`IN THE NEWS — PLACEHOLDER QUOTES`) and the current code
   (`placeholder-badge`). Drop the section; leave `home.quotes` CMS field
   alone (unused by the view, still editable/dormant in admin) rather than
   deleting the schema.
4. **Restyle Home CTA** — match the mockup's centered `.home-cta` treatment
   (single centered column, no grid) instead of the current two-column
   `cta-grid`. Keep the CMS-bound copy and the existing disabled Donate
   button/copy as-is (already-approved content, not new marketing copy).
5. **Restyle About page** — remove the two-column photo/text split now that
   the photo is gone; adopt the mockup's simpler intro + focus-card layout.
   Keep `focusAreas`/ABNs CMS-bound.
6. **Restyle Insights list** — replace the featured/photo-heavy
   `insight-feature` treatment with the mockup's plain bordered list
   (`.case-item` style). Keep optional `entry.image` rendering (small, only
   if an editor attaches one) since Insights images are an explicit
   exception to "no photos"; keep empty-state notice.
7. **Restyle Contact page** — replace the dark decorative `contact-details`
   aside (circles decoration, dark background) with the mockup's plain
   two-column layout. Keep form behavior and CMS-bound email/location.
8. **Restyle Header/Footer** — align header nav and footer visual weight
   with the mockup (simpler footer, no oversized brand lockup) while keeping
   real routing, dynamic nav data, and mobile dialog behavior untouched.
9. **Full verification pass** — typecheck, lint, build; manual check at
   390/430/768/820/1024/1280/1440px; Admin smoke test (login, Pages editor,
   Save Draft → Preview → Publish for Home/About/Insights/Contact); final
   report per AGENTS.md's Final Report section.
