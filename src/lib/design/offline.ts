/**
 * The offline copy of the site that Export design downloads: one .html file holding every live page with the
 * visitor's picks applied, so Ange can open it without internet and approve the look. Pure string work here;
 * gathering the pages, styles and images happens in the browser (src/ui/site-settings/export-files.ts).
 */

import { LIVE_PAGES } from './types.ts';

// The file holds every live page, in menu order; each page's `id` is its in-file anchor.

/** Where a link should go inside the file: a page anchor, unchanged if it leaves the site, or null for a page that isn't included. */
export function offlineHref(href: string): string | null {
  if (!href.startsWith('/') || href.startsWith('//')) return href;
  const page = LIVE_PAGES.find((p) => p.path === href.split(/[?#]/)[0]);
  return page ? `#${page.id}` : null;
}

/** Each @font-face lists a .woff2 then a .woff fallback; every browser that can open the file reads woff2. */
export function stripWoffFallbacks(css: string) {
  return css.replace(/,\s*url\([^)]*\.woff\)\s*format\(["']?woff["']?\)/g, '');
}

const escapeHtml = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// Only the matching page shows; with no page picked (a fresh open), Home does.
const PAGE_CSS = `.offline-page{display:none;flex:1;flex-direction:column}
.offline-page:target,main:not(:has(.offline-page:target)) > #home{display:flex}`;

// The phone menu is a <dialog> the site opens with JavaScript; this is the whole of it offline.
const MENU_SCRIPT = `document.addEventListener('click',function(e){var d=document.getElementById('mobile-navigation');if(!d)return;
if(e.target.closest('.menu-trigger')){d.showModal();}else if(e.target.closest('[aria-label="Close navigation"]')||(d.open&&e.target.closest('#mobile-navigation a'))||e.target===d){d.close();}});`;

export function offlineDocument(parts: {
  title: string;
  css: string;
  shell: Record<string, string>;
  header: string;
  footer: string;
  pages: { id: string; html: string }[];
  designJson: string;
}) {
  const attrs = Object.entries(parts.shell)
    .map(([k, v]) => ` ${k}="${escapeHtml(v)}"`)
    .join('');
  const pages = parts.pages.map((p) => `<section id="${p.id}" class="offline-page">${p.html}</section>`).join('\n');
  // The menu underline follows the open page (the site does this with aria-current, which can't change offline).
  const current = parts.pages
    .map((p) => `:root:has(#${p.id}:target) .desktop-nav a[href="#${p.id}"]::after{transform:scaleX(1)}`)
    .concat(`:root:not(:has(.offline-page:target)) .desktop-nav a[href="#home"]::after{transform:scaleX(1)}`)
    .join('\n');
  // `<` is escaped so the JSON can never close its own tag.
  const data = parts.designJson.replace(/</g, '\\u003c');
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>${escapeHtml(parts.title)}</title>
<style>${parts.css}
${PAGE_CSS}
${current}</style>
</head>
<body>
<div class="site-shell"${attrs}>
${parts.header}
<main id="main">
${pages}
</main>
${parts.footer}
</div>
<script type="application/json" id="iejf-design">${data}</script>
<script>${MENU_SCRIPT}</script>
</body>
</html>
`;
}
