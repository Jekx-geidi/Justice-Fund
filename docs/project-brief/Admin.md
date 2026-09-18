# IEJF Admin Portal — Complete Build Specification
**Document:** `Admin.md`  
**Project:** Intergenerational Justice Fund (IEJF) Website  
**Date:** 17 September 2026  
**Purpose:** Business requirements, product requirements, architecture, UX, security, data model, API contract, QA/UAT, and implementation plan for the IEJF website administration portal.

---

# 1. Executive Summary

The IEJF website requires a secure `/admin` portal that allows authorised IEJF staff to manage public website content without editing code.

The public website initially contains the confirmed pages:

1. Home
2. About
3. Insights
4. Contact

The admin portal must support both:

- updating content inside existing pages; and
- creating entirely new pages.

When an admin publishes a new page and marks it visible in navigation, the page must automatically appear in the website navigation/menu without a code change or redeploy.

The admin system must preserve the approved IEJF visual design and page component system. Admin users manage content and page configuration, not arbitrary application code.

The launch architecture follows the project build brief:

- Next.js App Router
- TypeScript
- Tailwind CSS
- Google Cloud Run
- Google Cloud Storage for Phase 1 content persistence
- secure authenticated `/admin`
- migration-ready data-access layer for future Supabase adoption

The most important implementation change from a fixed four-page content object is that content storage must support a dynamic `pages[]` collection so future pages can be added without changing source code.

---

# 2. Source-of-Truth Rules

## 2.1 Initial public content

The initial public content must follow IEJF's confirmed 17 September 2026 content.

### Home
- Name: **Intergenerational Justice Fund**
- Mission:
  **We use the law to drive systemic change, targeting issues that will cause escalating harm to future generations if left unaddressed.**
- Remove the previously proposed **Support our work** / **About IEJF** hero buttons.
- Add at the bottom:
  **Intergenerational Environment Justice Fund (ABN 51 656 623 719)**

### About
Use the approved IEJF body content and the three focus areas:

- Environment
- Health
- Human Rights

Each focus area includes its own entity/ABN information and must remain editable.

### Insights
- Launch as blank/placeholder.
- Admin must be able to add entries later.

### Contact
- Perth, WA
- hello@justicefund.org.au
- Remove the separate **Get in touch** promotional box.
- The actual contact-form behaviour remains subject to final implementation confirmation.

## 2.2 Admin-generated pages

New pages created later must not overwrite or silently modify the approved original pages.

New content should inherit the site's approved design system and responsive behaviour.

---

# 3. Business Requirements Document (BRD)

## 3.1 Business Problem

IEJF staff need to keep the website current without relying on a developer for every text, image, insight, or page update.

A static website would require source-code changes and deployment for routine content maintenance. This creates unnecessary dependency on the development team and makes future content growth slower.

The admin portal solves this by allowing authorised staff to:

- edit existing page content;
- publish updates safely;
- create new pages;
- manage whether new pages appear in navigation;
- manage Insights content;
- upload images;
- preview draft content before publishing;
- maintain the website without editing code.

## 3.2 Business Objectives

The admin portal must:

1. reduce developer dependency for ordinary content updates;
2. make content editing simple for non-technical staff;
3. allow IEJF to add future pages without rebuilding the frontend;
4. prevent unfinished content from appearing publicly;
5. protect the public site from unauthorised changes;
6. maintain the site's visual consistency;
7. allow future migration from Cloud Storage to Supabase without rebuilding the frontend/admin UI.

## 3.3 Stakeholders

### IEJF
- Website administrators / content editors
- IEJF leadership
- Website visitors

### Geidi
- Development team
- Project manager / project coordinator
- Hosting / infrastructure support

## 3.4 Primary Admin User

Launch assumption:

- one authorised IEJF administrator account

The source build brief identifies a single admin-user model for launch. The system must nevertheless be structured so multi-user authentication can be added later.

## 3.5 Success Criteria

The admin portal is successful when an authorised non-technical admin can:

- sign in securely;
- edit Home, About, Insights, and Contact content;
- save work without publishing it;
- preview draft changes;
- publish changes;
- create a new page;
- give the new page a title and URL slug;
- add supported content sections;
- choose whether the page appears in navigation;
- reorder navigation items;
- publish the page;
- see the page and navigation update on the public site without source-code changes.

## 3.6 Out of Scope for Initial Launch

Unless separately approved, Phase 1 does not require:

