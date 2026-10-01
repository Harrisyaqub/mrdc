import fs from 'node:fs';
import sharp from 'sharp';
import {createHash} from 'node:crypto';
const folder='public/images/gallery';
fs.mkdirSync('public/images/gallery-optimized',{recursive:true});
const photos=[];
for(const file of fs.readdirSync(folder).filter(f=>/\.(jpe?g|png|webp|avif)$/i.test(f)).sort((a,b)=>a.localeCompare(b))){
 const name=createHash('sha256').update(file).digest('hex').slice(0,12);
 const local=`/images/gallery-optimized/${name}.webp`;
 await sharp(`${folder}/${file}`).rotate().resize({width:800,withoutEnlargement:true}).webp({quality:82}).toFile('public'+local);
 const {width,height}=await sharp('public'+local).metadata();
 photos.push({file,local,width,height});
}
fs.writeFileSync('src/data/gallery-images.json',JSON.stringify(photos,null,2)+'\n');
console.log(`Optimized ${photos.length} gallery images.`);
