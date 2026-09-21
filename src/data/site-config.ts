export const site = {
  url: "https://mrdc.co.mz",
  name: "MRDC",
  phone: "+258 870 904 451",
  tel: "+258870904451",
  email: "recepcao@mrdc.co.mz",
  address:
    "Av. Rua São Paulo, Nº 607, Bairro 25 de Junho, KaMubukwana, Maputo Cidade, Mozambique",
  whatsapp: "https://wa.me/258870904451",
  facebook: "https://www.facebook.com/share/1E8BQSmUsb/?mibextid=wwXIfr",
  instagram: "https://www.instagram.com/mz.rehabdiagnostic.center/",
};
export const routes = [
  "",
  "about-us",
  "our-products",
  "patients-we-serve",
  "patient-protocol",
  "contact-us",
  "cookies",
  "privacy-policy",
];
export type Lang = "en" | "pt";
export const href = (lang: Lang, route = "") =>
  `${lang === "pt" ? "/pt" : "/"}${lang === "pt" ? "/" : ""}${route ? route + "/" : ""}`;
