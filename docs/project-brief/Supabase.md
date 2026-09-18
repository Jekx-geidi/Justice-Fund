# IEJF Supabase Integration — Complete Build Specification
**Document:** `Supabase.md`  
**Project:** Intergenerational Justice Fund (IEJF) Website  
**Date:** 18 September 2026  
**Purpose:** Complete BRD, PRD, architecture, schema, security, migration, implementation, QA, UAT, deployment, and operational plan for moving the IEJF CMS from local JSON persistence to Supabase.

---

# 1. Executive Summary

The IEJF website currently has a working admin/CMS prototype that supports:

- editing existing website content;
- adding new pages;
- saving drafts;
- publishing content;
- automatically adding published pages to navigation.

The current limitation is persistence. The prototype stores content on local disk, for example:

```text
data/content.live.json
data/content.draft.json
```

This is acceptable for local development and QA, but it is not production-safe on Cloud Run or similar ephemeral environments. A restart, redeploy, or new instance can lose locally written content.

Supabase will replace local JSON as the persistent backend for:

- CMS content;
- admin authentication;
- media/image storage;
- page revisions;
- audit logging;
- site settings.

Target stack:

```text
Next.js
React
TypeScript
Tailwind CSS
Supabase Postgres
Supabase Auth
Supabase Storage
Cloud Run or equivalent host
```

The public app remains stateless. Supabase becomes the durable source of truth.

---

# 2. Core Requirement

> IEJF staff must be able to edit existing content and create new pages from `/admin`. Published pages marked for navigation must automatically appear on the public site without code changes or redeployment, and all changes must persist safely across restarts and deployments.

---

# 3. Business Requirements Document (BRD)

## 3.1 Business Problem

A plain static site requires a developer to edit source code and redeploy for every content change. The current CMS prototype removes this dependency, but local-file persistence is unsafe for production.

IEJF therefore needs a persistent CMS backend that allows non-technical staff to manage content securely.

## 3.2 Business Objectives

Supabase integration must:

1. persist CMS content permanently;
2. remove dependence on local JSON in production;
3. allow IEJF staff to edit content without code;
4. allow creation of new pages;
5. automatically update navigation from published page records;
6. support safe draft, preview, publish, and unpublish workflows;
7. support authenticated admin access;
8. persist uploaded media independently of app deployments;
9. provide revision/rollback capability;
10. support auditability and future multi-user roles.

## 3.3 Stakeholders

### IEJF
- Website administrator
- Content editors
- IEJF leadership
- Public visitors

### Geidi
- Developer
- Project manager/coordinator
- QA/UAT users
- Deployment/infrastructure support

## 3.4 Business Success Criteria

The solution is successful when:

- admin can log in securely;
- public content is read from Supabase;
- content edited in `/admin` survives redeploy/restart;
- custom pages persist;
- published pages can automatically appear in navigation;
- uploaded images persist;
- drafts remain private;
- unauthorised users cannot write CMS data;
- core UAT scenarios pass.

## 3.5 Out of Scope for Initial Supabase Integration

Unless later approved:

- ecommerce;
- donation/payment processing;
- public user accounts;
- unrestricted website builder;
- arbitrary HTML/JavaScript injection;
- multilingual CMS;
- advanced analytics dashboard;
- complex multi-step editorial approvals.

---

# 4. Product Requirements Document (PRD)

## 4.1 Product Scope

Supabase must power the existing `/admin` CMS while preserving the approved public website UI/UX.

Initial core public pages:

1. Home
2. About
3. Insights
4. Contact

Future pages are created through `/admin`.

## 4.2 Admin Capabilities

Admin must be able to:

- sign in/out;
- view all pages;
- edit core pages;
- create custom pages;
- edit custom pages;
- save drafts;
- preview drafts;
- publish/unpublish;
- control navigation visibility;
- reorder navigation;
- upload/select media;
- manage Insights;
- update site settings;
- view revision history if enabled;
- restore a previous revision if rollback is implemented.

## 4.3 Public Behaviour

