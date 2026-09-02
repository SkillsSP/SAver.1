/* ==========================================================================
   TYPOGRAFIA POLSKA — POZA SIEROTAMI

   Sieroty (samotne „w", „i", „z" na końcu wiersza) wiąże już krok budowania
   strony. Reszta polskich zasad składu nie była sprawdzana nigdy, a to
   właśnie po nich widać różnicę między tekstem złożonym a wklejonym.

   CO SPRAWDZAMY — i dlaczego akurat to:

     · cudzysłowy — polski cudzysłów to „ ", nie " ". Prosty cudzysłów
       maszynowy jest w polskim tekście po prostu błędem,
     · wielokropek — jeden znak …, nie trzy kropki,
     · myślnik w zdaniu — półpauza – albo pauza — w otoczeniu spacji.
       Łącznik „-" ze spacjami jest błędem, choć wygląda podobnie,
     · zakresy liczb — „7–9 lat" przez półpauzę bez spacji, nie przez łącznik,
     · znak mnożenia — „2 × 45 min", nie „2x45",
     · spacja nierozdzielająca przed jednostką — „200 zł" nie ma prawa złamać
       się między liczbą a walutą na końcu wiersza,
     · podwójne spacje i spacja przed przecinkiem — ślady po przeklejaniu,
     · SKLEJENIA na granicy znacznika — odnośnik albo wartość z danych
       przyklejona do poprzedniego zdania. Sprawdzane w drzewie dokumentu,
       nie po znakach; opis przy funkcji `sklejenia` niżej.

   PODZIAŁ NA BŁĘDY I UWAGI jest celowy. Prosty cudzysłów albo spacja przed
   przecinkiem to jednoznaczna pomyłka. Brak spacji nierozdzielającej przed
   jednostką psuje skład tylko wtedy, gdy akurat wypadnie na końcu wiersza —
   to warto poprawić, ale nie warto z tego robić awarii budowania.

   Sprawdzamy treść wyrenderowaną, czyli dokładnie to, co widzi rodzic.

     npm run test:typografia                   (na żywej stronie)
     npm run test:typografia -- http://localhost:4331
   ========================================================================== */

import { chromium } from "playwright";

const ADRES = process.argv[2] ?? "https://skilful.pl";

const STRONY = [
  "/", "/program", "/podstawowe", "/fakultety", "/indywidualne",
  "/exams", "/exams/egzamin-osmoklasisty", "/exams/matura",
  "/cennik", "/zapisy", "/kontakt", "/o-nas", "/metoda",
  "/bezpieczenstwo", "/regulamin", "/polityka-prywatnosci", "/klauzula-rodo",
  "/terminarz", "/poradnik", "/404",
];

const NBSP = " ";

/* ===========================================================================
   SKLEJENIA — SPRAWDZANE W DRZEWIE DOKUMENTU, NIE PO ZNAKACH

   Odnośnik albo wartość wstawiana z danych potrafi przykleić się do poprzedniego
   zdania: „na tej samej ścieżce.Poznajcie zespół", „Kamil Dumała iPatryk Moltu".
   Bierze się to stąd, że w pliku źródłowym znacznik stoi w nowym wierszu, a
   składnia Astro usuwa odstęp zawierający złamanie wiersza między tekstem
   a elementem. W kodzie wygląda to więc bez zarzutu i widać dopiero na stronie.

   PIERWSZE PODEJŚCIE SZUKAŁO PO ZNAKACH i było złe z dwóch stron naraz.
   Zgłaszało kropkę wewnątrz adresu „kontakt@skilful.pl" jako brak odstępu po
   zdaniu — cztery fałszywe alarmy na siedem trafień. Jednocześnie nie widziało
   sklejeń dwóch małych liter, bo rozpoznawało tylko styk małej z wielką.

   Teraz pytamy dokument wprost: czy dwa sąsiadujące fragmenty tekstu, między
   którymi przebiega granica znacznika, stykają się bez odstępu — i czy stoją
   w tym samym bloku. Ten drugi warunek jest konieczny: koniec akapitu i początek
   następnego też stykają się bez spacji, ale dzieli je złamanie wiersza, więc
   sklejeniem nie są. O tym, co jest blokiem, rozstrzyga wyliczony styl, a nie
   nazwa znacznika — `display` bywa zmieniony w arkuszu.
   =========================================================================== */
