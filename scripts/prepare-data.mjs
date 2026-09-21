import fs from "node:fs";
import {
  translations,
  protocolTitles,
  protocolBlocks,
} from "../src/data/translation-review.mjs";
const raw = JSON.parse(fs.readFileSync("audit/content.json", "utf8"));
const productIds = [
  "3265",
  "3288",
  "3305",
  "3324",
  "3345",
  "3389",
  "3402",
  "3428",
];
const patientIds = [
  "3704",
  "3687",
  "3681",
  "3697",
  "3696",
  "3695",
  "3701",
  "3694",
];
const slugs = [
  "lower-limb-prosthesis",
  "upper-limb-prosthesis",
  "lower-limb-orthosis",
  "upper-limb-orthosis",
  "ready-made-items",
  "special-silicon-solutions",
  "special-medical-shoes",
  "mobility-aids",
];
const patientSlugs = [
  "lower-limb-amputees",
  "upper-limb-amputees",
  "congenital-disorders",
  "neurological-disorders",
  "musculoskeletal-disorders",
  "diabetic-vascular-foot",
  "elderly-mobility-impaired",
  "postural-disorders",
];
const stepIds = [
  "registration",
  "patient-file",
  "consultation",
  "referrals",
  "casting",
  "fabrication",
  "fitting-gait-training",
  "final-checkout",
  "follow-up",
];
function sections(blocks) {
  let out = [];
  for (const b of blocks) {
    if (/^h[123]$/.test(b.tag)) out.push({ title: b.text, blocks: [] });
    else if (out.length) out.at(-1).blocks.push(b);
  }
  return out;
}
const output = {};
for (const lang of ["en", "pt"]) {
  const home = raw[lang + "-home"];
  const hs = sections(home.blocks);
  const products = productIds.map((id, i) => ({
    ...home.popups.find((p) => p.id === id),
    slug: slugs[i],
    title: home.blocks.filter((b) => b.tag === "h3")[i].text,
    image: home.images[i],
  }));
  const patients = patientIds.map((id, i) => ({
    ...home.popups.find((p) => p.id === id),
    slug: patientSlugs[i],
    title: home.blocks
      .filter((b) => b.tag === "h3")
      [i + 8].text.replace(/\s*→/g, ""),
    image: home.images[i + 8],
  }));
  const about = sections(raw[lang + "-about-us"].blocks);
  // HUMAN REVIEW: the live therapist section contains only placeholder copy. Retain its heading without inventing credentials.
  const protocol = sections(raw[lang + "-patient-protocol"].blocks)
    .filter((s) => /^\d\./.test(s.title))
    .map((s, i) => ({
      ...s,
      id: stepIds[i],
      title: s.title.replace(/^\d\.\s*/, ""),
      image: raw[lang + "-patient-protocol"].images[i === 0 ? 1 : i + 1],
    }));
  const faqs = home.faqs;
  if (lang === "pt") {
    faqs[0].answer = faqs[0].answer.split(" custom-made")[0];
    faqs[1].answer = faqs[1].answer.replace(
      /^The prosthetic fitting process usually takes 2–4 weeks/,
      "",
    );
  }
  output[lang] = {
    home: hs,
    products,
    patients,
    about,
    protocol,
    faqs,
    productPage: sections(raw[lang + "-our-products"].blocks),
    patientPage: sections(raw[lang + "-patients-we-serve"].blocks),
    contact: sections(raw[lang + "-contact-us"].blocks),
  };
}
function translate(value) {
  if (typeof value === "string") return translations[value] || value;
  if (Array.isArray(value)) return value.map(translate);
  if (value && typeof value === "object")
    return Object.fromEntries(
      Object.entries(value).map(([k, v]) => [k, translate(v)]),
    );
  return value;
}
output.pt = translate(output.pt);
output.pt.protocol.forEach((s, i) => {
  s.title = protocolTitles[i];
  s.blocks = protocolBlocks[i].map((b) =>
    Array.isArray(b)
      ? { tag: "ul", items: b, text: b.join(" ") }
      : { tag: "p", text: b },
  );
});
for (const lang of ["en", "pt"])
  output[lang].protocol.forEach(
    (s) =>
      (s.blocks = s.blocks.filter(
        (b) => !b.items?.includes("Book a Consultation"),
      )),
  );
fs.writeFileSync("src/data/content.json", JSON.stringify(output, null, 2));
console.log(
  "Prepared bilingual content, 16 galleries, 9 protocol sections, 7 FAQs",
);
