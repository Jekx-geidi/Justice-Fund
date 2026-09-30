import { test } from 'node:test';
import assert from 'node:assert/strict';
import { HOME_SECTIONS, HOME_HERO, homeSections, paragraphs } from './home-sections.ts';

// Ange's Home page suggestion (April's email, 30 Sep): hero, "What We Do" with two cards, "Why Intergenerational Justice Matters".
test('the hero uses Ange’s heading and paragraph', () => {
  assert.equal(HOME_HERO.heading, 'We’re using law to drive systemic change for future generations');
  assert.match(HOME_HERO.paragraph, /^We target legal issues that will cause escalating harm to future generations if left unaddressed\./);
});

test('the hero buttons lead to Contact (Get Involved) and About (Learn More)', () => {
  assert.deepEqual(HOME_HERO.actions, [
    { label: 'Get Involved', href: '/contact' },
    { label: 'Learn More', href: '/about' },
  ]);
});

test('"What We Do" has Ange’s intro and the Strategic Litigation and Policy Reform cards', () => {
  assert.equal(HOME_SECTIONS.whatWeDo.heading, 'What We Do');
  assert.deepEqual(HOME_SECTIONS.whatWeDo.cards.map((c) => c.title), ['Strategic Litigation', 'Policy Reform']);
});

test('"Why Intergenerational Justice Matters" starts with Ange’s opening paragraph', () => {
  assert.equal(HOME_SECTIONS.why.heading, 'Why Intergenerational Justice Matters');
  assert.match(paragraphs(HOME_SECTIONS.why.body)[0], /^Every decision made today has consequences for generations to come\./);
});

test('pages saved before these sections existed show Ange’s copy', () => {
  assert.deepEqual(homeSections({}), HOME_SECTIONS);
});

test('edited copy is kept, and anything left out falls back to the default', () => {
  const merged = homeSections({ whatWeDo: { heading: 'Our work', intro: '', cards: [] } });
  assert.equal(merged.whatWeDo.heading, 'Our work');
  assert.deepEqual(merged.why, HOME_SECTIONS.why);
});

test('the "Why" text splits into paragraphs on blank lines and drops empty ones', () => {
  assert.deepEqual(paragraphs('One.\n\nTwo\nstill two.\n\n\n'), ['One.', 'Two\nstill two.']);
});
