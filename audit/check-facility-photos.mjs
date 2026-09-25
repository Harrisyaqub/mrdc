import fs from 'node:fs';
import {chromium} from './tools/node_modules/playwright-core/index.mjs';
const browser=await chromium.launch({channel:'msedge',headless:true});
const page=await browser.newPage();
const errors=[];
page.on('pageerror',e=>errors.push(e.message));
const checks=[];
for(const prefix of ['','/pt']){
 for(const [route,expected]of [
  ['/', ['mrdc-front-view']],
  ['/our-products/', ['orthopaedic-prostheses']],
  ['/patients-we-serve/', ['patient-areas']],
  ['/contact-us/', ['reception']],
  ['/about-us/', ['reception']],
  ['/patient-protocol/', ['reception','consultation-room','casting-room','orthopaedic-workshop']],
 ]){
  const response=await page.goto('http://localhost:4321'+prefix+route);
  await page.evaluate(()=>{localStorage.setItem('mrdc-cookie-preference','declined')});
  await page.reload();
  for(const width of [375,1440]){
   await page.setViewportSize({width,height:900});
   for(const name of expected){const photo=page.locator(`main img[src="/images/facility/${name}.webp"]`).first();await photo.scrollIntoViewIfNeeded();await photo.evaluate(img=>img.decode());checks.push({route:prefix+route,width,name,loaded:await photo.evaluate(i=>i.naturalWidth>0)})}
   if(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth))errors.push('Overflow '+prefix+route+' '+width);
   if(!prefix){await page.screenshot({path:`audit/facility-${route.replaceAll('/','')||'home'}-${width}.png`})}
  }
  if(response.status()!==200)errors.push('HTTP '+response.status());
 }
}
fs.writeFileSync('audit/facility-photo-check.json',JSON.stringify({checks,errors},null,2));
console.log(`${checks.length} image checks; ${checks.filter(c=>!c.loaded).length} image failures; ${errors.length} errors.`);
await browser.close();
