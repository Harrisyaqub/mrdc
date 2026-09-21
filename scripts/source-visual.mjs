import { chromium } from "../audit/tools/node_modules/playwright-core/index.mjs";
import fs from "node:fs";
const browser = await chromium.launch({ channel: "msedge", headless: true });
const context = await browser.newContext({
  viewport: { width: 1440, height: 1000 },
});
const page = await context.newPage();
const info = [];
for (const route of [
  "",
  "about-us/",
  "our-products/",
  "patients-we-serve/",
  "patient-protocol/",
  "contact-us/",
]) {
  await page.goto("https://mrdc.co.mz/" + route, {
    waitUntil: "domcontentloaded",
  });
  await page.locator("h1").first().waitFor();
  await page.screenshot({
    path: "audit/source-" + (route.replace("/", "") || "home") + ".png",
    fullPage: true,
  });
  info.push({
    route,
    ...(await page.evaluate(() => ({
      faq: [...document.querySelectorAll(".ekit-accordion--toggler")].map(
        (e) => ({
          text: e.textContent,
          color: getComputedStyle(e).color,
          bg: getComputedStyle(e).backgroundColor,
        }),
      ),
      backgrounds: [
        ...new Set(
          [...document.querySelectorAll("*")]
            .map((e) => getComputedStyle(e).backgroundImage)
            .filter((v) => v.includes("url(")),
        ),
      ],
      maps: [...document.querySelectorAll("iframe")].map((e) => e.src),
    }))),
  });
  console.log("Inspected source", route || "/");
}
fs.writeFileSync("audit/source-design.json", JSON.stringify(info, null, 2));
await context.close();
await browser.close();
