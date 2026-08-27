/* ==========================================================================
   JEDNO ŹRÓDŁO DANYCH SERWISU

   Wszystkie dane kontaktowe, kwoty i terminy, które trzeba uzupełnić, siedzą
   w tym pliku — nie w treści podstron. Wypełnienie ich tutaj podmienia je
   naraz w całym serwisie, łącznie ze stopką, paskiem akcji na telefonie i
   znacznikami dla wyszukiwarki.

   Pola oznaczone `null` są jeszcze puste. Serwis wyświetla wtedy neutralny
   zastępnik zamiast pustego miejsca, a strony, na których brak danych blokuje
   działanie (telefon w pasku akcji), chowają ten element zamiast pokazywać
   martwy odnośnik.
   ========================================================================== */

export const firma = {
  nazwa: "Skills Academy",
  podtytul: "Centrum Kompetencji Przyszłości dla Dzieci",
  miasto: "Szczecin",
  /* Forma miejscownika, do zdań „zajęcia prowadzimy w Szczecinie". Polskiej
     odmiany nie da się wyliczyć z mianownika, a doklejanie końcówki w szablonie
     działa tylko dla tej jednej nazwy — „Kraków" + „ie" daje „Krakówie".
     Dlatego stoi tu wprost. */
  miastoWMiejscowniku: "Szczecinie",
  /* Zapis nazwy, adresu i telefonu musi brzmieć znak w znak tak samo jak w
     wizytówce Google — rozjazd osłabia widoczność w wynikach lokalnych. */
  ulica: null,
  kodPocztowy: null,
  telefon: "508 069 007",
  telefonZapis: "+48 508 069 007",
  email: "kontakt@skilful.pl",
  nip: null,
  regon: null,
  /* Nazwa administratora danych osobowych. Musi brzmieć identycznie tutaj,
     w regulaminie, w polityce prywatności i w klauzuli RODO — rozjazd między
     tymi czterema miejscami jest pierwszą rzeczą, którą wychwytuje kontrola. */
  administratorDanych: null,
  godzinyBiura: null,
  mapaOsadzenie: null,
  /* Kanał zgłoszeń dotyczących bezpieczeństwa dziecka — patrz `ochronaMaloletnich`
     niżej. Ustawa wymaga wskazania konkretnej osoby, nie adresu ogólnego,
     dlatego to pole nie jest już zwykłym adresem firmowym. */
  emailZgloszenia: null,
  /* Adres, pod który formularz zapisu wysyła zgłoszenie. Są dwie gotowe drogi
     i obie przepisują zgłoszenie na skrzynkę, nie zapisując go nigdzie:

       supabase/functions/zapis/index.ts   — droga używana. Strona stoi na
         GitHub Pages, a funkcja wysyła przez SMTP własnej poczty w OVH.
         Bez nowego konta i bez ruszania rekordów DNS.
       web/functions/api/zapis.js          — wariant zapasowy dla Cloudflare
         Pages, wysyła przez Resend. Nieużywany, ale trzymany na wypadek
         przenosin.

     Dla Cloudflare byłaby to ścieżka "/api/zapis", bo funkcja stałaby wtedy
     w tej samej domenie co strona.

     Gdyby ten adres kiedyś wyzerować, przycisk wysyłki wyłącza się sam,
     a strona mówi wprost, że formularz czeka na podłączenie — to lepsze niż
     przycisk, który przeładowuje stronę i gubi wpisane dane. */
  formularzEndpoint: "https://nmhwdjqmmeovgoersjll.supabase.co/functions/v1/zapis",
};

/** Telefon w formacie do `tel:`. Bierzemy wersję z numerem kierunkowym,
    bo `tel:508069007` nie zadzwoni z telefonu zalogowanego w obcej sieci —
    a rodzic na wakacjach to nie jest przypadek brzegowy. */
export function telefonHref() {
  const numer = firma.telefonZapis ?? firma.telefon;
  if (!numer) return null;
  return "tel:" + numer.replace(/[^\d+]/g, "");
}

/** Widoczny telefon albo neutralny zastępnik. */
export function telefonTekst() {
  return firma.telefon ?? "numer w uzupełnieniu";
}

export function emailTekst() {
  return firma.email ?? "adres w uzupełnieniu";
}

export function adresTekst() {
  if (!firma.ulica) return firma.miasto;
  return `${firma.ulica}, ${firma.kodPocztowy ?? ""} ${firma.miasto}`.trim();
}

