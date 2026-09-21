# Content review before publication

Source audit: https://mrdc.co.mz/, 21 September 2026. All eight requested English URLs and their `/pt/` equivalents returned HTTP 200. Extracted source content is retained in `audit/content.json`; the approved migration data lives in `src/data/content.json`.

## Client decisions

- **About / Philosophy / Therapists:** the source includes Lorem Ipsum, empty sections and a repeated stock doctor image. Placeholder copy and fictitious team profiles have not been published. The three existing philosophy principles and the source “Certified & Experienced Therapists” heading are retained. Supply approved philosophy/therapist copy, credentials, real team names and licensed photographs before adding them.
- **Portuguese:** the live site mixes English and Portuguese, particularly throughout the protocol and product galleries. Existing Portuguese prose is retained. `src/data/translation-review.mjs` explicitly marks newly supplied translations for native-speaker and clinical terminology review. Interface strings in `src/data/translations.ts` and new policy/contact wording also need review. Source expressions such as “silício”, “IDOSOS E COM MOBILIDADE PREJUDICIAL”, and the translated “Trusted by Thousands” heading need editorial correction by the client; they have not been silently rewritten.
- **Existing numerical claim:** the requested “Trusted by Thousands Who Choose to Heal with Us” heading is reproduced from the source. Ask MRDC to substantiate it or approve replacement wording. No new numbers, patient testimonials, named clinicians, certifications, prices or treatment guarantees were invented.
- **Cookies:** the live `/cookies/` page has navigation/footer but no substantive policy body. New factual copy describes only this implementation: a localStorage preference and no configured optional trackers. Client approval is required.
- **Privacy:** the live policy is an unedited WordPress “Suggested text” template, including an invalid internal installation URL and descriptions of login, comments, Gravatar and uploads. These features are absent from this static site. They were replaced with factual website/contact/browser-storage information. MRDC must approve its final privacy policy and supply its actual clinical-data handling, hosting/logging, retention and contact requirements. The replacement is not presented as a complete organizational privacy policy.
- **Map:** no independently confirmed map location was available during inspection (the source iframe was consent/lazy-load blocked). The verified address and contact links are provided; no guessed coordinates or map embed were added.

## Documented wording and presentation changes

- Removed Lorem Ipsum and the WordPress privacy boilerplate; retained the legitimate healthcare prose and semantic lists.
- Removed duplicated English fragments from the first two Portuguese FAQ answers, preserving their complete Portuguese sentences.
- Filled source English-only Portuguese protocol headings, body text and gallery labels in the dedicated review file. No translation-needed messages appear to visitors.
- Used `recepcao@mrdc.co.mz` consistently. The Portuguese source incorrectly translated the email address to `Recepção@…`; the technical email destination is not translated.
- Changed the navigation translation “Lar” to “Início”; flagged all new interface translations for review.
- The Patients page references a nonexistent booking form. That instruction now directs visitors to contact MRDC. No form/backend was invented.
- Removed repeated “Book a Consultation” list artifacts from prose; retained a working contact CTA.
- Source FAQ background measured `rgb(103,148,193)` (`#6794c1`). The rebuild uses darker `#1766ac` with white text to improve contrast.
- Replaced the auto-playing Elementor galleries with manual accessible galleries, retaining all 87 source slides and captions. Escape, arrows, focus containment/restoration and scroll locking are supported.
- Used a single non-repeating building hero image, responsive grids/timeline, and more consistent spacing. Reduced empty source sections and omitted placeholder staff photographs; About retains its two-column introduction, philosophy, four feature cards, community message and team introduction.
- The source follow-up image filename describes an unrelated urology treatment. It is not rendered as an MRDC treatment or service. The nine legitimate protocol descriptions remain intact.

These content approvals do not block local implementation or testing. No production deployment has been performed.
