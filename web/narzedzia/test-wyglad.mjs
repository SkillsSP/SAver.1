/* ==========================================================================
   PORÓWNANIE WYGLĄDU MIĘDZY WERSJAMI

   Dwa razy w ciągu tygodnia zepsułem coś, naprawiając co innego: raz skleiłem
   z powrotem dwie sekcje przy przenoszeniu selektora wieku, raz odebrałem
   nazwę marce w stopce przy poprawianiu jej brzmienia dla czytnika ekranu.
   Oba złapałem przypadkiem — bo akurat patrzyłem w to miejsce.

   To narzędzie łapie takie rzeczy samo. Robi zrzut każdej podstrony w obu
   trybach i na dwóch szerokościach, a przy kolejnym uruchomieniu porównuje
   go z zapisanym wzorcem piksel po pikselu. Nie ocenia, czy zmiana jest
   dobra — mówi tylko, GDZIE coś się zmieniło, żeby dało się to obejrzeć
   świadomie zamiast odkrywać przypadkiem.

   PIERWSZE URUCHOMIENIE zapisuje wzorce i nic nie porównuje. Kolejne
   porównują. Po świadomej zmianie wyglądu trzeba wzorce odświeżyć:

     npm run test:wyglad -- --zapisz

   Wzorce leżą w `wzorce-wygladu/` i NIE trafiają do repozytorium — to setki
   obrazów, które przy każdej zmianie stylu byłyby podmieniane w całości.
   Porównanie ma sens lokalnie, przed wysłaniem zmian.

   PRÓG TOLERANCJI. Zrzuty tej samej strony nigdy nie są identyczne co do
   piksela: zdjęcia dekodują się minimalnie inaczej, a wygładzanie czcionek
   zależy od obciążenia maszyny. Dlatego liczy się udział zmienionych pikseli,
   a nie ich obecność. Poniżej jednej dziesiątej procenta to szum.

     npm run test:wyglad                      (na żywej stronie)
     npm run test:wyglad -- http://localhost:4331
   ========================================================================== */

import { chromium, devices } from "playwright";
import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync } from "node:fs";
import path from "node:path";
import { PNG } from "pngjs";
import pixelmatch from "pixelmatch";

const argumenty = process.argv.slice(2);
const ZAPISZ = argumenty.includes("--zapisz");
const ADRES = argumenty.find((a) => a.startsWith("http")) ?? "https://skilful.pl";

const KATALOG = "wzorce-wygladu";
const PROG = 0.001; /* jedna dziesiąta procenta zmienionych pikseli */

const STRONY = [
  "/", "/program", "/podstawowe", "/fakultety", "/indywidualne",
  "/exams", "/exams/egzamin-osmoklasisty", "/exams/matura",
  "/cennik", "/zapisy", "/kontakt", "/o-nas", "/metoda",
  "/bezpieczenstwo", "/terminarz", "/poradnik",
];

const WIDOKI = [
  ["telefon", { ...devices["iPhone 13"] }],
  ["komputer", { viewport: { width: 1280, height: 900 } }],
];

if (!existsSync(KATALOG)) mkdirSync(KATALOG, { recursive: true });

const nazwaPliku = (adres, widok, tryb) =>
  path.join(KATALOG, `${adres.replace(/\//g, "_") || "_"}--${widok}--${tryb}.png`);

const przegladarka = await chromium.launch();
const zmiany = [];
let porownanych = 0;
let zapisanych = 0;

