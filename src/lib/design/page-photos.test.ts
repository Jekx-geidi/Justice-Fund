import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, statSync } from 'node:fs';
import { PHOTO_OPTIONS, pagePhoto } from './page-photos.ts';
import { DEFAULT_DESIGN, SITE_PAGES, withDefaults } from './types.ts';
import { siteDesignSchema } from './validation.ts';

const size = (src: string) => statSync(new URL(`../../../public${src}`, import.meta.url)).size;

// April (29 Sep): a photo on each page; Junrey (30 Sep): about five to choose from on each.
test('every page offers five photos', () => {
  assert.deepEqual(Object.keys(PHOTO_OPTIONS).sort(), SITE_PAGES.map((p) => p.id).sort());
  for (const [page, options] of Object.entries(PHOTO_OPTIONS)) assert.equal(options.length, 5, page);
});

test('photo ids are unique across the site', () => {
  const ids = Object.values(PHOTO_OPTIONS).flat().map((p) => p.id);
  assert.equal(new Set(ids).size, ids.length);
});

test('each photo is a small webp with a thumbnail for Site settings', () => {
  for (const photo of Object.values(PHOTO_OPTIONS).flat()) {
    assert.match(photo.src, /^\/images\/pages\/[a-z-]+\.webp$/, photo.id);
    assert.ok(size(photo.src) < 300 * 1024, `${photo.id} is ${Math.round(size(photo.src) / 1024)} KB`);
    assert.match(photo.thumb, /^\/images\/pages\/thumbs\/[a-z-]+\.webp$/, photo.id);
    assert.ok(size(photo.thumb) < 30 * 1024, `${photo.id} thumbnail`);
  }
});

test('each photo describes itself for screen readers', () => {
  for (const photo of Object.values(PHOTO_OPTIONS).flat()) assert.ok(photo.alt.length > 10, `${photo.id} alt text`);
});

test('CREDITS.md credits every photo with its Pexels or Unsplash source', () => {
  const credits = readFileSync(new URL('../../../public/images/pages/CREDITS.md', import.meta.url), 'utf8');
  for (const photo of Object.values(PHOTO_OPTIONS).flat()) {
    const file = photo.src.split('/').pop()!;
    assert.match(credits, new RegExp(`\`${file}\`.*https://(www\\.pexels\\.com/photo|unsplash\\.com/photos)/`), file);
  }
});

test('each page starts on its first photo', () => {
  for (const page of SITE_PAGES) assert.equal(DEFAULT_DESIGN.photos[page.id], PHOTO_OPTIONS[page.id][0].id, page.id);
});

test('the chosen photo is shown, and an unknown one falls back to the page default', () => {
  assert.equal(pagePhoto('contact', 'kings-park-night').id, 'kings-park-night');
  assert.equal(pagePhoto('contact', 'earth-clouds').id, PHOTO_OPTIONS.contact[0].id, "another page's photo");
  assert.equal(pagePhoto('about', undefined).id, PHOTO_OPTIONS.about[0].id);
});

test('settings saved before photo choices existed get the defaults', () => {
  const { photos: _dropped, ...old } = DEFAULT_DESIGN;
  assert.deepEqual(withDefaults(old as never).photos, DEFAULT_DESIGN.photos);
});

test('only that page’s own photos can be saved', () => {
  assert.ok(siteDesignSchema.safeParse({ ...DEFAULT_DESIGN, photos: { ...DEFAULT_DESIGN.photos, contact: 'kings-park-night' } }).success);
  assert.equal(siteDesignSchema.safeParse({ ...DEFAULT_DESIGN, photos: { ...DEFAULT_DESIGN.photos, contact: 'earth-clouds' } }).success, false);
});
