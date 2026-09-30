# Plan: April & Ange's feedback (emails 29 Sep 8:04 PM and 30 Sep 10:24 AM)

Source: `Re First Draft - website.msg` / `Re First Draft - website -.msg` (not committed: client email).
Base look = April's export `iejf-design-2026-09-29 (4).html`: white background, split homepage,
stacked pages, Poppins/Poppins, headings 80%, tagline "We use the law to drive systemic change…".
Keep the original menu (Home, About, Insights, Contact); ignore Ange's "About, Our work, Latest,
Transparency" tabs. Rule stands: Site settings only shows controls that change the page you're on.

Previous plan (mockup reversion) is complete; see git history `79d54b2..72fe858`.

## Tasks

1. **[done]** Remove "CHARITY · PERTH, WA" from the header (desktop caption and mobile menu caption).
   - Accept: no page renders the caption; QA asserts it.
2. **[done]** Make April's export the default design (`DEFAULT_DESIGN`): white, split, stacked, 80%, her tagline.
   The live published design is data (Supabase), applied separately by an admin Publish (task 7).
   - Accept: unit test on DEFAULT_DESIGN; "Restore original design" returns to her look.
3. **[done]** Colour palette: add Dark blue and Teal. Per page (Home, About, Insights, Contact) the panel
   offers Background colour (Natural, Dark brown, Black, Dark blue, Teal) and Text colour, shown only on that page.
   Schema + validation + designCss + panel + offline export.
   - Accept: unit tests for designCss per page; QA "every control changes the page" still green.
4. **[done]** Licensed photos, one per page: Home earth from space, About people working in nature,
   Insights aerial rainforest/river, Contact Perth city at night. Stored in `public/images/pages/`, with
   source + licence recorded in `public/images/pages/CREDITS.md`. Editable later via the media library.
   - Accept: photos render on each page, optimised (webp, <300 KB), alt text, embedded in the offline export.
5. **[done]** Home page per Ange's mock-up: split hero (heading, paragraph, Get Involved -> /contact,
   Learn More -> /about, photo right), "What We Do" (intro + Strategic Litigation / Policy Reform cards),
   "Why Intergenerational Justice Matters". Copy editable in Admin -> Pages -> Home.
   - Accept: matches mock-up structure on desktop and phone; QA a11y + overflow green; one h1.
6. **[done]** Photos on About / Insights / Contact in the page frame; offline export includes them.
7. **[pending]** Verify on staging (BrowserSkill + QA), apply April's design to the published site (admin
   Publish, needs sign-off), deploy from committed code.
