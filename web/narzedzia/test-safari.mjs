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

   URUCHAMIAĆ WYŁĄCZNIE NA ADRESIE HTTPS, czyli na żywej stronie.

   Powód jest konkretny i kosztował mnie pół godziny szukania nieistniejącej
   usterki. Nasza polityka bezpieczeństwa treści zawiera dyrektywę
   `upgrade-insecure-requests`, która każe przeglądarce pobierać wszystkie
   zasoby przez HTTPS. WebKit stosuje ją także na `localhost` — próbuje więc
   pobrać arkusz stylów z `https://localhost:4331`, gdzie nie ma certyfikatu,
   i strona wczytuje się BEZ STYLÓW. Test pokazuje wtedy pola formularza
   w rozmiarze domyślnym i zgłasza usterkę, której nie ma.

   Chromium tego nie robi, bo traktuje `localhost` jako źródło zaufane —
   dlatego pozostałe testy działają lokalnie bez problemu.

   Skrypt sprawdza to teraz sam i przerywa z wyjaśnieniem, zamiast zgłaszać
   fałszywe błędy.

   URUCHOMIENIE:
     npm run test:safari

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

/* Zabezpieczenie przed fałszywym wynikiem — patrz nagłówek pliku. */
{
  const k = await przegladarka.newContext();
  const s0 = await k.newPage();
  await s0.goto(ADRES + "/", { waitUntil: "networkidle" });
  const regul = await s0.evaluate(() => [...document.styleSheets]
    .reduce((n, a) => { try { return n + a.cssRules.length; } catch { return n; } }, 0));
  await k.close();
  if (regul === 0) {
    /* Komunikat składany z tablicy, a nie sklejany znakami ucieczki.
       Przy sklejaniu łatwo wpisać prawdziwe łamanie wiersza w środek
       łańcucha i wywalić plik — zdarzyło mi się to tu za pierwszym razem. */
    console.error([
      "",
      "  PRZERWANE: arkusz stylów nie wczytał się w WebKicie.",
      `  Adres: ${ADRES}`,
      "",
      "  Najczęstsza przyczyna: adres http zamiast https. Polityka",
      "  bezpieczeństwa treści wymusza HTTPS, a WebKit stosuje to także",
      "  na localhost — strona wczytuje się wtedy bez stylów, a test",
      "  zgłasza usterki, których nie ma.",
      "",
      "  Uruchomcie go na https://skilful.pl.",
      "",
    ].join("\n"));
    await przegladarka.close();
    process.exit(2);
  }
}

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
