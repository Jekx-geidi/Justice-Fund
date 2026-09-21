# IEJF Admin Portal — Dynamic Navigation, Live Preview & Settings PRD

**Document:** `DynamicNav.md`  
**Project:** Intergenerational Justice Fund (IEJF) Website  
**Area:** Admin Portal Phase 2 Enhancement  
**Date:** 21 September 2026  
**Status:** Ready for implementation  
**Primary implementer:** Claude / development team

---

# 1. Purpose

This PRD defines three connected improvements to the existing IEJF Admin Portal:

1. **Draggable Dynamic Navigation**
2. **Three-mode Responsive Preview only: Desktop, Tablet, Mobile**
3. **True live preview while editing page content**
4. **Improved Settings page**

The goal is to make the admin portal easier for non-technical IEJF users to understand and operate.

The admin should be able to:

- visually reorder navigation items;
- control whether a page appears in navigation;
- preview the site at only three meaningful device sizes;
- see page content update instantly while typing in admin fields;
- manage useful website/admin settings from a clearer Settings page.

These enhancements must build on the existing working admin portal.

Do not rebuild the CMS from scratch.

**Approved admin sidebar (must remain unchanged):**

```text
Dashboard
Pages
Insights
Media
Settings
```

Custom website pages are managed inside **Pages**. Their titles (for example, any future page created by the client) must never become permanent admin-sidebar modules.

---

# 2. Current Admin Baseline

The current IEJF admin already provides:

- `/admin` authentication;
- Dashboard;
- Pages;
- Insights;
- Media;
- Settings;
- core-page editing;
- custom-page creation;
- Save Draft;
- Preview;
- Publish;
- dynamic page/navigation data;
- Supabase-backed persistence;
- media stored in Supabase Storage;
- responsive admin layout.

Current navigation ordering uses persisted order values and keyboard-accessible up/down controls.

Current preview behavior already supports saved-draft preview.

This PRD improves those experiences.

---

# 3. Main Problems to Solve

## 3.1 Navigation ordering is not visual enough

The current ordering mechanism is functional, but the admin should be able to reorder navigation items naturally using drag-and-drop.

The admin must immediately understand:

> "This order is the same order visitors will see in the website menu."

---

## 3.2 Too many arbitrary responsive sizes create confusion

The admin does not need a Chrome DevTools-style list of dozens of device presets.

The CMS should expose only three meaningful preview modes:

```text
Desktop
Tablet
Mobile
```

These represent the responsive design states IEJF actually cares about.

---

## 3.3 Editing content still requires too much imagination

When the admin changes a word in an input field, textarea, or content block, the page preview should immediately reflect the new value.

The admin should not need to:

- save first;
- refresh;
- open a separate preview for every tiny change.

---

## 3.4 Settings page is too limited

The existing Settings area mainly communicates account provisioning information.

It should become a useful admin-management and site-configuration area rather than a static informational card.

---

# 4. Product Goals

The feature set should achieve the following:

- navigation order becomes visual and intuitive;
- navigation changes remain safe and explicit;
- preview is simplified to exactly three device modes;
- content fields update preview immediately;
- preview uses the actual site UI;
- unsaved preview changes never affect the live website;
- settings become genuinely useful;
- mobile/tablet admin UX remains clean;
- accessibility is preserved.

---

# 5. Non-Goals

This PRD does **not** require:

- a full WordPress-style page builder;
- arbitrary CSS editing;
- arbitrary JavaScript;
- drag-and-drop placement of content anywhere on a page;
- unlimited device presets;
- automatic publishing;
- auto-saving every keystroke to Supabase;
- a full user-management enterprise console;
- analytics dashboards;
- payment/donation settings.

---

# 6. Feature A — Draggable Dynamic Navigation

## 6.1 Goal

Allow the admin to reorder navigation items visually by dragging them.

Example:

```text
Before

☰ Home
☰ About
☰ Insights
☰ Contact
☰ Research
```

Admin drags a custom page above `Insights`.

```text
After

☰ Home
☰ About
☰ Custom Page
☰ Insights
☰ Contact
```

After saving/publishing, the public website uses that exact order.

---

# 7. Navigation Management UI

Navigation management must stay inside the existing:

```text
/admin/pages
```

