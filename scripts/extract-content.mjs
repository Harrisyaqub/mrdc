import fs from "node:fs";
import { htmlToHast } from "satteri";
const walk = (n, fn) => {
  fn(n);
  for (const c of n.children || []) walk(c, fn);
};
const text = (n) =>
  n.type === "text"
    ? n.value
    : (n.children || []).map(text).join(n.tagName === "br" ? "\n" : "");
const clean = (n) => text(n).replace(/\s+/g, " ").trim();
const cls = (n, c) => (n.properties?.className || []).includes(c);
const find = (n, fn) => {
  let a = [];
  walk(n, (c) => {
    if (fn(c)) a.push(c);
  });
  return a;
};
const img = (n) => ({
  url: (n.properties.dataSrc || n.properties.src || "").replace(
    /^http:/,
    "https:",
  ),
  alt: n.properties.alt || "",
});
const blocks = (n) => {
  const result = [];
  function visit(c) {
    if (["script", "style", "noscript"].includes(c.tagName)) return;
    if (/^h[1-6]$/.test(c.tagName) || ["p", "ul", "ol"].includes(c.tagName)) {
      const value = clean(c);
      if (value && !/Lorem ipsum/i.test(value))
        result.push({
          tag: c.tagName,
          text: value,
          ...(["ul", "ol"].includes(c.tagName)
            ? {
                items: find(c, (k) => k.tagName === "li")
                  .map(clean)
                  .filter((s) => !/Lorem ipsum/.test(s)),
              }
            : {}),
        });
      return;
    }
    if (
      cls(c, "elementor-widget-text-editor") &&
      !find(c, (k) => ["p", "ul", "ol"].includes(k.tagName)).length
    ) {
      if (clean(c)) result.push({ tag: "p", text: clean(c) });
      return;
    }
    for (const k of c.children || []) visit(k);
  }
  visit(n);
  return result;
};
const all = {};
const assets = new Map();
for (const file of fs.readdirSync("audit").filter((f) => f.endsWith(".html"))) {
  const tree = await htmlToHast(fs.readFileSync("audit/" + file, "utf8"));
  const main =
    find(tree, (n) => n.properties?.dataElementorType === "wp-page")[0] ||
    find(tree, (n) => n.tagName === "main")[0];
  const popups = find(
    tree,
    (n) => n.properties?.dataElementorType === "popup",
  ).map((n) => ({
    id: n.properties.dataElementorId,
    title: clean(find(n, (c) => c.tagName === "h2")[0] || { children: [] }),
    selector: JSON.parse(n.properties.dataElementorSettings || "{}")
      .open_selector,
    blocks: blocks(n).filter((b) => b.tag !== "h2"),
    slides: find(n, (c) => c.tagName === "figure").map((f) => ({
      ...img(find(f, (c) => c.tagName === "img")[0]),
      caption: clean(
        find(f, (c) => c.tagName === "figcaption")[0] || { children: [] },
      ),
    })),
  }));
  const faqs = find(main || tree, (n) => cls(n, "elementskit-card")).map(
    (n) => ({
      question: clean(
        find(n, (c) => cls(c, "ekit-accordion-title"))[0] || { children: [] },
      ),
      answer: blocks(n)
        .filter((b) => b.tag === "p")
        .map((b) => b.text)
        .join("\n"),
    }),
  );
  const content = {
    blocks: main ? blocks(main) : [],
    images: main ? find(main, (n) => n.tagName === "img").map(img) : [],
    popups,
    faqs,
  };
  all[file.replace(".html", "")] = content;
  for (const i of [...content.images, ...popups.flatMap((p) => p.slides)]) {
    if (i.url.includes("/uploads/")) {
      let a = assets.get(i.url) || {
        source: i.url,
        description: i.alt,
        pages: [],
      };
      a.pages = [...new Set([...a.pages, file.replace(".html", "")])];
      assets.set(i.url, a);
    }
  }
}
fs.mkdirSync("src/data", { recursive: true });
fs.writeFileSync("audit/content.json", JSON.stringify(all, null, 2));
fs.writeFileSync(
  "audit/assets.json",
  JSON.stringify([...assets.values()], null, 2),
);
for (const [key, value] of Object.entries(all))
  fs.writeFileSync(
    "audit/extracted/" + key + "-main.txt",
    value.blocks.map((b) => b.tag + ": " + b.text).join("\n"),
  );
console.log(
  "Extracted",
  Object.keys(all).length,
  "pages;",
  assets.size,
  "unique content images",
);
