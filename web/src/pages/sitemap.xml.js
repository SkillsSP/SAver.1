/* ==========================================================================
   /sitemap.xml — adres, pod który pukają wyszukiwarki i Google Search Console

   Integracja @astrojs/sitemap generuje pliki pod nazwami `sitemap-index.xml`
   i `sitemap-0.xml`. Pod utartym adresem `/sitemap.xml` nie ma wtedy nic, więc
   po wpisaniu go ręcznie widać błąd 404 i wygląda to, jakby mapy nie było.

   Ten plik wystawia pod `/sitemap.xml` indeks wskazujący na wygenerowaną mapę.
   Adres bierzemy z `site` i `base` w astro.config.mjs, więc po przeniesieniu
   serwisu na własną domenę nie trzeba tu niczego poprawiać.
   ========================================================================== */

export function GET({ site }) {
  const baza = new URL(import.meta.env.BASE_URL, site).href.replace(/\/$/, "");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${baza}/sitemap-0.xml</loc>
  </sitemap>
</sitemapindex>
`;

  return new Response(xml, {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
}