Do NOT add a new sidebar item or a new top-level `/admin/navigation` section.

Preferred UX inside Pages:

```text
Navigation
────────────────────────────────

Drag pages to reorder how they appear on the website.

☰ Home                         Visible
☰ About                        Visible
☰ Insights                     Visible
☰ Contact                      Visible
☰ Custom Page                  Hidden

                    [Save Navigation]
```

---

# 8. Drag-and-Drop Requirements

Each navigation item must have:

- drag handle;
- page/navigation label;
- status;
- visibility toggle;
- page type indicator if useful;
- optional URL preview.

Recommended row:

```text
☰  About
   /about

   Published     [Show in Navigation ✓]
```

Dragging must update local admin state immediately.

The new order must not affect the public website until the admin explicitly saves/publishes according to the existing content workflow.

---

# 9. Accessibility for Navigation Ordering

Drag-and-drop must NOT be the only reordering method.

Each item must also support keyboard-accessible controls:

```text
Move Up
Move Down
```

or accessible keyboard drag-and-drop behavior.

Recommended:

```text
⋮⋮ About     ↑  ↓
```

Requirements:

- visible focus state;
- clear accessible labels;
- screen-reader announcements after reorder;
- no mouse-only interaction.

Example announcement:

```text
"About moved to position 2 of 5."
```

---

# 10. Navigation Persistence

The resulting order should update the existing navigation order field.

Example:

```text
navOrder
```

After save:

```text
Home     1
About    2
Custom Page 3
Insights 4
Contact  5
```

The public header, mobile navigation, and footer navigation must all use the same source.

Do not maintain separate manual navigation lists.

---

# 11. Navigation Visibility

Every page should support:

```text
Show in Navigation
```

Rules:

```text
Published + Visible
→ appears in navigation

Published + Hidden
→ page can exist but is not shown in menu

Draft
→ never shown publicly
```

A visibility change in admin preview may be simulated immediately.

It must not change the real public menu until saved/published.

---

# 12. Navigation Safety Rules

Core pages:

```text
Home
About
Insights
Contact
```

should remain protected from accidental deletion.

Whether they can be hidden from navigation should follow existing project rules.

Custom pages may be:

- shown;
- hidden;
- reordered;
- archived.

---

# 13. Navigation Preview

The navigation editor should include a small live representation.

Example:

```text
Website Navigation Preview

Home | About | Custom Page | Insights | Contact
```

When an item is dragged, this mini preview updates instantly.

If an item is hidden, it disappears from this preview.

This preview remains admin-only until save/publish.

---

# 14. Feature B — Exactly Three Preview Sizes

## 14.1 Goal

Replace any overly flexible or device-specific preview controls with exactly:

```text
Desktop
Tablet
Mobile
```

No phone model list.
No iPad model list.
No arbitrary DevTools-style device selector.

---

# 15. Device Preview Specifications

Use three controlled viewport presets.

## Desktop

Target preview width:

```text
1440px
```

Use the website's normal desktop layout.

---

## Tablet

Target preview width:

```text
820px
```

This represents the IEJF tablet layout.

The UI should reflect tablet-specific behavior rather than simply shrinking desktop.

---

## Mobile

Target preview width:

```text
390px
```

This represents the primary mobile experience.

---

# 16. Preview Device Toggle

Recommended control:

```text
Preview

[ Desktop ] [ Tablet ] [ Mobile ]
```

Use icons optionally:

```text
🖥 Desktop
▯ Tablet
▯ Mobile
```

Use Lucide icons if already available rather than emoji in the final implementation.

Only one mode is active at a time.

---

# 17. Preview Behavior on Admin Screen Sizes

## Large Desktop Admin

Use side-by-side:

```text
Editor | Preview
```

---

## Tablet Admin

Prefer:

```text
[ Edit ] [ Preview ]
```

or split view only when enough horizontal space exists.

---

## Mobile Admin

Use:

```text
Editor
```

and a button/tab:

```text
Preview
```

The preview opens in the same admin experience without losing unsaved changes.

---

# 18. Feature C — True Live Preview During Editing

## 18.1 Core Requirement

Every editable field should update the draft preview as soon as the admin changes it.

Example:

Admin field:

```text
Mission Statement
[ We use the law to drive systemic change... ]
```

Admin types:

