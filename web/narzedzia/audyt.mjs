/* ==========================================================================
   AUDYT ZBUDOWANEGO SERWISU

   Analiza statyczna katalogu dist. Sprawdza to, co da się rozstrzygnąć bez
   przeglądarki: odnośniki, zakotwiczenia, obrazy, nagłówki, identyfikatory,
   opisy stron, dane strukturalne, spójność treści i typografię.

   Rzeczy wymagające obliczonych stylów — kontrast, siatki, układ — sprawdza
   osobny przebieg w przeglądarce.

   Uruchomienie:  node narzedzia/audyt.mjs
   ========================================================================== */

import { readdirSync, statSync, readFileSync, existsSync } from "node:fs";
import path from "node:path";

const D = "dist";
const bledy = [];
const ostrzezenia = [];
const info = [];

const blad = (kategoria, tresc) => bledy.push(`${kategoria}: ${tresc}`);
const ostrzez = (kategoria, tresc) => ostrzezenia.push(`${kategoria}: ${tresc}`);

/* ---------- zebranie plików ---------- */
const wszystkie = [];
(function chodz(k) {
  for (const w of readdirSync(k)) {
    const p = path.join(k, w);
    statSync(p).isDirectory() ? chodz(p) : wszystkie.push(p);
  }
})(D);

const strony = wszystkie
  .filter((p) => p.endsWith(".html"))
  .map((p) => ({
    plik: p,
    adres:
      "/" +
      path
        .relative(D, p)
        .replace(/\\/g, "/")
        .replace(/index\.html$/, "")
        .replace(/\.html$/, ""),
    tresc: readFileSync(p, "utf8"),
  }));

info.push(`stron HTML: ${strony.length}`);

/* Strona przekierowująca nie ma treści i nie podlega większości reguł. */
const przekierowania = strony.filter((s) => /http-equiv="refresh"/i.test(s.tresc));
const realne = strony.filter((s) => !przekierowania.includes(s));
info.push(`w tym przekierowań: ${przekierowania.length}`);

const bezZnacznikow = (t) =>
  t
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ");

/* ---------- 1. ODNOŚNIKI WEWNĘTRZNE ---------- */
const istnieje = (adres) =>
  [
    path.join(D, adres),
    path.join(D, adres, "index.html"),
    path.join(D, adres + ".html"),
  ].some(existsSync);

const wszystkieId = new Map();
for (const s of realne) {
  const ids = [...s.tresc.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]);
  wszystkieId.set(s.adres.replace(/\/+$/, "") || "/", new Set(ids));
  const powtorzone = ids.filter((x, i) => ids.indexOf(x) !== i);
  if (powtorzone.length) {
    blad("identyfikatory", `${s.adres} — powtórzone: ${[...new Set(powtorzone)].join(", ")}`);
  }
}

let sprawdzonychOdnosnikow = 0;
for (const s of strony) {
  for (const m of s.tresc.matchAll(/(?:href|src)="([^"]+)"/g)) {
    const cel = m[1];
    if (!cel.startsWith("/")) continue;
    sprawdzonychOdnosnikow++;
    const [sciezka, kotwica] = cel.split("#");
    if (sciezka && !istnieje(sciezka)) {
      blad("martwy odnośnik", `${s.adres} → ${cel}`);
      continue;
    }
    if (kotwica) {
      /* Adresy stron kończą się ukośnikiem, odnośniki zwykle nie — bez
         wyrównania obu form każde zakotwiczenie wyglądałoby na martwe. */
      const norm = (a) => (a.replace(/\/+$/, "") || "/");
      const docelowa = norm(sciezka || s.adres);
      const zbior = wszystkieId.get(docelowa) ?? wszystkieId.get(docelowa + "/");
      if (!zbior || !zbior.has(kotwica))
        ostrzez("zakotwiczenie", `${s.adres} → ${cel}`);
    }
  }
}
info.push(`sprawdzonych odnośników wewnętrznych: ${sprawdzonychOdnosnikow}`);

/* ---------- 2. ODNOŚNIKI ZEWNĘTRZNE ---------- */
const zewnetrzne = new Set();
for (const s of realne) {
  for (const m of s.tresc.matchAll(/href="(https?:\/\/[^"]+)"/g)) zewnetrzne.add(m[1]);
}
info.push(`odnośników zewnętrznych: ${zewnetrzne.size}`);
for (const a of zewnetrzne) {
  if (!a.startsWith("https://")) blad("odnośnik zewnętrzny", `bez szyfrowania: ${a}`);
}