- arbitrary HTML/CSS editing;
- custom JavaScript entered by admins;
- unrestricted drag-and-drop website building;
- multi-tenant support;
- complex editorial approval chains;
- public user accounts;
- ecommerce;
- donation/payment processing;
- multilingual CMS;
- advanced analytics dashboard;
- full media DAM;
- complex workflow roles such as Author/Editor/Publisher.

---

# 4. Product Requirements Document (PRD)

## 4.1 Product Name

**IEJF Admin Portal**

## 4.2 Route

```text
/admin
```

All admin pages and admin APIs must require server-side authentication.

Suggested route structure:

```text
/admin
/admin/login
/admin/pages
/admin/pages/new
/admin/pages/[id]
/admin/insights
/admin/media
/admin/settings
```

Not every route needs to be separate in Phase 1; the UI may use a dashboard with nested sections.

## 4.3 Product Principles

The portal must be:

- simple;
- safe;
- non-technical;
- predictable;
- responsive;
- accessible;
- consistent with IEJF branding;
- difficult to misuse accidentally.

The admin user should never need to understand JSON, Markdown syntax, source files, Git, deployment, or code.

---

# 5. User Roles and Permissions

## 5.1 Phase 1 Role

### Admin

Capabilities:

- login/logout;
- edit all website pages;
- create pages;
- delete eligible custom pages;
- publish/unpublish pages;
- manage page order;
- control navigation visibility;
- manage Insights entries;
- upload/delete eligible media;
- save drafts;
- publish drafts;
- preview drafts.

## 5.2 Protected Core Pages

The four initial pages are core pages:

- Home
- About
- Insights
- Contact

Recommended rule:

- admin may edit them;
- admin may reorder them;
- admin may optionally hide a page from navigation if approved;
- admin should not permanently delete these core pages from the CMS UI.

Custom pages may be deletable with confirmation.

---

# 6. Admin Information Architecture

Recommended desktop structure:

```text
Admin
├── Dashboard
├── Pages
│   ├── Home
│   ├── About
│   ├── Insights
│   ├── Contact
│   └── Custom Pages
├── Media
├── Navigation
├── Settings
└── Logout
```

Recommended mobile structure:

- compact header;
- drawer navigation;
- one-column forms;
- sticky Save / Publish action area where practical.

---

# 7. Dashboard Requirements

The dashboard should immediately show:

- website status;
- last published time;
- list of pages;
- draft/published state;
- quick link to create a new page;
- quick link to edit Insights;
- recent admin actions if audit logging is surfaced.

Suggested page table columns:

| Field | Description |
|---|---|
| Page | Page title |
| URL | Public slug |
| Status | Draft / Published / Unpublished |
| Navigation | Visible / Hidden |
| Last Updated | Timestamp |
| Actions | Edit / Preview / Publish / More |

---

# 8. Page Management Requirements

## 8.1 Existing Page Editing

The admin must be able to edit the defined fields of the four initial pages.

### Home fields

At minimum:

- page title/name;
- mission paragraph;
- hero image;
- bottom ABN line;
- supported image/content sections used by the final frontend.

### About fields

At minimum:

- introduction/body rich text;
- Environment title;
- Environment description;
- Environment entity/ABN;
- Health title;
- Health description;
- Health entity/ABN;
- Human Rights title;
- Human Rights description;
- Human Rights entity/ABN;
- relevant supported imagery.

### Insights fields

Insights is a repeatable collection.

Entry fields:

- title;
- slug if entries have detail pages;
- category/tag;
- summary/body;
- optional image;
- publish state;
- display order;
- optional date if later required.

At launch the page can remain empty.

### Contact fields

At minimum:

- location/address line;
- email;
- contact-page supporting content if present in final UI.

Contact form submission handling is a separate implementation decision and must not be invented inside the CMS without project approval.

---

# 9. New Page Creation

This is a mandatory requirement.

## 9.1 Create Page Flow

Admin selects:

**Pages → Add Page**

The form must provide:

- Page title
- URL slug
- Navigation label
- Navigation visibility
- Page status
- Page order
- SEO title
- SEO description
- Content sections
- Optional featured/hero image

## 9.2 Slug Rules

Examples:

```text
Research
→ /research

Our Work
→ /our-work
```

Rules:

- lowercase;
- hyphen-separated;
- unique;
- no spaces;
- no unsafe characters;
- protected/reserved routes rejected.

Reserved examples:

```text
admin
api
login
_admin
_next
```

Core route collisions must be rejected.

