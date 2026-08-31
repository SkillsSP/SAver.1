/* ==========================================================================
   TEST BEZPIECZEŃSTWA I ZGODY

   Sprawdza trzy rzeczy, których nie widać w kodzie źródłowym, bo rozstrzygają
   się dopiero w działającej przeglądarce.

   1. POLITYKA BEZPIECZEŃSTWA TREŚCI NICZEGO NIE BLOKUJE. Polityka wypisana za
      wąsko psuje stronę po cichu: nic się nie wywala, tylko przestaje działać.
      Przejechałem się na tym przy pierwszym podejściu — Umami ładuje się
      z `cloud.umami.is`, a odczyty odsyła na `gateway.umami.is`, więc polityka
      zbudowana z samego adresu skryptu blokowała każdy odczyt. Statystyki
      przestałyby przychodzić, a strona wyglądałaby normalnie. Ten test
      wyłapuje dokładnie taki przypadek po zmianie dostawcy.

   2. ODMOWA ZGODY NAPRAWDĘ COŚ ZNACZY. Skoro pytamy o zgodę, przycisk „tylko
      niezbędne" musi wyłączać licznik. Sprawdzamy to jedyną wiarygodną metodą:
      licząc zapytania wychodzące poza nasz serwer.

   3. NA STRONIE NIE MA BŁĘDÓW SKRYPTÓW. Wyjątek w kodzie potrafi zatrzymać
      obsługę formularza albo menu, nie zostawiając śladu widocznego gołym okiem.

   URUCHAMIAĆ NA WERSJI ZBUDOWANEJ, nie na serwerze deweloperskim. Ten drugi
   dokłada własne narzędzia — wątek roboczy z adresu blob: i przeładowywanie
   modułów w locie — których w gotowej stronie nie ma. Zgłaszał je jako
   naruszenia polityki, choć w sieci nic takiego nie stoi.

     npm run build
     npx astro preview --port 4331
     npm run test:bezpieczenstwa -- http://localhost:4331
   ========================================================================== */

import { chromium } from "playwright";

const ADRES = process.argv[2] ?? "http://localhost:4321";

const STRONY = [
  "/", "/program", "/podstawowe", "/fakultety", "/indywidualne",
  "/exams", "/exams/egzamin-osmoklasisty", "/exams/matura",
  "/cennik", "/zapisy", "/kontakt", "/o-nas", "/metoda",
  "/bezpieczenstwo", "/regulamin", "/polityka-prywatnosci", "/klauzula-rodo",
  "/terminarz", "/poradnik",
];

const bledy = [];
const blad = (co) => bledy.push(co);

const przegladarka = await chromium.launch();

/* ---- 1 i 3. Polityka i błędy skryptów, w obu stanach zgody ---- */
for (const zgoda of ["necessary", "all"]) {
  const kontekst = await przegladarka.newContext();
  const strona = await kontekst.newPage();
  await strona.addInitScript((z) => {
    try { localStorage.setItem("sa-cookie-consent", z); } catch (e) {}
  }, zgoda);

  strona.on("console", (m) => {
    const t = m.text();
    const adres = strona.url().replace(ADRES, "") || "/";
    if (/Content Security Policy|Refused to (load|connect|execute)/i.test(t))
      blad(`[zgoda: ${zgoda}] ${adres} — polityka zablokowała zasób: ${t.slice(0, 120)}`);
    else if (m.type() === "error")
      blad(`[zgoda: ${zgoda}] ${adres} — błąd w konsoli: ${t.slice(0, 120)}`);
  });
  strona.on("pageerror", (e) => {
    const adres = strona.url().replace(ADRES, "") || "/";
    blad(`[zgoda: ${zgoda}] ${adres} — wyjątek skryptu: ${String(e).slice(0, 120)}`);
  });

  for (const a of STRONY) {
    await strona.goto(ADRES + a, { waitUntil: "networkidle" });
    await strona.waitForTimeout(150);
  }
  await kontekst.close();
}

/* ---- 2. Odmowa zgody wyłącza wszystko, co wychodzi na zewnątrz ---- */
const stanyZgody = [
  ["odmowa", "necessary", 0],
  ["brak decyzji", null, 0],
  ["pełna zgoda", "all", null], // null = oczekujemy, że coś wyjdzie
];

for (const [etykieta, wartosc, oczekiwane] of stanyZgody) {
  const kontekst = await przegladarka.newContext();
  const strona = await kontekst.newPage();
  if (wartosc) {
    await strona.addInitScript((z) => {
      try { localStorage.setItem("sa-cookie-consent", z); } catch (e) {}
    }, wartosc);
  }
  const obce = new Set();
  strona.on("request", (r) => {
    const h = new URL(r.url()).hostname;
    if (h !== new URL(ADRES).hostname) obce.add(h);
  });
  await strona.goto(ADRES + "/", { waitUntil: "networkidle" });
  await strona.waitForTimeout(800);

  if (oczekiwane === 0 && obce.size > 0)
    blad(`Przy stanie „${etykieta}" strona odpytała obce serwery: ${[...obce].join(", ")}`);
  if (oczekiwane === null && obce.size === 0)
    blad(`Przy pełnej zgodzie analityka nie wysłała ani jednego zapytania —` +
      ` sprawdźcie \`analityka.polaczenia\` w src/lib/site.js`);

  console.log(`  zgoda „${etykieta}": ${obce.size} obcych serwerów` +
    (obce.size ? ` — ${[...obce].join(", ")}` : ""));
  await kontekst.close();
}

