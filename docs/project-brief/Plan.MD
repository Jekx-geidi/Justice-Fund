# IEJF Website Frontend Implementation Plan

**Project:** Intergenerational Justice Fund (IEJF) Website  
**Document:** Implementation Plan  
**Version:** 1.0  
**Date:** 17 September 2026  
**Primary Focus:** UI/UX refinement, responsive frontend implementation, and content fidelity

---

## 1. Project Direction

The IEJF website is a frontend-focused website build based on the approved/provided IEJF mockup content. The implementation must preserve the supplied content and confirmed four-page structure while significantly improving the visual quality, responsiveness, usability, accessibility, and interaction polish.

This implementation is **not a backend project**. Do not build an admin panel, database, CMS, authentication system, content API, or server-side content-management workflow unless a future instruction explicitly changes the scope.

### Core rule

> Keep the approved IEJF content and structure. Improve how it looks, behaves, scales, and feels across devices.

---

## 2. Source of Truth

### Primary content source
- `IEJF_Website_Mockup_v2 1.html`

This file defines the confirmed public-facing content and the four-page scope:
1. Home
2. About
3. Insights
4. Contact

### Secondary references
- `IEJF_Website_Mockup 2.html` — older layout/reference only; do not restore removed pages or obsolete copy unless specifically requested.
- `chatgpt-work-patterns.html` — interaction/layout inspiration only. Do not copy its project-specific text into IEJF.

### Content-fidelity rule
- Do not rewrite, invent, expand, or replace IEJF content without explicit approval.
- Do not add additional pages just because older mockups contain them.
- Do not silently bring back removed CTA copy or obsolete sections.
- UI labels may be adjusted only where necessary for accessibility or responsive navigation behavior, without changing meaning.

---

## 3. Confirmed Public Page Scope

### 3.1 Home
Preserve the content from the v2 mockup:
- Organisation eyebrow: `A NOT-FOR-PROFIT CHARITY`
- Main heading: `Intergenerational Justice Fund`
- Mission paragraph
- News/quote section with the supplied placeholder quotes and attributions
- Donation/support section if retained in the supplied v2 content
- Bottom legal/identity line:
  - `Intergenerational Environment Justice Fund (ABN 51 656 623 719)`

Important:
- Do not restore the old `Support our work` and `About IEJF` hero buttons from the older mockup.

### 3.2 About
Preserve:
- Eyebrow: `ABOUT US`
- Main heading
- Two-column body content on suitable desktop widths
- Three focus areas:
  - Environment
  - Health
  - Human Rights
- Corresponding supplied descriptions and ABNs

### 3.3 Insights
Preserve the v2 placeholder/growing-page concept:
- Eyebrow: `INSIGHTS`
- Heading
- Placeholder/TBC notice
- Example entry structure if it remains in the supplied content

This is a static frontend presentation in the current scope. No CMS logic is required.

### 3.4 Contact
Preserve:
- Eyebrow: `CONTACT`
- Heading: `Get in touch.`
- Name field
- Email field
- Message field
- Send button
- Organisation details:
  - Perth, WA
  - hello@justicefund.org.au

Current frontend-only behavior:
- The contact form may be non-submitting/demo-only unless an external form endpoint is explicitly supplied later.
- Do not create a backend mail service.

---

## 4. Design Direction

The desired presentation should feel:
- Professional
- Trustworthy
- Editorial
- Legal/nonprofit appropriate
- Contemporary but restrained
- Premium without becoming decorative or flashy
- Clean and calm on mobile

### Existing visual tokens to preserve
Use the supplied mockup palette as the foundation:
- Charcoal / ink: `#231F20`
- Deep charcoal: `#1A1717`
- Paper/off-white: `#F5F3F1`
- Border/line: `#E3E0DD`
- Gold accent: `#C9A15A`
- Slate text: `#5B5758`
- White: `#FFFFFF`

Typography foundation:
- Poppins, with sensible system fallbacks

UI improvements should come from spacing, typography, hierarchy, composition, responsiveness, subtle interaction, and component refinement rather than introducing an unrelated design language.

---

## 5. Responsive Strategy

Responsive behavior is a first-class requirement, not a final cleanup task.

