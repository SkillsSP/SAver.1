/* ==========================================================================
   OGRANICZENIE KROJÓW PISMA DO ZNAKÓW, KTÓRYCH UŻYWAMY

   Kroje pobrane z Google Fonts niosą pełny zestaw łaciński rozszerzony —
   około 690 znaków na plik, w tym alfabety wietnamski, turecki i litewski.
   Serwis po polsku używa ich 111. Reszta jedzie przez łącze rodzica przy
   każdym wejściu i nigdy się nie pokazuje.

   Siedem plików razy około 30 kB daje 174 kB na każdą podstronę — więcej niż
   arkusz stylów i kod strony razem wzięte.

   ZESTAW ZNAKÓW JEST CELOWO SZERSZY NIŻ POTRZEBA DZIŚ. Ograniczenie dokładnie
   do 111 znalezionych znaków byłoby oszczędnością pozorną i niebezpieczną:
   pierwsze nazwisko z „Ą" w opinii rodzica albo nagłówek zaczynający się od
   „Ę" wypadłby zastępczym krojem i to w miejscu widocznym. Dlatego bierzemy
   całą łacinę podstawową, komplet polskich liter w obu wielkościach oraz
   typografię, która może się przydać — cudzysłowy, myślniki, symbol waluty.
   Zapas kosztuje kilkaset bajtów, brak zapasu kosztuje wygląd strony.

   Oryginały odkładamy do `fonty-zrodlowe/` — poza `public/`, żeby nie
   pojechały na serwer razem z ograniczonymi. Stamtąd da się wrócić bez
   pobierania ich na nowo.

     node narzedzia/fonty-ogranicz.mjs
   ========================================================================== */

import { execFileSync } from "node:child_process";
import { readdirSync, mkdirSync, existsSync, copyFileSync, statSync } from "node:fs";
import path from "node:path";

const KATALOG = "public/fonts";
/* Kopia zapasowa MUSI stać poza `public/`. Wszystko z tamtego katalogu Astro
   kopiuje żywcem do gotowego serwisu, więc oryginały wyjechałyby na serwer
   razem z ograniczonymi — 204 kB martwego balastu przy każdym wdrożeniu,
   dokładnie odwrotnie do celu tego skryptu. */
const KOPIA = "fonty-zrodlowe";

/* --- Zestaw znaków ------------------------------------------------------ */
const zakres = (od, do_) => {
  const out = [];
  for (let i = od; i <= do_; i++) out.push(String.fromCodePoint(i));
  return out;
};

const ZNAKI = [
  /* Łacina podstawowa: cyfry, wielkie i małe litery, cała interpunkcja
     dostępna z klawiatury. */
  ...zakres(0x20, 0x7e),

  /* Polskie znaki diakrytyczne, obie wielkości. */
  ...[..."ąćęłńóśźżĄĆĘŁŃÓŚŹŻ"],

  /* Typografia, której serwis używa albo może użyć. Cudzysłowy polskie
     otwierający i zamykający, apostrof, wielokropek, myślniki, znak mnożenia
     przy wymiarach, kropka środkowa jako separator, strzałki, symbol
     praw autorskich i waluty. */
  ...[..."„”‚’«»…–—−·•×÷±°§©®™→←↑↓‹›€zł"],

  /* Znak spacji nierozdzielającej — trzyma „5 osób" w jednym wierszu. */
  " ",
];

const unikaty = [...new Set(ZNAKI)].filter((c) => c.codePointAt(0) >= 0x20);
const unicodes = unikaty
  .map((c) => "U+" + c.codePointAt(0).toString(16).toUpperCase().padStart(4, "0"))
  .join(",");

console.log(`  Zestaw docelowy: ${unikaty.length} znaków.\n`);

/* --- Przetwarzanie ------------------------------------------------------ */
if (!existsSync(KOPIA)) mkdirSync(KOPIA, { recursive: true });

const pliki = readdirSync(KATALOG).filter((p) => p.endsWith(".woff2"));
if (pliki.length === 0) {
  console.error("Nie znalazłem żadnego pliku .woff2 w " + KATALOG);
  process.exit(1);
}

let bylo = 0;
let jest = 0;

for (const plik of pliki) {
  const zrodlo = path.join(KATALOG, plik);
  const zapas = path.join(KOPIA, plik);

  /* Pierwsze uruchomienie odkłada oryginał. Kolejne wychodzą już z zapasu,
     żeby nie ograniczać pliku raz ograniczonego — to by go stopniowo
     zubażało przy każdym przebiegu. */
  if (!existsSync(zapas)) copyFileSync(zrodlo, zapas);

  const przed = statSync(zapas).size;

  /* Zapisujemy wprost pod docelową nazwą, bez pliku pośredniego i zmiany
     nazwy. Windows potrafi odmówić przemianowania pliku, który przed chwilą
     czytał serwer podglądu albo program antywirusowy — a że źródłem jest
     kopia w podkatalogu, nadpisanie w miejscu niczego nie traci. */
  execFileSync("python", [
    "-m", "fontTools.subset", zapas,
    `--unicodes=${unicodes}`,
    "--flavor=woff2",
    "--layout-features=kern,liga,calt",
    `--output-file=${zrodlo}`,
  ], { stdio: "pipe" });
  const po = statSync(zrodlo).size;
  bylo += przed;
  jest += po;
  console.log(
    `  ${plik.padEnd(28)} ${String(Math.round(przed / 1024)).padStart(3)} kB → ` +
    `${String(Math.round(po / 1024)).padStart(3)} kB`,
  );
}

console.log(
  `\n  Razem ${Math.round(bylo / 1024)} kB → ${Math.round(jest / 1024)} kB` +
  ` (${Math.round((1 - jest / bylo) * 100)}% mniej na każdej podstronie).`,
);
console.log(`  Oryginały leżą w ${KOPIA} — stamtąd da się wrócić.\n`);
