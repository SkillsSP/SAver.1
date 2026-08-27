/* ==========================================================================
   SZEROKOŚĆ POŚREDNIA 1200 px

   Do niedawna każde zdjęcie istniało w dwóch szerokościach: 800 i 1600 px.
   Między nimi jest luka, przez którą telefony przepłacają. Kafel na stronie
   głównej pokazuje się na 340 px szerokości, ale ekran iPhone'a ma trzy
   fizyczne piksele na jeden logiczny, więc przeglądarka potrzebuje około
   1020 px. Wersja 800 jest za mała, więc bierze 1600 — czyli o połowę za
   dużo danych. Zmierzone: strona główna ważyła przez to 1064 kB.

   Szerokość 1200 px zamyka tę lukę i mieści się dokładnie tam, gdzie trzeba.

   DLACZEGO OSOBNY SKRYPT, A NIE `zdjecia.mjs`. Tamten liczy wszystko od
   zdjęć źródłowych z aparatu, a te zostały usunięte z dysku po pierwszym
   przetworzeniu — katalog `zdjęcia/` jest pusty. Ten skrypt wychodzi więc
   od gotowych plików 1600 px.

   Oznacza to ponowne kodowanie stratnego formatu ze stratnego, czego przy
   zdjęciach źródłowych nigdy by się nie robiło. Tutaj jest to bezpieczne
   i warto wiedzieć dlaczego: zmniejszenie o jedną czwartą uśrednia sąsiednie
   piksele, więc drobne artefakty pierwszego kodowania rozmywają się zamiast
   nakładać. Efekt oglądany jest przy 340 px szerokości, czyli przy trzykrotnym
   pomniejszeniu względem pliku.

   Gdy wrócą zdjęcia źródłowe, tego skryptu nie należy używać — wystarczy
   uruchomić `zdjecia.mjs`, który ma już 1200 px na liście szerokości.

     node narzedzia/foto-szerokosc-posrednia.mjs
   ========================================================================== */

import sharp from "sharp";
import { readdirSync, existsSync, statSync } from "node:fs";
import path from "node:path";

const KATALOG = "public/foto";
const SZEROKOSC = 1200;
/* Ta sama jakość, co w `zdjecia.mjs` — inaczej pliki pośrednie odstawałyby
   wyglądem od sąsiednich szerokości. */
const JAKOSC = 72;

const zrodla = readdirSync(KATALOG).filter((p) => p.endsWith("-1600.webp"));
if (zrodla.length === 0) {
  console.error("Nie znalazłem żadnego pliku 1600 px w " + KATALOG);
  process.exit(1);
}

let zrobione = 0;
let pominiete = 0;
let bylo = 0;
let jest = 0;

for (const plik of zrodla) {
  const nazwa = plik.replace("-1600.webp", "");
  const cel = path.join(KATALOG, `${nazwa}-${SZEROKOSC}.webp`);
  const zrodlo = path.join(KATALOG, plik);

  if (existsSync(cel)) {
    pominiete++;
    continue;
  }

  const meta = await sharp(zrodlo).metadata();
  /* Zdjęcie węższe od docelowej szerokości zostawiamy w spokoju —
     powiększanie tylko dodałoby wagi bez zysku na ostrości. */
  if (meta.width <= SZEROKOSC) {
    console.log(`  ${nazwa.padEnd(28)} pominięte, źródło ma ${meta.width}px`);
    pominiete++;
    continue;
  }

  await sharp(zrodlo)
    .resize({ width: SZEROKOSC, withoutEnlargement: true })
    .webp({ quality: JAKOSC })
    .toFile(cel);

  const przed = statSync(zrodlo).size;
  const po = statSync(cel).size;
  bylo += przed;
  jest += po;
  zrobione++;
  console.log(
    `  ${nazwa.padEnd(28)} ${String(Math.round(przed / 1024)).padStart(4)} kB → ` +
    `${String(Math.round(po / 1024)).padStart(4)} kB`,
  );
}

console.log(
  `\n  Utworzono ${zrobione} plików, pominięto ${pominiete}.` +
  (zrobione
    ? `\n  Na tych zdjęciach: ${Math.round(bylo / 1024)} kB → ${Math.round(jest / 1024)} kB` +
      ` (${Math.round((1 - jest / bylo) * 100)}% mniej).`
    : ""),
);
console.log(
  "\n  Pamiętajcie dopisać `1200w` do atrybutów srcset — bez tego przeglądarka" +
  "\n  nawet nie dowie się, że nowe pliki istnieją.\n",
);
