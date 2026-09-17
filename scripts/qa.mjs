import { chromium } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { mkdir, writeFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
const base = process.env.QA_URL || 'http://localhost:3100';
await mkdir('qa-output', { recursive: true });
const browser = await chromium.launch();
const context = await browser.newContext();
const page = await context.newPage();
const failures = [];
const results = [];
page.on('pageerror', error => failures.push(error.message));
for (const width of [320,375,390,430,768,820,1024,1280,1440,1920]) {
  await page.setViewportSize({ width, height: 1000 });
  for (const route of ['/', '/about', '/insights', '/contact']) {
    const response = await page.goto(base + route);
    assert.equal(response.status(), 200);
    await page.evaluate(() => document.fonts.ready);
    await page.locator('img').evaluateAll(images => Promise.all(images.map(img => img.decode())));
    assert.equal(await page.locator('h1').count(), 1);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth);
    assert.equal(overflow, false, `${route} overflows at ${width}`);
    await page.screenshot({ path:`qa-output/${route === '/' ? 'home' : route.slice(1)}-${width}.png`, fullPage:true });
    if ([390,820,1440].includes(width)) {
      const accessibility = await new AxeBuilder({ page }).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
      failures.push(...accessibility.violations.map(v => `${route} ${width}: ${v.id} ${v.nodes.map(n => n.target.join(' ')).join(', ')}`));
    }
    results.push({route,width,overflow});
  }
}
await page.setViewportSize({width:390,height:844});
await page.goto(base);
await page.getByRole('button',{name:'Open navigation'}).click();
assert.equal(await page.evaluate(() => document.body.style.overflow), 'hidden');
assert.equal(await page.getByRole('dialog').isVisible(), true);
for (let i=0;i<8;i++) {
  await page.keyboard.press('Tab');
  assert.equal(await page.evaluate(() => !!document.activeElement.closest('dialog')),true,'Menu focus escaped');
}
await page.keyboard.press('Escape');
assert.equal(await page.getByRole('button',{name:'Open navigation'}).evaluate(el => el === document.activeElement),true);
assert.notEqual(await page.evaluate(() => document.body.style.overflow),'hidden');
await page.getByRole('button',{name:'Open navigation'}).click();
await page.getByRole('navigation',{name:'Mobile navigation'}).getByRole('link',{name:'Contact'}).click();
await page.waitForURL('**/contact');
assert.equal(await page.getByRole('dialog').isVisible(),false);
await page.getByRole('button',{name:'Send message'}).click();
assert.equal(await page.locator('#name').evaluate(el => el.validity.valueMissing),true);
await page.getByLabel('Name',{exact:true}).fill('Preview user');
await page.getByLabel('Email',{exact:true}).fill('preview@example.com');
await page.getByLabel('Message',{exact:true}).fill('Testing this UI-only preview.');
await page.getByRole('button',{name:'Send message'}).click();
assert.match(await page.getByRole('status').innerText(),/has not been sent/);
for(const route of ['/team','/cases','/environment']) assert.equal((await page.goto(base+route)).status(),404);
await page.emulateMedia({reducedMotion:'reduce'});
await page.goto(base);
assert.equal(await page.locator('.focus-card').first().evaluate(el=>getComputedStyle(el).transitionDuration),'0s');
await writeFile('qa-output/results.json',JSON.stringify({results,failures,checks:['menu focus trap','Escape and focus restoration','scroll lock','menu navigation','required fields','UI-only submission','removed routes 404','reduced motion']},null,2));
await browser.close();
assert.deepEqual(failures,[]);
console.log(`PASS: ${results.length} route/viewport checks, 12 accessibility audits, menu, form, reduced motion, legacy routes.`);