Public visitors must only receive:

- published pages;
- published Insights;
- public site settings;
- public media.

Draft/unpublished CMS content must not leak publicly.

---

# 5. Supabase Responsibilities

Supabase provides three main services.

## 5.1 Database

Recommended tables:

```text
profiles
pages
page_blocks
insights
site_settings
media
page_revisions
audit_logs
```

## 5.2 Auth

Used for:

- `/admin/login`;
- sessions;
- password reset;
- future roles such as admin/editor/viewer.

## 5.3 Storage

Used for:

- hero images;
- page imagery;
- Insights imagery;
- shared website media.

Recommended bucket:

```text
iejf-media
```

---

# 6. High-Level Architecture

```text
Public Browser
     |
     v
Next.js Public Website
     |
     +-------------------+
     |                   |
     v                   v
Supabase Database   Supabase Storage
     ^                   ^
     |                   |
     +---------+---------+
               |
               v
            /admin
               |
               v
         Supabase Auth
```

The app host can restart or scale without losing CMS data.

---

# 7. Data Model Overview

```text
auth.users
    |
    v
profiles

pages
  |
  +--> page_blocks
  |
  +--> page_revisions

insights

site_settings

media

audit_logs
```

---

# 8. Database Schema

## 8.1 `profiles`

Purpose: role/profile metadata linked to Supabase Auth.

Suggested fields:

```sql
id uuid primary key references auth.users(id)
email text
display_name text
role text not null default 'admin'
is_active boolean not null default true
created_at timestamptz default now()
updated_at timestamptz default now()
```

Recommended roles:

```text
admin
editor
viewer
```

Phase 1 can use only `admin`.

---

## 8.2 `pages`

Purpose: core pages and custom pages.

Suggested fields:

```sql
id uuid primary key default gen_random_uuid()
title text not null
slug text not null unique
nav_label text not null
is_core boolean not null default false
show_in_navigation boolean not null default false
nav_order integer not null default 999
status text not null default 'draft'
seo_title text
seo_description text
created_by uuid references auth.users(id)
updated_by uuid references auth.users(id)
created_at timestamptz default now()
updated_at timestamptz default now()
published_at timestamptz
```

Allowed status values:

```text
draft
published
unpublished
archived
```

Recommended constraint:

```sql
check (status in ('draft','published','unpublished','archived'))
```

---

## 8.3 `page_blocks`

Purpose: structured sections for each page.

Suggested fields:

```sql
id uuid primary key default gen_random_uuid()
page_id uuid not null references pages(id) on delete cascade
block_type text not null
sort_order integer not null default 0
content jsonb not null default '{}'::jsonb
is_visible boolean not null default true
created_at timestamptz default now()
updated_at timestamptz default now()
```

Supported block types:

```text
hero
rich_text
image_text
card_grid
quote
cta
divider
```

This controlled block model keeps new pages visually consistent.

---

# 9. Block Content Models

## 9.1 Hero

```json
{
  "eyebrow": "INTERGENERATIONAL JUSTICE",
  "heading": "Intergenerational Justice Fund",
  "body": "We use the law to drive systemic change...",
  "image_url": null,
  "image_alt": null,
  "alignment": "left"
}
```

## 9.2 Rich Text

```json
{
  "heading": "About us",
  "body": "<p>Sanitised approved content.</p>"
}
```

## 9.3 Image + Text

```json
{
  "heading": "Environment",
  "body": "We advance the protection...",
  "image_url": "https://...",
  "image_alt": "Nature landscape",
  "image_side": "right"
}
```

## 9.4 Card Grid

```json
{
  "heading": "Our work is anchored in three complementary focus areas",
  "cards": [
    {"title": "Environment", "body": "..."},
    {"title": "Health", "body": "..."},
    {"title": "Human Rights", "body": "..."}
  ]
}
```

## 9.5 Quote

```json
{
  "quote": "Example quotation",
  "attribution": "Source"
}
```

## 9.6 CTA

Only if approved by IEJF.

