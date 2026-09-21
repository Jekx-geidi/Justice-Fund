# IEJF Admin Portal — Phase 2
**Document:** `Phase2.md`  
**Project:** Intergenerational Justice Fund (IEJF) Website  
**Phase:** Admin Portal Phase 2 — UX, Media, Revisioning, Security & Production Hardening  
**Date:** 21 September 2026  
**Status:** Ready for implementation

---

# 1. Phase 2 Summary

Phase 1 delivered a working CMS/admin portal for IEJF.

The current admin already supports:

- `/admin` login;
- editing Home, About and Contact content;
- managing Insights;
- creating custom pages;
- dynamic navigation;
- Save Draft;
- authenticated Preview;
- Publish;
- custom-page block rendering;
- Supabase-backed content persistence;
- Supabase Storage for media;
- responsive admin behavior;
- server-side protection for admin write APIs.

Phase 2 does **not** rebuild Phase 1.

Phase 2 improves the current working CMS into a more polished, safer, more visual, and more production-ready content management experience.

The Phase 2 priorities are:

1. **Live visual preview while editing**
2. **Advanced Media Library**
3. **Revision history and rollback**
4. **Persistent audit logging**
5. **Authentication and account hardening**
6. **Database/RLS security hardening**
7. **Admin UX and responsive polish**
8. **Production QA, observability, and release readiness**

---

# 2. Phase 1 Baseline

Phase 2 assumes the following features already exist and must continue working.

## 2.1 Content Editing

Core pages:

```text
Home
About
Insights
Contact
```

Admin can edit approved content through dedicated forms.

## 2.2 Custom Pages

Admin can:

```text
Create Page
→ Edit
→ Save Draft
→ Preview
→ Publish
```

Custom pages support controlled content blocks.

## 2.3 Dynamic Navigation

Navigation is not hardcoded.

Published pages with navigation enabled automatically appear in:

- desktop navigation;
- mobile navigation;
- footer navigation.

## 2.4 Existing Publishing Workflow

```text
Edit
↓
Save Draft
↓
Preview
↓
Publish
↓
Live Website
```

Phase 2 must preserve this workflow.

## 2.5 Existing Persistence

Website content is persisted through Supabase rather than depending on local application storage.

Media uploads are also expected to use Supabase Storage.

---

# 3. Phase 2 Goal

The objective of Phase 2 is:

> Transform the current functional IEJF admin portal into a professional production CMS that gives non-technical administrators clear visual feedback, safe publishing controls, stronger recovery options, better media management, and improved security.

The admin should feel confident editing content without needing developer support for routine website changes.

---

# 4. Business Objectives

Phase 2 must:

1. reduce admin uncertainty while editing;
2. make content changes easier to visually understand;
3. reduce the risk of publishing mistakes;
4. make accidental content loss recoverable;
5. improve image/media management;
6. improve traceability of admin actions;
7. strengthen authentication and data-layer protection;
8. improve mobile/tablet usability;
9. prepare the CMS for production usage;
10. avoid unnecessary complexity that does not serve IEJF's real content workflow.

---

# 5. Phase 2 Scope

Phase 2 includes the following workstreams:

```text
A. Live Editor Preview
B. Advanced Media Library
C. Revision History & Rollback
D. Audit Logging
E. Authentication Improvements
F. RLS & Database Security
G. Admin UX Polish
H. Production QA & Hardening
```

---

# 6. Workstream A — Live Editor Preview

## 6.1 Objective

While an admin edits content, show how the content will look in the real public page layout.

The admin should not need to imagine the final result.

## 6.2 Desktop Experience

Recommended layout:

```text
┌──────────────┬──────────────────────┬──────────────────────────────┐
│ Admin Nav    │ Editor               │ Live Draft Preview           │
│              │                      │                              │
│ Pages        │ Fields               │ Actual page design           │
│ Insights     │ Blocks               │                              │
│ Media        │ Settings             │ Desktop / Tablet / Mobile    │
│ Settings     │                      │                              │
└──────────────┴──────────────────────┴──────────────────────────────┘
```