async function sklejenia(strona) {
  return strona.evaluate(() => {
    /* CAŁE BODY, NIE SAMO MAIN. Sprawdzanie samej treści głównej przepuściło
       sklejenie w banerze zgody — „Szczegóły w<a>polityce prywatności</a>"
       wyszło na stronie jako „Szczegóły wpolityce prywatności". Baner, nagłówek,
       stopka i pasek akcji stoją poza `main`, a rodzic czyta je tak samo.
       Zobaczyłem to dopiero na zrzucie ekranu, czyli okiem, a nie pomiarem —
       zakres sprawdzenia był węższy niż zakres problemu. */
    const korzen = document.body;
    const POMIJANE = new Set(["SCRIPT", "STYLE", "NOSCRIPT", "TEMPLATE"]);

    const wezly = [];
    const chodzik = document.createTreeWalker(korzen, NodeFilter.SHOW_TEXT, {
      acceptNode(n) {
        const rodzic = n.parentElement;
        if (!rodzic) return NodeFilter.FILTER_REJECT;
        if (POMIJANE.has(rodzic.tagName)) return NodeFilter.FILTER_REJECT;
        if (!n.nodeValue || !n.nodeValue.trim()) return NodeFilter.FILTER_REJECT;

        /* WIDOCZNOŚĆ LICZONA PO CAŁYM DRZEWIE, NIE PO SAMYM RODZICU.

           Poprzednia wersja sprawdzała `display` bezpośredniego rodzica i przez
           to zgłaszała dwadzieścia fałszywych alarmów z paska akcji: przy
           szerokości biurkowej cały pasek ma `display: none`, ale odnośniki
           w środku mają własne `inline-flex`, więc test uznawał je za widoczne.

           `offsetParent` też tu nie wystarcza — pasek akcji ma `position:
           fixed`, a takie elementy mają puste `offsetParent` nawet wtedy, gdy
           są doskonale widoczne. `checkVisibility` odpowiada na to pytanie
           wprost, biorąc pod uwagę wszystkich przodków. */
        const widoczny = typeof rodzic.checkVisibility === "function"
          ? rodzic.checkVisibility({ checkVisibilityCSS: true })
          : rodzic.getClientRects().length > 0;
        if (!widoczny) return NodeFilter.FILTER_REJECT;

        return NodeFilter.FILTER_ACCEPT;
      },
    });
    while (chodzik.nextNode()) wezly.push(chodzik.currentNode);

    const blok = (n) => {
      let el = n.parentElement;
      while (el && el !== korzen) {
        const d = getComputedStyle(el).display;
        const rodzic = el.parentElement;
        const dRodzica = rodzic ? getComputedStyle(rodzic).display : "";
        /* DZIECKO KONTENERA ELASTYCZNEGO ALBO SIATKI jest osobnym pudełkiem,
           choćby samo miało `display: inline-flex`. Przeglądarka je „blokuje",
           więc sąsiadujące elementy nie sklejają się wzrokowo.

           Bez tego warunku narzędzie zgłaszało dwadzieścia fałszywych alarmów:
           „Zadzwoń teraz▸Wolę zapisać się online" z paska akcji na telefonie,
           gdzie oba odnośniki stoją obok siebie w kontenerze elastycznym
           i są od siebie wyraźnie oddzielone. Patrzyłem na `display` samego
           elementu, a decyduje o tym również rodzic. */
        if (/^(flex|grid|inline-flex|inline-grid)$/.test(dRodzica)) return el;
        if (!d.startsWith("inline") && d !== "contents") return el;
        el = el.parentElement;
      }
      return korzen;
    };

    const znalezione = [];
    for (let i = 1; i < wezly.length; i++) {
      const przed = wezly[i - 1].nodeValue;
      const po = wezly[i].nodeValue;
      /* Odstęp po którejkolwiek stronie styku załatwia sprawę. */
      if (/\s$/.test(przed) || /^\s/.test(po)) continue;
      if (blok(wezly[i - 1]) !== blok(wezly[i])) continue;

      /* Złamanie wiersza rozdziela wzrokowo bez spacji i robi to celowo —
         „Angielski dla życia,<br />nie tylko dla szkoły" jest poprawne.
         `<wbr>` też: wskazuje miejsce, w którym wolno przełamać długi wyraz,
         a nie odstęp. Bez tego wyjątku narzędzie zgłaszało nagłówek strony
         głównej jako błąd. */
      const zakres = document.createRange();
      zakres.setStart(wezly[i - 1], wezly[i - 1].nodeValue.length);
      zakres.setEnd(wezly[i], 0);
      if (zakres.cloneContents().querySelector("br, wbr, hr")) continue;

      const koniec = przed.trimEnd().slice(-1);
      const poczatek = po.trimStart().slice(0, 1);
      /* Znak przestankowy doklejony do wyrazu jest poprawny — „…zespół</a>."
         ma się skleić. Sklejeniem jest dopiero litera lub cyfra po literze,
         cyfrze albo po znaku kończącym zdanie. */
      if (!/[\p{L}\p{N}]/u.test(poczatek)) continue;
      if (!/[\p{L}\p{N}.!?,;:]/u.test(koniec)) continue;

      znalezione.push((przed.trimEnd().slice(-32) + "▸" + po.trimStart().slice(0, 28))
        .replace(/\s+/g, " "));
    }
    return znalezione;
  });
}

