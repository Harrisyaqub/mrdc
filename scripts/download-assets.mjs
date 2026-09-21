import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import sharp from "sharp";
const assets = JSON.parse(fs.readFileSync("audit/assets.json", "utf8"));
const extras = [
  "2025/10/Logo.png",
  "2025/12/MRDC_1920x1080.jpg",
  "2025/12/1920x1080_1.-Lower-Limb-Prosthesis.jpg",
  "2025/12/1920x1080_8.-Special-Shoes.jpg",
  "2025/10/prosthetic-leg-walking-away.png",
  "2025/10/bg.png",
  "2025/10/about-bg.jpg",
  "2025/10/gty_220926_senior_rehabilitation_800x450.webp",
  "2025/10/handsome-young-man-sitting-on-the-medical-bed-2024-10-16-23-23-08-utc-scaled.jpg",
  "2025/12/register2.webp",
  "2025/10/who-we-serve.webp",
  "2025/10/ornament-curly-1.png",
  "2025/11/image1.png",
  "2025/11/header_contact.jpg",
];
for (const p of extras) {
  let source = "https://mrdc.co.mz/wp-content/uploads/" + p;
  if (!assets.some((a) => a.source === source))
    assets.push({ source, description: path.basename(p), pages: ["shared"] });
}
fs.mkdirSync("audit/originals", { recursive: true });
const results = [];
for (const [i, a] of assets.entries()) {
  const name = decodeURIComponent(path.basename(new URL(a.source).pathname));
  const group = /Logo/.test(name)
    ? "brand"
    : /header_contact/.test(name)
      ? "contact"
      : /about|who-we|rehabilitation|handsome/.test(name)
        ? "about"
        : /register|image1\.png/.test(name)
          ? "protocol"
          : /MRDC|prosthetic-leg|bg\.|1920/.test(name)
            ? "home"
            : a.pages.some((p) => p.includes("home"))
              ? "products"
              : "patients";
  const original = "audit/originals/" + name;
  try {
    if (!fs.existsSync(original))
      execFileSync("curl.exe", [
        "-f",
        "-sS",
        "-L",
        "--retry",
        "2",
        "--max-time",
        "40",
        "-o",
        original,
        a.source,
      ]);
    const meta = await sharp(original).metadata();
    const width = Math.min(
      meta.width,
      /MRDC|header_contact|about-bg/.test(name) ? 1600 : 1000,
    );
    const basename = name
      .replace(/\.[^.]+$/, "")
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, "-");
    const local = `/images/${group}/${basename}.webp`;
    fs.mkdirSync("public/images/" + group, { recursive: true });
    await sharp(original)
      .rotate()
      .resize({ width, withoutEnlargement: true })
      .webp({ quality: 82 })
      .toFile("public" + local);
    const out = await sharp("public" + local).metadata();
    let small;
    if (width > 640) {
      small = local.replace(".webp", "-640.webp");
      await sharp(original)
        .rotate()
        .resize({ width: 640, withoutEnlargement: true })
        .webp({ quality: 78 })
        .toFile("public" + small);
    }
    results.push({ ...a, local, small, width: out.width, height: out.height });
    if (i % 20 === 0) console.log("Downloaded", i + 1, "/", assets.length);
  } catch (e) {
    console.error("FAILED", a.source, e.message);
  }
}
fs.writeFileSync(
  "src/data/image-sources.json",
  JSON.stringify(results, null, 2),
);
fs.writeFileSync(
  "src/data/image-sources.ts",
  "import images from './image-sources.json';\nexport default images;\n",
);
console.log("Migrated", results.length, "of", assets.length);
