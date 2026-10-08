import { chromium } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
const base = process.env.QA_URL || 'http://localhost:3100';
// The site's live pages (LIVE_PAGES in src/lib/design/types.ts); April hid About and Insights on 6 Oct.
const ROUTES = ['/', '/contact'];
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
// Phone header (Reil, 30 Sep): in either header style the burger sits on the name's line at the right, not under it.
for (const style of ['Name left, menu right','Everything centred']) {
  await page.goto(base+'/?editor');
  await page.locator('#site-settings summary',{hasText:/^Header$/}).click();
  await page.locator('#site-settings').getByRole('button',{name:style}).click();
  await page.getByRole('button',{name:'Close site settings'}).click();
  const brand = await page.locator('.site-header .brand').first().boundingBox();
  const burger = await page.getByRole('button',{name:'Open navigation'}).boundingBox();
  assert.ok(Math.abs((burger.y + burger.height / 2) - (brand.y + brand.height / 2)) < 12, style+': burger on the name line');
  assert.ok(burger.x + burger.width > 390 - 40, style+': burger at the right edge');
  assert.ok(brand.x + brand.width <= burger.x, style+': name does not run under the burger');
}
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
await page.locator('.site-header .brand').click();
await page.waitForURL(base + '/');
await page.getByRole('button',{name:'Open navigation'}).click();
await page.getByRole('dialog').getByRole('link',{name:'Intergenerational Justice Fund Limited'}).click();
await page.waitForURL(base + '/');
assert.equal(await page.getByRole('dialog').isVisible(),false);
await page.goto(base + '/contact');
assert.equal(await page.locator('main form').count(),0,'Contact page must not have a form');
assert.match(await page.locator('main a[href^="mailto:"]').getAttribute('href'),/^mailto:.+@/);
for(const route of ['/team','/cases','/environment']) assert.equal((await page.goto(base+route)).status(),404);
// April (6 Oct): About and Insights are hidden: out of the menu, and their addresses go to Home.
for (const route of ['/about','/insights']) { await page.goto(base+route); assert.equal(new URL(page.url()).pathname,'/',route+' redirects to Home'); }
assert.deepEqual(await page.locator('.desktop-nav a').allInnerTexts(),['Home','Contact'],'Only Home and Contact in the menu');
// April (29 Sep): no "Charity · Perth, WA" caption in the header, on any page or in the phone menu.
for (const route of ROUTES) { await page.goto(base+route); assert.doesNotMatch(await page.content(),/CHARITY · PERTH/i,route+' still shows the header caption'); }
// April (29 Sep): Contact shows its photo at the top of the page frame (6 Oct: with no title box above it).
// Any of the page's five photos may be chosen (Site settings), so check it describes itself rather than which one it is.
for (const route of ['/contact']) {
  await page.goto(base+route);
  const photo = page.locator('.page-frame .page-photo');
  assert.equal(await photo.count(),1,route+' has its photo');
  assert.ok((await photo.getAttribute('alt')).length > 10,route+' photo alt text');
  assert.equal(await photo.evaluate(img => img.complete && img.naturalWidth > 0),true,route+' photo loads');
  assert.equal(await page.locator('.page-frame-head').count(),0,route+' has no title box');
  assert.ok((await page.locator('main h1').boundingBox()).width <= 1,route+' keeps its heading for screen readers only');
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
// Whichever heading font the design uses (the published look can change) must be embedded and load offline.
assert.equal(await offlinePage.evaluate(font => document.fonts.check(`700 40px "${font}"`), data.design.headingFont),true,`${data.design.headingFont} is embedded`);
// A photo background is embedded; plain white has none. Either way nothing loads from the web.
assert.match(await offlinePage.evaluate(() => getComputedStyle(document.body).backgroundImage),/^(none|url\("data:image\/)/,'The background is embedded or plain');
for (const [label,id] of [['Contact','contact'],['Home','home']]) {
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
// Page photos (Reil, 30 Sep): drag to reposition, zoom in or out, change the opacity, and reset.
await page.setViewportSize({width:1280,height:900});
await page.goto(base+'/contact?editor');
const photoPanel = page.locator('#site-settings');
const contactPhoto = page.locator('img[data-page-photo="contact"]');
const photoStyle = () => contactPhoto.evaluate(img => { const s = getComputedStyle(img); return { position: s.objectPosition, transform: s.transform, opacity: s.opacity }; });
const before = await photoStyle();
await photoPanel.getByRole('group',{name:'Zoom size'}).getByRole('button',{name:'Close',exact:true}).click();
assert.equal((await photoStyle()).transform,'matrix(1.6, 0, 0, 1.6, 0, 0)','Zoom scales the photo');
await photoPanel.getByRole('group',{name:'Opacity size'}).getByRole('button',{name:'Soft'}).click();
assert.equal((await photoStyle()).opacity,'0.6','Opacity fades the photo');
const box = await contactPhoto.boundingBox();
await page.mouse.move(box.x + box.width * 0.75, box.y + box.height / 2);
await page.mouse.down();
await page.mouse.move(box.x + box.width * 0.35, box.y + box.height / 2, { steps: 6 });
await page.mouse.up();
assert.notEqual((await photoStyle()).position, before.position, 'Dragging the photo moves it');
await photoPanel.getByRole('button',{name:'Reset photo'}).click();
assert.deepEqual(await photoStyle(), before, 'Reset photo puts it back');
// Picking a photo reminds her it can be dragged (Reil, 30 Sep).
await photoPanel.locator('.ss-thumb[aria-pressed="false"]').first().click();
assert.match(await page.locator('.ss-toast').innerText(),/drag the photo/i,'Picking a photo shows the drag tip');
// Focus mode (Reil, 30 Sep): touching a control highlights what it changes; switched off, nothing is highlighted.
await page.setViewportSize({width:1280,height:900});
await page.goto(base+'/?editor');
await page.locator('#site-settings summary',{hasText:'Colour'}).click();
const boxSwatch = page.locator('#site-settings .ss-label',{hasText:'Homepage boxes'}).locator('xpath=following-sibling::div[1]').getByRole('button').nth(1);
await boxSwatch.click();
assert.equal(await page.locator('.focus-card.ss-focus').count(),3,'Focus mode highlights the focus cards on Home');
await page.getByLabel(/Focus mode/).uncheck();
assert.equal(await page.locator('.ss-focus').count(),0,'Turning Focus mode off clears the highlight');
await boxSwatch.click();
assert.equal(await page.locator('.ss-focus').count(),0,'Focus mode off: nothing is highlighted');
await page.getByLabel(/Focus mode/).check();
// Site settings only shows controls that visibly change the page you're on: one pick in every group,
// and a keystroke in every field, must change the page (screenshotted with the panel hidden).
await page.setViewportSize({width:1280,height:900});
const pageShot = async () => {
  await page.evaluate(() => document.fonts.ready);
  await page.waitForLoadState('networkidle');
  // Always hover the same menu link, so the hover colour shows up and every shot is taken the same way.
  await page.locator('.desktop-nav a').last().hover();
  await page.addStyleTag({content:'#site-settings,.ss-launcher,.ss-toast{visibility:hidden!important} .ss-focus{outline:none!important;box-shadow:none!important}'}).then(tag => tag.evaluate(el => el.setAttribute('data-qa-hide','')));
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
  // Text inputs only: switches (like Sticky header) have no text, and stickiness only shows while scrolling.
  const fields = panel.locator('.ss-body :is(input:not([type=range]):not([type=checkbox]),textarea)');
  for (let i = 0; i < await fields.count(); i++) {
    const field = fields.nth(i);
    const name = (await field.evaluate(el => el.closest('label')?.firstChild?.textContent ?? '')).trim();
    await field.fill((await field.inputValue()) + ' QA');
    if (!(await changed())) failures.push(`${route}: Site settings field "${name}" changes nothing on this page`);
  }
}
// April (1 Oct): each colour theme recolours the site in one click; changing a colour by hand makes it custom.
{
  await page.goto(base+'/?editor');
  const panel = page.locator('#site-settings');
  await panel.locator('details').evaluateAll(sections => sections.forEach(d => { d.open = true; }));
  const themes = panel.locator('.ss-theme');
  assert.equal(await themes.count(), 6, 'Six colour themes');
  const looks = new Set();
  for (let i = 0; i < 6; i++) {
    await themes.nth(i).click();
    assert.equal(await themes.nth(i).getAttribute('aria-pressed'), 'true', `${await themes.nth(i).innerText()} shows as picked`);
    looks.add(await page.evaluate(() => ['--header-bg','--footer-bg','--button-bg','--page-box'].map(v => getComputedStyle(document.querySelector('.home-sections')).getPropertyValue(v)).join()));
  }
  assert.equal(looks.size, 6, 'Every theme gives the page a different look');
  await panel.locator('.ss-label', { hasText: 'Footer (all pages)' }).locator('+ .ss-swatches button[aria-pressed="false"]').first().click();
  assert.equal(await panel.locator('.ss-theme[aria-pressed="true"]').count(), 0, 'A hand-picked colour leaves no theme picked');
  await panel.getByText('Custom colours. Pick a theme to start again.').waitFor();
}
await page.emulateMedia({reducedMotion:'reduce'});
await page.goto(base);
assert.equal(await page.locator('.home-box').evaluate(el=>getComputedStyle(el).animationName),'none');
// April (6 Oct): the heading on the Home green with no photo or buttons, then the About text and three focus areas.
assert.equal(await page.locator('.home-box').evaluate(el => el.getBoundingClientRect().top < innerHeight),true,'The heading starts in the first screen');
assert.equal(await page.locator('main img').count(),0,'No Home photo');
for (const name of ['Get Involved','Learn More']) assert.equal(await page.getByRole('link',{name}).count(),0,'No '+name+' button');
// The heading box is the same green (85% over the stage), so the stage and the box read as one colour.
const homeStage = await page.locator('.home-stage').evaluate(el => [el, el.querySelector('.home-box')].map(e => { const c = document.createElement('canvas').getContext('2d'); c.fillStyle = getComputedStyle(e).backgroundColor; c.fillRect(0,0,1,1); return [...c.getImageData(0,0,1,1).data].slice(0,3).join(); }));
assert.equal(homeStage[0], homeStage[1], 'The Home green fills where the photo was');
for (const name of ['What We Do','Why Intergenerational Justice Matters']) assert.equal(await page.getByRole('heading',{name}).count(),0,name+' is gone');
assert.equal(await page.getByRole('heading',{level:2,name:'Our work is anchored in three complementary focus areas'}).count(),1,'The About heading is on Home');
assert.deepEqual(await page.locator('.home-sections .focus-card h3').allInnerTexts(),['Environment','Health','Human Rights'],'The three focus areas');
await writeFile('qa-output/results.json',JSON.stringify({results,failures,checks:['menu focus trap','Escape and focus restoration','scroll lock','menu navigation','contact is email-only','removed routes 404','reduced motion','home heading and focus areas, no photo or buttons','about and insights hidden','contact without title box']},null,2));
await browser.close();
assert.deepEqual(failures,[]);
console.log(`PASS: ${results.length} route/viewport checks, 6 accessibility audits, menu, email-only contact, reduced motion, Home heading and focus areas, About and Insights hidden, Contact without title box, legacy routes, visitor preview-only Site settings, every Site settings control changes the page it shows on, Focus mode, photo drag/zoom/opacity, colour themes.`);
