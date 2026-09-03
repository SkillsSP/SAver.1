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
  /* LOKAL. Adres wchodzi w cztery miejsca naraz: stopkę, kartę „Zanim
     zapytacie" na stronie głównej, zdanie „gdzie jesteśmy" na kontakcie oraz
     dane strukturalne dla Google. Wszystkie cztery czytają stąd, więc
     przeprowadzka to jedna linijka — ale też: wpisanie tu adresu, którego nie
     ma w umowie, publikuje go w czterech miejscach naraz. */
  ulica: "ul. Żółkiewskiego 17",
  /* Kod pocztowy potwierdzony przez założycielki. Musi brzmieć znak w znak
     tak samo jak w wizytówce Google — łącznik, nie półpauza, i bez spacji. */
  kodPocztowy: "70-346",
  telefon: "508 069 007",
  telefonZapis: "+48 508 069 007",
  email: "kontakt@skilful.pl",
  nip: null,
  regon: null,
  /* Nazwa administratora danych osobowych. Musi brzmieć identycznie tutaj,
     w regulaminie, w polityce prywatności i w klauzuli RODO — rozjazd między
     tymi czterema miejscami jest pierwszą rzeczą, którą wychwytuje kontrola. */
  /* WSPÓŁADMINISTRATORZY. Dwie osoby wspólnie decydujące o celach i sposobach
     przetwarzania — takie jest brzmienie art. 26 rozporządzenia, i takie są
     fakty: obie założycielki mają dostęp do skrzynki i obie decydują o tym,
     co dzieje się ze zgłoszeniem.

     Do 2 września 2026 pole było puste, a klauzula RODO mówiła, że
     administratorem jest „podmiot prowadzący centrum Skills Academy" — zdanie,
     które nie wskazuje nikogo. „Skills Academy" jest nazwą handlową, a nie
     podmiotem: nie ma pod nią wpisu w rejestrze, bo działalność nie jest
     jeszcze założona. Rodzic chcący skorzystać ze swoich praw nie miał się do
     kogo zwrócić.

     Administratorem może być OSOBA FIZYCZNA i to jest wyjście, które nie
     wymaga rejestracji — w przeciwieństwie do NIP-u i REGON-u, które muszą
     poczekać na nabór na dofinansowanie.

     Po rejestracji działalności: wpiszcie tu pełną nazwę firmy, a zdania na
     trzech podstronach pójdą za nią same. */
  administratorDanych: "Karolina Dumała i Natalia Marczewska",
  /* Rzeczownik do zdań prawnych: liczba mnoga przy dwóch osobach, pojedyncza
     po przejściu na jeden podmiot. */
  administratorRzeczownik: "Współadministratorami",
  administratorCzasownik: "są",
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
  /* Spacje w numerze są NIEROZDZIELAJĄCE. Numer złamany na dwa wiersze —
     „508 069" na końcu jednego, „007" na początku drugiego — jest trudny do
     odczytania i praktycznie niemożliwy do skopiowania jednym gestem.
     Wykrył to walidator kodu: 177 wystąpień w całym serwisie, bo numer stoi
     na każdej podstronie w pasku, w stopce i w pasku akcji.

     Zwykła spacja zostaje tylko w wersji dla programu wybierającego numer,
     czyli w `telefonHref` — tam liczy się sam ciąg cyfr. */
  /* Pokazujemy wersję z numerem kierunkowym. Rodzic widzi wtedy ten sam zapis,
     który wychodzi z wizytówki Google i z wizytówki papierowej, a numer daje
     się skopiować i wybrać z zagranicy bez poprawiania. */
  const numer = firma.telefonZapis ?? firma.telefon;
  if (!numer) return "numer podamy wkrótce";
  return numer.replace(/ /g, " ");
}

