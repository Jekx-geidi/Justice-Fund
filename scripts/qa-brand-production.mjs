import { chromium, expect } from '@playwright/test';
import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';

// Run after NEXT_PUBLIC_BRAND_CHOOSER=false npm run build, against next start.
const base = process.env.QA_URL || 'http://localhost:3101';
for (const path of await readdir('.next/static/chunks', { recursive: true })) {
  if (!path.endsWith('.js')) continue;
  const js = await readFile(`.next/static/chunks/${path}`, 'utf8');
  assert(!/chooserCollapsed|brand-chooser-body|brand-compare-fonts|fonts\.googleapis\.com/.test(js), `Preview JS leaked into ${path}`);
}
const browser = await chromium.launch();
try {
  const page = await browser.newPage();
  const fonts = [];
  page.on('request', request => {
    if (/fonts\.(googleapis|gstatic)\.com/.test(request.url())) fonts.push(request.url());
  });
  await page.goto(base + '/?brand=c&type=t9');
  await expect(page.locator('html')).toHaveAttribute('data-brand', 'b');
  await expect(page.locator('html')).not.toHaveAttribute('data-type');
  await expect(page.locator('.brand-chooser')).toHaveCount(0);
  assert(!(await page.content()).includes('chooserCollapsed'));
  for (const route of ['/brand', '/brand/artwork']) {
    const response = await page.goto(base + route);
    assert.equal(response.status(), 404);
  }
  assert.deepEqual(fonts, []);
  console.log('Flag-off production: fixed theme, no chooser markup/script, no preview JS in chunks, no remote fonts, comparison routes return 404.');
} finally {
  await browser.close();
}