## 9.3 Automatic Navigation

When all of the following are true:

```text
page.status == "published"
page.showInNavigation == true
```

the page must automatically appear in the website navigation.

No developer change is allowed to be necessary.

Navigation must read from the same live content source as pages.

## 9.4 Navigation Order

Admin can reorder visible navigation items.

Recommended implementation:

- drag-and-drop; or
- simple up/down controls.

Persist a numeric `navOrder` field.

The public site sorts by that field.

## 9.5 Dynamic Page Rendering

The public frontend must include a dynamic route such as:

```text
app/[slug]/page.tsx
```

or an equivalent safe route architecture.

The renderer must load page data based on the requested slug.

If page does not exist or is not published:

```text
404
```

must be returned.

Draft pages must never be exposed publicly through the live route.

---

# 10. Page Builder Scope

The requirement is page creation, not unrestricted website design.

Use a controlled section/block system so new pages remain visually consistent.

## 10.1 Recommended Blocks

Phase 1 supported content blocks:

### Hero
Fields:
- eyebrow
- heading
- body
- image
- alignment

### Rich Text
Fields:
- heading optional
- formatted body

Allowed formatting:
- headings within safe levels;
- bold;
- italic;
- links;
- bullet lists;
- numbered lists.

### Image + Text
Fields:
- image
- heading
- body
- image side: left/right

### Cards
Fields:
- section heading
- repeatable cards
  - title
  - description
  - optional image/icon

### Quote
Fields:
- quote
- attribution

### CTA
Fields:
- heading
- body
- button label
- button URL

Only use this block if CTA content is approved by IEJF.

### Spacer / Divider
Controlled options only.

## 10.2 Do Not Allow

The CMS should not permit arbitrary:

- `<script>`;
- raw JavaScript;
- unsafe iframe embeds;
- custom CSS;
- arbitrary HTML without sanitisation.

---

# 11. Content Data Model

Because admins must create new pages, do not keep the entire application limited to a hardcoded:

```ts
interface SiteContent {
  home: ...
  about: ...
  insights: ...
  contact: ...
}
```

Use a dynamic page collection.

Recommended model:

```ts
export type PageStatus = "draft" | "published" | "unpublished";

export interface SitePage {
  id: string;
  title: string;
  slug: string;
  navLabel: string;
  isCore: boolean;
  showInNavigation: boolean;
  navOrder: number;
  status: PageStatus;

  seo: {
    title?: string;
    description?: string;
  };

  hero?: {
    eyebrow?: string;
    heading?: string;
    body?: string;
    image?: MediaReference | null;
  };

  blocks: ContentBlock[];

  createdAt: string;
  updatedAt: string;
  publishedAt?: string | null;
}

export interface MediaReference {
  id: string;
  url: string;
  alt: string;
  width?: number;
  height?: number;
}

export type ContentBlock =
  | HeroBlock
  | RichTextBlock
  | ImageTextBlock
  | CardGridBlock
  | QuoteBlock
  | CtaBlock;
```

Initial pages are seeded into the same `pages[]` collection.

---

# 12. Phase 1 Storage Model

The project build brief specifies Cloud Storage without a database dependency at launch.

Recommended files:

```text
content.live.json
content.draft.json
```

Suggested document shape:

```json
{
  "site": {
    "name": "Intergenerational Justice Fund"
  },
  "pages": [],
  "navigation": [],
  "insights": [],
  "updatedAt": ""
}
```

Prefer deriving navigation from `pages[]` rather than maintaining two independent sources of truth.

For example:

```ts
const nav = pages
  .filter(page =>
    page.status === "published" &&
    page.showInNavigation
  )
  .sort((a, b) => a.navOrder - b.navOrder);
```

This directly satisfies the automatic-append requirement.

---

# 13. Data Access Layer

All frontend and admin code must use one content service.

Suggested API:

```ts
export async function getSiteContent(
  version: "live" | "draft"
): Promise<SiteContent>;

export async function saveDraft(
  content: SiteContent
): Promise<void>;

export async function publishDraft(): Promise<void>;

export async function getPageBySlug(
  slug: string,
  version?: "live" | "draft"
): Promise<SitePage | null>;
```

Do not access Cloud Storage directly from random page components.

This abstraction allows Phase 2 migration to Supabase.

---

# 14. Draft, Preview, and Publish Workflow

## 14.1 Save Draft

**Save Draft**:

- validates input;
- sanitises rich content;
- writes only to draft storage;
- does not alter the public site.