```json
{
  "heading": "CTA heading",
  "body": "CTA body",
  "button_label": "Learn more",
  "button_url": "/about"
}
```

---

# 10. `insights` Table

Purpose: repeatable Insights content.

Suggested fields:

```sql
id uuid primary key default gen_random_uuid()
title text not null
slug text unique
category text
excerpt text
body jsonb
featured_image_url text
featured_image_alt text
status text not null default 'draft'
sort_order integer not null default 0
created_by uuid references auth.users(id)
updated_by uuid references auth.users(id)
created_at timestamptz default now()
updated_at timestamptz default now()
published_at timestamptz
```

Launch state may remain blank/placeholder.

---

# 11. `site_settings` Table

Purpose: global editable website settings.

Suggested fields:

```sql
id uuid primary key default gen_random_uuid()
setting_key text unique not null
setting_value jsonb not null
updated_by uuid references auth.users(id)
created_at timestamptz default now()
updated_at timestamptz default now()
```

Recommended settings:

```text
organisation_name
contact_email
location
footer_text
default_seo_title
default_seo_description
logo_url
```

Do not store secrets here.

---

# 12. `media` Table

Purpose: metadata for files in Supabase Storage.

Suggested fields:

```sql
id uuid primary key default gen_random_uuid()
bucket text not null default 'iejf-media'
path text not null unique
public_url text
file_name text
mime_type text
file_size bigint
alt_text text
uploaded_by uuid references auth.users(id)
created_at timestamptz default now()
```

---

# 13. `page_revisions` Table

Purpose: publication history and rollback.

Suggested fields:

```sql
id uuid primary key default gen_random_uuid()
page_id uuid not null references pages(id) on delete cascade
revision_number integer not null
page_snapshot jsonb not null
blocks_snapshot jsonb not null
created_by uuid references auth.users(id)
created_at timestamptz default now()
is_published_snapshot boolean not null default false
```

---

# 14. `audit_logs` Table

Purpose: record important admin actions.

Suggested fields:

```sql
id uuid primary key default gen_random_uuid()
user_id uuid references auth.users(id)
action text not null
resource_type text
resource_id uuid
metadata jsonb
created_at timestamptz default now()
```

Recommended events:

```text
page_created
page_updated
draft_saved
page_published
page_unpublished
page_archived
media_uploaded
media_deleted
insight_created
insight_published
settings_updated
```

Never store passwords or tokens.

---

# 15. Core Page Seed Data

Initial records:

## Home

```text
slug: /
nav_label: Home
is_core: true
show_in_navigation: true
nav_order: 1
status: published
```

## About

```text
slug: about
nav_label: About
is_core: true
show_in_navigation: true
nav_order: 2
status: published
```

## Insights

```text
slug: insights
nav_label: Insights
is_core: true
show_in_navigation: true
nav_order: 3
status: published
```

## Contact

```text
slug: contact
nav_label: Contact
is_core: true
show_in_navigation: true
nav_order: 4
status: published
```

Seeding must never overwrite later admin edits.

---

# 16. Navigation Generation

Navigation must not be hardcoded.

Required logic:

```ts
const menuItems = pages
  .filter(page =>
    page.status === "published" &&
    page.show_in_navigation === true
  )
  .sort((a, b) => a.nav_order - b.nav_order);
```

Desktop and mobile navigation must share the same source.

New-page default:

```text
status: draft
show_in_navigation: false
nav_order: last
```

After publish + navigation enable, it appears automatically.

---

# 17. Dynamic Page Rendering

Recommended route:

```text
app/[slug]/page.tsx
```

Behaviour:

```text
published page -> render
only draft -> 404
unpublished -> 404
unknown slug -> 404
```

Draft preview uses a protected admin preview route or Next.js Draft Mode.

---

# 18. Supabase Auth

## 18.1 Launch Model

Initial launch may use one admin account.

Future-ready roles:

```text
admin
editor
viewer
```

## 18.2 Flow

```text
/admin/login
   |
   v
Supabase Auth
   |
   v
profile/role check
   |
   v
/admin
```

