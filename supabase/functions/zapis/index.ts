/* ==========================================================================
   ODBIÓR ZGŁOSZENIA Z FORMULARZA → E-MAIL   (Supabase Edge Function)

   Wysyłka idzie przez SMTP własnej poczty w OVH, a nie przez zewnętrzną usługę
   pocztową. Skrzynka i tak istnieje i działa, więc nie zakładamy nowego konta,
   nie dodajemy rekordów DNS i nie ruszamy wpisu SPF — a dopisanie drugiego
   wpisu SPF potrafi położyć całą pocztę firmy, nie tylko formularz. Przy okazji
   nie dochodzi kolejny podmiot przetwarzający dane dziecka.

   Dane nigdzie się nie zapisują — lecą prosto na skrzynkę i tyle. To świadomy
   wybór zamiast tabeli w bazie: zgłoszenia zawierają imię i wiek dziecka,
   a mniej danych osobowych w spoczynku znaczy mniej do opisania w rejestrze
   czynności przetwarzania i mniej do stracenia. Gdyby kiedyś doszedł zapis do
   tabeli, ma iść OBOK wysyłki, nie zamiast — awaria bazy nie może gubić
   zgłoszeń.

   ---------------------------------------------------------------------------
   DLACZEGO WŁASNA OBSŁUGA SMTP, A NIE GOTOWA BIBLIOTEKA

   Pierwsza wersja korzystała z denomailera pobieranego z deno.land. Kończyła
   się błędem „peer closed connection without sending TLS close_notify" —
   biblioteka nie dogadywała się z proxy SMTP w OVH. Ręczna rozmowa z tym samym
   serwerem przechodzi bez zarzutu, więc protokół nie był problemem.

   Własna obsługa jest tu tańsza niż szukanie innej biblioteki: potrzeba pięciu
   komend i jednej wiadomości tekstowej. Przy okazji znika zależność pobierana
   z sieci przy każdym starcie funkcji — a deno.land/x jest wygaszane.

   ---------------------------------------------------------------------------
   SEKRETY DO USTAWIENIA W PANELU SUPABASE
   (Project Settings → Edge Functions → Secrets)

     SMTP_HASLO   hasło do skrzynki kontakt@skilful.pl — jedyne obowiązkowe
     SMTP_USER    login, domyślnie kontakt@skilful.pl
     SMTP_HOST    serwer, domyślnie ssl0.ovh.net
     SMTP_PORT    port, domyślnie 465 (szyfrowanie od pierwszego bajtu)
     MAIL_DO      odbiorca, domyślnie ten sam co SMTP_USER

   Dopóki SMTP_HASLO jest puste, funkcja odpowiada kodem 503, a strona pokazuje
   rodzicowi informację, że formularz czeka na podłączenie. Zgłoszenie nigdy
   nie ginie po cichu.

   OVH nie pozwala wysyłać „w imieniu" innego adresu niż uwierzytelniony,
   dlatego nadawcą jest ta sama skrzynka co odbiorcą. Wysyłka do siebie samego
   jest tu w porządku: w temacie stoi imię i wiek dziecka, więc zgłoszenie widać
   na liście bez otwierania, a adres rodzica siedzi w nagłówku Reply-To.
   ========================================================================== */

const LIMIT_DLUGOSCI = 200;

/* Ile czekamy na pojedynczą odpowiedź serwera poczty. Bez limitu zawieszony
   serwer trzymałby zapytanie aż do limitu platformy, a rodzic patrzyłby
   w kręcące się kółko. */
const LIMIT_ODPOWIEDZI_MS = 8000;

/* Koniec wiersza w protokole SMTP. Zbudowany z kodów znaków, bo sekwencja
   ucieczki w tym miejscu bywa gubiona przy automatycznej edycji pliku. */
const KONIEC_LINII = String.fromCharCode(13, 10);

/* Skąd wolno wywołać funkcję. Gwiazdka byłaby wygodniejsza, ale wtedy dowolna
   strona mogłaby wysyłać zgłoszenia w imieniu marki i zapychać skrzynkę. */
