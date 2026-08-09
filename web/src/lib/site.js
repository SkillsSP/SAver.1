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
  telefon: null,
  telefonZapis: null,
  email: null,
  nip: null,
  godzinyBiura: null,
  mapaOsadzenie: null,
  /* Adres do zgłoszeń dotyczących bezpieczeństwa dziecka. Ustawa wymaga
     wskazania kanału zgłoszeń w standardach ochrony małoletnich — może to być
     ten sam adres co ogólny, ale osobna skrzynka bywa czytelniejsza. */
  emailZgloszenia: null,
  /* Adres, pod który formularz zapisu wysyła zgłoszenie. Dopóki jest `null`,
     formularz nie udaje, że działa: pokazuje uczciwy komunikat i kieruje do
     telefonu, zamiast kończyć zgłoszenie błędem. Wpiszcie tu adres z Formspree,
     Netlify Forms albo własnego serwera, a formularz włączy się sam. */
  formularzEndpoint: null,
};

/** Telefon w formacie do `tel:` — cyfry bez spacji. */
export function telefonHref() {
  if (!firma.telefon) return null;
  return "tel:" + firma.telefon.replace(/[^\d+]/g, "");
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
  },
  {
    nazwa: "Art Skills",
    wiodace:
      "Rysunek, kolaż, praca przestrzenna. Zadanie zawsze ma cel wykraczający poza samą technikę.",
    szczegol: "Techniki i materiały",
  },
  {
    nazwa: "Acting Skills",
    wiodace:
      "Scena, głos i obecność przed grupą. Najkrótsza droga do tego, żeby dziecko przestało bać się mówić.",
    szczegol: "Formy pracy i pokaz końcowy",
  },
  {
    nazwa: "Motion Skills",
    wiodace:
      "Ruch, koordynacja i praca zespołowa. Dla dzieci, które nie usiedzą — i dobrze.",
    szczegol: "Rodzaj aktywności i przestrzeń",
  },
];

/** Instytucje, na których opiera się program — pasek dowodu. */
export const zrodla = ["OECD", "UNESCO", "UNICEF", "WHO", "EEF"];

/** Maksymalna liczebność grupy — jedna liczba, używana w kilku miejscach. */
export const wielkoscGrupy = 8;
