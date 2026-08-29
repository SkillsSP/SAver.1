/* ==========================================================================
   ODPORNOŚĆ FORMULARZA NA AUTOMATY

   Zabezpieczenia formularza opisałem i naprawiłem, ale nigdy nie próbowałem
   ich złamać. To narzędzie próbuje — udając zachowania, które faktycznie
   stosują roboty rozsyłające spam przez formularze kontaktowe.

   ŻADEN Z TYCH TESTÓW NIE WYSYŁA WIADOMOŚCI. To nie jest deklaracja, tylko
   konsekwencja kolejności sprawdzeń w funkcji przyjmującej zgłoszenia:

     1. inna metoda niż POST      → 405, koniec
     2. wypełniona pułapka        → 200 bez wysyłki, koniec
     3. zbyt szybkie wypełnienie  → 200 bez wysyłki, koniec
     4. przekroczony limit z adresu → 429, koniec
     5. braki w polach            → 400, koniec
     6. dopiero tutaj wysyłka

   Wszystkie próby kończą się najpóźniej na piątym kroku. Limit z jednego
   adresu sprawdzamy zgłoszeniami z brakami w polach — one docierają do
   licznika (krok 4) i zatrzymują się na walidacji (krok 5), więc liczą się
   do limitu, a poczta nie wychodzi.

   UWAGA: ten test zużywa godzinny limit TWOJEGO adresu. Po jego uruchomieniu
   własny formularz przez godzinę odpowie „za dużo zgłoszeń". Rodziców to nie
   dotyczy — liczy się osobno dla każdego adresu.

   CO TEN SKRYPT ZNALAZŁ ZA PIERWSZYM RAZEM. Limit zgłoszeń z jednego adresu
   nie działał w ogóle. Dwadzieścia cztery zgłoszenia w ciągu minuty przy progu
   trzech na godzinę — zero odrzuconych, bo licznik siedział w pamięci
   instancji, a każde zapytanie dostawało świeżą. Zabezpieczenie wyglądało
   poprawnie w kodzie i miało nawet komentarz przyznający się do słabości,
   ale nikt nigdy nie sprawdził, czy w ogóle się odzywa. Poprawione licznikiem
   w bazie (migracja 20260829090000).

   PO CO TO, SKORO WSZYSTKO PRZECHODZI. Bo zabezpieczenie, którego nikt nie
   próbował złamać, jest założeniem, a nie zabezpieczeniem. Ten skrypt zamienia
   opis w sprawdzenie i wychwyci dzień, w którym ktoś przy okazji innej zmiany
   przestawi kolejność kroków albo usunie pułapkę.

     npm run test:odpornosc
   ========================================================================== */

const ADRES = process.argv[2]
  ?? "https://nmhwdjqmmeovgoersjll.supabase.co/functions/v1/zapis";
const ZRODLO = "https://skilful.pl";

const bledy = [];
const zdane = [];

const wyslij = async (opis, ustawienia) => {
  const odp = await fetch(ADRES, ustawienia);
  let tresc = null;
  try { tresc = await odp.json(); } catch { /* pusta odpowiedź jest w porządku */ }
  return { opis, status: odp.status, tresc, naglowki: odp.headers };
};

const formularz = (pola) => {
  const dane = new URLSearchParams();
  for (const [k, v] of Object.entries(pola)) dane.set(k, String(v));
  return {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded", origin: ZRODLO },
    body: dane.toString(),
  };
};

const sprawdz = (warunek, opis) => (warunek ? zdane.push(opis) : bledy.push(opis));

/* ---- 1. Metoda inna niż POST ---- */
{
  for (const metoda of ["GET", "PUT", "DELETE"]) {
    const r = await wyslij(metoda, { method: metoda, headers: { origin: ZRODLO } });
    sprawdz(r.status === 405, `${metoda} odrzucone kodem 405 (było ${r.status})`);
  }
}

