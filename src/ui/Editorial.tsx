import Link from 'next/link';
import { ArrowUpRight, Leaf, HeartPulse, Scale } from 'lucide-react';
import type { NavItem } from '@/lib/content/content';
import type { AboutFocusArea } from '@/lib/content/types';

export function PageIntro({ eyebrow, title }: { eyebrow: string; title: string }) {
  return <div className="page-intro"><p className="eyebrow">{eyebrow}</p><h1>{title}</h1></div>;
}
export function FocusCards({ focusAreas }: { focusAreas: AboutFocusArea[] }) {
  const icons = [Leaf, HeartPulse, Scale];
  return <div className="focus-grid">{focusAreas.map((area, index) => { const Icon = icons[index] ?? Leaf; return <article className="focus-card" key={area.title}><div className="flex items-center justify-between"><Icon size={27} strokeWidth={1.3} aria-hidden="true" /><span className="index-label">0{index + 1}</span></div><h3>{area.title}</h3><p>{area.description}</p><div className="entity">{area.entity}<span>ABN {area.abn}</span></div></article>; })}</div>;
}
export function TextLink({ href, children }: { href: string; children: React.ReactNode }) {
  return <Link href={href} className="text-link">{children}<ArrowUpRight size={18} aria-hidden="true" /></Link>;
}
export function Footer({ navigation, email, location }: { navigation: NavItem[]; email: string; location: string }) {
  return <footer className="site-footer"><div className="wrap"><div className="footer-top"><div><Link className="footer-brand" href="/">Intergenerational<br />Justice Fund<span className="gold">.</span></Link><p className="footer-caption">CHARITY · PERTH, WA</p></div><nav aria-label="Footer navigation"><p className="eyebrow">EXPLORE</p>{navigation.map(item => <Link href={item.href} key={item.href}>{item.label}</Link>)}</nav><div className="footer-contact"><p className="eyebrow">CONTACT</p><a href={`mailto:${email}`}>{email}<ArrowUpRight size={16} aria-hidden="true" /></a><p>{location}</p></div></div><div className="footer-bottom"><span>© 2026 Intergenerational Justice Fund</span><span>ABN placeholder · Privacy Policy <span className="draft-note">(pending)</span></span></div></div></footer>;
}
