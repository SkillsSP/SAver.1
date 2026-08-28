/* ==========================================================================
   TYPOGRAFIA POLSKA — SIEROTKI

   Polska norma typograficzna zabrania zostawiania jednoliterowego wyrazu na
   końcu wiersza. Chodzi o spójniki i przyimki: „a", „i", „o", „u", „w", „z"
   oraz ich wersalikowe odpowiedniki. Zdanie kończące wiersz na „…z" i
   zaczynające następny od „angielskiego" czyta się z zająknięciem — oko musi
   przeskoczyć, zanim złoży wyrażenie w całość.

   ZMIERZONE PRZED WPROWADZENIEM tej poprawki, na ośmiu podstronach:
     telefon    59 sierotek na 480 złamanych wierszy — 12,3%
     tablet     34 na 248 — 13,7%
     komputer   30 na 264 — 11,4%

   Czyli mniej więcej co ósmy wiersz. To nie jest drobiazg widoczny tylko dla
   składacza: przy tekście ciągłym rodzic natyka się na to kilkanaście razy
   na jednej podstronie.

   DLACZEGO NA ETAPIE BUDOWANIA, A NIE W TREŚCI. Wpisywanie encji `&nbsp;`
   ręcznie w kilkuset miejscach jest niewykonalne i psuje czytelność plików
   źródłowych — a każdy nowy akapit wymagałby pamiętania o tym. Tutaj dzieje
   się to raz, automatycznie, na gotowym kodzie strony.

   CZEGO NIE RUSZAMY:
     · zawartości <script>, <style>, <pre> i <code> — tam spacja ma znaczenie,
       a w danych strukturalnych mogłaby zmienić treść odpowiedzi,
     · wartości atrybutów — podmiana wewnątrz znacznika popsułaby stronę,
     · pojedynczych liter, które NIE są wyrazami: „A" w „Plan A", litera przed
       kropką albo nawiasem. Warunek wymaga spacji po obu stronach.

   Uruchamiane automatycznie po `astro build` — patrz `scripts` w package.json.
   ========================================================================== */

import { readdirSync, statSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const KATALOG = process.argv[2] ?? "dist";
const NIEROZDZIELAJACA = " ";

/* Jednoliterowe wyrazy polskie. Kolejność bez znaczenia, wielkość liter obie:
   „W Szczecinie" na początku zdania jest tym samym przypadkiem co „w mieście". */
const LITERY = "aiouwzAIOUWZ";

/* Zwykła spacja po jednoliterowym wyrazie, pod warunkiem że przed nim też jest
   granica wyrazu. Nie łapiemy „Plan A." ani „(w)" — tam nie ma spacji po. */
const WZORZEC = new RegExp(`(^|[\\s(„"'—–-])([${LITERY}]) `, "g");

/* Znaczniki, w których treść jest kodem albo danymi, nie tekstem do czytania. */
const POMIJANE = new Set(["script", "style", "pre", "code", "textarea"]);

function popraw(html) {
  let wynik = "";
  let pozycja = 0;
  let pomijamy = 0;
  let zmian = 0;

  /* Idziemy po znacznikach; wszystko między nimi to tekst. Prosty podział
     wystarcza, bo pracujemy na kodzie wygenerowanym przez Astro, a nie na
     dowolnym HTML-u z internetu. */
  const znaczniki = [...html.matchAll(/<\/?([a-zA-Z][a-zA-Z0-9-]*)\b[^>]*>/g)];

  for (const zn of znaczniki) {
    const tekst = html.slice(pozycja, zn.index);
    if (pomijamy === 0 && tekst) {
      const nowy = tekst.replace(WZORZEC, (_, przed, litera) => {
        zmian++;
        return `${przed}${litera}${NIEROZDZIELAJACA}`;
      });
      wynik += nowy;
    } else {
      wynik += tekst;
    }
    wynik += zn[0];

    const nazwa = zn[1].toLowerCase();
    if (POMIJANE.has(nazwa)) {
      if (zn[0].startsWith("</")) pomijamy = Math.max(0, pomijamy - 1);
      else if (!zn[0].endsWith("/>")) pomijamy++;
    }
    pozycja = zn.index + zn[0].length;
  }
  wynik += html.slice(pozycja);
  return { wynik, zmian };
}

const pliki = [];
(function chodz(k) {
  for (const p of readdirSync(k)) {
    const pelna = path.join(k, p);
    if (statSync(pelna).isDirectory()) chodz(pelna);
    else if (p.endsWith(".html")) pliki.push(pelna);
  }
})(KATALOG);

let razem = 0;
for (const plik of pliki) {
  const przed = readFileSync(plik, "utf8");
  const { wynik, zmian } = popraw(przed);
  if (zmian) {
    writeFileSync(plik, wynik, "utf8");
    razem += zmian;
  }
}

console.log(
  `  Typografia: związano ${razem} jednoliterowych wyrazów` +
  ` z następnym słowem w ${pliki.length} plikach.`,
);
