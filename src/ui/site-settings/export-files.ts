import { designCss, type SiteDesign } from '@/lib/design/types';
import { designExport, exportFilename } from '@/lib/design/export';
import { OFFLINE_PAGES, offlineDocument, offlineHref, stripWoffFallbacks } from '@/lib/design/offline';

type TextKey = keyof SiteDesign['text'];

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
function inliner() {
  const seen = new Map<string, Promise<string>>();
  return (url: string) => {
    if (!seen.has(url)) seen.set(url, fetchOk(url).then((r) => r.blob()).then(readAsDataUrl));
    return seen.get(url)!;
  };
}

const sameOrigin = (url: URL) => url.origin === window.location.origin;
// Google's font files; the site's CSP allows fetching them for this.
const embeddable = (url: URL) => sameOrigin(url) || url.origin === 'https://fonts.gstatic.com';
const GOOGLE_IMPORT = /@import url\("?(https:\/\/fonts\.googleapis\.com\/[^")]+)"?\)[^;]*;/g;

async function inlineCssUrls(css: string, base: string, inline: (url: string) => Promise<string>) {
  let out = css;
  for (const [match, , raw] of css.matchAll(/url\((['"]?)([^'")]+)\1\)/g)) {
    if (raw.startsWith('data:')) continue;
    const url = new URL(raw, base);
    if (embeddable(url)) out = out.replace(match, `url("${await inline(url.href)}")`);
  }
  return out;
}

/** Swaps a Google Fonts @import for the font faces themselves; if Google can't be reached it keeps the online link. */
async function embedGoogleFonts(css: string, inline: (url: string) => Promise<string>) {
  let out = css;
  for (const [match, href] of css.matchAll(GOOGLE_IMPORT)) {
    try {
      const faces = await (await fetchOk(href)).text();
      out = out.replace(match, await inlineCssUrls(faces, href, inline));
    } catch {
      // Left as @import: the file still works, just loads that font online.
    }
  }
  return out;
}

/** The site's own stylesheets plus her design, with fonts and the background embedded. */
async function collectCss(design: SiteDesign, inline: (url: string) => Promise<string>) {
  const parts: string[] = [];
  for (const link of document.querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"]')) {
    if (!sameOrigin(new URL(link.href))) continue;
    const css = stripWoffFallbacks(await (await fetchOk(link.href)).text());
    parts.push(await inlineCssUrls(css, link.href, inline));
  }
  for (const style of document.querySelectorAll('style')) {
    if (style.id !== 'site-design-css' && style.textContent) parts.push(style.textContent);
  }
  parts.push(await embedGoogleFonts(await inlineCssUrls(designCss(design), window.location.href, inline), inline));
  const css = parts.join('\n');
  // @import only works at the top of a stylesheet.
  const imports = css.match(/@import url\([^)]*\)[^;]*;/g) ?? [];
  return [...imports, css.replace(/@import url\([^)]*\)[^;]*;/g, '')].join('\n');
}

/** Her text edits, the in-file links and embedded images, applied to one piece of markup. */
async function prepare(root: Element, design: SiteDesign, inline: (url: string) => Promise<string>) {
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
  for (const img of root.querySelectorAll('img')) {
    img.removeAttribute('srcset');
    img.removeAttribute('sizes');
    img.removeAttribute('loading');
    const url = new URL(img.getAttribute('src') ?? '', window.location.href);
    if (sameOrigin(url)) img.setAttribute('src', await inline(url.href));
  }
  for (const el of root.querySelectorAll('script, dialog[open]')) {
    if (el.tagName === 'SCRIPT') el.remove();
    else el.removeAttribute('open');
  }
  return root;
}

/**
 * An offline copy of the site with her picks applied: all four pages in one .html file with the styles, fonts and
 * images embedded. Header and footer come from the page on screen, which already shows her logo and ABN.
 */
export async function buildOfflineSite(design: SiteDesign, page: string, now = new Date()) {
  const inline = inliner();
  const parser = new DOMParser();
  const pages = [];
  for (const p of OFFLINE_PAGES) {
    const html = await (await fetchOk(p.path)).text();
    const main = parser.parseFromString(html, 'text/html').querySelector('main');
    if (!main) throw new Error(`${p.path}: no <main>`);
    pages.push({ id: p.id, html: (await prepare(main, design, inline)).innerHTML });
  }
  const piece = async (selector: string) => {
    const el = document.querySelector(selector);
    return el ? (await prepare(el.cloneNode(true) as Element, design, inline)).outerHTML : '';
  };
  const header = (await piece('.site-header')) + (document.querySelector('.site-header #mobile-navigation') ? '' : await piece('#mobile-navigation'));
  const date = now.toLocaleDateString('en-AU', { dateStyle: 'long' });
  const html = offlineDocument({
    title: `IEJF website preview (exported ${date})`,
    css: await collectCss(design, inline),
    shell: { 'data-home-layout': design.homeLayout, 'data-page-layout': design.pageLayout, 'data-header-style': design.headerStyle },
    header,
    footer: await piece('.site-footer'),
    pages,
    designJson: designExport(design, page, now).json,
  });
  return { filename: exportFilename(now, 'html'), blob: new Blob([html], { type: 'text/html' }) };
}