/* ---- Formularze niosą znacznik czasu ---- */
{
  const kontekst = await przegladarka.newContext();
  const strona = await kontekst.newPage();
  await strona.addInitScript(() => {
    try { localStorage.setItem("sa-cookie-consent", "necessary"); } catch (e) {}
  });
  for (const a of ["/zapisy", "/kontakt"]) {
    await strona.goto(ADRES + a, { waitUntil: "networkidle" });
    const w = await strona.evaluate(() => {
      const el = document.querySelector("[data-otwarto]");
      if (!el) return null;
      const t = Number(el.value);
      return Number.isFinite(t) && t > 0;
    });
    if (w === null)
      blad(`${a} — brak pola \`otwarto\`, pułapka czasowa tam nie działa`);
    else if (!w)
      blad(`${a} — pole \`otwarto\` puste, skrypt nie wpisał znacznika czasu`);
  }
  await kontekst.close();
}

await przegladarka.close();

/* ===========================================================================
   POCZTA: SPF I DMARC

   Zabezpieczenia strony pilnowałem od początku, a wpisów DNS chroniących
   NADAWCĘ nie sprawdzał nikt. Wyszło przy okazji: pod nazwą `_dmarc` stały
   DWA rekordy naraz. Norma RFC 7489 mówi wprost, że przy więcej niż jednym
   rekordzie odbiorca traktuje domenę tak, jakby nie miała żadnego — czyli
   dwa rekordy chroniły mniej niż jeden, a wyglądały jak nadmiar staranności.

   Podszycie się pod adres centrum nie jest problemem teoretycznym: wiadomość
   „od Skills Academy" z prośbą o przelew trafia do rodzica, który nam ufa.

   Pytamy przez wbudowany moduł `node:dns`, a nie przez `nslookup` — ten na
   Windowsie potrafi nie pokazać długiego wpisu TXT i o mało nie zgłosiłem
   kiedyś brakującego SPF, którego po prostu nie widziałem w konsoli.

   Pierwsza wersja pytała serwer DNS-over-HTTPS przez `fetch`. Działała, ale
   zostawiała otwarte gniazda, przez co `process.exit(1)` kończył się awarią
   biblioteki obsługującej zdarzenia i kodem wyjścia 127 zamiast 1. Narzędzie
   zgłaszające błąd kodem „polecenia nie znaleziono" jest gorsze niż brak
   narzędzia, bo każdy skrypt sprawdzający wynik zrozumie to opacznie.
   =========================================================================== */
import { promises as dns } from "node:dns";

const DOMENA = "skilful.pl";

async function txt(nazwa) {
  try {
    /* `resolveTxt` zwraca każdy rekord jako tablicę kawałków — długie wpisy
       DNS dzieli na odcinki po 255 znaków. Sklejamy je z powrotem, żeby
       policzyć REKORDY, a nie kawałki. */
    const rekordy = await dns.resolveTxt(nazwa);
    return rekordy.map((czesci) => czesci.join(""));
  } catch {
    return [];
  }
}

{
  const spf = (await txt(DOMENA)).filter((w) => w.startsWith("v=spf1"));
  if (spf.length === 0)
    blad(`poczta — brak rekordu SPF, każdy może nadać jako @${DOMENA}`);
  else if (spf.length > 1)
    blad(`poczta — ${spf.length} rekordy SPF; przy więcej niż jednym SPF nie działa`);

  const dmarc = (await txt(`_dmarc.${DOMENA}`)).filter((w) => w.startsWith("v=DMARC1"));
  if (dmarc.length === 0) {
    blad("poczta — brak rekordu DMARC, nikt nie broni przed podszyciem się");
  } else if (dmarc.length > 1) {
    blad(`poczta — ${dmarc.length} rekordy DMARC; przy więcej niż jednym domena jest` +
      " traktowana jak bez polityki (RFC 7489)");
  } else if (/p=none/.test(dmarc[0])) {
    blad("poczta — DMARC stoi na `p=none`, czyli obserwuje i niczego nie blokuje");
  }
}

console.log(`\n  Sprawdzono ${STRONY.length} stron × 2 stany zgody oraz wpisy poczty.`);
console.log(`\n  BŁĘDY: ${bledy.length}`);
for (const b of bledy) console.log(`   ✗ ${b}`);
console.log("");
process.exit(bledy.length ? 1 : 0);
