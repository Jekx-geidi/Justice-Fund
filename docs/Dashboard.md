# IEJF Admin Portal — Dashboard UX/UI PRD

**Document:** `Dashboard.md`  
**Project:** Intergenerational Justice Fund (IEJF) Website  
**Area:** Admin Portal — Dashboard Improvement  
**Date:** 21 September 2026  
**Status:** Ready for implementation  
**Primary implementer:** Claude / Development Team

---

# 1. Purpose

This document defines the redesign and UX improvement of the existing IEJF Admin Portal Dashboard.

The dashboard is already functional, but the current presentation feels too much like a basic admin table and does not provide enough visual hierarchy, guidance, or quick actions for a non-technical administrator.

The goal is to make the Dashboard:

- professional;
- easy to understand;
- visually balanced;
- action-oriented;
- consistent with the IEJF brand;
- responsive across desktop, tablet, and mobile;
- simple enough for a non-technical content administrator.

The redesign must **not change the approved admin sidebar structure**.

The sidebar must remain exactly:

```text
Dashboard
Pages
Insights
Media
Settings
```

Do not add new permanent sidebar items.

---

# 2. Current Problems

The current Dashboard has the following UX issues:

1. The `Website status` heading is visually too large compared with the actual actions and content.
2. Quick actions are not grouped strongly enough.
3. The page table is functional but visually flat.
4. Important publishing information is not surfaced clearly.
5. There is excessive unused space on large screens.
6. Status, navigation visibility, dates, and actions do not have a strong visual hierarchy.
7. The mobile/tablet experience needs a more intentional responsive layout.
8. The account/logout area in the sidebar is too plain.
9. The dashboard does not immediately answer:
   - What is live?
   - What needs attention?
   - What can I do next?
10. The Dashboard should feel like a polished CMS, not a generic admin CRUD screen.

---

# 3. Product Goal

The Dashboard should guide the admin in this order:

```text
1. Understand current website status
2. See important summary information
3. Access common actions
4. Review existing pages
5. Edit or manage content
```

The page should answer, within a few seconds:

- How many pages exist?
- How many are published?
- Are there drafts?
- When was the website last published?
- What are the most common actions?
- Which page should I edit?

---

# 4. Approved Admin Sidebar

The sidebar is already approved.

Keep:

```text
IEJF
Admin Portal

Dashboard
Pages
Insights
Media
Settings
```

Do not add:

- Navigation
- Research
- Activity
- Security
- Analytics
- Users
- any custom website page name

Custom website pages remain managed inside **Pages**.

---

# 5. Sidebar UX Improvements

The sidebar structure stays the same, but its visual treatment may be refined.

Recommended improvements:

- compact IEJF brand block;
- consistent spacing;
- subtle icons beside each navigation item;
- stronger active state;
- gold accent line or indicator for current section;
- cleaner account block at the bottom;
- clearer role label;
- better logout treatment.

Example:

```text
IEJF
Admin Portal

▣ Dashboard
▤ Pages
◫ Insights
▧ Media
⚙ Settings

────────────────────

admin@justicefund.org.au
Administrator
Log out
```

The visual style should remain restrained.

Do not use bright colors or oversized icons.

---

# 6. Dashboard Page Structure

Recommended layout:

```text
Dashboard
Manage your website content and publishing.

[Site Summary Cards]

Quick Actions

Pages
Manage your current website pages.

[Pages Table / Cards]
```

---

# 7. Dashboard Header

Replace the oversized:

```text
Website status
```

with a smaller, clearer heading:

```text
Dashboard
```

Supporting text:

```text
Manage your website content, pages and publishing.
```

Optional small metadata below:

```text
Last published 21 Sep 2026, 7:30 AM
```

The page title should remain visually strong, but not dominate the whole screen.

---

# 8. Site Summary Cards

Add a concise site summary section.

Recommended cards:

## Total Pages

Example:

```text
4
Total Pages
```

## Published

```text
4
Published
```

## Drafts

```text
0
Drafts
```

## Last Published

```text
Today
7:30 AM
```

or:

```text
21 Sep
Last published
```

Do not add meaningless vanity metrics.

The cards exist to help the admin understand the current CMS state.

---

# 9. Summary Card Design

Cards should use:

- subtle border;
- light/off-white background;
- minimal radius;
- no heavy shadows;
- small label;
- stronger numeric/value hierarchy;
- optional restrained icon.

Example:

```text
┌────────────────────────┐
│ Total Pages            │
│                        │
│ 4                      │
│                        │
│ Includes core pages    │
└────────────────────────┘
```

Desktop:

```text
4 cards in one row
```

Tablet:

```text
2 × 2
```

Mobile:

```text
1 or 2 columns depending on width
```

---

# 10. Quick Actions

Create a dedicated `Quick actions` section.

