import { designCss, SITE_PAGES, type SiteDesign, type TextKey } from '@/lib/design/types';
import { designJson, exportFilename } from '@/lib/design/export';
import { offlineDocument, offlineHref, stripWoffFallbacks } from '@/lib/design/offline';

type Inline = (url: string) => Promise<string>;

function readAsDataUrl(blob: Blob) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

async function fetchOk(url: string) {
  const res = await fetch(url, { credentials: 'same-origin' });
  if (!res.ok) throw new Error(`${url}: ${res.status}`);
  return res;
}

/** Same-origin files (fonts, images) become data: URLs so the file needs nothing from the site; each is fetched once. */
function inliner(): Inline {
  const seen = new Map<string, Promise<string>>();
  return (url) => {
    if (!seen.has(url)) seen.set(url, fetchOk(url).then((r) => r.blob()).then(readAsDataUrl));
    return seen.get(url)!;
  };
}

const sameOrigin = (url: URL) => url.origin === window.location.origin;
// Google's font files; the site's CSP allows fetching them for this.
const embeddable = (url: URL) => sameOrigin(url) || url.origin === 'https://fonts.gstatic.com';
const CSS_URL = /url\((['"]?)([^'")]+)\1\)/g;
const IMPORT = /@import url\([^)]*\)[^;]*;/g;
const GOOGLE_IMPORT = /@import url\("?(https:\/\/fonts\.googleapis\.com\/[^")]+)"?\)[^;]*;/g;

/** Every embeddable url() fetched at once, then swapped in with one pass over the stylesheet. */
async function inlineCssUrls(css: string, base: string, inline: Inline) {
  const urls = new Map<string, string>();
  await Promise.all(
    [...css.matchAll(CSS_URL)].map(async ([, , raw]) => {
      if (raw.startsWith('data:') || urls.has(raw)) return;
      const url = new URL(raw, base);
      if (embeddable(url)) urls.set(raw, await inline(url.href));
    })
  );
  return css.replace(CSS_URL, (match, _q, raw: string) => (urls.has(raw) ? `url("${urls.get(raw)}")` : match));
}

/** Swaps a Google Fonts @import for the font faces themselves; if Google can't be reached it keeps the online link. */
async function embedGoogleFonts(css: string, inline: Inline) {
  const faces = new Map<string, string>();
  await Promise.all(
    [...css.matchAll(GOOGLE_IMPORT)].map(async ([match, href]) => {
      try {
        faces.set(match, await inlineCssUrls(await (await fetchOk(href)).text(), href, inline));
      } catch {
        // Left as @import: the file still works, just loads that font online.
      }
    })
  );
  return css.replace(GOOGLE_IMPORT, (match) => faces.get(match) ?? match);
}

/** The site's own stylesheets plus her design, with fonts and the background embedded. */
async function collectCss(design: SiteDesign, inline: Inline) {
  const links = [...document.querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"]')].filter((l) => sameOrigin(new URL(l.href)));
  const sheets = await Promise.all(
    links.map(async (link) => inlineCssUrls(stripWoffFallbacks(await (await fetchOk(link.href)).text()), link.href, inline))
  );
  const inlineStyles = [...document.querySelectorAll('style')]
    .filter((style) => style.id !== 'site-design-css' && style.textContent)
    .map((style) => style.textContent!);
  const own = await embedGoogleFonts(await inlineCssUrls(designCss(design), window.location.href, inline), inline);
  const css = [...sheets, ...inlineStyles, own].join('\n');
  // @import only works at the top of a stylesheet.
  return [...(css.match(IMPORT) ?? []), css.replace(IMPORT, '')].join('\n');
}

/** Her text edits, the in-file links and embedded images, applied to one piece of markup. */
async function prepare(root: Element, design: SiteDesign, inline: Inline) {
  for (const el of root.querySelectorAll<HTMLElement>('[data-design-text]')) {
    const key = el.dataset.designText as TextKey;
    const value = design.text[key] ?? '';
    el.textContent = value;
    if (key === 'homeTagline') el.hidden = !value;
    if (el.hasAttribute('data-design-mailto')) el.setAttribute('href', `mailto:${value}`);
  }
  for (const a of root.querySelectorAll('a[href]')) {
    // The page on screen is marked current; offline the menu follows the open page instead (see offlineDocument).
    a.removeAttribute('aria-current');
    const href = offlineHref(a.getAttribute('href')!);
    if (href === null) a.removeAttribute('href');
    else a.setAttribute('href', href);
  }
  await Promise.all(
    [...root.querySelectorAll('img')].map(async (img) => {
      // next/image points src at its resizer; embed the chosen size and drop the responsive set, which is site-relative.
      img.removeAttribute('srcset');
      img.removeAttribute('sizes');
      img.removeAttribute('loading');
      const url = new URL(img.getAttribute('src') ?? '', window.location.href);
      if (sameOrigin(url)) img.setAttribute('src', await inline(url.href));
    })
  );
  for (const el of root.querySelectorAll('script')) el.remove();
  for (const el of root.querySelectorAll('dialog[open]')) el.removeAttribute('open');
  return root;
}

/**
 * An offline copy of the site with her picks applied: all four pages in one .html file with the styles, fonts and
 * images embedded. Header and footer come from the page on screen, which already shows her logo and ABN.
 */
export async function buildOfflineSite(design: SiteDesign, page: string, now = new Date()) {
  const inline = inliner();
  const parser = new DOMParser();
  const piece = async (selector: string) => {
    const el = document.querySelector(selector);
    return el ? (await prepare(el.cloneNode(true) as Element, design, inline)).outerHTML : '';
  };
  const [pages, css, header, menu, footer] = await Promise.all([
    Promise.all(
      SITE_PAGES.map(async (p) => {
        const main = parser.parseFromString(await (await fetchOk(p.path)).text(), 'text/html').querySelector('main');
        if (!main) throw new Error(`${p.path}: no <main>`);
        return { id: p.id, html: (await prepare(main, design, inline)).innerHTML };
      })
    ),
    collectCss(design, inline),
    piece('.site-header'),
    // The phone menu, when the header doesn't already contain it.
    document.querySelector('.site-header #mobile-navigation') ? '' : piece('#mobile-navigation'),
    piece('.site-footer'),
  ]);
  const html = offlineDocument({
    title: `IEJF website preview (exported ${now.toLocaleDateString('en-AU', { dateStyle: 'long' })})`,
    css,
    shell: { 'data-home-layout': design.homeLayout, 'data-page-layout': design.pageLayout, 'data-header-style': design.headerStyle },
    header: header + menu,
    footer,
    pages,
    designJson: designJson(design, page, now),
  });
  return { filename: exportFilename(now, 'html'), blob: new Blob([html], { type: 'text/html' }) };
}
