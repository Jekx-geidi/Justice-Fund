# Product Requirements Document (PRD)

## IEJF Public Website — Responsive UI/UX Frontend

**Version:** 1.0  
**Date:** 17 September 2026  
**Product Type:** Responsive public informational website  
**Implementation Scope:** Frontend only

---

## 1. Product Overview

The IEJF public website is a four-page informational experience for the Intergenerational Justice Fund. The product will use the supplied v2 website mockup as the content baseline and transform it into a more refined production-quality interface.

The product focus is:
- UI polish
- UX clarity
- Responsive behavior
- Accessibility
- Performance
- Content fidelity

No backend, CMS, authentication, database, or dynamic page-management system is included in this phase.

---

## 2. Product Goal

Create a public website that feels credible and considered on every screen size while preserving the client's supplied wording and four-page structure.

The finished experience should not feel like a basic HTML prototype. It should feel like an intentionally designed legal/nonprofit website.

---

## 3. Product Principles

### P1 — Content fidelity
UI improvement must not turn into unauthorized copywriting.

### P2 — Mobile is a designed experience
Mobile is not a collapsed desktop page.

### P3 — Tablet matters
Tablet layouts must be visually reviewed and refined.

### P4 — Editorial restraint
Use strong typography, spacing, dividers, and hierarchy rather than excessive visual effects.

### P5 — Accessibility by default
Keyboard, focus, labels, semantics, and reduced motion are part of the product.

### P6 — Keep it lightweight
A four-page informational site does not need application-level complexity.

---

## 4. Target Users

### General visitor
Needs to quickly understand:
- What IEJF is
- What it works on
- How its work is framed
- Where to find insights
- How to make contact

### Mobile visitor
Needs:
- Fast orientation
- Easy navigation
- Readable paragraphs
- Large enough touch targets
- No accidental horizontal scrolling

### Research/media/partner visitor
Needs:
- Clear organisation positioning
- Easy-to-scan focus areas
- Credible presentation
- Accessible contact information

---

## 5. Information Architecture

```text
IEJF
├── Home
├── About
├── Insights
└── Contact
```

No Team, Cases, or separate Environment page is part of the current confirmed navigation.

---

## 6. Global UI Requirements

### PR-001 — Global container
Use a centered content container with responsive side gutters and a suitable max width.

Expected behavior:
- Narrow mobile: comfortable compact gutters
- Tablet: increased breathing room
- Desktop: content remains bounded rather than stretching indefinitely

### PR-002 — Typography system
Create a consistent type scale for:
- Eyebrows
- H1
- H2
- H3
- Body
- Small/meta text
- Buttons/nav

Use fluid typography where it improves transitions between devices.

### PR-003 — Spacing system
Use a consistent spacing scale. Section spacing should shrink appropriately on mobile while preserving rhythm.

### PR-004 — Color system
Use the supplied charcoal, deep charcoal, paper, line, gold, slate, and white values as the visual foundation.

### PR-005 — Focus state
Every keyboard-interactive control must have a clear visible focus style.

### PR-006 — Touch target
Primary interactive controls should provide approximately 44x44px usable touch area where practical.

### PR-007 — Motion
Transitions should be subtle, quick, and disabled/minimized under `prefers-reduced-motion`.

---

## 7. Header and Navigation

### Purpose
Provide consistent orientation and access to all four pages.

### Desktop requirements
- Sticky or static header may be used based on implementation quality.
- IEJF name/brand remains clearly visible.
- Primary links displayed horizontally.
- Active destination visibly differentiated using more than an ambiguous subtle color shift.
- Header height remains controlled and not oversized.

### Tablet/mobile requirements
- Replace horizontal navigation when it no longer fits.
- Use an accessible menu button and menu/drawer/popover.
- Menu must include all four destinations.
- Menu must be closeable by a clear control.
- If an overlay/drawer is used, background interaction should not become confusing.
- Current page remains identifiable.

### Acceptance criteria
- No nav item overlaps another between 320px and 1920px.
- No primary page becomes unreachable on mobile.
- Menu can be operated by keyboard.
- Focus is visible.
- Touch control is comfortably tappable.

---

## 8. Home Page Requirements

### Source content
Follow `IEJF_Website_Mockup_v2 1.html`.

### Sections
1. Hero
2. News/quote wall
3. Support/donation section if present in v2
4. Bottom ABN/entity line

