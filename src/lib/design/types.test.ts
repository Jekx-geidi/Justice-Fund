import { test } from 'node:test';
import assert from 'node:assert/strict';
import { DEFAULT_DESIGN } from './types.ts';

// April's export of 29 Sep (iejf-design-2026-09-29 (4).html) is the look they approved to build on.
test('the default design is the one April exported: plain white, split homepage, stacked pages', () => {
  assert.equal(DEFAULT_DESIGN.background.kind, 'white');
  assert.equal(DEFAULT_DESIGN.homeLayout, 'split');
  assert.equal(DEFAULT_DESIGN.pageLayout, 'stacked');
});

test('the default type is Poppins throughout with headings at 80%', () => {
  assert.equal(DEFAULT_DESIGN.headingFont, 'Poppins');
  assert.equal(DEFAULT_DESIGN.bodyFont, 'Poppins');
  assert.equal(DEFAULT_DESIGN.headingSize, 80);
});

test('the default homepage heading and tagline are the ones in April’s export', () => {
  assert.equal(DEFAULT_DESIGN.text.homeHeading, 'Intergenerational Justice Fund');
  assert.equal(
    DEFAULT_DESIGN.text.homeTagline,
    'We use the law to drive systemic change, targeting issues that will cause escalating harm to future generations if left unaddressed'
  );
});

// April (29 Sep): toggle the background and font colours on each page; add dark blue and teal to the palette.
import { SITE_PAGES, PAGE_COLOURS, HEADING_COLOURS, designCss, withDefaults } from './types.ts';
import { siteDesignSchema } from './validation.ts';

const hex = (name: string) => PAGE_COLOURS.find((c) => c.name === name)!.value;

test('the page colour palette has the natural colour, dark brown, black, dark blue and teal', () => {
  for (const name of ['Natural', 'Dark brown', 'Black', 'Dark blue', 'Teal']) assert.ok(PAGE_COLOURS.some((c) => c.name === name), name);
});

test('dark blue and teal are also heading colours', () => {
  for (const name of ['Dark blue', 'Teal']) assert.ok(HEADING_COLOURS.some((c) => c.name === name), name);
});

test('every page (Home, About, Insights, Contact) has its own background and text colour', () => {
  assert.deepEqual(SITE_PAGES.map((p) => p.id), ['home', 'about', 'insights', 'contact']);
  for (const p of SITE_PAGES) assert.ok(DEFAULT_DESIGN.pageColours[p.id].background && DEFAULT_DESIGN.pageColours[p.id].text, p.id);
});

test('the defaults keep today\u2019s look: black Home box with white text, natural pages with black text', () => {
  assert.deepEqual(DEFAULT_DESIGN.pageColours.home, { background: hex('Black'), text: hex('White') });
  assert.deepEqual(DEFAULT_DESIGN.pageColours.about, { background: hex('Natural'), text: hex('Black') });
});

test('the stylesheet sets each page\u2019s colours on that page only', () => {
  const design = { ...DEFAULT_DESIGN, pageColours: { ...DEFAULT_DESIGN.pageColours, insights: { background: hex('Teal'), text: hex('White') } } };
  assert.ok(designCss(design).includes(`[data-page="insights"]{--page-bg:${hex('Teal')};--page-text:${hex('White')};}`));
  assert.ok(designCss(design).includes(`[data-page="about"]{--page-bg:${hex('Natural')};`));
});

test('settings saved before page colours existed get the defaults', () => {
  const { pageColours: _dropped, ...old } = DEFAULT_DESIGN;
  assert.deepEqual(withDefaults(old as never).pageColours, DEFAULT_DESIGN.pageColours);
});

test('a saved page colour missing one page keeps the others and fills the gap', () => {
  const saved = { ...DEFAULT_DESIGN, pageColours: { home: { background: hex('Teal'), text: hex('White') } } };
  const merged = withDefaults(saved as never).pageColours;
  assert.equal(merged.home.background, hex('Teal'));
  assert.deepEqual(merged.contact, DEFAULT_DESIGN.pageColours.contact);
});

test('only palette colours can be saved, because they end up inside a <style> tag', () => {
  assert.ok(siteDesignSchema.safeParse(DEFAULT_DESIGN).success);
  const bad = { ...DEFAULT_DESIGN, pageColours: { ...DEFAULT_DESIGN.pageColours, home: { background: 'red;}body{display:none', text: hex('White') } } };
  assert.equal(siteDesignSchema.safeParse(bad).success, false);
});
