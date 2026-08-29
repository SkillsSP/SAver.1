/* ==========================================================================
   AUDYT DOSTĘPNOŚCI SILNIKIEM axe-core

   Do tej pory sprawdzałem dostępność wyłącznie własnymi regułami: kontrast,
   nagłówki, etykiety pól, punkty orientacyjne, fokus, wysoki kontrast,
   powiększenie. To około piętnastu sprawdzeń — solidnych, bo pisanych pod
   ten konkretny serwis, ale wybranych przeze mnie.

   axe-core to biblioteka reguł utrzymywana przez Deque, używana jako
   podstawa narzędzi dostępności w przeglądarkach. Ma około stu reguł
   odwzorowujących kryteria WCAG 2.2 i — co ważniejsze — pokrywa przypadki,
   o których sam bym nie pomyślał: role ARIA użyte niezgodnie z modelem,
   atrybuty wymagane przez daną rolę, zagnieżdżenia interaktywne, tabele bez
   powiązania nagłówków z komórkami, powtórzone identyfikatory.

   NIE ZASTĘPUJE poprzednich sprawdzeń, tylko je uzupełnia. axe świadomie nie
   ocenia rzeczy niedających się rozstrzygnąć maszynowo — nie powie, czy tekst
   alternatywny opisuje zdjęcie, czy kolejność tabulatora ma sens ani czy
   nagłówki układają się w sensowny spis treści. To sprawdzają narzędzia obok.

   Uruchamiamy w OBU trybach kolorystycznych, bo reguły kontrastu liczą
   faktycznie wyrenderowane barwy.

     npm run test:axe                       (na żywej stronie)
     npm run test:axe -- http://localhost:4331
   ========================================================================== */

import { chromium } from "playwright";
import AxeBuilder from "@axe-core/playwright";

const ADRES = process.argv[2] ?? "https://skilful.pl";

const STRONY = [
  "/", "/program", "/podstawowe", "/fakultety", "/indywidualne",
  "/exams", "/exams/egzamin-osmoklasisty", "/exams/matura",
  "/cennik", "/zapisy", "/kontakt", "/o-nas", "/metoda",
  "/bezpieczenstwo", "/regulamin", "/polityka-prywatnosci", "/klauzula-rodo",
  "/terminarz", "/poradnik",
];

/* Poziomy zgodności, których wymagamy. AAA celowo pomijamy — zawiera
   kryteria w rodzaju kontrastu 7:1, których nie da się pogodzić z paletą
   marki, a normą powszechnie wymaganą jest AA. */
const ZNACZNIKI = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa", "best-practice"];

const przegladarka = await chromium.launch();
const naruszenia = new Map();
let sprawdzonych = 0;

for (const tryb of ["light", "dark"]) {
  const kontekst = await przegladarka.newContext({ colorScheme: tryb });
  const strona = await kontekst.newPage();
  await strona.addInitScript(() => {
    try { localStorage.setItem("sa-cookie-consent", "necessary"); } catch (e) {}
  });

  for (const adres of STRONY) {
    await strona.goto(ADRES + adres, { waitUntil: "domcontentloaded" });
    sprawdzonych++;
    const wynik = await new AxeBuilder({ page: strona }).withTags(ZNACZNIKI).analyze();

    for (const n of wynik.violations) {
      const klucz = `${n.id} · ${n.impact}`;
      const wpis = naruszenia.get(klucz) ?? {
        opis: n.help, pomoc: n.helpUrl, wystapien: 0, gdzie: new Set(), przyklad: "",
      };
      wpis.wystapien += n.nodes.length;
      wpis.gdzie.add(`${adres} [${tryb === "dark" ? "ciemny" : "jasny"}]`);
      if (!wpis.przyklad && n.nodes[0]) wpis.przyklad = n.nodes[0].html.slice(0, 110);
      naruszenia.set(klucz, wpis);
    }
  }
  await kontekst.close();
}

await przegladarka.close();

const KOLEJNOSC = { critical: 0, serious: 1, moderate: 2, minor: 3 };
const posortowane = [...naruszenia.entries()].sort(
  (a, b) => (KOLEJNOSC[a[0].split(" · ")[1]] ?? 9) - (KOLEJNOSC[b[0].split(" · ")[1]] ?? 9));

console.log(`\n  axe-core ${ZNACZNIKI.length} zestawów reguł · ${STRONY.length} stron × 2 tryby` +
  ` · ${sprawdzonych} sprawdzeń`);
console.log(`\n  NARUSZENIA: ${posortowane.length} rodzajów`);
for (const [klucz, w] of posortowane) {
  console.log(`\n   ✗ ${klucz} — ${w.wystapien} wystąpień na ${w.gdzie.size} stronach`);
  console.log(`     ${w.opis}`);
  console.log(`     przykład: ${w.przyklad}`);
  console.log(`     opis reguły: ${w.pomoc.split("?")[0]}`);
}
if (!posortowane.length) console.log("   brak\n");
process.exit(posortowane.length ? 1 : 0);