export function emailTekst() {
  return firma.email ?? "adres podamy wkrótce";
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
/* Nazwy pozycji brzmią „zajęcia podstawowe" i „zajęcia indywidualne", a nie
   same przymiotniki. „Podstawowe" w menu nie mówi, czego dotyczy — dopiero
   rzeczownik robi z tego nazwę oferty. Przy „podstawowych" dochodzi jeszcze
   słownik marki: to jest obowiązujący termin, więc menu ma go używać tak samo
   jak reszta serwisu. */
export const menuProgram = [
  {
    href: "/podstawowe",
    nazwa: "Zajęcia podstawowe",
    opis: "Useful Skills i Life Skills — baza każdego karnetu.",
  },
  {
    href: "/fakultety",
    nazwa: "Fakultety",
    opis: "Music, Art, Acting, Motion Skills — do wyboru.",
  },
  {
    href: "/indywidualne",
    nazwa: "Zajęcia indywidualne",
    /* Opis zaczynał się od „Zajęcia 1:1", co po zmianie nazwy dawało dwa razy
       „zajęcia" pod rząd. Treść ta sama, bez powtórzenia. */
    opis: "Jeden na jeden — rozwój, egzamin ósmoklasisty, matura.",
  },
];

/* --------------------------------------------------------------------------
   PLAKIETKA „NOWOŚĆ" PRZY HISTORII

   Stała, a nie napis wpisany w trzy szablony. Powód jest ten sam co przy
   liczbie osób w zespole i przy liczbie rat: napis wpisany ręcznie starzeje
   się w milczeniu. „Nowość" przestaje być prawdą po pierwszym roku, a nic
   się od tego nie psuje — więc nikt tego nie zauważy.

   Po zakończeniu roku szkolnego, w którym historia weszła do oferty:
   ustawcie `null`, a plakietka zniknie ze wszystkich czterech miejsc naraz.
   -------------------------------------------------------------------------- */
export const nowoscHistoria = "Nowość";

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
        etykietaUnikatu: nowoscHistoria,
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

   Zespół renderujemy jako wiersze w jednej karcie, nie jako kafle w siatce
   `auto-fit`. Powodem była nieparzysta liczba osób: przy trzech kaflach zawsze
   istniała szerokość, na której wychodziło 2+1 i trzecia osoba zostawała sama
   pod spodem. Wiersze są odporne na liczbę osób, więc przy czwartej i każdej
   następnej nie trzeba tu nic ruszać.

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
  {
    imie: "Patryk Moltu",
    rola: "prowadzący",
    /* Historia stoi poza nawiasem, tak samo jak przy Kamilu: nawias opisuje
       ścieżki, na których uczy się angielskiego i matematyki, a historia
       istnieje wyłącznie na maturze i tylko jako rozszerzona. Wciągnięcie jej
       do nawiasu obiecywałoby historię na zajęciach podstawowych. */
    przedmioty:
      "angielski i matematyka (zajęcia podstawowe, egzamin ósmoklasisty, matura), historia rozszerzona, zajęcia 1:1",
    kwalifikacje: null,
  },
];

/* Liczba osób zapisana słownie, wyliczana z tablicy powyżej.

   Na podstronie „O nas" stało wpisane na sztywno „Trzy osoby." — zdanie
   prawdziwe do chwili, w której zespół urósł. Takie liczby w treści starzeją
   się po cichu: nikt ich nie zauważa, bo nic się nie psuje, a strona zaczyna
   mówić nieprawdę o czymś, co rodzic może policzyć wzrokiem. */
export function liczebnikOsob(ile) {
  const slownie = [
    "nikt", "jedna osoba", "dwie osoby", "trzy osoby", "cztery osoby",
    "pięć osób", "sześć osób", "siedem osób", "osiem osób", "dziewięć osób",
  ];
  return slownie[ile] ?? `${ile} osób`;
}

export function zespolLiczebnik() {
  const t = liczebnikOsob(zespol.length);
  return t.charAt(0).toUpperCase() + t.slice(1);
}

/** Ile osób uczy danego przedmiotu — liczone z tablicy zespołu, nie wpisane
    ręcznie w treści. Zdanie „Matematykę prowadzi jedna z założycielek" stało
    na stronie głównej jeszcze wtedy, gdy matematyki uczyły już trzy osoby;
    liczba wpisana w akapit starzeje się po cichu, bo nic się od niej nie psuje. */
export function uczacych(przedmiot) {
  return zespol.filter((o) => new RegExp(przedmiot, "i").test(o.przedmioty)).length;
}