/* --------------------------------------------------------------------------
   ADRESY — sklejane z `base`, żeby serwis działał zarówno lokalnie, jak i pod
   adresem projektowym GitHub Pages.
   -------------------------------------------------------------------------- */
const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

export function url(sciezka) {
  if (sciezka.startsWith("#")) return sciezka;
  const czysta = sciezka.startsWith("/") ? sciezka : `/${sciezka}`;
  return `${BASE}${czysta}`;
}

/* --------------------------------------------------------------------------
   PASEK MENU — pięć pozycji. Rozwinięcie mają tylko Program i Exams.
   Cennik stoi przed „O nas”, bo rodzic sprawdza cenę wcześniej niż zespół.
   -------------------------------------------------------------------------- */
export const menuProgram = [
  {
    href: "/podstawowe",
    nazwa: "Podstawowe",
    opis: "Useful Skills i Life Skills — baza każdego karnetu.",
  },
  {
    href: "/fakultety",
    nazwa: "Fakultety",
    opis: "Music, Art, Acting, Motion Skills — do wyboru.",
  },
  {
    href: "/indywidualne",
    nazwa: "Indywidualne",
    opis: "Zajęcia 1:1 — rozwój, egzamin ósmoklasisty, matura.",
  },
];

export const menuExams = [
  {
    etykieta: "Egzamin ósmoklasisty",
    href: "/exams/egzamin-osmoklasisty",
    pozycje: [
      { href: "/exams/egzamin-osmoklasisty#angielski", nazwa: "Angielski" },
      { href: "/exams/egzamin-osmoklasisty#matematyka", nazwa: "Matematyka", unikat: true },
    ],
  },
  {
    etykieta: "Matura",
    href: "/exams/matura",
    pozycje: [
      {
        href: "/exams/matura#angielski",
        nazwa: "Angielski",
        dopisek: "podstawowy i rozszerzony",
      },
      {
        href: "/exams/matura#matematyka",
        nazwa: "Matematyka",
        dopisek: "podstawowy",
        unikat: true,
      },
      {
        href: "/exams/matura#historia",
        nazwa: "Historia",
        /* Historia nie ma poziomu podstawowego — to przedmiot dodatkowy,
           zdawany wyłącznie na rozszerzeniu. */
        dopisek: "rozszerzony",
        unikat: true,
        etykietaUnikatu: "Nowość",
      },
    ],
  },
];

/* --------------------------------------------------------------------------
   GRUPY WIEKOWE — opis mieszka wyłącznie na /metoda#grupy, strony ofertowe
   linkują, nie powielają. Ta tablica zasila selektor na stronie głównej,
   który prowadzi wprost do oferty, nie do metody.
   -------------------------------------------------------------------------- */
export const grupyWiekowe = [
  {
    lata: "5–7",
    nazwa: "Kids 1 · pierwsze kroki",
    opis: "Proste zdania, dużo powtórzeń, ruch i zabawa.",
    notatkaMetoda: "Najkrótsze polecenia, dużo ruchu, powtarzalny rytm.",
    href: "/podstawowe",
  },
  {
    lata: "8–10",
    nazwa: "Kids 2 · misje i wyzwania",
    opis: "„Dziś jesteś detektywem” — zadania z celem i czasem.",
    notatkaMetoda: "Ton misji i wyzwania. Dziecko jest detektywem, nie uczniem.",
    href: "/podstawowe",
  },
  {
    lata: "11–12",
    nazwa: "Kids 3 · ton partnerski",
    opis: "Rozpoznawanie manipulacji, asertywność, pierwsza pomoc.",
    notatkaMetoda: "Partnerski ton, więcej samodzielnych decyzji w drużynie.",
    href: "/podstawowe",
  },
  {
    lata: "13–15",
    nazwa: "Teens Junior · ósmoklasista",
    opis: "Zajęcia podstawowe plus przygotowanie do egzaminu.",
    notatkaMetoda: "Bez maskotek. Tematy bliskie realnym wyborom nastolatka.",
    href: "/exams/egzamin-osmoklasisty",
  },
  {
    lata: "16–19",
    nazwa: "Teens Senior · matura",
    opis: "Osobna oferta wynikowa. Arkusze CKE, progi punktowe.",
    notatkaMetoda: "Osobna ścieżka, nastawiona na wynik. Szczegóły w Exams.",
    href: "/exams/matura",
    senior: true,
  },
];

