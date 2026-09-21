# MRDC — Astro + Tailwind

Static English and Portuguese migration of the MRDC healthcare website. Work directory: `C:\Users\devmo\OneDrive\Documents\GitHub\mrdc`.

## Run locally

```powershell
npm.cmd install
npm.cmd run dev
```

Development URL: http://localhost:4321/.

```powershell
npm.cmd run build
npm.cmd run preview -- --host 127.0.0.1 --port 4322
```

Production output: `dist/`. Preview: http://127.0.0.1:4322/. `npm.cmd` avoids this Windows machine's PowerShell restriction on `npm.ps1`.

## Handoff

- [Migration and all 16 routes](MIGRATION.md)
- [Content requiring client review](CONTENT_REVIEW.md)
- [Downloaded asset inventory](ASSETS.md)
- [Verification results](VERIFICATION.md)

All normal runtime images and fonts are local. Contact is via telephone, email or WhatsApp. Cookie preference is stored locally; no analytics or marketing services are configured. Language switching preserves the current page.

## Verification tools

Optional verification tools are isolated under the ignored `audit/tools` folder and do not change the application's dependencies:

```powershell
npm.cmd install --prefix audit/tools --no-save --package-lock=false playwright-core @axe-core/playwright lighthouse prettier prettier-plugin-astro
node scripts/verify.mjs
node scripts/lighthouse.mjs
```

Run the production preview first. Browser verification uses installed Microsoft Edge; Lighthouse uses installed Chrome. Adjust the explicit browser channel/path in those scripts on another OS. The full suite covers every route at six widths, both languages, all gallery slides, menus, keyboard behavior, cookies, internal links, image URLs and WCAG A/AA automated checks. The starter's original `npm test` placeholder is not the verification command.

`scripts/audit.mjs`, `extract-content.mjs`, `prepare-data.mjs` and asset scripts document the migration process. They are not needed to build or serve the finished site. Source HTML snapshots and original unoptimized downloads are ignored by Git. Content refreshes should be reviewed before regenerating production data.
