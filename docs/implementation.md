# Implementation notes

## Plan and scope

Inspected existing routes/components, the empty public directory and the v2 HTML mockup located in Downloads. Migrated Vite to Next.js App Router with TypeScript and Tailwind; implemented the four approved pages. Built responsive editorial layouts, integrated the three subsequently supplied photos, and added production-browser QA.

## Content decisions

The HTML mockup supplies content; the user's request governs implementation. Hero buttons remain omitted. Home reuses approved About wording for its story/focus blocks. No claims, programs, impact statistics, people or contact details were invented.

News quotes retain original wording and attribution with prominent individual placeholder labels. Insights contains the supplied example entry and a placeholder-page notice. The internal notice promising CMS administration was removed from the public notice; the supplied example excerpt retains its future-CMS wording. No CMS exists in this implementation.

The source donation text remains, with a disabled button and explanation. Its inclusion and destination remain client decisions. The contact form validates input and explicitly states that messages are not sent. Footer ABN and Privacy Policy remain pending, with no invented links.

## Temporary asset mapping

- `pexels-krishna-sarode-264149680-13759377.jpg` → `public/images/generations.webp`: Home main photograph.
- `pexels-tamhasipkhan-11736844.jpg` → `public/images/portrait.webp`: overlapping Home portrait.
- `pexels-aj4xo-27597369.jpg` → `public/images/community.webp`: About and Insights.

User explicitly requested these as temporary mockup images. They do not identify IEJF beneficiaries or projects. Replace local files and update alt text in `src/ui/Editorial.tsx` and `src/app/insights/page.tsx`, then rerun QA. Images are optimized WebP, maximum 1600px wide (portrait 900px), with responsive Next Image variants. Original charity-reference screenshot is not embedded.

## UI and responsive improvements

Charcoal, paper and white sections; restrained gold; local Poppins; two-column hero with layered imagery; editorial About; focus cards; labelled example publication; two-column Contact and organised footer.

Mobile has compact sticky navigation, a native modal with focus containment, Escape dismissal, restored trigger focus and body scroll lock. Forms and touch controls fit small screens. Tablet preserves balanced split sections, two-column focus cards and a full-width third card. Desktop uses three-column focus/news sections and a controlled 1280px content width.

Accessibility includes labelled controls, descriptive alt text, skip link, landmarks, visible focus, status messages and reduced motion. Static Server Components keep interaction JavaScript limited to navigation and the form. Fonts are locally served.

## Client decisions remaining

Final replacement imagery; verified news quotes; real Insights entries; whether to retain the donation section and its approved destination; footer legal entity/ABN and Privacy Policy. User confirmed no Git remote exists yet, so pushing is unavailable.

Setup references: [Next.js](https://nextjs.org/docs/app/getting-started/installation), [Tailwind CSS](https://tailwindcss.com/docs/installation/framework-guides/nextjs).
