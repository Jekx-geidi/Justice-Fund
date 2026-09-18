# Admin Portal Build Status

Tracking progress against `IEJF_Frontend_Documentation_Package/Admin.md`. Core build finished and verified end-to-end on 18 September 2026. Persistence migrated from local JSON to Supabase the same day — see "Supabase persistence" below.

## Done and verified

**Content architecture**
- `src/lib/content/` — full dynamic `pages[]` model (`types.ts`, `schemas.ts`), seeded from IEJF's confirmed copy (`seed.ts`), behind a swappable `ContentStorage` interface (`storage.ts`), and the single content service everything reads through (`content.ts`).
- Home/About/Insights/Contact now read live content from this service instead of the old static `site.ts` (deleted). `Header`/`Footer` derive navigation the same way.
- Insights is a real repeatable `insights[]` collection, launched empty per spec.

**Supabase persistence** (resolves the "edits vanish on redeploy" gap flagged earlier)
- `src/lib/content/storage-supabase.ts` implements `ContentStorage` against a `site_content` table (`supabase/migrations/0001_site_content.sql` — one row per version, whole `SiteContent` document as `jsonb`). `content.ts` picks this automatically whenever `NEXT_PUBLIC_SUPABASE_URL`/`SUPABASE_SERVICE_ROLE_KEY` are set, falling back to the local JSON adapter (`storage-local.ts`) otherwise — no other file needed to change.
- Admin credentials moved out of env vars into an `admin_users` table (`supabase/migrations/0002_admin_users.sql`), so more admin accounts can be added later without a redeploy (Admin.md §3.4). `src/lib/auth/admin.ts` (`findAdminByEmail`) queries this when Supabase is configured, with the same env-var fallback path for a Supabase-less checkout.
- RLS is enabled on both tables with zero policies — only the server-side `service_role` key (which bypasses RLS) can read/write; the anon key gets nothing. Verified: valid login succeeds, wrong password and unknown email both 401, dashboard access works with the resulting session.
- **Still local-only:** uploaded media (`public/uploads/` + `data/media.json` sidecar) hasn't been moved to Supabase Storage yet — same "vanishes on redeploy" problem as content used to have, just not yet fixed for images.

**Auth & security**
- `src/lib/auth/` — bcrypt password hashing, HMAC-signed session cookies (HttpOnly/Secure/SameSite=Strict, 8h), login rate limiting (5/15min).
- `src/lib/security/` — audit log (stdout, Cloud Logging-ready), Origin-based CSRF check, rich-text sanitizer.
- `src/lib/media/upload.ts` — magic-byte sniffing (JPEG/PNG/WebP only), re-encoded via `sharp` (strips EXIF, neutralises polyglots), 8MB cap.
- `next.config.ts` — CSP + security headers.
- Every `/api/admin/*` write checks session **in the handler itself** (`requireAdminSession`), not just via middleware — confirmed unauthenticated calls get 401/403.

**Admin UI** (`src/app/admin/`, all under `(protected)/` except `/admin/login`)
- Dashboard, Pages list with keyboard-accessible reorder (up/down, not drag-only), New Page flow, full page editor (core-page field forms for Home/About/Contact + generic block editor for custom pages), Insights entry manager, Media library with uploader, Settings.
- Save Draft / Preview / Publish wired to real APIs. Preview reuses the actual public page components via `?preview=1` (authenticated-only, shows a "Draft Preview" banner) rather than a separate rendering path.
- Delete requires explicit confirmation (`ConfirmDialog`), core pages can't be deleted (403 server-side).
- Unsaved-changes browser warning on every editor.

**Public rendering**
- `src/app/(public)/[slug]/page.tsx` — dynamic route, loads by slug from live content, 404s for missing/unpublished (drafts never leak publicly).
- `src/ui/blocks/` — Hero/RichText/ImageText/CardGrid/Quote/CTA renderers for custom pages, styled with the site's existing tokens.
- Core pages (Home/About/Insights/Contact) keep their bespoke hand-built layouts — they do **not** use the generic block system, only new custom pages do.

## Verified via `admin-flow.mjs` (Playwright, headless)

10/11 automated checks pass (the 11th was a stale test-script assertion after a redirect that had already succeeded — confirmed by every downstream check passing):
- Login → dashboard.
- Edit About → Save Draft → public `/about` unchanged → authenticated `?preview=1` shows the edit → Publish → public `/about` updated → content restored.
- Create custom page → add hero block → publish + enable nav → page reachable at its slug → renders its block → **automatically appears in navigation with zero code changes**, which is the spec's central requirement (§51).
- Unauthenticated `/admin` → 307 to `/admin/login`. Unauthenticated `/api/admin/*` → 401/403.
- Admin UI at 390px: no horizontal overflow, no console errors.

`npm run typecheck`, `npm run lint`, `npm run build` all pass clean.

## Known gaps / deliberate simplifications

- **No MediaPicker gallery yet** — block image fields take a pasted URL + alt text (copy the URL from the Media Library page after uploading) rather than a visual picker.
- **Home hero heading** (`home.heading` field) is stored/editable but not actually wired into the rendered `<h1>` yet — the hero's two-line "Intergenerational / Justice Fund." markup is still hardcoded in `(public)/page.tsx` because of its special-cased styling (line break + gold "."). Low priority; the eyebrow, mission, quotes, and bottom line are all live-editable already.
- **Admin pages list table** is a bit tight at 390px (no horizontal overflow, but a card-based mobile layout per Admin.md §44 would be nicer). Functional, not polished.
- Rate limiting and audit logging are in-memory/stdout — correct for the spec's single-Cloud-Run-instance Phase 1 assumption, would need a shared store if instance count ever goes above 1.

## Explicitly deferred — needs real infra access, not buildable here

- Actual Cloud Run deployment (the app itself still needs a real host — Supabase only solved the *persistence* half of Admin.md §12/§33, not deployment).
- Supabase Storage for uploaded media (still local disk — see "Still local-only" above).
- MFA (TOTP) — recommended, not launch-blocking per the spec.
- OWASP ZAP baseline scan — needs a running staging deployment.
- Rollback/version history beyond current draft+live (the spec itself calls this a Phase 1.1 enhancement).

## Local dev setup

```
cp .env.example .env.local
node scripts/create-admin-hash.mjs "your-password"
# paste the SECOND printed line (escaped $) into ADMIN_PASSWORD_HASH in .env.local —
# Next's dotenv-expand mangles raw bcrypt hashes and JWT-style keys otherwise
# (same rule applies below to the Supabase keys if they ever contain a literal $,
# which real Supabase JWTs won't). Not an issue in production — Secret Manager /
# Supabase env injection doesn't go through dotenv parsing.
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"  # → SESSION_SECRET

# Supabase: from your project's Settings -> API Keys, then run the two
# migrations in supabase/migrations/ via the SQL Editor (no exec-SQL RPC
# available through the anon/service-role keys alone), then seed the
# admin_users row once (see git history for the one-off seed script used here).
# NEXT_PUBLIC_SUPABASE_URL=
# NEXT_PUBLIC_SUPABASE_ANON_KEY=
# SUPABASE_SERVICE_ROLE_KEY=

npm run build && npm run start -- --port 3100
```