## 14.2 Preview

Admin can preview the current draft.

Recommended secure preview:

```text
/api/preview?slug=...
```

Preview must:

- require authenticated admin session;
- never make draft pages publicly indexable;
- display a visible "Draft Preview" indicator.

## 14.3 Publish

**Publish**:

1. validate complete content;
2. confirm the action;
3. copy validated draft state to live state;
4. record publication timestamp;
5. trigger Next.js revalidation/cache refresh;
6. log the action;
7. return success/failure to the admin UI.

The public change should be visible immediately or within normal revalidation time.

## 14.4 Unpublish

For custom pages:

- change status to unpublished;
- remove from public navigation;
- public route returns 404 or equivalent non-public state.

---

# 15. Deletion Rules

Deleting content must be deliberate.

## 15.1 Core Pages

Home, About, Insights, Contact:

- cannot be permanently deleted through the standard UI.

## 15.2 Custom Pages

Deletion requires:

- confirmation dialog;
- page title shown in warning;
- explicit destructive action.

Recommended:
soft-delete/archive if practical.

## 15.3 Media Deletion

Do not delete an image that is actively referenced by live content without warning.

---

# 16. Image / Media Management

## 16.1 Upload

Admin can:

- drag and drop;
- choose a file;
- add required alt text.

## 16.2 Allowed Formats

Recommended:

- JPEG
- PNG
- WebP
- AVIF where pipeline supports it

SVG uploads should be disallowed or strictly sanitised because SVG can contain active content.

## 16.3 Security

Server must:

- inspect actual MIME type;
- use an allow list;
- enforce maximum file size;
- rename files safely;
- strip EXIF/metadata where practical;
- reject executable/polyglot content;
- never trust extension alone.

## 16.4 Image UX

Show:

- upload progress;
- image preview;
- validation errors;
- replace button;
- remove button.

---

# 17. Authentication Requirements

## 17.1 Login

`/admin/login`

Required:

- username/email identifier;
- password, or approved magic-link method;
- generic invalid-credential error;
- no indication whether a username exists.

## 17.2 Password Storage

Passwords must never be stored as plaintext.

Use:

- Argon2; or
- bcrypt with appropriate cost.

If credentials are provisioned through Secret Manager in Phase 1, store a password hash, not a plaintext password.

## 17.3 Sessions

Admin session cookies:

- `HttpOnly`
- `Secure`
- `SameSite=Strict`
- sensible expiration
- rotation/renewal where framework supports it.

## 17.4 Rate Limiting

At minimum:

- 5 failed login attempts per 15 minutes per source/user key;
- temporary lockout/throttling;
- log repeated failures.

## 17.5 MFA

TOTP MFA is strongly recommended.

It can be a launch requirement if approved or an immediate hardening task.

---

# 18. Authorisation

Every admin mutation must check authentication server-side.

Protect:

```text
/admin/*
/api/admin/*
```

Do not rely only on:

- hidden buttons;
- React state;
- middleware redirects;
- client-side role checks.

Server action/API handler must verify session before any write.

---

# 19. API / Server Action Contract

Implementation may use Next.js Server Actions or route handlers.

Equivalent behaviour is required.

Suggested operations:

```text
POST   /api/admin/login
POST   /api/admin/logout

GET    /api/admin/content/draft
PUT    /api/admin/content/draft
POST   /api/admin/content/publish

POST   /api/admin/pages
PUT    /api/admin/pages/:id
DELETE /api/admin/pages/:id
POST   /api/admin/pages/reorder

POST   /api/admin/media
DELETE /api/admin/media/:id
```

All write endpoints require authenticated admin access.

---

# 20. Input Validation

Use server-side schema validation.

Recommended:

```text
Zod
```

Validate:

- page title;
- slug;
- nav label;
- nav order;
- URL fields;
- email;
- content block type;
- maximum body length;
- file size;
- MIME type;
- image alt text;
- status values.

Client-side validation is useful for UX but does not replace server validation.

---

# 21. Rich Text Security

All rich text displayed publicly must be sanitised.

Allow only approved elements/attributes.

Recommended allowed features:

- paragraphs;
- headings;
- strong;
- emphasis;
- links;
- lists.

Reject:

- scripts;
- event-handler attributes;
- unsafe style injection;
- javascript URLs;
- arbitrary embeds.

---

# 22. CSRF Protection

State-changing requests must be protected using one or more of:

