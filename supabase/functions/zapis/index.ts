/* ==========================================================================
   ODBIÓR ZGŁOSZENIA Z FORMULARZA → E-MAIL   (Supabase Edge Function)

   Odpowiednik functions/api/zapis.js z Cloudflare, przepisany na Deno. Służy
   wariantowi bez Cloudflare: strona stoi na GitHub Pages, który serwuje
   wyłącznie pliki statyczne i sam takiej funkcji nie uruchomi.

   Dane nigdzie się nie zapisują — lecą prosto na skrzynkę i tyle. To świadomy
   wybór zamiast tabeli w bazie: zgłoszenia zawierają imię i wiek dziecka,
   a mniej danych osobowych w spoczynku znaczy mniej do opisania w rejestrze
   czynności przetwarzania i mniej do stracenia. Jeśli kiedyś dojdzie zapis do
   tabeli, ma iść OBOK wysyłki, nie zamiast — awaria bazy nie może gubić
   zgłoszeń.

   ---------------------------------------------------------------------------
   WDROŻENIE

     supabase login
     supabase link --project-ref <ref-projektu>
     supabase secrets set RESEND_API_KEY=re_... MAIL_DO=info@skilful.pl \
                          MAIL_OD=formularz@skilful.pl
     supabase functions deploy zapis --no-verify-jwt

   `--no-verify-jwt` jest konieczne. Domyślnie funkcja żąda nagłówka
   Authorization z kluczem projektu, a formularz na stronie publicznej nie ma
   go komu podać — rodzic dostałby 401 zamiast potwierdzenia.

   Adres funkcji po wdrożeniu:
     https://<ref-projektu>.supabase.co/functions/v1/zapis
   Ten adres wpisujecie w web/src/lib/site.js jako `formularzEndpoint`.
   ========================================================================== */

const LIMIT_DLUGOSCI = 200;

/* Skąd wolno wywołać funkcję. Gwiazdka byłaby wygodniejsza, ale wtedy
   dowolna strona mogłaby wysyłać zgłoszenia w Waszym imieniu i zapychać
   skrzynkę. Adres podglądowy z GitHub Pages zostaje na czas przenosin. */
const DOZWOLONE_ZRODLA = [
  "https://skilful.pl",
  "https://www.skilful.pl",
];

function naglowkiCors(zrodlo: string | null): Record<string, string> {
  const dozwolone = zrodlo && DOZWOLONE_ZRODLA.includes(zrodlo) ? zrodlo : DOZWOLONE_ZRODLA[0];
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

function odpowiedz(status: number, tresc: unknown, cors: Record<string, string>): Response {
  return new Response(JSON.stringify(tresc), {
    status,
    headers: { ...cors, "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
  });
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
  const zgoda = dane.zgoda === "on" || dane.zgoda === true || dane.zgoda === "true";

  const braki: string[] = [];
  if (!imieDziecka) braki.push("imię dziecka");
  if (!wiekDziecka) braki.push("wiek dziecka");
  if (!telefon) braki.push("telefon");
  if (!zgoda) braki.push("zgoda na kontakt");
  if (braki.length) {
    return odpowiedz(400, { blad: `Brakuje pól: ${braki.join(", ")}.` }, cors);
  }

  const klucz = Deno.env.get("RESEND_API_KEY");
  const doKogo = Deno.env.get("MAIL_DO");
  const odKogo = Deno.env.get("MAIL_OD") ?? "formularz@skilful.pl";

  if (!klucz || !doKogo) {
    return odpowiedz(503, {
      blad: "Formularz nie jest jeszcze podłączony do skrzynki. Prosimy o kontakt telefoniczny.",
      niepodlaczony: true,
    }, cors);
  }

  const wiersze: [string, string][] = [
    ["Imię dziecka", imieDziecka],
    ["Wiek", wiekDziecka],
    ["Telefon", telefon],
    ["E-mail", email || "nie podano"],
    ["Zgoda na kontakt", "tak"],
  ];

  try {
    const wynik = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { authorization: `Bearer ${klucz}`, "content-type": "application/json" },
      body: JSON.stringify({
        from: `Formularz Skills Academy <${odKogo}>`,
        to: [doKogo],
        /* Odpowiedź z poczty ma trafić do rodzica, ale tylko wtedy,
           gdy rodzic podał adres. */
        reply_to: email || undefined,
        subject: `Zapis na zajęcia próbne — ${imieDziecka}, ${wiekDziecka}`,
        text: wiersze.map(([k, v]) => `${k}: ${v}`).join("\n"),
        html: wiersze
          .map(([k, v]) => `<p><strong>${ucieczkaHtml(k)}:</strong> ${ucieczkaHtml(v)}</p>`)
          .join(""),
      }),
    });

    if (!wynik.ok) {
      /* Treść błędu zostaje w logach Supabase. Rodzic dostaje komunikat bez
         szczegółów technicznych, bo i tak nic mu nie powiedzą. */
      console.error("Resend odrzucił wysyłkę:", wynik.status, await wynik.text());
      return odpowiedz(502, {
        blad: "Nie udało się wysłać zgłoszenia. Prosimy spróbować telefonicznie.",
      }, cors);
    }
  } catch (e) {
    console.error("Błąd połączenia z Resend:", e);
    return odpowiedz(502, {
      blad: "Nie udało się wysłać zgłoszenia. Prosimy spróbować telefonicznie.",
    }, cors);
  }

  return odpowiedz(200, { ok: true }, cors);
});
