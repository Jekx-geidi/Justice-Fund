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

## Tasks — all done (commits `79d54b2`..`72fe858`)

1. **[done]** Typography + token pass — Poppins scoped to `.site-public`,
   admin's Marcellus/Material typography untouched.
2. **[done]** Home reversion — dropped hero photo/portrait cutout, charcoal
   single-column hero, correctly bound `home.heading` (was hardcoded),
   removed the About-teaser/Focus-cards sections duplicated onto Home
   (mockup doesn't have them there).
3. **[done]** Removed the "In the news" placeholder quote-wall from Home.
   `home.quotes` stays in the schema/admin editor, unused publicly.
4. **[done]** Home CTA restyled to the mockup's centered, paper-background
   treatment. Copy/CMS binding unchanged.
5. **[done]** About reversion — dropped the photo, plain two-column
   intro/body text layout, focus cards unchanged.
6. **[done]** Insights reversion — plain `.case-item` bordered list,
   dropped the two-column "featured" photo panel; optional entry images
   kept (explicit brief exception).
7. **[done]** Contact reversion — dropped the dark decorative aside/circle
   decoration; plain two-column layout, form/CMS binding unchanged.
8. **[done]** Header/Footer — removed decorative nav arrow icons, reduced
   the oversized footer brand lockup. Routing/mobile-dialog/CMS nav data
   untouched.
9. **[done]** Full verification pass — see final report delivered to the
   user in-conversation. typecheck/lint/build all green on every commit;
   confirmed via `git diff --stat` that no file under `src/app/admin`,
   `src/ui/admin`, `src/app/api/admin`, or `supabase/` was touched.
   Live-browser screenshot verification could not be completed (agent-browser/
   Playwright did not come up in this sandbox); responsive correctness was
   instead verified by reasoning through every media query touched plus
   DOM/curl checks against the running dev server. Admin login→Save
   Draft→Preview→Publish click-through was **not** run — it needs real
   admin credentials against a live Supabase project, which this session
   doesn't have and shouldn't guess at.
