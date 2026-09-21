# IEJF Website — Color Theme & Brand Balance PRD

**Document:** `ColorTheme.md`
**Project:** Intergenerational Justice Fund (IEJF) Website
**Area:** Public Website UI / Brand Theme
**Date:** 21 September 2026
**Status:** Implemented same day — see `docs/admin-build-status.md` and project memory.
**Primary goal:** Increase the presence of IEJF charcoal/black across the full website while keeping the site primarily light, readable, elegant, and consistent.

Implementation notes (2026-09-21): the palette in section 3 already matched this
project's existing `globals.css` tokens exactly (`--ink:#231f20`, `--deep:#1a1717`,
`--gold:#c9a15a`, `--paper:#f5f3f1`, `--line:#e3e0dd`, `--slate:#5b5758`) — no new
tokens were needed. Added a reusable `.section-dark` utility class plus targeted
`.insight-feature.featured` and `.contact-details.dark` modifiers, applied to:
Home (the "About Us" story section + the closing CTA), About (the intro/
organisation-statement section), Insights (the first/featured entry only), and
Contact (the info panel, keeping the form itself light). Footer was already dark;
header was left light per section 11's guardrail.

---

# 1. Background

Latest project feedback requested:

> Add more black to the website, not just the front page, because black/charcoal is part of the IEJF brand colour.

The correct design response is **not** to add a full dark-mode toggle.

The preferred direction is:

```text
Primary Theme: Light
Brand Contrast: Strong Charcoal / Black
Accent: Warm Gold
Dark Mode Toggle: Not required
```

The website should remain primarily light for readability, while using charcoal/black as a permanent and intentional part of the design language across all pages.

---

# 2. Design Decision

Do NOT build:

```text
Light Mode
+
Dark Mode
```

Instead build:

```text
One cohesive IEJF theme
=
Light editorial base
+
Dark charcoal sections
+
Gold accents
```

This better addresses the actual feedback: stronger IEJF branding throughout the website.

---

# 3. Brand Colour Palette

Use the existing IEJF palette.

## Primary Charcoal

```text
#231F20
```

Primary dark brand colour.

Use for:

- dark section backgrounds;
- navigation accents;
- footer;
- callout sections;
- featured cards;
- strong CTA areas;
- dark editorial bands.

## Deep Charcoal

```text
#1A1717
```

Use sparingly for:

- footer depth;
- high-contrast dark surfaces;
- hover/active states;
- darker overlays.

## Warm Gold

```text
#C9A15A
```

Use as an accent only.

Use for:

- eyebrow labels;
- divider lines;
- active navigation indicators;
- buttons;
- small highlights;
- icons;
- section markers.

Do NOT use gold excessively.

## Paper / Off-White

```text
#F5F3F1
```

Primary light background.

Use for:

- main page backgrounds;
- editorial sections;
- cards;
- forms;
- light content areas.

## White

```text
#FFFFFF
```

Use for:

- clean content cards;
- text on charcoal;
- selected light surfaces where contrast is needed.

## Slate

```text
#5B5758
```

Use for:

- secondary body copy;
- metadata;
- supporting labels;
- subdued text.

## Border

```text
#E3E0DD
```

Use for:

- card borders;
- form boundaries;
- separators;
- table lines;
- subtle section dividers.

---

# 4. Recommended Overall Colour Balance

Target visual balance:

```text
55–65% Light / Paper / White
25–35% Charcoal / Black
5–10% Gold / Accent / Borders
```

This is not a strict mathematical rule.

It is a visual target to ensure:

- the site remains readable;
- black is clearly present across all pages;
- the website feels like IEJF;
- the design does not become too heavy or too dark.

---

# 5. Core Design Principle

The website should feel:

```text
Professional
Editorial
Legal / Public-interest
Modern
Restrained
Premium
Credible
Human
```

Avoid:

```text
Generic NGO template
Full black website
Corporate SaaS
Neon accents
Heavy gradients
Dark-mode-first design
```

---

# 6. Page Rhythm

Use alternating section tones.

Recommended pattern:

```text
LIGHT
↓
DARK
↓
LIGHT
↓
OFF-WHITE
↓
DARK ACCENT
↓
FOOTER
```

