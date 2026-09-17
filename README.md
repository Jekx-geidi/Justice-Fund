# Intergenerational Justice Fund

Four-page frontend: Next.js App Router, TypeScript, React, Tailwind CSS. No backend, CMS, database, authentication or API integration.

## Local development

Run `npm ci` then `npm run dev`.

Production preview: `npm run build` then `npm run start -- --port 3100`.

## Validation

Run `npm run lint`, `npm run typecheck`, `npx playwright install chromium`, then `npm run test:ui` with the production preview running on port 3100. Override its URL with `QA_URL`.

QA captures all four routes at 320, 375, 390, 430, 768, 820, 1024, 1280, 1440 and 1920 pixels, checks overflow, runs accessibility audits, and verifies menu focus/scroll behavior, form validation, reduced motion and legacy-route 404s. Results and screenshots go to ignored `qa-output/`.

## Structure

- `src/app/`: four pages, layout and shared styles.
- `src/ui/`: Header/mobile dialog, Footer, PageIntro, EditorialArt photography, FocusCards, TextLink and ContactForm.
- `src/content/site.ts`: approved copy and clearly labelled placeholder quotes.
- `docs/approved-content.html`: unchanged v2 mockup content reference.
- `docs/implementation.md`: asset mapping and pending client decisions.

Only Home, About, Insights and Contact are implemented. Old Team, Cases and Environment routes return 404. The previous Vite source is backed up in `../iejf-before-next-migration.zip`.

The form validates locally but sends and stores nothing. Donations are disabled. News, Insights, footer legal details and photos require final client content. No Git remote exists, as confirmed by the user.
