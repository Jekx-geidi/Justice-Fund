/**
 * Focus mode (Reil, 30 Sep): which part of the page a Site settings control changes, found from the label the panel
 * shows for it ("About boxes", "Homepage heading"…), so April sees exactly what she is editing. Null means the control
 * has nothing on the page to point at (search settings).
 */
const RULES: [RegExp, string][] = [
  [/ photo$/, '.home-photo, .page-photo'],
  [/^colour theme/, '.site-header, .site-footer, .home-box, .page-frame-head, .focus-card, .case-item-dark, .contact-card, .home-cta'],
  [/^(background|or a colour)$/, 'main'],
  [/^(homepage|about, insights and contact)$/, '.home-stage, .page-frame'],
  [/ page background$/, '.home-box, .page-frame'],
  [/ page text$/, '.home-box, .page-frame-body'],
  [/^heading colour$/, '.section-heading'],
  [/ title box$/, '.page-frame-head'],
  [/ boxes$/, '.focus-card, .case-item-dark, .contact-card'],
  [/^header \(all pages\)$|^header$|^logo$/, '.site-header'],
  [/^footer \(all pages\)$/, '.site-footer'],
  [/^accent lines/, '.focus-card, .case-item-dark, .contact-card, .home-card, .desktop-nav a[aria-current]'],
  [/^get involved button$/, '.home-cta'],
  [/^homepage heading/, '[data-design-text="homeHeading"]'],
  [/^homepage tagline/, '[data-design-text="homeTagline"]'],
  [/^contact email/, '[data-design-text="contactEmail"]'],
  [/^abn/, '[data-design-text="abn"]'],
  [/^headings/, 'main h1, main h2, main h3'],
  [/^body text/, 'main p'],
  [/^menu|^hover colour/, '.desktop-nav, .menu-trigger'],
];

export function focusSelector(label: string): string | null {
  const text = label.trim().toLowerCase();
  return RULES.find(([pattern]) => pattern.test(text))?.[1] ?? null;
}
