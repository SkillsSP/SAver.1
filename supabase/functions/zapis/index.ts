/* ==========================================================================
   ODBIÓR ZGŁOSZENIA Z FORMULARZA → E-MAIL   (Supabase Edge Function)

   Wysyłka idzie przez SMTP własnej poczty w OVH, a nie przez zewnętrzną usługę
   pocztową. Powód jest praktyczny: skrzynka i tak istnieje i działa, więc nie
   zakładamy nowego konta, nie dodajemy rekordów DNS i nie ruszamy wpisu SPF —
   a dopisanie drugiego wpisu SPF potrafi położyć całą pocztę firmy, nie tylko
   formularz. Przy okazji nie dochodzi kolejny podmiot przetwarzający dane
   dziecka.

   Dane nigdzie się nie zapisują — lecą prosto na skrzynkę i tyle. To świadomy
   wybór zamiast tabeli w bazie: zgłoszenia zawierają imię i wiek dziecka,
   a mniej danych osobowych w spoczynku znaczy mniej do opisania w rejestrze
   czynności przetwarzania i mniej do stracenia. Gdyby kiedyś doszedł zapis do
   tabeli, ma iść OBOK wysyłki, nie zamiast — awaria bazy nie może gubić
   zgłoszeń.

   ---------------------------------------------------------------------------
   NADAWCA MUSI BYĆ TĄ SAMĄ SKRZYNKĄ, KTÓRĄ SIĘ LOGUJEMY

   OVH nie pozwala wysyłać „w imieniu" innego adresu niż uwierzytelniony.
   Dlatego wiadomość idzie z `kontakt@skilful.pl` na `kontakt@skilful.pl`.
   Wysyłka do siebie samego jest tu w porządku: w temacie stoi imię i wiek
   dziecka, więc zgłoszenie widać na liście bez otwierania. Adres rodzica
   ląduje w nagłówku Reply-To, żeby „Odpowiedz" trafiało do rodzica, a nie
   z powrotem do nas.

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

   ---------------------------------------------------------------------------
   WDROŻENIE

     supabase functions deploy zapis --no-verify-jwt \
       --project-ref nmhwdjqmmeovgoersjll

   `--no-verify-jwt` jest konieczne. Domyślnie funkcja żąda nagłówka
   Authorization z kluczem projektu, a formularz na stronie publicznej nie ma
   go komu podać — rodzic dostałby 401 zamiast potwierdzenia.
   ========================================================================== */

import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";

const LIMIT_DLUGOSCI = 200;

/* Ile czekamy na serwer poczty, zanim się poddamy. Bez tego, gdyby połączenia
   SMTP były z tego środowiska blokowane, zapytanie wisiałoby aż do limitu
   platformy, a rodzic patrzyłby w kręcące się kółko. Lepiej po dziesięciu
   sekundach powiedzieć wprost, że nie wyszło. */
const LIMIT_CZASU_MS = 10_000;

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

function ucieczkaHtml(tekst: string): string {
  return tekst.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
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

Deno.serve(async (request: Request) => {
  const cors = naglowkiCors(request.headers.get("origin"));

  /* Zapytanie wstępne przeglądarki przy wywołaniu międzydomenowym. */
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

  /* Pułapka na roboty: pole „firma" jest ukryte przed człowiekiem, więc
     wypełnia je wyłącznie automat. Odpowiadamy sukcesem, żeby nie podpowiadać
     mu, że został rozpoznany — ale nic nie wysyłamy. */
  if (oczysc(dane.firma)) {
    return odpowiedz(200, { ok: true }, cors);
  }

  const imieDziecka = oczysc(dane.imie_dziecka);
  const wiekDziecka = oczysc(dane.wiek_dziecka, 40);
  const telefon = oczysc(dane.telefon, 40);
  const email = oczysc(dane.email, 120);
  const zgoda =
    dane.zgoda === "on" || dane.zgoda === true || dane.zgoda === "true";

  const braki: string[] = [];
  if (!imieDziecka) braki.push("imię dziecka");
  if (!wiekDziecka) braki.push("wiek dziecka");
  if (!telefon) braki.push("telefon");
  if (!zgoda) braki.push("zgoda na kontakt");
  if (braki.length) {
    return odpowiedz(400, { blad: `Brakuje pól: ${braki.join(", ")}.` }, cors);
  }

  const haslo = Deno.env.get("SMTP_HASLO");
  const uzytkownik = Deno.env.get("SMTP_USER") ?? "kontakt@skilful.pl";
  const serwer = Deno.env.get("SMTP_HOST") ?? "ssl0.ovh.net";
  const port = Number(Deno.env.get("SMTP_PORT") ?? "465");
  const doKogo = Deno.env.get("MAIL_DO") ?? uzytkownik;

  if (!haslo) {
    return odpowiedz(
      503,
      {
        blad:
          "Formularz nie jest jeszcze podłączony do skrzynki. Prosimy o kontakt telefoniczny.",
        niepodlaczony: true,
      },
      cors,
    );
  }

  const wiersze: [string, string][] = [
    ["Imię dziecka", imieDziecka],
    ["Wiek", wiekDziecka],
    ["Telefon", telefon],
    ["E-mail", email || "nie podano"],
    ["Zgoda na kontakt", "tak"],
  ];

  const klient = new SMTPClient({
    connection: {
      hostname: serwer,
      port,
      /* Port 465 szyfruje od pierwszego bajtu. Gdyby ktoś przestawił port na
         587, połączenie zaczyna się jawnie i przechodzi w szyfrowane przez
         STARTTLS — stąd rozgałęzienie. */
      tls: port === 465,
      auth: { username: uzytkownik, password: haslo },
    },
  });

  try {
    await Promise.race([
      klient.send({
        from: `Formularz Skills Academy <${uzytkownik}>`,
        to: doKogo,
        /* „Odpowiedz" ma trafiać do rodzica, a nie z powrotem do nas — ale
           tylko wtedy, gdy rodzic podał sensowny adres. */
        replyTo: email && wygladaJakEmail(email) ? email : undefined,
        subject: `Zapis na zajęcia próbne — ${imieDziecka}, ${wiekDziecka}`,
        content: wiersze.map(([k, v]) => `${k}: ${v}`).join("\n"),
        html: wiersze
          .map(
            ([k, v]) =>
              `<p><strong>${ucieczkaHtml(k)}:</strong> ${ucieczkaHtml(v)}</p>`,
          )
          .join(""),
      }),
      new Promise((_, odrzuc) =>
        setTimeout(
          () => odrzuc(new Error(`Serwer poczty nie odpowiedział w ${LIMIT_CZASU_MS} ms`)),
          LIMIT_CZASU_MS,
        )
      ),
    ]);
  } catch (e) {
    /* Szczegóły zostają w logach Supabase — rodzicowi nic nie powiedzą,
       a nam wskażą, czy to złe hasło, czy zablokowane połączenie. */
    console.error("Wysyłka SMTP nie powiodła się:", e);
    return odpowiedz(
      502,
      { blad: "Nie udało się wysłać zgłoszenia. Prosimy spróbować telefonicznie." },
      cors,
    );
  } finally {
    /* Połączenie trzeba domknąć, inaczej funkcja potrafi wisieć po odesłaniu
       odpowiedzi. Błąd przy zamykaniu nie ma już wpływu na zgłoszenie. */
    try {
      await klient.close();
    } catch { /* nieistotne */ }
  }

  return odpowiedz(200, { ok: true }, cors);
});
