/* ==========================================================================
   AUDYT WYDAJNOŚCI

   Mierzy to, co odczuwa rodzic otwierający stronę na telefonie w poczekalni:
   ile trzeba ściągnąć, po jakim czasie widać główny obraz i czy treść skacze
   pod palcem w trakcie wczytywania.

   Progi bierzemy z zaleceń Google dla wskaźników Core Web Vitals, bo to one
   decydują o pozycji w wynikach wyszukiwania:
     LCP  do 2,5 s   — kiedy pojawia się największy element na ekranie
     CLS  do 0,1     — jak bardzo treść skacze w trakcie wczytywania

   Waga strony nie ma progu w normie, więc przyjmujemy własny: 500 kB na
   pierwsze wejście. To mniej więcej sekunda na przeciętnym łączu komórkowym
   w Polsce i granica, powyżej której rodzic zaczyna czekać świadomie.

   URUCHAMIAĆ NA WERSJI ZBUDOWANEJ:
     npm run build && npx astro preview --port 4331
     node narzedzia/audyt-wydajnosci.mjs http://localhost:4331
   ========================================================================== */

import { chromium, devices } from "playwright";

const ADRES = process.argv[2] ?? "http://localhost:4331";

const STRONY = [
  "/", "/program", "/podstawowe", "/fakultety", "/indywidualne",
  "/exams", "/exams/egzamin-osmoklasisty", "/exams/matura",
  "/cennik", "/zapisy", "/kontakt", "/o-nas", "/metoda",
  "/bezpieczenstwo", "/regulamin", "/polityka-prywatnosci", "/klauzula-rodo",
  "/terminarz", "/poradnik",
];

const PROG_WAGI = 500 * 1024;
const PROG_LCP = 2500;
const PROG_CLS = 0.1;

const bledy = [];
const uwagi = [];
const wiersze = [];

const przegladarka = await chromium.launch();
const kontekst = await przegladarka.newContext({ ...devices["iPhone 13"] });
const strona = await kontekst.newPage();
await strona.addInitScript(() => {
  try { localStorage.setItem("sa-cookie-consent", "necessary"); } catch (e) {}
});

for (const adres of STRONY) {
  let bajty = 0;
  let zapytan = 0;
  const wgTypu = {};

  const naOdpowiedz = async (odp) => {
    zapytan++;
    try {
      const dlugosc = Number(odp.headers()["content-length"] ?? 0);
      const rozmiar = dlugosc || (await odp.body().catch(() => Buffer.alloc(0))).length;
      bajty += rozmiar;
      const typ = (odp.headers()["content-type"] ?? "inne").split(";")[0];
      wgTypu[typ] = (wgTypu[typ] ?? 0) + rozmiar;
    } catch { /* zasób mógł zniknąć przed odczytem — pomijamy */ }
  };
  strona.on("response", naOdpowiedz);

  await strona.goto(ADRES + adres, { waitUntil: "networkidle" });

  /* Największy element i przesunięcia układu odczytujemy z przeglądarki,
     a nie zgadujemy z wagi plików. */
  const miary = await strona.evaluate(() => new Promise((gotowe) => {
    let lcp = 0;
    let cls = 0;
    try {
      new PerformanceObserver((lista) => {
        for (const w of lista.getEntries()) lcp = Math.max(lcp, w.startTime);
      }).observe({ type: "largest-contentful-paint", buffered: true });
      new PerformanceObserver((lista) => {
        for (const w of lista.getEntries()) if (!w.hadRecentInput) cls += w.value;
      }).observe({ type: "layout-shift", buffered: true });
    } catch { /* starsza przeglądarka — zwrócimy zera */ }
    setTimeout(() => {
      const n = performance.getEntriesByType("navigation")[0];
      gotowe({
        lcp: Math.round(lcp),
        cls: Math.round(cls * 1000) / 1000,
        dom: n ? Math.round(n.domContentLoadedEventEnd) : 0,
      });
    }, 900);
  }));

  strona.off("response", naOdpowiedz);

  const kb = Math.round(bajty / 1024);
  wiersze.push({ adres, kb, zapytan, ...miary });

  if (bajty > PROG_WAGI) bledy.push(`${adres} — ${kb} kB przy progu ${Math.round(PROG_WAGI / 1024)} kB`);
  if (miary.lcp > PROG_LCP) bledy.push(`${adres} — największy element po ${miary.lcp} ms przy progu ${PROG_LCP} ms`);
  if (miary.cls > PROG_CLS) bledy.push(`${adres} — układ skacze o ${miary.cls} przy progu ${PROG_CLS}`);
  if (miary.cls > 0.05 && miary.cls <= PROG_CLS) uwagi.push(`${adres} — układ skacze o ${miary.cls}`);
}

await przegladarka.close();

wiersze.sort((a, b) => b.kb - a.kb);
console.log("\n  Waga i szybkość, od najcięższej strony (emulacja iPhone 13):\n");
console.log("  strona".padEnd(34) + "waga".padStart(8) + "zapytań".padStart(9) +
  "LCP".padStart(9) + "CLS".padStart(8));
console.log("  " + "-".repeat(66));
for (const w of wiersze) {
  console.log("  " + w.adres.padEnd(32) + `${w.kb} kB`.padStart(8) +
    String(w.zapytan).padStart(9) + `${w.lcp} ms`.padStart(9) + String(w.cls).padStart(8));
}
const najciezsza = wiersze[0];
const srednia = Math.round(wiersze.reduce((s, w) => s + w.kb, 0) / wiersze.length);
const najgorszyLcp = Math.max(...wiersze.map((w) => w.lcp));
const najgorszyCls = Math.max(...wiersze.map((w) => w.cls));
console.log(`\n  Średnia waga ${srednia} kB · najcięższa ${najciezsza.adres} ${najciezsza.kb} kB` +
  ` · najgorszy LCP ${najgorszyLcp} ms · najgorszy CLS ${najgorszyCls}`);

console.log(`\n  BŁĘDY: ${bledy.length}`);
for (const b of bledy) console.log(`   ✗ ${b}`);
console.log(`\n  UWAGI: ${uwagi.length}`);
for (const u of uwagi) console.log(`   ! ${u}`);
console.log("");
process.exit(bledy.length ? 1 : 0);
