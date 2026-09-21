# MRDC static migration

Existing Astro 7 and Tailwind CSS 4 dependencies, scripts and Vite configuration were preserved. The site is static HTML/CSS with a small vanilla TypeScript interaction bundle. There are no runtime WordPress, Elementor, PHP, jQuery, Bootstrap or UI framework dependencies.

## URL map

The domain and all requested legitimate page paths are retained. These rows are preservation rules, not redirects to themselves.

| Original path | Static destination | Action |
| --- | --- | --- |
| `/` | `/` | Retain |
| `/about-us/` | `/about-us/` | Retain |
| `/our-products/` | `/our-products/` | Retain |
| `/patients-we-serve/` | `/patients-we-serve/` | Retain |
| `/patient-protocol/` | `/patient-protocol/` | Retain |
| `/contact-us/` | `/contact-us/` | Retain |
| `/cookies/` | `/cookies/` | Retain; source copy missing |
| `/privacy-policy/` | `/privacy-policy/` | Retain; replace irrelevant template |
| `/pt/` | `/pt/` | Retain |
| `/pt/about-us/` | `/pt/about-us/` | Retain |
| `/pt/our-products/` | `/pt/our-products/` | Retain |
| `/pt/patients-we-serve/` | `/pt/patients-we-serve/` | Retain |
| `/pt/patient-protocol/` | `/pt/patient-protocol/` | Retain |
| `/pt/contact-us/` | `/pt/contact-us/` | Retain |
| `/pt/cookies/` | `/pt/cookies/` | Retain |
| `/pt/privacy-policy/` | `/pt/privacy-policy/` | Retain |

Configure the eventual host to serve directory `index.html` files and the custom `404.html` with HTTP 404. Trailing-slash normalization may be handled by the host. Do not redirect unknown, spam or compromised URLs to the homepage; let them return 404/410. No deployment platform was selected or modified.

## Old popup-link replacement

Fragments never reach an HTTP server, so these are content-link replacements, not HTTP redirects. The new navigation uses stable category anchors and semantic dialog buttons. Prefix destinations with `/pt` for Portuguese.

| Old fragment | New destination |
| --- | --- |
| `#lower-limb-p-popup` | `/our-products/#lower-limb-prosthesis` |
| `#upper-limb-p-popup` | `/our-products/#upper-limb-prosthesis` |
| `#lower-limb-o-popup` | `/our-products/#lower-limb-orthosis` |
| `#upper-limb-o-popup` | `/our-products/#upper-limb-orthosis` |
| `#ready-made-items-popup` | `/our-products/#ready-made-items` |
| `#special-silicon-popup` | `/our-products/#special-silicon-solutions` |
| `#special-medical-popup` | `/our-products/#special-medical-shoes` |
| `#mobility-aids-popup` | `/our-products/#mobility-aids` |
| `#lower-limb-amputees-popup` | `/patients-we-serve/#lower-limb-amputees` |
| `#upper-limb-amputees-popup` | `/patients-we-serve/#upper-limb-amputees` |
| `#congenital-disorder-popup` | `/patients-we-serve/#congenital-disorders` |
| `#neurological-disorders-popup` | `/patients-we-serve/#neurological-disorders` |
| `#musculo-skeletal-disorders-popup` | `/patients-we-serve/#musculoskeletal-disorders` |
| `#diabetic-&-vascular-foot-conditions-popup` | `/patients-we-serve/#diabetic-vascular-foot` |
| `#elderly-&-mobility-impaired-popup` | `/patients-we-serve/#elderly-mobility-impaired` |
| `#postural-disorders-popup` | `/patients-we-serve/#postural-disorders` |

## Content and assets

- Shared source-backed content: `src/data/content.json`.
- Site/contact configuration: `src/data/site-config.ts`.
- Interface translations: `src/data/translations.ts`; review translations: `src/data/translation-review.mjs`.
- Image provenance: `src/data/image-sources.ts` and JSON manifest; readable inventory: `ASSETS.md`.
- Fonts: local WOFF2 subsets for DM Sans, Darker Grotesque and Roboto, with `font-display: swap`.
- SEO: page-specific metadata, localized canonical/hreflang links, MedicalOrganization and breadcrumb JSON-LD, sitemap, robots and favicon.

## Reusable components

`Header`, `Footer` (including cookie controls and WhatsApp), `PageHero`, `CardGrid` (products/patients and native dialogs), `ProtocolSteps`, `FAQAccordion`, `ContactPanel`, `CTASection`, `AboutContent`, `Picture`, `RichText`, `Icon`, and `BaseLayout`. `SitePage` composes these for the bilingual route generator. Source content stays outside presentation components, except newly written policy copy and a short contact CTA.
