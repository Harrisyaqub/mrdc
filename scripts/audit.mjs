import fs from "node:fs";
import { htmlToHast } from "satteri";
export const walk = (n, fn) => {
  fn(n);
  for (const c of n.children || []) walk(c, fn);
};
export const textOf = (n) =>
  n.type === "text" ? n.value : (n.children || []).map(textOf).join("");
export const hasClass = (n, c) =>
  String(n.properties?.className || "")
    .split(/[ ,]+/)
    .includes(c);
fs.mkdirSync("audit/extracted", { recursive: true });
for (const file of fs.readdirSync("audit").filter((f) => f.endsWith(".html"))) {
  const tree = await htmlToHast(fs.readFileSync("audit/" + file, "utf8"));
  const blocks = [],
    images = [],
    popups = [],
    links = [];
  walk(tree, (n) => {
    if (/^h[1-6]$/.test(n.tagName) || n.tagName === "p" || n.tagName === "li") {
      const t = textOf(n).trim();
      if (t) blocks.push({ tag: n.tagName, text: t });
    }
    if (n.tagName === "img") images.push(n.properties);
    if (n.tagName === "a")
      links.push({ text: textOf(n).trim(), href: n.properties.href });
    if (n.properties?.dataElementorType === "popup") popups.push(n);
  });
  fs.writeFileSync(
    "audit/extracted/" + file.replace(".html", ".json"),
    JSON.stringify({ blocks, images, links, popups }, null, 2),
  );
  fs.writeFileSync(
    "audit/extracted/" + file.replace(".html", ".txt"),
    blocks.map((b) => b.tag + ": " + b.text).join("\n"),
  );
}