const DOZWOLONE_ZRODLA = ["https://skilful.pl", "https://www.skilful.pl"];

function naglowkiCors(zrodlo: string | null): Record<string, string> {
  const dozwolone =
    zrodlo && DOZWOLONE_ZRODLA.includes(zrodlo) ? zrodlo : DOZWOLONE_ZRODLA[0];
  return {
    "access-control-allow-origin": dozwolone,
    "access-control-allow-methods": "POST, OPTIONS",
    "access-control-allow-headers": "content-type, accept",
    "vary": "origin",
  };
}

/** Przycina i czyści pojedyncze pole. Nagłówki wiadomości nie mogą zawierać
    znaków końca linii — bez tego dałoby się przez formularz dokleić własny
    nagłówek, na przykład ukrytego odbiorcę kopii. */
function oczysc(wartosc: unknown, limit = LIMIT_DLUGOSCI): string {
  if (typeof wartosc !== "string") return "";
  return wartosc.replace(/[\r\n]+/g, " ").trim().slice(0, limit);
}

function odpowiedz(
  status: number,
  tresc: unknown,
  cors: Record<string, string>,
): Response {
  return new Response(JSON.stringify(tresc), {
    status,
    headers: {
      ...cors,
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}

/** Prosty adres e-mail. Nie sprawdzamy zgodności z normą, tylko czy da się
    tego użyć jako Reply-To — błędny adres zepsułby nagłówek wiadomości. */
function wygladaJakEmail(adres: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(adres);
}

/** Base64 z tekstu w UTF-8. Samo btoa() nie przyjmuje znaków spoza łaciny,
    więc najpierw zamieniamy tekst na bajty. Bez tego polskie znaki w temacie
    i w treści wysypywałyby wysyłkę. */
function base64(tekst: string): string {
  const bajty = new TextEncoder().encode(tekst);
  let binarnie = "";
  for (const b of bajty) binarnie += String.fromCharCode(b);
  return btoa(binarnie);
}

/** Nagłówek z polskimi znakami musi być zakodowany — norma dopuszcza
    w nagłówkach wiadomości wyłącznie ASCII. */
function naglowekZPolskimi(tekst: string): string {
  return /^[ -~]*$/.test(tekst) ? tekst : `=?UTF-8?B?${base64(tekst)}?=`;
}

/** Łamie długi ciąg base64 na wiersze po 76 znaków, jak wymaga norma. */
function polamBase64(dane: string): string {
  return (dane.match(/.{1,76}/g) ?? []).join(KONIEC_LINII);
}

/* --------------------------------------------------------------------------
   ROZMOWA Z SERWEREM POCZTY
   -------------------------------------------------------------------------- */

interface Przesylka {
  serwer: string;
  port: number;
  uzytkownik: string;
  haslo: string;
  doKogo: string;
  odpowiedzDo?: string;
  temat: string;
  tresc: string;
}

async function wyslij(p: Przesylka): Promise<void> {
  const polaczenie = await Deno.connectTls({ hostname: p.serwer, port: p.port });
  const koder = new TextEncoder();
  const dekoder = new TextDecoder();
  let bufor = "";

  /* Odpowiedź serwera bywa wieloliniowa: wiersze pośrednie mają myślnik po
     kodzie („250-"), ostatni ma spację albo sam kod. Czytamy tak długo, aż
     w buforze pojawi się wiersz kończący — inaczej kolejne komendy czytałyby
     resztki poprzedniej odpowiedzi i cała rozmowa przesunęłaby się o krok.
     Właśnie to widać było w diagnostyce: odpowiedź na EHLO przyszła w dwóch
     pakietach i każdy następny odczyt trafiał o jeden za wcześnie. */
  async function czytaj(): Promise<string> {
    while (true) {
      const dopasowanie = bufor.match(/^\d{3}(?: [^\n]*)?\n/m);
      if (dopasowanie) {
        const koniec = dopasowanie.index! + dopasowanie[0].length;
        const calosc = bufor.slice(0, koniec);
        bufor = bufor.slice(koniec);
        return calosc.trim();
      }
      const kawalek = new Uint8Array(4096);
      const ile = await Promise.race([
        polaczenie.read(kawalek),
        new Promise<null>((_, odrzuc) =>
          setTimeout(
            () => odrzuc(new Error("serwer poczty nie odpowiedział na czas")),
            LIMIT_ODPOWIEDZI_MS,
          )
        ),
      ]);
      if (ile === null) throw new Error("serwer poczty zamknął połączenie");
      bufor += dekoder.decode(kawalek.subarray(0, ile));
    }
  }

  /** Wysyła komendę i sprawdza kod odpowiedzi. Treść odpowiedzi trafia do
      wyjątku, więc w logach widać wprost, czy odrzucono hasło, czy adres. */
  async function komenda(linia: string, oczekiwany: number, etykieta: string) {
    await polaczenie.write(koder.encode(linia + KONIEC_LINII));
    const odp = await czytaj();
    if (!odp.startsWith(String(oczekiwany))) {
      throw new Error(`${etykieta}: serwer odpowiedział „${odp.slice(0, 200)}”`);
    }
    return odp;
  }

  try {
    const powitanie = await czytaj();
    if (!powitanie.startsWith("220")) {
      throw new Error(`powitanie: serwer odpowiedział „${powitanie.slice(0, 200)}”`);
    }

    await komenda("EHLO skilful.pl", 250, "EHLO");
    await komenda("AUTH LOGIN", 334, "rozpoczęcie logowania");
    await komenda(base64(p.uzytkownik), 334, "login");
    await komenda(base64(p.haslo), 235, "hasło");

    await komenda(`MAIL FROM:<${p.uzytkownik}>`, 250, "nadawca");
    await komenda(`RCPT TO:<${p.doKogo}>`, 250, "odbiorca");
    await komenda("DATA", 354, "rozpoczęcie treści");

    const naglowki = [
      `From: ${naglowekZPolskimi("Formularz Skills Academy")} <${p.uzytkownik}>`,
      `To: <${p.doKogo}>`,
      ...(p.odpowiedzDo ? [`Reply-To: <${p.odpowiedzDo}>`] : []),
      `Subject: ${naglowekZPolskimi(p.temat)}`,
      `Date: ${new Date().toUTCString()}`,
      "MIME-Version: 1.0",
      "Content-Type: text/plain; charset=UTF-8",
      /* Treść idzie w base64. Poza obsługą polskich znaków załatwia to problem
         wiersza zaczynającego się kropką, którą protokół traktuje jako koniec
         wiadomości — w base64 taki wiersz nie powstanie. */
      "Content-Transfer-Encoding: base64",
    ].join(KONIEC_LINII);

    const wiadomosc =
      naglowki + KONIEC_LINII + KONIEC_LINII + polamBase64(base64(p.tresc));

    await polaczenie.write(
      koder.encode(wiadomosc + KONIEC_LINII + "." + KONIEC_LINII),
    );
    const potwierdzenie = await czytaj();
    if (!potwierdzenie.startsWith("250")) {
      throw new Error(`wysyłka: serwer odpowiedział „${potwierdzenie.slice(0, 200)}”`);
    }

    /* QUIT wypada wysłać, ale odpowiedzi już nie czytamy — OVH potrafi zamknąć
       połączenie bez pożegnania, a to nie ma wpływu na przyjętą wiadomość.
       Właśnie o to rozbijała się poprzednia wersja z gotową biblioteką. */
    try {
      await polaczenie.write(koder.encode("QUIT" + KONIEC_LINII));
    } catch { /* nieistotne */ }
  } finally {
    try {
      polaczenie.close();
    } catch { /* nieistotne */ }
  }
}

/* --------------------------------------------------------------------------
   OBSŁUGA ZAPYTANIA
   -------------------------------------------------------------------------- */

/* Siatka bezpieczeństwa: nieobsłużone odrzucenie obietnicy ubija cały proces,
   a wtedy platforma odpowiada pustym błędem 503 — bez treści i bez nagłówków
   CORS, więc przeglądarka pokazuje to jako zerwane połączenie zamiast
   czytelnego komunikatu. */
globalThis.addEventListener("unhandledrejection", (zdarzenie) => {
  console.error("Nieobsłużone odrzucenie obietnicy:", zdarzenie.reason);
  zdarzenie.preventDefault();
});

/* --------------------------------------------------------------------------
   OCHRONA PRZED AUTOMATAMI

   Wszystko poniżej działa PO STRONIE SERWERA i to jest cały sens. Makieta
   sprawdzała pułapki w przeglądarce, ale automat nie musi otwierać strony —
   wystarczy, że wyśle żądanie wprost tutaj. Kontrola w przeglądarce chroni
   przed przypadkiem, kontrola w tym miejscu przed zamiarem.

   Świadomie bez CAPTCHY: przepisywanie znaków z obrazka odbija rodziców na
   telefonie i jest barierą dla osób z dysleksją oraz słabym wzrokiem. Gdyby
   spam mimo tego przechodził, następnym krokiem jest Cloudflare Turnstile —
   działa bez klikania w obrazki i nie wysyła danych do Google.
   -------------------------------------------------------------------------- */

/** Najkrótszy czas, w jakim człowiek wypełni formularz. */
const MINIMALNY_CZAS_MS = 3000;

/* Znacznik czasu przychodzi z przeglądarki, więc automat może go podmienić.
   Traktujemy go jako sygnał, nie jako dowód. Podpisanie znacznika kluczem
   serwera wymagałoby osobnego zapytania po token przy każdym otwarciu strony;
   przy tej skali to koszt bez pokrycia, a prawdziwą barierą jest i tak limit
   zgłoszeń niżej. */
function czasWypelniania(dane: Record<string, unknown>): number | null {
  const t = Number(oczysc(dane.otwarto, 20));
  if (!Number.isFinite(t) || t <= 0) return null;
  const roznica = Date.now() - t;
  return roznica >= 0 ? roznica : null;
}

/* Wiadomość z trzema odnośnikami i więcej to niemal zawsze spam. Nie odrzucamy
   jej po cichu — oznaczamy w temacie, żeby trafiła do ręcznego przejrzenia,
   a nie do kosza. Rodzic potrafi wkleić odnośnik do rozkładu albo do arkusza. */
function liczbaOdnosnikow(tekst: string): number {
  const dopasowania = tekst.match(/(?:https?:)?\/\/|www\./gi);
  return dopasowania ? dopasowania.length : 0;
}

/* Limit zgłoszeń z jednego adresu. Funkcje brzegowe są bezstanowe i każda
   instancja ma własną mapę, więc to ogranicza seryjne wysyłki z jednej sesji,
   ale nie zastąpi licznika w bazie. Piszę to wprost, zamiast udawać, że limit
   jest twardy: gdy spam stanie się realnym problemem, tu wchodzi tabela
   w Postgresie albo Turnstile. */
const historia = new Map<string, number[]>();
const LIMIT_NA_GODZINE = 3;
const GODZINA_MS = 60 * 60 * 1000;

function przekroczonyLimit(adres: string): boolean {
  const teraz = Date.now();
  const wpisy = (historia.get(adres) ?? []).filter((t) => teraz - t < GODZINA_MS);
  wpisy.push(teraz);
  historia.set(adres, wpisy);
  /* Mapa żyje tylko tyle, co instancja, ale i tak ją sprzątamy — przy większym
     ruchu trzymałaby inaczej tysiące adresów bez potrzeby. */
  if (historia.size > 500) {
    for (const [k, v] of historia) {
      if (v.every((t) => teraz - t >= GODZINA_MS)) historia.delete(k);
    }
  }
  return wpisy.length > LIMIT_NA_GODZINE;
}

const NAZWY_SPRAW: Record<string, string> = {
  oferta: "Pytanie o zajęcia",
  rozmowa: "Prośba o rozmowę",
  formalna: "Sprawa formalna",
  ochrona: "Zgłoszenie ze standardów ochrony małoletnich",
};

Deno.serve(async (request: Request) => {
  const cors = naglowkiCors(request.headers.get("origin"));

  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: cors });
  }
  if (request.method !== "POST") {
    return odpowiedz(405, { blad: "Dozwolona jest wyłącznie metoda POST." }, cors);
  }

  let dane: Record<string, unknown>;
  try {
    const typ = request.headers.get("content-type") || "";
    dane = typ.includes("application/json")
      ? await request.json()
      : Object.fromEntries(await request.formData());
  } catch {
    return odpowiedz(400, { blad: "Nie udało się odczytać formularza." }, cors);
  }

  /* Pułapka: pole „firma_www" jest wyprowadzone poza ekran, ma tabindex -1
     i aria-hidden, więc człowiek go nie zobaczy i nie dojdzie do niego
     tabulatorem. Automat wypełnia wszystkie pola. Odpowiadamy sukcesem, żeby
     nie podpowiadać mu, że został rozpoznany — ale nic nie wysyłamy. Nazwa
     brzmi wiarygodnie celowo: „honeypot" albo „bot" automaty rozpoznają.
     Stara nazwa „firma" zostaje obsłużona, bo mogła zostać w pamięci
     podręcznej przeglądarki po poprzedniej wersji strony. */
  if (oczysc(dane.firma_www) || oczysc(dane.firma)) {
    console.warn("Zgłoszenie odrzucone: wypełniona pułapka.");
    return odpowiedz(200, { ok: true }, cors);
  }

  const czas = czasWypelniania(dane);
  if (czas !== null && czas < MINIMALNY_CZAS_MS) {
    console.warn("Zgłoszenie odrzucone: wypełnione w " + czas + " ms.");
    return odpowiedz(200, { ok: true }, cors);
  }

  const adres =
    request.headers.get("cf-connecting-ip") ??
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    "nieznany";
  if (przekroczonyLimit(adres)) {
    console.warn("Zgłoszenie odrzucone: przekroczony limit z jednego adresu.");
    return odpowiedz(429, {
      blad: "Za dużo zgłoszeń w krótkim czasie. Prosimy spróbować później albo zadzwonić.",
    }, cors);
  }

  /* Który formularz przysłał zgłoszenie. Zapisy pytają o dziecko, kontakt
     o sprawę — mają inne pola obowiązkowe i inny temat wiadomości. */
  const rodzaj = oczysc(dane.rodzaj, 20) === "kontakt" ? "kontakt" : "zapis";

  const telefon = oczysc(dane.telefon, 40);
  const email = oczysc(dane.email, 120);
  const zgoda = dane.zgoda === "on" || dane.zgoda === true || dane.zgoda === "true";

  const haslo = Deno.env.get("SMTP_HASLO");
  const uzytkownik = Deno.env.get("SMTP_USER") ?? "kontakt@skilful.pl";
  if (!haslo) {
    return odpowiedz(503, {
      blad: "Formularz nie jest jeszcze podłączony do skrzynki. Prosimy o kontakt telefoniczny.",
      niepodlaczony: true,
    }, cors);
  }

  let temat: string;
  let wiersze: [string, string][];
  let doKogo = Deno.env.get("MAIL_DO") ?? uzytkownik;

  if (rodzaj === "kontakt") {
    const imie = oczysc(dane.imie);
    const tresc = oczysc(dane.tresc, 4000);
    const sprawa = oczysc(dane.temat, 40);

    const braki: string[] = [];
    if (!imie) braki.push("imię i nazwisko");
    if (!tresc) braki.push("treść wiadomości");
    if (!zgoda) braki.push("zgoda na kontakt");
    if (braki.length) {
      return odpowiedz(400, { blad: "Brakuje pól: " + braki.join(", ") + "." }, cors);
    }
    /* Telefon i e-mail są osobno opcjonalne, ale bez żadnego z nich nie ma jak
       odpowiedzieć. Ta sama kontrola stoi w przeglądarce; tutaj jest powtórzona,
       bo tamtą da się ominąć jednym żądaniem. */
    if (!telefon && !email) {
      return odpowiedz(400, {
        blad: "Wystarczy jedno z dwóch: telefon albo e-mail — ale przynajmniej jedno.",
      }, cors);
    }

    const nazwaSprawy = NAZWY_SPRAW[sprawa] ?? "Wiadomość ze strony";

    /* Zgłoszenie ze standardów ochrony małoletnich ma trafić do osoby
       odpowiedzialnej, a nie do biura — to wymóg ustawowy, nie preferencja.
       Dopóki MAIL_OCHRONA nie jest ustawiony, idzie na adres ogólny: lepiej
       żeby dotarło gdziekolwiek niż nigdzie. Brak osobnej skrzynki zostaje
       pozycją do zamknięcia i jest o tym wpis w dzienniku. */
    if (sprawa === "ochrona") {
      const osobny = Deno.env.get("MAIL_OCHRONA");
      if (osobny) doKogo = osobny;
      else console.warn("MAIL_OCHRONA nieustawiony — zgłoszenie idzie na adres ogólny.");
    }

    const odnosniki = liczbaOdnosnikow(tresc);
    temat = (odnosniki >= 3 ? "[DO SPRAWDZENIA] " : "") + nazwaSprawy + " — " + imie;

    wiersze = [
      ["Sprawa", nazwaSprawy],
      ["Imię i nazwisko", imie],
      ["Telefon", telefon || "nie podano"],
      ["E-mail", email || "nie podano"],
      ["Zgoda na kontakt", "tak"],
      ["Treść", String.fromCharCode(10) + tresc],
    ];
    if (odnosniki >= 3) {
      wiersze.push([
        "Uwaga",
        "wiadomość zawiera " + odnosniki + " odnośników — sprawdźcie, zanim klikniecie",
      ]);
    }
  } else {
    const imieDziecka = oczysc(dane.imie_dziecka);
    const wiekDziecka = oczysc(dane.wiek_dziecka, 40);

    const braki: string[] = [];
    if (!imieDziecka) braki.push("imię dziecka");
    if (!wiekDziecka) braki.push("wiek dziecka");
    if (!telefon) braki.push("telefon");
    if (!zgoda) braki.push("zgoda na kontakt");
    if (braki.length) {
      return odpowiedz(400, { blad: "Brakuje pól: " + braki.join(", ") + "." }, cors);
    }

    temat = "Zapis na zajęcia próbne — " + imieDziecka + ", " + wiekDziecka;
    wiersze = [
      ["Imię dziecka", imieDziecka],
      ["Wiek", wiekDziecka],
      ["Telefon", telefon],
      ["E-mail", email || "nie podano"],
      ["Zgoda na kontakt", "tak"],
    ];
  }

  try {
    await wyslij({
      serwer: Deno.env.get("SMTP_HOST") ?? "ssl0.ovh.net",
      port: Number(Deno.env.get("SMTP_PORT") ?? "465"),
      uzytkownik,
      haslo,
      doKogo,
      odpowiedzDo: email && wygladaJakEmail(email) ? email : undefined,
      temat,
      tresc: wiersze.map(([k, v]) => k + ": " + v).join(String.fromCharCode(10)),
    });
  } catch (e) {
    /* Szczegóły zostają w dzienniku — piszącemu nic nie powiedzą, a nam
       wskażą, czy odrzucono hasło, czy zerwano połączenie. */
    console.error("Wysyłka SMTP nie powiodła się:", e);
    return odpowiedz(502, {
      blad: "Nie udało się wysłać zgłoszenia. Prosimy spróbować telefonicznie.",
    }, cors);
  }

  return odpowiedz(200, { ok: true }, cors);
});
