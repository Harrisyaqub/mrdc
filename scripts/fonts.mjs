import fs from "node:fs";
import { execFileSync } from "node:child_process";
fs.mkdirSync("public/fonts", { recursive: true });
const source =
  "https://fonts.googleapis.com/css2?family=DM+Sans:wght@400..700&family=Darker+Grotesque:wght@500..700&family=Roboto:wght@700&display=swap";
const response = execFileSync(
  "curl.exe",
  [
    "-sS",
    "-L",
    "-A",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
    source,
  ],
  { encoding: "utf8" },
);
const css = [
  ...response.matchAll(/\/\* latin \*\/\s*(@font-face\s*\{[^}]+\})/g),
]
  .map((m) => m[1])
  .join("\n");
if (!css) throw new Error("No Latin font subsets returned");
let output = css;
let n = 0;
for (const url of new Set(css.match(/https:\/\/[^)]+/g) || [])) {
  const name = "font-" + n++ + "." + (url.includes(".woff2") ? "woff2" : "ttf");
  execFileSync("curl.exe", [
    "-f",
    "-sS",
    "-L",
    "-o",
    "public/fonts/" + name,
    url,
  ]);
  output = output.split(url).join("/fonts/" + name);
}
fs.mkdirSync("src/styles", { recursive: true });
fs.writeFileSync("src/styles/fonts.css", output);
fs.writeFileSync("audit/font-source.txt", source);
console.log(n, "local font files");
