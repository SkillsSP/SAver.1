/* ==========================================================================
   TEST MOBILNY W PRAWDZIWEJ PRZEGLĄDARCE

   Audyt wklejany do konsoli nie wystarcza do sprawdzenia rzeczy, które dzieją
   się w czasie: pojawienia się przycisku po przewinięciu, przeliczenia układu
   po zamknięciu banera, zachowania klawiatury nad polem formularza. Tu
   sterujemy prawdziwym Chromium z emulacją konkretnych telefonów, więc
   `requestAnimationFrame` i obserwatory faktycznie chodzą.

   URUCHAMIAĆ NA WERSJI ZBUDOWANEJ. Serwer deweloperski przy pierwszym wejściu
   dopiero składa stronę, więc skrypty startują z opóźnieniem i test potrafi
   zgłosić, że baner zgód się nie pokazał, choć pokazuje się bez zarzutu.
   Sprawdziłem to osobno: trzy próby na trzy, baner stoi.

     npm run build
     npx astro preview --port 4331
     npm run test:mobilny -- http://localhost:4331
   ========================================================================== */

import { chromium, devices } from "playwright";

const ADRES = process.argv[2] ?? "http://localhost:4331";

/* Sprzęt dobrany tak, żeby objąć oba systemy i skrajne szerokości: najwęższy
   iPhone jeszcze w użyciu, typowy Android, największy iPhone. */
const SPRZET = [
  ["iPhone SE", devices["iPhone SE"]],
  ["iPhone 13", devices["iPhone 13"]],
  ["iPhone 14 Pro Max", devices["iPhone 14 Pro Max"]],
  ["Pixel 7", devices["Pixel 7"]],
  ["Galaxy S9+", devices["Galaxy S9+"]],
];

const bledy = [];
const uwagi = [];
const blad = (co) => bledy.push(co);
const uwaga = (co) => uwagi.push(co);

const przegladarka = await chromium.launch();

