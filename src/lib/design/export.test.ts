import { test } from 'node:test';
import assert from 'node:assert/strict';
import { designJson, exportFilename } from './export.ts';
import type { SiteDesign } from './types.ts';

const design: SiteDesign = {
  background: { kind: 'image', imageId: 'desert', customUrl: '', colour: '' },
  homeLayout: 'split',
  pageLayout: 'side',
  headingFont: 'Poppins',
  bodyFont: 'Inter',
  headingSize: 115,
  bodySize: 17,
  menuSize: 13,
  headingColour: '#6b4a2e',
  buttonColour: '#1f6b6b',
  headerStyle: 'centred',
  logo: '',
  text: { homeHeading: 'Intergenerational Justice Fund', homeTagline: '', contactEmail: 'hello@justicefund.org.au', abn: '51 656 623 719' },
  seo: { title: 'IEJF', description: 'About the fund', keywords: 'justice' },
  pageColours: {
    home: { background: '#231f20', text: '#ffffff' },
    about: { background: '#f5f3f1', text: '#231f20' },
    insights: { background: '#f5f3f1', text: '#231f20' },
    contact: { background: '#f5f3f1', text: '#231f20' },
  },
  photos: { home: 'earth-clouds', about: 'people-planting', insights: 'rainforest-river', contact: 'perth-evening' },
};

test('the file holds every selection, so it can be loaded back as a SiteDesign later', () => {
  const json = designJson(design, '/about', new Date(2026, 8, 24, 14, 5));
  assert.deepEqual(JSON.parse(json).design, design);
});

test('the file says what it is, which page it came from and when', () => {
  const now = new Date(2026, 8, 24, 14, 5);
  const file = JSON.parse(designJson(design, '/about', now));
  assert.equal(file.kind, 'iejf-site-design');
  assert.equal(file.version, 1);
  assert.equal(file.page, '/about');
  assert.equal(file.exportedAt, now.toISOString());
});

test('the file is named after the local date it was exported', () => {
  assert.equal(exportFilename(new Date(2026, 8, 4, 23, 59), 'html'), 'iejf-design-2026-09-04.html');
});

test('the json is indented so it reads cleanly when opened', () => {
  const json = designJson(design, '/', new Date(2026, 8, 24));
  assert.match(json, /\n  "design": \{/);
});
