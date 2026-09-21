import data from "./content.json";
import images from "./image-sources.json";
export const content = data;
export const asset = (name: string) =>
  images.find(
    (i) =>
      i.source === name || decodeURIComponent(i.source).endsWith("/" + name),
  );
export const section = (lang: "en" | "pt", index: number) =>
  data[lang].home[index];
