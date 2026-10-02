import { test } from 'node:test';
import assert from 'node:assert/strict';
import { focusSelector } from './focus-targets.ts';

// Reil (30 Sep): Focus mode highlights the part of the page a Site settings control changes.
test('each page’s photo, colours and boxes point at their part of the page', () => {
  assert.equal(focusSelector('Home photo'), '.home-photo, .page-photo');
  assert.equal(focusSelector('Contact photo'), '.home-photo, .page-photo');
  assert.equal(focusSelector('About title box'), '.page-frame-head');
  assert.equal(focusSelector('Insights boxes'), '.focus-card, .case-item-dark, .contact-card');
  assert.equal(focusSelector('About page background'), '.home-box, .page-frame');
  assert.equal(focusSelector('Home page text'), '.home-box, .page-frame-body');
});

test('site-wide controls point at the header, footer, button and accent lines', () => {
  assert.equal(focusSelector('Header (all pages)'), '.site-header');
  assert.equal(focusSelector('Footer (all pages)'), '.site-footer');
  assert.equal(focusSelector('Get Involved button'), '.home-cta');
  assert.match(focusSelector('Accent lines (all pages)')!, /\.focus-card/);
  assert.equal(focusSelector('Logo'), '.site-header');
});

test('each text field points at exactly where its text shows', () => {
  assert.equal(focusSelector('Homepage heading'), '[data-design-text="homeHeading"]');
  assert.equal(focusSelector('Homepage tagline (optional)'), '[data-design-text="homeTagline"]');
  assert.equal(focusSelector('Contact email'), '[data-design-text="contactEmail"]');
  assert.equal(focusSelector('ABN'), '[data-design-text="abn"]');
});

test('fonts and sizes point at headings, body text or the menu', () => {
  assert.equal(focusSelector('Headings'), 'main h1, main h2, main h3');
  assert.equal(focusSelector('Body text'), 'main p');
  assert.equal(focusSelector('Menu'), '.desktop-nav, .menu-trigger');
  assert.equal(focusSelector('Hover colour (all pages)'), '.desktop-nav, .menu-trigger');
});

test('search settings have nothing on the page to highlight', () => {
  assert.equal(focusSelector('Page title'), null);
  assert.equal(focusSelector('Keywords (separate with commas)'), null);
});

// April (1 Oct): colour themes recolour the header, footer and every box at once.
test('the colour theme points at everything a theme recolours', () => {
  const selector = focusSelector('Colour theme (all pages)')!;
  for (const part of ['.site-header', '.site-footer', '.home-box', '.page-frame-head', '.focus-card']) assert.ok(selector.includes(part), part);
});
