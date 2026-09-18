# Business Requirements Document (BRD)

## Intergenerational Justice Fund (IEJF) Website Frontend Refresh

**Version:** 1.0  
**Date:** 17 September 2026  
**Project Type:** Public informational website / frontend UI/UX implementation  
**Confirmed Scope:** Home, About, Insights, Contact

---

## 1. Executive Summary

The Intergenerational Justice Fund (IEJF) website project will transform the supplied four-page website mockup into a more polished, credible, accessible, and fully responsive public-facing website.

The project's current objective is **not to expand functionality**. It is to preserve the supplied IEJF content while improving presentation and usability across mobile, tablet, laptop, and desktop screens.

The current build is explicitly **frontend-only**. Backend systems, databases, CMS/admin features, authentication, server-side contact processing, and dynamic content management are outside this implementation unless separately approved later.

---

## 2. Business Context

IEJF requires a professional web presence that clearly communicates its organisation, purpose, areas of focus, insights, and contact information.

A working HTML mockup already establishes:
- Core content
- Visual palette
- Typography direction
- Page names
- Initial information architecture

However, the supplied mockup requires refinement to meet a production-quality standard, particularly on smaller screens. The business value of this project is therefore created through **frontend quality** rather than feature complexity.

---

## 3. Business Problem

The existing mockup provides a valid content and structure baseline, but it does not yet fully satisfy the desired experience across real-world devices.

Key concerns include:
- Basic/plain presentation
- Limited mobile navigation behavior
- Responsive treatment that primarily stacks layouts without fully redesigning them for small screens
- Opportunities to improve visual hierarchy, spacing, typography, and component polish
- Need for a stronger tablet experience
- Need for consistent interaction and accessibility states

Without refinement, the site may appear less credible or less intentional than the organisation's subject matter requires.

---

## 4. Business Objective

Deliver a polished public-facing IEJF website that:
- Accurately presents the supplied content.
- Feels professional and trustworthy.
- Performs well visually across device sizes.
- Is easy to navigate on desktop and touch devices.
- Uses a coherent visual system based on the existing IEJF mockup.
- Does not unnecessarily introduce backend complexity.

---

## 5. Success Criteria

The project will be considered successful when:
- The confirmed four pages are implemented accurately.
- Supplied copy remains materially unchanged unless the client/team explicitly requests edits.
- Mobile navigation is fully usable rather than hidden.
- The site has no horizontal layout overflow from 320px upward.
- Tablet layouts are intentionally designed and visually balanced.
- Desktop layouts remain spacious and readable.
- Visual hierarchy and spacing feel consistent across pages.
- The site remains lightweight and fast.
- Forms and controls are accessible and touch-friendly.
- No unapproved backend/CMS/database scope has been added.

---

## 6. Stakeholders

### Internal/project stakeholders
- Geidi project/team representatives
- Project manager/manager stakeholders providing the IEJF website brief and mockups
- Frontend implementer/developer

### Client/public stakeholders
- Intergenerational Justice Fund (IEJF)
- Prospective supporters
- Researchers/media/public visitors
- People seeking organisational or contact information

This BRD does not assign legal authority or sign-off responsibilities not provided in the current frontend scope.

---

## 7. Scope

### 7.1 In Scope

#### Public pages
1. Home
2. About
3. Insights
4. Contact

#### Frontend design and UX
- Responsive layout
- Responsive navigation
- Refined typography
- Refined spacing and content hierarchy
- Reusable UI components
- Hover/focus/active states
- Subtle transitions
- Mobile/touch usability
- Tablet-specific refinement
- Accessible semantic markup
- Contact form presentation
- Existing IEJF visual identity refinement

#### Quality assurance
- Responsive browser testing
- Keyboard interaction checks
- Overflow checks
- Accessibility basics
- Performance-conscious implementation
- Content comparison against supplied v2 mockup

### 7.2 Out of Scope

The following are not part of the current implementation:
- Admin CMS
- Admin login
- Database
- Supabase
- Cloud Storage content persistence
- Dynamic page generation
- Backend API
- Server-side email/contact handling
- Donation/payment gateway
- User accounts
- Authentication/authorization
- Analytics platform integration
- Client content editing interface
- Additional pages beyond the confirmed four

These items require separate approval if later requested.

---

## 8. Source Content Requirements

### BR-001 — Primary source
The implementation shall use `IEJF_Website_Mockup_v2 1.html` as the primary content and current structure reference.

### BR-002 — Older mockup treatment
`IEJF_Website_Mockup 2.html` may be consulted for historical design ideas only. Obsolete page structure shall not supersede the v2 scope.

### BR-003 — UI reference treatment
`chatgpt-work-patterns.html` may be used as inspiration for responsive layout, card behavior, spacing, and interaction patterns but shall not supply IEJF content.

### BR-004 — No unapproved copy invention
The implementation shall not invent substantive IEJF claims, facts, cases, statistics, staff, or legal language.

---

## 9. Information Architecture Requirements

### Primary navigation
The public navigation shall expose:
- Home
- About
- Insights
- Contact

### Removed/obsolete primary pages
The following old mockup pages shall not be restored as primary navigation items:
- Team
- Cases
- Environment

### Navigation usability
- Current-page state should be clear.
- Navigation must work across screen sizes.
- Mobile navigation must remain accessible.

---

## 10. Page-Level Business Requirements

### 10.1 Home

