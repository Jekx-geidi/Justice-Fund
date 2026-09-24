import { test } from 'node:test';
import assert from 'node:assert/strict';
import { designExport } from './export.ts';
import type { SiteDesign } from './types.ts';

const design: SiteDesign = {
  background: { kind: 'image', imageId: 'desert', customUrl: '' },
  homeLayout: 'split',
  pageLayout: 'side',
  headingFont: 'Poppins',
  bodyFont: 'Inter',
  headingSize: 115,
  bodySize: 17,
  menuSize: 13,
  headingColour: '#6b4a2e',
  headerStyle: 'centred',
  logo: '',
  text: { homeHeading: 'Intergenerational Justice Fund', homeTagline: '', contactEmail: 'hello@justicefund.org.au', abn: '51 656 623 719' },
  seo: { title: 'IEJF', description: 'About the fund', keywords: 'justice' },
};

test('the file holds every selection, so it can be loaded back as a SiteDesign later', () => {
  const { json } = designExport(design, '/about', new Date(2026, 8, 24, 14, 5));
  assert.deepEqual(JSON.parse(json).design, design);
});

test('the file says what it is, which page it came from and when', () => {
  const now = new Date(2026, 8, 24, 14, 5);
  const file = JSON.parse(designExport(design, '/about', now).json);
  assert.equal(file.kind, 'iejf-site-design');
  assert.equal(file.version, 1);
  assert.equal(file.page, '/about');
  assert.equal(file.exportedAt, now.toISOString());
});

test('the file is named after the local date it was exported', () => {
  const { filename } = designExport(design, '/', new Date(2026, 8, 4, 23, 59));
  assert.equal(filename, 'iejf-design-2026-09-04.json');
});

test('the json is indented so it reads cleanly in an email attachment', () => {
  const { json } = designExport(design, '/', new Date(2026, 8, 24));
  assert.match(json, /\n  "design": \{/);
});
