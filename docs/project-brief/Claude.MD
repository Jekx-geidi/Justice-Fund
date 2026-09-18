# CLAUDE.md — IEJF Website Frontend Rules

## Project Identity

You are working on the **Intergenerational Justice Fund (IEJF) public website**.

This is a **frontend-only UI/UX refinement project**.

Your highest priorities are:
1. Preserve the supplied IEJF content.
2. Preserve the confirmed four-page scope.
3. Improve visual quality and usability.
4. Make the site excellent on mobile, tablet, laptop, and large desktop.
5. Keep the implementation simple, maintainable, accessible, and lightweight.

---

## Authoritative Files

Read these before making substantial changes:

1. `IEJF_Website_Mockup_v2 1.html`
   - Primary content and page-scope source of truth.
   - Use the copy from this file unless explicitly instructed otherwise.

2. `IEJF_Website_Mockup 2.html`
   - Historical/older reference only.
   - Do not restore Team, Cases, or Environment as primary navigation pages.
   - Do not restore old hero CTAs removed in v2.

3. `chatgpt-work-patterns.html`
   - UI/interaction reference only.
   - Do not copy its project-specific data or wording into IEJF.

4. `PLAN.md`
   - Implementation and QA plan.

5. `BRD.md`
   - Business requirements and scope boundaries.

6. `PRD.md`
   - Product/UI/UX requirements and acceptance criteria.

If implementation behavior conflicts with these documents, prefer the user's latest instruction and the v2 IEJF content file.

---

## Non-Negotiable Scope

### Confirmed pages
- Home
- About
- Insights
- Contact

### Do NOT add
- Team page
- Cases page
- Environment page as a separate route/page
- Admin page
- CMS
- Database
- Supabase
- Authentication
- Backend APIs
- Dynamic page builder
- Server-side email service

The current task explicitly has **no backend**.

If a frontend framework happens to support server features, do not use them to expand scope.

---

## Content Rules

### Rule 1 — Content fidelity
Do not paraphrase or "improve" IEJF's substantive copy unless explicitly asked.

### Rule 2 — No invented organisation facts
Do not invent:
- Case outcomes
- Statistics
- Team members
- Founder biographies
- Legal claims
- Funding claims
- Awards
- Addresses
- Phone numbers
- Social links
- Donation mechanics

### Rule 3 — Use v2 over old mockup
If the older mockup conflicts with v2, use v2.

### Rule 4 — Preserve confirmed details
Current confirmed/public content includes the v2 Home/About/Insights/Contact copy and supplied ABN/entity information.

### Rule 5 — Placeholder honesty
If content is explicitly a placeholder or TBC in the source, keep it recognizably placeholder/TBC. Do not silently fabricate production content.

---

## Visual Direction

Build a refined **modern editorial / legal / nonprofit** experience.

The site should communicate:
- Credibility
- Seriousness
- Calm confidence
- Long-term thinking
- Professional legal/advocacy character

Avoid a generic SaaS look.
Avoid a flashy startup aesthetic.
Avoid excessive gradients, glassmorphism, neon effects, or busy animation.

### Base design tokens
Respect the source palette:

```css
--ink: #231F20;
--charcoal: #231F20;
--charcoal-deep: #1A1717;
--paper: #F5F3F1;
--line: #E3E0DD;
--gold: #C9A15A;
--slate: #5B5758;
--white: #FFFFFF;
```

Typography:
- Poppins as the baseline family unless an explicit later design decision changes it.
- Keep font loading efficient.

### Improve through
- Better type scale
- Fluid typography
- Better white space
- Section rhythm
- Stronger hierarchy
- Better line lengths
- More elegant borders/dividers
- Better cards
- Better form styling
- Better navigation states
- Subtle interaction feedback
- Responsive recomposition

---

## Responsive Rules

Responsiveness is a primary deliverable.

### Required test widths
At least:
- 320
- 375
- 390/393
- 430
- 768
- 820
- 1024
- 1280
- 1440
- 1920

Also drag through intermediate widths to catch breakpoints and overflow.

### Never do this
- `nav { display: none; }` on mobile without a replacement menu.
- Fixed desktop widths that overflow mobile.
- Fixed section heights that clip text.
- Text smaller than practical reading size.
- Hover-only controls.
- Horizontal scrolling caused by page layout.
- Desktop two/three-column layouts forced into narrow mobile widths.