Purpose:
- Introduce IEJF.
- Communicate the mission succinctly.
- Establish credibility through the supplied news/quote content.
- Present the supplied support/donation message where it exists in the v2 content.

Requirements:
- Preserve v2 hero copy.
- Do not restore old hero CTA buttons removed from v2.
- Preserve supplied quote text and attribution.
- Preserve the bottom Environment Justice Fund ABN line from v2.
- Optimize hero and quote presentation for mobile and tablet.

### 10.2 About

Purpose:
- Explain the organisation and its work.
- Present the three supplied focus areas/entities.

Requirements:
- Preserve the v2 explanatory copy.
- Preserve Environment, Health, and Human Rights cards.
- Preserve supplied entity names and ABNs.
- Improve readability on narrow screens.
- Ensure cards do not produce cramped or overflowing text.

### 10.3 Insights

Purpose:
- Provide a location for case updates, research, advocacy, or related insight content.

Current requirement:
- Preserve the v2 placeholder/growing-list concept.
- Present example/placeholder content only as supplied.
- Do not build a CMS or dynamic content backend.

### 10.4 Contact

Purpose:
- Let visitors view contact details and interact with a contact form UI.

Requirements:
- Preserve Perth, WA.
- Preserve `hello@justicefund.org.au`.
- Preserve Name, Email, and Message fields.
- Make the form responsive and accessible.
- Do not imply successful email delivery without an actual backend integration.

---

## 11. Visual Identity Requirements

### BR-005 — Palette
The implementation shall use the supplied charcoal/paper/gold palette as the primary visual identity.

### BR-006 — Typography
Poppins shall remain the baseline font direction unless explicitly changed later.

### BR-007 — Tone
The design shall feel professional, editorial, credible, restrained, and appropriate for a legal/charitable organisation.

### BR-008 — Avoid generic product-app styling
The site should not resemble a SaaS dashboard or highly decorative consumer landing page.

---

## 12. Responsive Business Requirements

### BR-009 — Mobile-first usability
The experience shall be fully usable at 320px viewport width and above.

### BR-010 — Tablet optimization
The experience shall be intentionally tested and refined in common tablet widths rather than relying only on a desktop-to-mobile breakpoint.

### BR-011 — Desktop preservation
Large-screen layouts shall retain suitable whitespace, line length, and alignment rather than stretching content edge-to-edge.

### BR-012 — Navigation continuity
Primary navigation shall never simply disappear on mobile without a usable replacement.

### BR-013 — Touch interaction
Interactive targets shall be comfortably usable by touch.

---

## 13. Accessibility Requirements

### BR-014 — Keyboard usability
Navigation and form controls shall be operable by keyboard.

### BR-015 — Focus visibility
Interactive elements shall have visible focus states.

### BR-016 — Semantic structure
The implementation shall use sensible semantic landmarks and heading structure.

### BR-017 — Form labels
Contact fields shall have programmatically associated labels.

### BR-018 — Contrast
Text and important controls shall maintain suitable contrast against their backgrounds.

### BR-019 — Reduced motion
Non-essential motion shall respect reduced-motion preferences.

---

## 14. Performance Requirements

### BR-020 — Lightweight implementation
The frontend shall avoid unnecessary libraries and excessive JavaScript.

### BR-021 — Image optimization
Any production imagery added later shall be appropriately compressed/sized and must not cause unnecessary layout shift.

### BR-022 — Font efficiency
Only necessary font families and weights shall be loaded.

### BR-023 — Practical quality
Performance improvements shall not damage readability, accessibility, or content fidelity.

---

## 15. Content Integrity Requirements

### BR-024 — Confirmed copy first
The supplied v2 copy has priority over older source copy where the two conflict.

### BR-025 — Placeholder integrity
Placeholder/TBC content shall remain clearly placeholder/TBC until real client content is supplied.

### BR-026 — ABN accuracy
The supplied ABN lines shall not be altered casually as part of visual redesign.

---

## 16. Constraints

- Frontend-only scope
- Four confirmed pages
- Existing content should be followed rather than rewritten
- Existing visual identity is the starting point
- Mobile and tablet quality are high priorities
- No backend should be introduced simply to make static content dynamic

---

## 17. Assumptions

- The provided v2 HTML contains the current content baseline.
- Final production images/logo assets may be supplied separately if needed.
- Contact form delivery is not required in this frontend phase.
- Hosting/deployment method is not defined by this BRD and should follow a separate explicit instruction if needed.
- Insights can remain static in this phase.

---

## 18. Risks and Mitigations

### Risk: Scope drift into CMS/backend
**Mitigation:** Keep backend/admin/database items explicitly out of scope.

### Risk: Content changes during redesign
**Mitigation:** Compare implementation copy against v2 before handoff.

### Risk: Desktop-first implementation creates weak mobile UX
**Mitigation:** Review mobile and tablet during each implementation phase.

### Risk: Overdesign weakens seriousness
**Mitigation:** Favor editorial spacing, typography, and subtle motion rather than decorative effects.

### Risk: Old mockup content returns accidentally
**Mitigation:** Use v2 as authoritative and review navigation before completion.

---

## 19. Acceptance Summary

Business acceptance requires:
- Correct four-page scope
- Correct source content
- Professional design refinement
- Strong mobile/tablet behavior
- Accessible navigation and forms
- No horizontal overflow
- No unapproved content invention
- No backend/CMS/database implementation

---

## 20. Scope Principle

**The business requirement is not to create more features. It is to make the approved IEJF content feel production-ready across every screen.**
