/* ==========================================================================
   AUDYT DOSTĘPNOŚCI I STABILNOŚCI

   Sprawdza to, czego nie widać ani w kodzie źródłowym, ani na zrzucie ekranu:
   kolejność wędrówki tabulatorem, strukturę widzianą przez czytnik ekranu,
   zachowanie strony z wyłączonym JavaScriptem oraz układ przy powiększeniu
   do czterystu procent.

   Dlaczego akurat te cztery rzeczy. Rodzic korzystający z czytnika ekranu
   nie widzi, że nagłówek wygląda jak nagłówek — dla niego liczy się wyłącznie
   znacznik. Osoba poruszająca się klawiaturą przechodzi stronę w kolejności
   zapisanej w kodzie, nie w tej, którą widać. Powiększenie do 400% to wymóg
   normy WCAG 1.4.10, a nie uprzejmość. A wyłączony JavaScript zdarza się
   rzadko, lecz gdy się zdarzy, formularz zapisu musi wysłać się mimo to.

   URUCHAMIAĆ NA WERSJI ZBUDOWANEJ:
     npm run build && npx astro preview --port 4331
     node narzedzia/audyt-dostepnosci.mjs http://localhost:4331
   ========================================================================== */

import { chromium } from "playwright";

const ADRES = process.argv[2] ?? "http://localhost:4331";

const STRONY = [
  "/", "/program", "/podstawowe", "/fakultety", "/indywidualne",
  "/exams", "/exams/egzamin-osmoklasisty", "/exams/matura",
  "/cennik", "/zapisy", "/kontakt", "/o-nas", "/metoda",
  "/bezpieczenstwo", "/regulamin", "/polityka-prywatnosci", "/klauzula-rodo",
  "/terminarz", "/poradnik",
];

const bledy = [];
const uwagi = [];
const blad = (co) => bledy.push(co);
const uwaga = (co) => uwagi.push(co);
const licznik = { stron: 0, naglowkow: 0, obrazkow: 0, pol: 0, przystankow: 0, tekstow: 0 };

const przegladarka = await chromium.launch();

/* ======================================================================
   1. STRUKTURA DLA CZYTNIKA EKRANU
   ====================================================================== */
{
  const kontekst = await przegladarka.newContext();
  const strona = await kontekst.newPage();
  await strona.addInitScript(() => {
    try { localStorage.setItem("sa-cookie-consent", "necessary"); } catch (e) {}
  });

  for (const adres of STRONY) {
    await strona.goto(ADRES + adres, { waitUntil: "domcontentloaded" });
    licznik.stron++;

    const w = await strona.evaluate(() => {
      const wynik = { problemy: [], naglowkow: 0, obrazkow: 0, pol: 0 };

      /* Język strony. Czytnik ekranu dobiera po nim wymowę — bez tego
         czyta polski tekst angielską fonetyką. */
      const lang = document.documentElement.getAttribute("lang");
      if (!lang) wynik.problemy.push("brak atrybutu lang na dokumencie");
      else if (!lang.startsWith("pl")) wynik.problemy.push(`lang="${lang}" zamiast polskiego`);

      /* Punkty orientacyjne — po nich czytnik przeskakuje między obszarami. */
      for (const [znacznik, nazwa] of [["main", "obszar główny"], ["header", "nagłówek"], ["footer", "stopkę"], ["nav", "nawigację"]]) {
        const ile = document.querySelectorAll(znacznik).length;
        if (ile === 0) wynik.problemy.push(`brak znacznika <${znacznik}> (${nazwa})`);
        if (znacznik === "main" && ile > 1) wynik.problemy.push(`${ile} obszarów głównych zamiast jednego`);
      }

      /* Nagłówki: dokładnie jeden pierwszego stopnia i bez przeskoków
         w hierarchii. Czytnik buduje z nich spis treści strony. */
      const naglowki = [...document.querySelectorAll("h1,h2,h3,h4,h5,h6")];
      wynik.naglowkow = naglowki.length;
      const jedynki = naglowki.filter((h) => h.tagName === "H1").length;
      if (jedynki !== 1) wynik.problemy.push(`${jedynki} nagłówków H1 zamiast jednego`);
      let poprzedni = 0;
      for (const h of naglowki) {
        const stopien = Number(h.tagName[1]);
        if (poprzedni && stopien > poprzedni + 1)
          wynik.problemy.push(`przeskok w nagłówkach: H${poprzedni} → H${stopien} („${h.textContent.trim().slice(0, 30)}")`);
        poprzedni = stopien;
      }

      /* Obrazki: każdy musi mieć alt. Pusty alt jest poprawny i oznacza
         „to ozdoba, pomiń" — brak atrybutu każe czytnikowi przeczytać
         nazwę pliku. */
      for (const img of document.querySelectorAll("img")) {
        wynik.obrazkow++;
        if (img.getAttribute("alt") === null)
          wynik.problemy.push(`obrazek bez atrybutu alt: ${img.getAttribute("src")?.slice(-40)}`);
      }

      /* Pola formularza muszą mieć etykietę powiązaną, a nie sam tekst obok. */
      for (const pole of document.querySelectorAll("input:not([type=hidden]),select,textarea")) {
        wynik.pol++;
        const maEtykiete = pole.id && document.querySelector(`label[for="${CSS.escape(pole.id)}"]`);
        const maAria = pole.getAttribute("aria-label") || pole.getAttribute("aria-labelledby");
        if (!maEtykiete && !maAria && !pole.closest("label"))
          wynik.problemy.push(`pole „${pole.name || pole.type}" bez powiązanej etykiety`);
      }

      /* Przyciski rozwijane muszą mówić, czy są otwarte. */
      for (const b of document.querySelectorAll("[aria-controls]")) {
        if (b.getAttribute("aria-expanded") === null)
          wynik.problemy.push(`element sterujący „${b.textContent.trim().slice(0, 20)}" bez aria-expanded`);
      }

      /* Odnośnik pomijający nawigację — pierwszy przystanek tabulatora. */
      if (!document.querySelector("a[href^='#']")) wynik.problemy.push("brak odnośnika pomijającego nawigację");

      return wynik;
    });

    licznik.naglowkow += w.naglowkow;
    licznik.obrazkow += w.obrazkow;
    licznik.pol += w.pol;
    for (const p of w.problemy) blad(`${adres} — ${p}`);
  }
  await kontekst.close();
}