## 18.3 Required Behaviour

- unauthenticated users cannot access admin;
- expired sessions redirect to login;
- inactive users cannot edit;
- public self-registration should be disabled unless approved;
- password reset should use Supabase secure flow.

MFA is strongly recommended for production admins.

---

# 19. Row Level Security (RLS)

RLS must be enabled for all CMS tables.

Public visitors:

```text
SELECT published public content only
```

Authenticated admin:

```text
SELECT/INSERT/UPDATE/DELETE according to role
```

Service-role access is server-only.

---

# 20. RLS Policy Strategy

## Pages

Public SELECT only where:

```text
status = published
```

Admin can manage records.

## Page Blocks

Public SELECT only when:

```text
parent page is published
AND block is visible
```

## Insights

Public SELECT only where:

```text
status = published
```

## Site Settings

Public read only for settings explicitly safe to expose.

## Audit Logs

Public:

```text
no access
```

Admin:

```text
read
```

Writes preferably occur from trusted server-side logic.

---

# 21. Supabase Storage Plan

Recommended bucket:

```text
iejf-media
```

Suggested folders:

```text
home/
about/
insights/
pages/
shared/
```

Use generated safe paths instead of trusting raw user filenames.

Example:

```text
pages/<page-id>/hero-20260918.webp
```

---

# 22. Media Upload Rules

Allow initially:

```text
image/jpeg
image/png
image/webp
image/avif
```

Recommended maximum:

```text
5 MB
```

SVG should be disabled initially unless sanitisation is implemented.

Admin upload flow:

```text
Select file
-> validate MIME/type/size
-> upload to Supabase Storage
-> create media metadata record
-> select/use in content
```

---

# 23. Admin Workflow

```text
Login
  |
  v
Choose Page
  |
  v
Edit Content
  |
  v
Save Draft
  |
  v
Supabase persists draft
  |
  v
Preview
  |
  v
Publish
  |
  v
Revision snapshot + audit log
  |
  v
Revalidate public site
  |
  v
Live update
```

No code edit or redeploy required for content changes.

---

# 24. Publish Transaction

Recommended publish sequence:

1. validate page;
2. validate blocks;
3. sanitise rich text;
4. create revision snapshot;
5. update page status;
6. set `published_at`;
7. write audit log;
8. trigger Next.js revalidation.

Prefer a database transaction/function where practical so partial publication cannot occur.

---

# 25. Draft Preview

Draft preview must:

- require authenticated admin session;
- display a visible Draft Preview indicator;
- not be publicly indexable;
- never expose draft pages to anonymous visitors.

Suggested route:

```text
/admin/preview/[slug]
```

---

# 26. Supabase Client Separation

## Browser Client

Uses:

```text
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
```

The anon key is expected to be browser-visible; RLS provides access control.

## Server Client

Used for protected server operations.

If service role is needed:

```text
SUPABASE_SERVICE_ROLE_KEY
```

This key must never be exposed to client-side code.

---

# 27. Environment Variables

Recommended:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
SUPABASE_STORAGE_BUCKET=iejf-media
NEXT_PUBLIC_SITE_URL=
```

Rules:

- commit `.env.example` only;
- never commit `.env.local`;
- never expose service-role key;
- production secrets belong in deployment secret management.

---

# 28. Next.js Integration Structure

Recommended:

```text
lib/
└── supabase/
    ├── client.ts
    ├── server.ts
    ├── middleware.ts
    └── admin.ts