Do not place too many dark sections directly beside each other unless visually intentional.

---

# 7. Home Page

Recommended colour structure:

```text
Header
Light / White

Hero
Light or split layout
with charcoal typography and gold accent

Editorial / Mission Section
Charcoal background

News / Quotes
Light background

Supporting / Feature Section
Off-white

CTA / Closing Section
Charcoal or deep charcoal

Footer
Deep charcoal
```

---

# 8. About Page

Recommended structure:

```text
Intro
Light

Organisation Statement
Charcoal background

Focus Areas
Light / Paper cards

Environment / Health / Human Rights
Can use alternating dark-accent details

Closing Mission / Quote
Charcoal

Footer
Deep charcoal
```

The charcoal section should help visually anchor the page.

---

# 9. Insights Page

Recommended structure:

```text
Page Header
Light

Featured Insight
Charcoal / dark editorial card

Article Grid
Light

Category / Research Callout
Off-white

Closing Editorial Band
Charcoal

Footer
Deep charcoal
```

Do not make every Insight card dark.

Use dark treatment for emphasis and hierarchy.

---

# 10. Contact Page

Recommended structure:

```text
Page Intro
Light

Contact Layout
Light form
+
Dark information panel

Optional supporting content
Off-white

Footer
Deep charcoal
```

This is one of the best places to use a strong dark split layout.

---

# 11. Header / Navigation

Keep header mostly light for clarity.

Recommended:

```text
Background: White / Paper
Text: Charcoal
Active indicator: Gold
Hover: Deep charcoal / gold underline
```

Optional sticky state:

```text
slightly stronger border or subtle backdrop
```

Do not make the header permanently black unless final design testing proves it works better.

---

# 12. Footer

Footer should remain one of the strongest dark areas.

Recommended:

```text
Background:
#1A1717 or #231F20

Primary text:
#FFFFFF

Secondary text:
light gray / paper

Accent:
#C9A15A
```

Footer should visually close the page.

---

# 13. Buttons

## Primary

Recommended:

```text
Background: #231F20
Text: #FFFFFF
Hover: #1A1717
```

## Gold Accent Button

Use sparingly:

```text
Background: #C9A15A
Text: #231F20
```

## Secondary

```text
Background: transparent
Border: #231F20
Text: #231F20
```

Do not use gold for every button.

---

# 14. Cards

Use three card styles.

## Light Card

```text
Background: #FFFFFF
Border: #E3E0DD
Text: #231F20
```

## Paper Card

```text
Background: #F5F3F1
Text: #231F20
```

## Dark Feature Card

```text
Background: #231F20
Text: #FFFFFF
Accent: #C9A15A
```

Dark cards should be used only for featured/important content.

---

# 15. Typography on Dark Surfaces

For charcoal backgrounds:

## Headings

```text
#FFFFFF
```

## Body

Use:

```text
#F5F3F1
```

or another accessible soft-white.

## Accent labels

```text
#C9A15A
```

Maintain WCAG contrast.

---

# 16. Gold Usage Rules

Gold is an accent, not a surface colour.

Good uses:

- eyebrow text;
- small divider;
- nav active state;
- button accent;
- icon;
- border highlight;
- small decorative line.

Avoid:

- large gold backgrounds;
- gold body paragraphs;
- gold-heavy gradients;
- too many gold cards.

---

# 17. Section Divider Strategy

Use subtle hierarchy:

```text
Light → Dark
Dark → Light
```

Where adjacent sections are similar, use:

- spacing;
- subtle border;
- gold divider;
- image transition.

Avoid repetitive full-width black blocks with no breathing room.

---

# 18. Images

Images should remain natural and editorial.

On dark sections:

Use either:

- clean edge-to-edge image;
- subtle dark overlay;
- bordered image;
- contained editorial crop.

Do not tint all images black.

Do not overuse duotone effects.

---

# 19. Forms

Keep forms primarily light.

Recommended:

```text
Input background: White
Border: #E3E0DD
Text: #231F20
Focus border: #C9A15A or #231F20
```

For forms placed in dark panels:

Use sufficient contrast and avoid low-contrast gray text.

---

# 20. Dark Section Rules

Use dark sections when they serve one of these purposes:

