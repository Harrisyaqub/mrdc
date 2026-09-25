import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const folder = 'C:/Users/devmo/Downloads/MRDC Images/MRDC Images';
const photos = [
  ['MRDC front view.jpeg', 'mrdc-front-view', 'MRDC building exterior', ['/', '/pt/']],
  ['Orthopaedic Prostheses.jpeg', 'orthopaedic-prostheses', 'Prosthetic limbs and components at MRDC', ['/our-products/', '/pt/our-products/']],
  ['Orthopaedic Workshop.jpeg', 'orthopaedic-workshop', 'MRDC orthopaedic workshop', ['/patient-protocol/', '/pt/patient-protocol/']],
  ['casting room.jpeg', 'casting-room', 'MRDC casting room', ['/patient-protocol/', '/pt/patient-protocol/']],
  ['consultation room.jpeg', 'consultation-room', 'MRDC consultation room', ['/patient-protocol/', '/pt/patient-protocol/']],
  ['patient areas.jpeg', 'patient-areas', 'MRDC patient corridor and treatment-room entrances', ['/patients-we-serve/', '/pt/patients-we-serve/']],
  ['Recepction.jpeg', 'reception', 'MRDC reception and waiting area', ['/contact-us/', '/pt/contact-us/', '/about-us/', '/pt/about-us/', '/patient-protocol/', '/pt/patient-protocol/']],
];
fs.mkdirSync('public/images/facility', {recursive:true});
const manifest=[];
for (const [filename,slug,description,pages] of photos) {
  const source=path.posix.join(folder,filename);
  const local=`/images/facility/${slug}.webp`;
  const small=`/images/facility/${slug}-640.webp`;
  await sharp(source).rotate().resize({width:1600,withoutEnlargement:true}).webp({quality:85}).toFile('public'+local);
  await sharp(source).rotate().resize({width:640,withoutEnlargement:true}).webp({quality:82}).toFile('public'+small);
  const {width,height}=await sharp('public'+local).metadata();
  manifest.push({source,local,small,width,height,description,pages});
}
fs.writeFileSync('src/data/facility-images.json',JSON.stringify(manifest,null,2)+'\n');
console.log(`Imported ${manifest.length} facility photos with responsive variants.`);
