import { test } from 'node:test';
import assert from 'node:assert/strict';
import { DEFAULT_DESIGN } from './types.ts';

// April's export of 6 Oct (iejf-design-2026-10-06.html, email 6 Oct 9:30 AM), after her live edit with Ange, with the
// heading she couldn't finish ("...unaddressed") and the Home box Teal for the focus cards now on Home.
test('the default design is April’s 6 Oct export, field for field', () => {
  assert.deepEqual(DEFAULT_DESIGN, {
    background: { kind: 'colour', imageId: 'desert-field', customUrl: '', colour: '#231f20' },
    homeLayout: 'split',
    pageLayout: 'stacked',
    headingFont: 'Poppins',
    bodyFont: 'Poppins',
    headingSize: 96,
    bodySize: 18,
    menuSize: 15,
    headingColour: '#1f6b6b',
    buttonColour: '#1f2428',
    headerColour: '#231f20',
    footerColour: '#1f2428',
    accentColour: '#c9a15a',
    hoverColour: '#1f2428',
    headerStyle: 'split',
    stickyHeader: true,
    logo: '',
    pageColours: {
      home: { background: '#1f6b6b', text: '#ffffff', title: '#231f20', box: '#1f6b6b' },
      about: { background: '#f5f3f1', text: '#231f20', title: '#1f6b6b', box: '#1f6b6b' },
      insights: { background: '#f5f3f1', text: '#231f20', title: '#1f3a5f', box: '#1f3a5f' },
      contact: { background: '#1f2428', text: '#231f20', title: '#1f6b6b', box: '#1f6b6b' },
    },
    photos: { home: 'earth-hurricane', about: 'sierra-leone-planting', insights: 'rainforest-river', contact: 'perth-skyline-night' },
    photoFrames: {
      home: { x: 50, y: 55, zoom: 100, opacity: 100 },
      about: { x: 50, y: 70, zoom: 100, opacity: 100 },
      insights: { x: 50, y: 60, zoom: 100, opacity: 100 },
      contact: { x: 50, y: 50, zoom: 100, opacity: 100 },
    },
    text: {
      homeHeading: 'We use the law to drive systemic change, targeting issues that will cause escalating harm to future generations if left unaddressed',
      homeTagline: '',
      contactEmail: 'hello@justicefund.org.au',
      abn: '51 656 623 719',
    },
    seo: {
      title: 'Intergenerational Justice Fund',
      description:
        'We use the law to drive systemic change, targeting issues that will cause escalating harm to future generations if left unaddressed.',
      keywords: 'intergenerational justice, strategic litigation, environmental law, public interest law, charity Perth',
    },
  });
});

// April (29 Sep): toggle the background and font colours on each page; add dark blue and teal to the palette.
import { SITE_PAGES, PAGE_COLOURS, HEADING_COLOURS, designCss, withDefaults } from './types.ts';
import { siteDesignSchema } from './validation.ts';

const hex = (name: string) => PAGE_COLOURS.find((c) => c.name === name)!.value;

test('older settings keep the header sticky by default', () => {
  const { stickyHeader, ...legacy } = DEFAULT_DESIGN;
  assert.equal(withDefaults(legacy).stickyHeader, true);
  assert.equal(siteDesignSchema.parse(legacy).stickyHeader, true);
});

test('both header choices survive validation and saved-settings loading', () => {
  for (const stickyHeader of [true, false]) {
    const saved = siteDesignSchema.parse({ ...DEFAULT_DESIGN, stickyHeader });
    const restored = withDefaults(JSON.parse(JSON.stringify(saved)));
    assert.equal(restored.stickyHeader, stickyHeader);
    assert.ok(designCss(restored).includes(`.site-shell .site-header{position:${stickyHeader ? 'sticky' : 'static'};}`));
  }
  assert.equal(siteDesignSchema.safeParse({ ...DEFAULT_DESIGN, stickyHeader: 'false' }).success, false);
});

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