## 6.3 Tablet / Mobile

Use:

```text
[ Editor ] [ Preview ]
```

rather than forcing a narrow side-by-side layout.

## 6.4 Preview Modes

Provide:

```text
Desktop
Tablet
Mobile
```

Suggested preview widths:

```text
Desktop: 1440px
Tablet: 820px
Mobile: 390px
```

## 6.5 Live State

Live preview uses:

```text
Current unsaved editor state
```

before saved draft or published content.

Typing must not publish.

Typing must not automatically write to Supabase.

## 6.6 Preserve Existing Full Preview

The current authenticated full-page Preview remains.

Difference:

### Live Draft Preview
- inside editor;
- unsaved state;
- instant feedback.

### Full Preview
- saved draft;
- real page route;
- final review before publishing.

## 6.7 Shared Rendering

Do not create a fake preview.

Use the same presentation components as the public site.

Recommended:

```text
HomePageView
AboutPageView
InsightsPageView
ContactPageView
BlockRenderer
```

Public route and admin preview should consume the same view components.

## 6.8 Unsaved-State Behavior

Show:

```text
Unsaved changes
Draft saved
Published
```

If user clicks Full Preview with unsaved changes:

```text
You have unsaved changes.

[Cancel]
[Save Draft & Preview]
```

If user clicks Publish with unsaved changes:

```text
You have unsaved changes.

[Cancel]
[Save Draft]
[Save & Publish]
```

## 6.9 Optional Enhancement

Field-to-preview highlighting.

Example:

```text
Admin focuses "Mission Statement"
→ corresponding preview section receives subtle gold outline.
```

This is useful but may be deferred if needed.

---

# 7. Workstream B — Advanced Media Library

## 7.1 Objective

Upgrade `/admin/media` from upload/delete functionality into a usable media management system.

## 7.2 Required Features

Media Library should support:

- upload;
- preview;
- title;
- alt text;
- caption;
- internal description;
- category;
- search;
- filter;
- sort;
- usage indicator;
- replace image;
- safe delete;
- copy URL;
- Media Picker;
- focal point.

## 7.3 Categories

Recommended:

```text
Home
About
Insights
Custom Pages
Shared
Uncategorized
```

## 7.4 Search

Search by:

- title;
- filename;
- alt text;
- caption;
- category.

## 7.5 Filtering

Recommended:

```text
All
Used
Unused
Home
About
Insights
Shared
```

## 7.6 Sorting

Recommended:

```text
Newest
Oldest
Name A-Z
Name Z-A
Largest
Smallest
```

## 7.7 Usage Tracking

For every media item show where it is referenced.

Example:

```text
Used in 2 places

Home → Hero
About → Environment
```

Usage must be derived from real content references.

Do not manually maintain a fake usage field.

## 7.8 Replace Image

Replacing an image should preserve:

- media ID;
- title;
- alt text;
- page references;
- category.

Only the underlying file changes.

## 7.9 Focal Point

Allow admin to select the important area of an image.

Store:

```text
focal_x
focal_y
```

using normalized values from 0 to 1.

Example:

```text
focal_x = 0.66
focal_y = 0.40
```

Use as:

```css
object-position: 66% 40%;
```

This improves responsive cropping.

## 7.10 Media Picker

Page editors should use:

```text
Choose Image
→ Media Picker
→ Search / Filter
→ Select
```

Admins should not need to manually copy and paste raw URLs.

## 7.11 Delete Safety

Unused image:

```text
Delete allowed after confirmation.
```

Used image:

```text
Deletion blocked or strongly warned.
Show all references.
```

---

# 8. Workstream C — Revision History & Rollback

## 8.1 Objective

A bad publish must be recoverable.

Current draft/live behavior is useful but is not a full revision history.

Phase 2 should preserve historical published versions.

## 8.2 Required Revision Data

For each published revision store:

```text
revision_id
page_id
revision_number
snapshot
published_by
published_at
```

## 8.3 Admin UI

Page editor should include:

```text
History
```

Example:

```text
Revision 7 — 21 Sep 2026 10:12
Revision 6 — 20 Sep 2026 16:44
Revision 5 — 19 Sep 2026 09:03
```

## 8.4 Restore Flow

```text
History
→ Select Revision
→ Preview
→ Restore as Draft
→ Review
→ Publish
```

Do not directly overwrite live content without review.

## 8.5 Scope

Revision history should initially focus on:

- page content;
- page blocks;
- important page settings.

Media binaries do not necessarily require version history in Phase 2.

---

# 9. Workstream D — Persistent Audit Logging

## 9.1 Objective

Important admin actions should be traceable.

Current console/Cloud Logging-compatible logs are useful operationally but are not a complete CMS audit record.

## 9.2 Recommended Events

Record:

```text
login
logout
page_created
page_updated
draft_saved
page_published
page_unpublished
page_archived
revision_restored
media_uploaded
media_replaced
media_deleted
insight_created
insight_published
settings_updated
```

## 9.3 Audit Record

Recommended:

```text
id
user_id
action
resource_type
resource_id
metadata
created_at
```

Do not store:

- password;
- session cookie;
- token;
- secret key.

## 9.4 Admin View

Optional Phase 2 UI:

```text
/admin/activity
```

Display:

- user;
- action;
- resource;
- date/time.

---

# 10. Workstream E — Authentication Improvements

## 10.1 Current State

Current v1 authentication is functional and protected server-side.

Phase 2 can improve account management without breaking the existing portal.

## 10.2 Target Capabilities

Recommended:

- Supabase Auth;
- admin account invitations;
- secure password reset;
- account deactivation;
- optional MFA;
- future role support.

## 10.3 Roles

Phase 2 minimum can remain:

```text
Admin
```

Future-ready structure:

```text
Admin
Editor
Viewer
```

Do not add complex approval workflows unless the client requests them.

## 10.4 MFA

TOTP MFA is recommended for production admins.

It may be:

- Phase 2 launch requirement; or
- immediate post-launch hardening.

---

# 11. Workstream F — RLS & Database Security

## 11.1 Objective

Improve database-level protection so security does not rely solely on Next.js application code.

## 11.2 Current Principle

The existing server-side service role and protected API handlers already reduce browser exposure.

Phase 2 should add database-level policies where practical.

## 11.3 Required Security Direction

Enable and test RLS policies for:

```text
content
media
admin-related records
audit records
revision records
```

Public/anonymous users:

```text
No write access.
```

Admin:

```text
Only authorized CMS operations.
```

## 11.4 Service Role

The Supabase service-role key must remain:

```text
server-side only
```

Never expose it in browser JavaScript.

## 11.5 Validation

Continue server-side validation and sanitization.

RLS complements application validation; it does not replace it.

---

# 12. Workstream G — Admin UX Polish

## 12.1 Pages List

Improve mobile presentation.

Current table-style layout may become:

```text
Page card
├── Title
├── URL
├── Status
├── Navigation
├── Updated
└── Actions
```

on narrow screens.

## 12.2 Status Indicators

Use consistent statuses:

```text
Draft
Published
Unpublished
Archived
Unsaved
Saving
Saved
Publishing
```

## 12.3 Sticky Action Bar

Recommended editor footer/header:

```text
Unsaved changes

[Save Draft] [Full Preview] [Publish]
```

## 12.4 Empty States

Examples:

Insights:

```text
No Insights published yet.

[Add Insight]
```

Media:

```text
No media found.

[Upload Media]
```

## 12.5 Confirmation Dialogs

Required for:

- publish;
- delete;
- archive;
- restore revision;
- replace media.

## 12.6 Responsive Design

Test at:

```text
390px
430px
768px
820px
1024px
1280px
1440px
1920px
```

Admin must remain functional at mobile width.

---

# 13. Workstream H — Production Hardening

## 13.1 Required Checks

Before Phase 2 sign-off:

- typecheck;
- lint;
- production build;
- automated CMS flow;
- Supabase persistence;
- media persistence;
- responsive QA;
- auth/session QA;
- security-header QA;
- unauthenticated route/API protection;
- publish/rollback tests.