Recommended actions:

```text
+ Create Page
+ Add Insight
Upload Media
```

Hierarchy:

```text
Primary:
Create Page

Secondary:
Add Insight
Upload Media
```

Do not make all actions equally visually dominant.

Recommended desktop:

```text
[ + Create Page ] [ Add Insight ] [ Upload Media ]
```

Mobile:

```text
[ + Create Page ]
[ Add Insight ]
[ Upload Media ]
```

Buttons should be clear and touch-friendly.

---

# 11. Preview Website Action

Add an easy way to view the public website.

Recommended placement:

top-right dashboard header:

```text
View Website ↗
```

or:

```text
Preview Website ↗
```

This opens the public site in a new tab.

Do not confuse this with the authenticated Draft Preview feature.

Label should make it clear that this is the live public website.

---

# 12. Pages Section

Add a proper section header:

```text
Pages
Manage page content, visibility and publishing.
```

Right-side action:

```text
+ New Page
```

Do not place `+ New Page` as an isolated button without context.

---

# 13. Desktop Pages Table

Recommended columns:

```text
Page
URL
Status
Navigation
Last Updated
Actions
```

Example:

```text
Home       /          Published   Visible   Today        Edit →
About      /about     Published   Visible   3 days ago   Edit →
Insights   /insights  Published   Visible   3 days ago   Edit →
Contact    /contact   Published   Visible   3 days ago   Edit →
```

---

# 14. Page Name Presentation

Core pages should display a subtle badge.

Instead of:

```text
Home Core
```

use:

```text
Home   [Core]
```

The `Core` badge should be small and muted.

Custom pages should not display a Core badge.

---

# 15. Status Design

Use consistent status badges.

Recommended:

```text
Published
Draft
Unpublished
Archived
```

Visual treatment:

- Published → soft green/mint;
- Draft → warm gold/amber;
- Unpublished → neutral gray;
- Archived → muted gray/red.

Keep colors subtle and accessible.

Do not turn the Dashboard into a multicolor analytics UI.

---

# 16. Navigation Visibility

Improve:

```text
Visible
```

into a clearer state.

Possible:

```text
● Visible
○ Hidden
```

or subtle badges.

Do not rely on color alone.

---

# 17. Last Updated

Prefer human-friendly labels where useful:

```text
Today
Yesterday
3 days ago
```

Hover or secondary text may show the exact date/time.

Example:

```text
Today
7:12 AM
```

---

# 18. Actions

Replace plain `Edit` text with a clearer action.

Recommended:

```text
Edit →
```

or a compact secondary button.

The whole row may also be clickable if accessibility and interaction remain clear.

Avoid hiding primary actions inside an unnecessary overflow menu.

---

# 19. Row Interaction

Desktop row should support:

- subtle hover;
- clear selected/focus state;
- keyboard focus;
- accessible action links.

Do not create exaggerated card elevation.

---

# 20. Empty States

If no custom pages exist, do not show a broken-looking empty area.

Example:

```text
No custom pages yet.

Create a new page when IEJF needs additional website content.

[+ Create Page]
```

Core pages should still remain visible.

---

# 21. Mobile Pages Layout

Do not force the six-column desktop table into mobile.

At narrow widths, convert rows into page cards.

Example:

```text
┌──────────────────────────────┐
│ Home                 [Core] │
│ /                            │
│                              │
│ Published                    │
│ Navigation: Visible          │
│ Updated: Today               │
│                              │
│ [Edit Page]                  │
└──────────────────────────────┘
```

This is required for good mobile UX.

---

# 22. Tablet Pages Layout

Tablet can use:

- compact table; or
- 2-column page cards;

depending on available width.

Do not automatically treat tablet as a large phone.

---

# 23. Content Width

Current large screens leave excessive unused space.

Use a controlled content width.

Recommended:

```text
max-width: 1200px–1320px
```

inside the available admin workspace.

The page should feel balanced without stretching tables across extremely wide monitors.

---

# 24. Spacing System

Use consistent spacing.

Recommended:

```text
Page top padding: 32–48px
Header → cards: 24–32px
Cards → quick actions: 32–40px
Quick actions → pages: 32–40px
```

Avoid giant decorative whitespace.

---

# 25. Typography Hierarchy

The admin portal can retain the IEJF editorial feel.

Recommended:

## Page title

Serif, strong but controlled.

## Section headings

Smaller than page title.

## Labels/data/UI

Use the existing UI/body font.

Recommended hierarchy:

```text
Dashboard               ← H1
Manage your website...  ← Supporting text

Site Overview           ← Section
Quick Actions            ← Section
Pages                    ← Section

Published                ← Badge / UI label
```

---

# 26. Visual Direction

The Dashboard should feel:

