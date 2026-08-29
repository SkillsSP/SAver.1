/* ==========================================================================
   POMIAR NA SŁABYM TELEFONIE

   Dotychczasowy audyt wydajności mierzył wagę stron, największy element
   i skoki układu — wszystko na szybkiej maszynie. Raz zmierzyłem też wolne
   łącze. Nie mierzyłem natomiast rzeczy, która na starszym telefonie boli
   najbardziej: WOLNEGO PROCESORA.

   Rodzic z pięcioletnim Androidem nie ma tylko gorszego internetu. Ma
   czterokrotnie wolniejsze składanie strony, wykonywanie skryptów
   i dekodowanie zdjęć. Strona, która na komputerze reaguje natychmiast, może
   tam nie odpowiadać przez sekundę po dotknięciu.

   CO MIERZYMY:

     · czas do narysowania największego elementu (LCP) — kiedy widać treść,
     · sumę długich zadań — ile łącznie milisekund przeglądarka jest zajęta
       tak bardzo, że nie reaguje na dotknięcie; to jest miara „zacinania się",
     · najdłuższe pojedyncze zadanie — jeden blok powyżej 200 ms to odczuwalne
       zawieszenie,
     · czas od dotknięcia przycisku do reakcji.

   Progi biorą się z zaleceń dla wskaźników Core Web Vitals mierzonych
   w warunkach terenowych: LCP do 2,5 s, suma długich zadań do 200 ms.

   KAŻDĄ STRONĘ MIERZYMY TRZY RAZY I BIERZEMY MEDIANĘ. Pierwsza wersja robiła
   jeden pomiar i zgłosiła, że strona główna blokuje reakcję przez 1095 ms.
   Pięć powtórzeń pokazało wartości od 0 do 25 ms — tamten wynik pochodził
   z zimnego startu przeglądarki i nie miał nic wspólnego ze stroną. Pomiar
   wydajności z jednej próbki potrafi być fałszywy o dwa rzędy wielkości.

     npm run test:slaby                       (na żywej stronie)
   ========================================================================== */

import { chromium, devices } from "playwright";

const ADRES = process.argv[2] ?? "https://skilful.pl";

const STRONY = ["/", "/cennik", "/zapisy", "/podstawowe", "/exams/matura", "/o-nas"];

/* Czterokrotne spowolnienie procesora to przybliżenie średniej klasy telefonu
   z Androidem sprzed kilku lat. Sześciokrotne odpowiada sprzętowi budżetowemu. */
const SPOWOLNIENIE = 4;
const PROG_LCP = 2500;
const PROG_ZADANIA = 200;

const POWTORZENIA = 3;
const mediana = (t) => { const s = [...t].sort((a, b) => a - b); return s[Math.floor(s.length / 2)]; };

const bledy = [];
const wiersze = [];

const przegladarka = await chromium.launch();
const kontekst = await przegladarka.newContext({ ...devices["Pixel 7"] });

for (const adres of STRONY) {
 const probki = [];
 for (let przebieg = 0; przebieg < POWTORZENIA; przebieg++) {
  const strona = await kontekst.newPage();
  await strona.addInitScript(() => {
    try { localStorage.setItem("sa-cookie-consent", "necessary"); } catch (e) {}
  });

  const cdp = await kontekst.newCDPSession(strona);
  await cdp.send("Emulation.setCPUThrottlingRate", { rate: SPOWOLNIENIE });
  /* Łącze komórkowe średniej jakości — 1,6 Mb/s przy 150 ms opóźnienia. */
  await cdp.send("Network.enable");
  await cdp.send("Network.emulateNetworkConditions", {
    offline: false, latency: 150,
    downloadThroughput: (1.6 * 1024 * 1024) / 8,
    uploadThroughput: (750 * 1024) / 8,
  });

  /* Obserwatory montujemy PRZED wejściem na stronę, inaczej przegapią
     zdarzenia z pierwszych milisekund. */
  await strona.addInitScript(() => {
    window.__pomiar = { lcp: 0, zadania: [] };
    try {
      new PerformanceObserver((l) => {
        for (const w of l.getEntries()) window.__pomiar.lcp = Math.max(window.__pomiar.lcp, w.startTime);
      }).observe({ type: "largest-contentful-paint", buffered: true });
      new PerformanceObserver((l) => {
        for (const w of l.getEntries()) window.__pomiar.zadania.push(w.duration);
      }).observe({ type: "longtask", buffered: true });
    } catch (e) {}
  });

  await strona.goto(ADRES + adres, { waitUntil: "load" });
  await strona.waitForTimeout(2500);

  const w = await strona.evaluate(() => {
    const p = window.__pomiar ?? { lcp: 0, zadania: [] };
    /* „Blokujący" jest tylko nadmiar ponad 50 ms — do tego progu przeglądarka
       i tak zdąży zareagować na dotknięcie. */
    const blokujacy = p.zadania.reduce((s, d) => s + Math.max(0, d - 50), 0);
    return {
      lcp: Math.round(p.lcp),
      blokujacy: Math.round(blokujacy),
      najdluzsze: Math.round(Math.max(0, ...p.zadania)),
      zadan: p.zadania.length,
    };
  });

  /* Reakcja na dotknięcie głównego wezwania. */
  let reakcja = null;
  const przycisk = strona.locator(".pasek-akcji .przycisk, main a.przycisk--akcja").first();
  if (await przycisk.count()) {
    const start = Date.now();
    await przycisk.hover().catch(() => {});
    await strona.evaluate(() => new Promise((r) => requestAnimationFrame(() => r())));
    reakcja = Date.now() - start;
  }

  probki.push({ ...w, reakcja });
  await strona.close();
 }

 const wynik = {
   adres,
   lcp: mediana(probki.map((p) => p.lcp)),
   blokujacy: mediana(probki.map((p) => p.blokujacy)),
   najdluzsze: mediana(probki.map((p) => p.najdluzsze)),
   reakcja: mediana(probki.map((p) => p.reakcja ?? 0)),
 };
 wiersze.push(wynik);
 if (wynik.lcp > PROG_LCP)
   bledy.push(`${adres} — największy element po ${wynik.lcp} ms przy progu ${PROG_LCP}` +
     ` (mediana z ${POWTORZENIA}: ${probki.map((p) => p.lcp).join(", ")})`);
 if (wynik.blokujacy > PROG_ZADANIA)
   bledy.push(`${adres} — ${wynik.blokujacy} ms zablokowanej reakcji przy progu ${PROG_ZADANIA}` +
     ` (mediana z ${POWTORZENIA}: ${probki.map((p) => p.blokujacy).join(", ")})`);
}

await przegladarka.close();

console.log(`\n  Telefon Pixel 7, procesor spowolniony ${SPOWOLNIENIE}×, łącze 1,6 Mb/s\n`);
console.log("  strona".padEnd(28) + "LCP".padStart(9) + "blokada".padStart(10) +
  "najdłuższe".padStart(12) + "reakcja".padStart(10));
console.log("  " + "-".repeat(67));
for (const w of wiersze) {
  console.log("  " + w.adres.padEnd(26) + `${w.lcp} ms`.padStart(9) +
    `${w.blokujacy} ms`.padStart(10) + `${w.najdluzsze} ms`.padStart(12) +
    `${w.reakcja} ms`.padStart(10));
}

console.log(`\n  BŁĘDY: ${bledy.length}`);
for (const b of bledy) console.log(`   ✗ ${b}`);
console.log("");
process.exit(bledy.length ? 1 : 0);