/* --------------------------------------------------------------------------
   FAKULTETY — cztery karty na jednej stronie, nie cztery podstrony.
   -------------------------------------------------------------------------- */
export const fakultety = [
  {
    nazwa: "Music Skills",
    wiodace:
      "Rytm, głos i wspólne granie. Dziecko nie uczy się nut na wejściu — najpierw gra, potem rozumie, co zagrało.",
    prowadzi: "Natalia Marczewska",
    zdjecie: "music-2",
    zdjecieAlt: "Dziecko gra na instrumencie podczas zajęć",
  },
  {
    nazwa: "Art Skills",
    wiodace:
      "Rysunek, kolaż, praca przestrzenna. Zadanie zawsze ma cel wykraczający poza samą technikę.",
    prowadzi: "Natalia Marczewska",
    zdjecie: "art-1",
    zdjecieAlt: "Dzieci pracują nad pracą plastyczną przy wspólnym stole",
  },
  {
    nazwa: "Acting Skills",
    wiodace:
      "Scena, głos i obecność przed grupą. Dziecko ćwiczy mówienie do innych " +
      "w sytuacji, w której ma to sens — bo gra rolę, a nie odpowiada przy tablicy.",
    prowadzi: "Karolina Dumała",
    zdjecie: "acting-1",
    zdjecieAlt: "Dzieci odgrywają scenkę teatralną w sali",
  },
  {
    nazwa: "Motion Skills",
    wiodace:
      "Ruch, koordynacja i praca zespołowa. Dla dzieci, które nie usiedzą — i dobrze.",
    prowadzi: "Karolina Dumała",
    zdjecie: "motion-4",
    zdjecieAlt: "Dzieci ćwiczą razem podczas zajęć ruchowych",
  },
];

/* --------------------------------------------------------------------------
   OSOBA ODPOWIEDZIALNA ZA STANDARDY OCHRONY MAŁOLETNICH

   Ustawa wymaga wskazania konkretnej osoby wraz z danymi kontaktowymi, a nie
   adresu ogólnego. Ta ścieżka musi omijać biuro i osoby prowadzące zajęcia:
   zgłoszenie może dotyczyć kogoś z zespołu, więc adres wspólny czyniłby ją
   pozorną.

   POZYCJA OTWARTA — ADRES JEST TYMCZASOWY. Stoi tu `kontakt@skilful.pl`, czyli
   skrzynka ogólna centrum. To rozwiązanie na teraz, ale wymogu ustawowego nie
   spełnia: skrzynkę ogólną czyta biuro, a zgłoszenie może dotyczyć kogoś
   z zespołu. Dopóki adres jest wspólny, ścieżka jest formalnie wskazana, lecz
   praktycznie pozorna.

   Dlatego treść na stronie NIE twierdzi, że zgłoszenie omija biuro — bo nie
   omija. Zdanie o bezpośredniości wraca dopiero razem z osobnym adresem.

   Do uzupełnienia przed pierwszymi zajęciami: adres wyłącznie dla osoby
   odpowiedzialnej, najlepiej w domenie centrum, oraz jej telefon bezpośredni.
   Numer centrum go nie zastąpi, bo prowadzi do biura.
   -------------------------------------------------------------------------- */
export const ochronaMaloletnich = {
  imie: "Karolina Dumała",
  /* Ustawa wymaga wskazania zastępcy na czas nieobecności osoby
     odpowiedzialnej. Dostęp do skrzynki `kontakt@` mają wyłącznie te dwie
     osoby, więc zgłoszenie nie przechodzi przez cały zespół — to istotne przy
     ścieżce, która ma omijać osoby prowadzące zajęcia.

     Ograniczenie pozostaje jedno i trzeba je znać: zgłoszenie dotyczące
     którejkolwiek z tych dwóch osób trafia do skrzynki, którą ona sama czyta.
     Dlatego na stronie stoją obok numery niezależne od centrum — telefon
     zaufania i Rzecznik Praw Dziecka. Docelowo osobny adres wyłącznie dla
     osoby odpowiedzialnej rozwiązuje to w całości. */
  zastepca: "Natalia Marczewska",
  /* Prawda mówi, czy adres należy wyłącznie do tej osoby. Steruje brzmieniem
     na stronie: przy `false` nie obiecujemy bezpośredniości. */
  adresBezposredni: false,
  funkcja: "osoba odpowiedzialna za standardy ochrony małoletnich",
  email: "kontakt@skilful.pl",
  telefon: null,
};

