import Link from 'next/link';
import Image from 'next/image';
import { ArrowUpRight, Leaf, HeartPulse, Scale } from 'lucide-react';
import type { NavItem } from '@/lib/content/content';
import type { AboutFocusArea, MediaReference } from '@/lib/content/types';
import { focalPointStyle } from '@/ui/blocks/focalPoint';

export function PageIntro({ eyebrow, title }: { eyebrow: string; title: string }) {
  return <div className="page-intro"><p className="eyebrow">{eyebrow}</p><h1>{title}</h1></div>;
}
/**
 * `image` is an admin-chosen MediaReference (About's `image` / Home's
 * `heroImage`, both editable via Media Library). Falls back to the original
 * placeholder photo + alt text when nothing's been chosen yet, so existing
 * unedited content still looks the same as before this was wired up.
 */
export function EditorialArt({ compact = false, image }: { compact?: boolean; image?: MediaReference | null }) {
  const src = image?.url ?? (compact ? '/images/about.webp' : '/images/home-hero.webp');
  const alt =
    image?.alt ??
    (compact
      ? 'A group of children laughing together outdoors in winter clothing; temporary stock photograph.'
      : 'A group of smiling school-aged children making peace signs outdoors; temporary stock photograph.');
  const style = image ? focalPointStyle(image) : undefined;
  return compact ? (
    <figure className="editorial-photo">
      <Image src={src} alt={alt} fill sizes="(max-width: 699px) 90vw, 45vw" style={style} />
      <figcaption>INTERGENERATIONAL JUSTICE FUND</figcaption>
    </figure>
  ) : (
    <div className="hero-visual">
      <div className="hero-photo">
        <Image src={src} alt={alt} fill sizes="(max-width: 699px) 90vw, 48vw" style={style} preload />
      </div>
      <div className="image-label">
        <span className="label-rule" />
        LAW. RESEARCH. ADVOCACY.
      </div>
      <span className="photo-corner" aria-hidden="true" />
    </div>
  );
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
