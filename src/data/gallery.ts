import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

// Discover the actual folder at build time so added photos are never omitted.
export async function getGallery(lang: 'en' | 'pt') {
  const folder = path.join(process.cwd(), 'public/images/gallery');
  const optimized: {file:string;local:string;width:number;height:number}[] = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'src/data/gallery-images.json'), 'utf8'));
  const files = fs.readdirSync(folder).filter(f => /\.(jpe?g|png|webp|avif)$/i.test(f)).sort((a,b) => a.localeCompare(b));
  return Promise.all(files.map(async (file) => {
    const source = path.join(folder, file);
    const cached = optimized.find(image => image.file === file);
    const cachePath = cached && path.join(process.cwd(), 'public', cached.local);
    const useCache = cachePath && fs.existsSync(cachePath) && fs.statSync(cachePath).mtimeMs >= fs.statSync(source).mtimeMs;
    const metadata = useCache ? cached! : await sharp(source).metadata();
    let label = lang === 'pt' ? 'Instalações do MRDC' : 'MRDC facilities';
    const groups: [RegExp, string, string][] = [
      [/casting/i, 'MRDC casting room', 'Sala de moldagem do MRDC'],
      [/consultation|IMG_236[257]/i, 'MRDC consultation room', 'Sala de consulta do MRDC'],
      [/IMG_235[368]/i, 'MRDC rehabilitation area with parallel bars', 'Área de reabilitação do MRDC com barras paralelas'],
      [/IMG_2387/i, 'Prosthetic limbs and components at MRDC', 'Próteses e componentes no MRDC'],
      [/IMG_23[89]|IMG_240/i, 'MRDC orthopaedic workshop and equipment', 'Oficina ortopédica e equipamentos do MRDC'],
      [/patient/i, 'MRDC patient corridor', 'Corredor de pacientes do MRDC'],
      [/recep/i, 'MRDC reception and waiting area', 'Recepção e área de espera do MRDC'],
      [/front view/i, 'Front view of the MRDC building', 'Vista frontal do edifício MRDC'],
    ];
    const match = groups.find(([pattern]) => pattern.test(file));
    if (match) label = match[lang === 'pt' ? 2 : 1];
    return {src: useCache ? cached!.local : `/images/gallery/${encodeURIComponent(file)}`, width: metadata.width, height: metadata.height, alt: label};
  }));
}