```text
We use the law and research to drive systemic change...
```

The preview must immediately display:

```text
We use the law and research to drive systemic change...
```

without:

- Save Draft;
- page refresh;
- full Preview action;
- Publish.

---

# 19. Live Preview Data Flow

Required architecture:

```text
Saved Draft
    ↓
Load into Editor
    ↓
Local Form State
   ↙          ↘
Editor      Live Preview
   |
   | Save Draft
   ↓
Supabase Draft
   |
   | Publish
   ↓
Supabase Live
```

Important:

```text
Typing → local state only
```

Do NOT write every keypress to Supabase.

---

# 20. Preview Source Priority

Preview should use:

```text
1. Current unsaved local field value
2. Saved draft value
3. Existing stored value
```

The most recent editor state always wins inside the live preview.

---

# 21. Existing Full Preview Must Remain

Keep the current authenticated Full Preview.

There are now two preview concepts:

## Live Inline Preview

- embedded beside/in admin editor;
- instant;
- uses unsaved local state;
- editing aid.

## Full Preview

- opens the real page experience;
- uses saved draft;
- authenticated;
- final review before publish.

Do not remove Full Preview.

---

# 22. Page-Specific Live Preview

## Home

Live-update:

- eyebrow;
- hero heading;
- mission text;
- news quotes;
- source/attribution text;
- bottom ABN line;
- images where editable;
- page/navigation label where relevant.

---

## About

Live-update:

- main heading;
- paragraphs;
- Environment;
- Health;
- Human Rights;
- ABN/entity text;
- images.

---

## Insights

Live-update:

- title;
- category;
- summary;
- image;
- card order where practical.

---

## Contact

Live-update:

- page heading;
- location;
- email;
- editable supporting content.

---

## Custom Pages

Live-update all existing block types:

```text
Hero
RichText
ImageText
CardGrid
Quote
CTA
```

Block:

- add;
- remove;
- edit;
- reorder;

must update preview immediately.

---

# 23. Shared Rendering Requirement

The live preview must use the actual public rendering components.

Do not build a second fake design for admin preview.

Recommended:

```text
Public page
       ↓
Shared Page View
       ↑
Admin Live Preview
```

Example:

```tsx
<HomePageView content={formState} previewMode />
```

Public:

```tsx
<HomePageView content={publishedContent} />
```

---

# 24. Live Preview Field Mapping

Every admin field should have a clear relationship to the corresponding preview element.

Recommended enhancement:

When a field receives focus:

```text
Preview highlights corresponding section
```

Example:

```text
Focus: Mission Statement
→ mission paragraph receives subtle gold outline
```

This makes the admin easier to understand.

---

# 25. Live Preview Placeholder Behavior

If an input is empty during editing:

Optional field:
- hide its output if the real page would hide it.

Required field:
- show an admin-only indication if needed.

Example:

```text
[Heading preview]
```

This placeholder must never appear on the public website.

---

# 26. Unsaved Changes

When local state changes:

Show:

```text
Unsaved changes
```

After Save Draft:

```text
Draft saved
```

After Publish:

```text
Published
```

---

# 27. Preview and Publish Guards

## Clicking Full Preview with unsaved changes

Show:

```text
You have unsaved changes.

Save the latest changes before opening Full Preview?

[Cancel]
[Save Draft & Preview]
```

---

## Clicking Publish with unsaved changes

Show:

```text
You have unsaved changes.

[Cancel]
[Save Draft]
[Save & Publish]
```

Do not silently publish stale draft content.

---

# 28. Feature D — Settings Page Improvement

## 28.1 Goal

Transform the current Settings page from a mostly informational page into a useful admin settings area.

Current Settings content should no longer be limited to a message about the single account and Phase 2.

---

# 29. Settings Information Architecture

Recommended sections:

```text
Settings
├── Website
├── Admin Account
├── Security
├── Publishing
└── System Information
```

These may be:

- tabs;
- cards;
- stacked sections.

Do not overload one giant form.

---

# 30. Website Settings

Provide editable site-wide settings where appropriate.

Recommended:

```text
Organisation Name
Default Contact Email
Location
Footer Text
Default SEO Title
Default SEO Description
Logo / Brand Mark
```

Only include fields that make sense with current IEJF content.

