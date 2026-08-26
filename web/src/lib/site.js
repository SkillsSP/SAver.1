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
  /* Zapis nazwy, adresu i telefonu musi brzmieć znak w znak tak samo jak w
     wizytówce Google — rozjazd osłabia widoczność w wynikach lokalnych. */
  ulica: null,
  kodPocztowy: null,
  telefon: "508 069 007",
  telefonZapis: "+48 508 069 007",
  email: "kontakt@skilful.pl",
  nip: null,
  godzinyBiura: null,
  mapaOsadzenie: null,
  /* Adres do zgłoszeń dotyczących bezpieczeństwa dziecka. Ustawa wymaga
     wskazania kanału zgłoszeń w standardach ochrony małoletnich.

     Na razie ten sam adres co ogólny — decyzja świadoma i tymczasowa. Warto
     ją zmienić, zanim ruszą zajęcia: na `kontakt@` przychodzą zapytania
     o cennik i terminy, więc czyta ją zwykle kilka osób. Zgłoszenie o krzywdzeniu
     dziecka trafia wtedy do tej samej skrzynki co pytanie o wolne miejsca.
     Osobny adres czytany wyłącznie przez osobę odpowiedzialną za standardy
     ochrony małoletnich zawęża krąg odbiorców do tych, którzy mają prawo
     takie zgłoszenie przeczytać. */
  emailZgloszenia: "kontakt@skilful.pl",
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
    href: "/exams/e8",
    pozycje: [
      { href: "/exams/e8#angielski", nazwa: "Angielski" },
      { href: "/exams/e8#matematyka", nazwa: "Matematyka", unikat: true },
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
    href: "/exams/e8",
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
    szczegol: "Zakres i instrumenty",
    zdjecie: "fakultet-music",
    zdjecieAlt: "Grupa dzieci śpiewa razem podczas zajęć",
  },
  {
    nazwa: "Art Skills",
    wiodace:
      "Rysunek, kolaż, praca przestrzenna. Zadanie zawsze ma cel wykraczający poza samą technikę.",
    szczegol: "Techniki i materiały",
    zdjecie: "fakultet-art",
    zdjecieAlt: "Chłopiec lepi figurki z gliny przy stole z innymi dziećmi",
  },
  {
    nazwa: "Acting Skills",
    wiodace:
      "Scena, głos i obecność przed grupą. Najkrótsza droga do tego, żeby dziecko przestało bać się mówić.",
    szczegol: "Formy pracy i pokaz końcowy",
    zdjecie: "fakultet-acting",
    zdjecieAlt: "Dzieci odgrywają scenkę teatralną w sali",
  },
  {
    nazwa: "Motion Skills",
    wiodace:
      "Ruch, koordynacja i praca zespołowa. Dla dzieci, które nie usiedzą — i dobrze.",
    szczegol: "Rodzaj aktywności i przestrzeń",
    zdjecie: "fakultet-motion",
    zdjecieAlt: "Dzieci rozciągają kolorową chustę animacyjną we wspólnej zabawie ruchowej",
  },
];

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