- CSRF tokens;
- SameSite strict cookies;
- origin verification;
- framework-supported CSRF protections.

Do not accept cross-origin state changes by default.

---

# 23. Security Headers

Public and admin responses should set:

- `Strict-Transport-Security`
- `X-Content-Type-Options: nosniff`
- `Content-Security-Policy`
- `frame-ancestors 'none'`
- appropriate `Referrer-Policy`
- sensible `Permissions-Policy`

Avoid legacy unsafe CSP settings where possible.

---

# 24. Logging and Audit

Log at least:

- login success;
- login failure;
- logout;
- draft save;
- publish;
- page created;
- page deleted;
- page unpublished;
- media upload failure;
- authorisation failure.

Do not log:

- passwords;
- session tokens;
- secrets.

Recommended event fields:

```text
timestamp
event
admin identifier
resource/page id
result
request id
```

Phase 1 may use Cloud Logging.

---

# 25. Admin UX Requirements

The portal should be easy for a non-technical user.

## 25.1 General

- clear labels;
- helpful descriptions;
- no developer terminology;
- visible save state;
- confirmation for destructive actions;
- success/error toast or message;
- unsaved-changes warning;
- sensible empty states.

## 25.2 Status Language

Prefer:

- Draft
- Published
- Unpublished

Avoid exposing storage terminology such as:

- `content.live.json`
- bucket object;
- cache revalidation.

## 25.3 Publish Confirmation

Example:

```text
Publish changes?

Your saved draft will replace the current live website content.
```

---

# 26. Responsive Admin Requirements

Admin must work on:

- desktop;
- laptop;
- tablet;
- mobile.

Primary editing experience can favour desktop/tablet, but mobile must remain functional.

## Desktop

- sidebar + content workspace;
- split editor/preview where useful.

## Tablet

- collapsible sidebar;
- full-width editor area;
- sticky actions.

## Mobile

- drawer menu;
- one-column form;
- full-width controls;
- minimum comfortable touch targets;
- no horizontal overflow.

---

# 27. Accessibility Requirements

Target WCAG 2.1 AA practices.

Admin UI must support:

- keyboard navigation;
- visible focus;
- semantic forms;
- label/input association;
- error text connected to fields;
- accessible dialogs;
- sufficient contrast;
- alt-text workflow;
- logical heading hierarchy.

Do not make drag-and-drop the only way to reorder pages; provide keyboard-accessible alternatives.

---

# 28. Public Navigation Integration

The public Header component must not hardcode the full menu.

Required logic:

```ts
const menuItems = livePages
  .filter(page => page.showInNavigation && page.status === "published")
  .sort((a, b) => a.navOrder - b.navOrder);
```

Both desktop and mobile navigation must use the same data.

This guarantees that newly published pages automatically append/appear according to configured order.

---

# 29. Public Dynamic Page Template

New admin-created pages use the same frontend design system.

Required:

- shared header;
- shared footer;
- controlled content width;
- responsive typography;
- IEJF palette;
- supported block renderer;
- SEO metadata;
- accessibility;
- responsive mobile/tablet/desktop layouts.

Do not allow new pages to look unrelated to the core site.

---

# 30. SEO Controls

For custom pages, admin may edit:

- SEO title;
- meta description;
- slug.

System should automatically generate safe defaults from the page title when fields are empty.

Do not allow admins to directly edit arbitrary `<head>` HTML.

Draft/unpublished pages:

```text
noindex
```

or must not be publicly available at all.

---

# 31. Content Versioning

Minimum launch requirement:

- current draft;
- current live.

Recommended enhancement:

retain recent published snapshots.

Example:

```text
history/
  2026-09-17T090000Z.json
  2026-09-18T043000Z.json
```

This would allow rollback if a bad publication occurs.

If not implemented at launch, treat rollback/version history as a Phase 1.1 enhancement.

---

# 32. Concurrency

Because launch assumes one admin user, sophisticated conflict resolution is not required.

Still:

- use an `updatedAt` value;
- warn if the draft changed between load and save where practical.

If multiple admin users are later introduced, add optimistic concurrency/version checks.

---

# 33. Phase 1 Technical Architecture

```text
Browser
   |
   v
Next.js / Cloud Run
   |
   +-- Public Website
   |
   +-- /admin
   |     |
   |     +-- Auth
   |     +-- Page Editor
   |     +-- Media Upload
   |     +-- Publish
   |
   +-- lib/content.ts
             |
             v
       Google Cloud Storage
       ├── content.draft.json
       ├── content.live.json
       └── media/
```

