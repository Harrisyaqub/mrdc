# Verification — MRDC migration

## Facility photo update — 25 September 2026

All seven supplied facility photographs were integrated into matching sections in both languages. Production build and static output checks pass (17 pages, 17 unique titles, no output errors). A focused browser check verified 36 image placements at 375px and 1440px: all images decoded successfully, no horizontal overflow and no browser errors. Evidence: `audit/facility-photo-check.json` and `audit/facility-*.png`. Previous Lighthouse scores below describe the earlier migration build; Lighthouse was not rerun for this image-only update.

Tested locally on 21 September 2026 against the static production preview at `http://127.0.0.1:4322/`.

## Build and page coverage

- `npm.cmd run build`: passes, generating the 16 requested localized routes, custom 404, XML sitemap and local static assets. No build errors or warnings.
- Existing development server verified at `http://localhost:4321/`, first with the original starter and then with the rebuilt homepage.
- All 16 requested pages return HTTP 200 and have one H1, localized metadata, canonical and alternate-language URLs. Missing pages return HTTP 404.
- Browser coverage: every requested route at **320, 375, 768, 1024, 1280 and 1440 px** (96 route/viewport combinations). No horizontal overflow.
- Desktop/mobile visual review of Home, About, Patients, Protocol and Contact, with source screenshots for the six main English page types.
- Source audit includes all eight English and eight Portuguese routes, product/patient popup contents, backgrounds, headings and contact destinations.

## Interaction and accessibility results

Final browser suite: **361 checks passed, 0 failed, 0 browser/request errors**.

- Desktop dropdown opening, Escape and focus restoration, outside-click dismissal.
- Mobile menu and accordion controls at all four mobile/tablet widths in both languages.
- All 16 galleries in both languages: opening, all **87 source slides per language**, image decoding, scroll lock, focus trap, Escape and trigger focus restoration.
- All seven FAQs open and close in both languages.
- Accept/decline cookie persistence, reset control, and preferences shared across language routes.
- English/Portuguese switching, 60 unique internal destinations/anchors, and all 150 local image files/variants checked successfully.
- Automated axe WCAG 2 A/AA and WCAG 2.1 AA checks: **zero violations on all 16 pages** at the desktop audit viewport. Mobile interaction and overflow checks were run separately. Automated checks do not replace a complete human accessibility audit.
- Phone, email, WhatsApp, Facebook and Instagram destination strings were checked against the supplied/source values. No phone calls or messages were sent.
- Built HTML checked for WordPress/Elementor/jQuery references, placeholder copy, unrelated spam terms, heading counts, metadata uniqueness and JSON-LD validity.

Machine-readable evidence: `audit/verification.json`, `audit/output-check.json`. Screenshots are under `audit/`.

## Lighthouse mobile results

| Production page | Performance | Accessibility | Best practices | SEO |
| --- | ---: | ---: | ---: | ---: |
| English homepage | 97 | 100 | 100 | 100 |
| Products | 99 | 100 | 100 | 100 |
| Portuguese homepage | 98 | 100 | 100 | 100 |

Reports: `audit/lighthouse-home.json`, `audit/lighthouse-products.json`, `audit/lighthouse-portuguese.json`. Scores are local lab measurements with mobile emulation and can vary with the production host/network.

An initial run flagged font payloads and small contact touch targets. These were fixed using three local WOFF2 Latin-subset fonts and larger link hit areas. A shared browser closed during the first test run, and one earlier concurrent audit hit a browser network-buffer limit. The isolated final run completed without those errors. Test-script adjustments accounted for shared cookie preferences and a dropdown covering the initial outside-click target; no production behavior was bypassed.

## Remaining review

Implementation and local verification are complete. Client review items are documented in `CONTENT_REVIEW.md`: incomplete original translations, philosophy/therapist copy, substantiation of the source numerical claim, privacy/cookie approval and verified map details. No Git commit, remote push or production deployment was performed.