/* --------------------------------------------------------------------------
   ZESPÓŁ

   Trzy osoby to zła liczba dla siatki `auto-fit`: przy każdym minimum kolumny
   istnieje szerokość, na której wychodzi 2+1 i trzecia osoba zostaje sama pod
   spodem. Dlatego zespół renderujemy jako wiersze w jednej karcie, nie jako
   trzy kafle.

   Pole `kwalifikacje` jest puste świadomie i jest to jedyny brak na podstronie
   „O nas" — a zarazem jej najważniejsze zdanie. W edukacji premium nazwisko bez
   wykształcenia, lat doświadczenia i uprawnień egzaminacyjnych nie jest jeszcze
   dowodem. Do uzupełnienia przed startem.

   Portretów nie ma i nie będzie do własnej sesji: stockowa twarz pod nazwiskiem
   prowadzącej podkopałaby wszystko inne na tej stronie.
   -------------------------------------------------------------------------- */
export const zespol = [
  {
    imie: "Karolina Dumała",
    rola: "odpowiada za standardy ochrony małoletnich",
    przedmioty:
      "angielski i matematyka (zajęcia podstawowe, egzamin ósmoklasisty, matura), fakultety Acting i Motion Skills, zajęcia 1:1",
    kwalifikacje: null,
  },
  {
    imie: "Kamil Dumała",
    rola: "prowadzący",
    przedmioty:
      "angielski i matematyka (zajęcia podstawowe, egzamin ósmoklasisty), historia rozszerzona, zajęcia 1:1",
    kwalifikacje: null,
  },
  {
    imie: "Natalia Marczewska",
    rola: "prowadząca",
    przedmioty:
      "angielski (zajęcia podstawowe, egzamin ósmoklasisty), fakultety Music i Art Skills, zajęcia 1:1",
    kwalifikacje: null,
  },
];

/* Ryzyko obsadowe warte odnotowania w kodzie, bo wynika z tabeli powyżej:
   historię prowadzi jedna osoba, więc przy chorobie nie ma zastępstwa — a to
   przedmiot sprzedawany pod konkretny termin egzaminu. Matematykę prowadzą
   dwie osoby, angielski trzy. */

/* --------------------------------------------------------------------------
   TERMINARZ ZAJĘĆ

   Trzecia rzecz, o którą rodzic pyta po adresie i cenie: „czy jest grupa
   w środy po szesnastej dla dziewięciolatka". Bez odpowiedzi musi zadzwonić,
   a większość nie zadzwoni.

   PRZEŁĄCZNIK `pokazuj`. Dopóki jest `false`, podstrona terminarza nie
   pojawia się w nawigacji, w stopce ani w mapie serwisu i prosi wyszukiwarki
   o pominięcie jej. Sam adres działa, więc można ją obejrzeć przed
   publikacją. Włączenie to jedna wartość — pod warunkiem, że `dni` nie są
   puste; przełącznik bez godzin pokazałby pustą tabelę, więc strona sprawdza
   jedno i drugie.

   ZAPIS GODZIN. `od` i `do` w formacie 24-godzinnym, żeby dało się je
   porównywać i sortować bez zgadywania. Etykieta na stronie powstaje z nich
   automatycznie.

   Przykład wypełnionego wiersza — do skopiowania, gdy grafik będzie ustalony:

     { dzien: "wtorek", od: "16:00", do: "16:45",
       program: "Useful & Life Skills", grupa: "8–10 lat", prowadzi: "Kamil Dumała" }

   Wolne miejsca celowo NIE są tu trzymane. Liczba, która nie jest
   aktualizowana co tydzień, szkodzi bardziej niż jej brak — „zostały 2 miejsca"
   sprzed miesiąca jest gorsze od milczenia.
   -------------------------------------------------------------------------- */
export const terminarz = {
  pokazuj: false,
  dni: [],
};

/** Kolejność dni w tygodniu — do sortowania i nagłówków tabeli. */
export const dniTygodnia = [
  "poniedziałek",
  "wtorek",
  "środa",
  "czwartek",
  "piątek",
  "sobota",
];

