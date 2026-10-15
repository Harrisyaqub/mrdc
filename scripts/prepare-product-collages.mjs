import fs from 'node:fs';
import crypto from 'node:crypto';
import sharp from 'sharp';
const root='public/images/products/';
const manifest='src/data/ready-made-images.json';
const images=JSON.parse(fs.readFileSync(manifest,'utf8'));
const identifiers=[3,6,9,10,11,14,15,26,28,31,34];
fs.mkdirSync(root+'collages',{recursive:true});
for(const id of identifiers){
 const entry=images[id===34?31:id-1];
 const candidates=[entry.source,...fs.readdirSync(root).filter(name=>/^\d+(\.\d+)?\.jpeg$/.test(name)&&parseInt(name)===id).sort()];
 const hashes=new Set();
 const files=candidates.filter(name=>{const hash=crypto.createHash('sha256').update(fs.readFileSync(root+name)).digest('hex');if(hashes.has(hash))return false;hashes.add(hash);return true;});
 const cols=files.length===4?2:files.length,rows=Math.ceil(files.length/cols);
 const cellW=1600,cellH=1600,gap=40;
 const width=cols*cellW+(cols+1)*gap,height=rows*cellH+(rows+1)*gap;
 const layers=[];
 for(const [index,name]of files.entries())layers.push({input:await sharp(root+name).rotate().resize(cellW,cellH,{fit:'contain',withoutEnlargement:true,background:'#f7f7f7'}).toBuffer(),left:gap+(index%cols)*(cellW+gap),top:gap+Math.floor(index/cols)*(cellH+gap)});
 const local=`/images/products/collages/${id}_collage.jpg`;
 await sharp({create:{width,height,channels:3,background:'#f7f7f7'}}).composite(layers).jpeg({quality:96,chromaSubsampling:'4:4:4'}).toFile('public'+local);
 entry.local=local;entry.width=width;entry.height=height;entry.collageSources=files;
 console.log(id,files.length,entry.caption);
}
fs.writeFileSync(manifest,JSON.stringify(images,null,2)+'\n');