Do not invent new client information.

---

# 31. Admin Account Settings

Show:

```text
Signed in as
admin@justicefund.org.au
```

Provide useful account actions depending on current auth architecture.

Recommended roadmap:

- display account email;
- display role;
- last login if available;
- change password if supported;
- logout other sessions if supported;
- account status.

If real password-change flow is not implemented yet, do not fake it.

Show a clear disabled/upcoming state only if necessary.

---

# 32. Security Settings

Recommended section:

```text
Security
```

Display:

- MFA status;
- session information;
- password/security guidance;
- recent login/security events if audit data exists.

If MFA is not implemented:

```text
Multi-factor authentication
Not configured
```

with appropriate future-state treatment.

Do not expose sensitive credentials.

---

# 33. Publishing Settings

Useful options may include:

```text
Default new-page state: Draft
Default navigation visibility: Hidden
Default new-page navigation position: Last
Confirm before publishing: Enabled
```

Safe defaults must remain enforced server-side.

Do not let settings weaken critical security/safety guarantees.

---

# 34. System Information

Provide non-sensitive operational information.

Example:

```text
CMS
IEJF Admin Portal

Content Storage
Supabase

Media Storage
Supabase Storage

Environment
Production / Staging / Development

Last Content Publish
21 Sep 2026, 07:30
```

Never display:

- service-role key;
- session secret;
- database password;
- raw tokens.

---

# 35. Settings Save Behavior

Editable settings should use:

```text
Save Changes
```

with:

```text
Saving...
Saved
```

Do not immediately publish site-wide changes if the setting affects draft/live content unless architecture supports it safely.

For public website settings, use the same draft/publish principle where appropriate.

---

# 36. Settings Mobile UX

The Settings page must work on narrow screens.

Desktop:
- tab/card layout.

Tablet:
- compact tabs or stacked cards.

Mobile:
- stacked sections;
- full-width fields;
- no horizontal scrolling.

---

# 37. Admin Sidebar — Must Not Change

The existing admin sidebar is approved and must remain exactly:

```text
Dashboard
Pages
Insights
Media
Settings
```

Do NOT add:

- Navigation
- Research
- Activity
- Security
- any other new top-level sidebar item

Dynamic navigation management belongs inside **Pages**.

Settings improvements belong inside **Settings**.

Use the existing visual style and active-state treatment. No sidebar redesign is required.

---

# 38. Suggested Components

```text
src/ui/admin/navigation/
├── NavigationManager.tsx
├── NavigationItem.tsx
├── NavigationPreview.tsx
└── SortableNavigationList.tsx

src/ui/admin/preview/
├── LivePreviewPane.tsx
├── PreviewToolbar.tsx
├── PreviewViewport.tsx
├── DeviceSelector.tsx
└── PreviewErrorBoundary.tsx

src/ui/admin/settings/
├── SettingsShell.tsx
├── WebsiteSettings.tsx
├── AccountSettings.tsx
├── SecuritySettings.tsx
├── PublishingSettings.tsx
└── SystemInfo.tsx
```

Use existing folder conventions if different.

---

# 39. Drag-and-Drop Library

Before installing a dependency, inspect the project.

If no sortable library exists, a lightweight accessible option may be used.

Preferred qualities:

- accessible;
- maintained;
- keyboard support;
- small dependency footprint.

Do not install a heavy UI framework only for drag-and-drop.

If practical, `dnd-kit` is acceptable.

But reuse existing project dependencies first.

---

# 40. Data Changes

Prefer reusing current:

```text
navOrder
showInNavigation
status
```

Do not create duplicate navigation-order fields.

Settings may require a persistent site-settings structure.

If a schema/database change is necessary:

- create a versioned migration;
- keep existing content compatible;
- do not manually alter production without migration.

---

# 41. Security Requirements

All navigation/settings mutations must:

- require authenticated admin session;
- validate server-side;
- retain existing CSRF/origin protections;
- write through trusted server APIs/actions.

Do not trust drag/drop order sent from client without validation.

Validate:

- page IDs;
- no duplicates;
- valid order values;
- protected core pages.

---

# 42. Preview Security

Live inline preview:

- local state only;
- admin page only.

Full Preview:

- authenticated only;
- draft must never become public;
- preview pages should not be indexed.