## 13.2 Security Testing

Recommended:

- dependency audit;
- secret scan;
- OWASP ZAP baseline against staging;
- upload security test;
- auth rate-limit test;
- RLS policy test.

## 13.3 Restart / Redeploy Test

Mandatory:

1. publish content;
2. upload media;
3. create custom page;
4. restart/redeploy;
5. verify all three remain.

---

# 14. Data / Architecture Direction

Phase 2 should avoid unnecessary rewrite of working code.

Preferred principle:

```text
Keep current public/admin UI where possible.
Strengthen persistence, recovery, security, and UX around it.
```

Do not rewrite the entire CMS merely to match a theoretical architecture.

Only normalize data structures where they solve a concrete Phase 2 requirement.

---

# 15. Suggested Implementation Order

## Phase 2.1 — Live Preview

Deliver:

- shared page presentation components;
- editor-side preview;
- Desktop/Tablet/Mobile modes;
- unsaved-state handling.

## Phase 2.2 — Media Library

Deliver:

- metadata editor;
- search/filter/sort;
- usage tracking;
- Media Picker;
- replace;
- focal point.

## Phase 2.3 — Revision History

Deliver:

- revision persistence;
- revision list;
- restore-to-draft workflow.

## Phase 2.4 — Audit Log

Deliver:

- persistent audit records;
- optional activity UI.

## Phase 2.5 — Auth / RLS

Deliver:

- agreed auth hardening;
- database policies;
- security testing.

## Phase 2.6 — Admin Polish

Deliver:

- responsive list/card views;
- status indicators;
- sticky actions;
- empty states;
- confirmation UX.

## Phase 2.7 — Final QA

Deliver:

- automated tests;
- UAT;
- responsive QA;
- staging security verification.

---

# 16. Functional Acceptance Criteria

## Live Preview

- [ ] editing text updates preview immediately;
- [ ] editing images updates preview;
- [ ] public website does not change until Publish;
- [ ] Desktop/Tablet/Mobile preview works;
- [ ] existing Full Preview remains;
- [ ] shared public components are reused.

## Media

- [ ] title editable;
- [ ] alt text editable;
- [ ] search works;
- [ ] filters work;
- [ ] usage detection works;
- [ ] replace preserves references;
- [ ] used media cannot be silently deleted;
- [ ] Media Picker works;
- [ ] focal point persists;
- [ ] Supabase Storage persistence survives restart.

## Revisions

- [ ] publication creates revision;
- [ ] history can be viewed;
- [ ] prior revision can be previewed;
- [ ] prior revision can be restored as draft;
- [ ] restore does not silently publish.

## Audit

- [ ] publish is logged;
- [ ] delete/archive is logged;
- [ ] media actions are logged;
- [ ] secrets are not logged.

## Security

- [ ] unauthenticated writes fail;
- [ ] admin session protection remains;
- [ ] service role remains server-only;
- [ ] RLS policies are tested;
- [ ] rich text remains sanitized.

## UX

- [ ] editor usable on mobile;
- [ ] no horizontal overflow;
- [ ] confirmation dialogs accessible;
- [ ] statuses are clear;
- [ ] unsaved changes are protected.

---

# 17. Phase 2 UAT Scenarios

## UAT-P2-01 — Live Home Preview

Edit Home mission.

Expected:

- embedded preview updates;
- public website unchanged.

## UAT-P2-02 — Device Preview

Switch:

```text
Desktop → Tablet → Mobile
```

Expected:

- responsive layout matches real site behavior.

## UAT-P2-03 — Media Picker

Choose Home hero image from Media Library.

Expected:

- preview updates;
- image reference saves with draft.

## UAT-P2-04 — Focal Point

Adjust image focal point.

Expected:

- responsive preview demonstrates correct crop;
- published page respects focal position.

## UAT-P2-05 — Used Media Delete

Attempt to delete image used on Home.

Expected:

- deletion blocked/warned;
- usage list displayed.

## UAT-P2-06 — Revision Creation

