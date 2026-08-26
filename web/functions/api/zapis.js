/* ==========================================================================
   ODBIÓR ZGŁOSZENIA Z FORMULARZA → E-MAIL

   Funkcja Cloudflare Pages. Uruchamia się pod adresem /api/zapis w tej samej
   domenie co strona, więc zgłoszenie nie wychodzi do żadnego obcego serwisu
   po drodze i nie ma zapytania międzydomenowego.

   Dane nigdzie się nie zapisują — lecą prosto na skrzynkę i tyle. To świadomy
   wybór zamiast bazy: mniej danych osobowych w spoczynku znaczy mniej do
   opisania w rejestrze czynności przetwarzania i mniej do stracenia.

   ---------------------------------------------------------------------------
   CO TRZEBA USTAWIĆ W PANELU CLOUDFLARE
   (Workers & Pages → projekt → Settings → Variables and Secrets)

     RESEND_API_KEY   klucz z resend.com, zaczyna się od „re_"; dodać jako
                      Secret, nie jako zwykłą zmienną
     MAIL_DO          adres, na który mają przychodzić zgłoszenia
     MAIL_OD          adres nadawcy z domeny potwierdzonej w Resend,
                      np. formularz@skilful.pl

   Dopóki RESEND_API_KEY albo MAIL_DO są puste, funkcja odpowiada kodem 503
   i czytelnym komunikatem — strona pokazuje go rodzicowi razem z prośbą
   o telefon. Zgłoszenie nigdy nie ginie po cichu.
   ========================================================================== */

const LIMIT_DLUGOSCI = 200;

/** Przycina i czyści pojedyncze pole. Nagłówki maila nie mogą zawierać
    znaków końca linii — bez tego dałoby się przez formularz dokleić własny
    nagłówek do wiadomości. */
function oczysc(wartosc, limit = LIMIT_DLUGOSCI) {
  if (typeof wartosc !== "string") return "";
  return wartosc.replace(/[\r\n]+/g, " ").trim().slice(0, limit);
}

function odpowiedz(status, tresc) {
  return new Response(JSON.stringify(tresc), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}

function ucieczkaHtml(tekst) {
  return tekst
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export async function onRequestPost({ request, env }) {
  let dane;
  try {
    const typ = request.headers.get("content-type") || "";
    if (typ.includes("application/json")) {
      dane = await request.json();
    } else {
      dane = Object.fromEntries(await request.formData());
    }
  } catch {
    return odpowiedz(400, { blad: "Nie udało się odczytać formularza." });
  }

  /* Pułapka na roboty: pole „firma" jest ukryte przed człowiekiem, więc
     wypełnia je wyłącznie automat. Odpowiadamy sukcesem, żeby nie podpowiadać
     mu, że został rozpoznany — ale nic nie wysyłamy. */
  if (oczysc(dane.firma)) {
    return odpowiedz(200, { ok: true });
  }

  const imieDziecka = oczysc(dane.imie_dziecka);
  const wiekDziecka = oczysc(dane.wiek_dziecka, 40);
  const telefon = oczysc(dane.telefon, 40);
  const email = oczysc(dane.email, 120);
  const zgoda = dane.zgoda === "on" || dane.zgoda === true || dane.zgoda === "true";

  const braki = [];
  if (!imieDziecka) braki.push("imię dziecka");
  if (!wiekDziecka) braki.push("wiek dziecka");
  if (!telefon) braki.push("telefon");
  if (!zgoda) braki.push("zgoda na kontakt");
  if (braki.length) {
    return odpowiedz(400, {
      blad: `Brakuje pól: ${braki.join(", ")}.`,
    });
  }

  const klucz = env.RESEND_API_KEY;
  const doKogo = env.MAIL_DO;
  const odKogo = env.MAIL_OD || "formularz@skilful.pl";

  if (!klucz || !doKogo) {
    return odpowiedz(503, {
      blad:
        "Formularz nie jest jeszcze podłączony do skrzynki. Prosimy o kontakt telefoniczny.",
      niepodlaczony: true,
    });
  }

  const wiersze = [
    ["Imię dziecka", imieDziecka],
    ["Wiek", wiekDziecka],
    ["Telefon", telefon],
    ["E-mail", email || "nie podano"],
    ["Zgoda na kontakt", "tak"],
  ];

  const tekst = wiersze.map(([k, v]) => `${k}: ${v}`).join("\n");
  const html = wiersze
    .map(([k, v]) => `<p><strong>${ucieczkaHtml(k)}:</strong> ${ucieczkaHtml(v)}</p>`)
    .join("");

  try {
    const wynik = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        authorization: `Bearer ${klucz}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        from: `Formularz Skills Academy <${odKogo}>`,
        to: [doKogo],
        /* Odpowiedź z poczty ma trafić do rodzica, nie do formularza —
           ale tylko wtedy, gdy rodzic podał adres. */
        reply_to: email || undefined,
        subject: `Zapis na zajęcia próbne — ${imieDziecka}, ${wiekDziecka}`,
        text: tekst,
        html,
      }),
    });

    if (!wynik.ok) {
      /* Treść błędu zostaje w logach Cloudflare. Rodzic dostaje komunikat
         bez szczegółów technicznych, bo i tak nic mu nie powiedzą. */
      console.error("Resend odrzucił wysyłkę:", wynik.status, await wynik.text());
      return odpowiedz(502, {
        blad: "Nie udało się wysłać zgłoszenia. Prosimy spróbować telefonicznie.",
      });
    }
  } catch (e) {
    console.error("Błąd połączenia z Resend:", e);
    return odpowiedz(502, {
      blad: "Nie udało się wysłać zgłoszenia. Prosimy spróbować telefonicznie.",
    });
  }

  return odpowiedz(200, { ok: true });
}

/* Wejście GET-em w pasku adresu ma dostać czytelną odpowiedź, a nie surowy
   błąd. Świadomie nie eksportujemy `onRequest` — byłby fallbackiem dla
   wszystkich metod i przesłoniłby powyższą obsługę POST. */
export async function onRequestGet() {
  return odpowiedz(405, { blad: "Dozwolona jest wyłącznie metoda POST." });
}