### Target ranges
These are design/testing ranges, not rigid device assumptions:
- Small mobile: 320–479px
- Large mobile: 480–767px
- Tablet: 768–1023px
- Laptop: 1024–1439px
- Large desktop: 1440px+

### General responsive rules
- No horizontal scrolling at supported widths.
- No clipped text, buttons, form controls, or cards.
- Navigation must remain usable on touch devices.
- Desktop layouts must not simply shrink into mobile; intentionally recompose them.
- Use fluid widths and controlled `max-width` containers.
- Use fluid typography where appropriate with `clamp()`.
- Avoid fixed heights for content-heavy sections.
- Ensure comfortable side padding on narrow screens.
- Maintain readable line lengths.
- Preserve visual hierarchy as layouts stack.

### Header/navigation behavior
Desktop:
- Brand on left
- Primary page navigation on right
- Clear active state
- Sticky behavior may be retained if polished and unobtrusive

Tablet/mobile:
- Do not hide navigation without replacement.
- Provide an accessible mobile menu/hamburger/drawer or compact navigation pattern.
- Maintain clear focus states.
- Menu controls should have at least approximately 44x44px touch target size.
- Prevent background scroll if using an overlay drawer.
- Ensure escape/close behavior where relevant.

### Home responsive behavior
- Hero text should scale fluidly.
- Keep mission text readable and not too wide.
- Quote blocks should maintain generous spacing but reduce excessive vertical gaps on mobile.
- CTA/support section must stack cleanly.
- Avoid giant blank areas on small devices.

### About responsive behavior
Desktop:
- Intentional multi-column layout.

Tablet/mobile:
- Stack copy logically.
- Focus cards become 1-column or carefully chosen 2-column tablet layout where readable.
- ABN copy must remain legible without overflow.

### Insights responsive behavior
- Entry cards/list should be easy to scan.
- Tags must wrap safely.
- Any optional image/card layout must stack without awkward crop or overflow.

### Contact responsive behavior
Desktop:
- Form and details can use two columns.

Tablet/mobile:
- Stack form and details.
- Inputs use full available width.
- Minimum input text size should avoid mobile zoom issues.
- Send button should be easy to tap.

---

## 6. UX Requirements

### Navigation
- User can identify the current page.
- Navigation interactions are predictable.
- Mobile navigation can be opened and closed easily.
- Page change/anchor behavior should not feel abrupt or disorienting.

### Readability
- Body text should not be overly small.
- Maintain sufficient contrast.
- Keep paragraph width comfortable.
- Use headings to establish strong information hierarchy.

### Interaction polish
Allowed:
- Subtle hover states
- Link underline/offset refinement
- Gentle card/border transitions
- Small entrance/fade effects if they do not block content
- Smooth menu transitions

Avoid:
- Heavy parallax
- Distracting animated backgrounds
- Excessive motion
- Long page-load animations
- Interactions that only work on hover

### Reduced motion
Respect `prefers-reduced-motion` by disabling or minimizing non-essential animation.

---

## 7. Accessibility Plan

Implement accessible frontend patterns from the start:
- Semantic landmarks (`header`, `nav`, `main`, `section`, `footer`)
- Logical heading hierarchy
- Keyboard-accessible navigation and controls
- Visible focus states
- Form labels associated with inputs
- Meaningful button/link semantics
- Sufficient color contrast
- Accessible mobile menu attributes (`aria-expanded`, `aria-controls`, useful labels)
- Avoid using color alone to communicate state
- Respect reduced-motion settings
- Decorative visuals should not create noisy screen-reader output

Target practical WCAG 2.1 AA alignment for the frontend where applicable.

---

## 8. Frontend Performance Plan

Keep the website lightweight.

### Requirements
- Avoid unnecessary libraries for simple interactions.
- Optimize any images before production use.
- Use responsive image sizing if images are added.
- Avoid layout shifts caused by unsized media.
- Use only required font weights.
- Keep JavaScript minimal for static/public content.
- Avoid large animation dependencies.
- Lazy-load below-the-fold media when appropriate.

### Quality targets
Aim for strong Lighthouse results, especially:
- Performance
- Accessibility
- Best Practices
- SEO

Do not sacrifice usability or content fidelity to chase a synthetic score.

---

## 9. SEO-Friendly Frontend Basics

