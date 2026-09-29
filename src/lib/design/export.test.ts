import { test } from 'node:test';
import assert from 'node:assert/strict';
import { designExport, designMarkdown, designSummary, designText, exportFilename } from './export.ts';
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

const names = {
  backgrounds: [{ id: 'desert', label: 'Pale dunes' }],
  colours: [{ name: 'Brown', value: '#6b4a2e' }],
  logos: [{ id: '01', name: 'Seal' }],
};
const exported = new Date(2026, 8, 29, 13, 26);
const row = (summary: ReturnType<typeof designSummary>, label: string) =>
  summary.sections.flatMap((s) => s.rows).find((r) => r.label === label)?.value;

test('the summary names each choice the way the Site settings panel does, not by its code', () => {
  const summary = designSummary(design, names, exported);
  assert.equal(row(summary, 'Background'), 'Pale dunes');
  assert.equal(row(summary, 'Homepage layout'), 'Split');
  assert.equal(row(summary, 'About, Insights and Contact layout'), 'Heading on side');
  assert.equal(row(summary, 'Header'), 'Everything centred');
  assert.equal(row(summary, 'Logo'), 'Name only');
  assert.equal(row(summary, 'Heading colour'), 'Brown');
  assert.equal(row(summary, 'Headings font'), 'Poppins');
  assert.equal(row(summary, 'Body text font'), 'Inter');
  assert.equal(row(summary, 'Heading size'), '115%');
  assert.equal(row(summary, 'Body text size'), '17px');
});

test('the summary covers the other background and logo picks', () => {
  const summary = designSummary({ ...design, background: { ...design.background, kind: 'white' }, logo: '01' }, names, exported);
  assert.equal(row(summary, 'Background'), 'Plain white');
  assert.equal(row(summary, 'Logo'), 'Seal');
});

test('an empty tagline reads as "None" rather than a blank line', () => {
  assert.equal(row(designSummary(design, names, exported), 'Homepage tagline'), 'None');
});

test('the text file lists every section and choice', () => {
  const text = designText(designSummary(design, names, exported));
  assert.match(text, /^IEJF website design choices\n/);
  assert.match(text, /\nLOOK\n {2}Background: Pale dunes\n/);
  assert.match(text, /\n {2}Contact email: hello@justicefund\.org\.au\n/);
});

test('the markdown file uses headings and a bullet per choice', () => {
  const md = designMarkdown(designSummary(design, names, exported));
  assert.match(md, /^# IEJF website design choices\n/);
  assert.match(md, /\n## Look\n\n- \*\*Background:\*\* Pale dunes\n/);
});

test('each format gets the same dated file name with its own extension', () => {
  assert.equal(exportFilename(exported, 'pdf'), 'iejf-design-2026-09-29.pdf');
  assert.equal(exportFilename(exported, 'docx'), 'iejf-design-2026-09-29.docx');
});
