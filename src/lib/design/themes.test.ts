import { test } from 'node:test';
import assert from 'node:assert/strict';
import { DEFAULT_DESIGN, SITE_PAGES } from './types.ts';
import { siteDesignSchema } from './validation.ts';
import { COLOUR_THEMES, applyTheme, activeTheme } from './themes.ts';

// April (email 1 Oct): "Could you also please add more colour theme options." Reil (2 Oct): one-click preset themes.
test('there are six colour themes with unique ids and names', () => {
  assert.equal(COLOUR_THEMES.length, 6);
  assert.equal(new Set(COLOUR_THEMES.map((t) => t.id)).size, 6);
  assert.equal(new Set(COLOUR_THEMES.map((t) => t.name)).size, 6);
});

test('every theme can be saved: its colours are all palette colours', () => {
  for (const theme of COLOUR_THEMES) assert.ok(siteDesignSchema.safeParse(applyTheme(DEFAULT_DESIGN, theme)).success, theme.name);
});

test('a theme sets the header, footer, button, accent, hover and heading colours', () => {
  const navy = COLOUR_THEMES.find((t) => t.id === 'navy-gold')!;
  const design = applyTheme(DEFAULT_DESIGN, navy);
  assert.deepEqual(
    [design.headerColour, design.footerColour, design.buttonColour, design.accentColour, design.hoverColour, design.headingColour],
    ['#ffffff', '#1f3a5f', '#1f3a5f', '#c9a15a', '#1f3a5f', '#1f3a5f']
  );
});

test('a theme sets the Home box and every page’s title and content boxes', () => {
  const design = applyTheme(DEFAULT_DESIGN, COLOUR_THEMES.find((t) => t.id === 'earth')!);
  assert.deepEqual(design.pageColours.home, { background: '#4a3222', text: '#ffffff', title: '#4a3222', box: '#4a3222' });
  for (const { id } of SITE_PAGES) {
    assert.equal(design.pageColours[id].title, '#4a3222', id);
    assert.equal(design.pageColours[id].box, '#4a3222', id);
  }
});

test('a theme leaves fonts, sizes, layout, photos, text and the other pages’ backgrounds alone', () => {
  const design = applyTheme(DEFAULT_DESIGN, COLOUR_THEMES.find((t) => t.id === 'ocean')!);
  for (const key of ['background', 'homeLayout', 'pageLayout', 'headingFont', 'bodyFont', 'headingSize', 'bodySize', 'menuSize', 'headerStyle', 'stickyHeader', 'logo', 'text', 'seo', 'photos', 'photoFrames'] as const) {
    assert.deepEqual(design[key], DEFAULT_DESIGN[key], key);
  }
  for (const id of ['about', 'insights', 'contact'] as const) {
    assert.equal(design.pageColours[id].background, DEFAULT_DESIGN.pageColours[id].background, id);
    assert.equal(design.pageColours[id].text, DEFAULT_DESIGN.pageColours[id].text, id);
  }
});

test('applying a theme does not change the design it was given', () => {
  const before = structuredClone(DEFAULT_DESIGN);
  applyTheme(DEFAULT_DESIGN, COLOUR_THEMES[1]);
  assert.deepEqual(DEFAULT_DESIGN, before);
});

test('April’s 1 Oct design is the "April’s pick" theme', () => {
  assert.equal(activeTheme(DEFAULT_DESIGN)?.id, 'april');
  assert.deepEqual(applyTheme(DEFAULT_DESIGN, COLOUR_THEMES.find((t) => t.id === 'april')!), DEFAULT_DESIGN);
});

test('each theme is recognised once applied', () => {
  for (const theme of COLOUR_THEMES) assert.equal(activeTheme(applyTheme(DEFAULT_DESIGN, theme))?.id, theme.id, theme.name);
});

test('after any colour is changed by hand the design is a custom one', () => {
  assert.equal(activeTheme({ ...DEFAULT_DESIGN, footerColour: '#231f20' }), null);
  const about = { ...DEFAULT_DESIGN.pageColours.about, box: '#7b2d26' };
  assert.equal(activeTheme({ ...DEFAULT_DESIGN, pageColours: { ...DEFAULT_DESIGN.pageColours, about } }), null);
});
