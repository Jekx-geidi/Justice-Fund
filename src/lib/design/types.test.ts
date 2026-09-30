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

// April's 30 Sep email: Ange's Home suggestion on top of her export, so the hero copy is Ange's.
test('the default homepage heading and tagline are Ange’s hero copy', () => {
  assert.equal(DEFAULT_DESIGN.text.homeHeading, 'We’re using law to drive systemic change for future generations');
  assert.match(DEFAULT_DESIGN.text.homeTagline, /^We target legal issues/);
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
  assert.deepEqual(DEFAULT_DESIGN.pageColours.home, { background: hex('Black'), text: hex('White'), title: hex('Black'), box: hex('Black') });
  assert.deepEqual(DEFAULT_DESIGN.pageColours.about, { background: hex('Natural'), text: hex('Black'), title: hex('Black'), box: hex('Black') });
});

test('the stylesheet sets each page\u2019s colours on that page only', () => {
  const design = { ...DEFAULT_DESIGN, pageColours: { ...DEFAULT_DESIGN.pageColours, insights: { ...DEFAULT_DESIGN.pageColours.insights, background: hex('Teal'), text: hex('White') } } };
  assert.ok(designCss(design).includes(`[data-page="insights"]{--page-bg:${hex('Teal')};--page-text:${hex('White')};`));
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

// Reil (30 Sep): the Get Involved button's colour is customisable, its text stays white.
import { DARK_COLOURS, backgroundUrl } from './types.ts';

const luminance = (hex: string) => {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

test('every button colour keeps white text readable (at least 4.5:1)', () => {
  for (const c of DARK_COLOURS) assert.ok(1.05 / (luminance(c.value) + 0.05) >= 4.5, c.name);
});

test('the button offers April\u2019s dark blue and teal, and starts on teal', () => {
  for (const name of ['Dark blue', 'Teal']) assert.ok(DARK_COLOURS.some((c) => c.name === name), name);
  assert.equal(DEFAULT_DESIGN.buttonColour, DARK_COLOURS.find((c) => c.name === 'Teal')!.value);
});

test('the stylesheet colours the button', () => {
  assert.ok(designCss({ ...DEFAULT_DESIGN, buttonColour: '#1f3a5f' }).includes('--button-bg:#1f3a5f'));
});

test('only palette button colours can be saved', () => {
  assert.equal(siteDesignSchema.safeParse({ ...DEFAULT_DESIGN, buttonColour: 'red;}' }).success, false);
});

// Reil (30 Sep): the site background can also be one of April's colours, not just plain white.
test('the site background can be one of April\u2019s colours', () => {
  const teal = { ...DEFAULT_DESIGN, background: { ...DEFAULT_DESIGN.background, kind: 'colour' as const, colour: '#1f6b6b' } };
  assert.ok(siteDesignSchema.safeParse(teal).success);
  assert.ok(designCss(teal).includes('html body{background:#1f6b6b;}'));
  assert.equal(backgroundUrl(teal), null);
});

test('only palette background colours can be saved', () => {
  const bad = { ...DEFAULT_DESIGN, background: { ...DEFAULT_DESIGN.background, kind: 'colour' as const, colour: 'url(x)' } };
  assert.equal(siteDesignSchema.safeParse(bad).success, false);
});

// Reil (30 Sep): the charcoal of April's Home box (black at 85% over white) is a colour choice too.
test('charcoal is offered for backgrounds, page colours and the button', () => {
  assert.ok(PAGE_COLOURS.some((c) => c.name === 'Charcoal' && c.value === '#444142'));
  assert.ok(DARK_COLOURS.some((c) => c.name === 'Charcoal' && c.value === '#444142'));
});

// Reil (30 Sep): "let her do everything": the title box and the dark content boxes are customisable per page.

const mix = (hex: string, withWhite: number) =>
  '#' + [1, 3, 5].map((i) => Math.round(parseInt(hex.slice(i, i + 2), 16) * (1 - withWhite) + 255 * withWhite).toString(16).padStart(2, '0')).join('');
const contrast = (a: string, b: string) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

test('About, Insights and Contact each have a title box and content box colour, black by default', () => {
  for (const id of ['about', 'insights', 'contact'] as const) {
    assert.equal(DEFAULT_DESIGN.pageColours[id].title, '#231f20', id);
    assert.equal(DEFAULT_DESIGN.pageColours[id].box, '#231f20', id);
  }
});

test('the stylesheet sets each page\u2019s title box and content box colours', () => {
  const design = { ...DEFAULT_DESIGN, pageColours: { ...DEFAULT_DESIGN.pageColours, about: { ...DEFAULT_DESIGN.pageColours.about, title: '#1f6b6b', box: '#1f3a5f' } } };
  const css = designCss(design);
  assert.ok(css.includes('--page-title:#1f6b6b'));
  assert.ok(css.includes('--page-box:#1f3a5f'));
});

test('text inside any box colour stays readable: body text and small labels at least 4.5:1', () => {
  for (const c of DARK_COLOURS) {
    assert.ok(contrast('#ffffff', c.value) >= 4.5, `${c.name} headings`);
    // Box body text is white at 85% over the box; labels are gold at 30% over white.
    assert.ok(contrast(mix(c.value, 0.85), c.value) >= 4.5, `${c.name} body text`);
    assert.ok(contrast(mix('#c9a15a', 0.7), c.value) >= 4.5, `${c.name} labels`);
  }
});

test('only dark palette colours can be saved for title boxes and boxes', () => {
  const bad = { ...DEFAULT_DESIGN, pageColours: { ...DEFAULT_DESIGN.pageColours, about: { ...DEFAULT_DESIGN.pageColours.about, box: '#ffffff' } } };
  assert.equal(siteDesignSchema.safeParse(bad).success, false);
});

// Reil (30 Sep): #1f2428 (the Slate brand direction's dark) is a colour choice too.
test('slate is offered for boxes, the button and backgrounds', () => {
  assert.ok(DARK_COLOURS.some((c) => c.name === 'Slate' && c.value === '#1f2428'));
  assert.ok(PAGE_COLOURS.some((c) => c.name === 'Slate' && c.value === '#1f2428'));
});