for (const [nazwa, opis] of SPRZET) {
  const kontekst = await przegladarka.newContext({ ...opis });
  const strona = await kontekst.newPage();

  /* ---- 1. Pierwsza wizyta: baner stoi, pasek akcji ustępuje mu miejsca ---- */
  await strona.goto(ADRES, { waitUntil: "networkidle" });

  const banerWidoczny = await strona.locator(".zgoda-cookies").isVisible();
  if (!banerWidoczny) blad(`${nazwa}: baner zgód nie pokazał się przy pierwszej wizycie`);

  const pasekPodBanerem = await strona.locator(".pasek-akcji").isVisible();
  if (pasekPodBanerem)
    blad(`${nazwa}: pasek akcji stoi razem z banerem — dwie warstwy na dole naraz`);

  /* Przyciski banera muszą mieścić się na ekranie i dać się dotknąć. */
  for (const tekst of ["Akceptuję wszystkie", "Tylko niezbędne"]) {
    const p = strona.locator(".zgoda-cookies button", { hasText: tekst });
    const r = await p.boundingBox();
    const wysOkna = opis.viewport.height;
    if (!r) { blad(`${nazwa}: brak przycisku „${tekst}" w banerze`); continue; }
    if (r.y + r.height > wysOkna + 1)
      blad(`${nazwa}: przycisk „${tekst}" wychodzi poza ekran o ${Math.round(r.y + r.height - wysOkna)}px`);
    if (r.height < 44)
      uwaga(`${nazwa}: przycisk „${tekst}" ma ${Math.round(r.height)}px wysokości (Apple zaleca 44)`);
  }

  /* ---- 2. Rodzic wybiera zgodę ---- */
  await strona.locator(".zgoda-cookies button", { hasText: "Tylko niezbędne" }).click();
  await strona.waitForTimeout(250);

  if (await strona.locator(".zgoda-cookies").isVisible())
    blad(`${nazwa}: baner został po dokonaniu wyboru`);
  if (!(await strona.locator(".pasek-akcji").isVisible()))
    blad(`${nazwa}: pasek akcji nie wrócił po zamknięciu banera`);

  /* Analityka nie ma prawa wystartować przy zgodzie „tylko niezbędne". */
  const analitykaWstrzyknieta = await strona.evaluate(
    () => !!document.querySelector('script[src*="umami"]'));
  if (analitykaWstrzyknieta)
    blad(`${nazwa}: analityka ruszyła mimo odmowy zgody`);

  /* ---- 3. Przewijanie i przycisk powrotu na górę ---- */
  await strona.evaluate(() => window.scrollTo({ top: window.innerHeight * 3, behavior: "instant" }));
  await strona.waitForTimeout(400);

  const strzalka = strona.locator("[data-na-gore]");
  if (!(await strzalka.isVisible())) {
    blad(`${nazwa}: przycisk powrotu na górę nie pojawił się po trzech ekranach`);
  } else {
    const rs = await strzalka.boundingBox();
    const rp = await strona.locator(".pasek-akcji").boundingBox();
    if (rs && rp && rs.y < rp.y + rp.height && rp.y < rs.y + rs.height)
      blad(`${nazwa}: przycisk powrotu zachodzi na pasek akcji ` +
           `(${Math.round(rs.y)}–${Math.round(rs.y + rs.height)} vs ` +
           `${Math.round(rp.y)}–${Math.round(rp.y + rp.height)})`);
    if (rs && (rs.width < 44 || rs.height < 44))
      uwaga(`${nazwa}: przycisk powrotu ${Math.round(rs.width)}×${Math.round(rs.height)}px`);

    /* Kliknięcie ma faktycznie wracać na górę. Krótki limit czasu jest tu
       częścią sprawdzenia: gdy przycisk stoi pod paskiem akcji, przeglądarka
       nie może go dotknąć i zgłasza, że zdarzenie przechwytuje inny element.
       Bez przechwycenia wyjątku cały test wywracał się stosem zamiast podać
       zrozumiały powód. */
    try {
      await strzalka.click({ timeout: 4000 });
      await strona.waitForTimeout(900);
      const y = await strona.evaluate(() => window.scrollY);
      if (y > 5) blad(`${nazwa}: po kliknięciu powrotu strona stoi na ${Math.round(y)}px`);
    } catch (e) {
      const przechwytuje = String(e.message).match(/<[^>]*class="([^"]+)"[^>]*> intercepts pointer events/);
      blad(`${nazwa}: przycisku powrotu nie da się dotknąć` +
        (przechwytuje ? ` — przykrywa go .${przechwytuje[1].split(" ")[0]}` : " (limit czasu)"));
    }
  }

  /* ---- 4. Menu mobilne ---- */
  await strona.locator("[data-otworz-menu]").first().click();
  await strona.waitForTimeout(300);
  const menu = strona.locator("[data-menu-mobilne]");
  if (!(await menu.isVisible())) blad(`${nazwa}: menu mobilne nie otworzyło się`);
  const zablokowane = await strona.evaluate(
    () => getComputedStyle(document.body).overflow.includes("hidden"));
  if (!zablokowane) blad(`${nazwa}: strona pod otwartym menu wciąż się przewija`);
  await strona.locator("[data-zamknij-menu]").first().click();
  await strona.waitForTimeout(250);
  if (await menu.isVisible()) blad(`${nazwa}: menu mobilne nie zamknęło się`);

  /* ---- 5. Formularz: klawiatura i cele dotykowe ---- */
  await strona.goto(ADRES + "/zapisy", { waitUntil: "networkidle" });
  const pola = await strona.evaluate(() =>
    [...document.querySelectorAll("form input:not([type=hidden]), form select, form textarea")]
      .map((el) => ({
        nazwa: el.name,
        px: parseFloat(getComputedStyle(el).fontSize),
        wys: Math.round(el.getBoundingClientRect().height),
        klawiatura: el.getAttribute("inputmode") || el.type,
      })));
  for (const p of pola) {
    if (p.px < 16)
      blad(`${nazwa}: pole „${p.nazwa}" ma ${p.px}px — iOS przybliży stronę przy dotknięciu`);
    /* Pułapka na roboty jest przycięta do zera i niewidoczna dla rodzica,
       więc jej wymiary nic nie znaczą. Pole zgody ma etykietę, która sama
       w sobie jest celem dotknięcia. */
    if (p.wys > 0 && p.wys < 44 && p.klawiatura !== "checkbox" && p.nazwa !== "firma_www")
      uwaga(`${nazwa}: pole „${p.nazwa}" ma ${p.wys}px wysokości`);
  }

  /* Wpisanie tekstu nie może chować przycisku wysyłki pod paskiem akcji. */
  await strona.locator('input[name="imie_dziecka"]').fill("Ala");
  await strona.locator('input[name="telefon"]').fill("500600700");
  const wyslij = strona.locator('form button[type="submit"]');
  await wyslij.scrollIntoViewIfNeeded();
  await strona.waitForTimeout(200);
  const rw = await wyslij.boundingBox();
  const rpa = await strona.locator(".pasek-akcji").boundingBox();
  if (rw && rpa && rw.y < rpa.y + rpa.height && rpa.y < rw.y + rw.height)
    blad(`${nazwa}: pasek akcji zasłania przycisk wysyłki formularza`);

  await kontekst.close();
}

