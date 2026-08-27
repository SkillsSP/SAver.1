/* ==========================================================================
   PRZYGOTOWANIE ZDJĘĆ DO SERWISU

   Pliki źródłowe w ../zdjęcia/ to materiał aparatowy — pojedyncze ujęcie waży
   od 1 do 25 MB, cały katalog 629 MB. Do serwisu idzie WebP w dwóch
   szerokościach (800, 1200 i 1600 px), co schodzi do ok. 35–200 kB na plik.

   Wybór jest ręczny, nie hurtowy. Powody odrzuceń są opisane przy każdym
   pominiętym ujęciu na dole pliku — chodzi o to, żeby przy następnej zmianie
   nikt nie wrzucił ich z powrotem „bo były w folderze".

   Uruchomienie:  node narzedzia/zdjecia.mjs
   ========================================================================== */

import sharp from "sharp";
import { mkdir, readdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";

const ZRODLO = path.resolve("../zdjęcia");
const CEL = path.resolve("public/zdjecia");
/* Trzy szerokości, nie dwie. Między 800 a 1600 jest luka, przez którą
   telefony o gęstym ekranie przepłacają: kafel pokazywany na 340 px logicznych
   potrzebuje około 1020 px fizycznych, więc bierze 1600 zamiast 800. Zmierzone
   na stronie głównej: 1064 kB, z czego 810 kB to same zdjęcia. */
const SZEROKOSCI = [800, 1200, 1600];
const JAKOSC = 78;

/* Klucz = nazwa pliku wyjściowego, wartość = ścieżka źródłowa i opis alternatywny.
   Opis alternatywny piszemy tu, a nie w komponencie, żeby zdjęcie i jego opis
   nie rozjechały się przy podmianie. */
const WYBOR = {
  // Fakultety — po jednym ujęciu na kartę
  "fakultet-music": {
    plik: "music/side-view-kids-singing-sunday-school.jpg",
    alt: "Grupa dzieci śpiewa razem podczas zajęć",
  },
  "fakultet-art": {
    plik: "art/blonde-boy-sitting-near-classmates-modeling-clay-animals.jpg",
    alt: "Chłopiec lepi figurki z gliny przy stole z innymi dziećmi",
  },
  "fakultet-acting": {
    plik: "acting/children-participating-classroom-theater-activity.jpg",
    alt: "Dzieci odgrywają scenkę teatralną w sali",
  },
  "fakultet-motion": {
    plik: "motion/children-stretching-colorful-parachute-fun-team-games.jpg",
    alt: "Dzieci rozciągają kolorową chustę animacyjną we wspólnej zabawie ruchowej",
  },

  // Zajęcia podstawowe — najważniejsze zdjęcie serwisu: dzieci przy zadaniu
  "podstawowe-glowne": {
    plik:
      "life skills/education-children-technology-science-people-concept-group-happy-kids-building-robots-l-robotics-lesson-holding-hands-together.jpg",
    alt: "Dzieci pracują w drużynie nad wspólnym zadaniem technicznym",
  },
  "podstawowe-life": {
    plik:
      "life skills/classroom-with-students-learning-cpr-dummies-highly-detailed-realworld-shot.jpg",
    alt: "Dzieci ćwiczą pierwszą pomoc na fantomach podczas zajęć",
  },
  "podstawowe-useful": {
    plik:
      "life skills/children-construction-diy-workshop-with-tools-play-game-kitchen-home-girls-hammer-safety-glasses-wood-project-building-carpentry-woodworking-manufacture.jpg",
    alt: "Dziewczynki w okularach ochronnych pracują przy warsztacie stolarskim",
  },

  // Exams
  "exams-e8": {
    plik: "exam/student-doing-test-exam.jpg",
    alt: "Uczeń rozwiązuje arkusz egzaminacyjny",
  },

  // Zajęcia indywidualne — jeden dorosły, jedno dziecko, spokojne otoczenie
  "indywidualne-glowne": {
    plik: "life skills/young-woman-doing-speech-therapy-with-little-blonde-boy.jpg",
    alt: "Prowadząca pracuje indywidualnie z chłopcem przy stole",
  },

  // O nas i strona główna — miejsce, ludzie, efekt
  "lokal-sala": {
    plik: "life skills/medium-shot-kids-spending-time-school.jpg",
    alt: "Dzieci spędzają czas w sali zajęciowej",
  },
  "dzieci-w-dzialaniu": {
    plik: "life skills/kids-looking-globe-school.jpg",
    alt: "Dzieci pochylone nad globusem podczas zajęć",
  },
  "bezpieczenstwo-pierwsza-pomoc": {
    plik: "life skills/policeman-crouching-front-pedestrian-explains-group-school-children-how-cross.jpg",
    alt: "Policjant tłumaczy grupie dzieci zasady bezpiecznego przechodzenia przez jezdnię",
  },
};

/* ODRZUCONE ŚWIADOMIE — nie wrzucać z powrotem:

   exam/high-angle-kid-cheating-school-test.jpg
     Dziecko ściągające na sprawdzianie. Na stronie o przygotowaniu do egzaminu
     działa wprost przeciwko ofercie.

   acting/funny-children-wearing-costumes-halloween-celebration-indoors...
   acting/little-girls-are-performing-dance-number-dance-helovinna-red-suits.jpg
   art/cute-children-with-pumpkins-halloween-concept.jpg
   cooking/mother-her-daughter-paint-halloween-cookies.jpg
     Halloween. Zdjęcie przypisane do jednego święta zestarzeje się co roku
     i zawęża odbiór — a marka nie prowadzi zajęć tematycznych.

   art/children-paint-eggs-mother-teaches-children-sitting-white-table.jpg
   art/cute-blond-little-boy-cutting-paper-easter-card...
     Wielkanoc, ten sam problem co wyżej.

   art/high-angle-people-making-banners-protest.jpg
     Transparenty protestacyjne. Skojarzenie polityczne, nie plastyczne.

   life skills/mother-taking-care-child-with-head-lices.jpg
     Wszawica. Temat higieniczny, ale na stronie ofertowej odpycha.

   life skills/lviv-ukraine-july-172018-families-with-kids-walking-by-park...
     Zdjęcie reportażowe z podpisem miejsca i daty, nie pasuje do zajęć.
*/

async function main() {
  if (!existsSync(ZRODLO)) {
    console.error("Nie znaleziono katalogu źródłowego:", ZRODLO);
    process.exit(1);
  }
  await mkdir(CEL, { recursive: true });

  let razem = 0;
  for (const [nazwa, { plik }] of Object.entries(WYBOR)) {
    const wejscie = path.join(ZRODLO, plik);
    if (!existsSync(wejscie)) {
      console.error("  BRAK PLIKU:", plik);
      continue;
    }
    const meta = await sharp(wejscie).metadata();
    for (const w of SZEROKOSCI) {
      const wyjscie = path.join(CEL, `${nazwa}-${w}.webp`);
      await sharp(wejscie)
        .rotate() // uwzględnia orientację z EXIF, inaczej część ujęć leży na boku
        .resize({ width: w, withoutEnlargement: true })
        .webp({ quality: JAKOSC })
        .toFile(wyjscie);
      razem++;
    }
    console.log(
      `  ${nazwa.padEnd(30)} ${String(meta.width).padStart(5)}×${meta.height} → 800 i 1600 px`
    );
  }
  console.log(`\nZapisano ${razem} plików w public/zdjecia/`);
}

main();