/* Obsada przedmiotów, wprost z tablicy powyżej: angielski cztery osoby,
   matematyka trzy, historia dwie.

   Liczy się jednak obsada NA ŚCIEŻCE, nie sam przedmiot. Po dojściu Patryka
   Moltu każda ścieżka maturalna ma dwie osoby: angielski Karolina i Patryk,
   matematyka Karolina i Patryk, historia Kamil i Patryk. Wcześniej maturalną
   matematykę prowadziła jedna osoba, mimo że „matematykę" prowadziły dwie —
   dlatego zliczanie po przedmiotach potrafi uśpić czujność.

   Wcześniej stało tu ostrzeżenie, że historię prowadzi jedna osoba i przy
   chorobie nie ma zastępstwa — przy przedmiocie sprzedawanym pod konkretny
   termin egzaminu było to realne ryzyko. Dojście Patryka Moltu je zamyka:
   historii uczą teraz dwie osoby. */

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
   CENY WEJŚCIOWE

   Trzy kwoty, od których zaczyna się każda ze ścieżek. Stoją tutaj, a nie
   w cenniku, z jednego powodu: pojawiają się teraz także na stronach oferty,
   a cena wpisana w pięciu miejscach rozjeżdża się przy pierwszej podwyżce.
   Tu zmienia się raz.

   Pełne tabele progów zostają w cennik.astro — tam jest ich miejsce. Stamtąd
   te trzy pozycje też sięgają po te wartości, więc nie da się już zmienić ceny
   na cenniku, zapominając o reszcie serwisu.
   -------------------------------------------------------------------------- */
export const cenyOd = {
  /* Jeden program tygodniowo, 45 minut. */
  programy: "200 zł",
  /* Przygotowanie egzaminacyjne — stała stawka miesięczna. */
  exams: "350 zł",
  /* Najkrótsze spotkanie jeden na jeden, 45 minut. */
  indywidualne: "130 zł",
};

/* --------------------------------------------------------------------------
   ROK SZKOLNY I START

   Rodzic szukający zajęć w kwietniu musi wiedzieć, czy planuje na najbliższy
   wrzesień, czy na kolejny. Brak tej informacji jest kosztowny: bez niej
   przegląda ofertę, nie wiedząc, czy w ogóle go dotyczy.
   -------------------------------------------------------------------------- */
export const rokSzkolny = {
  etykieta: "2026/2027",
  start: "wrzesień 2026",
  /* CZY ROK JUŻ SIĘ ZACZĄŁ. Cały serwis był napisany pod start, który miał
     dopiero nastąpić — a nastąpił 1 września 2026. Zdania w rodzaju „Start:
     wrzesień 2026" albo „Kiedy ruszają zajęcia" czytały się wtedy jak zapowiedź
     czegoś, co już trwa. Ten przełącznik przestawia je wszystkie naraz.

     UWAGA NA ZNACZENIE: `ruszyl` mówi o PIERWSZYCH ZAJĘCIACH, a nie o tym, że
     firma działa. Nabór, wysyłka broszur i reklamy mogą trwać tygodniami, zanim
     odbędzie się pierwsze spotkanie — grupa rusza dopiero przy pięciu zapisanych
     osobach. Przestawiłem to raz na `true`, biorąc „zaczęłyśmy" za start zajęć,
     i strona przez kilkanaście minut twierdziła, że zajęcia się odbywają.

     Przestawiać na `true` dopiero po pierwszym przeprowadzonym spotkaniu. */
  ruszyl: false,
  /* Forma miejscownika do zdań typu „start we wrześniu 2026". Polska
     odmiana nie daje się wyliczyć z mianownika, więc stoi tu wprost —
     inaczej w tekście lądowałoby „start we wrzesień 2026". */
  startOdmiana: "wrześniu 2026",
  /* Rata za każdy miesiąc uczestnictwa, do czerwca włącznie. Przy starcie we
     wrześniu wychodzi dziesięć rat, przy dołączeniu w październiku dziewięć.

     Strona nie podaje już liczby rat jako stałej. Podawała — „dziesięć rat od
     września do czerwca" — i było to prawdziwe wyłącznie przy starcie
     wrześniowym. Odkąd start opisuje warunek zebrania grupy, a nie miesiąc,
     ta liczba stała się obietnicą zależną od czegoś, czego nie znamy z góry.
     Zamiast liczby stoi teraz reguła, z której rodzic sam ją wyliczy. */
  ostatniaRata: "czerwiec",
};

