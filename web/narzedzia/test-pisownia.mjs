/* ==========================================================================
   SPRAWDZANIE POLSKIEJ PISOWNI

   Na stronie jest blisko pięć tysięcy słów napisanych w kilkanaście godzin
   i do tej pory ani jedno nie zostało sprawdzone pod kątem literówki.
   Literówka na stronie centrum edukacyjnego dla dzieci kosztuje wiarygodność
   bardziej niż gdziekolwiek indziej: rodzic, który ją zauważy, zaczyna się
   zastanawiać, co jeszcze zrobiono niestarannie.

   Sprawdzamy treść wyrenderowaną, a nie pliki źródłowe — dzięki temu do
   sprawdzenia trafia dokładnie to, co czyta rodzic, razem z tekstem
   składanym z danych.

   SŁOWNIK NIE JEST WYROCZNIĄ. Zna polszczyznę ogólną, nie zna nazw własnych
   marki, angielskich nazw programów ani terminów, których używamy świadomie.
   Dlatego niżej stoi lista wyjątków — ma być KRÓTKA i każdy wpis ma być
   uzasadniony. Dopisywanie do niej wszystkiego, co skrypt zgłosi, zamienia
   to narzędzie w ozdobę.

     npm run test:pisownia                     (na żywej stronie)
     npm run test:pisownia -- http://localhost:4331
   ========================================================================== */

import { chromium } from "playwright";
import nspell from "nspell";
import slownik from "dictionary-pl";

const ADRES = process.argv[2] ?? "https://skilful.pl";

const STRONY = [
  "/", "/program", "/podstawowe", "/fakultety", "/indywidualne",
  "/exams", "/exams/egzamin-osmoklasisty", "/exams/matura",
  "/cennik", "/zapisy", "/kontakt", "/o-nas", "/metoda",
  "/bezpieczenstwo", "/regulamin", "/polityka-prywatnosci", "/klauzula-rodo",
  "/terminarz", "/poradnik", "/404",
];

/* Wyjątki. Każdy wpis to świadoma decyzja, nie zamiatanie zgłoszenia. */
const ZNANE = new Set([
  /* nazwa własna i jej odmiana */
  "skills", "academy", "skilful",
  /* nazwy programów — celowo po angielsku, tak brzmią w ofercie */
  "useful", "life", "music", "art", "acting", "motion", "kids", "teens",
  "junior", "senior", "exams",
  /* instytucje i skróty urzędowe */
  "cke", "rodo", "uokik", "nip", "regon", "oecd", "unesco", "unicef", "who",
  "eef", "ovh", "umami",
  /* terminy metodyczne używane w aneksie naukowym */
  "tpr", "pbl", "metaanaliza", "metaanalizy", "metaanaliz",
  /* imiona i nazwiska zespołu */
  "karolina", "kamil", "natalia", "dumała", "marczewska",
  "patryk", "moltu",
  /* miasto i przymiotnik od niego */
  "szczecin", "szczecinie",
  /* Poprawna polszczyzna, której ten słownik nie zna. Sprawdzone po
     pierwszym przebiegu: na 5627 wyrazów zgłosił dokładnie te sześć i ani
     jedno nie było literówką.
     „ustrukturyzowana" — termin z literatury pedagogicznej,
     „społeczno" — pierwszy człon złożenia „społeczno-emocjonalny", który
        powstaje przy dzieleniu wyrazu na części po łączniku,
     „zdawalność" — termin oświatowy, w słowniku ogólnym go brak,
     „minigrupa" — regularne złożenie z przedrostkiem „mini". */
  "ustrukturyzowana", "ustrukturyzowane", "ustrukturyzowany",
  "społeczno", "zdawalności", "zdawalność",
  "minigrupa", "minigrupy", "minigrupę", "minigrup", "minigrupach",
  /* Doszły z dokumentami prawnymi i z przygotowania pod Google Ads.
     „współadministratorami" — termin z art. 26 rozporządzenia, poprawna
        polszczyzna, której słownik ogólny nie zna,
     „remarketingu" — przyjęty termin marketingowy,
     „analytics", „ads", „privacy", „framework" — człony nazw własnych:
        Google Analytics, Google Ads, Data Privacy Framework. */
  "współadministratorami", "współadministrator", "współadministratorzy",
  "remarketing", "remarketingu",
  "analytics", "ads", "privacy", "framework",
]);

const przegladarka = await chromium.launch();
const kontekst = await przegladarka.newContext({ viewport: { width: 1280, height: 900 } });
const strona = await kontekst.newPage();
await strona.addInitScript(() => {
  try { localStorage.setItem("sa-cookie-consent", "necessary"); } catch (e) {}
});

const sprawdzacz = nspell(slownik);
const podejrzane = new Map();
let slowRazem = 0;

for (const adres of STRONY) {
  const odp = await strona.goto(ADRES + adres, { waitUntil: "domcontentloaded" }).catch(() => null);
  if (!odp || !odp.ok()) continue;

  const tekst = await strona.evaluate(() => {
    const glowna = document.querySelector("main");
    return glowna ? glowna.innerText : "";
  });

  /* Dzielimy na wyrazy, zostawiając polskie litery i myślnik wewnątrz wyrazu.
     Cyfry, adresy i skróty z kropkami odpadają same. */
  for (const dopasowanie of tekst.matchAll(/[\p{L}][\p{L}‐-―-]*/gu)) {
    const wyraz = dopasowanie[0];
    /* Wyrazy z łącznikiem sprawdzamy w częściach — słownik nie zna złożeń. */
    for (const czesc of wyraz.split(/[‐-―-]/)) {
      if (czesc.length < 3) continue;
      slowRazem++;
      const male = czesc.toLocaleLowerCase("pl");
      if (ZNANE.has(male)) continue;
      if (sprawdzacz.correct(czesc) || sprawdzacz.correct(male)) continue;
      const wpis = podejrzane.get(male) ?? { ile: 0, gdzie: new Set() };
      wpis.ile++;
      wpis.gdzie.add(adres);
      podejrzane.set(male, wpis);
    }
  }
}

await przegladarka.close();

const lista = [...podejrzane.entries()].sort((a, b) => b[1].ile - a[1].ile);

console.log(`\n  Sprawdzono ${slowRazem} wyrazów na ${STRONY.length} podstronach.`);
console.log(`\n  DO SPRAWDZENIA: ${lista.length} różnych wyrazów`);
for (const [wyraz, w] of lista) {
  const podpowiedzi = sprawdzacz.suggest(wyraz).slice(0, 3);
  console.log(`   ? ${wyraz}  (${w.ile}×, ${[...w.gdzie].slice(0, 2).join(", ")})` +
    (podpowiedzi.length ? `  → może: ${podpowiedzi.join(", ")}` : ""));
}
console.log("");
/* Nie przerywamy budowania — słownik nie jest wyrocznią i zgłasza też wyrazy
   poprawne, których po prostu nie zna. To lista do przejrzenia okiem. */