/* ---------- 3. OBRAZY ---------- */
let obrazow = 0;
for (const s of realne) {
  for (const m of s.tresc.matchAll(/<img[^>]*>/g)) {
    const t = m[0];
    obrazow++;
    const src = /src="([^"]+)"/.exec(t)?.[1];
    if (!src) { blad("obraz", `${s.adres} — brak atrybutu src`); continue; }
    if (src.startsWith("/") && !existsSync(path.join(D, src))) {
      blad("obraz", `${s.adres} — brak pliku ${src}`);
    }
    const dekoracyjny = /aria-hidden="true"/.test(t);
    const alt = /alt="([^"]*)"/.exec(t);
    if (!alt) blad("obraz", `${s.adres} — brak opisu alternatywnego: ${src}`);
    else if (!dekoracyjny && !alt[1].trim())
      blad("obraz", `${s.adres} — pusty opis przy obrazie treściowym: ${src}`);
    else if (dekoracyjny && alt[1].trim())
      ostrzez("obraz", `${s.adres} — dekoracyjny, a ma opis: ${src}`);
    if (!/loading="/.test(t)) ostrzez("obraz", `${s.adres} — brak strategii ładowania: ${src}`);
  }
}
info.push(`obrazów w treści: ${obrazow}`);

/* Pliki obrazów, do których nikt nie sięga. */
const uzywaneObrazy = new Set();
for (const s of strony)
  for (const m of s.tresc.matchAll(/\/(?:foto|zdjecia|logo)\/[^"'\s)]+/g))
    uzywaneObrazy.add(m[0]);
for (const p of wszystkie) {
  const rel = "/" + path.relative(D, p).replace(/\\/g, "/");
  if (!/\.(webp|jpe?g|png|svg)$/i.test(rel)) continue;
  if (/^\/(foto|zdjecia)\//.test(rel) && !uzywaneObrazy.has(rel))
    ostrzez("nieużywany plik", rel);
}

/* ---------- 4. NAGŁÓWKI ---------- */
for (const s of realne) {
  const poziomy = [...s.tresc.matchAll(/<h([1-6])[\s>]/g)].map((m) => Number(m[1]));
  const h1 = poziomy.filter((p) => p === 1).length;
  if (h1 === 0) blad("nagłówki", `${s.adres} — brak nagłówka pierwszego poziomu`);
  if (h1 > 1) blad("nagłówki", `${s.adres} — ${h1} nagłówki pierwszego poziomu`);
  for (let i = 1; i < poziomy.length; i++) {
    if (poziomy[i] - poziomy[i - 1] > 1)
      blad("nagłówki", `${s.adres} — przeskok z h${poziomy[i - 1]} na h${poziomy[i]}`);
  }
}

/* ---------- 5. OPISY STRON ---------- */
const tytuly = new Map();
const opisy = new Map();
for (const s of realne) {
  const t = /<title>([^<]*)<\/title>/.exec(s.tresc)?.[1] ?? "";
  const o = /<meta name="description" content="([^"]*)"/.exec(s.tresc)?.[1] ?? "";
  if (!t) blad("metadane", `${s.adres} — brak tytułu`);
  if (!o) blad("metadane", `${s.adres} — brak opisu`);
  if (t.length > 65) ostrzez("metadane", `${s.adres} — tytuł ${t.length} znaków (powyżej 65)`);
  if (o && (o.length < 70 || o.length > 165))
    ostrzez("metadane", `${s.adres} — opis ${o.length} znaków (poza 70–165)`);
  if (tytuly.has(t)) blad("metadane", `powtórzony tytuł: ${s.adres} i ${tytuly.get(t)}`);
  else tytuly.set(t, s.adres);
  if (opisy.has(o)) blad("metadane", `powtórzony opis: ${s.adres} i ${opisy.get(o)}`);
  else opisy.set(o, s.adres);
  if (!/lang="pl"/.test(s.tresc)) blad("metadane", `${s.adres} — brak języka strony`);
}

/* ---------- 6. SPÓJNOŚĆ TREŚCI ---------- */
const kontakt = { telefon: 0, email: 0 };
const wzorceZakazane = {
  "skuteczniejsze od nauczania": "twierdzenie odrzucone w aneksie",
  "nie tłumaczy w głowie": "obietnica rezultatu bez pomiaru",
  "bać się mówić": "obietnica terapeutyczna",
  "odblokowują szybciej": "twierdzenie o szybszym efekcie",
  "rekomendowana przez OECD": "organizacje nie rekomendują metody",
  "Raport o postępach": "obietnica bez narzędzia",
  ": do ustalenia": "zastępnik w miejscu wartości",
  "[do uzupełnienia]": "zastępnik w nawiasie",
  "Lorem": "tekst zastępczy",
  "TODO": "notatka robocza",
  "rdzeń": "termin wycofany ze słownika marki",
  "Rdzeń": "termin wycofany ze słownika marki",
  /* Dolna granica liczebności grupy jest warunkiem jej uruchomienia, więc
     zapis „do ośmiu" ją przemilcza. Wykryte w audycie: sześć podstron nadal
     tak mówiło, mimo że cennik i „O nas" były już poprawione. */
  "do 8 osób": "liczebność bez dolnej granicy — powinno być „5–8"",
  "do ośmiu": "liczebność bez dolnej granicy — powinno być „5–8"",
};
for (const s of realne) {
  const tekst = bezZnacznikow(s.tresc);
  for (const [wzor, powod] of Object.entries(wzorceZakazane)) {
    if (tekst.includes(wzor)) blad("treść", `${s.adres} — „${wzor}" (${powod})`);
  }
  if (tekst.includes("508 069 007")) kontakt.telefon++;
  if (tekst.includes("kontakt@skilful.pl")) kontakt.email++;
  /* Cudzysłowy proste w polskim tekście. */
  const proste = (tekst.match(/(?<=\s)"[a-ząćęłńóśźż]/gi) ?? []).length;
  if (proste) ostrzez("typografia", `${s.adres} — ${proste} × cudzysłów prosty zamiast „…"`);
  /* Trzy kropki zamiast wielokropka. */
  if (/\.\.\./.test(tekst)) ostrzez("typografia", `${s.adres} — trzy kropki zamiast wielokropka`);
}
info.push(`stron z numerem telefonu: ${kontakt.telefon} / ${realne.length}`);
info.push(`stron z adresem e-mail: ${kontakt.email} / ${realne.length}`);

/* Ceny muszą brzmieć tak samo wszędzie, gdzie występują. */
const ceny = new Map();
for (const s of realne) {
  const tekst = bezZnacznikow(s.tresc);
  for (const m of tekst.matchAll(/(\d{2,4})\s*zł/g)) {
    const k = m[1];
    if (!ceny.has(k)) ceny.set(k, new Set());
    ceny.get(k).add(s.adres);
  }
}
const cennikowe = new Set(["200", "250", "360", "400", "500", "600", "350", "130", "150", "180", "50"]);
for (const [kwota, gdzie] of ceny) {
  if (!cennikowe.has(kwota))
    ostrzez("ceny", `kwota ${kwota} zł spoza cennika, na: ${[...gdzie].join(", ")}`);
}

/* ---------- 7. DANE STRUKTURALNE ---------- */
for (const s of realne) {
  for (const m of s.tresc.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    try {
      const dane = JSON.parse(m[1]);
      if (!dane["@context"] || !dane["@type"])
        blad("dane strukturalne", `${s.adres} — brak @context lub @type`);
    } catch (e) {
      blad("dane strukturalne", `${s.adres} — niepoprawny JSON: ${e.message}`);
    }
  }
}

/* ---------- 8. FORMULARZE ---------- */
for (const s of realne) {
  for (const f of s.tresc.matchAll(/<form[\s\S]*?<\/form>/g)) {
    const t = f[0];
    const pola = [...t.matchAll(/<(input|select|textarea)[^>]*>/g)].map((m) => m[0]);
    for (const pole of pola) {
      const typ = /type="([^"]+)"/.exec(pole)?.[1] ?? "text";
      if (["hidden", "submit", "button"].includes(typ)) continue;
      const id = /id="([^"]+)"/.exec(pole)?.[1];
      if (!id) { blad("formularz", `${s.adres} — pole bez identyfikatora: ${pole.slice(0, 60)}`); continue; }
      if (!new RegExp(`<label[^>]*for="${id}"`).test(t))
        blad("formularz", `${s.adres} — pole ${id} bez etykiety`);
    }
    if (!/method="post"/i.test(t)) ostrzez("formularz", `${s.adres} — brak metody post`);
  }
}