/* --------------------------------------------------------------------------
   UBEZPIECZENIE ODPOWIEDZIALNOŚCI CYWILNEJ

   Rodzice w tej branży o to pytają, a mało która placówka pisze to na stronie.
   Dopóki `wykupione` jest `false`, strona mówi o tym w czasie przyszłym. Po
   zawarciu polisy przestawcie na `true`, a zdanie samo zmieni się na fakt.

   Termin „przed pierwszymi zajęciami" jest tu na miejscu i ma zostać: pierwsze
   zajęcia jeszcze się nie odbyły, więc to nadal jest zobowiązanie, a nie
   zaległość. Usunąłem go raz przez pomyłkę, sądząc, że zajęcia już ruszyły.

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
  /* ------------------------------------------------------------------
     STATYSTYKA — Umami, bez ciasteczek.

     Zostaje obok Google świadomie. Umami liczy WSZYSTKICH odwiedzających,
     także tych, którzy odmówią zgody; Google pokaże tylko część ruchu.
     Bez Umami nie byłoby z czym porównać liczb z Google i nie dałoby się
     powiedzieć, ilu rodziców naprawdę wchodzi na stronę.
     ------------------------------------------------------------------ */
  statystyka: {
    nazwa: "umami",
    src: "https://cloud.umami.is/script.js",
    /* Adresy, pod które wczytany skrypt SAM wysyła odczyty. To nie to samo co
       `src` i właśnie na tym się kiedyś przejechałem: Umami ładuje się
       z cloud.umami.is, a dane odsyła na gateway.umami.is. Polityka
       bezpieczeństwa wypisana tylko z `src` blokowała każdy odczyt po cichu. */
    polaczenia: ["https://gateway.umami.is"],
    atrybuty: { "data-website-id": "6b54cbf7-f3d7-47ee-801f-004df9f45085" },
  },

  /* ------------------------------------------------------------------
     MARKETING — Google Analytics 4 i pomiar konwersji Google Ads.

     BEZ REMARKETINGU. To była decyzja właścicielska i ma odbicie w kodzie:
     zgoda `ad_personalization` zostaje odmówiona ZAWSZE, niezależnie od tego,
     co rodzic kliknie w banerze. Google mierzy więc telefony i zgłoszenia,
     ale nie buduje list odbiorców do ścigania reklamą po innych stronach.
     Gdyby to się kiedyś zmieniło, trzeba zmienić trzy rzeczy naraz: tutaj,
     w banerze i w polityce prywatności — nie jedną z nich.

     DOPÓKI IDENTYFIKATORY SĄ PUSTE, NIC SIĘ NIE ŁADUJE. Cały mechanizm jest
     gotowy i uśpiony: baner pyta o obie kategorie, tryb zgody wysyła sygnały,
     a skrypt Google nie wchodzi na stronę, bo nie ma czego uruchomić.
     Wpisanie identyfikatorów niżej włącza wszystko.
     ------------------------------------------------------------------ */
  google: {
    /* Identyfikator pomiaru GA4 — postać „G-XXXXXXXXXX". */
    ga4: null,
    /* Identyfikator konwersji Google Ads — postać „AW-XXXXXXXXX". */
    ads: null,
    /* Etykiety konwersji z panelu Google Ads — postać „AW-XXXXXXXXX/AbCdEf".
       Bez nich Ads policzy wejścia, ale nie policzy telefonu ani zgłoszenia,
       czyli tego, za co naprawdę płacicie w kampanii. */
    konwersje: { telefon: null, formularz: null },

    skrypt: "https://www.googletagmanager.com/gtag/js",
    /* Adresy, pod które skrypty Google wysyłają dane. Rozpisane osobno dla
       połączeń i dla obrazów, bo pomiar konwersji Ads używa obu dróg. */
    polaczenia: [
      "https://www.googletagmanager.com",
      "https://www.google-analytics.com",
      "https://analytics.google.com",
      "https://stats.g.doubleclick.net",
      "https://www.googleadservices.com",
      "https://googleads.g.doubleclick.net",
      "https://www.google.com",
    ],
    skrypty: ["https://www.googletagmanager.com", "https://www.googleadservices.com"],
    obrazy: [
      "https://www.google.com",
      "https://www.google.pl",
      "https://googleads.g.doubleclick.net",
      "https://www.google-analytics.com",
    ],
  },

  /* ------------------------------------------------------------------
     MICROSOFT CLARITY — mapy kliknięć i nagrania sesji.

     NALEŻY DO KATEGORII „STATYSTYKA", nie „marketing": nie służy reklamie,
     tylko zobaczeniu, gdzie rodzic się gubi na stronie. Ładuje się po zgodzie
     na tę kategorię i nie wcześniej.

     ALE TO NIE JEST DRUGIE UMAMI. Umami liczy odsłony i nie zapisuje niczego
     na urządzeniu. Clarity NAGRYWA SESJĘ — ruch myszy, kliknięcia, przewijanie
     — i zapisuje własne ciasteczka. To jest różnica jakościowa, nie ilościowa,
     i dlatego opis kategorii w banerze musiał się zmienić razem z tym wpisem.

     MASKOWANIE POLA FORMULARZA jest wymuszone atrybutem `data-clarity-mask`
     na obu formularzach, niezależnie od ustawień w panelu Clarity. Przy
     stronie, gdzie rodzic wpisuje imię i wiek dziecka, nie polegamy na
     domyślnym ustawieniu u dostawcy — nagranie nie może zawierać tych danych
     nawet przez pomyłkę w konfiguracji.
     ------------------------------------------------------------------ */
  clarity: {
    id: "yc7j5dep7s",
    skrypt: "https://www.clarity.ms/tag/",
    /* `scripts.clarity.ms` obok `www` — znacznik ładuje się z jednego
       adresu, a właściwy skrypt nagrywający z drugiego. Polityka wypisana
       z samego adresu znacznika blokowała go po cichu: Clarity startowało
       i nic nie zapisywało. Ta sama pułapka co przy Umami i przy pikselu
       Meta — trzeci raz ten sam wzorzec, więc odnotowuję go tutaj. */
    skrypty: ["https://www.clarity.ms", "https://scripts.clarity.ms"],
    polaczenia: ["https://www.clarity.ms", "https://*.clarity.ms", "https://c.bing.com"],
    /* Clarity wysyła też zwykły obrazek pomiarowy pod c.clarity.ms.

       `c.bing.com` jest tu świadomie, choć próbowałem bez niego. Clarity
       ustawia ciasteczko `MUID` — identyfikator Microsoftu rozpoznający
       urządzenie w ich usługach — i robi to Z DOMENY clarity.ms, więc
       zablokowanie Binga w polityce bezpieczeństwa nie zapobiega niczemu,
       a zostawia narzędzie w stanie połowicznym. Zmierzone, nie założone.

       Wniosek warto zapamiętać: Clarity bez identyfikatora Microsoftu nie
       istnieje. Kto go nie chce, nie może używać Clarity — i to jest decyzja
       właścicielska, a nie ustawienie. */
    obrazy: ["https://*.clarity.ms", "https://c.bing.com"],
  },

  /* ------------------------------------------------------------------
     META PIXEL — pomiar skuteczności reklam na Facebooku.

     Wchodzi przez tę samą bramkę co Google: ładuje się dopiero po zgodzie
     na kategorię „marketing" i nie wcześniej.

     CZEGO ŚWIADOMIE NIE MA. Oryginalny kod od Meta zawiera znacznik
     `<noscript>` z obrazkiem śledzącym pod adresem facebook.com/tr. Ten
     obrazek odpala się przy WYŁĄCZONYM JavaScripcie, czyli dokładnie tam,
     gdzie nie da się zapytać o zgodę ani jej sprawdzić. Pominięty celowo:
     wersja dla odwiedzających bez skryptów nie może być wersją bez zgody.

     RÓŻNICA WOBEC GOOGLE, o której trzeba wiedzieć. Google skonfigurowaliśmy
     na sam pomiar, z odmową personalizacji reklam. Piksel Meta domyślnie
     buduje grupy odbiorców do remarketingu — to jest jego natura, nie
     ustawienie. Jeśli remarketing ma nie działać, wyłącza się go po stronie
     panelu Meta, a nie tutaj. Polityka prywatności została do tego dopasowana.
     ------------------------------------------------------------------ */
  meta: {
    pixel: "1375754250809885",
    skrypt: "https://connect.facebook.net/en_US/fbevents.js",
    skrypty: ["https://connect.facebook.net"],
    polaczenia: ["https://connect.facebook.net", "https://www.facebook.com"],
    /* `connect.facebook.net` musi być także wśród obrazów, nie tylko skryptów.
       Piksel wysyła stamtąd własne raporty błędów zwykłym obrazkiem i przy
       polityce wypisanej z samego adresu skryptu ta droga była zablokowana —
       test bezpieczeństwa zgłosił to jako „polityka zablokowała zasób".
       To ta sama pułapka co przy Umami: skrypt ładuje się z jednego adresu,
       a wysyła dane na inny. */
    obrazy: ["https://www.facebook.com", "https://connect.facebook.net"],
  },
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
  /* Postać „/people/Nazwa/numer/" jest docelowa, a nie ozdobna: Facebook sam
     przekierowuje „profile.php?id=61593634238249" właśnie tutaj, odpowiadając
     kodem 301. Wpisanie krótszej wersji kosztowałoby każdego odwiedzającego
     jeden przeskok więcej. */
  {
    klucz: "facebook",
    nazwa: "Facebook",
    adres: "https://www.facebook.com/people/Skills-Academy/61593634238249/",
  },
  { klucz: "instagram", nazwa: "Instagram", adres: null },
  { klucz: "youtube", nazwa: "YouTube", adres: null },
  { klucz: "tiktok", nazwa: "TikTok", adres: null },
];