```text
Professional
Editorial
Calm
Legal/Public-interest
Premium
Clear
Simple
```

Avoid:

- generic SaaS gradients;
- glassmorphism;
- giant rounded cards;
- neon status colors;
- excessive shadows;
- too many icons;
- decorative charts with no real value.

---

# 27. IEJF Admin Color Direction

Retain the established palette:

```text
Charcoal
Deep Charcoal
Warm Gold
Off-white / Paper
Slate
White
```

Gold should be used for:

- labels;
- active indicators;
- subtle accents.

Do not use gold heavily for large surfaces.

---

# 28. Responsive Sidebar

Desktop:

```text
fixed/collapsible sidebar
```

Tablet:

```text
compact/collapsible
```

Mobile:

```text
drawer / menu trigger
```

Do not remove access to any approved admin section.

---

# 29. Dashboard Mobile Header

Mobile should include:

```text
IEJF Admin Portal
[Menu]
```

Then:

```text
Dashboard
Manage your website content and publishing.
```

Summary cards and quick actions follow.

---

# 30. Account Area

Improve the bottom sidebar account area.

Current account:

```text
admin@justicefund.org.au
Log out
```

Recommended:

```text
admin@justicefund.org.au
Administrator

Log out
```

Optionally:

```text
Account settings
```

only if it leads to real functionality.

Do not expose secrets.

---

# 31. Publishing Status

If current content has unsaved/draft changes, Dashboard may show:

```text
Draft changes waiting
```

This should only be shown if the current architecture can determine it reliably.

Do not invent false status.

---

# 32. Recent Activity — Optional

A small `Recent activity` section may be added later if persistent audit logs are implemented.

Example:

```text
Published Home
Today, 7:30 AM

Updated About
Yesterday, 4:12 PM
```

Do not implement a fake activity feed from static placeholder content.

If persistent audit data is not available, leave this out.

---

# 33. Dashboard Data Sources

Dashboard values must be derived from actual CMS state.

Examples:

```text
Total Pages
→ pages.length

Published
→ pages where status === published

Drafts
→ pages where status === draft

Last Published
→ real publish metadata
```

Do not hardcode dashboard numbers.

---

# 34. Performance

Dashboard should remain lightweight.

Requirements:

- avoid unnecessary full content fetches;
- fetch summary data efficiently;
- do not load full media library;
- do not load full rich content unless required;
- avoid unnecessary client components.

---

# 35. Accessibility

Requirements:

- semantic headings;
- keyboard-accessible actions;
- visible focus states;
- accessible badges/statuses;
- proper button labels;
- table headers correctly associated;
- mobile cards maintain semantic structure;
- icons never replace important text entirely.

---

# 36. Error States

If Dashboard summary data fails:

```text
Some dashboard information could not be loaded.

[Retry]
```

Pages list should fail independently if possible.

Do not render raw Supabase/database errors.

---

# 37. Loading States

Use skeletons or subtle loading placeholders for:

- summary cards;
- pages list.

Avoid large spinners blocking the whole admin shell.

---

# 38. Functional Acceptance Criteria

## Dashboard Header

- [ ] title is `Dashboard`;
- [ ] supporting description is visible;
- [ ] oversized `Website status` heading is removed;
- [ ] last-published information remains available.

## Summary Cards

- [ ] Total Pages is real data;
- [ ] Published count is real data;
- [ ] Draft count is real data;
- [ ] Last Published is real data;
- [ ] layout adapts responsively.

## Quick Actions

- [ ] Create Page works;
- [ ] Add Insight works;
- [ ] Upload Media works;
- [ ] primary/secondary hierarchy is clear.

## Pages

- [ ] core/custom distinction is clear;
- [ ] statuses are visually consistent;
- [ ] navigation visibility is clear;
- [ ] updated date is readable;
- [ ] edit action is obvious.

## Responsive

- [ ] desktop layout balanced;
- [ ] tablet layout intentional;
- [ ] mobile uses cards instead of unusable wide table;
- [ ] no horizontal overflow.

## Sidebar

- [ ] exact approved items remain:
  - Dashboard
  - Pages
  - Insights
  - Media
  - Settings
- [ ] active state improved;
- [ ] account area improved;
- [ ] no new permanent sidebar item added.

---

# 39. UAT Scenarios

## UAT-DB-01 — Dashboard Load

Open `/admin`.

Expected:

- Dashboard title;
- site summary;
- quick actions;
- pages section;
- correct sidebar.

---

## UAT-DB-02 — Summary Accuracy

Create a new draft custom page.

Expected:

- Total Pages increases;
- Draft count increases;
- Published count does not increase.

---

## UAT-DB-03 — Publish

Publish draft page.

Expected:

- Draft count decreases;
- Published count increases;
- Last Published updates.

---

## UAT-DB-04 — Quick Create Page