Infrastructure:

- standalone GCP project for IEJF;
- region: `australia-southeast1` / Sydney;
- Cloud Run;
- Artifact Registry;
- Cloud Storage;
- Secret Manager;
- Cloud Logging;
- HTTPS load balancer/certificate setup according to Geidi deployment procedure.

---

# 34. Phase 2 Supabase Migration

The admin UI should not need to be redesigned.

Replace only the persistence/auth implementation.

Potential Supabase tables:

## pages

```text
id
title
slug
nav_label
is_core
show_in_navigation
nav_order
status
seo_title
seo_description
blocks_json
created_at
updated_at
published_at
```

## media

```text
id
path
url
alt_text
mime_type
size
created_at
```

## admin_users

Handled by Supabase Auth if adopted.

Potential future features:

- multiple admins;
- roles;
- database-backed revision history;
- richer audit log;
- scheduled publishing.

---

# 35. Recommended Next.js Project Structure

```text
app/
├── (public)/
│   ├── page.tsx
│   ├── about/
│   │   └── page.tsx
│   ├── insights/
│   │   └── page.tsx
│   ├── contact/
│   │   └── page.tsx
│   └── [slug]/
│       └── page.tsx
│
├── admin/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── login/
│   │   └── page.tsx
│   ├── pages/
│   │   ├── page.tsx
│   │   ├── new/
│   │   │   └── page.tsx
│   │   └── [id]/
│   │       └── page.tsx
│   ├── media/
│   │   └── page.tsx
│   └── settings/
│       └── page.tsx
│
├── api/
│   └── admin/
│       └── ...
│
components/
├── public/
├── admin/
└── blocks/
    ├── BlockRenderer.tsx
    ├── HeroBlock.tsx
    ├── RichTextBlock.tsx
    ├── ImageTextBlock.tsx
    ├── CardGridBlock.tsx
    ├── QuoteBlock.tsx
    └── CtaBlock.tsx
│
lib/
├── auth/
├── content/
│   ├── types.ts
│   ├── schemas.ts
│   ├── content.ts
│   └── storage-gcs.ts
├── media/
├── security/
└── validation/
```

Exact folders may be adapted to the existing repository.

---

# 36. Component Requirements

Admin components may include:

```text
AdminShell
AdminSidebar
AdminHeader
PageList
PageEditor
PageSettings
SlugField
NavigationSettings
BlockEditor
BlockPicker
RichTextEditor
ImageUploader
MediaPicker
PublishBar
StatusBadge
ConfirmDialog
UnsavedChangesGuard
PreviewFrame
```

Avoid over-engineering components that are used only once.

---

# 37. Error Handling

Admin UI must provide useful states for:

- failed login;
- session expired;
- save failed;
- publish failed;
- upload failed;
- duplicate slug;
- invalid URL;
- invalid image type;
- oversized image;
- page no longer exists;
- network interruption.

Never expose production stack traces.

Example:

```text
We couldn't publish your changes.
Your draft is still saved. Please try again.
```

---

# 38. Loading and Save States

Show:

- initial loading skeleton/state;
- `Saving...`;
- `Saved`;
- `Publishing...`;
- `Published`;
- `Upload in progress`.

Disable duplicate Publish submissions while a publication is running.

---

# 39. Unsaved Changes Protection

If the admin edits a form then:

- navigates away;
- closes the tab;
- changes to another page;

show a warning when technically appropriate.

Do not silently discard work.

---

# 40. Performance Requirements

Admin:

- load only editor code needed for active screen;
- lazy-load rich editor if used;
- avoid loading the whole media library at once;
- paginate or incrementally load media if library grows.

Public website:

- no admin JavaScript included in normal public bundles where avoidable;
- content reads should be cached appropriately;
- publication triggers revalidation.

---

# 41. Security Acceptance Criteria

Before go-live:

- [ ] unauthenticated user cannot access `/admin`;
- [ ] unauthenticated user cannot call write APIs;
- [ ] password is never stored plaintext;
- [ ] repeated failed login attempts are rate-limited;
- [ ] admin cookies are `HttpOnly`, `Secure`, `SameSite`;
- [ ] content input is validated server-side;
- [ ] rich text is sanitised;
- [ ] file uploads are allow-listed and size-limited;
- [ ] unsafe SVG/executable upload is rejected;
- [ ] secrets are stored in Secret Manager;
- [ ] Cloud Run service uses least privilege;
- [ ] CSRF/origin protection is active;
- [ ] CSP/security headers are active;
- [ ] publish events are logged;
- [ ] OWASP ZAP baseline staging scan is reviewed;
- [ ] high/critical dependency findings are resolved before release.

