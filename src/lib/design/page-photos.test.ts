import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, statSync } from 'node:fs';
import { PAGE_PHOTOS } from './page-photos.ts';
import { SITE_PAGES } from './types.ts';

// April (29 Sep): a photo on each page. These are licensed stand-ins for her references.
test('every page has a photo', () => {
  assert.deepEqual(Object.keys(PAGE_PHOTOS).sort(), SITE_PAGES.map((p) => p.id).sort());
});

test('each photo is a small webp shipped with the site', () => {
  for (const [page, photo] of Object.entries(PAGE_PHOTOS)) {
    assert.match(photo.src, /^\/images\/pages\/[a-z-]+\.webp$/, page);
    const size = statSync(new URL(`../../../public${photo.src}`, import.meta.url)).size;
    assert.ok(size < 300 * 1024, `${page} photo is ${Math.round(size / 1024)} KB`);
  }
});

test('each photo describes itself for screen readers', () => {
  for (const [page, photo] of Object.entries(PAGE_PHOTOS)) assert.ok(photo.alt.length > 10, `${page} alt text`);
});

test('CREDITS.md credits every photo with its Pexels source', () => {
  const credits = readFileSync(new URL('../../../public/images/pages/CREDITS.md', import.meta.url), 'utf8');
  for (const photo of Object.values(PAGE_PHOTOS)) {
    const file = photo.src.split('/').pop()!;
    assert.match(credits, new RegExp(`\`${file}\`.*https://www\\.pexels\\.com/photo/`), file);
  }
});
