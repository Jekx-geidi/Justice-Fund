import type { AboutFocusArea } from '@/lib/content/types';
import { DEFAULT_DESIGN, LEGAL_NAME } from '@/lib/design/types';
/**
 * Shared frame for About, Insights and Contact so all three keep the same
 * layout, sizing and styling. Its arrangement (stacked, heading on the side,
 * centred) comes from the nearest [data-page-layout] ancestor.
 */
export function PageFrame({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="wrap page-frame">
      <header className="page-frame-head">
        <h1 className="page-title">{title}</h1>
      </header>
      <div className="page-frame-body">{children}</div>
    </div>
  );
}

/** Organisation details are deliberately left out until they're approved. */
export function FocusCards({ focusAreas }: { focusAreas: AboutFocusArea[] }) {
  return (
    <div className="focus-grid">
      {focusAreas.map((area) => (
        <article className="focus-card" key={area.title}>
          <h3>{area.title}</h3>
          <p className="placeholder-text">Description to come.</p>
        </article>
      ))}
    </div>
  );
}

/** The legal bar. "Privacy Policy" only becomes a link once a published /privacy page exists, so it never points at a 404. */
export function Footer({ abn = DEFAULT_DESIGN.text.abn, privacyHref = null }: { abn?: string; privacyHref?: string | null }) {
  return (
    <footer className="site-footer">
      <div className="wrap footer-bottom">
        <p>© 2026 {LEGAL_NAME}</p>
        <p className="footer-legal">
          <span>
            ABN <span data-design-text="abn">{abn}</span>
          </span>
          <span className="footer-sep" aria-hidden="true">
            ·
          </span>
          {privacyHref ? <a href={privacyHref}>Privacy Policy</a> : <span>Privacy Policy</span>}
        </p>
      </div>
    </footer>
  );
}