### Hero
Must contain:
- `A NOT-FOR-PROFIT CHARITY`
- `Intergenerational Justice Fund`
- Supplied mission paragraph

Must not restore old hero CTAs removed in v2.

#### Desktop UX
- Strong visual entry point
- Controlled max width for heading and body
- Generous but not empty spacing

#### Mobile UX
- Heading scales to fit comfortably
- Paragraph remains readable
- Hero does not consume excessive vertical space
- No fixed height

### News/quote section
Requirements:
- Preserve supplied placeholder quotes and attribution.
- Use dividers/cards/spacing that support scanability.
- Attribution must remain visually secondary but readable.
- Quotes should not overflow at narrow widths.

### Support/donation section
Requirements:
- Preserve only what exists in the current v2 content.
- Make call-to-action hierarchy clear.
- Do not implement a payment backend in this phase.

### Bottom identity line
Preserve:
`Intergenerational Environment Justice Fund (ABN 51 656 623 719)`

---

## 9. About Page Requirements

### Sections
1. Page intro
2. Organisation copy
3. Three focus-area cards

### Body layout
Desktop:
- May use asymmetric two-column editorial composition based on source intent.

Tablet:
- Adjust column proportions or stack if readability suffers.

Mobile:
- Single-column reading order.

### Focus cards
Cards:
- Environment
- Health
- Human Rights

Each card preserves:
- Supplied title
- Supplied description
- Supplied entity/ABN line

Acceptance criteria:
- Equal-height cards are optional; never force awkward fixed heights.
- ABN text wraps naturally.
- Cards retain clear separation on mobile.
- Card content remains readable at 320px.

---

## 10. Insights Page Requirements

### Purpose
Provide a clear location for future/public insight entries while reflecting the current placeholder state.

### Current content state
- Preserve `INSIGHTS` eyebrow.
- Preserve supplied heading.
- Preserve placeholder/TBC messaging.
- Preserve example entry only where present in v2.

### Layout
- Favor list/card treatment suited to reading updates.
- Tags/categories should be compact and wrap safely.
- Entry title should be more prominent than body summary.
- Avoid making the placeholder look like real published case content.

### Current technical behavior
Static frontend only.
No add/edit/delete functionality is required.

---

## 11. Contact Page Requirements

### Required content
- `CONTACT`
- `Get in touch.`
- Name
- Email
- Message
- Send message control
- Intergenerational Justice Fund
- Perth, WA
- hello@justicefund.org.au

### Form UX
- Labels visible and associated with inputs.
- Inputs fill available column width.
- Textarea resizes or has comfortable height.
- Focus states are obvious.
- Error styling may be prepared for client-side validation.
- Do not show a false "message sent" state without a real submission destination.

### Responsive layout
Desktop:
- Form and contact details may appear side-by-side.

Tablet/mobile:
- Stack in logical order.
- Keep appropriate spacing between form and details.
- Button should remain easy to tap.

---

## 12. Footer Requirements

Preserve the supplied footer identity/copyright direction.

Requirements:
- Fit narrow screens without overlap.
- Wrap/stack footer items cleanly on mobile.
- Maintain subdued contrast but remain readable.
- Do not add legal pages not included in scope as if they already exist.

If `Privacy Policy` appears as text in the mockup but no real page exists, do not fabricate a working destination without instruction.

---

## 13. Breakpoints and Layout Behavior

Use content-driven breakpoints rather than relying only on device labels.

Recommended review ranges:

| Range | Expected behavior |
|---|---|
| 320–479px | Single-column, compact gutters, mobile menu |
| 480–767px | Expanded mobile spacing, still touch-first |
| 768–1023px | Tablet-specific layout decisions |
| 1024–1439px | Full desktop nav and multi-column layouts |
| 1440px+ | Wider whitespace, bounded readable content |

Implementation may use different exact CSS breakpoints if the content behaves better.

---

## 14. Responsive Acceptance Criteria

### R-001
At 320px, there is no horizontal document scrolling caused by layout.

### R-002
At 375–430px, heading sizes feel intentional and do not break awkwardly because of oversized desktop values.

### R-003
At 768–820px, cards and columns are deliberately arranged and do not appear as a squeezed desktop layout.

### R-004
At 1024px, desktop or tablet-landscape layout remains balanced.

### R-005
At 1440px+, content is centered/bounded and does not become excessively wide.

### R-006
All interactive elements remain reachable and usable at every tested width.

---

## 15. Accessibility Requirements