/* --------------------------------------------------------------------------
   DATA OSTATNIEJ ZMIANY DOKUMENTÓW PRAWNYCH

   Rodzic ma prawo wiedzieć, czy czyta wersję aktualną, czy sprzed dwóch lat.
   Data nie wylicza się z daty budowania strony i jest to celowe: serwis
   przebudowuje się przy każdej zmianie treści oferty, a wtedy dokument
   prawny wyglądałby na świeżo zmieniony, choć nikt go nie ruszał.

   Wpisujcie ją ręcznie i tylko wtedy, gdy zmieni się treść regulaminu,
   polityki prywatności albo klauzuli RODO.
   -------------------------------------------------------------------------- */
export const dokumentyPrawne = { aktualizacja: "2 września 2026" };

/** Instytucje, na których opiera się program — pasek dowodu. */
export const zrodla = ["OECD", "UNESCO", "UNICEF", "WHO", "EEF"];

/* Liczebność grupy. Dotąd stała tu jedna liczba i strony pisały „do ośmiu",
   co nie komunikowało dolnej granicy — a ta jest warunkiem uruchomienia grupy:
   przy czterech zapisanych zajęcia się nie zaczynają. Stąd zakres, nie maksimum. */
export const grupaMin = 5;
export const grupaMax = 8;