Publish About edit.

Expected:

- new revision recorded.

## UAT-P2-07 — Restore Revision

Restore old About revision.

Expected:

- old revision becomes draft;
- preview works;
- public version unchanged until Publish.

## UAT-P2-08 — Audit

Publish a custom page.

Expected:

- audit record contains user/action/resource/time.

## UAT-P2-09 — Mobile Admin

Edit page at 390px.

Expected:

- no overflow;
- Save/Preview/Publish usable;
- Preview accessible.

## UAT-P2-10 — Persistence

Create page + upload image + publish.

Restart application.

Expected:

- page remains;
- content remains;
- image remains.

---

# 18. Out of Scope for Phase 2

Unless separately approved:

- arbitrary HTML editor;
- arbitrary CSS editor;
- arbitrary JavaScript;
- full WordPress-style theme builder;
- drag-and-drop freeform website layout;
- ecommerce;
- donation/payment processing;
- multilingual CMS;
- advanced marketing automation;
- public user registration;
- complex multi-stage legal approval workflow;
- analytics dashboard;
- TinaCMS integration.

---

# 19. TinaCMS Decision

TinaCMS is not required for the planned IEJF architecture.

Current direction:

```text
Next.js
+
Custom /admin
+
Supabase
```

The custom admin already exists and directly supports IEJF's workflow.

Adding another CMS layer would duplicate functionality and increase maintenance.

---

# 20. Technical Guardrails for Claude

When implementing Phase 2:

1. read the existing admin code first;
2. treat current working v1 as the baseline;
3. do not rebuild unrelated functionality;
4. preserve approved IEJF public UI;
5. preserve current Save Draft / Preview / Publish flow;
6. do not auto-publish;
7. do not write to Supabase on every keystroke for live preview;
8. reuse real public rendering components;
9. do not create a fake preview;
10. preserve dynamic navigation;
11. preserve current Supabase content persistence;
12. preserve Supabase Storage;
13. do not expose service-role credentials;
14. preserve server-side auth checks;
15. use migrations for schema changes;
16. keep mobile/tablet admin functional;
17. run typecheck/lint/build after each major workstream;
18. regression-test existing Phase 1 CMS flows.

---

# 21. Definition of Done

Admin Phase 2 is complete when:

- live visual editing preview is implemented;
- responsive device preview works;
- Media Library is fully manageable;
- Media Picker is integrated;
- media usage and safe delete are implemented;
- image focal point is implemented;
- revisions are persisted;
- rollback/restore-to-draft works;
- important actions are audit logged;
- agreed authentication improvements are implemented;
- RLS/security hardening is tested;
- admin mobile/tablet UX is polished;
- Phase 1 functionality still passes regression testing;
- content and media survive deployment/restart;
- staging UAT passes;
- no unresolved high/critical security issues remain.

---

# 22. Phase 2 Completion Summary Format

At completion, report:

```text
Admin Phase 2 Status

Live Preview:
Completed / Partial / Blocked

Media Library:
Completed / Partial / Blocked

Revision History:
Completed / Partial / Blocked

Audit Logging:
Completed / Partial / Blocked

Authentication:
Completed / Partial / Blocked

RLS / Security:
Completed / Partial / Blocked

Responsive Admin:
Completed / Partial / Blocked

QA / UAT:
Passed / Failed / Pending

Known Gaps:
...

Production Blockers:
...
```

---

# 23. Final Phase 2 Outcome

Phase 1 proves that IEJF can manage its website without code.

Phase 2 should make that experience:

```text
Visual
Safe
Recoverable
Traceable
Responsive
Secure
Production-ready
```

The target admin workflow is:

```text
LOGIN
  ↓
EDIT
  ↓
SEE LIVE DRAFT PREVIEW
  ↓
SAVE DRAFT
  ↓
FULL PREVIEW
  ↓
PUBLISH
  ↓
REVISION STORED
  ↓
AUDIT LOGGED
  ↓
LIVE WEBSITE
```

IEJF administrators should be able to maintain and grow the website confidently without routine developer intervention.
