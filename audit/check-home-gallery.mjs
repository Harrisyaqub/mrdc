import {chromium} from './tools/node_modules/playwright-core/index.mjs';
import fs from 'node:fs';
const browser=await chromium.launch({channel:'msedge',headless:true});
const page=await browser.newPage({reducedMotion:'reduce'});const results=[];const errors=[];
page.on('pageerror',e=>errors.push(e.message));
for(const route of ['/','/pt/'])for(const [width,count]of [[1440,4],[768,2],[375,1]]){
 await page.setViewportSize({width,height:900});await page.goto('http://localhost:4322'+route);
 await page.evaluate(()=>{document.querySelector('.cookie-banner').hidden=true});
 const gallery=page.locator('.home-gallery');await gallery.scrollIntoViewIfNeeded();
 if(!await gallery.evaluate(e=>e.previousElementSibling.classList.contains('faq-section')))throw Error('Gallery position');
 if(await gallery.locator('img').count()!==29)throw Error('Missing photos');
 await page.waitForFunction(n=>document.querySelector('.gallery-range').textContent===`1–${n} / 29`,count);
 const next=gallery.locator('[data-gallery-direction="1"]');const prev=gallery.locator('[data-gallery-direction="-1"]');
 let moves=0;
 while(await next.isEnabled()){
  await next.click();await page.waitForTimeout(160);if(++moves>29)throw Error('End unreachable');
 }
 if(!(await gallery.locator('.gallery-range').textContent()).includes('29 / 29'))throw Error('Last photo unreachable');
 await prev.click();await page.waitForTimeout(160);
 if(!await next.isEnabled())throw Error('Previous arrow failed');
 await page.locator('.home-gallery-track').focus();const before=await page.locator('.home-gallery-track').evaluate(e=>e.scrollLeft);await page.keyboard.press('ArrowLeft');await page.waitForTimeout(160);if(await page.locator('.home-gallery-track').evaluate(e=>e.scrollLeft)>=before)throw Error('Keyboard navigation failed');
 for(const img of await gallery.locator('img').all()){await img.evaluate(async e=>{e.loading='eager';await e.decode()})}
 if(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth))throw Error('Page overflow');
 if(route==='/'){await prev.evaluate(button=>{const track=document.querySelector('.home-gallery-track');track.scrollLeft=0});await page.waitForTimeout(160);await gallery.screenshot({path:`audit/gallery-${width}.png`})}
 results.push({route,width,visible:count,photos:29,moves});
}
await browser.close();fs.writeFileSync('audit/home-gallery-check.json',JSON.stringify({results,errors},null,2));console.log(JSON.stringify({results,errors}));

