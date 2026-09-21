import lighthouse from "../audit/tools/node_modules/lighthouse/core/index.js";
import { launch } from "../audit/tools/node_modules/chrome-launcher/dist/index.js";
import fs from "node:fs";
const chrome = await launch({
  chromePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  chromeFlags: ["--headless", "--no-sandbox"],
});
try {
  for (const [name, path] of [
    ["home", "/"],
    ["products", "/our-products/"],
    ["portuguese", "/pt/"],
  ]) {
    const r = await lighthouse("http://127.0.0.1:4322" + path, {
      port: chrome.port,
      output: "json",
      logLevel: "error",
      onlyCategories: ["performance", "accessibility", "best-practices", "seo"],
    });
    fs.writeFileSync("audit/lighthouse-" + name + ".json", r.report);
    console.log(
      name,
      Object.fromEntries(
        Object.entries(r.lhr.categories).map(([k, v]) => [
          k,
          Math.round(v.score * 100),
        ]),
      ),
    );
  }
} finally {
  await chrome.kill();
}