Even without a backend, implement sensible page structure:
- Descriptive page titles
- Meta descriptions matching supplied content
- One primary H1 per page/view
- Semantic heading hierarchy
- Crawlable text content
- Meaningful link text
- Open Graph/basic social metadata if the implementation stack supports it
- Proper favicon/site identity placeholders if assets are provided

Do not invent legal claims, organisation history, case outcomes, or unsupported marketing copy for SEO.

---

## 10. Component Plan

Recommended reusable frontend components:

```text
src/
  components/
    Header
    DesktopNav
    MobileNav
    Footer
    PageHero / PageIntro
    Eyebrow
    QuoteBlock
    FocusCard
    InsightEntry
    ContactForm
    SectionContainer
    Button / LinkButton
  pages or routes/
    Home
    About
    Insights
    Contact
  styles/
    tokens / globals / responsive helpers
```

Exact folder names depend on the chosen frontend framework. Keep the architecture simple and appropriate to a small four-page site.

---

## 11. Implementation Phases

### Phase 1 — Source audit
- Read `IEJF_Website_Mockup_v2 1.html` in full.
- Extract only the current four-page content.
- Identify old content that must not return.
- Inventory design tokens and reusable sections.

### Phase 2 — Foundation
- Create global reset/base styles.
- Define colors, typography, spacing, radii, borders, shadows if needed.
- Create responsive container system.
- Implement semantic page shell.

### Phase 3 — Navigation
- Build desktop navigation.
- Build fully functional mobile/tablet navigation.
- Add active states and focus states.
- Test keyboard/touch behavior.

### Phase 4 — Home
- Rebuild hero with better responsive typography and spacing.
- Refine quote/news presentation.
- Refine support/donation section only within supplied content.
- Preserve bottom ABN line.

### Phase 5 — About
- Refine editorial body layout.
- Build reusable focus cards.
- Optimize cards for desktop/tablet/mobile.

### Phase 6 — Insights
- Build clean list/card structure.
- Preserve placeholder nature of current content.
- Ensure future static entries can be added consistently.

### Phase 7 — Contact
- Build responsive form layout.
- Add client-side UX states only if useful (focus/error visual treatment), without pretending data is sent to a backend.
- Keep supplied Perth/email details.

### Phase 8 — Responsive refinement
Test at minimum:
- 320px
- 375px
- 390/393px
- 430px
- 768px
- 820px
- 1024px
- 1280px
- 1440px
- 1920px

Check intermediate widths, not only the listed values.

### Phase 9 — QA polish
- Keyboard navigation
- Mobile menu
- Text wrapping
- Form layout
- Overflow
- Focus states
- Contrast
- Reduced motion
- Cross-browser smoke test
- Lighthouse/DevTools review

---

## 12. Out of Scope

Unless explicitly requested later, do not implement:
- Backend services
- Database
- Supabase
- Cloud Storage content persistence
- Authentication
- Admin dashboard/CMS
- Dynamic page creation
- User accounts
- API routes for content
- Contact-form email delivery backend
- Payment/donation processing
- Analytics implementation
- Complex application state management

A visual button may exist because it is part of the approved content, but functionality must not be fabricated.

---

## 13. Definition of Done

The frontend is considered ready for handoff when:
- All confirmed v2 content is represented accurately.
- Only Home, About, Insights, and Contact are part of the confirmed site navigation.
- No obsolete older-mockup page is reintroduced.
- UI is visually polished and consistent with IEJF's charcoal/paper/gold identity.
- Mobile navigation is complete and usable.
- Layout works from 320px through large desktop widths without horizontal overflow.
- Typography and spacing are intentional at mobile, tablet, and desktop sizes.
- All interactive controls have hover/focus/active treatment where appropriate.
- Contact form is clearly frontend-only unless a real endpoint is later provided.
- Keyboard navigation is usable.
- Reduced motion is respected.
- No backend/CMS/database has been added.
- Final implementation has been manually checked in browser responsive mode and on at least one real mobile-size viewport.

---

## 14. Final Instruction to the Implementer

Do not redesign the project by inventing new content. The value of this task is in taking the supplied IEJF site and making it feel professionally designed across every screen size.

**Content stays faithful. UI/UX gets better. Responsive quality is mandatory.**
