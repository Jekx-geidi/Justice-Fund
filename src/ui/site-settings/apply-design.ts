import { pagePhoto } from '@/lib/design/page-photos';
import type { SiteDesign, SitePage, TextKey } from '@/lib/design/types';

/**
 * Puts the design's text and photos into rendered markup: the live page (Site settings previews) or a copy of it
 * (the offline export). Text goes where [data-design-text] marks it, photos into [data-page-photo] images.
 */
export function applyDesignContent(root: ParentNode, design: SiteDesign) {
  for (const el of root.querySelectorAll<HTMLElement>('[data-design-text]')) {
    const key = el.dataset.designText as TextKey;
    const value = design.text[key] ?? '';
    el.textContent = value;
    if (key === 'homeTagline') el.hidden = !value;
    if (el.hasAttribute('data-design-mailto')) el.setAttribute('href', `mailto:${value}`);
  }
  for (const img of root.querySelectorAll<HTMLImageElement>('img[data-page-photo]')) {
    const page = img.dataset.pagePhoto as SitePage;
    const photo = pagePhoto(page, design.photos[page]);
    if (img.getAttribute('src')?.includes(photo.src.split('/').pop()!)) continue;
    // next/image's responsive set points at the old photo, so drop it and load the chosen file directly.
    img.removeAttribute('srcset');
    img.src = photo.src;
    img.alt = photo.alt;
    img.style.objectPosition = photo.position;
  }
}