/* ---------- 9. PLIKI TOWARZYSZĄCE ---------- */
for (const p of ["robots.txt", "sitemap.xml", "sitemap-0.xml", "site.webmanifest", "CNAME", "404.html"]) {
  if (!existsSync(path.join(D, p))) blad("pliki", `brak ${p}`);
}
const mapa = readFileSync(path.join(D, "sitemap-0.xml"), "utf8");
const wMapie = [...mapa.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) =>
  m[1].replace("https://skilful.pl", "").replace(/\/$/, "") || "/",
);
for (const s of realne) {
  const a = s.adres.replace(/\/$/, "") || "/";
  const formalna = ["/regulamin", "/polityka-prywatnosci", "/klauzula-rodo"].includes(a);
  const czterysta = a === "/404";
  if (!formalna && !czterysta && !wMapie.includes(a))
    blad("mapa serwisu", `${a} nie występuje w mapie`);
  if ((formalna || czterysta) && wMapie.includes(a))
    blad("mapa serwisu", `${a} nie powinno być w mapie`);
}
info.push(`adresów w mapie serwisu: ${wMapie.length}`);

/* ---------- 10. WAGA STRON ---------- */
for (const s of realne) {
  const kb = Buffer.byteLength(s.tresc) / 1024;
  if (kb > 120) ostrzez("waga", `${s.adres} — ${kb.toFixed(0)} kB HTML`);
}

/* ---------- WYNIK ---------- */
console.log("\n  INFORMACJE");
for (const i of info) console.log("   ", i);
console.log(`\n  BŁĘDY: ${bledy.length}`);
for (const b of bledy) console.log("   ✗", b);
console.log(`\n  OSTRZEŻENIA: ${ostrzezenia.length}`);
for (const o of ostrzezenia) console.log("   !", o);
console.log();
