import { test } from 'node:test';
import assert from 'node:assert/strict';
import { offlineDocument, offlineHref, stripWoffFallbacks } from './offline.ts';

test('menu links to the live pages point inside the file', () => {
  assert.equal(offlineHref('/'), '#home');
  assert.equal(offlineHref('/contact'), '#contact');
});

test('links to pages that are not in the file lead nowhere rather than to a broken page', () => {
  assert.equal(offlineHref('/privacy'), null);
  assert.equal(offlineHref('/admin/login'), null);
});

test('outside links and email links keep working', () => {
  assert.equal(offlineHref('mailto:hello@justicefund.org.au'), 'mailto:hello@justicefund.org.au');
  assert.equal(offlineHref('https://www.acnc.gov.au/'), 'https://www.acnc.gov.au/');
});

const parts = {
  title: 'IEJF website preview',
  css: 'body{color:red}',
  shell: { 'data-home-layout': 'split', 'data-page-layout': 'side', 'data-header-style': 'centred' },
  header: '<header class="site-header"></header>',
  footer: '<footer class="site-footer"></footer>',
  pages: [
    { id: 'home', html: '<section class="home-stage"></section>' },
    { id: 'about', html: '<div class="page-frame">About</div>' },
  ],
  designJson: '{"kind":"iejf-site-design","note":"</script><b>"}',
};

test('the document carries her layout and header choices on the page shell', () => {
  const html = offlineDocument(parts);
  assert.match(html, /<div class="site-shell" data-home-layout="split" data-page-layout="side" data-header-style="centred">/);
});

test('each page is its own section, and Home shows when no page is picked', () => {
  const html = offlineDocument(parts);
  assert.match(html, /<section id="home" class="offline-page"><section class="home-stage"><\/section><\/section>/);
  assert.match(html, /<section id="about" class="offline-page">/);
  assert.match(html, /main:not\(:has\(\.offline-page:target\)\) > #home/);
});

test('the menu underlines the page that is open in the file, with Home underlined on a fresh open', () => {
  const html = offlineDocument(parts);
  assert.match(html, /:root:has\(#about:target\) \.desktop-nav a\[href="#about"\]::after\{transform:scaleX\(1\)\}/);
  assert.match(html, /:root:not\(:has\(\.offline-page:target\)\) \.desktop-nav a\[href="#home"\]::after\{transform:scaleX\(1\)\}/);
});

test('the site styles are inlined so the file opens offline', () => {
  assert.match(offlineDocument(parts), /<style>body\{color:red\}/);
});

test('her choices ride along as data the web team can load, and cannot break out of the tag', () => {
  const html = offlineDocument(parts);
  assert.match(html, /<script type="application\/json" id="iejf-design">/);
  assert.doesNotMatch(html, /"note":"<\/script>/);
  assert.match(html, /\\u003c\/script>/);
});

test('the title is escaped', () => {
  assert.match(offlineDocument({ ...parts, title: 'A & <B>' }), /<title>A &amp; &lt;B&gt;<\/title>/);
});

test('woff fallbacks are dropped so only the woff2 fonts get embedded', () => {
  const css = '@font-face{src:url(a.woff2) format("woff2"),url(a.woff) format("woff")}';
  assert.equal(stripWoffFallbacks(css), '@font-face{src:url(a.woff2) format("woff2")}');
});

// April (6 Oct): About and Insights are hidden, so the offline copy has no anchor for them.
test('links to hidden pages are left out of the offline copy', async () => {
  const { offlineHref } = await import('./offline.ts');
  assert.equal(offlineHref('/about'), null);
  assert.equal(offlineHref('/insights'), null);
  assert.equal(offlineHref('/contact'), '#contact');
});
