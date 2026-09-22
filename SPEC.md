# SPEC — Revert public site to Yudi's approved mockup

## Origin

Client (April French, IEJF) reviewed the current build and asked, verbatim
(email "Re: First Draft - website", 2026-09-22):

> "I'd like to revert back to the font, style of the Mock up, no photos, no
> catch phrases - just the wording we provided."

This supersedes the current public site's photo-heavy "editorial" visual
design in favour of the originally approved mockup's visual language. The
mockup file is `docs/approved-content.html` (confirmed byte-identical to
`IEJF_Website_Mockup_v2 1.html`, the filename referenced in the build
process — see `AGENTS.md`).

## Scope

**In scope:** the public-facing website only — Home, About, Insights,
Contact (`src/app/(public)/**`, `src/ui/pages/**`, `src/ui/Header.tsx`,
`src/ui/Editorial.tsx`'s `Footer`). Visual/typography/layout reversion to
match `docs/approved-content.html`.

**Out of scope — must keep working, unmodified in behaviour:**
- `/admin` and all its routes (Dashboard, Pages, Insights, Media, Settings)
- Admin authentication, MFA, sessions
- Supabase integration (schema, storage, persistence) — no migrations
- Draft / Preview / Publish workflow (`PageEditorClient`, live preview)
- CSRF/rate-limiting/sanitisation/audit-logging in API routes
- The CMS data-binding for every public field that survives this reversion

## Source-of-truth hierarchy (per AGENTS.md)

1. **Visual/layout**: `docs/approved-content.html` (the mockup).
2. **Wording**: IEJF's approved current content — i.e. whatever is already
   in the CMS today. Do not introduce new marketing copy, slogans, donation
   language, placeholder news quotes, or placeholder CTA language that isn't
   already present in current approved CMS content.
3. **Operational data**: current CMS/published data via `getSiteContent()`.

## Requirements

### R1 — Typography
Public site uses Poppins (matching the mockup), not Marcellus. Admin retains
its existing Marcellus/Material typography untouched.

### R2 — No decorative photography
Remove unnecessary decorative photos from the public Home and About pages
(hero photo, portrait cutout, about photo) per April's "no photos"
instruction. Do not delete the underlying CMS image fields (`home.heroImage`,
`about.image`) or Media Library/Storage assets — only stop rendering them
publicly. Insights entries may still show an admin-attached image (explicit
exception in AGENTS.md: "Insights content where an optional approved image
is part of the entry").

### R3 — No placeholder/catchphrase content
Remove the Home "In the news" quote-wall — it is explicitly marked
placeholder/unverified in both the mockup (`IN THE NEWS — PLACEHOLDER
QUOTES`) and the current code (`placeholder-badge`). Do not invent slogans,
donation language, or example Insights entries. Existing CMS fields that
back removed sections (e.g. `home.quotes`) stay in the schema/admin editor —
only the public rendering is dropped.

### R4 — Mockup layout/visual language
Home, About, Insights, and Contact are restyled to match the mockup's
structure: charcoal hero, restrained typography, narrow readable text width,
generous whitespace, simple header, paper/off-white content areas, subtle
gold accent, minimal borders, plain two-column layouts where the mockup uses
them (About intro, Contact). Colour tokens (`--ink #231F20`, `--paper
#F5F3F1`, `--gold #C9A15A`, `--slate #5B5758`) already match the mockup and
are not renamed.

### R5 — CMS binding preserved
Every public section that remains after this reversion continues to render
from `getSiteContent()` / the existing `HomeFields`/`AboutFields`/
`ContactFields`/`InsightEntry` types. No hardcoded strings replace editable
CMS fields. Admin's Live Preview (`PageEditorClient`) must keep rendering
through the same restyled view components (`HomePageView`, `AboutPageView`,
`InsightsPageView`, `ContactPageView`) — no separate preview implementation.

### R6 — Real routing kept
Public navigation keeps using real Next.js routes (`/`, `/about`,
`/insights`, `/contact`), not the mockup's client-side tab-switching script.

### R7 — Responsiveness
No horizontal overflow, readable line lengths, and clean stacking at
390/430/768/820/1024/1280/1440px after the restyle.

### R8 — Verification
`typecheck`, `lint`, `build` all pass after every change. Admin smoke test
(login, Pages editor, Save Draft → Preview → Publish) confirmed for at least
Home and About before this is considered done.

## Acceptance criteria

See `AGENTS.md`'s "ACCEPTANCE TESTS" section — reproduced in full there;
this SPEC does not duplicate it, it is binding as written.
