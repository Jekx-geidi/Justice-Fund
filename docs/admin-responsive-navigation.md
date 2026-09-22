# Responsive admin navigation

The authenticated admin shell uses a hidden navigation drawer through 1024px
and the existing permanent sidebar from 1025px. Both use the same five-item NAV
configuration. Desktop collapse remains a separate stored preference.

The drawer closes on navigation, Escape, its close button, overlay activation,
and resizing to desktop. Opening contains keyboard focus and makes page content
inert; closing restores scrolling and returns focus to the menu button (or the
active desktop link after resizing). Help closes the drawer before opening.

## Verification — 22 September 2026

`scripts/qa-admin-navigation.mjs` checks 320, 390, 430, 767, 768, 820, 1024,
1025, 1280, 1440, and 1920px. All passed against the real AdminShell rendered
in a temporary local fixture, removed before the production build. Checks cover
menu contents, all dismissal mechanisms, focus containment and return, body
scroll restoration, desktop collapse, resize cleanup, and horizontal overflow.
Screenshots were inspected at mobile and desktop widths. The open drawer passed
axe WCAG 2 A/AA checks. Help opened successfully. An unauthenticated request to
the real `/admin` route redirected to `/admin/login`.

Authenticated editor/preview and Settings integration were not exercised; the
fixture is evidence for shell behavior, not full authenticated UAT. The existing
development CSP blocks React's debugging eval; no policy was weakened to hide it.

To rerun against an authenticated local portal, set `QA_URL` to its origin and
`QA_STORAGE_STATE` to a private Playwright storage-state file, then run
`node scripts/qa-admin-navigation.mjs`. Never commit that authentication file.
`QA_ADMIN_PATH` can optionally target an isolated shell fixture.
