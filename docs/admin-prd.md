# IEJF Admin Portal — PRD

**Status:** v1 shipped and manually verified, 18 September 2026. This describes what was actually built. For the original ask, see `docs/project-brief/Admin.md`; for a fuller architecture proposed afterward but not yet built, see `docs/project-brief/Supabase.md`. Where this document and those disagree, this one reflects reality.

## 1. Purpose

IEJF staff need to update website content and add new pages without asking a developer to edit code and redeploy. That's the entire reason this exists — not feature completeness for its own sake, not a general-purpose CMS.

## 2. Users

- **The admin** (currently: one account, `admin_users` table). Non-technical; the UI assumes no knowledge of JSON, Markdown, git, or deployment.
- **The public visitor** — never sees draft content, never sees `/admin`, never sees an error that leaks implementation detail.
- **The developer** (future maintainer) — the one audience this PRD and `docs/admin-readme.md` are actually written for, since the admin themself never reads source docs.

## 3. Scope — what v1 actually does

### 3.1 Content editing
- Home, About, Contact: their real editable fields (mission text, focus areas + ABNs, contact location/email, home-page news quotes) are live-editable through dedicated forms, not generic blocks.
- Insights: a repeatable list of entries (title, category, summary, image, status, order) — add/remove/reorder/publish independently of any page.
- Custom pages: title, slug (fixed after creation), nav label, nav visibility, status, SEO title/description, and a body built from six block types (Hero, RichText, ImageText, CardGrid, Quote, CTA).

### 3.2 Page lifecycle
- Create → always starts `draft` + hidden from nav (Admin.md §50's recommended safe default, applied unconditionally — the create form's own status/nav-visibility inputs are ignored server-side on purpose).
- Save Draft → writes to the `draft` copy of the content document. Never touches `live`.
- Preview → `?preview=1` on the real public URL, authenticated-only, shows a "Draft Preview" banner, renders through the exact same components the public page uses.
- Publish → copies the whole `draft` document to `live`, re-validates on the way, revalidates the affected Next.js routes.
- Delete → custom pages only, requires a confirmation dialog and an explicit `confirm: true` in the request body (client-side confirmation isn't trusted as the only gate). Core pages return 403 from the API regardless of what the client sends.

### 3.3 Navigation
Never hardcoded. Both desktop and mobile nav, and the footer nav, derive from the same `pages[]` array: `status === 'published' && showInNavigation`, sorted by `navOrder`. A newly published + nav-enabled page appears with zero code change — this was the one requirement explicitly called "central" in Admin.md §51, and it's the most heavily tested part of the system.

### 3.4 Media
Upload validates by inspecting actual file bytes (magic-byte sniffing: JPEG/PNG/WebP only, regardless of claimed MIME type or extension), then re-encodes through `sharp` before storing — this strips EXIF and neutralizes polyglot files as a side effect of full pixel re-decoding, not a separate step. 8MB cap. Files go to a Supabase Storage bucket + a `media` metadata table when Supabase is configured, local disk otherwise. Deleting a still-referenced image warns instead of silently breaking a page.

### 3.5 Auth & security actually implemented
- Bcrypt-hashed password, checked against a dummy hash even when the email doesn't match anything (no timing signal for "does this account exist").
- Signed session cookie: HttpOnly, Secure, SameSite=Strict, 8-hour expiry.
- Every `/api/admin/*` write checks the session **inside the handler**, before any read or write — not relying on the layout redirect or client-side state as the actual gate.
- Origin-header check on state-changing requests (the CSRF defense actually implemented, not a token scheme).
- Login rate limiting: 5 failed attempts / 15 minutes, in-memory (correct for a single instance; would need a shared store if that ever changes).
- CSP + standard security headers on every response.
- Rich text is sanitized to an explicit allow-list, both on save and again at render time.

## 4. Explicitly not built (and why that's a real gap, not an oversight)

These are named directly in `docs/project-brief/Supabase.md` as part of "done" and are **not** actually done:

- **Real Supabase Auth.** Auth is still hand-rolled bcrypt + custom session cookie; the `admin_users` table is just a credential lookup, not `auth.users`/`profiles`/roles. Adding a second admin today means inserting a row — there's no invite flow, no role distinction, no self-service password reset.
- **Database-enforced RLS.** RLS is *enabled* on every table but has *zero policies* — meaning only the server-side service-role key can touch anything, and the public site's "only show published content" rule is enforced by my Next.js code, not by Postgres. If that code has a bug, there's no database-level backstop.
- **Normalized schema.** Content is one `jsonb` blob per version (`site_content` table), not the `pages` / `page_blocks` / `insights` / `site_settings` tables Supabase.md describes. This makes partial queries and fine-grained indexing impossible — every read/write moves the whole document.
- **Revision history.** Publishing overwrites `live` with no snapshot. No rollback UI, no history list. A bad publish can only be fixed by manually re-editing back to the previous state.
- **Persisted audit log.** Login/publish/delete events go to `console.log` (Cloud Logging-ready in a real deployment) but there's no `audit_logs` table an admin can browse.
- **Site settings table.** Things like the contact email live inside the Contact page's own fields, not a generic reusable settings store.
- **MFA, revalidateTag-based granular cache invalidation, contact-form submission storage** — none of these were in scope for v1 either.

## 5. Non-functional requirements met

- Typecheck/lint/build all pass clean as of every commit touching this system.
- Mobile admin UI tested at 390px: no horizontal overflow, no console errors.
- Reorder controls are up/down buttons, not drag-only (keyboard-accessible per the explicit accessibility requirement in both source specs).
- Unsaved-changes warning on every editor (`beforeunload`).

## 6. Verification performed

A scripted Playwright flow (not committed as a formal test file — see `docs/admin-readme.md` "Testing") covering: login, dashboard content, edit-About → save-draft → verify-live-unchanged → authenticated-preview-shows-edit → publish → verify-live-updated, create-custom-page → add-hero-block → publish+enable-nav → page-reachable-at-slug → **auto-appears-in-nav**, unauthenticated `/admin` → 307 redirect, unauthenticated API → 401/403, mobile responsive check. All passed on the last full run.

## 7. Open question

Whether to close the gap in §4 by rebuilding to match `Supabase.md` (normalized tables, real Supabase Auth, enforced RLS, revisions, audit table — a substantial rewrite of working code) or to leave the current simpler shape as the accepted v1 architecture and cherry-pick individual pieces (e.g. just revision history) if/when actually needed. Not decided — flagged, not resolved, as of this writing.
