import type { AboutFocusArea } from '@/lib/content/types';
import { DEFAULT_DESIGN, LEGAL_NAME, type SitePage } from '@/lib/design/types';
import Image from 'next/image';
import { PAGE_PHOTOS } from '@/lib/design/page-photos';
/**
 * Shared frame for About, Insights and Contact so all three keep the same
 * layout, sizing and styling. Its arrangement (stacked, heading on the side,
 * centred) comes from the nearest [data-page-layout] ancestor.
 */
/** `page` picks up that page's own background and text colours from Site settings (see designCss) and its photo (April, 29 Sep). */
export function PageFrame({ title, page, children }: { title: string; page: SitePage; children: React.ReactNode }) {
  const photo = PAGE_PHOTOS[page];
  return (
    <div className="wrap page-frame" data-page={page}>
      <header className="page-frame-head">
        <h1 className="page-title">{title}</h1>
      </header>
      <div className="page-frame-body">
        {/* Near the top of the page, so it loads first; never wider than the 1100px frame. */}
        <Image
          className="page-photo"
          src={photo.src}
          alt={photo.alt}
          width={photo.width}
          height={photo.height}
          sizes="(max-width: 1100px) 100vw, 1100px"
          priority
          style={{ objectPosition: photo.position }}
        />
        {children}
      </div>
    </div>
  );
}

export function FocusCards({ focusAreas }: { focusAreas: AboutFocusArea[] }) {
  return (
    <div className="focus-grid">
      {focusAreas.map((area) => (
        <article className="focus-card" key={area.title}>
          <h3>{area.title}</h3>
          <p>{area.description}</p>
          <div className="entity">
            {area.entity}
            <span>ABN {area.abn}</span>
          </div>
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
