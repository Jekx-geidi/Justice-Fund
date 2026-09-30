import { chromium } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
const base = process.env.QA_URL || 'http://localhost:3100';
// The site's four pages (SITE_PAGES in src/lib/design/types.ts).
const ROUTES = ['/', '/about', '/insights', '/contact'];
await mkdir('qa-output', { recursive: true });
const browser = await chromium.launch();
const context = await browser.newContext();
const page = await context.newPage();
const failures = [];
const results = [];
page.on('pageerror', error => failures.push(error.message));
for (const width of [320,375,390,430,768,820,1024,1280,1440,1920]) {
  await page.setViewportSize({ width, height: 1000 });
  for (const route of ROUTES) {
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
assert.equal(await page.locator('main form').count(),0,'Contact page must not have a form');
assert.match(await page.locator('main a[href^="mailto:"]').getAttribute('href'),/^mailto:.+@/);
for(const route of ['/team','/cases','/environment']) assert.equal((await page.goto(base+route)).status(),404);
// April (29 Sep): no "Charity · Perth, WA" caption in the header, on any page or in the phone menu.
for (const route of ROUTES) { await page.goto(base+route); assert.doesNotMatch(await page.content(),/CHARITY · PERTH/i,route+' still shows the header caption'); }
// April (29 Sep): a photo on each page. About, Insights and Contact show theirs at the top of the page frame.
for (const [route, words] of [['/about',/planting/i],['/insights',/river/i],['/contact',/Perth/]]) {
  await page.goto(base+route);
  const photo = page.locator('.page-frame .page-photo');
  assert.equal(await photo.count(),1,route+' has its photo');
  assert.match(await photo.getAttribute('alt'),words,route+' photo alt text');
  assert.equal(await photo.evaluate(img => img.complete && img.naturalWidth > 0),true,route+' photo loads');
}
// Logged-out visitors can try Site settings, but only as an on-screen preview: no Publish, no saving.
await page.goto(base+'/?editor');
assert.equal(await page.locator('.ss-launcher').count(),1,'Visitors get the Site settings gear');
assert.equal(await page.locator('#site-settings').getByRole('button',{name:'Publish',exact:true}).count(),0,'Visitors have no Publish button');
assert.equal(await page.locator('#site-settings a.ss-login').count(),0,'"Log in to publish" is replaced by Export design');
// Export design saves an offline copy of the site with the visitor's picks, for Ange to open and approve.
await page.locator('#site-settings summary',{hasText:'Layout'}).click();
await page.locator('#site-settings').getByRole('button',{name:'Split'}).click();
const [download] = await Promise.all([page.waitForEvent('download'), page.getByRole('button',{name:'Export design'}).click()]);
assert.match(download.suggestedFilename(),/^iejf-design-\d{4}-\d{2}-\d{2}\.html$/);
const offlinePath = new URL('../qa-output/offline-export.html', import.meta.url);
await download.saveAs(fileURLToPath(offlinePath));
const offline = await readFile(offlinePath,'utf8');
assert.doesNotMatch(offline,/(src|href)="\/(?!\/)|url\("?\/_next/,'The offline file must not load anything from the site');
const data = JSON.parse(offline.match(/<script type="application\/json" id="iejf-design">([\s\S]*?)<\/script>/)[1]);
assert.equal(data.kind,'iejf-site-design');
assert.equal(data.design.homeLayout,'split','The embedded choices are the ones she made');
// Open it straight from disk with every network request blocked, like an email attachment on a plane.
const offlinePage = await context.newPage();
const requested = [];
await offlinePage.route(/^https?:/, route => { requested.push(route.request().url()); return route.abort(); });
await offlinePage.goto(offlinePath.href);
await offlinePage.evaluate(() => document.fonts.ready);
assert.equal(await offlinePage.locator('.site-shell').getAttribute('data-home-layout'),'split');
assert.equal(await offlinePage.locator('#home h1').isVisible(),true,'Home shows first');
assert.equal(await offlinePage.evaluate(() => document.fonts.check('700 40px Poppins')),true,'Poppins is embedded');
// A photo background is embedded; plain white has none. Either way nothing loads from the web.
assert.match(await offlinePage.evaluate(() => getComputedStyle(document.body).backgroundImage),/^(none|url\("data:image\/)/,'The background is embedded or plain');
for (const [label,id] of [['About','about'],['Insights','insights'],['Contact','contact'],['Home','home']]) {
  await offlinePage.getByRole('navigation',{name:'Main navigation'}).getByRole('link',{name:label,exact:true}).click();
  assert.equal(await offlinePage.locator('#'+id).isVisible(),true,label+' opens inside the file');
  assert.equal(await offlinePage.locator('.offline-page:visible').count(),1,'One page at a time');
  await offlinePage.mouse.move(5,700);
  await offlinePage.waitForTimeout(350); // underline transition
  const underlined = await offlinePage.locator('.desktop-nav a').evaluateAll(links => links.filter(a => getComputedStyle(a,'::after').transform === 'matrix(1, 0, 0, 1, 0, 0)').map(a => a.getAttribute('href')));
  assert.deepEqual(underlined,['#'+id],'The menu underlines the open page');
}
assert.deepEqual(requested,[],'Nothing is fetched from the internet');
await offlinePage.close();
assert.equal(await page.locator('.brand-chooser').count(),0);
// Site settings only shows controls that visibly change the page you're on: one pick in every group,
// and a keystroke in every field, must change the page (screenshotted with the panel hidden).
await page.setViewportSize({width:1280,height:900});
const pageShot = async () => {
  await page.evaluate(() => document.fonts.ready);
  await page.waitForLoadState('networkidle');
  await page.addStyleTag({content:'#site-settings,.ss-launcher{visibility:hidden!important}'}).then(tag => tag.evaluate(el => el.setAttribute('data-qa-hide','')));
  const shot = await page.screenshot({fullPage:true,animations:'disabled'});
  await page.evaluate(() => document.querySelectorAll('[data-qa-hide]').forEach(el => el.remove()));
  return shot;
};
for (const route of ROUTES) {
  await page.goto(base+route+'?editor');
  const panel = page.locator('#site-settings');
  await panel.locator('details').evaluateAll(sections => sections.forEach(d => { d.open = true; }));
  // Each change's screenshot is the next change's starting point.
  let shot = await pageShot();
  const changed = async () => { const next = await pageShot(); const same = shot.equals(next); shot = next; return !same; };
  const groups = panel.locator('.ss-body :is(.ss-grid,.ss-swatches,.ss-presets)');
  for (let i = 0; i < await groups.count(); i++) {
    const option = groups.nth(i).locator('button[aria-pressed="false"]').first();
    const group = (await groups.nth(i).getAttribute('aria-label')) ?? (await groups.nth(i).evaluate(el => el.previousElementSibling?.textContent ?? el.closest('details').querySelector('summary').textContent));
    const name = `${group}: ${(await option.getAttribute('aria-label')) || (await option.innerText()).trim()}`;
    await option.click();
    if (!(await changed())) failures.push(`${route}: Site settings option "${name}" changes nothing on this page`);
  }
  const fields = panel.locator('.ss-body :is(input:not([type=range]),textarea)');
  for (let i = 0; i < await fields.count(); i++) {
    const field = fields.nth(i);
    const name = (await field.evaluate(el => el.closest('label')?.firstChild?.textContent ?? '')).trim();
    await field.fill((await field.inputValue()) + ' QA');
    if (!(await changed())) failures.push(`${route}: Site settings field "${name}" changes nothing on this page`);
  }
}
await page.emulateMedia({reducedMotion:'reduce'});
await page.goto(base);
assert.equal(await page.locator('.home-box').evaluate(el=>getComputedStyle(el).animationName),'none');
// April's export + Ange's Home (30 Sep): hero with two buttons and the page photo in the first screen, then What We Do and Why.
assert.equal(await page.locator('.home-box').evaluate(el => el.getBoundingClientRect().top < innerHeight),true,'The hero starts in the first screen');
assert.equal(await page.getByRole('link',{name:'Get Involved'}).getAttribute('href'),'/contact');
assert.equal(await page.getByRole('link',{name:'Learn More'}).getAttribute('href'),'/about');
assert.match(await page.locator('.home-photo').getAttribute('alt'),/Earth/,'The Home photo describes itself');
assert.equal(await page.locator('.home-photo').evaluate(img => img.complete && img.naturalWidth > 0),true,'The Home photo loads');
for (const name of ['What We Do','Why Intergenerational Justice Matters']) assert.equal(await page.getByRole('heading',{level:2,name}).count(),1,name);
assert.equal(await page.locator('.home-card').count(),2,'Strategic Litigation and Policy Reform cards');
await writeFile('qa-output/results.json',JSON.stringify({results,failures,checks:['menu focus trap','Escape and focus restoration','scroll lock','menu navigation','contact is email-only','removed routes 404','reduced motion','home hero, buttons, photo and sections']},null,2));
await browser.close();
assert.deepEqual(failures,[]);
console.log(`PASS: ${results.length} route/viewport checks, 12 accessibility audits, menu, email-only contact, reduced motion, Home hero and sections, legacy routes, visitor preview-only Site settings, every Site settings control changes the page it shows on.`);