/* ======================================================================
   1b. KONTRAST TEKSTU

   Sprawdzamy każdą parę tekst–tło pod progami WCAG 1.4.3: 4,5:1 dla tekstu
   zwykłego, 3:1 dla dużego (24 px albo 18,66 px półgrubego).

   Dwie pułapki, w które sam wpadłem przy pisaniu tego sprawdzenia i które
   dają fałszywe alarmy, jeśli się ich nie obejdzie:

   1. Tło trzeba liczyć OD SAMEGO ELEMENTU w górę, nie od jego rodzica.
      Plakietka „Unikat" ma własne tło; porównana z tłem sekcji wychodziła
      na 1,15:1, choć na ekranie jest czytelna.

   2. Element widoczny sam w sobie może mieć przodka z `display: none` —
      tak jest z rozwijanym menu wersji komputerowej, które na telefonie
      nie istnieje. Zwracało 1,00:1 dla dwunastu tekstów naraz.
      `offsetParent === null` łapie oba przypadki jednym warunkiem.
   ====================================================================== */
/* Kontrast sprawdzamy w OBU trybach. Paleta ciemna to osobny zestaw kolorów,
   więc jasna zdana z wynikiem 0 nie mówi nic o ciemnej — a rodzic przegląda
   stronę wieczorem, często z systemem ustawionym na ciemny. */
