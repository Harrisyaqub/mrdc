import fs from "node:fs";
import { htmlToHast } from "satteri";
import { execFileSync } from "node:child_process";
for (const name of ["en-about-us", "en-our-products"]) {
  const html = fs.readFileSync("audit/" + name + ".html", "utf8");
  const tree = await htmlToHast(html);
  const sheets = [];
  const walk = (n) => {
    if (n.tagName === "link" && n.properties?.rel?.includes("stylesheet"))
      sheets.push(n.properties.href);
    for (const c of n.children || []) walk(c);
  };
  walk(tree);
  let urls = [];
  for (const url of sheets.filter((u) => u.includes("mrdc.co.mz"))) {
    const css = execFileSync("curl.exe", ["-sS", "--max-time", "15", url], {
      encoding: "utf8",
    });
    urls.push(...(css.match(/https?:[^\s"')]+\/uploads\/[^\s"')]+/g) || []));
  }
  console.log(
    name,
    [...new Set(urls)].filter((u) => !u.includes("woff")),
  );
}
