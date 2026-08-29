/* ==========================================================================
   TYPOGRAFIA POLSKA — SIEROTKI I JEDNOSTKI

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

   DRUGA REGUŁA: LICZBA I JEDNOSTKA. „200 zł" złamane po liczbie zmusza oko do
   szukania waluty w następnym wierszu, a przy cenie jest to moment, w którym
   rodzic akurat czyta uważnie. Tak samo „45 min", „19 lat", „2 godz".
   Skrypt sprawdzający typografię (narzedzia/test-typografia.mjs) znalazł na
   żywej stronie 24 takie miejsca — wszystkie w cenniku, w opisach wieku
   i w długościach zajęć, czyli dokładnie tam, gdzie boli najbardziej.

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

/* Jednostki, które nie mają prawa oderwać się od swojej liczby. Lista jest
   krótka i konkretna — wiązanie wszystkiego, co stoi po cyfrze, zamieniłoby
   tekst w jeden nierozrywalny blok i popsułoby łamanie wierszy na telefonie. */
const JEDNOSTKI = "zł|min|godz|godzin|godziny|h|lat|lata|roku|rok|osób|os|kl|%";
/* Ukośniki są podwojone celowo: w szablonie znakowym `\d` znaczy po prostu
   literę „d", więc wzorzec bez podwojenia nie łapałby ani jednej cyfry. */
const WZORZEC_JEDNOSTKA = new RegExp(`(\\d) (${JEDNOSTKI})\\b`, "g");

/* Znaczniki, w których treść jest kodem albo danymi, nie tekstem do czytania. */
const POMIJANE = new Set(["script", "style", "pre", "code", "textarea"]);

function popraw(html) {
  let wynik = "";
  let pozycja = 0;
  let pomijamy = 0;
  let zmian = 0;
  let zmianJednostek = 0;

  /* Idziemy po znacznikach; wszystko między nimi to tekst. Prosty podział
     wystarcza, bo pracujemy na kodzie wygenerowanym przez Astro, a nie na
     dowolnym HTML-u z internetu. */
  const znaczniki = [...html.matchAll(/<\/?([a-zA-Z][a-zA-Z0-9-]*)\b[^>]*>/g)];

  for (const zn of znaczniki) {
    const tekst = html.slice(pozycja, zn.index);
    if (pomijamy === 0 && tekst) {
      let nowy = tekst.replace(WZORZEC, (_, przed, litera) => {
        zmian++;
        return `${przed}${litera}${NIEROZDZIELAJACA}`;
      });
      nowy = nowy.replace(WZORZEC_JEDNOSTKA, (_, cyfra, jednostka) => {
        zmianJednostek++;
        return `${cyfra}${NIEROZDZIELAJACA}${jednostka}`;
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
  return { wynik, zmian, zmianJednostek };
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
let razemJednostek = 0;
for (const plik of pliki) {
  const przed = readFileSync(plik, "utf8");
  const { wynik, zmian, zmianJednostek } = popraw(przed);
  if (zmian || zmianJednostek) {
    writeFileSync(plik, wynik, "utf8");
    razem += zmian;
    razemJednostek += zmianJednostek;
  }
}

console.log(
  `  Typografia: związano ${razem} jednoliterowych wyrazów z następnym słowem` +
  ` i ${razemJednostek} liczb z jednostką, w ${pliki.length} plikach.`,
);
