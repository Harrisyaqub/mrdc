import { site, routes, href } from "../data/site-config";
export function GET() {
  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">${(["en", "pt"] as const).flatMap((lang) => routes.map((route) => `<url><loc>${site.url + href(lang, route)}</loc><xhtml:link rel="alternate" hreflang="en" href="${site.url + href("en", route)}"/><xhtml:link rel="alternate" hreflang="pt" href="${site.url + href("pt", route)}"/></url>`)).join("")}</urlset>`,
    { headers: { "Content-Type": "application/xml" } },
  );
}