/* ==========================================================================
   PRZEGLĄD SZEROKI

   Powyżej sprawdzaliśmy zachowanie na pięciu telefonach, ale tylko na stronie
   głównej i formularzu. Tu idziemy w drugą stronę: wszystkie podstrony na
   sześciu szerokościach, za to bez klikania. Szukamy trzech rzeczy, które
   psują się od samej szerokości ekranu.
   ========================================================================== */
const STRONY = [
  "/", "/program", "/podstawowe", "/fakultety", "/indywidualne",
  "/exams", "/exams/egzamin-osmoklasisty", "/exams/matura",
  "/cennik", "/zapisy", "/kontakt", "/o-nas", "/metoda",
  "/bezpieczenstwo", "/regulamin", "/polityka-prywatnosci", "/klauzula-rodo",
  /* Ukryte przed wyszukiwarkami, ale nie przed testem — mają działać, zanim
     je odsłonimy, a nie dopiero potem. */
  "/terminarz", "/poradnik",
];
/* Realne szerokości, nie okrągłe liczby: 320 to iPhone SE pierwszej generacji,
   360 najczęstszy Android, 430 największy iPhone. */
const SZEROKOSCI = [320, 360, 375, 390, 412, 430];

let sprawdzonychCeli = 0;

for (const szer of SZEROKOSCI) {
  const kontekst = await przegladarka.newContext({
    viewport: { width: szer, height: 780 },
    hasTouch: true,
    isMobile: true,
    deviceScaleFactor: 2,
  });
  const strona = await kontekst.newPage();
  /* Zgoda rozstrzygnięta z góry — baner zasłaniałby dół każdej strony
     i mierzylibyśmy jego, a nie treść. */
  await strona.addInitScript(() => {
    try { localStorage.setItem("sa-cookie-consent", "necessary"); } catch (e) {}
  });

  for (const adres of STRONY) {
    await strona.goto(ADRES + adres, { waitUntil: "domcontentloaded" });
    const wynik = await strona.evaluate((szerokosc) => {
      const znalezione = { przewijanie: null, szerokie: [], cele: [], pola: [] };

      const nadmiar = document.documentElement.scrollWidth - szerokosc;
      if (nadmiar > 1) znalezione.przewijanie = nadmiar;

      /* Element przycięty do zera nie jest widoczny, choć ma wymiary — tak
         wygląda pułapka na roboty w formularzu. */
      const przyciety = (el) => {
        if (getComputedStyle(el).clipPath !== "none") return true;
        let r = el.parentElement;
        while (r && r !== document.body) {
          const cs = getComputedStyle(r);
          if (cs.clipPath !== "none") return true;
          const b = r.getBoundingClientRect();
          if (cs.overflow !== "visible" && (b.width <= 2 || b.height <= 2)) return true;
          r = r.parentElement;
        }
        return false;
      };

      let policzone = 0;
      for (const el of document.querySelectorAll("a,button,input,select,textarea,summary")) {
        const cs = getComputedStyle(el);
        if (cs.display === "none" || cs.visibility === "hidden" || el.type === "hidden") continue;
        const r = el.getBoundingClientRect();
        if (r.width < 1 || r.height < 1) continue;
        if (r.width > szerokosc + 1) znalezione.szerokie.push(el.tagName + "." + String(el.className).slice(0, 24));
        policzone++;
        /* Odnośnik w środku zdania nie jest przyciskiem — nie da się go
           powiększyć bez rozerwania akapitu i wytyczne robią dla niego wyjątek.
           Odnośnik pomijający nawigację służy klawiaturze, nie kciukowi. */
        if (el.tagName === "A" && el.closest("p,li,figcaption,summary,label")) continue;
        if (String(el.className).includes("pomin")) continue;
        if (r.height < 44 || r.width < 44) {
          if (przyciety(el)) continue;
          znalezione.cele.push(
            `${Math.round(r.width)}×${Math.round(r.height)}px ${el.tagName} „${el.textContent.trim().slice(0, 24)}"`);
        }
      }
      /* PRZYBLIŻANIE NA iOS DOTYCZY WYŁĄCZNIE PÓL, W KTÓRYCH SIĘ PISZE.
         Safari powiększa stronę, gdy dotknięte pole ma czcionkę mniejszą niż
         16 px — ale robi to przy wejściu kursora do pola tekstowego. Pole
         wyboru i przełącznik nie dostają klawiatury i nie wywołują tego
         zachowania.

         Bez tego rozróżnienia narzędzie zgłosiło 114 błędów naraz, po dodaniu
         dwóch pól wyboru do banera zgody: ich czcionka dziedziczy 12,5 px
         z drobnego opisu obok. Sprawdziłem w przeglądarce — same pola mają
         24 × 24 px, czyli minimalny cel dotykowy z WCAG 2.2. Zgłoszenie było
         fałszywe co do zasady, a nie co do pomiaru.

         Drugi błąd był poważniejszy: ta pętla w ogóle nie sprawdzała, czy
         element jest widoczny. Baner zgody jest w tym teście schowany
         (zgoda ustawiona z góry, żeby nie zasłaniał treści), a mimo to jego
         pola były mierzone. Pętla wyżej, licząca cele dotykowe, robi to
         poprawnie od początku — ta była pisana osobno i o tym zapomniała. */
      const PISALNE = new Set(["text", "email", "tel", "url", "search",
        "password", "number", "date", "datetime-local", "month", "week", "time"]);
      for (const el of document.querySelectorAll("input:not([type=hidden]),select,textarea")) {
        const cs = getComputedStyle(el);
        if (cs.display === "none" || cs.visibility === "hidden") continue;
        if (!el.getClientRects().length) continue;
        const tekstowe = el.tagName !== "INPUT" || PISALNE.has(el.type);
        if (!tekstowe) continue;
        const px = parseFloat(cs.fontSize);
        if (px < 16) znalezione.pola.push(`${el.name || el.type} ${px}px`);
      }
      znalezione.policzone = policzone;
      return znalezione;
    }, szer);

    sprawdzonychCeli += wynik.policzone;
    if (wynik.przewijanie)
      blad(`${szer}px ${adres} — strona przewija się w bok o ${wynik.przewijanie}px`);
    for (const s of new Set(wynik.szerokie))
      blad(`${szer}px ${adres} — ${s} szersze niż ekran`);
    for (const c of new Set(wynik.cele))
      uwaga(`${szer}px ${adres} — cel dotykowy ${c}`);
    for (const f of new Set(wynik.pola))
      blad(`${szer}px ${adres} — pole ${f}, iOS przybliży stronę`);
  }
  await kontekst.close();
}

await przegladarka.close();

console.log(`\n  Sprzęt: ${SPRZET.map((s) => s[0]).join(", ")}`);
console.log(`\n  BŁĘDY: ${bledy.length}`);
for (const b of bledy) console.log(`   ✗ ${b}`);
console.log(`\n  UWAGI: ${uwagi.length}`);
for (const u of uwagi) console.log(`   ! ${u}`);
console.log("");
process.exit(bledy.length ? 1 : 0);
