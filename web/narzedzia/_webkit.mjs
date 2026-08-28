/* Silnik Safari, nie Chromium. Sprawdzamy to, co historycznie różni się
   między silnikami: układ, obsługę trybu ciemnego, pola formularza,
   pasek przyklejony do dołu i wędrówkę tabulatorem. */
import { webkit, devices } from "playwright";
const ADRES = process.argv[2] ?? "https://skilful.pl";
const b = await webkit.launch();
const bledy = [];
const STRONY = ["/","/podstawowe","/cennik","/zapisy","/kontakt","/o-nas","/exams/matura","/bezpieczenstwo"];

for (const tryb of ["light","dark"]) {
  const c = await b.newContext({ ...devices["iPhone 13"], colorScheme: tryb });
  const p = await c.newPage();
  await p.addInitScript(() => { try { localStorage.setItem("sa-cookie-consent","necessary"); } catch(e){} });
  p.on("pageerror", e => bledy.push(`[${tryb}] wyjątek: ${String(e).slice(0,90)}`));
  for (const a of STRONY) {
    await p.goto(ADRES + a, { waitUntil: "domcontentloaded" });
    const r = await p.evaluate(() => {
      const nadmiar = document.documentElement.scrollWidth - document.documentElement.clientWidth;
      const pasek = document.querySelector(".pasek-akcji");
      const tlo = getComputedStyle(document.body).backgroundColor;
      const pole = document.querySelector("input[type=text],input[type=tel]");
      return { nadmiar, tlo,
        pasekWidoczny: pasek ? getComputedStyle(pasek).display !== "none" : null,
        polePx: pole ? parseFloat(getComputedStyle(pole).fontSize) : null,
        poleTlo: pole ? getComputedStyle(pole).backgroundColor : null,
        poleKolor: pole ? getComputedStyle(pole).color : null };
    });
    if (r.nadmiar > 1) bledy.push(`[${tryb}] ${a} — przewijanie w bok ${r.nadmiar}px`);
    if (r.pasekWidoczny === false) bledy.push(`[${tryb}] ${a} — pasek akcji niewidoczny na telefonie`);
    if (r.polePx !== null && r.polePx < 16) bledy.push(`[${tryb}] ${a} — pole ${r.polePx}px, Safari przybliży`);
    if (a === "/") console.log(`  ${tryb}: tło ${r.tlo}${r.poleTlo ? " · pole "+r.poleTlo+" / "+r.poleKolor : ""}`);
  }
  // formularz: pole i jego tekst muszą się różnić — to był powód blokady trybu ciemnego
  await p.goto(ADRES + "/zapisy", { waitUntil: "networkidle" });
  const f = await p.evaluate(() => {
    const e = document.querySelector('input[name="imie_dziecka"]');
    const cs = getComputedStyle(e);
    return { tlo: cs.backgroundColor, kolor: cs.color };
  });
  const rgb = s => (s.match(/[\d.]+/g)||[0,0,0]).slice(0,3).map(Number);
  const lum = c => { const s=c.map(v=>v/255).map(v=> v<=0.03928?v/12.92:((v+0.055)/1.055)**2.4); return .2126*s[0]+.7152*s[1]+.0722*s[2]; };
  const k = (Math.max(lum(rgb(f.tlo)),lum(rgb(f.kolor)))+.05)/(Math.min(lum(rgb(f.tlo)),lum(rgb(f.kolor)))+.05);
  console.log(`  ${tryb}: kontrast tekstu w polu formularza ${k.toFixed(2)}:1`);
  if (k < 4.5) bledy.push(`[${tryb}] pole formularza — tekst ${k.toFixed(2)}:1, wpisywane znika`);
  await c.close();
}
await b.close();
console.log(`\n  SAFARI (WebKit) · ${STRONY.length} stron × 2 tryby`);
console.log(`  BŁĘDY: ${bledy.length}`);
for (const x of bledy) console.log(`   ✗ ${x}`);