Click:

```text
+ Create Page
```

Expected:

- opens current New Page flow.

---

## UAT-DB-05 — Add Insight

Click:

```text
Add Insight
```

Expected:

- opens Insights management/add flow.

---

## UAT-DB-06 — Upload Media

Click:

```text
Upload Media
```

Expected:

- opens Media Library/upload flow.

---

## UAT-DB-07 — Mobile

Open Dashboard at 390px.

Expected:

- sidebar accessible via mobile navigation;
- summary cards readable;
- quick actions usable;
- pages shown as mobile-friendly cards;
- no horizontal scrolling.

---

## UAT-DB-08 — Tablet

Open at 820px.

Expected:

- intentional tablet layout;
- page content not cramped;
- actions remain accessible.

---

# 40. Suggested Component Structure

Use existing conventions where possible.

Suggested:

```text
src/ui/admin/dashboard/
├── DashboardHeader.tsx
├── SiteSummary.tsx
├── SummaryCard.tsx
├── QuickActions.tsx
├── PagesOverview.tsx
├── PageTable.tsx
├── PageCard.tsx
└── DashboardEmptyState.tsx
```

Do not over-componentize simple markup.

---

# 41. Implementation Plan

## Stage 1 — Inspect

Before coding:

1. inspect current Dashboard;
2. inspect page data source;
3. inspect last-published source;
4. inspect current routes for New Page, Insights, Media;
5. inspect sidebar component;
6. inspect responsive admin shell.

---

## Stage 2 — Header & Summary

- replace oversized heading;
- add supporting description;
- add real summary cards;
- add public website link if appropriate.

---

## Stage 3 — Quick Actions

- group actions;
- establish button hierarchy;
- link to existing flows.

---

## Stage 4 — Pages Overview

- refine desktop table;
- improve status badges;
- improve Core badge;
- improve actions;
- improve dates.

---

## Stage 5 — Responsive Page Cards

- convert table to card presentation on narrow screens;
- validate tablet behavior.

---

## Stage 6 — Sidebar Polish

- preserve exact navigation items;
- improve active state;
- improve account area;
- retain brand direction.

---

## Stage 7 — QA

Run:

```text
typecheck
lint
production build
responsive QA
admin regression testing
```

Do not break:

- page editing;
- dynamic navigation;
- Insights;
- Media;
- Settings;
- admin auth;
- Supabase persistence.

---

# 42. Claude Implementation Guardrails

Claude must follow these rules:

1. Do not rebuild the admin architecture.
2. Do not change the approved sidebar items.
3. Keep exactly:
   - Dashboard
   - Pages
   - Insights
   - Media
   - Settings
4. Do not add Research or Navigation to the sidebar.
5. Do not change the public website UI.
6. Reuse existing routes and actions.
7. Dashboard metrics must use real data.
8. Do not invent analytics.
9. Keep visual design restrained and consistent with IEJF.
10. Do not add unnecessary dependencies.
11. Preserve authentication/security.
12. Preserve Supabase persistence.
13. Preserve existing page editing flows.
14. Keep mobile/tablet responsive.
15. Use existing design tokens before creating new ones.
16. Run typecheck, lint and build before completion.

---

# 43. Definition of Done

Dashboard improvement is complete when:

- the Dashboard has clear hierarchy;
- `Website status` oversized heading is replaced;
- real summary cards are visible;
- quick actions are clearly grouped;
- pages table is polished;
- mobile page cards work;
- tablet layout is intentional;
- sidebar remains exactly approved;
- account area is improved;
- no fake metrics are introduced;
- dashboard uses real CMS data;
- no existing CMS functionality is broken;
- typecheck passes;
- lint passes;
- production build passes;
- responsive QA passes.

---

# 44. Final Target Layout

```text
┌─────────────────────────────────────────────────────────────────┐
│ SIDEBAR        │ Dashboard                         View Website ↗│
│                │ Manage your website content and publishing.    │
│ Dashboard      │                                                 │
│ Pages          │ [4 Pages] [4 Published] [0 Drafts] [Updated]   │
│ Insights       │                                                 │
│ Media          │ Quick actions                                   │
│ Settings       │ [+ Create Page] [Add Insight] [Upload Media]   │
│                │                                                 │
│                │ Pages                              [+ New Page] │
│                │ Manage page content and publishing.             │
│                │                                                 │
│                │ Home      /         Published  Visible   Edit →│
│                │ About     /about    Published  Visible   Edit →│
│                │ Insights  /insights Published  Visible   Edit →│
│                │ Contact   /contact  Published  Visible   Edit →│
└─────────────────────────────────────────────────────────────────┘
```

The Dashboard should feel like a professional content-management workspace: clear, calm, easy to scan, and focused on the actions IEJF administrators actually need.