/** Gotowy zapis „5–8", żeby myślnik był wszędzie ten sam (półpauza, nie łącznik). */
export const wielkoscGrupyTekst = `${grupaMin}–${grupaMax}`;

/* Liczebniki w dopełniaczu — „przy pięciu zapisanych". Odmiany nie da się
   wyliczyć, a wpisanie słowa na sztywno rozjechałoby się przy zmianie
   `grupaMin`; to już trzeci raz, kiedy liczba wpisana ręcznie w zdanie
   zdezaktualizowała się po cichu. */
const LICZEBNIK_DOPELNIACZ = [
  "zera", "jednej", "dwóch", "trzech", "czterech",
  "pięciu", "sześciu", "siedmiu", "ośmiu", "dziewięciu",
];

/* --------------------------------------------------------------------------
   KIEDY RUSZAJĄ ZAJĘCIA — WARUNEK ZAMIAST DATY

   Do 2 września 2026 strona mówiła „Start: wrzesień 2026". Data ma tę wadę,
   że mija. Rodzic, który odpowiadał na wrześniową reklamę, czytał, że zajęcia
   zaczynają się w tym miesiącu — choć przed nimi była jeszcze rejestracja
   działalności, polisa i zebranie grupy.

   Warunek nie mija. Grupa i tak rusza dopiero przy `grupaMin` zapisanych
   osobach — to jest prawdziwe dziś, w październiku i w listopadzie, nie wymaga
   poprawiania przy każdym poślizgu, a rodzicowi mówi rzecz konkretniejszą niż
   miesiąc: od czego zależy termin i że to jego zapis domyka grupę.
   -------------------------------------------------------------------------- */
export function startTekst() {
  if (rokSzkolny.ruszyl) return `Trwa rok szkolny ${rokSzkolny.etykieta}`;
  const ile = LICZEBNIK_DOPELNIACZ[grupaMin] ?? String(grupaMin);
  return `Grupy ruszają przy ${ile} zapisanych`;
}

/** Zachowane dla miejsc, które mówią wyłącznie o górnej granicy. */
export const wielkoscGrupy = grupaMax;