for (const [widok, ustawienia] of WIDOKI) {
  for (const tryb of ["light", "dark"]) {
    const kontekst = await przegladarka.newContext({ ...ustawienia, colorScheme: tryb });
    const strona = await kontekst.newPage();
    await strona.addInitScript(() => {
      try { localStorage.setItem("sa-cookie-consent", "necessary"); } catch (e) {}
    });

    for (const adres of STRONY) {
      const odp = await strona.goto(ADRES + adres, { waitUntil: "networkidle" }).catch(() => null);
      if (!odp || !odp.ok()) continue;

      /* PRZEWINIĘCIE CAŁEJ STRONY PRZED ZRZUTEM — bez tego narzędzie szumi.
         Zrzut całej strony sam ją przewija, a zdjęcia ładowane leniwie
         dochodzą przy tym za każdym razem w innym momencie. Pierwsza wersja
         tego skryptu zgłaszała przez to dziewięć „różnic" przy dwóch
         przebiegach na NIEZMIENIONEJ stronie, w tym jedną na trzy procent
         powierzchni.

         Przewijamy więc do końca, czekamy na dociągnięcie wszystkiego,
         wracamy na górę i dopiero wtedy robimy zrzut. */
      await strona.evaluate(async () => {
        const krok = window.innerHeight;
        for (let y = 0; y < document.body.scrollHeight; y += krok) {
          window.scrollTo(0, y);
          await new Promise((r) => setTimeout(r, 60));
        }
        window.scrollTo(0, 0);
      });
      await strona.waitForLoadState("networkidle").catch(() => {});

      /* CZEKAMY NA DEKODOWANIE KAŻDEGO OBRAZKA, nie na upływ czasu.
         Sam „networkidle" mówi tylko, że pliki się ściągnęły — nie, że
         przeglądarka zdążyła je rozpakować i narysować. Przy pierwszym
         podejściu zostawało przez to cztery fałszywe różnice, wszystkie
         w jednym kaflu galerii, który akurat nie zdążył. `decode()` czeka
         dokładnie na to, na co trzeba. */
      await strona.evaluate(async () => {
        const obrazki = [...document.querySelectorAll("img")];
        await Promise.all(obrazki.map((i) =>
          i.decode ? i.decode().catch(() => {}) : Promise.resolve()));
      });
      /* Wyłączamy animacje i migający kursor w polach — to jedyne elementy,
         które zmieniają się same z upływem czasu. */
      await strona.addStyleTag({
        content: `*, *::before, *::after { animation: none !important;
                  transition: none !important; caret-color: transparent !important; }`,
      });
      await strona.waitForTimeout(400);

      const swiezy = await strona.screenshot({ fullPage: true });
      const plik = nazwaPliku(adres, widok, tryb);

      if (ZAPISZ || !existsSync(plik)) {
        writeFileSync(plik, swiezy);
        zapisanych++;
        continue;
      }

      const wzorzec = PNG.sync.read(readFileSync(plik));
      const nowy = PNG.sync.read(swiezy);

      if (wzorzec.width !== nowy.width || wzorzec.height !== nowy.height) {
        zmiany.push(`${adres} [${widok}, ${tryb}] — zmieniła się WYSOKOŚĆ strony:` +
          ` ${wzorzec.height} → ${nowy.height} px`);
        porownanych++;
        continue;
      }

      const roznica = new PNG({ width: nowy.width, height: nowy.height });
      const pikseli = pixelmatch(wzorzec.data, nowy.data, roznica.data,
        nowy.width, nowy.height, { threshold: 0.12 });
      porownanych++;

      const udzial = pikseli / (nowy.width * nowy.height);
      if (udzial > PROG) {
        const plikRoznicy = plik.replace(/\.png$/, "--roznica.png");
        writeFileSync(plikRoznicy, PNG.sync.write(roznica));
        zmiany.push(`${adres} [${widok}, ${tryb}] — ${(udzial * 100).toFixed(2)}%` +
          ` pikseli inne (${pikseli}); podgląd różnicy: ${plikRoznicy}`);
      }
    }
    await kontekst.close();
  }
}

await przegladarka.close();

if (zapisanych) {
  console.log(`\n  Zapisano ${zapisanych} wzorców do ${KATALOG}/.`);
  if (!porownanych) {
    console.log("  Przy kolejnym uruchomieniu porównam z nimi obecny wygląd.\n");
    process.exit(0);
  }
}

console.log(`\n  Porównano ${porownanych} widoków` +
  ` (${STRONY.length} stron × ${WIDOKI.length} szerokości × 2 tryby).`);
console.log(`\n  RÓŻNICE: ${zmiany.length}`);
for (const z of zmiany) console.log(`   ✗ ${z}`);
if (!zmiany.length) console.log("   brak — wygląd bez zmian względem wzorców");
console.log("\n  Różnica nie znaczy „błąd\". Znaczy „obejrzyj to świadomie”." +
  "\n  Po zaakceptowaniu zmiany odśwież wzorce: npm run test:wyglad -- --zapisz\n");
process.exit(zmiany.length ? 1 : 0);
