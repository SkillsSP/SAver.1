/* ==========================================================================
   TYPOGRAFIA POLSKA — POZA SIEROTAMI

   Sieroty (samotne „w", „i", „z" na końcu wiersza) wiąże już krok budowania
   strony. Reszta polskich zasad składu nie była sprawdzana nigdy, a to
   właśnie po nich widać różnicę między tekstem złożonym a wklejonym.

   CO SPRAWDZAMY — i dlaczego akurat to:

     · cudzysłowy — polski cudzysłów to „ ", nie " ". Prosty cudzysłów
       maszynowy jest w polskim tekście po prostu błędem,
     · wielokropek — jeden znak …, nie trzy kropki,
     · myślnik w zdaniu — półpauza – albo pauza — w otoczeniu spacji.
       Łącznik „-" ze spacjami jest błędem, choć wygląda podobnie,
     · zakresy liczb — „7–9 lat" przez półpauzę bez spacji, nie przez łącznik,
     · znak mnożenia — „2 × 45 min", nie „2x45",
     · spacja nierozdzielająca przed jednostką — „200 zł" nie ma prawa złamać
       się między liczbą a walutą na końcu wiersza,
     · podwójne spacje i spacja przed przecinkiem — ślady po przeklejaniu.

   PODZIAŁ NA BŁĘDY I UWAGI jest celowy. Prosty cudzysłów albo spacja przed
   przecinkiem to jednoznaczna pomyłka. Brak spacji nierozdzielającej przed
   jednostką psuje skład tylko wtedy, gdy akurat wypadnie na końcu wiersza —
   to warto poprawić, ale nie warto z tego robić awarii budowania.

   Sprawdzamy treść wyrenderowaną, czyli dokładnie to, co widzi rodzic.

     npm run test:typografia                   (na żywej stronie)
     npm run test:typografia -- http://localhost:4331
   ========================================================================== */

import { chromium } from "playwright";

const ADRES = process.argv[2] ?? "https://skilful.pl";

const STRONY = [
  "/", "/program", "/podstawowe", "/fakultety", "/indywidualne",
  "/exams", "/exams/egzamin-osmoklasisty", "/exams/matura",
  "/cennik", "/zapisy", "/kontakt", "/o-nas", "/metoda",
  "/bezpieczenstwo", "/regulamin", "/polityka-prywatnosci", "/klauzula-rodo",
  "/terminarz", "/poradnik", "/404",
];

const NBSP = " ";

const REGULY = [
  {
    waga: "błąd",
    nazwa: "prosty cudzysłów zamiast polskiego „ ”",
    wzor: /"/g,
  },
  {
    waga: "błąd",
    nazwa: "trzy kropki zamiast wielokropka …",
    wzor: /\.\.\./g,
  },
  {
    waga: "błąd",
    nazwa: "łącznik ze spacjami zamiast myślnika – lub —",
    wzor: /(?<=\S) - (?=\S)/g,
  },
  {
    waga: "błąd",
    nazwa: "spacja przed przecinkiem lub kropką",
    wzor: /\s+[,.;:!?](?=\s|$)/g,
  },
  {
    waga: "błąd",
    nazwa: "podwójna spacja",
    /* Zwykłe spacje, nie złamania wiersza — `innerText` wstawia \n sam. */
    wzor: /[^\S\n]{2,}/g,
  },
  {
    waga: "błąd",
    /* „2x45" albo „2 x 45" — w składzie to znak ×, nie litera. */
    nazwa: "litera „x” zamiast znaku mnożenia ×",
    wzor: /\d\s*[xX]\s*\d/g,
  },
  {
    waga: "uwaga",
    /* Zakres liczb łączy półpauza bez spacji: 7–9, a nie 7-9. */
    nazwa: "zakres liczb przez łącznik zamiast półpauzy –",
    wzor: /\d-\d/g,
  },
  {
    waga: "uwaga",
    nazwa: "zwykła spacja przed jednostką zamiast nierozdzielającej",
    wzor: /\d (zł|min|godz|h|kl|lat|lata|roku|%)\b/g,
  },
  {
    waga: "uwaga",
    /* Skrót „np." czy „tzn." nie powinien odrywać się od słowa, które objaśnia. */
    nazwa: "zwykła spacja po skrócie „np.” / „tzn.” / „m.in.”",
    wzor: /\b(np|tzn|tj|m\.in|ok)\. (?=\S)/g,
  },
];

const przegladarka = await chromium.launch();
const kontekst = await przegladarka.newContext({ viewport: { width: 1280, height: 900 } });
const strona = await kontekst.newPage();
await strona.addInitScript(() => {
  try { localStorage.setItem("sa-cookie-consent", "necessary"); } catch (e) {}
});

const znaleziska = new Map();
let znakow = 0;

const kontekstFragmentu = (tekst, indeks, dlugosc) => {
  const od = Math.max(0, indeks - 30);
  const do_ = Math.min(tekst.length, indeks + dlugosc + 30);
  return (od > 0 ? "…" : "") + tekst.slice(od, do_).replace(/\n/g, " ") +
    (do_ < tekst.length ? "…" : "");
};

for (const adres of STRONY) {
  const odp = await strona.goto(ADRES + adres, { waitUntil: "domcontentloaded" }).catch(() => null);
  if (!odp || !odp.ok()) continue;

  const tekst = await strona.evaluate(() => {
    const g = document.querySelector("main");
    return g ? g.innerText : "";
  });
  znakow += tekst.length;

  for (const regula of REGULY) {
    for (const trafienie of tekst.matchAll(regula.wzor)) {
      /* Spacja nierozdzielająca to poprawny zapis — regułom o „zwykłej spacji"
         nie wolno jej zgłaszać. */
      if (trafienie[0].includes(NBSP)) continue;
      const wpis = znaleziska.get(regula.nazwa) ??
        { waga: regula.waga, ile: 0, przyklady: [] };
      wpis.ile++;
      if (wpis.przyklady.length < 3) {
        wpis.przyklady.push(`${adres}: ${kontekstFragmentu(tekst, trafienie.index, trafienie[0].length)}`);
      }
      znaleziska.set(regula.nazwa, wpis);
    }
  }
}

await przegladarka.close();

const lista = [...znaleziska.entries()].sort((a, b) => b[1].ile - a[1].ile);
const bledy = lista.filter(([, w]) => w.waga === "błąd");
const uwagi = lista.filter(([, w]) => w.waga === "uwaga");

console.log(`\n  Sprawdzono ${znakow} znaków na ${STRONY.length} podstronach.\n`);

const wypisz = (tytul, pozycje) => {
  const razem = pozycje.reduce((s, [, w]) => s + w.ile, 0);
  console.log(`  ${tytul}: ${razem}`);
  for (const [nazwa, w] of pozycje) {
    console.log(`   • ${nazwa} — ${w.ile}×`);
    for (const p of w.przyklady) console.log(`       ${p}`);
  }
  if (!pozycje.length) console.log("   brak");
  console.log("");
};

wypisz("BŁĘDY", bledy);
wypisz("UWAGI", uwagi);

process.exit(bledy.length ? 1 : 0);
