import fs from "node:fs";
import { chromium } from "../audit/tools/node_modules/playwright-core/index.mjs";
import AxeBuilder from "../audit/tools/node_modules/@axe-core/playwright/dist/index.mjs";
const browser = await chromium.launch({ channel: "msedge", headless: true });
const context = await browser.newContext();
const page = await context.newPage();
const base = "http://127.0.0.1:4322";
const slugs = [
  "",
  "about-us",
  "our-products",
  "patients-we-serve",
  "patient-protocol",
  "contact-us",
  "cookies",
  "privacy-policy",
];
const paths = ["", "pt/"].flatMap((prefix) =>
  slugs.map((s) => "/" + prefix + (s ? s + "/" : "")),
);
const report = {
  routes: [],
  interactions: [],
  errors: [],
  links: [],
  assets: [],
};
page.on("pageerror", (e) => report.errors.push(e.message));
page.on("console", (m) => {
  if (m.type() === "error") report.errors.push(m.text());
});
page.on("requestfailed", (r) =>
  report.errors.push({ url: r.url(), failure: r.failure() }),
);
const check = (test, value) => {
  report.interactions.push({ test, pass: !!value });
  if (!value) console.error("FAIL", test);
};
for (const route of paths) {
  const response = await page.goto(base + route);
  await page.evaluate(() => document.fonts.ready);
  const entry = {
    route,
    status: response.status(),
    widths: [],
    accessibility: [],
  };
  for (const width of [320, 375, 768, 1024, 1280, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    const overflow = await page.evaluate(() => ({
      overflow: document.documentElement.scrollWidth > innerWidth,
      culprits: [...document.querySelectorAll("body *")]
        .filter((e) => {
          const r = e.getBoundingClientRect();
          return (
            r.width &&
            r.right > innerWidth + 1 &&
            !e.closest("dialog:not([open])")
          );
        })
        .slice(0, 5)
        .map((e) => e.tagName + "." + e.className),
    }));
    entry.widths.push({ width, ...overflow });
  }
  const meta = await page.evaluate(() => ({
    h1: document.querySelectorAll("h1").length,
    lang: document.documentElement.lang,
    title: document.title,
    canonical: document.querySelector("[rel=canonical]")?.href,
    description: document.querySelector("[name=description]")?.content,
    externalImages: [...document.images]
      .filter((i) => !i.src.startsWith(location.origin))
      .map((i) => i.src),
  }));
  Object.assign(entry, meta);
  const axe = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  entry.accessibility = axe.violations.map((v) => ({
    id: v.id,
    impact: v.impact,
    nodes: v.nodes.map((n) => n.target),
  }));
  const links = await page
    .locator("a[href]")
    .evaluateAll((as) =>
      as.map((a) => a.getAttribute("href")).filter((h) => h.startsWith("/")),
    );
  report.links.push(...links);
  if (
    [
      "/",
      "/about-us/",
      "/patients-we-serve/",
      "/patient-protocol/",
      "/contact-us/",
    ].includes(route)
  ) {
    await page.evaluate(async () => {
      for (const img of document.images) {
        if (!img.closest("dialog")) {
          img.loading = "eager";
          await img.decode().catch(() => {});
        }
      }
    });
    await page.screenshot({
      path: "audit/" + (route.replaceAll("/", "") || "home") + "-desktop.png",
      fullPage: true,
    });
    await page.setViewportSize({ width: 375, height: 812 });
    await page.screenshot({
      path: "audit/" + (route.replaceAll("/", "") || "home") + "-mobile.png",
      fullPage: true,
    });
  }
  report.routes.push(entry);
  console.log(
    route,
    response.status(),
    "overflow",
    entry.widths.filter((w) => w.overflow).length,
    "axe",
    entry.accessibility.length,
  );
}
for (const lang of ["", "pt/"]) {
  await page.goto(base + "/" + lang);
  await page.setViewportSize({ width: 1440, height: 900 });
  if (await page.locator(".cookie-banner").isHidden())
    await page.locator("[data-cookie-reset]").click();
  await page.locator("[data-consent=declined]").click();
  await page.reload();
  check(
    lang + "cookie decline persists",
    await page.locator(".cookie-banner").isHidden(),
  );
  await page.locator("[data-cookie-reset]").click();
  await page.locator("[data-consent=accepted]").click();
  await page.reload();
  check(
    lang + "cookie accept persists",
    await page.locator(".cookie-banner").isHidden(),
  );
  const toggle = page.locator(".dropdown-toggle").first();
  await toggle.click();
  check(
    lang + "desktop dropdown opens",
    (await toggle.getAttribute("aria-expanded")) === "true",
  );
  await page.keyboard.press("Escape");
  check(
    lang + "dropdown escape restores focus",
    (await toggle.evaluate((e) => e === document.activeElement)) &&
      (await toggle.getAttribute("aria-expanded")) === "false",
  );
  await toggle.click();
  await page.mouse.click(20, 300);
  check(
    lang + "outside click closes dropdown",
    (await toggle.getAttribute("aria-expanded")) === "false",
  );
  for (const width of [320, 375, 768, 1024]) {
    await page.setViewportSize({ width, height: 900 });
    await page.locator(".menu-toggle").click();
    check(
      lang + "mobile menu " + width,
      await page.locator("#main-nav").isVisible(),
    );
    await toggle.click();
    check(
      lang + "mobile accordion " + width,
      await page.locator("#dropdown-2").isVisible(),
    );
    check(
      lang + "menu no overflow " + width,
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    );
    await page.keyboard.press("Escape");
    await page.keyboard.press("Escape");
    check(
      lang + "mobile escape " + width,
      await page.locator("#main-nav").isHidden(),
    );
  }
  await page.setViewportSize({ width: 375, height: 812 });
  const buttons = page.locator("[data-modal]");
  for (let i = 0; i < (await buttons.count()); i++) {
    const button = buttons.nth(i);
    await button.click();
    const modal = page.locator("dialog[open]");
    check(lang + "gallery " + i + " opens", (await modal.count()) === 1);
    check(
      lang + "gallery " + i + " scroll lock",
      await page
        .locator("body")
        .evaluate((e) => e.classList.contains("modal-open")),
    );
    await modal.locator(".modal-close").focus();
    await page.keyboard.press("Shift+Tab");
    check(
      lang + "gallery " + i + " focus trap",
      await modal
        .locator('[data-slide="1"]')
        .evaluate((e) => e === document.activeElement),
    );
    const slideCount = await modal.locator(".slide").count();
    for (let j = 0; j < slideCount; j++) {
      const picture = modal.locator(".slide:not([hidden]) img");
      await picture.evaluate((img) => img.decode());
      check(
        lang + "gallery " + i + " image " + j,
        await picture.evaluate((e) => e.naturalWidth > 0),
      );
      await modal.locator('[data-slide="1"]').click();
    }
    await page.keyboard.press("Escape");
    check(
      lang + "gallery " + i + " Escape/focus",
      (await modal.count()) === 0 &&
        (await button.evaluate((e) => e === document.activeElement)),
    );
  }
  for (let i = 0; i < 7; i++) {
    const q = page.locator(".faq-item button").nth(i);
    await q.click();
    check(
      lang + "FAQ " + i,
      (await q.getAttribute("aria-expanded")) === "true" &&
        (await page.locator("#faq-" + i).isVisible()),
    );
    await q.click();
  }
  const switcher = page.locator(".language");
  await switcher.click();
  check(
    lang + "language switch",
    new URL(page.url()).pathname === (lang ? "/" : "/pt/"),
  );
}
for (const link of [...new Set(report.links)]) {
  const [pathname, hash] = link.split("#");
  const res = await context.request.get(base + pathname);
  if (res.status() !== 200)
    report.errors.push("Link " + link + " " + res.status());
  else if (hash && !(await res.text()).includes(`id="${hash}"`))
    report.errors.push("Missing anchor " + link);
}
for (const image of JSON.parse(
  fs.readFileSync("src/data/image-sources.json", "utf8"),
)) {
  for (const p of [image.local, image.small].filter(Boolean)) {
    const res = await context.request.get(base + p);
    report.assets.push({ path: p, status: res.status() });
    if (res.status() !== 200) report.errors.push("Image " + p);
  }
}
const notFound = await context.request.get(base + "/missing-page/");
check("Unknown route returns 404", notFound.status() === 404);
report.links = [...new Set(report.links)];
fs.writeFileSync("audit/verification.json", JSON.stringify(report, null, 2));
console.log(
  "Checks",
  report.interactions.length,
  "failures",
  report.interactions.filter((x) => !x.pass).length,
  "errors",
  report.errors.length,
);
await context.close();
await browser.close();
