import { chromium, expect } from '@playwright/test';
import assert from 'node:assert/strict';
import { mkdir, readFile } from 'node:fs/promises';
import { runInNewContext } from 'node:vm';
import AxeBuilder from '@axe-core/playwright';

const base = process.env.QA_URL || 'http://localhost:3101';
const css = await readFile('src/app/globals.css', 'utf8');
for (const [, axis, declarations] of css.matchAll(/\[data-(brand|type)="[^"]+"\]\s*\{([^}]+)\}/g)) {
  const properties = [...declarations.matchAll(/(--[\w-]+)\s*:/g)].map(match => match[1]);
  if (axis === 'type') assert.deepEqual(properties.sort(), ['--font-body', '--font-heading']);
  else assert(properties.every(property => !property.includes('font')));
}
const browser = await chromium.launch();
const context = await browser.newContext();
const page = await context.newPage();
const errors = [];
page.on('pageerror', error => errors.push(error.message));
await mkdir('qa-output', { recursive: true });
try {
  await page.goto(base);
  const prePaint = await page.locator('head script').allTextContents();
  const script = prePaint.find(source => source.includes('var brandIds='));
  assert(script, 'Pre-paint script is in the head');
  for (const invalid of [false, true]) {
    const values = new Map([['brand', invalid ? 'bad' : 'c'], ['type', invalid ? 'bad' : 't9'], ['chooserCollapsed', 'true']]);
    const attributes = {};
    const root = { dataset: {}, setAttribute: (key, value) => { attributes[key] = value; } };
    runInNewContext(script, {
      URLSearchParams, window: { location: { search: '' } },
      localStorage: { getItem: key => values.get(key) ?? null },
      document: { documentElement: root, createElement: () => ({}), head: { appendChild() {} } },
    });
    assert.equal(attributes['data-brand'], invalid ? 'a' : 'c');
    assert.equal(attributes['data-type'], invalid ? undefined : 't9');
    assert.equal(root.dataset.chooserCollapsed, 'true');
  }
  const panel = page.getByRole('region', { name: 'Brand and design preview controls' });
  const toggle = panel.getByRole('button', { name: /Collapse|Design/ });
  await expect(toggle).toHaveAttribute('aria-expanded', 'true');
  await expect(panel.getByRole('group', { name: 'Type pairing' }).getByRole('button')).toHaveCount(12);
  await panel.getByRole('button', { name: 'Slate', exact: true }).click();
  await panel.getByRole('button', { name: 'Sora / Sora', exact: true }).click();
  await expect(page.locator('html')).toHaveAttribute('data-brand', 'c');
  await expect(page.locator('html')).toHaveAttribute('data-type', 't9');
  await toggle.focus();
  await page.keyboard.press('Enter');
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  await expect(panel.getByRole('group', { name: 'Colour direction' })).toBeHidden();
  await page.goto(base + '/about');
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  await expect(page.locator('html')).toHaveAttribute('data-brand', 'c');
  await expect(page.locator('html')).toHaveAttribute('data-type', 't9');
  await toggle.click();
  await panel.getByRole('button', { name: 'Card', exact: true }).click();
  await expect(page.locator('html')).toHaveAttribute('data-type', 't9');
  await panel.getByRole('button', { name: 'Default', exact: true }).click();
  await expect(page.locator('html')).not.toHaveAttribute('data-type');
  await expect(page.locator('html')).toHaveAttribute('data-brand', 'a');
  for (const width of [320, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    const bounds = await panel.boundingBox();
    assert(bounds.x >= 0 && bounds.x + bounds.width <= width);
    assert(bounds.y >= 0 && bounds.y + bounds.height <= 900);
    await page.screenshot({ path: `qa-output/brand-chooser-${width}.png` });
  }
  const axe = await new AxeBuilder({ page }).include('.brand-chooser').analyze();
  assert.deepEqual(axe.violations.map(v => v.id), []);
  for (const direction of ['Paper', 'Slate', 'Card']) {
    await panel.getByRole('button', { name: direction, exact: true }).click();
    const result = await new AxeBuilder({ page }).include('.brand-chooser').analyze();
    assert.deepEqual(result.violations.map(v => v.id), [], direction);
  }
  await panel.getByRole('link', { name: 'Compare' }).click();
  await expect(page).toHaveURL(base + '/brand');
  await page.goto(base + '/?brand=c&type=t9');
  await expect(page.locator('html')).toHaveAttribute('data-brand', 'c');
  await page.goto(base + '/?brand=invalid&type=invalid');
  await expect(page.locator('html')).toHaveAttribute('data-brand', 'a');
  await expect(page.locator('html')).not.toHaveAttribute('data-type');
  await page.reload();
  await expect(panel.getByRole('button', { name: 'Card', exact: true })).toHaveAttribute('aria-pressed', 'true');
  const blocked = await browser.newContext();
  await blocked.addInitScript(() => {
    Object.defineProperty(window, 'localStorage', { get() { throw new Error('Storage blocked'); } });
  });
  const blockedPage = await blocked.newPage();
  await blockedPage.goto(base);
  await blockedPage.getByRole('button', { name: 'Slate', exact: true }).click();
  await expect(blockedPage.locator('html')).toHaveAttribute('data-brand', 'c');
  await blockedPage.getByRole('button', { name: /Collapse/ }).click();
  await expect(blockedPage.getByRole('button', { name: /Design/ })).toHaveAttribute('aria-expanded', 'false');
  await blocked.close();
  assert.deepEqual(errors, []);
  console.log('BrandChooser: persistence, independent axes, collapse, keyboard, responsive, accessibility, comparison, invalid values and blocked storage passed.');
} finally {
  await browser.close();
}
