import { chromium } from "playwright";
const b = await chromium.launch();
const c = await b.newContext({ viewport:{width:1280,height:900} });
const p = await c.newPage();
await p.addInitScript(()=>{try{localStorage.setItem("sa-cookie-consent","necessary")}catch(e){}});
await p.goto("http://localhost:4331/", { waitUntil:"networkidle" });
const migawka = await p.locator("body").ariaSnapshot();
const wiersze = migawka.split("\n");
console.log(`  Drzewo dostępności strony głównej: ${wiersze.length} węzłów`);
console.log("  Pierwsze dwanaście, tak jak usłyszy je czytnik ekranu:\n");
for (const w of wiersze.slice(0, 12)) console.log("   " + w);
// szukamy elementów interaktywnych bez nazwy
const bezNazwy = wiersze.filter(w => /^\s*- (button|link|textbox|combobox|checkbox)\s*:?\s*$/.test(w));
console.log(`\n  Elementów interaktywnych bez nazwy: ${bezNazwy.length}`);
for (const w of bezNazwy.slice(0,6)) console.log("   ✗ " + w.trim());
await b.close();
