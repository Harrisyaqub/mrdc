import fs from "node:fs";
import { execFileSync } from "node:child_process";
import sharp from "sharp";
const images = JSON.parse(
  fs.readFileSync("src/data/image-sources.json", "utf8"),
);
for (const [file, group, description] of [
  [
    "2025/10/about-bg-1.webp",
    "about",
    "Prosthetic rehabilitation with a clinician",
  ],
  [
    "2025/11/2e111f5db3ffe153ecf7d1a1a5b7a06ff6b25946.jpg",
    "products",
    "Prosthetics and orthotics source page hero",
  ],
]) {
  const source = "https://mrdc.co.mz/wp-content/uploads/" + file;
  const name = file.split("/").at(-1);
  const original = "audit/originals/" + name;
  execFileSync("curl.exe", ["-f", "-sS", "-L", "-o", original, source]);
  const local = `/images/${group}/${name.replace(/\.[^.]+$/, "")}.webp`;
  await sharp(original)
    .resize({ width: 1600, withoutEnlargement: true })
    .webp({ quality: 82 })
    .toFile("public" + local);
  const meta = await sharp("public" + local).metadata();
  const small = local.replace(".webp", "-640.webp");
  await sharp(original)
    .resize({ width: 640, withoutEnlargement: true })
    .webp({ quality: 78 })
    .toFile("public" + small);
  images.push({
    source,
    description,
    pages: [
      group === "about" ? "en-about-us" : "en-our-products",
      group === "about" ? "pt-about-us" : "pt-our-products",
    ],
    local,
    small,
    width: meta.width,
    height: meta.height,
  });
}
for (const image of images) {
  if (!image.description)
    image.description = decodeURIComponent(image.source.split("/").at(-1))
      .replace(/\.[^.]+$/, "")
      .replace(/-/g, " ");
}
fs.writeFileSync(
  "src/data/image-sources.json",
  JSON.stringify(images, null, 2),
);
