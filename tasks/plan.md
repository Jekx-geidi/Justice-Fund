# Plan: April's Oct 1 base template + colour themes

Source: April's email to Junrey, 1 Oct 2026 9:16 AM ("Re: First Draft - website"), forwarded in the
IEJF Teams chat on 2 Oct. Attachment `iejf-design-2026-10-01.html` (Junrey's OneDrive, Teams Chat Files;
not committed, client file). Its embedded `#iejf-design` JSON was exported 30 Sep 13:04 UTC from `/contact`.

> "Are you please able to upload the attached and save this as the base template to work from? [...]
> I would still like to be able to toggle all the changes etc that are currently available.
> Could you also please add more colour theme options."

Previous plan (April & Ange's 29-30 Sep feedback) is complete; see git history `405f311..33e82de`.

## What April's Oct 1 design is (vs the current DEFAULT_DESIGN, her 29 Sep export)

| Field | Now (29 Sep) | April, 1 Oct |
|---|---|---|
| background | white | colour `#1f2428` (Slate) |
| bodyFont | Poppins | DM Sans |
| headingSize / bodySize / menuSize | 80 / 16 / 13 | 115 / 19 / 15 |
| headingColour | `#6b4a2e` Brown | `#1f6b6b` Teal |
| buttonColour | `#1f6b6b` Teal | `#1f2428` Slate |
| headerColour / footerColour | `#ffffff` / `#231f20` | `#231f20` Black / `#1f2428` Slate |
| hoverColour | `#7b2d26` Maroon | `#1f2428` Slate |
| home background | `#231f20` | `#1f6b6b` Teal |
| about title/box | Black | Teal |
| insights title/box | Black | Dark blue `#1f3a5f` |
| contact background / title/box | Natural / Black | Slate / Maroon `#7b2d26` |
| photos | first option each | earth-hurricane, sierra-leone-planting, rainforest-river, perth-skyline-night |
| photoFrames y | defaults | home 55, about 70, insights 60, contact 50 |
| text.homeHeading | HOME_HERO.heading | "Intergenerational Justice Fund" |
| text.homeTagline | HOME_HERO.paragraph | "We use the law to drive systemic change, targeting issues that will cause escalating harm to future generations if left unaddressed" |

Unchanged: split/stacked layouts, Poppins headings, accent gold, split header, sticky header, no logo, SEO.
`background.customUrl` holds an old Supabase upload URL; it is unused (uploads retired) and is reset to `''`.

## Architecture decisions

- **"Base template" = DEFAULT_DESIGN + the stored live/draft design.** Same path as task 2 and task 7 of
  the previous plan: the code default changes (so "Restore original design" returns to her Oct 1 look),
  and the Supabase `site_content.design` row is set to it (so staging shows it now). Old row backed up first.
- **Every existing control stays.** No control is removed or hidden; she asked to keep toggling everything.
- **Colour themes are presets, not a new schema field.** A theme is a named set of values for fields that
  already exist (`headerColour`, `footerColour`, `buttonColour`, `accentColour`, `hoverColour`,
  `headingColour`, Home background, and every page's `title`/`box`). Picking one writes those fields; she
  can fine-tune any of them afterwards. No migration, no validation change, the publish/draft/export flow
  works unchanged. The active theme is derived (design matches every theme value), otherwise "Custom".
- **Themes only use colours already in the whitelists** (PAGE_COLOURS / DARK_COLOURS / ACCENT_COLOURS /
  HEADING_COLOURS), so `siteDesignSchema` accepts them and white-on-dark contrast stays at least 4.5:1.
  Themes leave fonts, sizes, layouts, photos, and the About/Insights/Contact page background and text alone.

### Proposed themes (names and values for review)

| Theme | Header | Footer | Button | Accent | Hover | Headings | Home bg | Title/box (all pages) |
|---|---|---|---|---|---|---|---|---|
| April's pick | Black | Slate | Slate | Gold | Slate | Teal | Teal | per April's export (Teal/Dark blue/Maroon) |
| Classic | White | Black | Teal | Gold | Maroon | Brown | Black | Black |
| Navy & Gold | White | Dark blue | Dark blue | Gold | Dark blue | Dark blue | Dark blue | Dark blue |
| Earth | Natural | Dark brown | Dark brown | Gold | Maroon | Brown | Dark brown | Dark brown |
| Ocean | White | Teal | Teal | Dark blue | Teal | Teal | Teal | Teal |
| Charcoal | Charcoal | Black | Maroon | Gold | Maroon | Black | Charcoal | Charcoal |

## Tasks

See `tasks/todo.md` for the checklist with acceptance criteria.

### Phase 1: April's base template
- [x] Task 1: Make April's Oct 1 export the default design
- [x] Task 2: Set April's Oct 1 design as the stored live and draft design (staging)

### Checkpoint A
- [ ] Unit tests, typecheck, lint, build green; `npm run test:ui` green
- [ ] Staging shows the Oct 1 look on all four pages; every Site settings control still changes the page

### Phase 2: Colour themes
- [x] Task 3: Theme presets (data + apply + active-theme detection)
- [ ] Task 4: "Colour theme" row in Site settings

### Checkpoint B
- [ ] All checks green; QA covers clicking every theme
- [ ] Offline export of a themed design shows the theme
- [ ] Review the six themes on staging with Reil before telling Junrey

### Phase 3: Hand-off
- [ ] Task 5: Deploy to staging and reply to Junrey

## Risks and mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| Overwriting the stored design loses something April set after 30 Sep 13:04 | Med | Back up the current row first; compare it to her export and flag any difference to Junrey before writing |
| Contact page: Slate background with Black page text | Low | Contact has `pageText: false` (no text outside its card), so it reads fine; QA a11y contrast check confirms |
| Picking a theme silently overwrites her hand-tuned colours | Med | Theme row sits above the colour pickers, "Undo preview" reverts it, nothing is published until she publishes |
| "Colour theme options" meant something else | Med | Reil chose preset themes (2 Oct); the theme list above is a proposal and easy to change |
| Larger heading/body sizes (115% / 19px) overflow on phones | Med | `test:ui` overflow checks at phone width on all four pages after Task 1 |

## Open questions

- Are the six theme names and colours above right, or should some use new colours (e.g. a forest green)?
  New colours mean adding them to the whitelists and checking contrast; not in this plan unless asked.
- Task 2 writes to the shared Supabase project: OK to do it directly, as on 30 Sep, or should Junrey/April
  publish from the panel instead?
