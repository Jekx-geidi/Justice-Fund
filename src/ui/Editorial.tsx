import type { AboutFocusArea } from '@/lib/content/types';

/** Dark intro band (Abaddon Black), shared with Home's hero styling — gives every public page a consistent dark opening section. */
export function PageIntro({ eyebrow, title }: { eyebrow: string; title: string }) {
  return <section className="section"><div className="wrap home-hero page-intro"><p className="eyebrow">{eyebrow}</p><h1>{title}</h1></div></section>;
}
export function FocusCards({ focusAreas }: { focusAreas: AboutFocusArea[] }) {
  return <div className="focus-grid">{focusAreas.map((area) => <article className="focus-card" key={area.title}><h3>{area.title}</h3><p>{area.description}</p><div className="entity">{area.entity}<span>ABN {area.abn}</span></div></article>)}</div>;
}
/** Matches docs/approved-content.html's plain single-row footer — no nav/contact columns. */
export function Footer() {
  return <footer className="site-footer"><div className="wrap footer-bottom"><span>© 2026 Intergenerational Justice Fund</span><span>ABN placeholder · Privacy Policy</span></div></footer>;
}