---

# 42. Functional Acceptance Criteria

## Authentication

- [ ] admin can sign in;
- [ ] invalid credentials fail safely;
- [ ] admin can sign out;
- [ ] protected pages redirect/reject unauthorised users.

## Existing pages

- [ ] Home content can be edited;
- [ ] About content can be edited;
- [ ] Insights entries can be added/removed/reordered;
- [ ] Contact content can be edited.

## New pages

- [ ] admin can create a page;
- [ ] duplicate slug is rejected;
- [ ] admin can save it as draft;
- [ ] draft does not appear publicly;
- [ ] admin can preview it;
- [ ] admin can publish it;
- [ ] published page is reachable by slug;
- [ ] page automatically appears in navigation when enabled;
- [ ] page order is respected;
- [ ] hidden page remains accessible only according to its publication/navigation settings.

## Publishing

- [ ] Save does not change live site;
- [ ] Publish updates live content;
- [ ] public cache is refreshed;
- [ ] failed publication does not corrupt live content.

## Media

- [ ] supported images upload;
- [ ] invalid images fail;
- [ ] alt text can be maintained;
- [ ] uploaded image can be selected on a page.

---

# 43. UAT Test Scenarios

## UAT-01 — Login
**Given** valid admin credentials  
**When** admin logs in  
**Then** dashboard is shown.

## UAT-02 — Invalid login
**Given** invalid credentials  
**When** login is submitted  
**Then** access is denied and no sensitive detail is exposed.

## UAT-03 — Edit Home
**When** mission text is edited and saved as draft  
**Then** public Home remains unchanged.

## UAT-04 — Publish Home
**When** draft Home changes are published  
**Then** public Home displays the new content.

## UAT-05 — Create new page
**When** admin creates `Research` with slug `research`  
**Then** it is stored as a draft.

## UAT-06 — Publish new page
**When** Research is published  
**Then** `/research` becomes available.

## UAT-07 — Automatic navigation
**Given** Research is published and `Show in navigation` is enabled  
**Then** Research appears in desktop and mobile navigation automatically.

## UAT-08 — Hide from navigation
**When** navigation visibility is disabled and published  
**Then** Research disappears from menus without deleting its content.

## UAT-09 — Duplicate slug
**When** admin attempts a slug already used  
**Then** save is blocked with a clear error.

## UAT-10 — Reorder menu
**When** admin changes navigation order and publishes  
**Then** public navigation reflects the new order.

## UAT-11 — Add Insight
**When** an Insight entry is created and published  
**Then** it appears in the Insights page using the approved card/list pattern.

## UAT-12 — Image upload
**When** a valid JPEG/WebP is uploaded  
**Then** it is stored and can be used in page content.

## UAT-13 — Invalid file
**When** an executable or unsupported file is uploaded  
**Then** it is rejected.

## UAT-14 — Mobile admin
**When** admin edits content at mobile width  
**Then** all required actions remain usable without horizontal overflow.

## UAT-15 — Session expiry
**When** admin session expires  
**Then** protected writes are rejected and user is returned safely to login.

---

# 44. Responsive QA Matrix

Test at least:

```text
320px
375px
390px
430px
768px
820px
1024px
1280px
1440px
1920px
```

For `/admin`, verify:

- no horizontal overflow;
- sidebar/drawer works;
- forms remain readable;
- editor buttons remain reachable;
- dialogs fit the viewport;
- Save/Publish actions remain clear;
- tables adapt or become card/list representations on narrow screens.

---

# 45. Browser QA

Minimum:

- current Chrome;
- current Edge;
- current Safari;
- current Firefox.

Admin is primarily used on modern browsers.

---

# 46. Build Plan

## Stage 1 — Content Architecture

1. Refactor current hardcoded page content into a data model.
2. Convert the model to dynamic `pages[]`.
3. Seed Home, About, Insights, Contact.
4. Build `lib/content` abstraction.
5. Wire public navigation to dynamic page data.

## Stage 2 — Local Admin Prototype

1. Build `/admin/login`.
2. Build protected admin layout.
3. Build page list.
4. Build editor for core pages.
5. Build Add Page flow.
6. Build block editor.
7. Build navigation-order controls.
8. Implement local JSON draft/live content for development.

