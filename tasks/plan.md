# Plan: April's 6 Oct final edits (sign-off build)

Source: April's email to Junrey, 6 Oct 2026 9:30 AM ("Re: First Draft - website"), forwarded to Reil 7 Oct 4:02 PM.
She and Ange did a live edit and attached the latest export (`iejf-design-2026-10-06.html`, Reil's Downloads; not
committed, client file). She asks for these changes "I couldn't manage to do", then "a final update [...] to sign off".

Previous plan (1 Oct base template + colour themes) is complete; see git history `09ca9dc..519017e`.

## April's list

1. Home: remove the photo, fill its space with the green (the Home teal).
2. Home: the heading holds the whole sentence, ending "...if left unaddressed" (the 120-character limit cut it).
3. Home: remove the Get Involved and Learn More buttons.
4. Home: replace "What We Do" and "Why Intergenerational Justice Matters" with the About page's content
   (two intro paragraphs, "Our work is anchored in three complementary focus areas", the three focus cards).
5. Remove the About tab and page.
6. Remove the Insights tab and page ("we will add this tab in down the tract").
7. Contact: delete the "Contact" title box.

## Decisions

- **Her 6 Oct export becomes `DEFAULT_DESIGN`** (as on 1 Oct), with the full heading. Differences from 1 Oct:
  body font Poppins, heading 96%, body 18px, site background Black `#231f20`, Contact title/box Teal.
- **Site settings stays**; only controls that change the page are shown (Home photo, Get Involved button colour and
  Contact title box go; "Homepage boxes" is new, for the focus cards now on Home).
- **Focus cards on Home use the Home box colour** (`pageColours.home.box`, unused until now). Default Teal, as in the
  About page picture she pasted (her export has Black there, but nothing showed it).
- **About and Insights are hidden, not deleted**: a `live` flag on `SITE_PAGES`. Hidden pages leave the menu, the
  offline export and Site settings, and their URLs redirect to Home (307, temporary). Insights comes back by setting
  `live: true`. Their admin editors stay (the About editor still edits the text now on Home).
- **Contact keeps an `<h1>`** for screen readers and search, visually hidden.
- The stored live/draft design (Supabase) and the deploy each need Reil's OK.

## Tasks

- [x] Task 1: April's 6 Oct export is the default design; heading limit 160
- [x] Task 2: Home: no photo, no buttons, About content and focus cards
- [x] Task 3: Hide About and Insights (menu, redirect, export, Site settings)
- [ ] Task 4: Contact: no title box
- [ ] Task 5: Site settings shows only the controls that still change the page
- [ ] Task 6: QA script follows the two-page site; all checks green
- [ ] Task 7: Stored live/draft design = the new default (needs OK), deploy, reply to Junrey
