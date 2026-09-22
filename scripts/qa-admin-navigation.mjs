import { chromium, expect } from '@playwright/test';
import { mkdir } from 'node:fs/promises';

// Point QA_ADMIN_PATH at an isolated shell fixture, or use a signed-in storage
// state for the protected portal. Never bypass authentication in application code.
const base = process.env.QA_URL || 'http://localhost:3100';
const route = process.env.QA_ADMIN_PATH || '/admin';
const browser = await chromium.launch();
try {
  const context = await browser.newContext({ storageState: process.env.QA_STORAGE_STATE || undefined });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  const menu = page.getByRole('button', { name: 'Open admin navigation', exact: true });
  const panel = page.locator('#admin-navigation-panel');
  const close = panel.getByRole('button', { name: 'Close admin navigation', exact: true });
  await mkdir('qa-output', { recursive: true });
  for (const width of [320, 390, 430, 767, 768, 820, 1024, 1025, 1280, 1440, 1920]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto(base + route);
    await expect(page.locator('.admin-shell')).toBeVisible();
    if (width <= 1024) {
      await expect(menu).toBeVisible();
      await expect(panel).toBeHidden();
      await menu.click();
      await expect(panel).toBeVisible();
      await expect(close).toBeFocused();
      await expect(panel.getByRole('navigation').getByRole('link')).toHaveText(['Dashboard', 'Pages', 'Insights', 'Media', 'Settings']);
      await expect(page.locator('body')).toHaveCSS('overflow', 'hidden');
      for (let i = 0; i < 12; i++) {
        await page.keyboard.press('Tab');
        expect(await panel.evaluate(el => el.contains(document.activeElement))).toBe(true);
      }
      await close.focus();
      await page.keyboard.press('Shift+Tab');
      expect(await panel.evaluate(el => el.contains(document.activeElement))).toBe(true);
      await page.screenshot({ path: `qa-output/admin-drawer-${width}.png` });
      await page.keyboard.press('Escape');
      await expect(panel).toBeHidden();
      await expect(menu).toBeFocused();
      await expect(page.locator('body')).not.toHaveCSS('overflow', 'hidden');
      await menu.click();
      await page.locator('.admin-drawer-overlay').click({ position: { x: width - 5, y: 400 } });
      await expect(panel).toBeHidden();
      await menu.click();
      await close.click();
      await expect(panel).toBeHidden();
    } else {
      await expect(menu).toBeHidden();
      await expect(panel).toBeVisible();
      await panel.getByRole('button', { name: 'Collapse sidebar', exact: true }).click();
      await expect(panel).toHaveCSS('width', '68px');
      await panel.getByRole('button', { name: 'Expand sidebar', exact: true }).click();
      await expect(panel).toHaveCSS('width', '240px');
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
    await page.screenshot({ path: `qa-output/admin-shell-${width}.png` });
  }
  await page.setViewportSize({ width: 820, height: 900 });
  await menu.click();
  await page.setViewportSize({ width: 1280, height: 900 });
  await expect(panel).not.toHaveAttribute('data-open', 'true');
  await expect(page.locator('.admin-drawer-overlay')).toHaveCount(0);
  await expect(page.locator('body')).not.toHaveCSS('overflow', 'hidden');
  await page.setViewportSize({ width: 820, height: 900 });
  await expect(panel).toBeHidden();
  await menu.click();
  await panel.getByRole('link', { name: 'Pages', exact: true }).click();
  await expect(page.locator('.admin-drawer-overlay')).toHaveCount(0);
  await expect(page.locator('body')).not.toHaveCSS('overflow', 'hidden');
  expect(errors).toEqual([]);
  console.log('PASS: 11 widths; focus containment/return; Escape, overlay, close button and link dismissal; desktop collapse; resize cleanup; no overflow or page errors.');
} finally {
  await browser.close();
}