/* ---- 2. Pułapka na roboty ---- */
{
  /* Automaty wypełniają wszystkie pola, także te niewidoczne. */
  const r = await wyslij("pułapka", formularz({
    rodzaj: "zapis", imie_dziecka: "Bot", wiek_dziecka: "9",
    telefon: "500600700", zgoda: "on",
    firma_www: "http://kasyno.example",
  }));
  sprawdz(r.status === 200 && r.tresc?.ok === true,
    `wypełniona pułapka udaje sukces i nic nie wysyła (kod ${r.status})`);

  /* Stara nazwa pola też musi działać — mogła zostać w pamięci przeglądarki. */
  const r2 = await wyslij("pułapka stara", formularz({
    rodzaj: "zapis", imie_dziecka: "Bot", wiek_dziecka: "9",
    telefon: "500600700", zgoda: "on", firma: "http://kasyno.example",
  }));
  sprawdz(r2.status === 200 && r2.tresc?.ok === true,
    `stara nazwa pola pułapki nadal łapie (kod ${r2.status})`);
}

/* ---- 3. Wypełnienie szybsze niż człowiek ---- */
{
  const r = await wyslij("czas", formularz({
    rodzaj: "zapis", imie_dziecka: "Bot", wiek_dziecka: "9",
    telefon: "500600700", zgoda: "on",
    otwarto: String(Date.now() - 200), /* dwie dziesiąte sekundy temu */
  }));
  sprawdz(r.status === 200 && r.tresc?.ok === true,
    `zgłoszenie wypełnione w 0,2 s zatrzymane bez wysyłki (kod ${r.status})`);
}

/* ---- 4. Braki w polach ---- */
{
  const r = await wyslij("braki", formularz({ rodzaj: "zapis" }));
  sprawdz(r.status === 400 && /Brakuje pól/.test(r.tresc?.blad ?? ""),
    `puste zgłoszenie odrzucone kodem 400 z listą braków (kod ${r.status})`);

  /* Sama zgoda bez danych też nie może przejść. */
  const r2 = await wyslij("sama zgoda", formularz({ rodzaj: "zapis", zgoda: "on" }));
  sprawdz(r2.status === 400, `zgoda bez danych dziecka odrzucona (kod ${r2.status})`);
}

/* ---- 5. Limit zgłoszeń z jednego adresu ---- */
{
  /* Zgłoszenia z brakami docierają do licznika i zatrzymują się na walidacji,
     więc liczą się do limitu, a poczta nie wychodzi. */
  const kody = [];
  for (let i = 0; i < 12; i++) {
    const r = await wyslij(`seria ${i}`, formularz({ rodzaj: "zapis" }));
    kody.push(r.status);
  }
  const zablokowane = kody.filter((k) => k === 429).length;
  sprawdz(zablokowane > 0,
    `limit z jednego adresu zadziałał po serii zgłoszeń (kody: ${kody.join(", ")})`);
}

/* ---- 6. Ograniczenie źródła ---- */
{
  const odp = await fetch(ADRES, {
    method: "OPTIONS", headers: { origin: "https://podszywacz.example" },
  });
  const dozwolone = odp.headers.get("access-control-allow-origin");
  sprawdz(dozwolone !== "https://podszywacz.example",
    `obce źródło nie dostaje zgody na siebie (odesłano: ${dozwolone})`);
}

/* ---- 7. Zgłoszenie w formacie JSON, nie z formularza ---- */
{
  /* Automaty często wysyłają JSON zamiast danych formularza — pułapka musi
     działać tak samo. */
  const r = await wyslij("json", {
    method: "POST",
    headers: { "content-type": "application/json", origin: ZRODLO },
    body: JSON.stringify({
      rodzaj: "zapis", imie_dziecka: "Bot", wiek_dziecka: "9",
      telefon: "500600700", zgoda: true, firma_www: "http://kasyno.example",
    }),
  });
  sprawdz(r.status === 200 && r.tresc?.ok === true,
    `pułapka działa też przy zgłoszeniu w formacie JSON (kod ${r.status})`);
}

console.log(`\n  Prób: ${zdane.length + bledy.length} · żadna nie wysłała wiadomości\n`);
console.log(`  ZDANE: ${zdane.length}`);
for (const z of zdane) console.log(`   ✓ ${z}`);
console.log(`\n  NIEZDANE: ${bledy.length}`);
for (const b of bledy) console.log(`   ✗ ${b}`);
console.log("");
process.exit(bledy.length ? 1 : 0);
