# IEJF Admin Portal — Editor Preferences & Extensible Page Sections PRD

Pasted by the client 2026-09-21. Two connected features, split into 9 implementation
phases (see "Implementation Plan" in the PRD body). Kept here verbatim so future
sessions have the full spec without depending on chat history.

**Status:** Phase 1 (Settings → Editor & Preview preferences UI + persistence) done.
Phases 2–9 (wiring into the page editor, extensible page sections/page-builder) not
started. See `admin-build-status.md` for the running "done and verified" ledger.

## Phase 1 implementation notes (2026-09-21)

- New Settings tab **Editor & Preview** (`src/ui/admin/settings/EditorPreferencesForm.tsx`),
  persisted via `src/lib/settings/editorPreferences.ts` (Supabase `editor_preferences`
  singleton-row table, same jsonb-column pattern as other settings; local-JSON fallback
  when Supabase isn't configured).
- **Requires running `supabase/migrations/0010_editor_preferences.sql` in the Supabase
  SQL Editor** before Save actually persists — same manual-migration constraint as every
  other table in this project (no exec-SQL RPC available to the service-role key). Until
  that migration runs, reads gracefully fall back to defaults and writes fail with a
  visible "could not be saved" error (verified, not a code bug).
- Deliberately **not yet wired into the editor**: `AdminEditorLayout.tsx` and
  `PreviewViewport.tsx` (live preview / device-width logic) were mid-edit by a
  concurrent agent (Codex) when this phase was built, so Phase 2 (actually making
  live preview/auto-save/preview-device toggles affect editor behavior) was deferred
  to avoid a collision. The preferences UI says as much to the admin ("These
  preferences are saved now. The page editor will start honoring live preview,
  auto-save, and preview device behavior from them in an upcoming update.").
- Added `MaterialSwitch` to `src/ui/admin/material/MaterialControls.tsx` (this repo's
  own Material Web wrapper set, not Codex's Insights-only one — see
  `docs/admin-build-status.md` / project memory on the two parallel MaterialControls
  files) since the PRD calls for switches specifically.

---

<!-- Original PRD text below, verbatim except for minor Markdown-fence escaping. -->

# IEJF Admin Portal — Editor Preferences & Extensible Page Sections PRD

**Project:** Intergenerational Justice Fund (IEJF) Website
**Area:** Admin Portal — Settings + Pages
**Status:** Ready for implementation
**Priority:** Phase 2
**Primary goal:** Improve editing UX and allow existing pages to grow without developer intervention.

---

# 1. IMPORTANT CONTEXT

The IEJF Admin Portal is already working.

Current stack:

- Next.js
- React
- TypeScript
- Tailwind CSS
- Supabase
- Supabase Storage
- Custom `/admin`
- Draft / Preview / Publish workflow
- Dynamic navigation
- Live draft preview
- Media Library
- Existing core pages:
  - Home
  - About
  - Insights
  - Contact

Do NOT rebuild the CMS from scratch.

Do NOT replace the current public IEJF design.

Do NOT remove existing functionality.

The approved admin sidebar MUST remain exactly:

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
- Sections
- Activity
- Security
- Users

as permanent sidebar modules.

New functionality must live inside the existing **Pages** and **Settings** areas.

---

# 2. PURPOSE

This PRD defines two connected improvements:

## A. Settings — Editor & Preview Preferences

Allow administrators to control:

- live preview while editing;
- draft autosave;
- autosave delay;
- preview device presets;
- custom preview widths;
- default preview device;
- preview behavior;
- unsaved-change protection.

## B. Pages — Extensible Sections

Allow administrators to:

- continue editing existing core page content;
- add new content sections to existing pages;
- reorder added sections;
- hide/show sections;
- duplicate sections;
- delete sections;
- preview added sections instantly;
- save them as draft;
- publish them without changing source code.

The goal is to evolve IEJF from:

```text
Edit fixed fields only
```

into:

```text
Edit fixed core content
+
Add controlled new sections
```

without turning the website into an unrestricted page builder.

---

# 3. CORE PRODUCT PRINCIPLE

There are THREE separate concepts:

```text
LIVE PREVIEW
= visual only
= local React state
= immediate

AUTO-SAVE
= saves current state to DRAFT
= never publishes

PUBLISH
= changes the PUBLIC website
= explicit action only
```

These concepts must NEVER be merged.

---

# 4. LIVE PREVIEW

## 4.1 Definition

When Live Preview is enabled:

```text
Admin types
↓
Local form state changes
↓
Preview changes immediately
```

No Save Draft is required just to see the visual result.

Example:

Admin edits:

```text
Mission Statement

Old:
We use the law to drive systemic change...

New:
We use the law and research to drive systemic change...
```

The preview must immediately render:

```text
We use the law and research to drive systemic change...
```

---

# 5. LIVE PREVIEW MUST NOT

Live Preview must NOT:

- publish;
- write every keypress to Supabase;
- change live website content;
- expose draft content to public visitors;
- require a page refresh;
- require Save Draft before visual feedback.

---

# 6. SETTINGS — NEW STRUCTURE

Improve the Settings area into:

```text
Settings

Website
Editor & Preview
Publishing
Media
Admin Account
Security
System Information
```

If this creates too many horizontal tabs on small screens, use:

- responsive tab scrolling;
- grouped navigation;
- stacked settings navigation.

Do NOT create new sidebar items.

---

# 7. SETTINGS — EDITOR & PREVIEW

Create a dedicated section:

```text
Editor & Preview
```

This is where the administrator controls editing behavior.

---

# 8. LIVE PREVIEW SETTING

Setting:

```text
Live preview while editing
[ ON / OFF ]
```

Description:

```text
Show changes in the page preview as you edit.
```

## When ON

```text
Edit field
↓
Preview updates immediately
```

## When OFF

The embedded preview does not update continuously.

The existing:

```text
Preview
```

or:

```text
Full Preview
```

workflow remains available.

Default:

```text
ON
```

---

# 9. AUTO-SAVE SETTING

Separate setting:

```text
Auto-save draft while editing
[ ON / OFF ]
```

Description:

```text
Automatically save your draft after you stop editing.
```

This is completely separate from Live Preview.

---

# 10. AUTO-SAVE ON

When enabled:

```text
Admin edits
↓
Live Preview updates locally
↓
Admin stops typing
↓
Wait configured delay
↓
Save Draft automatically
↓
Supabase draft updates
```

Recommended default delay:

```text
2 seconds
```

Use debounce.

Do NOT save on every individual keystroke.

---

# 11. AUTO-SAVE OFF

When disabled:

The administrator may make multiple/bulk changes.

Example:

```text
Edit Hero
Edit Mission
Edit Quotes
Change Image
Add Section
Reorder Sections
```

All changes remain in local editor state.

Live Preview can still show them.

Then:

```text
Save Draft
```

saves everything once.

This mode is important for bulk editing.

---

# 12. AUTO-SAVE DELAY

Only show when Auto-save is ON.

Setting:

```text
Auto-save delay

[ 1 second ]
[ 2 seconds ]
[ 3 seconds ]
[ 5 seconds ]
```

Recommended default:

```text
2 seconds
```

Do not allow extremely short intervals that create excessive Supabase writes.

---

# 13. AUTO-SAVE STATUS

Editor must clearly show:

```text
Unsaved changes
Saving...
Draft saved
Save failed
```

Example:

```text
● Unsaved changes
```

then:

```text
Saving...
```

then:

```text
✓ Draft saved
```

---

# 14. AUTO-SAVE FAILURE

If auto-save fails:

Do NOT lose local changes.

Show:

```text
Auto-save failed.

Your changes are still in the editor.

[Retry]
```

Public content remains untouched.

---

# 15. MANUAL SAVE MUST REMAIN

Even when Auto-save is enabled, retain:

```text
Save Draft
```

Manual Save Draft remains useful for:

- immediate save;
- explicit confirmation;
- network recovery.

---

# 16. PREVIEW DEVICE SETTINGS

Create:

```text
Preview Devices
```

Default presets:

```text
☑ Desktop
☑ Tablet
☑ Mobile
```

Only enabled devices appear in the page editor's preview selector.

---

# 17. DEFAULT DEVICE WIDTHS

Use:

```text
Desktop
1440px

Tablet
820px

Mobile
390px
```

These values represent preview viewport widths.

IMPORTANT:

These settings DO NOT change the actual CSS breakpoints of the public website.

They only control simulated admin preview widths.

---

# 18. DEVICE ENABLE / DISABLE

Example:

```text
☑ Desktop
☐ Tablet
☑ Mobile
```

Then the editor preview selector shows ONLY:

```text
[ Desktop ] [ Mobile ]
```

Tablet must disappear from the selector.

---

# 19. CUSTOM PREVIEW DEVICES

Allow:

```text
+ Add Custom Preview
```

Form:

```text
Name
[ Small Mobile ]

Width
[ 375 ] px

Enabled
[✓]
```

Another example:

```text
Large Tablet
1024px
```

Custom preview devices are admin preferences only.

They do NOT alter website CSS.

---

# 20. CUSTOM DEVICE RULES

Validate:

```text
Minimum width: 280px
Maximum width: 2560px
```

Require:

- name;
- width;
- unique usable ID.

Height may remain automatic.

Width is the primary responsive measurement.

---

# 21. DEFAULT PREVIEW DEVICE

Setting:

```text
Default Preview Device

[ Desktop ▼ ]
```

Options come from currently enabled devices.

---

# 22. REMEMBER LAST DEVICE

Setting:

```text
Remember my last selected preview device
[ ON ]
```

If enabled:

Admin selects Mobile.

Next time editor opens:

```text
Mobile
```

remains selected.

---

# 23. FIELD-TO-PREVIEW HIGHLIGHT

Setting:

```text
Highlight the section I am editing
[ ON ]
```

When ON:

Admin focuses:

```text
Mission Statement
```

Preview subtly highlights the mission area.

Use:

- subtle warm-gold outline;
- soft temporary background;
- scroll into view if appropriate.

Do not use distracting animation.

---

# 24. WARN ABOUT UNSAVED CHANGES

Setting:

```text
Warn me before leaving with unsaved changes
[ ON ]
```

Recommended default:

```text
ON
```

If Auto-save OFF and unsaved changes exist:

show navigation/browser warning.

---

# 25. PUBLISHING SETTINGS

Improve:

```text
Publishing
```

with safe defaults.

Recommended options:

```text
New pages start as Draft
[ ON / locked ON ]

New pages hidden from navigation by default
[ ON ]

Confirm before publishing
[ ON ]

Require Full Preview before publishing
[ ON / OFF ]
```

---

# 26. FULL PREVIEW BEFORE PUBLISH

If:

```text
Require Full Preview before publishing = ON
```

and the current saved draft has not been previewed:

When clicking Publish:

```text
Please review this draft before publishing.

[Cancel]
[Open Full Preview]
```

After preview:

Publish becomes available.

Do NOT apply this requirement if it creates an impossible workflow.

---

# 27. PAGE EDITOR — CURRENT CORE CONTENT

Existing page-specific content must remain.

For example Home currently contains:

```text
Page Settings
Eyebrow
Mission
Bottom Identity Line
Hero Image
News Quotes
```

Do NOT replace these with generic blocks.

These are protected core content.

---

# 28. NEW REQUIREMENT — ADD SECTIONS

Every existing core page should support:

```text
+ Add Section
```

This allows future growth without developer code changes.

---

# 29. HYBRID PAGE BUILDER

Use a HYBRID approach.

```text
CORE PAGE CONTENT
+
ADMIN-ADDED SECTIONS
```

Example:

```text
Home

CORE
├── Hero
├── Mission
├── News
└── Existing CTA

CUSTOM
├── Research Section
├── Impact Section
└── New Feature Section
```

Core design remains protected.

Custom content remains flexible.

---

# 30. DO NOT BUILD A FREE-FORM PAGE BUILDER

Do NOT allow:

- arbitrary HTML;
- arbitrary CSS;
- arbitrary JavaScript;
- absolute-position dragging;
- free-form canvas placement;
- arbitrary layout code.

Use controlled reusable section templates.

---

# 31. ADD SECTION BUTTON

Place:

```text
+ Add Section
```

in the Page editor.

Recommended location:

After core content or within controlled section zones.

---

# 32. SECTION PICKER

Clicking:

```text
+ Add Section
```

opens:

```text
Choose a section
```

Supported types:

```text
Text Section
Image + Text
Card Grid
Quote
Call to Action
Feature Image
Divider
```

Use existing block renderer where possible.

---

# 33. TEXT SECTION

Fields:

```text
Eyebrow (optional)
Heading
Body
Alignment
```

---

# 34. IMAGE + TEXT

Fields:

```text
Eyebrow
Heading
Body
Image
Image Alt Text
Image Position

Left
Right
```

Use Media Picker.

---

# 35. CARD GRID

Fields:

```text
Eyebrow
Section Heading

Cards:
- Title
- Description
- Optional Image/Icon
```

Allow adding/removing cards.

Use sensible maximum where appropriate.

---

# 36. QUOTE

Fields:

```text
Quote
Attribution
Optional Source
```

---

# 37. CALL TO ACTION

Fields:

```text
Heading
Body
Button Label
Button URL
```

Only use if approved by IEJF content.

Do not automatically invent CTA wording.

---

# 38. FEATURE IMAGE

Fields:

```text
Image
Alt Text
Caption optional
Display style
```

Possible controlled styles:

```text
Full Width
Contained
```

---

# 39. DIVIDER

Simple controlled visual divider.

No arbitrary styling controls.

---

# 40. SECTION ZONES

Do NOT initially allow admin-added sections to freely interrupt every protected core section.

Use controlled zones.

Example Home:

```text
Hero — CORE

[ Add Section Here ]

News — CORE

[ Add Section Here ]

CTA / Bottom Section — CORE

[ Add Section Here ]

Footer
```

---

# 41. SECTION POSITION

When creating/moving a section:

Allow:

```text
After Hero
After News
Before Footer
```

Actual available zones depend on page.

Each core page may define its own valid zones.

---

# 42. WHY USE ZONES

Section Zones protect:

- visual hierarchy;
- responsive design;
- IEJF branding;
- essential core-page structure.

The client gains flexibility without being able to accidentally destroy the page design.

---

# 43. SECTION LIST

Under page editor:

```text
Additional Sections

⋮⋮ Our Research
   Image + Text
   Visible

⋮⋮ Our Approach
   Card Grid
   Visible

[+ Add Section]
```

---

# 44. DRAG-AND-DROP SECTION ORDER

Allow drag-and-drop within the same zone.

Example:

Before:

```text
Research
Our Approach
Future Generations
```

After drag:

```text
Our Approach
Research
Future Generations
```

Live Preview updates immediately.

---

# 45. KEYBOARD REORDER

Drag cannot be the only method.

Provide:

```text
Move Up
Move Down
```

with keyboard accessibility.

Screen readers should receive an appropriate reorder announcement where practical.

---

# 46. SECTION ACTIONS

Each custom section should support:

```text
Edit
Hide / Show
Duplicate
Move
Delete
```

---

# 47. DUPLICATE SECTION

Useful for repeated layouts.

Flow:

```text
Duplicate
↓
Create new section with copied content
↓
Generate new unique ID
↓
Place immediately below original
```

Do not share the same ID.

---

# 48. HIDE SECTION

Setting:

```text
Visible
[ ON / OFF ]
```

If OFF:

- section remains saved;
- editor retains content;
- public page does not render it.

Preview should visually indicate hidden state or allow "show hidden sections" in admin if useful.

---

# 49. DELETE SECTION

Require confirmation:

```text
Delete "Our Research"?

This section will be removed from the draft.

[Cancel]
[Delete]
```

Publishing behavior still follows existing draft/live model.

---

# 50. LIVE PREVIEW FOR SECTIONS

When adding/editing custom sections:

```text
Local section state
↓
Live Preview
```

must update immediately.

No Save required for visual preview.

---

# 51. AUTO-SAVE + SECTIONS

If Auto-save ON:

```text
Edit section
↓
Preview changes
↓
Stop editing
↓
Delay
↓
Auto-save Draft
```

If Auto-save OFF:

```text
Edit multiple sections
↓
Preview everything
↓
Save Draft once
```

---

# 52. SECTION DATA MODEL

Do not perform a massive database rewrite if unnecessary.

Current Supabase content can evolve to support:

```ts
type AddedSection = {
  id: string;
  type: SectionType;
  zone: string;
  order: number;
  visible: boolean;
  content: Record<string, unknown>;
};
```

Page example:

```ts
type HomeContent = {
  eyebrow: string;
  mission: string;
  heroImage: MediaReference | null;
  quotes: Quote[];

  additionalSections: AddedSection[];
};
```

---

# 53. EXAMPLE STORED SECTION

```json
{
  "id": "section_01JXYZ",
  "type": "image_text",
  "zone": "after_news",
  "order": 1,
  "visible": true,
  "content": {
    "eyebrow": "OUR WORK",
    "heading": "Research for future generations",
    "body": "Approved content...",
    "imageMediaId": "media-uuid",
    "imagePosition": "right"
  }
}
```

---

# 54. UNIQUE IDS

Every new or duplicated section must receive a stable unique ID.

Do not use array index as persistent identity.

---

# 55. MEDIA PICKER

Section image controls should use the existing Media Library.

Flow:

```text
Choose Image
↓
Media Picker
↓
Search / Filter
↓
Select
↓
Section preview updates
```

Do not require raw URL copy/paste for normal admin use.

---

# 56. PREVIEW DEVICE TOOLBAR

The page editor preview selector must load enabled devices from Settings.

Example Settings:

```text
Desktop ✓
Tablet ✓
Mobile ✓
Small Mobile ✓
```

Editor displays:

```text
[ Desktop ▼ ]
```

with only enabled presets.

---

# 57. IF ONLY THREE DEFAULTS ARE ENABLED

Editor shows only:

```text
Desktop
Tablet
Mobile
```

No device-model list.

No Chrome DevTools-like picker.

---

# 58. PAGE EDITOR LAYOUT

Recommended desktop:

```text
┌──────────────┬──────────────────────────────┬───────────────────────┐
│ Sidebar      │ Editor                       │ Live Draft Preview    │
│              │                              │                       │
│ Pages        │ Core Page Settings           │ [Desktop ▼]          │
│              │ Core Content                 │                       │
│              │                              │ Actual Page           │
│              │ Additional Sections          │                       │
│              │ [+ Add Section]              │                       │
│              │                              │                       │
│              │ Save / Preview / Publish     │                       │
└──────────────┴──────────────────────────────┴───────────────────────┘
```

---

# 59. TABLET EDITOR

Use:

```text
[ Editor ] [ Preview ]
```

rather than an unusably narrow split view.

State must remain intact when switching tabs.

---

# 60. MOBILE EDITOR

Use:

```text
Editor
```

with sticky action:

```text
Preview
```

Preview opens full-width inside admin.

Unsaved local state must remain intact.

---

# 61. STICKY ACTION BAR

Recommended:

```text
Unsaved changes

[Save Draft]
[Full Preview]
[Publish]
```

If Auto-save ON:

Save Draft remains available.

Status may show:

```text
Draft saved automatically
```

---

# 62. SETTINGS — WEBSITE

Useful editable fields:

```text
Organisation Name
Contact Email
Location
Footer Text
Default SEO Title
Default SEO Description
Logo / Brand Mark
Default Social Preview Image
```

Only implement supported/real fields.

Do not invent client data.

---

# 63. SETTINGS — MEDIA

Recommended:

```text
Require alt text before publish
[ ON ]

Default Media Category
[ Shared ▼ ]

Warn before deleting used media
[ ON ]

Maximum Upload Size
8 MB
```

Do not create a control that falsely changes a server-enforced value unless actually wired.

---

# 64. SETTINGS — ADMIN ACCOUNT

Show:

```text
Email
Role
Last Login
Session information
```

Actions only if truly supported:

```text
Change Password
Sign Out
Manage Sessions
```

Do not create fake non-functional account controls.

---

# 65. SETTINGS — SECURITY

Show useful real information:

```text
Multi-factor authentication
Not configured

Session length
8 hours

Login rate limit
5 attempts / 15 minutes

Recent Security Events
```

If MFA setup becomes implemented later:

```text
Set up MFA
```

may become actionable.

---

# 66. SETTINGS — SYSTEM INFORMATION

Show:

```text
Environment
CMS Version
Content Storage
Media Storage
Last Published
Application Version
```

Optional health:

```text
Database      Connected
Media Storage Connected
Authentication Operational
```

Do not expose:

- Supabase service-role key;
- session secret;
- database password;
- raw JWT;
- environment secrets.

---

# 67. EDITOR PREFERENCES PERSISTENCE

Editor preferences should persist per admin where practical.

Examples:

```text
livePreviewEnabled
autoSaveEnabled
autoSaveDelay
enabledPreviewDevices
defaultPreviewDevice
rememberLastPreview
highlightActiveField
warnUnsavedChanges
```

If there is currently only one admin account, a global/admin preference record is acceptable initially.

Design so per-user preferences can be supported later.

---

# 68. PUBLIC WEBSITE SAFETY

None of these Settings should automatically alter public content except through the normal publishing workflow.

Especially:

```text
Preview device width
```

must NEVER alter production breakpoints.

---

# 69. PERFORMANCE

Live preview:

- local state;
- no request per keypress.

Autosave:

- debounced;
- cancel pending save if new edits arrive;
- handle race conditions;
- latest content wins safely.

Use AbortController/versioning or equivalent where useful.

---

# 70. AUTO-SAVE RACE CONDITION

Do not allow:

```text
Save A starts
Save B starts
Save B finishes
Save A finishes later
```

and accidentally overwrite newer data.

Use sequencing/version guard.

---

# 71. AUTO-SAVE WHILE PUBLISHING

Before Publish:

Ensure pending auto-save is either:

- completed;
- cancelled and current local state explicitly saved.

Publish must use the latest intended state.

---

# 72. AUTO-SAVE WHILE NAVIGATING

If pending auto-save exists and user leaves:

Attempt safe completion or warn appropriately.

Do not silently discard current local state.

---

# 73. ACCESSIBILITY

Requirements:

- switches keyboard accessible;
- Add Section picker accessible;
- drag reorder has keyboard alternative;
- dialogs accessible;
- device selector labelled;
- preview highlight not color-only;
- visible focus;
- meaningful action labels.

---

# 74. MATERIAL WEB

The project may use Material Web components inside Admin where already approved.

Good candidates:

```text
Switches
Text fields
Dialogs
Selects
Buttons
Tabs
```

Continue using Tailwind for:

```text
Layout
Spacing
Responsive design
```

Do not redesign the public website into Material Design.

---

# 75. ERROR STATES

## Auto-save failure

```text
Auto-save failed.
Your unsaved changes are still available.

[Retry]
```

## Section render failure

```text
This section could not be previewed.

Your content has not been lost.
```

## Settings failure

```text
Settings could not be saved.

[Retry]
```

Do not clear local state.

---

# 76. FUNCTIONAL ACCEPTANCE CRITERIA

## Live Preview

- [ ] toggle exists in Settings;
- [ ] ON updates preview while typing;
- [ ] OFF disables continuous live updates;
- [ ] no public content changes from preview.

## Auto-save

- [ ] separate toggle exists;
- [ ] configurable delay exists;
- [ ] auto-save saves Draft only;
- [ ] manual Save Draft still exists;
- [ ] public website does not change;
- [ ] failure does not lose local edits;
- [ ] race condition is handled.

## Preview Devices

- [ ] Desktop can be enabled/disabled;
- [ ] Tablet can be enabled/disabled;
- [ ] Mobile can be enabled/disabled;
- [ ] custom width can be added;
- [ ] only enabled presets appear in preview selector;
- [ ] default device works;
- [ ] preview widths do not alter CSS breakpoints.

## Add Sections

- [ ] existing core page can add a section;
- [ ] supported section picker exists;
- [ ] added section previews immediately;
- [ ] added sections save to Draft;
- [ ] sections can be reordered;
- [ ] keyboard reorder exists;
- [ ] sections can be hidden;
- [ ] sections can be duplicated;
- [ ] sections can be deleted;
- [ ] section zones protect core layout;
- [ ] Publish renders visible sections publicly.

---

# 77. UAT — AUTO-SAVE ON

1. Enable Live Preview.
2. Enable Auto-save.
3. Set delay to 2 seconds.
4. Open Home.
5. Edit Mission.
6. Confirm preview changes immediately.
7. Wait.
8. Confirm status:
   `Draft saved`.
9. Refresh admin.
10. Confirm draft edit persists.
11. Confirm public website remains unchanged until Publish.

---

# 78. UAT — AUTO-SAVE OFF

1. Enable Live Preview.
2. Disable Auto-save.
3. Edit:

   - mission;
   - quote;
   - image;
   - bottom line.
4. Confirm preview updates.
5. Confirm Supabase draft has not been saved yet.
6. Click Save Draft.
7. Refresh.
8. Confirm all changes persist together.

---

# 79. UAT — PREVIEW DEVICES

Settings:

```text
Desktop ✓
Tablet ✗
Mobile ✓
375 Custom ✓
```

Open page editor.

Expected selector:

```text
Desktop
Mobile
375 Custom
```

Tablet must not appear.

---

# 80. UAT — ADD SECTION

1. Open Home.
2. Click Add Section.
3. Select Image + Text.
4. Enter heading/body.
5. Select image.
6. Choose After News.
7. Confirm live preview immediately shows the section.
8. Save Draft.
9. Refresh.
10. Confirm section persists.
11. Publish.
12. Confirm public Home includes section.

---

# 81. UAT — SECTION REORDER

1. Create two custom sections in same zone.
2. Drag second above first.
3. Confirm preview updates.
4. Save.
5. Refresh.
6. Confirm order persists.

Repeat with keyboard Move Up/Down.

---

# 82. UAT — HIDE SECTION

1. Disable Visible.
2. Preview.
3. Confirm public-style preview excludes it.
4. Save/Publish.
5. Confirm live website excludes it.
6. Re-enable later and publish.
7. Confirm content returns.

---

# 83. UAT — DUPLICATE

1. Duplicate custom section.
2. Confirm copied content exists.
3. Confirm new unique ID.
4. Edit duplicate.
5. Confirm original remains unchanged.

---

# 84. UAT — BULK EDIT

1. Auto-save OFF.
2. Make several page edits.
3. Add section.
4. Reorder section.
5. Change image.
6. Confirm Live Preview reflects all local state.
7. Click Save Draft once.
8. Confirm all changes save together.

This is a critical scenario.

---

# 85. IMPLEMENTATION PLAN

## Phase 1 — Settings Preferences

Implement:

- Live Preview toggle;
- Auto-save toggle;
- Auto-save delay;
- enabled preview devices;
- custom preview sizes;
- default device;
- unsaved warning;
- field highlight preference.

---

## Phase 2 — Page Editor Integration

Wire preferences into existing page editor.

Implement:

- Live Preview ON/OFF behavior;
- debounced auto-save;
- save state indicator;
- preview device filtering.

---

## Phase 3 — Section Model

Extend current content model with:

```text
additionalSections[]
```

for core pages.

Create validation schemas.

---

## Phase 4 — Section Picker

Implement controlled section types.

Reuse current BlockRenderer where possible.

---

## Phase 5 — Section Editor

Implement:

- edit;
- Media Picker;
- visibility;
- duplicate;
- delete;
- zone.

---

## Phase 6 — Reordering

Implement:

- drag-and-drop;
- keyboard Move Up/Down;
- persistence.

---

## Phase 7 — Live Section Preview

Bind local section state directly into existing public renderer.

---

## Phase 8 — Responsive UX

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

---

## Phase 9 — Regression

Verify existing:

- login;
- Dashboard;
- Pages;
- Insights;
- Media;
- Settings;
- dynamic navigation;
- Save Draft;
- Preview;
- Publish;
- History;
- Supabase content persistence;
- Supabase Storage.

---

# 86. CLAUDE IMPLEMENTATION GUARDRAILS

Follow these strictly:

1. Inspect the current codebase first.
2. Do not rebuild the CMS.
3. Do not change the approved admin sidebar.
4. Keep exactly:

   - Dashboard
   - Pages
   - Insights
   - Media
   - Settings
5. Do not redesign the public IEJF site.
6. Preserve current core page layouts.
7. Implement hybrid pages: core content + custom sections.
8. Do not allow arbitrary HTML/CSS/JS.
9. Live Preview must use local state.
10. Auto-save must save Draft only.
11. Never auto-publish.
12. Manual Save Draft must remain.
13. Full Preview must remain.
14. Handle autosave race conditions.
15. Preview device preferences must not alter CSS breakpoints.
16. Reuse existing BlockRenderer where practical.
17. Reuse Media Library/Media Picker.
18. Preserve Supabase content persistence.
19. Preserve Supabase Storage.
20. Use migrations/schema updates safely if needed.
21. Keep drag/drop keyboard accessible.
22. Preserve existing security.
23. Do not expose secrets in Settings.
24. Run typecheck, lint, build, and regression tests before completion.

---

# 87. DEFINITION OF DONE

This enhancement is complete when:

- Settings has Editor & Preview preferences;
- Live Preview can be enabled/disabled;
- Auto-save can be enabled/disabled;
- auto-save delay works;
- auto-save saves Draft only;
- bulk-edit/manual-save workflow works;
- default preview presets can be enabled/disabled;
- custom preview widths can be added;
- only enabled devices appear in editor;
- existing pages support Add Section;
- added sections use controlled templates;
- section zones protect core layouts;
- added sections preview live;
- sections can be reordered;
- sections can be duplicated;
- sections can be hidden;
- sections can be deleted;
- Save Draft persists them;
- Publish renders them;
- mobile/tablet admin remains usable;
- no existing Phase 1/2 functionality is broken;
- typecheck passes;
- lint passes;
- production build passes;
- UAT passes.

---

# 88. FINAL TARGET USER EXPERIENCE

## Editing with Auto-save ON

```text
OPEN PAGE
↓
TYPE
↓
SEE PREVIEW CHANGE
↓
STOP TYPING
↓
AUTO-SAVE DRAFT
↓
CONTINUE EDITING
↓
FULL PREVIEW
↓
PUBLISH
```

## Editing with Auto-save OFF

```text
OPEN PAGE
↓
MAKE BULK CHANGES
↓
SEE ALL CHANGES IN LIVE PREVIEW
↓
SAVE DRAFT ONCE
↓
FULL PREVIEW
↓
PUBLISH
```

## Extending a Page

```text
OPEN HOME
↓
+ ADD SECTION
↓
CHOOSE SECTION TYPE
↓
EDIT CONTENT
↓
SEE IT LIVE IN PREVIEW
↓
POSITION / REORDER
↓
SAVE DRAFT
↓
FULL PREVIEW
↓
PUBLISH
```

The administrator should have flexibility to grow IEJF's website without needing
developer intervention, while the system continues protecting the design,
responsiveness, and publishing safety of the site.