const REGULY = [
  {
    waga: "błąd",
    nazwa: "prosty cudzysłów zamiast polskiego „ ”",
    wzor: /"/g,
  },
  {
    waga: "błąd",
    nazwa: "trzy kropki zamiast wielokropka …",
    wzor: /\.\.\./g,
  },
  {
    waga: "błąd",
    nazwa: "łącznik ze spacjami zamiast myślnika – lub —",
    wzor: /(?<=\S) - (?=\S)/g,
  },
  {
    waga: "błąd",
    nazwa: "spacja przed przecinkiem lub kropką",
    wzor: /\s+[,.;:!?](?=\s|$)/g,
  },
  {
    waga: "błąd",
    nazwa: "podwójna spacja",
    /* Zwykłe spacje, nie złamania wiersza — `innerText` wstawia \n sam. */
    wzor: /[^\S\n]{2,}/g,
  },
  {
    waga: "błąd",
    /* „2x45" albo „2 x 45" — w składzie to znak ×, nie litera. */
    nazwa: "litera „x” zamiast znaku mnożenia ×",
    wzor: /\d\s*[xX]\s*\d/g,
  },
  {
    waga: "uwaga",
    /* Zakres liczb łączy półpauza bez spacji: 7–9, a nie 7-9. */
    nazwa: "zakres liczb przez łącznik zamiast półpauzy –",
    wzor: /\d-\d/g,
  },
  {
    waga: "uwaga",
    nazwa: "zwykła spacja przed jednostką zamiast nierozdzielającej",
    wzor: /\d (zł|min|godz|h|kl|lat|lata|roku|%)\b/g,
  },
  {
    waga: "uwaga",
    /* Skrót „np." czy „tzn." nie powinien odrywać się od słowa, które objaśnia. */
    nazwa: "zwykła spacja po skrócie „np.” / „tzn.” / „m.in.”",
    wzor: /\b(np|tzn|tj|m\.in|ok)\. (?=\S)/g,
  },
];

const przegladarka = await chromium.launch();
const kontekst = await przegladarka.newContext({ viewport: { width: 1280, height: 900 } });
const strona = await kontekst.newPage();
/* ZGODY CELOWO NIE USTAWIAMY. Pozostałe narzędzia zapisują ją w pamięci
   przeglądarki, żeby baner nie zasłaniał strony — tutaj jest odwrotnie: baner
   ma być widoczny, bo jest tekstem, który rodzic czyta jako pierwszy.

   Kosztowało mnie to fałszywe poczucie bezpieczeństwa. Po rozszerzeniu
   wykrywacza sklejeń na całe body sprawdziłem go, przywracając na chwilę błąd
   w banerze — i test go NIE zgłosił, bo baner był schowany zgodą ustawioną
   przez ten właśnie skrypt. Sprawdzenie nie obejmowało elementu, który miało
   sprawdzać. */