---

# 43. Performance Requirements

Live typing must remain smooth.

Requirements:

- no API request per keystroke;
- no Supabase update per keystroke;
- local state drives preview;
- heavy image updates may be debounced;
- avoid rerendering unrelated admin UI when possible.

Suggested debounce for expensive preview work:

```text
100–250ms
```

Normal text should feel immediate.

---

# 44. Error Handling

## Navigation Save Failure

```text
Navigation order could not be saved.
Your current arrangement is still visible in the editor.
Please try again.
```

## Preview Failure

```text
Preview unavailable.

Your edits have not been lost.
```

## Settings Save Failure

```text
Settings could not be saved.
Please try again.
```

Do not erase form state after a failed request.

---

# 45. Accessibility

Required:

- drag handles accessible;
- keyboard reorder available;
- device selectors keyboard accessible;
- screen-reader labels;
- visible focus;
- dialogs accessible;
- form labels;
- no color-only status indication.

---

# 46. Responsive Requirements

Test:

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

Specifically verify:

- draggable navigation list;
- admin sidebar;
- Editor/Preview switching;
- three device preview controls;
- Settings sections;
- sticky action bar;
- modals/dialogs.

---

# 47. Functional Acceptance Criteria

## Dynamic Navigation

- [ ] admin can drag navigation item;
- [ ] local navigation preview updates immediately;
- [ ] keyboard reorder works;
- [ ] visibility toggle works;
- [ ] save persists order;
- [ ] desktop menu uses saved order;
- [ ] mobile menu uses saved order;
- [ ] footer uses saved order;
- [ ] draft pages do not appear publicly.

## Three Preview Sizes

- [ ] only Desktop, Tablet, Mobile are shown;
- [ ] Desktop represents ~1440px;
- [ ] Tablet represents ~820px;
- [ ] Mobile represents ~390px;
- [ ] no device-model dropdown exists in admin preview.

## Live Editing Preview

- [ ] text change updates preview immediately;
- [ ] image change updates preview;
- [ ] custom blocks update;
- [ ] block reorder updates;
- [ ] no database write occurs solely from typing;
- [ ] public site remains unchanged until Publish.

## Settings

- [ ] Settings is divided into useful sections;
- [ ] signed-in user details are clear;
- [ ] website settings are editable where supported;
- [ ] publishing defaults are visible;
- [ ] system information is shown safely;
- [ ] no secrets are exposed.

---

# 48. UAT Scenarios

## UAT-DN-01 — Drag Navigation

1. Open Navigation.
2. Drag Contact above Insights.
3. Verify local preview updates.
4. Save.
5. Publish if required.
6. Verify public desktop/mobile/footer order.

---

## UAT-DN-02 — Keyboard Reorder

1. Focus About.
2. Use Move Down.
3. Verify order changes.
4. Verify accessible announcement.

---

## UAT-DN-03 — Hide Page

1. Disable Show in Navigation on custom page.
2. Save/publish.
3. Verify page disappears from all navigation.
4. Verify route behavior follows existing publication rules.

---

## UAT-PV-01 — Desktop Preview

Select Desktop.

Verify desktop site layout.

---

## UAT-PV-02 — Tablet Preview

Select Tablet.

Verify tablet-specific responsive layout.

---

## UAT-PV-03 — Mobile Preview

Select Mobile.

Verify mobile layout and mobile navigation behavior.

---

## UAT-LP-01 — Text Input

Change Home mission text.

Expected:

- preview changes immediately;
- public site remains unchanged.

---

## UAT-LP-02 — About Focus Card

Edit Health description.

Expected:

- Health card preview updates;
- other cards remain intact.

---

## UAT-LP-03 — Custom Block

Edit custom-page Hero heading.

Expected:

- Hero preview updates instantly.

---

## UAT-LP-04 — Unsaved Full Preview

Edit content without saving.

Click Full Preview.

Expected:

- Save Draft & Preview prompt.

---

## UAT-ST-01 — Settings

Open Settings.

Expected:

- Website;
- Admin Account;
- Security;
- Publishing;
- System Information;

are clearly discoverable.

---

## UAT-ST-02 — Mobile Settings

Open Settings at 390px.

Expected:

- sections stack cleanly;
- no overflow;
- controls remain usable.