for (const tryb of ["light", "dark"]) {
  const kontekst = await przegladarka.newContext({ colorScheme: tryb });
  const strona = await kontekst.newPage();
  await strona.addInitScript(() => {
    try { localStorage.setItem("sa-cookie-consent", "necessary"); } catch (e) {}
  });

  for (const adres of STRONY) {
    await strona.goto(ADRES + adres, { waitUntil: "domcontentloaded" });
    const znalezione = await strona.evaluate(() => {
      const jasnosc = (c) => {
        const s = c.map((v) => v / 255).map((v) =>
          v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
        return 0.2126 * s[0] + 0.7152 * s[1] + 0.0722 * s[2];
      };
      const naBarwy = (s) => {
        const m = s.match(/[\d.]+/g);
        return m ? m.slice(0, 3).map(Number) : null;
      };
      /* Tło trzeba SKŁADAĆ, a nie brać pierwsze napotkane. Aktywna pozycja
         menu ma własne tło `rgba(30, 95, 204, 0.08)` — osiem procent krycia
         nad kremem, czyli w praktyce prawie krem. Wzięte dosłownie, jako
         ciemny kobalt, dawało 1,51:1 dla tekstu, który na ekranie jest
         doskonale czytelny. Zbieramy więc wszystkie warstwy od elementu w górę
         i mieszamy je tak, jak robi to przeglądarka. */
      const tloPod = (el) => {
        const warstwy = [];
        let t = el;
        while (t) {
          const c = getComputedStyle(t).backgroundColor;
          const m = c && c.match(/[\d.]+/g);
          if (m) {
            const a = m.length > 3 ? Number(m[3]) : 1;
            if (a > 0) {
              warstwy.push({ rgb: m.slice(0, 3).map(Number), a });
              if (a >= 1) break;
            }
          }
          t = t.parentElement;
        }
        /* Pod wszystkim leży biel — gdyby żadna warstwa nie była pełna. */
        let wynik = [255, 255, 255];
        for (const w of warstwy.reverse())
          wynik = wynik.map((tlo, i) => w.rgb[i] * w.a + tlo * (1 - w.a));
        return `rgb(${wynik.map(Math.round).join(", ")})`;
      };

      const out = [];
      let policzone = 0;
      for (const el of document.querySelectorAll(
        "p,li,h1,h2,h3,h4,h5,h6,span,a,strong,em,small,button,summary,td,th,label,figcaption")) {
        const wlasnyTekst = [...el.childNodes]
          .filter((n) => n.nodeType === 3).map((n) => n.textContent.trim()).join("");
        if (!wlasnyTekst) continue;
        /* Pusty offsetParent oznacza element bez pudełka: albo sam jest
           ukryty, albo któryś z jego przodków. Pozycjonowanie stałe jest
           tu wyjątkiem, bo ono też zeruje offsetParent. */
        const cs = getComputedStyle(el);
        if (el.offsetParent === null && cs.position !== "fixed") continue;
        if (cs.visibility === "hidden" || cs.opacity === "0") continue;
        if (el.closest(".wizualnie-ukryte, .pulapka, .pomin-do-tresci")) continue;
        const r = el.getBoundingClientRect();
        if (r.width < 2 || r.height < 2) continue;

        const k1 = naBarwy(cs.color);
        const k2 = naBarwy(tloPod(el));
        if (!k1 || !k2) continue;
        policzone++;
        const stosunek = (Math.max(jasnosc(k1), jasnosc(k2)) + 0.05) /
                         (Math.min(jasnosc(k1), jasnosc(k2)) + 0.05);
        const px = parseFloat(cs.fontSize);
        const duzy = px >= 24 || (px >= 18.66 && Number(cs.fontWeight) >= 700);
        const prog = duzy ? 3 : 4.5;
        if (stosunek < prog)
          out.push(`${stosunek.toFixed(2)}:1 przy progu ${prog} (${Math.round(px)}px) — „${wlasnyTekst.slice(0, 34)}"`);
      }
      return { out, policzone };
    });
    licznik.tekstow += znalezione.policzone;
    for (const x of [...new Set(znalezione.out)])
      blad(`${adres} [${tryb === "dark" ? "ciemny" : "jasny"}] — kontrast ${x}`);
  }
  await kontekst.close();
}

/* ======================================================================
   1c. RYTM SEKCJI

   Dwie sąsiednie sekcje o tym samym tle zlewają się w jedną płaszczyznę
   i granica między dwiema myślami znika. Na telefonie, gdzie widać naraz
   jeden ekran, nie ma po czym poznać, że zaczyna się nowa część.

   PIERWSZA WERSJA TEGO SPRAWDZENIA PRZEPUŚCIŁA REGRESJĘ, bo porównywała
   wyłącznie sekcje z ustawionym tłem, a dwie sekcje BEZ tła są tak samo
   nie do odróżnienia jak dwie w tym samym kolorze. Teraz sekcja bez tła
   dziedziczy kolor strony i wchodzi do porównania na równi z resztą.

   Miarą jest L* z przestrzeni CIELAB, nie jasność względna: ta druga przy
   ciemnych powierzchniach ściska wszystkie różnice do ułamków punktu
   i wygląda na problem tam, gdzie oko widzi wyraźną granicę.

   PRÓG WYNOSI 1,0 L*, NIE 3,0. Zacząłem od trzech, bo tyle podaje się jako
   granicę zauważalności dla dużych płaszczyzn — i dostałem 45 zgłoszeń,
   z których żadne nie było usterką. Ten projekt celowo operuje delikatnym
   rytmem: krem strony i biała karta dzieli 2,3 L*, co widać doskonale, a co
   przy progu trzech wychodziło jako wada. Szukamy tu duplikatów, nie niskiego
   kontrastu — dwóch sekcji, których NIE DA SIĘ odróżnić, a nie takich, które
   różnią się subtelnie z zamysłu.
   ====================================================================== */
{
  for (const tryb of ["light", "dark"]) {
    const kontekst = await przegladarka.newContext({ colorScheme: tryb });
    const strona = await kontekst.newPage();
    await strona.addInitScript(() => {
      try { localStorage.setItem("sa-cookie-consent", "necessary"); } catch (e) {}
    });
    for (const adres of STRONY) {
      await strona.goto(ADRES + adres, { waitUntil: "domcontentloaded" });
      const pary = await strona.evaluate(() => {
        const L = (rgb) => {
          const f = (v) => { v /= 255; return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
          const Y = 0.2126 * f(rgb[0]) + 0.7152 * f(rgb[1]) + 0.0722 * f(rgb[2]);
          return Y > 0.008856 ? 116 * Math.cbrt(Y) - 16 : 903.3 * Y;
        };
        const naBarwy = (s) => (s.match(/[\d.]+/g) ?? [0, 0, 0]).slice(0, 3).map(Number);
        const tloStrony = getComputedStyle(document.body).backgroundColor;
        const sek = [...document.querySelectorAll("main > section")].map((s) => {
          let t = getComputedStyle(s).backgroundColor;
          if (!t || t.startsWith("rgba(0, 0, 0, 0")) t = tloStrony;
          return { L: L(naBarwy(t)),
                   n: s.querySelector("h1,h2")?.textContent.trim().slice(0, 26) ?? "(bez nagłówka)" };
        });
        const out = [];
        for (let i = 1; i < sek.length; i++) {
          const d = Math.abs(sek[i].L - sek[i - 1].L);
          if (d < 1) out.push(`„${sek[i - 1].n}" + „${sek[i].n}" — różnica ${d.toFixed(1)} L*`);
        }
        return out;
      });
      for (const x of pary)
        blad(`${adres} [${tryb === "dark" ? "ciemny" : "jasny"}] — sekcje zlewają się: ${x}`);
    }
    await kontekst.close();
  }
}

/* ======================================================================
   2. WĘDRÓWKA KLAWIATURĄ
   ====================================================================== */
{
  const kontekst = await przegladarka.newContext();
  const strona = await kontekst.newPage();
  await strona.addInitScript(() => {
    try { localStorage.setItem("sa-cookie-consent", "necessary"); } catch (e) {}
  });

  for (const adres of ["/", "/zapisy", "/cennik", "/bezpieczenstwo"]) {
    await strona.goto(ADRES + adres, { waitUntil: "networkidle" });

    /* Pierwszy przystanek musi prowadzić do treści — inaczej osoba
       poruszająca się klawiaturą przechodzi całe menu na każdej podstronie. */
    await strona.keyboard.press("Tab");
    const pierwszy = await strona.evaluate(() => {
      const a = document.activeElement;
      return { tekst: a?.textContent?.trim().slice(0, 30), href: a?.getAttribute?.("href") };
    });
    if (!pierwszy.href?.startsWith("#"))
      blad(`${adres} — pierwszym przystankiem tabulatora jest „${pierwszy.tekst}", a powinien być odnośnik do treści`);

    /* Przechodzimy stronę i sprawdzamy dwie rzeczy: czy każdy przystanek
       ma widoczne obramowanie fokusu i czy kolejność nie cofa się w górę
       strony. Cofnięcie oznacza, że kolejność w kodzie rozjechała się
       z tym, co widać. */
    let poprzednieY = -Infinity;
    let cofniec = 0;
    let bezObramowania = 0;
    for (let i = 0; i < 40; i++) {
      const stan = await strona.evaluate(() => {
        const a = document.activeElement;
        if (!a || a === document.body) return null;
        const cs = getComputedStyle(a);
        const r = a.getBoundingClientRect();
        const grubosc = parseFloat(cs.outlineWidth) || 0;
        return {
          y: r.top + window.scrollY,
          widoczny: r.width > 0 && r.height > 0,
          obramowanie: grubosc >= 1 && cs.outlineStyle !== "none",
          cien: cs.boxShadow !== "none",
          tekst: a.textContent?.trim().slice(0, 24) ?? a.tagName,
        };
      });
      if (!stan) break;
      licznik.przystankow++;
      if (stan.widoczny && !stan.obramowanie && !stan.cien) {
        bezObramowania++;
        if (bezObramowania <= 2)
          uwaga(`${adres} — przystanek „${stan.tekst}" bez widocznego obramowania fokusu`);
      }
      /* Menu rozwijane i baner potrafią zmienić położenie, więc liczymy
         tylko wyraźne cofnięcia, powyżej wysokości ekranu. */
      if (stan.y < poprzednieY - 800) cofniec++;
      poprzednieY = stan.y;
      await strona.keyboard.press("Tab");
    }
    if (cofniec > 2)
      uwaga(`${adres} — kolejność tabulatora cofa się ${cofniec} razy`);
  }

  /* Menu mobilne musi dać się zamknąć klawiszem Escape. */
  await strona.setViewportSize({ width: 390, height: 844 });
  await strona.goto(ADRES + "/", { waitUntil: "networkidle" });
  await strona.locator("[data-otworz-menu]").first().click();
  await strona.waitForTimeout(250);
  await strona.keyboard.press("Escape");
  await strona.waitForTimeout(250);
  if (await strona.locator("[data-menu-mobilne]").isVisible())
    uwaga("menu mobilne nie zamyka się klawiszem Escape");

  await kontekst.close();
}

/* ======================================================================
   3. POWIĘKSZENIE DO 400% (WCAG 1.4.10)

   Norma wymaga, żeby przy szerokości odpowiadającej 1280 px powiększonym
   czterokrotnie treść nadal dała się czytać bez przewijania w bok.
   Odpowiada to oknu 320 × 256 px.
   ====================================================================== */
{
  const kontekst = await przegladarka.newContext({ viewport: { width: 320, height: 256 } });
  const strona = await kontekst.newPage();
  await strona.addInitScript(() => {
    try { localStorage.setItem("sa-cookie-consent", "necessary"); } catch (e) {}
  });
  for (const adres of STRONY) {
    await strona.goto(ADRES + adres, { waitUntil: "domcontentloaded" });
    const nadmiar = await strona.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    if (nadmiar > 1) blad(`${adres} — przy powiększeniu 400% strona przewija się w bok o ${nadmiar}px`);
  }
  await kontekst.close();
}

/* ======================================================================
   3b. POWIĘKSZENIE W PRZEGLĄDARCE (WCAG 1.4.4)

   Symulujemy to, co robi użytkownik naciskający Ctrl + : powiększenie strony
   zmniejsza widoczny obszar w pikselach CSS, więc 200% na monitorze 1280
   odpowiada oknu 640 px.

   UWAGA NA POZORNY BŁĄD. Kuszące jest symulowanie powiększenia przez
   `html { font-size: 32px }` — i tak zrobiłem za pierwszym razem. To daje
   wynik fałszywy: zapytania o media liczą `rem` względem POCZĄTKOWEGO
   rozmiaru pisma, nie tego ustawionego przez arkusz strony, więc układ
   zostaje komputerowy przy dwukrotnie większym tekście i wszystko się
   rozjeżdża. Prawdziwa przeglądarka nigdy tak nie robi. Osiemnaście
   zgłoszonych wtedy usterek nie istniało.
   ====================================================================== */
{
  /* nazwa, szerokość okna w px CSS */
  const POWIEKSZENIA = [
    ["150%", 853], ["200%", 640], ["200% na szerokim", 960], ["400%", 320],
  ];
  for (const [nazwa, szer] of POWIEKSZENIA) {
    const kontekst = await przegladarka.newContext({
      viewport: { width: szer, height: 800 }, deviceScaleFactor: 2,
    });
    const strona = await kontekst.newPage();
    await strona.addInitScript(() => {
      try { localStorage.setItem("sa-cookie-consent", "necessary"); } catch (e) {}
    });
    for (const adres of STRONY) {
      await strona.goto(ADRES + adres, { waitUntil: "domcontentloaded" });
      const nadmiar = await strona.evaluate(() =>
        document.documentElement.scrollWidth - document.documentElement.clientWidth);
      if (nadmiar > 1)
        blad(`${adres} — przy powiększeniu ${nazwa} strona przewija się w bok o ${nadmiar}px`);
    }
    await kontekst.close();
  }
}

/* ======================================================================
   3c. TRYB WYSOKIEGO KONTRASTU (wymuszone kolory)

   Windows w trybie wysokiego kontrastu zastępuje wszystkie kolory tła
   kolorami systemowymi. Element, który niesie znaczenie WYŁĄCZNIE tłem —
   plakietka, przycisk, pole formularza — traci wtedy kształt i zlewa się
   z otoczeniem. Ratunkiem jest obrys: w normalnym trybie przezroczysty,
   w wymuszonym przejmuje kolor systemowy.
   ====================================================================== */
{
  const kontekst = await przegladarka.newContext({
    forcedColors: "active", viewport: { width: 1280, height: 900 },
  });
  const strona = await kontekst.newPage();
  await strona.addInitScript(() => {
    try { localStorage.setItem("sa-cookie-consent", "necessary"); } catch (e) {}
  });
  for (const adres of STRONY) {
    await strona.goto(ADRES + adres, { waitUntil: "domcontentloaded" });
    const bezGranicy = await strona.evaluate(() => {
      const out = [];
      for (const el of document.querySelectorAll(
        ".plakietka, .przycisk, .karta, input:not([type=hidden]), select, textarea")) {
        /* Element bez pudełka nic nie pokazuje — pomijamy, żeby pola ukryte
           nie zgłaszały się jako usterka. */
        if (!el.offsetParent) continue;
        /* Pułapka na roboty jest przycięta do zera i niewidoczna. */
        if (el.closest(".pulapka, .wizualnie-ukryte")) continue;
        /* Znaczniki wyboru i przełączniki rysuje sama przeglądarka i w trybie
           wysokiego kontrastu robi to kolorami systemu. Autorski obrys jest
           tam zbędny, a jego brak nie jest usterką — pierwsza wersja tego
           sprawdzenia zgłaszała pole zgody na dwóch podstronach. */
        if (el.type === "checkbox" || el.type === "radio") continue;
        const cs = getComputedStyle(el);
        const maGranice = parseFloat(cs.borderTopWidth) > 0 ||
                          cs.outlineStyle !== "none" ||
                          parseFloat(cs.borderBottomWidth) > 0;
        if (!maGranice)
          out.push(`${el.tagName.toLowerCase()}.${String(el.className).split(" ")[0]}`);
      }
      return [...new Set(out)];
    });
    for (const x of bezGranicy)
      blad(`${adres} — ${x} bez granicy przy wymuszonych kolorach systemu`);
  }
  await kontekst.close();
}

/* ======================================================================
   4. ODSTĘPY W TEKŚCIE (WCAG 1.4.12)

   Osoby z dysleksją zwiększają odstępy własnym arkuszem. Układ nie może
   się wtedy rozpaść ani uciąć tekstu.
   ====================================================================== */
{
  const kontekst = await przegladarka.newContext({ viewport: { width: 390, height: 844 } });
  const strona = await kontekst.newPage();
  await strona.addInitScript(() => {
    try { localStorage.setItem("sa-cookie-consent", "necessary"); } catch (e) {}
  });
  for (const adres of ["/", "/cennik", "/zapisy", "/bezpieczenstwo"]) {
    await strona.goto(ADRES + adres, { waitUntil: "domcontentloaded" });
    await strona.addStyleTag({
      content: `* { line-height: 1.5 !important; letter-spacing: 0.12em !important;
                    word-spacing: 0.16em !important; }
                p { margin-bottom: 2em !important; }`,
    });
    await strona.waitForTimeout(200);
    const w = await strona.evaluate(() => {
      const nadmiar = document.documentElement.scrollWidth - document.documentElement.clientWidth;
      let uciete = 0;
      for (const el of document.querySelectorAll("p,h1,h2,h3,h4,li,span,a,button")) {
        /* Elementy schowane przed okiem, a czytelne dla czytnika ekranu, MAJĄ
           być przycięte — na tym polega ten wzorzec. Zgłaszanie ich jako
           „ucięty tekst" to fałszywy alarm; pierwsza wersja tego audytu
           wypisywała je na każdej podstronie. */
        if (el.closest(".wizualnie-ukryte, .pulapka, .pomin-do-tresci")) continue;
        if (el.classList.contains("wizualnie-ukryte")) continue;
        if (el.scrollHeight > el.clientHeight + 2 && getComputedStyle(el).overflow === "hidden") uciete++;
      }
      return { nadmiar, uciete };
    });
    if (w.nadmiar > 1) blad(`${adres} — przy zwiększonych odstępach przewijanie w bok o ${w.nadmiar}px`);
    if (w.uciete > 0) blad(`${adres} — przy zwiększonych odstępach ${w.uciete} elementów ucina tekst`);
  }
  await kontekst.close();
}

/* ======================================================================
   5. STRONA BEZ JAVASCRIPTU
   ====================================================================== */
{
  const kontekst = await przegladarka.newContext({ javaScriptEnabled: false });
  const strona = await kontekst.newPage();
  for (const adres of ["/", "/zapisy", "/kontakt", "/cennik"]) {
    await strona.goto(ADRES + adres, { waitUntil: "domcontentloaded" });
    const w = await strona.evaluate(() => ({
      tekstu: document.body.innerText.trim().length,
      odnosnikow: document.querySelectorAll("a[href]").length,
      formularz: (() => {
        const f = document.querySelector("form");
        if (!f) return null;
        return { metoda: f.getAttribute("method"), cel: f.getAttribute("action") };
      })(),
    }));
    if (w.tekstu < 500) blad(`${adres} — bez JavaScriptu strona ma tylko ${w.tekstu} znaków treści`);
    if (w.odnosnikow < 10) blad(`${adres} — bez JavaScriptu tylko ${w.odnosnikow} odnośników`);
    if (w.formularz && (!w.formularz.metoda || !w.formularz.cel))
      blad(`${adres} — formularz bez JavaScriptu nie ma dokąd wysłać danych`);
  }
  await kontekst.close();
}

/* ======================================================================
   6. OGRANICZONY RUCH
   ====================================================================== */
{
  const kontekst = await przegladarka.newContext({ reducedMotion: "reduce" });
  const strona = await kontekst.newPage();
  await strona.goto(ADRES + "/", { waitUntil: "networkidle" });
  const ruch = await strona.evaluate(() => {
    let dlugie = 0;
    for (const el of document.querySelectorAll("*")) {
      const cs = getComputedStyle(el);
      const t = parseFloat(cs.transitionDuration) || 0;
      const a = parseFloat(cs.animationDuration) || 0;
      if (t > 0.1 || a > 0.1) dlugie++;
    }
    return { dlugie, przewijanie: getComputedStyle(document.documentElement).scrollBehavior };
  });
  if (ruch.dlugie > 0) uwaga(`przy ograniczonym ruchu ${ruch.dlugie} elementów wciąż animuje dłużej niż 0,1 s`);
  if (ruch.przewijanie === "smooth") uwaga("przy ograniczonym ruchu przewijanie wciąż jest płynne");
  await kontekst.close();
}

await przegladarka.close();

console.log(`\n  Sprawdzono ${licznik.stron} stron: ${licznik.naglowkow} nagłówków,` +
  ` ${licznik.obrazkow} obrazków, ${licznik.pol} pól formularzy,` +
  ` ${licznik.przystankow} przystanków tabulatora,` +
  ` ${licznik.tekstow} par tekst–tło.`);
console.log(`\n  BŁĘDY: ${bledy.length}`);
for (const b of bledy) console.log(`   ✗ ${b}`);
console.log(`\n  UWAGI: ${uwagi.length}`);
for (const u of uwagi) console.log(`   ! ${u}`);
console.log("");
process.exit(bledy.length ? 1 : 0);