/* --------------------------------------------------------------------------
   PORADNIK

   Miejsce na treści, których rodzic szuka, zanim zacznie szukać szkoły —
   „jak wygląda egzamin ósmoklasisty z angielskiego", „ile słów powinien znać
   ośmiolatek". W wyszukiwaniu lokalnym to najtańsza droga do rodziców, którzy
   jeszcze nie wiedzą, że nas potrzebują.

   Ta sama zasada co przy terminarzu: dopóki nie ma ani jednego wpisu, sekcja
   jest ukryta. Pusta lista artykułów wygląda na porzucony projekt, a to gorsze
   niż jej brak.

   CZEGO NIE PISAĆ. Tekstów o skuteczności metody — obowiązują te same granice
   co na stronach ofertowych, opisane w aneksie naukowym. Poradnik ma odpowiadać
   na pytania o egzamin, wiek i naukę w ogóle, a nie chwalić centrum.

   Kształt wpisu:

     { slug: "egzamin-osmoklasisty-angielski",
       tytul: "Jak wygląda egzamin ósmoklasisty z angielskiego",
       opis: "Struktura arkusza, punktacja i to, co realnie decyduje o wyniku.",
       data: "2026-09-15",
       kadr: "life-globus",
       tresc: [ { naglowek: "…", akapity: ["…"] } ] }
   -------------------------------------------------------------------------- */
export const poradnik = [];

/* --------------------------------------------------------------------------
   ROK SZKOLNY I START

   Rodzic szukający zajęć w kwietniu musi wiedzieć, czy planuje na najbliższy
   wrzesień, czy na kolejny. Brak tej informacji jest kosztowny: bez niej
   przegląda ofertę, nie wiedząc, czy w ogóle go dotyczy.
   -------------------------------------------------------------------------- */
export const rokSzkolny = {
  etykieta: "2026/2027",
  start: "wrzesień 2026",
  /* Forma miejscownika do zdań typu „start we wrześniu 2026". Polska
     odmiana nie daje się wyliczyć z mianownika, więc stoi tu wprost —
     inaczej w tekście lądowałoby „start we wrzesień 2026". */
  startOdmiana: "wrześniu 2026",
  /* Kurs obejmuje dziesięć rat od września do czerwca — patrz cennik. */
  pierwszaRata: "wrzesień",
  ostatniaRata: "czerwiec",
};

/* --------------------------------------------------------------------------
   UBEZPIECZENIE ODPOWIEDZIALNOŚCI CYWILNEJ

   Rodzice w tej branży o to pytają, a mało która placówka pisze to na stronie.
   Dopóki `wykupione` jest `false`, strona mówi o tym w czasie przyszłym, jako
   o zobowiązaniu przed pierwszymi zajęciami — bo tak jest naprawdę. Po zawarciu
   polisy przestawcie na `true`, a zdanie samo zmieni się na fakt dokonany.

   Nie ma tu miejsca na skrót: napisanie „placówka jest ubezpieczona", zanim
   polisa istnieje, byłoby zwykłą nieprawdą w miejscu, w którym rodzic pyta
   o bezpieczeństwo dziecka.
   -------------------------------------------------------------------------- */
export const ubezpieczenie = {
  wykupione: false,
  zakres: "odpowiedzialność cywilna placówki",
};

/* --------------------------------------------------------------------------
   ANALITYKA

   Konfiguracja stoi tutaj, a nie w skrypcie na stronie, z jednego powodu:
   dzięki temu w kodzie wysyłanym do przeglądarki ląduje wyłącznie adres tego
   dostawcy, którego faktycznie używamy. Wcześniej wszystkie cztery warianty
   siedziały w gałęziach jednego warunku, więc w źródle każdej podstrony stały
   adresy Google, Plausible i Cloudflare — martwe, ale widoczne. Nic nie
   ładowały, a mimo to ktoś zaglądający w źródło miał pełne prawo uznać, że
   strona z nimi rozmawia. Przy serwisie, który o swojej powściągliwości mówi
   wprost, to jest realny koszt.

   `bezCiasteczek: true` znaczy, że narzędzie nie sięga do pamięci urządzenia
   i wobec tego rusza bez pytania o zgodę — obowiązek informacyjny wypełnia
   sekcja 7 polityki prywatności. Przy narzędziu z ciasteczkami ustawcie
   `false`, a baner zgód wróci sam.

   ZMIANA DOSTAWCY. Podmieniacie cały obiekt poniżej. Gotowe warianty:

     Plausible (serwery deklarowane w Unii, płatny)
       { nazwa: "plausible", bezCiasteczek: true,
         src: "https://plausible.io/js/script.js",
         atrybuty: { "data-domain": "skilful.pl" } }

     Google Analytics (ciasteczka, transfer poza Unię — wymaga zgody)
       { nazwa: "ga4", bezCiasteczek: false,
         src: "https://www.googletagmanager.com/gtag/js?id=G-XXXX",
         ga4Id: "G-XXXX" }

   Wyłączenie: `nazwa: null`. Wtedy strona nie wysyła ani jednego zapytania
   na zewnątrz.
   -------------------------------------------------------------------------- */