test('the button offers April\u2019s dark blue and teal', () => {
  for (const name of ['Dark blue', 'Teal']) assert.ok(DARK_COLOURS.some((c) => c.name === name), name);
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

test('About, Insights and Contact each have a title box and content box colour', () => {
  for (const id of ['about', 'insights', 'contact'] as const) {
    assert.ok(DEFAULT_DESIGN.pageColours[id].title && DEFAULT_DESIGN.pageColours[id].box, id);
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

// Reil (30 Sep): customise everything, so the header, footer and accent lines have colours too.
import { ACCENT_COLOURS } from './types.ts';

test('the header text turns white on a dark header and stays dark on a light one', () => {
  assert.ok(designCss({ ...DEFAULT_DESIGN, headerColour: '#1f3a5f' }).includes('--header-bg:#1f3a5f;--header-text:#ffffff'));
  assert.ok(designCss({ ...DEFAULT_DESIGN, headerColour: '#f5f3f1' }).includes('--header-bg:#f5f3f1;--header-text:#231f20'));
});

test('the stylesheet sets the footer and accent colours', () => {
  const css = designCss({ ...DEFAULT_DESIGN, footerColour: '#1f6b6b', accentColour: '#7b2d26' });
  assert.ok(css.includes('--footer-bg:#1f6b6b'));
  assert.ok(css.includes('--gold:#7b2d26'));
});

test('the accent palette includes gold and April\u2019s dark blue and teal', () => {
  for (const name of ['Gold', 'Dark blue', 'Teal']) assert.ok(ACCENT_COLOURS.some((c) => c.name === name), name);
});

test('only palette colours can be saved for the header, footer and accent', () => {
  for (const key of ['headerColour', 'footerColour', 'accentColour'] as const) {
    assert.equal(siteDesignSchema.safeParse({ ...DEFAULT_DESIGN, [key]: 'red;}' }).success, false, key);
  }
});

// Reil (30 Sep): the colour menu links turn on hover is customisable.
test('menu links hover in the chosen colour on a light header', () => {
  assert.ok(designCss({ ...DEFAULT_DESIGN, headerColour: '#ffffff', hoverColour: '#7b2d26' }).includes('--hover:#7b2d26'));
});

test('every hover colour reads on a white header (at least 4.5:1)', () => {
  for (const c of DARK_COLOURS) assert.ok(contrast(c.value, '#ffffff') >= 4.5, c.name);
});

test('on a dark header the hover colour is lightened so it still shows', () => {
  const css = designCss({ ...DEFAULT_DESIGN, headerColour: '#1f3a5f', hoverColour: '#1f6b6b' });
  assert.ok(css.includes('--hover:color-mix(in srgb,#1f6b6b 35%,#fff)'));
  assert.ok(css.includes('--hover-raw:#1f6b6b'));
});

test('only palette hover colours can be saved', () => {
  assert.equal(siteDesignSchema.safeParse({ ...DEFAULT_DESIGN, hoverColour: 'red;}' }).success, false);
});

// April (6 Oct): "I couldn't fit 'unaddressed'". The whole sentence (132 characters) must fit.
test('the Home heading can hold her whole sentence', () => {
  assert.ok(siteDesignSchema.safeParse(DEFAULT_DESIGN).success);
  assert.ok(DEFAULT_DESIGN.text.homeHeading.endsWith('if left unaddressed'));
  const long = { ...DEFAULT_DESIGN, text: { ...DEFAULT_DESIGN.text, homeHeading: 'x'.repeat(161) } };
  assert.equal(siteDesignSchema.safeParse(long).success, false);
});

// April (6 Oct): the About focus cards moved to Home; they take the Home box colour (Site settings "Homepage boxes").
test('the focus cards on Home use the Home box colour', () => {
  const design = { ...DEFAULT_DESIGN, pageColours: { ...DEFAULT_DESIGN.pageColours, home: { ...DEFAULT_DESIGN.pageColours.home, box: '#7b2d26' } } };
  assert.ok(designCss(design).includes('.home-sections{--page-box:#7b2d26;}'));
});