## Stage 3 — Publishing

1. Save Draft.
2. Draft Preview.
3. Publish.
4. Revalidate public website.
5. Unpublish.
6. Delete custom page.

## Stage 4 — Media

1. Image uploader UI.
2. Server validation.
3. Cloud Storage integration.
4. Media selection.
5. Alt-text handling.

## Stage 5 — Production Persistence

1. Create private GCS content bucket.
2. Add `content.draft.json`.
3. Add `content.live.json`.
4. Configure Cloud Run service account.
5. Configure Secret Manager.
6. Replace local content storage with GCS adapter.

## Stage 6 — Security Hardening

1. password hashing;
2. secure sessions;
3. rate limiting;
4. origin/CSRF checks;
5. sanitisation;
6. CSP/security headers;
7. logging;
8. upload hardening;
9. dependency scan;
10. ZAP baseline scan.

## Stage 7 — QA/UAT

1. functional testing;
2. mobile/tablet/desktop testing;
3. publish-flow testing;
4. dynamic page/navigation testing;
5. client/admin walkthrough.

---

# 47. Claude / AI Coding Guardrails

When implementing this admin portal:

1. Read the current repository before changing architecture.
2. Preserve the approved public UI unless admin integration requires a small refactor.
3. Do not replace approved IEJF content with generated copy.
4. Do not invent client facts.
5. Do not hardcode navigation.
6. Do not hardcode the site to only four pages.
7. Do not expose draft content publicly.
8. Do not create an unrestricted arbitrary-HTML page builder.
9. Do not store passwords in plaintext.
10. Do not put secrets in client-side environment variables.
11. Do not trust client-side validation.
12. Do not make Cloud Storage calls directly from public client components.
13. Do not delete live content before a new validated version is safely available.
14. Reuse existing design tokens and components.
15. Test all changes at mobile, tablet, and desktop breakpoints.

---

# 48. Definition of Done

The Admin Portal is considered launch-ready when:

- `/admin` is protected by secure authentication;
- IEJF can update all confirmed page content;
- IEJF can add a new page without code;
- the new page can be drafted, previewed, published, unpublished, and edited;
- published navigation updates automatically;
- desktop and mobile menus share the same dynamic source;
- image uploads work securely;
- draft/live publishing is safe;
- security controls in this document are implemented;
- public pages remain responsive;
- admin portal is usable on tablet/mobile;
- UAT scenarios pass;
- staging security scan has no unresolved high/critical findings;
- deployment uses the approved GCP project/region and Secret Manager.

---

# 49. Open Questions Requiring Confirmation

These should be confirmed with the project lead/client contact before final production configuration:

1. Who is the launch admin user?
2. Is one admin account sufficient at launch?
3. Is MFA required for launch or strongly recommended post-launch?
4. Should admin-created pages support all block types listed in this document, or only text/image sections initially?
5. Can admins hide/reorder the four core pages in navigation?
6. Should custom pages be permanently deletable or archived only?
7. Should Insights entries open dedicated detail pages or remain cards/list items only?
8. What is the final contact-form handling method:
   - send email;
   - store submissions;
   - both?
9. Is a Privacy Policy page required before contact-form go-live?
10. What is the confirmed production domain and DNS owner/contact?
11. Which exact GCP project/billing account will be used?
12. Should the admin portal support rollback/version history at launch?
13. What image file-size limit should be applied?
14. Should new pages automatically append at the end of navigation by default, with manual reorder afterward?
15. Should a newly created page default to:
    - Draft
    - Hidden from navigation
   This document recommends both for safety.

---

# 50. Recommended Safe Defaults

Until the open questions are answered:

```text
New page status: Draft
Show in navigation: No
Navigation position: Last
Delete core page: Disabled
Delete custom page: Confirmation required
Publish: Explicit confirmation
Preview: Authenticated only
Admin accounts: One
Arbitrary HTML/JS: Disabled
Image uploads: Raster formats only
```

These defaults reduce the risk of accidental public changes.

---

# 51. Key Requirement Summary

The central requirement is:

> IEJF staff must be able to edit existing website content and create new pages from `/admin`. Published pages marked for navigation must automatically appear in the public navigation/menu without source-code changes.

Implementation principle:

```text
Admin manages structured content.
The frontend renders that structured content.
Navigation is generated from published page records.
Draft content never leaks to the public site.
```

That should remain true whether Phase 1 uses Google Cloud Storage or Phase 2 later moves to Supabase.
