import sourceData from "./content.json";
import images from "./image-sources.json";
import facilityImages from "./facility-images.json";
import readyMadeImages from "./ready-made-images.json";
// Avoid mutating the cached JSON module when development reloads this file.
const data = structuredClone(sourceData);
// Keep client-supplied photos separate from regeneratable WordPress source data.
const protocolPhotos = {
  registration: "Recepction.jpeg",
  consultation: "consultation room.jpeg",
  casting: "casting room.jpeg",
  fabrication: "Orthopaedic Workshop.jpeg",
};
for (const lang of ["en", "pt"] as const) {
  const readyMade = data[lang].products.find((item) => item.slug === "ready-made-items");
  if (readyMade) readyMade.slides = readyMadeImages.map((image) => ({
    url: image.source,
    alt: image.caption,
    caption: image.caption,
  }));
  for (const step of data[lang].protocol) {
    const photo = protocolPhotos[step.id as keyof typeof protocolPhotos];
    if (photo) step.image = { url: photo, alt: step.title };
  }
}
export const content = data;
export const asset = (name: string) =>
  [...readyMadeImages, ...facilityImages, ...images].find(
    (i) =>
      i.source === name || decodeURIComponent(i.source).endsWith("/" + name),
  );
export const section = (lang: "en" | "pt", index: number) =>
  data[lang].home[index];