### A-001 — Semantic landmarks
Use header/nav/main/footer and meaningful section structure.

### A-002 — Heading hierarchy
One clear page H1; headings descend logically.

### A-003 — Keyboard
Navigation, menu, links, and form controls are keyboard operable.

### A-004 — Focus
Visible focus states are always retained.

### A-005 — Labels
Inputs have proper associated labels.

### A-006 — Contrast
Foreground/background combinations are readable and suitable for essential text/control use.

### A-007 — Motion
Reduced-motion preferences are respected.

### A-008 — Navigation state
Active/current state must not rely solely on color if the differentiation is too subtle.

---

## 16. Interaction Requirements

### Buttons/links
- Hover treatment on pointer devices
- Focus treatment for keyboard
- Active/pressed feedback where appropriate
- No exaggerated transform animation

### Cards
Cards may use:
- Border refinement
- Slight background shift
- Very subtle hover treatment if they are interactive

Do not imply clickability on non-interactive cards.

### Page transition/scroll
Simple browser navigation is acceptable. If smooth scrolling is used, do not make it interfere with accessibility or reduced-motion preferences.

---

## 17. Performance Requirements

### PERF-001
Avoid unnecessary JavaScript for static text sections.

### PERF-002
Avoid a heavy animation framework for basic fades/hover states.

### PERF-003
Optimize and size images.

### PERF-004
Do not load unused Poppins weights.

### PERF-005
Prevent avoidable layout shifts.

### PERF-006
Keep CSS architecture understandable and maintainable.

---

## 18. SEO Requirements

### SEO-001
Each real page/route should have a useful title.

### SEO-002
Use content-supported meta descriptions.

### SEO-003
Use semantic headings.

### SEO-004
Ensure text is real HTML text rather than embedded in graphics.

### SEO-005
Do not invent keywords/copy that changes IEJF's claims.

---

## 19. Error and Edge Cases

### Long text
Components must wrap gracefully if supplied copy expands modestly.

### Narrow viewport
No clipped elements.

### Mobile menu
Must not open off-screen or become impossible to close.

### Contact form
If no backend exists:
- Do not submit to a non-existent API.
- Do not claim success.
- Make the frontend limitation explicit in code/comments if needed for future handoff.

### Missing images
Design should remain visually acceptable if no final hero image is supplied.

---

## 20. Technical Constraints

- No backend required.
- No database required.
- No authentication required.
- No CMS required.
- No dynamic content API required.
- Reuse the existing frontend project stack if one is already configured and suitable.
- Do not migrate frameworks solely for novelty.

If starting from the supplied HTML only, a clean static or modern frontend implementation is acceptable as long as it remains maintainable and responsive.

---

## 21. QA Test Matrix

### Mobile
- 320x568 approximate
- 375x667/812 approximate
- 390/393 width modern phone
- 430 width large phone

Verify:
- Header/menu
- Hero wrapping
- Quote wrapping
- Card stacking
- Form fields
- Footer
- No overflow

### Tablet
- 768 width
- 820 width
- 1024 width

Verify:
- Header breakpoint
- About columns/cards
- Contact columns/stacking
- Spacing balance

### Desktop
- 1280
- 1440
- 1920

Verify:
- Max-width behavior
- whitespace
- typography scale
- alignment
- section balance

### Interaction
- Keyboard tab order
- Menu open/close
- Focus states
- Link/button states
- Reduced motion

---

## 22. Product Acceptance Checklist

- [ ] Four confirmed pages only
- [ ] V2 content used as source of truth
- [ ] Old removed hero buttons not restored
- [ ] Old Team/Cases/Environment primary pages not restored
- [ ] Charcoal/paper/gold design direction maintained
- [ ] Poppins baseline maintained unless explicitly changed
- [ ] Mobile navigation implemented
- [ ] Tablet layouts reviewed
- [ ] 320px layout passes overflow check
- [ ] 768/820px tablet layouts look intentional
- [ ] 1024/1280/1440+ desktop layouts remain balanced
- [ ] Contact form is accessible
- [ ] Contact form does not falsely claim backend delivery
- [ ] Focus states present
- [ ] Reduced-motion support present
- [ ] No unapproved backend/CMS/database work
- [ ] Content checked against source before handoff

---

## 23. Final Product Statement

The finished IEJF website should be recognizable as the same approved content and identity supplied in the mockup, but the quality difference should be obvious: **cleaner, more intentional, more credible, and significantly better on mobile and tablet.**