const znaleziska = new Map();
let znakow = 0;
let wczytanych = 0;

const kontekstFragmentu = (tekst, indeks, dlugosc) => {
  const od = Math.max(0, indeks - 30);
  const do_ = Math.min(tekst.length, indeks + dlugosc + 30);
  return (od > 0 ? "…" : "") + tekst.slice(od, do_).replace(/\n/g, " ") +
    (do_ < tekst.length ? "…" : "");
};

for (const adres of STRONY) {
  const odp = await strona.goto(ADRES + adres, { waitUntil: "domcontentloaded" }).catch(() => null);
  if (!odp || !odp.ok()) continue;
  wczytanych++;

  const tekst = await strona.evaluate(() => {
    const g = document.querySelector("main");
    return g ? g.innerText : "";
  });
  znakow += tekst.length;

  for (const styk of await sklejenia(strona)) {
    const nazwa = "sklejone wyrazy — brak odstępu na granicy znacznika";
    const wpis = znaleziska.get(nazwa) ?? { waga: "błąd", ile: 0, przyklady: [] };
    wpis.ile++;
    if (wpis.przyklady.length < 10) wpis.przyklady.push(`${adres}: …${styk}…`);
    znaleziska.set(nazwa, wpis);
  }

  for (const regula of REGULY) {
    for (const trafienie of tekst.matchAll(regula.wzor)) {
      /* Spacja nierozdzielająca to poprawny zapis — regułom o „zwykłej spacji"
         nie wolno jej zgłaszać. */
      if (trafienie[0].includes(NBSP)) continue;
      const wpis = znaleziska.get(regula.nazwa) ??
        { waga: regula.waga, ile: 0, przyklady: [] };
      wpis.ile++;
      if (wpis.przyklady.length < 10) {
        wpis.przyklady.push(`${adres}: ${kontekstFragmentu(tekst, trafienie.index, trafienie[0].length)}`);
      }
      znaleziska.set(regula.nazwa, wpis);
    }
  }
}

await przegladarka.close();

const lista = [...znaleziska.entries()].sort((a, b) => b[1].ile - a[1].ile);
const bledy = lista.filter(([, w]) => w.waga === "błąd");
const uwagi = lista.filter(([, w]) => w.waga === "uwaga");

/* Ile stron NAPRAWDĘ się wczytało. Bez tego pełna porażka wyglądała jak czysty
   wynik: przy niedziałającym serwerze skrypt zgłaszał „0 znaków", a zaraz pod
   spodem „BŁĘDY: 0". Raz mnie to zmyliło — drugi raz nie ma prawa. */
if (wczytanych === 0) {
  console.log(`
  ŻADNA strona się nie wczytała pod adresem ${ADRES}.`);
  console.log("  To nie jest wynik bez błędów — serwer nie odpowiada albo adres jest zły.\n");
  process.exit(2);
}
if (wczytanych < STRONY.length) {
  console.log(`
  UWAGA: wczytało się ${wczytanych} z ${STRONY.length} podstron.`);
}

console.log(`
  Sprawdzono ${znakow} znaków na ${wczytanych} podstronach.
`);

const wypisz = (tytul, pozycje) => {
  const razem = pozycje.reduce((s, [, w]) => s + w.ile, 0);
  console.log(`  ${tytul}: ${razem}`);
  for (const [nazwa, w] of pozycje) {
    console.log(`   • ${nazwa} — ${w.ile}×`);
    for (const p of w.przyklady) console.log(`       ${p}`);
  }
  if (!pozycje.length) console.log("   brak");
  console.log("");
};

wypisz("BŁĘDY", bledy);
wypisz("UWAGI", uwagi);

process.exit(bledy.length ? 1 : 0);
