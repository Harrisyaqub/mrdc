import fs from 'node:fs';import sharp from 'sharp';
const files=fs.readdirSync('public/images/gallery').sort();
const tiles=await Promise.all(files.map(async(file,i)=>({input:await sharp('public/images/gallery/'+file).resize(180,120,{fit:'contain',background:'white'}).extend({bottom:24,background:'white'}).composite([{input:Buffer.from(`<svg width="180" height="24"><text x="5" y="17" font-size="12">${i+1}: ${file}</text></svg>`),top:120,left:0}]).png().toBuffer(),left:i%5*180,top:Math.floor(i/5)*144})));
await sharp({create:{width:900,height:Math.ceil(files.length/5)*144,channels:3,background:'white'}}).composite(tiles).png().toFile('audit/gallery-sheet.png');
