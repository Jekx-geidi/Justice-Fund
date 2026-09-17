# QA report — 17 September 2026

- Production build: passed; four App Router pages statically prerendered.
- TypeScript: passed (`npm run typecheck`).
- Lint: passed without warnings (`npm run lint`).
- Browser QA: passed (`npm run test:ui`) against the production preview at port 3100.
- Viewports: 320, 375, 390, 430, 768, 820, 1024, 1280, 1440, 1920.
- All four pages loaded successfully at each width: 40 checks, no horizontal overflow, exactly one H1 per page, all images decoded.
- Axe WCAG A/AA audits: 12 runs (all four routes at 390, 820 and 1440); no reported violations.
- Keyboard: menu focus containment, Escape close, trigger focus restoration and scroll lock passed.
- Mobile route selection closes menu; contact required-field validation and explicit not-sent submission status passed.
- Reduced-motion styling passed. Old Team, Cases and Environment routes return 404.
- Full-page screenshots and viewport contact sheets reviewed for all ten widths. Fixed mobile heading punctuation wrap and explicit menu Tab wrapping during QA.
- Detailed machine-readable results: `qa-output/results.json`; screenshots: `qa-output/` (ignored generated files).

This is local Chromium QA, not a claim of deployment, cross-browser certification, complete manual accessibility conformance or a measured Lighthouse score. No Git remote exists, so no source push was performed.
