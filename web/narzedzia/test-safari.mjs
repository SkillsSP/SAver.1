/* ==========================================================================
   TEST W SILNIKU SAFARI (WebKit)

   Pozostałe testy w tym katalogu chodzą na Chromium z emulacją urządzeń.
   Emulacja podmienia rozmiar ekranu, sposób wskazywania i nagłówek
   przeglądarki, ale NIE podmienia silnika — a to on decyduje o tym, jak
   liczony jest układ i jak zachowują się pola formularza.

   Dlatego przy każdym poprzednim raporcie musiałem dopisywać zastrzeżenie:
   „sprawdzone w Chromium, nie w Safari na fizycznym iPhonie". Ten test to
   zastrzeżenie zdejmuje — Playwright potrafi uruchomić prawdziwy WebKit,
   ten sam silnik, który napędza Safari.

   CZEGO SZUKAMY. Rzeczy, które historycznie różnią się między silnikami:

     · przewijanie w bok — WebKit inaczej liczy szerokość elementów
       w siatkach i potrafi wypchnąć stronę tam, gdzie Chromium nie wypycha,
     · pasek akcji przyklejony do dołu ekranu,
     · rozmiar czcionki w polach — poniżej 16 px Safari przybliża stronę
       przy dotknięciu pola i już jej nie oddala,
     · KONTRAST TEKSTU W POLU FORMULARZA W TRYBIE CIEMNYM. To jest powód,
       dla którego tryb ciemny był na tej stronie przez długi czas wyłączony:
       Safari i Chrome na Androidzie potrafią wtedy narysować ciemny tekst
       na ciemnym tle i wpisywane znaki znikają. Pola dostały jawne kolory,
       a ten test pilnuje, żeby ktoś ich nie usunął.

   URUCHOMIENIE:
     npm run test:safari                       (na żywej stronie)
     npm run test:safari -- http://localhost:4331   (na wersji zbudowanej)

   Wymaga jednorazowo: npx playwright install webkit
   ========================================================================== */

import { webkit, devices } from "playwright";

const ADRES = process.argv[2] ?? "https://skilful.pl";

const STRONY = [
  "/", "/podstawowe", "/fakultety", "/indywidualne", "/cennik",
  "/zapisy", "/kontakt", "/o-nas", "/metoda", "/exams",
  "/exams/matura", "/exams/egzamin-osmoklasisty", "/bezpieczenstwo",
];

const bledy = [];
const blad = (co) => bledy.push(co);

const naBarwy = (s) => (s.match(/[\d.]+/g) ?? [0, 0, 0]).slice(0, 3).map(Number);
const jasnosc = (c) => {
  const s = c.map((v) => v / 255).map((v) =>
    v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
  return 0.2126 * s[0] + 0.7152 * s[1] + 0.0722 * s[2];
};
const kontrast = (a, b) =>
  (Math.max(jasnosc(a), jasnosc(b)) + 0.05) / (Math.min(jasnosc(a), jasnosc(b)) + 0.05);

const przegladarka = await webkit.launch();
let sprawdzonych = 0;

for (const tryb of ["light", "dark"]) {
  const kontekst = await przegladarka.newContext({
    ...devices["iPhone 13"],
    colorScheme: tryb,
  });
  const strona = await kontekst.newPage();
  await strona.addInitScript(() => {
    try { localStorage.setItem("sa-cookie-consent", "necessary"); } catch (e) {}
  });
  strona.on("pageerror", (e) =>
    blad(`[${tryb}] wyjątek skryptu: ${String(e).slice(0, 100)}`));

  for (const adres of STRONY) {
    await strona.goto(ADRES + adres, { waitUntil: "domcontentloaded" });
    sprawdzonych++;
    const w = await strona.evaluate(() => {
      const pasek = document.querySelector(".pasek-akcji");
      const pole = document.querySelector(
        "input[type=text], input[type=tel], input[type=email]");
      return {
        nadmiar: document.documentElement.scrollWidth - document.documentElement.clientWidth,
        pasekWidoczny: pasek ? getComputedStyle(pasek).display !== "none" : null,
        polePx: pole ? parseFloat(getComputedStyle(pole).fontSize) : null,
      };
    });
    if (w.nadmiar > 1)
      blad(`[${tryb}] ${adres} — strona przewija się w bok o ${w.nadmiar}px`);
    if (w.pasekWidoczny === false)
      blad(`[${tryb}] ${adres} — pasek akcji nie pokazuje się na telefonie`);
    if (w.polePx !== null && w.polePx < 16)
      blad(`[${tryb}] ${adres} — pole ma ${w.polePx}px, Safari przybliży stronę`);
  }

  /* Pola formularza — sprawdzenie, dla którego ten plik głównie powstał. */
  await strona.goto(ADRES + "/zapisy", { waitUntil: "networkidle" });
  const pola = await strona.evaluate(() =>
    [...document.querySelectorAll("form input:not([type=hidden]), form select, form textarea")]
      .filter((e) => e.type !== "checkbox")
      .map((e) => {
        const cs = getComputedStyle(e);
        return { nazwa: e.name, tlo: cs.backgroundColor, kolor: cs.color };
      }));
  for (const p of pola) {
    const k = kontrast(naBarwy(p.tlo), naBarwy(p.kolor));
    if (k < 4.5)
      blad(`[${tryb}] pole „${p.nazwa}" — tekst ${k.toFixed(2)}:1 na własnym tle,` +
           " wpisywane znaki będą znikać");
  }

  await kontekst.close();
}

await przegladarka.close();

console.log(`\n  Silnik Safari (WebKit) · ${STRONY.length} stron × 2 tryby` +
  ` · ${sprawdzonych} wczytań`);
console.log(`\n  BŁĘDY: ${bledy.length}`);
for (const b of bledy) console.log(`   ✗ ${b}`);
console.log("");
process.exit(bledy.length ? 1 : 0);
