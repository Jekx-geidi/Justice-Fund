# IEJF Admin Portal — README

A `/admin` CMS layered on top of the public IEJF site, letting a signed-in admin edit content and add new pages without a code change or redeploy. Built against `docs/project-brief/Admin.md`; current status/known gaps are tracked separately in `docs/admin-build-status.md` — read that alongside this file, it's the source of truth for what's actually finished versus deferred.

## Quick start

```bash
cp .env.example .env.local
```

Fill in `.env.local`:

- `ADMIN_EMAIL` / `ADMIN_PASSWORD_HASH` — only used as a fallback when Supabase isn't configured. Generate a hash with `node scripts/create-admin-hash.mjs "your-password"` and paste the **second** printed line (the one with `\$` escaped) — Next's `.env.local` loader does `$VAR` expansion and mangles a raw bcrypt hash otherwise. Not an issue in real deployment, where secrets are injected as plain env vars with no dotenv parsing.
- `SESSION_SECRET` — `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`.
- `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` / `SUPABASE_SERVICE_ROLE_KEY` — from the Supabase project's Settings → API Keys. Once these are set, Supabase becomes the content/auth/media backend automatically (see "Storage adapters" below) — no code change needed to switch.

Then run the three migrations in `supabase/migrations/` (in order) via the Supabase SQL Editor — the service-role key can read/write rows but can't run DDL, so table creation has to go through the dashboard or `psql`, not the app:

1. `0001_site_content.sql`
2. `0002_admin_users.sql`
3. `0003_media.sql`

Seed one admin account into `admin_users` (there's no UI for this yet — it's a one-time bootstrap step):

```js
// one-off, run with `node` from the project root
import { createClient } from '@supabase/supabase-js';
const client = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
await client.from('admin_users').insert({ email: 'you@example.com', password_hash: '<bcrypt hash>' });
```

Create the `IMAGES IEJF` Storage bucket in the Supabase dashboard (Storage → New bucket → public) before testing uploads — same limitation, bucket creation isn't exposed through the service-role REST API either.

```bash
npm run build && npm run start -- --port 3100
```

Sign in at `/admin/login`.

## Architecture

### Content model

Everything the public site renders and the admin edits lives in one `SiteContent` document (`src/lib/content/types.ts`): a `pages[]` array plus a top-level `insights[]` array. Each `SitePage` is either:

- **Core** (`isCore: true`, `coreKey: 'home' | 'about' | 'insights' | 'contact'`) — Home/About/Contact carry their own typed field bags (`home`, `about`, `contact` on `SitePage`) because their layouts are bespoke hand-built React (hero photo composition, focus-grid, contact-grid with decorative circles) — they do **not** use the generic block system. This was a deliberate simplification versus Admin.md's implication that everything is block-based; rewriting the polished existing UI into generic blocks wasn't worth it for four pages with fixed layouts.
- **Custom** (`isCore: false`) — anything created through `/admin/pages/new`. These render entirely through `blocks: ContentBlock[]` (Hero/RichText/ImageText/CardGrid/Quote/CTA — `src/ui/blocks/`), which is what keeps new pages visually consistent with the rest of the site without a page-specific component.

`Insights` entries are a separate repeatable collection (`InsightEntry[]`), not pages — they don't get their own route, just cards on the `/insights` page.

### Draft vs. live

Two copies of the whole document: `draft` and `live`. Admin edits always write to `draft`. `Publish` copies `draft` → `live` and stamps `publishedAt`. Public routes read `live`; `?preview=1` (authenticated-only) reads `draft` and shows a "Draft Preview" banner, reusing the exact same page components rather than a separate preview renderer.

### Storage adapters

`src/lib/content/content.ts` is the single choke point everything reads/writes through — no page or admin route touches storage directly. It picks a backend at runtime:

```
isSupabaseConfigured() → storage-supabase.ts (site_content table, one row per version, whole document as jsonb)
                        ↘ storage-local.ts (data/content.live.json / content.draft.json — gitignored, dev fallback)
```

Same pattern for media: `src/lib/media/upload.ts` + `library.ts` write to the Supabase Storage bucket + `media` table when configured, or `public/uploads/` + `data/media.json` otherwise. If a real backend needs swapping later (a different provider, a normalized schema per Supabase.md), this is the seam — implement the same interface, change one `isXConfigured()` check, nothing above it moves.

### Auth

Not Supabase Auth — a hand-rolled bcrypt + HMAC-signed session cookie (`src/lib/auth/`), deliberately, to avoid pulling in a second auth system for a single admin account. `findAdminByEmail` checks the `admin_users` table when Supabase is configured, env vars otherwise. Every `/api/admin/*` route calls `requireAdminSession` at the top of the handler — that's the actual enforcement point, not `admin/(protected)/layout.tsx`'s redirect (that's just UX; a compromised client can't bypass the handler check).

### Directory map

```
src/lib/content/     — types, Zod schemas, seed data, storage adapters, the content service
src/lib/auth/        — password hashing, sessions, admin credential lookup, rate limiting
src/lib/security/    — audit log, Origin-based CSRF check, rich-text sanitizer
src/lib/media/       — upload validation/re-encoding, media library (Supabase or local)
src/app/(public)/    — the public site; reads content service, never storage directly
src/app/admin/       — /admin/login (unguarded) + (protected)/ (the real auth-gated shell)
src/app/api/admin/   — every write goes through here, each handler self-guarded
src/ui/admin/        — admin-only React components (editors, publish bar, block editor, ...)
src/ui/blocks/        — public renderers for the six block types, used only by custom pages
supabase/migrations/ — the three SQL files; run manually, no migration runner wired up
```

## Common tasks

**Add a field to a core page** (e.g. a new Home field): add it to `HomeFields` in `types.ts`, to `homeFieldsSchema` in `schemas.ts`, to the seed in `seed.ts`, render it in `(public)/page.tsx`, and add an input to `HomeFieldsEditor` in `CoreContentEditors.tsx`. The draft-save path (`PUT /api/admin/content/draft`) already handles arbitrary `home`/`about`/`contact` patches, so no API change needed.

**Add a new block type**: add the type to `ContentBlock` in `types.ts` and its Zod schema in `schemas.ts`, add a case to `BlockFields` in `BlockEditor.tsx` (admin editing) and a new file in `src/ui/blocks/` + a case in `BlockRenderer.tsx` (public rendering).

**Add an admin API operation**: put the `requireAdminSession(request)` check as the very first line, before anything else. Validate the body with a Zod schema from `content/schemas.ts` before touching storage.

## Testing

```bash
npm run typecheck
npm run lint
npm run build
```

There's no automated test suite for the admin flows yet — verification so far has been a manual Playwright script driving login → edit → save-draft → preview → publish → create-page → auto-nav-append (see `docs/admin-build-status.md` for what it covered). Worth turning into a real Playwright test file if this keeps growing.

## Related docs

- `docs/admin-build-status.md` — what's done, what's known-broken/simplified, what's explicitly deferred. Read before assuming a feature works.
- `docs/admin-prd.md` — what this thing is *for* and its actual (not aspirational) scope.
- `docs/project-brief/Admin.md` — the original spec this was built against. Not everything in it shipped; `admin-build-status.md` explains the deliberate deviations.
- `docs/project-brief/Supabase.md` — a fuller architecture (normalized schema, real Supabase Auth, DB-enforced RLS, revision history) proposed *after* the current simpler version was already built and working. Not yet reconciled — see the open question in `admin-prd.md`.