---

# 49. Implementation Plan

## Stage 1 — Inspect Existing Code

Before modifying anything:

1. inspect current Pages editor;
2. inspect current navigation-order logic;
3. inspect header/mobile/footer navigation source;
4. inspect current full Preview implementation;
5. inspect form state architecture;
6. inspect Settings page;
7. inspect Supabase content/settings structures.

Then write a short implementation plan.

---

## Stage 2 — Shared Live Preview

- extract/reuse public page view components;
- connect local editor state;
- implement Preview pane;
- implement Desktop/Tablet/Mobile selector;
- keep Full Preview.

---

## Stage 3 — Draggable Navigation

- build Navigation manager;
- add drag-and-drop;
- keep keyboard reorder;
- persist `navOrder`;
- add mini navigation preview.

---

## Stage 4 — Settings Redesign

- create sectioned Settings UI;
- connect real supported settings;
- improve account/system presentation;
- do not fake unsupported account features.

---

## Stage 5 — Responsive Polish

- desktop split view;
- tablet Editor/Preview modes;
- mobile Editor/Preview;
- navigation drag UI responsive;
- Settings responsive.

---

## Stage 6 — Regression Testing

Re-test:

- login;
- core-page edits;
- custom pages;
- Save Draft;
- Full Preview;
- Publish;
- dynamic navigation;
- Insights;
- Media;
- Supabase persistence;
- Supabase Storage.

---

# 50. Claude Implementation Guardrails

Claude must follow these rules:

1. Do not rebuild the admin portal.
2. Treat current v1 as working baseline.
3. Do not redesign the public IEJF website.
4. Preserve Save Draft / Full Preview / Publish.
5. Live preview must use local unsaved form state.
6. Never auto-publish.
7. Do not write every keypress to Supabase.
8. Reuse actual public page components.
9. Keep only three admin preview sizes: Desktop, Tablet, Mobile.
10. Do not add phone-model/device-model selectors.
11. Drag-and-drop must have keyboard alternative.
12. Preserve current dynamic navigation source.
13. Do not create a second navigation database/source.
14. Do not expose secrets in Settings.
15. Do not pretend unsupported settings work.
16. Keep Supabase persistence intact.
17. Keep Supabase Storage intact.
18. Preserve auth and API security.
19. Use database migrations if persistence schema changes.
20. Run typecheck, lint, build, and regression tests before completion.
21. Keep the sidebar exactly: Dashboard, Pages, Insights, Media, Settings.
22. Do not add Research or Navigation as sidebar items.
23. Any custom page name is content managed under Pages, not a permanent admin navigation item.

---

# 51. Definition of Done

This feature package is complete when:

- navigation is draggable;
- keyboard navigation reorder remains available;
- navigation order persists;
- public desktop/mobile/footer menus share the same order;
- only Desktop/Tablet/Mobile preview modes exist;
- page fields update the embedded preview while typing;
- custom-page blocks update live;
- unsaved preview changes do not affect live content;
- Full Preview remains available;
- Settings page is meaningfully improved;
- settings contain no exposed secrets;
- admin remains responsive;
- existing CMS functionality is not broken;
- typecheck passes;
- lint passes;
- production build passes;
- regression/UAT flows pass.

---

# 52. Final Target Experience

The target admin experience should feel like:

```text
LOGIN
  ↓
EDIT PAGE
  ↓
TYPE CONTENT
  ↓
SEE ACTUAL PAGE CHANGE IMMEDIATELY
  ↓
CHECK DESKTOP / TABLET / MOBILE
  ↓
SAVE DRAFT
  ↓
FULL PREVIEW
  ↓
PUBLISH
```

For navigation:

```text
OPEN NAVIGATION
  ↓
DRAG ITEMS INTO ORDER
  ↓
SHOW / HIDE ITEMS
  ↓
SEE MENU PREVIEW
  ↓
SAVE / PUBLISH
  ↓
PUBLIC MENU UPDATES
```

For Settings:

```text
OPEN SETTINGS
  ↓
MANAGE WEBSITE / ACCOUNT / SECURITY / PUBLISHING SETTINGS
  ↓
SAVE
```

The overall goal is to make the IEJF Admin Portal visual, intuitive, safe, and easy for a non-technical administrator to use.