- emphasize a mission statement;
- highlight an important insight;
- create visual pause;
- separate major content groups;
- support a strong CTA;
- anchor the bottom of a page.

Do NOT use dark sections just to hit a percentage target.

---

# 21. Light Mode Only

The site remains one cohesive theme.

Do NOT add:

```text
Dark mode toggle
Theme switcher
System theme sync
```

unless explicitly requested later.

This keeps:

- design QA simpler;
- accessibility more consistent;
- brand presence stronger;
- responsive behavior easier to control.

---

# 22. Admin Preview

The admin live preview should reflect the real final theme.

Preview must show:

- dark sections;
- light sections;
- gold accents;
- responsive section behavior.

Do not create a simplified preview theme.

---

# 23. Responsive Colour Behavior

Colour structure should remain intentional across:

```text
Mobile
Tablet
Desktop
```

Do not remove dark sections on mobile.

Instead:

- stack content;
- preserve contrast;
- adjust padding;
- adjust image placement;
- keep dark/light rhythm.

---

# 24. Mobile Considerations

On mobile:

- avoid excessively tall dark blocks;
- reduce vertical padding if needed;
- maintain readable line lengths;
- ensure white text on dark stays large enough;
- keep CTA buttons touch-friendly.

---

# 25. Tablet Considerations

Tablet must preserve section rhythm.

Avoid:

```text
desktop-only dark split layouts that collapse awkwardly
```

Use intentional two-column or stacked layouts.

---

# 26. Accessibility

All colour combinations must meet accessible contrast.

Check:

- white on charcoal;
- gold on charcoal;
- charcoal on paper;
- slate on white;
- button states;
- focus states;
- disabled states.

Do not rely on colour alone to communicate status.

---

# 27. Implementation Strategy

## Step 1

Audit current public pages.

Identify:

- which sections are already dark;
- which pages are too light;
- which sections can naturally become dark.

## Step 2

Create reusable theme tokens.

Example:

```css
--color-charcoal: #231F20;
--color-charcoal-deep: #1A1717;
--color-gold: #C9A15A;
--color-paper: #F5F3F1;
--color-border: #E3E0DD;
--color-slate: #5B5758;
--color-white: #FFFFFF;
```

## Step 3

Apply page-level section balance.

Do not randomly recolour individual elements.

## Step 4

Review mobile/tablet/desktop.

## Step 5

Run accessibility and contrast checks.

---

# 28. Claude Implementation Guardrails

When implementing:

1. Do not add dark mode.
2. Keep the website primarily light.
3. Increase charcoal/black presence across all pages.
4. Preserve approved IEJF content.
5. Preserve the existing public page structure unless colour treatment requires a small layout adjustment.
6. Use dark sections strategically, not everywhere.
7. Keep gold as an accent only.
8. Do not introduce new brand colours without approval.
9. Do not recolour the admin portal unless requested separately.
10. Do not make every card dark.
11. Do not make every CTA gold.
12. Preserve responsive behavior.
13. Test all dark surfaces for contrast.
14. Keep public UI consistent across Home, About, Insights, Contact, and future dynamic sections.
15. Use existing theme tokens where possible.

---

# 29. Acceptance Criteria

- [ ] Home contains meaningful charcoal/black treatment beyond the footer.
- [ ] About contains at least one strong dark content section.
- [ ] Insights uses dark treatment for featured/editorial emphasis.
- [ ] Contact includes a dark information or supporting section where appropriate.
- [ ] Footer remains dark.
- [ ] Header remains readable and brand-consistent.
- [ ] Gold remains restrained.
- [ ] Site remains primarily light overall.
- [ ] No dark-mode toggle exists.
- [ ] Mobile retains the same brand rhythm.
- [ ] Tablet retains intentional section contrast.
- [ ] Contrast/accessibility checks pass.
- [ ] Existing content is unchanged.
- [ ] Existing responsive behavior is not broken.

---

# 30. Definition of Done

The colour-theme update is complete when the website feels visibly more aligned with IEJF's black/charcoal identity across all pages while remaining:

```text
Readable
Professional
Editorial
Balanced
Responsive
Accessible
```

The final result should not feel like a separate dark-mode theme.

It should feel like one cohesive IEJF brand system where charcoal is permanently and intentionally present throughout the site.
