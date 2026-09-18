# Intergenerational Justice Fund

Next.js App Router, TypeScript, React, Tailwind CSS. Public site (Home/About/Insights/Contact + admin-created custom pages) plus an `/admin` CMS backed by Supabase — see `docs/admin-readme.md` and `docs/admin-prd.md` for that half of the app; this file covers the public site only.

## Local development

Run `npm ci` then `npm run dev`.

Production preview: `npm run build` then `npm run start -- --port 3100`.

## Validation

Run `npm run lint`, `npm run typecheck`, `npx playwright install chromium`, then `npm run test:ui` with the production preview running on port 3100. Override its URL with `QA_URL`.

QA captures all four routes at 320, 375, 390, 430, 768, 820, 1024, 1280, 1440 and 1920 pixels, checks overflow, runs accessibility audits, and verifies menu focus/scroll behavior, form validation, reduced motion and legacy-route 404s. Results and screenshots go to ignored `qa-output/`.

## Structure

- `src/app/(public)/`: Home/About/Insights/Contact plus the `[slug]` route for admin-created custom pages, layout and shared styles.
- `src/app/admin/`, `src/app/api/admin/`: the CMS — see `docs/admin-readme.md`.
- `src/ui/`: Header/mobile dialog, Footer, PageIntro, EditorialArt photography, FocusCards, TextLink and ContactForm.
- `src/ui/blocks/`: public renderers for admin-created custom pages' content blocks.
- `src/lib/content/`: the content model, Zod schemas, seed data and storage adapters (Supabase or local JSON) — the one place both the public site and admin read/write through.
- `docs/approved-content.html`: unchanged v2 mockup content reference.
- `docs/implementation.md`: asset mapping and pending client decisions.

Home, About, Insights and Contact are the four core pages; old Team/Cases/Environment routes still 404. Additional custom pages can now be created through `/admin` and are reachable at their own slug. The previous Vite source (pre-Next.js-migration) is backed up in `../iejf-before-next-migration/`.

The public contact form validates locally but sends and stores nothing. Donations are disabled. News, Insights, footer legal details and photos require final client content. A GitLab remote is configured (`git remote -v`); push access is separate from repo setup and may need to be granted on GitLab's side.
