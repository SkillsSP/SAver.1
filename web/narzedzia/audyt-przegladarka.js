/* ==========================================================================
   AUDYT W PRZEGLĄDARCE

   Sprawdza to, czego analiza statyczna nie rozstrzygnie: obliczone kolory,
   kontrast każdej pary tekst–tło, układ siatek na wielu szerokościach,
   przewijanie poziome i cele dotykowe.

   Kod wklejany do konsoli na uruchomionym podglądzie. Zwraca obiekt z listą
   znalezisk, żeby wynik dało się porównać między przebiegami.
   ========================================================================== */

(async () => {
  const STRONY = [
    "/", "/program", "/podstawowe", "/fakultety", "/indywidualne",
    "/exams", "/exams/egzamin-osmoklasisty", "/exams/matura",
    "/cennik", "/zapisy", "/kontakt", "/o-nas", "/metoda",
    "/bezpieczenstwo", "/regulamin", "/polityka-prywatnosci", "/klauzula-rodo",
    /* Ukryte przed wyszukiwarkami, ale nie przed audytem — mają działać
       zanim je odsłonimy, a nie dopiero potem. */
    "/terminarz", "/poradnik",
  ];
  const SZEROKOSCI = [360, 768, 1024, 1280];

  const lum = (c) => {
    const s = c.map((v) => v / 255).map((v) =>
      v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
    return 0.2126 * s[0] + 0.7152 * s[1] + 0.0722 * s[2];
  };
  const rgb = (s) => {
    const m = s.match(/[\d.]+/g);
    return m ? m.slice(0, 3).map(Number) : null;
  };
  const kontrast = (a, b) => {
    const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p);
    return (x + 0.05) / (y + 0.05);
  };

  /* Kolor tła bierzemy z pierwszego przodka, który go faktycznie maluje —
     `transparent` na elemencie nie znaczy, że tekst leży na bieli. */
  const tloPod = (el, okno) => {
    let e = el;
    while (e && e !== okno.document.documentElement) {
      const t = okno.getComputedStyle(e).backgroundColor;
      const c = rgb(t);
      if (c && !/rgba\(0, 0, 0, 0\)/.test(t)) {
        const alfa = t.match(/[\d.]+\)$/);
        if (!alfa || Number(alfa[0].slice(0, -1)) > 0.9) return c;
      }
      e = e.parentElement;
    }
    return [251, 248, 243];
  };

  const znaleziska = { kontrast: [], siatki: [], przewijanie: [], cele: [], inne: [] };
  let sprawdzonychTekstow = 0;

  const ramka = document.createElement("iframe");
  ramka.style.cssText = "position:fixed;left:-9999px;top:0;border:0;height:900px";
  document.body.appendChild(ramka);

  for (const strona of STRONY) {
    for (const szer of SZEROKOSCI) {
      ramka.style.width = szer + "px";
      await new Promise((r) => { ramka.onload = r; ramka.src = strona; });
      const d = ramka.contentDocument;
      const w = ramka.contentWindow;

      /* --- przewijanie poziome: na telefonie nie wolno --- */
      if (d.documentElement.scrollWidth > szer + 1) {
        znaleziska.przewijanie.push(
          `${strona} @${szer}px — treść szersza o ${d.documentElement.scrollWidth - szer}px`);
      }

      /* --- siatki --- */
      for (const g of d.querySelectorAll(".siatka")) {
        const dzieci = [...g.children];
        if (dzieci.length < 2) continue;
        const kol = new Set(dzieci.map((e) => Math.round(e.getBoundingClientRect().left))).size;
        const ostatni = dzieci.length % kol || kol;
        if (kol > 1 && dzieci.length > kol && ostatni === 1) {
          znaleziska.siatki.push(
            `${strona} @${szer}px — ${g.className} zostawia sierotkę (${dzieci.length}/${kol})`);
        }
      }

      /* Kontrast i cele dotykowe liczymy raz, na jednej szerokości —
         kolory od niej nie zależą, a przebieg po wszystkich byłby czterokrotnie
         dłuższy bez żadnego zysku. */
      if (szer !== 1280) continue;

      for (const el of d.querySelectorAll("p,li,a,span,h1,h2,h3,h4,strong,label,button,summary,figcaption,td,th")) {
        const tekst = [...el.childNodes]
          .filter((n) => n.nodeType === 3).map((n) => n.textContent.trim()).join("");
        if (!tekst) continue;
        const cs = w.getComputedStyle(el);
        if (cs.display === "none" || cs.visibility === "hidden" || cs.opacity === "0") continue;
        const r = el.getBoundingClientRect();
        if (r.width < 2 || r.height < 2) continue;
        const kolor = rgb(cs.color);
        if (!kolor) continue;
        sprawdzonychTekstow++;
        const tlo = tloPod(el, w);
        const k = kontrast(kolor, tlo);
        const px = parseFloat(cs.fontSize);
        const gruby = Number(cs.fontWeight) >= 700;
        const prog = px >= 24 || (px >= 18.66 && gruby) ? 3 : 4.5;
        if (k < prog) {
          znaleziska.kontrast.push(
            `${strona} — ${k.toFixed(2)}:1 (próg ${prog}) ${el.tagName}.${el.className}` +
            ` „${tekst.slice(0, 40)}"`);
        }
      }

      /* --- cele dotykowe --- */
      for (const el of d.querySelectorAll("a,button,input,select,textarea")) {
        const cs = w.getComputedStyle(el);
        if (cs.display === "none" || el.type === "hidden") continue;
        const r = el.getBoundingClientRect();
        if (r.width < 1 || r.height < 1) continue;
        if (r.height < 24 && el.closest("nav,footer,.pasek-uzytkowy")) {
          znaleziska.cele.push(
            `${strona} — ${Math.round(r.height)}px wysokości: ${el.tagName} „${el.textContent.trim().slice(0, 30)}"`);
        }
      }

      /* --- jeden h1, obecność punktów orientacyjnych --- */
      if (d.querySelectorAll("main").length !== 1)
        znaleziska.inne.push(`${strona} — liczba obszarów głównych: ${d.querySelectorAll("main").length}`);
      if (!d.querySelector("footer")) znaleziska.inne.push(`${strona} — brak stopki`);
    }
  }

  ramka.remove();
  const suma = Object.values(znaleziska).reduce((a, b) => a + b.length, 0);
  return JSON.stringify({
    stron: STRONY.length,
    szerokosci: SZEROKOSCI,
    sprawdzonychTekstow,
    znalezisk: suma,
    ...znaleziska,
  }, null, 1);
})();