export const analityka = {
  nazwa: "umami",
  bezCiasteczek: true,

  /* Pytamy o zgodę, mimo że przy narzędziu bez ciasteczek nie musimy.

     Decyzja właścicielska. Warunek jest jeden i trzeba go trzymać: skoro
     pytamy, odpowiedź musi coś zmieniać. „Tylko niezbędne" naprawdę wyłącza
     licznik — inaczej baner byłby teatrem, a przycisk, który nic nie robi,
     jest gorszy od braku pytania.

     Ustawienie na `false` chowa baner: przy narzędziu bez ciasteczek strona
     nic wtedy nie zapisuje na urządzeniu, a obowiązek informacyjny wypełnia
     sekcja 7 polityki prywatności. */
  pytamyMimoBrakuObowiazku: true,
  src: "https://cloud.umami.is/script.js",

  /* Adresy, pod które wczytany skrypt SAM wysyła odczyty. To nie to samo co
     `src` i właśnie na tym się przejechałem: Umami ładuje się z cloud.umami.is,
     a dane odsyła na gateway.umami.is. Polityka bezpieczeństwa treści
     wypisana tylko z `src` blokowała każdy odczyt, i to po cichu — strona
     wyglądała normalnie, a statystyki po prostu nie przychodziły.

     Po zmianie dostawcy trzeba tu zajrzeć. Sprawdzenie zajmuje chwilę:
     otwórzcie stronę z narzędziami deweloperskimi, zakładka Sieć, i zobaczcie,
     pod jaki adres leci zapytanie po wyrażeniu zgody. */
  polaczenia: ["https://gateway.umami.is"],

  atrybuty: { "data-website-id": "6b54cbf7-f3d7-47ee-801f-004df9f45085" },
};

/* --------------------------------------------------------------------------
   PROFILE W MEDIACH SPOŁECZNOŚCIOWYCH

   Wystarczy wkleić adres profilu — ikona pojawi się w stopce sama. Pozycje
   z adresem `null` nie renderują się wcale: martwa ikona prowadząca donikąd
   jest gorsza od jej braku, a „wkrótce" przy ikonie starzeje się na stronie
   szybciej niż cokolwiek innego.

   Kolejność w tablicy jest kolejnością na stronie. Facebook stoi pierwszy
   świadomie: przy centrum dla dzieci to tam siedzą rodzice podejmujący
   decyzję, a Instagram i pozostałe pracują raczej na rozpoznawalność.

   Adres wpisujcie w pełnej postaci, razem z „https://" — bez tego
   przeglądarka potraktuje go jako ścieżkę wewnątrz serwisu.
   -------------------------------------------------------------------------- */
export const spolecznosciowe = [
  { klucz: "facebook", nazwa: "Facebook", adres: null },
  { klucz: "instagram", nazwa: "Instagram", adres: null },
  { klucz: "youtube", nazwa: "YouTube", adres: null },
  { klucz: "tiktok", nazwa: "TikTok", adres: null },
];

/** Instytucje, na których opiera się program — pasek dowodu. */
export const zrodla = ["OECD", "UNESCO", "UNICEF", "WHO", "EEF"];

/* Liczebność grupy. Dotąd stała tu jedna liczba i strony pisały „do ośmiu",
   co nie komunikowało dolnej granicy — a ta jest warunkiem uruchomienia grupy:
   przy czterech zapisanych zajęcia się nie zaczynają. Stąd zakres, nie maksimum. */
export const grupaMin = 5;
export const grupaMax = 8;

/** Gotowy zapis „5–8", żeby myślnik był wszędzie ten sam (półpauza, nie łącznik). */
export const wielkoscGrupyTekst = `${grupaMin}–${grupaMax}`;

/** Zachowane dla miejsc, które mówią wyłącznie o górnej granicy. */
export const wielkoscGrupy = grupaMax;
