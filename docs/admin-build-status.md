# Admin Portal Build Status

Tracking progress against `IEJF_Frontend_Documentation_Package/Admin.md` (the full admin portal spec). Work paused mid-build on 17 September 2026 — resume from "Not started yet" below.

## Done

- `src/lib/content/types.ts` — `SitePage`, `ContentBlock` union (hero/richText/imageText/cardGrid/quote/cta), per-core-page field types (`HomeFields`, `AboutFields`, `ContactFields`), `InsightEntry`, `SiteContent`.
- `src/lib/content/schemas.ts` — Zod validation for slugs (reserved-word rejection), blocks, core page fields, insight entries, login input.
- `src/lib/content/seed.ts` — initial `SiteContent` seeded from IEJF's confirmed 17 Sept 2026 copy (Home/About/Insights/Contact), matches what's live on the public site now.
- `src/lib/content/storage.ts` + `storage-local.ts` — `ContentStorage` interface + filesystem implementation (`data/content.live.json`, `data/content.draft.json`, gitignored, seeded lazily on first read). A future `storage-gcs.ts` implementing the same interface is the Phase 2 swap-in — no other file should change when that happens.
- `src/lib/content/content.ts` — the single content service: `getSiteContent`, `saveDraft`, `publishDraft`, `getPageBySlug`, `getPageById`, `deriveNavigation`, `isSlugTaken`, `nextNavOrder`, `pageRoute` (handles Home's special `/` route).
- `src/lib/auth/` — `password.ts` (bcrypt, 12 rounds), `admin.ts` (single admin account from `ADMIN_EMAIL`/`ADMIN_PASSWORD_HASH` env vars, dev-only fallback credential logged nowhere), `session.ts` (HMAC-signed cookie, HttpOnly/Secure/SameSite=Strict, 8h TTL), `rateLimit.ts` (5 failed attempts / 15 min, in-memory).
- `src/lib/security/` — `log.ts` (structured audit events to stdout for Cloud Logging), `origin.ts` (Origin/Referer CSRF check), `sanitize.ts` (rich-text allow-list via `sanitize-html`).
- `src/lib/media/upload.ts` — magic-byte MIME sniffing (JPEG/PNG/WebP only), re-encodes via `sharp` (strips EXIF, neutralises polyglot files), 8MB limit, random filename, writes to `public/uploads/`.
- `next.config.ts` — CSP + security headers (`X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, `Strict-Transport-Security`).
- `src/app/api/admin/login/route.ts` — the only route handler written so far. Origin check, rate limit, constant-work password comparison (no email-exists leak), audit log, generic error message.

## Not started yet

1. **`POST /api/admin/logout`** — clear session cookie, audit log.
2. **Content APIs** — `GET/PUT /api/admin/content/draft`, `POST /api/admin/content/publish` (copy draft → live, stamp `publishedAt`, trigger revalidation).
3. **Page APIs** — `POST /api/admin/pages` (create, reject duplicate/reserved slug), `PUT /api/admin/pages/:id`, `DELETE /api/admin/pages/:id` (core pages: reject; custom: confirm+delete), `POST /api/admin/pages/reorder`.
4. **Media APIs** — `POST /api/admin/media` (wraps `saveUploadedImage`), `DELETE /api/admin/media/:id` (warn if referenced by live content).
5. **`/admin` UI** — none of this exists yet:
   - `admin/layout.tsx` — the *authoritative* auth check (calls `getSessionEmail()`, redirects to `/admin/login` if absent). This is what actually protects `/admin/*`, not middleware (Admin.md §18 explicitly forbids relying on middleware alone).
   - `admin/login/page.tsx`
   - `admin/page.tsx` (dashboard — page table, last published time, quick links)
   - `admin/pages/page.tsx` (page list), `admin/pages/new/page.tsx`, `admin/pages/[id]/page.tsx` (settings + block editor)
   - `admin/media/page.tsx` (uploader + library)
   - `admin/settings/page.tsx`
   - Admin components: `AdminShell`, `PageList`, `PageEditorForm`, `SlugField`, `BlockEditor`/`BlockPicker`, `ImageUploader`/`MediaPicker`, `PublishBar`, `StatusBadge`, `ConfirmDialog`, `UnsavedChangesGuard`, `NavigationSettings` (up/down controls, not drag-only — accessibility requirement).
6. **Public block renderer** — `src/ui/blocks/BlockRenderer.tsx` + one component per block type, styled with the existing design tokens (reuse `.focus-grid`/`.quote-card`/`.button` classes from `globals.css`, don't invent a new visual language).
7. **Public dynamic route** — `src/app/[slug]/page.tsx`: load by slug from **live** content, 404 if missing/unpublished, render via `BlockRenderer` inside the shared Header/Footer.
8. **Rewire the existing 4 pages to the content service** — this is the big one. Right now Home/About/Insights/Contact still read from the old static `src/content/site.ts`. They need to read from `getSiteContent('live')` via each page's `home`/`about`/`contact` fields instead, and `Header.tsx`/`Editorial.tsx` `Footer()` need to call `getPublicNavigation()` instead of importing the static `navigation` array. **Design decision already made:** the four core pages keep their bespoke hand-built layouts (hero photo composition, focus-grid, contact-grid) — they do NOT get rewritten as generic blocks. Only new custom pages use the block renderer. This matches Admin.md §8.1's page-specific field lists.
9. **Insights collection** — replace the single hardcoded example entry with the `insights[]` array from content, with admin CRUD (add/reorder/publish state). No per-entry detail route planned (Admin.md open question #7 — defaulting to cards/list-only per the doc's own recommended safe default).
10. **`.env.example`** + `scripts/create-admin-hash.mjs` (prints a bcrypt hash for a chosen password, to paste into `ADMIN_PASSWORD_HASH`).
11. Full `npm run typecheck` / `npm run lint` / `npm run build` pass — **nothing above has been build-tested yet.** Treat everything in "Done" as unverified until this runs clean.
12. Playwright QA pass: login flow, create→draft→preview→publish→auto-nav-append, mobile/tablet admin responsiveness (Admin.md §44 breakpoints).

## Explicitly deferred (needs the user's real infra access, not buildable in this environment)

- Actual GCS bucket / Cloud Run / Secret Manager provisioning (Admin.md §12, §33). The storage/auth code above is written *behind the abstraction* so swapping in real GCS later doesn't touch the admin UI.
- MFA (TOTP) — recommended, not launch-blocking per the spec.
- OWASP ZAP baseline scan — needs a running staging deployment.
- Rollback/version history beyond current draft+live — listed as a Phase 1.1 enhancement in the spec itself.

## Key design decisions made so far (so future-me doesn't re-litigate)

- Core pages ≠ generic blocks. See point 8 above.
- CSP allows `'unsafe-inline'` on `script-src` for Phase 1 (Next.js's own hydration bootstrap needs it without nonce plumbing) — flagged as a Phase 1.1 hardening item, not pretended-away.
- CSRF defense is Origin/Referer verification + SameSite=Strict, not a stateful double-submit token (spec allows "one or more of" the listed methods).
- Rate limiting and audit logging are in-memory/stdout — correct for a single Cloud Run instance per the spec's Phase 1 assumptions; would need a shared store if the instance count ever goes above 1.