### Mobile navigation
Implement an accessible compact navigation pattern.
Requirements:
- Clear menu button
- Approximately 44x44px minimum touch area
- `aria-expanded`
- `aria-controls`
- Visible keyboard focus
- Easy close action
- Close after selecting a destination if applicable
- Prevent focus/scroll behavior from becoming confusing

### Mobile spacing
- Use comfortable page gutters.
- Reduce desktop-scale gaps without making sections cramped.
- Keep headings from dominating the entire viewport.
- Stack cards/forms in reading order.

### Tablet
Do not treat tablet as a forgotten midpoint.
Test portrait and landscape-like widths.
Use 1-column or 2-column compositions based on actual readability, not rigid device names.

---

## Component Guidance

Prefer small reusable components over repeated large markup.

Likely components:
- `Header`
- `Navigation`
- `MobileNavigation`
- `Footer`
- `Container`
- `Eyebrow`
- `PageIntro`
- `QuoteBlock`
- `FocusCard`
- `InsightEntry`
- `ContactForm`
- `Button` / styled link variants

Do not over-engineer abstraction for a four-page site.

---

## Accessibility Rules

Implement as normal product quality, not optional cleanup.

- Use semantic HTML.
- Use one clear H1 per page/view.
- Maintain logical H2/H3 order.
- Use real buttons for actions and real links for navigation.
- Associate labels with form fields.
- Keep visible focus indicators.
- Maintain contrast.
- Use accessible names for icon-only controls.
- Respect `prefers-reduced-motion`.
- Do not trap keyboard focus accidentally.
- Do not communicate important meaning through color alone.

---

## Motion Rules

Subtle only.

Good:
- 150–300ms transitions
- Gentle underline/border movement
- Small opacity/translate reveal if content remains immediately accessible
- Menu open/close transitions

Avoid:
- Large scroll-jacking effects
- Parallax-heavy sections
- Infinite decorative animation
- Delayed text visibility
- Motion that makes a legal/charity website feel gimmicky

Always include a reduced-motion fallback.

---

## Contact Form Rule

The current scope has no backend.

Therefore:
- Build and style the form as a frontend UI.
- Basic client-side validation/UX is acceptable.
- Do not create fake success behavior implying an email was actually delivered.
- Do not create an API route unless a future instruction provides a real integration requirement.
- If submission is disabled, use an honest implementation state rather than pretending it works.

---

## Performance Rules

- Keep dependencies minimal.
- Avoid a large component library unless already present and justified.
- Avoid adding animation packages for effects CSS can handle.
- Optimize images.
- Define image dimensions/aspect ratios to reduce layout shift.
- Lazy-load below-fold media where sensible.
- Avoid unnecessary client-side JavaScript.
- Load only needed font weights.

---

## SEO / Metadata Rules

Implement normal static-site SEO hygiene:
- Page title
- Meta description
- Semantic headings
- Clean text content
- Meaningful navigation
- Basic Open Graph tags where supported

Do not write unsupported marketing or legal copy solely to fill SEO fields.

---

## Working Method

Before coding:
1. Read the full v2 mockup.
2. Identify every visible section and exact copy.
3. Read `PLAN.md`, `BRD.md`, and `PRD.md`.
4. Inspect the current repository before replacing structure.
5. Reuse existing setup where it is clean and appropriate.

During coding:
1. Build shared tokens and layout first.
2. Build responsive header/nav early.
3. Implement one page/section at a time.
4. Test mobile as you go.
5. Do not wait until the end to add breakpoints.

After each major page:
- Check 375px
- Check 768px
- Check 1024px
- Check 1440px
- Check keyboard focus
- Check overflow

Before completion:
- Run the project build/lint available in the repo.
- Fix errors you introduced.
- Inspect responsive behavior in browser tools.
- Confirm content against v2.
- Confirm no backend/CMS was introduced.

---

## Definition of Good Work

Good work on IEJF means the user should be able to compare the source mockup and the finished site and say:

- "The content is still correct."
- "It looks much more professional."
- "The mobile version feels intentionally designed."
- "Tablet is polished, not awkward."
- "Desktop feels spacious and credible."
- "Nothing important was invented or removed."
- "The code stayed simple because this is a frontend site."

---

## Final Guardrail

When uncertain between adding a new feature and refining the existing experience, **refine the existing experience**.

This project is about **UI/UX quality and responsive execution**, not feature expansion.
