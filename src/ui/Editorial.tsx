import type { AboutFocusArea } from '@/lib/content/types';

export function PageIntro({ eyebrow, title }: { eyebrow: string; title: string }) {
  return <div className="page-intro"><p className="eyebrow">{eyebrow}</p><h1>{title}</h1></div>;
}
export function FocusCards({ focusAreas }: { focusAreas: AboutFocusArea[] }) {
  return <div className="focus-grid">{focusAreas.map((area) => <article className="focus-card" key={area.title}><h3>{area.title}</h3><p>{area.description}</p><div className="entity">{area.entity}<span>ABN {area.abn}</span></div></article>)}</div>;
}
/** Matches docs/approved-content.html's plain single-row footer — no nav/contact columns. */
export function Footer() {
  return <footer className="site-footer"><div className="wrap footer-bottom"><span>© 2026 Intergenerational Justice Fund</span><span>ABN placeholder · Privacy Policy</span></div></footer>;
}