```

Responsibilities:

```text
client.ts -> browser client
server.ts -> SSR/server component client
middleware.ts -> auth/session handling
admin.ts -> trusted server-only admin operations
```

---

# 29. Recommended Repository Structure

```text
app/
├── (public)/
│   ├── page.tsx
│   ├── about/
│   ├── insights/
│   ├── contact/
│   └── [slug]/
│
├── admin/
│   ├── login/
│   ├── pages/
│   ├── insights/
│   ├── media/
│   ├── settings/
│   └── preview/
│
components/
├── public/
├── admin/
└── blocks/
│
lib/
├── supabase/
├── content/
├── validation/
├── security/
└── audit/
│
supabase/
├── migrations/
├── seed.sql
└── config.toml
```

---

# 30. Database Migrations

All production schema changes must use version-controlled migrations.

Recommended files:

```text
001_initial_schema.sql
002_rls_policies.sql
003_seed_core_pages.sql
004_page_revisions.sql
005_audit_logs.sql
```

Do not rely on manual dashboard-only changes as the source of truth.

---

# 31. Seed Rules

Initial seed may create:

- core pages;
- approved initial content;
- safe default settings.

Never automatically overwrite existing production content on app startup or deploy.

Production deploy must not run destructive reseeding.

---

# 32. Migration From Local JSON

Current source:

```text
data/content.live.json
data/content.draft.json
```

Migration process:

1. freeze CMS editing during migration;
2. export current live/draft content;
3. transform into `pages`, `page_blocks`, `insights`, and `site_settings`;
4. insert into Supabase;
5. validate counts/content;
6. switch content service to Supabase adapter;
7. test public site;
8. test admin save/publish;
9. redeploy/restart app;
10. verify content still exists;
11. remove local JSON as production write target.

Local JSON can remain only as dev fixtures or backup seed data.

---

# 33. Content Service Abstraction

Page components should not call Supabase directly everywhere.

Recommended service interface:

```ts
getPublishedPages()
getPageBySlug(slug)
getAdminPage(id)
createPage(input)
updatePage(id, input)
publishPage(id)
unpublishPage(id)
archivePage(id)
getPublishedInsights()
getSiteSettings()
```

This keeps implementation maintainable and testable.

---

# 34. Validation

Use server-side schema validation, recommended:

```text
Zod
```

Validate:

- title;
- slug;
- nav label;
- nav order;
- status;
- block type;
- block content shape;
- SEO fields;
- email;
- URLs;
- media metadata;
- image limits.

Client validation improves UX but does not replace server validation.

---

# 35. Slug Rules

Required:

- lowercase;
- hyphen-separated;
- unique;
- safe characters only.

Examples:

```text
research
our-work
future-generations
```

Reserved routes:

```text
admin
api
login
auth
_next
```

Core route collisions must be rejected.

---

# 36. Rich Text Security

Sanitise all rich text before rendering publicly.

Recommended allowed markup:

```text
p
h2
h3
strong
em
a
ul
ol
li
blockquote
```

Reject:

```text
script
iframe
object
embed
javascript: URLs
event-handler attributes
unsafe inline styles
```

---

# 37. Auth Security

Production requirements:

- intentional/invite-only admin creation;
- public self-registration disabled unless approved;
- strong password policy;
- session expiry;
- inactive-user blocking;
- optional/strongly recommended MFA;
- no service-role key in browser.

---

# 38. Roles

Phase 1:

```text
admin
```

Future:

## Admin
- all content;
- publish;
- media;
- settings;
- user management if approved.

## Editor
- edit/save drafts;
- optional publish permission.

## Viewer
- read/preview only.

Do not over-engineer RBAC if one admin is sufficient at launch.

---

# 39. Delete / Archive Rules

## Core Pages

Home, About, Insights, Contact:

```text
cannot be permanently deleted
```

## Custom Pages

Recommended:

```text
Archive instead of hard delete
```

Archived pages disappear publicly and from navigation but remain recoverable.

---

# 40. Site Settings

Recommended admin-editable values:

```text
organisation name
contact email
location
footer text
default SEO title
default SEO description
logo
```

Never store API secrets, passwords, or service-role keys in this table.

---

# 41. Insights Requirements

Initial state may remain blank.

Future workflow:

```text
Add Insight
-> Edit
-> Save Draft
-> Preview
-> Publish
-> Unpublish/Archive
```

Public Insights queries published records only.

---

# 42. Public Performance

Do not load the entire CMS dataset on every request.

Examples:

```text
Home -> Home page + Home blocks + safe settings
Navigation -> published visible pages only
Insights -> published Insights only
```

Use Next.js caching and targeted revalidation.

---

# 43. Next.js Revalidation

After publish, invalidate only relevant data.

Recommended tag approach:

```text
navigation
pages
page:<slug>
insights
site-settings
```

Example concept:

```ts
revalidateTag("navigation");
revalidateTag(`page:${slug}`);
```

---

# 44. Cloud Run Compatibility

With Supabase:

```text
Cloud Run = application runtime
Supabase = persistent source of truth
```

Cloud Run can:

- restart;
- redeploy;
- scale to zero;
- create a new instance;

without losing CMS data.

---

# 45. Relationship With Google Cloud Storage

If Supabase is approved as the complete CMS backend:

```text
Supabase Database = content source of truth
Supabase Storage = media source of truth
```

GCS is no longer required for CMS JSON persistence.

Do not maintain live CMS state in both GCS and Supabase unless there is a deliberate backup/replication requirement.

Choose one source of truth.

---

# 46. Backup and Recovery

Recommended layers:

1. Supabase database backups according to selected plan;
2. page revision history;
3. optional scheduled exports if required;
4. media backup policy if required.

Content rollback workflow:

```text
Page History
-> Select Revision
-> Restore as Draft
-> Preview
-> Publish
```

---

# 47. Error Handling

Examples:

```text
We couldn't save your changes.
Nothing has been published. Please try again.
```

```text
This page URL is already in use.
Choose a different URL.
```

```text
Your session has expired.
Please sign in again.
```

Never expose raw DB errors or stack traces to end users.

---

# 48. Loading and Save States

Required states:

```text
Loading
Saving
Saved
Publishing
Published
Uploading
Upload complete
```

Disable duplicate publish actions while publication is running.

---

# 49. Unsaved Changes Protection

Warn admin before leaving an editor with unsaved changes.

Do not silently discard edits.

---

# 50. Accessibility Requirements

Target WCAG 2.1 AA practices.

Admin must support:

- keyboard access;
- visible focus;
- semantic forms;
- labelled inputs;
- accessible dialogs;
- clear errors;
- accessible reorder controls;
- sufficient contrast.

---

# 51. Responsive Admin Requirements

Test at least:

```text
320
375
390
430
768
820
1024
1280
1440
1920 px
```

Mobile:

- drawer navigation;
- one-column forms;
- full-width fields;
- no horizontal overflow.

Tablet:

- intentional editor layout;
- collapsible navigation.

Desktop:

- sidebar;
- wide editing workspace;
- optional preview pane.

---

# 52. Security Checklist

Before production:

- [ ] RLS enabled on CMS tables;
- [ ] no anonymous writes;
- [ ] service-role key server-only;
- [ ] public self-registration disabled unless approved;
- [ ] server-side validation active;
- [ ] rich text sanitised;
- [ ] upload type/size validation active;
- [ ] admin route protected;
- [ ] sessions handled securely;
- [ ] audit logging active;
- [ ] CSP/security headers active;
- [ ] dependency audit reviewed;
- [ ] secret scanning reviewed;
- [ ] staging security test complete.

---

# 53. Implementation Plan

## Phase 0 — Preparation

- confirm Supabase project;
- confirm region;
- confirm dev/staging/prod strategy;
- identify admin users;
- confirm whether Supabase fully replaces GCS CMS persistence.

## Phase 1 — Schema

- create tables;
- create constraints;
- create indexes;
- create migrations.

## Phase 2 — Security

- enable RLS;
- create public read policies;
- create admin write policies;
- configure Storage policies.

## Phase 3 — Seed

- insert Home;
- insert About;
- insert Insights;
- insert Contact;
- insert approved initial settings.

## Phase 4 — Auth

- connect `/admin/login`;
- add protected admin session handling;
- create profile role logic.

## Phase 5 — Content Adapter

- build Supabase content service;
- replace local JSON read/write;
- preserve current admin UI.

## Phase 6 — Dynamic Navigation

- read published visible pages from database;
- use same data for desktop/mobile menus.

## Phase 7 — Dynamic Pages

- connect `[slug]` route;
- render page blocks;
- enforce published-only public access.

## Phase 8 — Media

- configure `iejf-media` bucket;
- connect upload/picker;
- save metadata;
- add alt-text workflow.

## Phase 9 — Insights

- connect Insights editor and public query.

## Phase 10 — Revisions and Audit

- save snapshots on publish;
- log important admin actions.

## Phase 11 — Migrate Existing JSON

- import current content;
- validate exact copy;
- switch production source of truth.

## Phase 12 — QA/UAT

- functional tests;
- security tests;
- responsive admin tests;
- persistence restart test.

## Phase 13 — Production Cutover

- set production environment variables;
- deploy;
- validate content;
- verify restart persistence;
- retire local JSON production writes.

---

# 54. Mandatory Restart Persistence Test

This specifically proves the local-disk problem is solved.

1. log into `/admin`;
2. edit a unique text value;
3. publish;
4. verify public site;
5. restart/redeploy app;
6. verify content remains;
7. create a new page;
8. publish and show in navigation;
9. redeploy again;
10. verify page and navigation remain.

---

# 55. Functional UAT

## UAT-SUPA-01 — Login

Valid admin can log in.

## UAT-SUPA-02 — Unauthenticated Access

Unauthenticated visitor cannot open protected admin screens.

## UAT-SUPA-03 — Edit Home

Admin edits Home and saves draft; change persists in Supabase.

## UAT-SUPA-04 — Publish Home

Published change appears publicly.

## UAT-SUPA-05 — Restart Persistence

After restart/redeploy, published change remains.

## UAT-SUPA-06 — Add Page

Admin creates `Research`; database record persists.

## UAT-SUPA-07 — Draft Safety

Draft Research does not appear publicly.

## UAT-SUPA-08 — Automatic Navigation

Published Research with navigation enabled appears automatically in desktop and mobile nav.

## UAT-SUPA-09 — Reorder Navigation

Changing `nav_order` changes public nav order.

## UAT-SUPA-10 — Media Upload

Valid image uploads to Supabase Storage and remains usable after redeploy.

## UAT-SUPA-11 — Invalid Media

Unsupported files are rejected.

## UAT-SUPA-12 — RLS Protection

Anonymous write attempt is rejected.

## UAT-SUPA-13 — Insights

Published Insight appears on public Insights page.

## UAT-SUPA-14 — Revision

Publishing creates a revision snapshot.

## UAT-SUPA-15 — Session Expiry

Expired session blocks writes and requires login again.

---

# 56. Database Test Cases

Test:

- duplicate slug rejected;
- invalid status rejected;
- required title enforced;
- anonymous insert rejected;
- public query returns published only;
- draft excluded from navigation;
- archive excluded from navigation;
- duplicate setting key rejected;
- block ordering respected;
- core page cannot be permanently deleted through app flow.

---

# 57. Recommended Indexes

```sql
create unique index pages_slug_idx on pages(slug);
create index pages_public_nav_idx on pages(status, show_in_navigation, nav_order);
create index page_blocks_page_sort_idx on page_blocks(page_id, sort_order);
create index insights_public_idx on insights(status, sort_order, published_at);
create index revisions_page_idx on page_revisions(page_id, revision_number desc);
create index audit_created_idx on audit_logs(created_at desc);
```

Review actual query plans before final tuning.

---

# 58. CI/CD Requirements

Recommended PR pipeline:

```text
npm ci
npm run lint
npm run typecheck
npm run test
npm run build
```

Database migration rules:

- migrations version-controlled;
- apply to staging first;
- production migration is controlled;
- never auto-reset production DB;
- never auto-reseed live content destructively.

---

# 59. Environments

Recommended:

```text
Local
Staging
Production
```

Prefer separate Supabase projects for staging and production.

Do not use production for routine local development or automated testing.

---

# 60. Observability

Track:

- Supabase API failures;
- auth failures;
- publish failures;
- storage upload failures;
- revalidation failures;
- content query failures.

Use host logs plus Supabase logs together.

---

# 61. Rollback Strategy

## Bad Content Publish

```text
Page History
-> Previous Revision
-> Restore as Draft
-> Preview
-> Publish
```

## Bad App Deployment

Rollback app version. Supabase content remains independent and intact.

---

# 62. Definition of Done

Supabase integration is complete when:

- [ ] schema exists via migrations;
- [ ] RLS is enabled and tested;
- [ ] Supabase Auth protects `/admin`;
- [ ] existing page content loads from Supabase;
- [ ] admin saves to Supabase;
- [ ] publish persists;
- [ ] app restart does not lose content;
- [ ] custom page creation persists;
- [ ] automatic navigation works;
- [ ] Insights works;
- [ ] media upload works;
- [ ] media survives redeploy;
- [ ] site settings persist;
- [ ] revisions are recorded;
- [ ] audit logging works;
- [ ] secrets are secured;
- [ ] local JSON is not production source of truth;
- [ ] UAT passes.

---

# 63. Claude / AI Coding Guardrails

When implementing this specification:

1. inspect the existing CMS first;
2. preserve the approved public UI;
3. do not rebuild the admin UI unnecessarily;
4. replace persistence behind the content-service layer;
5. do not hardcode navigation;
6. do not expose the service-role key;
7. enable and test RLS;
8. use version-controlled migrations;
9. validate all mutations server-side;
10. sanitise rich text;
11. never expose draft pages publicly;
12. new pages default to Draft + hidden navigation;
13. core pages cannot be deleted;
14. do not reseed production on app startup;
15. test restart/redeploy persistence;
16. document all environment variables;
17. keep local JSON only as dev fixture/backup if required;
18. do not create dual live sources of truth unless explicitly approved.

---

# 64. Open Questions

Confirm before production:

1. Which Supabase organisation/project will host IEJF?
2. Which Supabase region?
3. Separate staging and production projects?
4. One admin or multiple admins at launch?
5. Is MFA mandatory at launch?
6. Is Editor role required immediately?
7. Should revision rollback be visible in admin at launch?
8. Public or private media bucket?
9. Maximum image file size?
10. Archive-only or permanent deletion for custom pages?
11. Can core pages be hidden from navigation?
12. Do Insights entries need dedicated detail pages?
13. Should contact submissions be stored in Supabase?
14. Should contact submissions send email notifications?
15. Is Supabase formally approved as the final source of truth instead of GCS?
16. Is scheduled external backup/export required?
17. Who owns production Supabase billing/credentials?
18. Who creates and manages admin accounts?

---

# 65. Optional Contact Form Extension

If later approved, add:

```text
contact_submissions
```

Suggested fields:

```sql
id uuid primary key default gen_random_uuid()
name text not null
email text not null
message text not null
status text not null default 'new'
created_at timestamptz default now()
```

Security:

- public SELECT denied;
- submissions preferably go through a server endpoint;
- spam protection/rate limiting required;
- email notification optional.

This is optional and separate from the core CMS requirement.

---

# 66. Final Recommended Architecture

```text
Next.js
+
TypeScript
+
Tailwind CSS
+
Supabase Auth
+
Supabase Postgres
+
Supabase Storage
+
Cloud Run
```

Supabase owns persistent CMS state.

The app host runs the application only.

---

# 67. Final Requirement Summary

```text
IEJF Admin
   |
   v
/admin
   |
   ├── Edit Existing Pages
   ├── Add New Page
   ├── Manage Insights
   ├── Upload Media
   ├── Save Draft
   └── Publish
          |
          v
       Supabase
          |
          ├── Database
          ├── Auth
          └── Storage
          |
          v
      Next.js Site
          |
          ├── Dynamic Content
          ├── Dynamic Pages
          └── Automatic Navigation
```

A restart, redeploy, scale-to-zero event, or new Cloud Run instance must never erase CMS content.

That is the key production objective of the Supabase integration.
