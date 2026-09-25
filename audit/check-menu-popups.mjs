import { chromium } from './tools/node_modules/playwright-core/index.mjs';
import fs from 'node:fs';
const browser=await chromium.launch({channel:'msedge',headless:true});
const page=await browser.newPage();
const errors=[];let checked=0;
page.on('pageerror',e=>errors.push(e.message));
try {
for(const prefix of ['', '/pt'])for(const route of ['/', '/about-us/', '/patients-we-serve/'])for(const width of [375,1440]){
 await page.setViewportSize({width,height:900});
 await page.goto('http://localhost:4321'+prefix+route);
 await page.evaluate(()=>{localStorage.setItem('mrdc-cookie-preference','declined')});await page.reload();
 for(const group of [2,3])for(let i=0;i<8;i++){
  if(width===375)await page.locator('.menu-toggle').click();
  await page.locator(`[aria-controls="dropdown-${group}"]`).click();
  const link=page.locator(`#dropdown-${group} a`).nth(i);
  const target=await link.getAttribute('data-modal');const url=page.url();const y=await page.evaluate(()=>scrollY);
  await link.click();
  if(await page.locator('dialog[open]').getAttribute('id')!==target)throw new Error('Wrong popup');
  if(page.url()!==url||await page.evaluate(()=>scrollY)!==y)throw new Error('Navigation or scroll on '+route);
  await page.keyboard.press('Escape');
  if(await page.locator('dialog[open]').count())throw new Error('Escape failed');
  const focus=width===375?'.menu-toggle':`[aria-controls="dropdown-${group}"]`;
  await page.waitForFunction(selector=>document.querySelector(selector)===document.activeElement,focus);
  checked++;
 }
}
await page.goto('http://localhost:4321/');await page.locator('.card-trigger').first().click();
if(await page.locator('dialog[open]').count()!==1)throw new Error('Card regression');
await page.keyboard.press('Escape');
await page.waitForFunction(()=>document.querySelector('.card-trigger')===document.activeElement);
console.log(`${checked} menu popup checks passed; card opening and focus restoration passed; ${errors.length} browser errors.`);
fs.writeFileSync('audit/menu-popup-check.json',JSON.stringify({checked,errors},null,2));
}finally{await browser.close()}
