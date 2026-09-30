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

test('the default homepage tagline is the one April wrote', () => {
  assert.equal(
    DEFAULT_DESIGN.text.homeTagline,
    'We use the law to drive systemic change, targeting issues that will cause escalating harm to future generations if left unaddressed'
  );
});
