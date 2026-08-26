# Uruchomienie serwisu na Cloudflare Pages — skilful.pl

> **To wariant zapasowy, nie obecny stan.** Serwis stoi dziś na GitHub Pages
> (publikacja przez Actions z gałęzi `main`), a formularz wysyła zgłoszenia
> przez funkcję Supabase korzystającą z SMTP własnej poczty w OVH. Ten plik
> opisuje, co zrobić, gdyby padła decyzja o przenosinach na Cloudflare —
> wtedy formularz przechodzi na `web/functions/api/zapis.js` i Resend.

Instrukcja dla osoby z dostępem do konta Cloudflare, do OVHcloud i do
repozytorium **SkillsSP/SAver.1**. Logowania ani zakładania kont nie da się
zrobić za Was; wszystko po stronie kodu jest gotowe.

**Stan wyjściowy**

| Element | Gdzie jest |
| --- | --- |
| Domena `skilful.pl` | kupiona w **OVHcloud** |
| Kod serwisu | GitHub, `SkillsSP/SAver.1`, gałąź `main`, katalog `web/` |
| Poczta `kontakt@skilful.pl` | u dotychczasowego dostawcy (najpewniej OVH) |
| Serwis pod domeną | stara wersja z GitHub Pages, bez stylów — naprawi to pierwsze wdrożenie z Cloudflare |

---

## ⚠️ Zanim ruszycie nameservery — poczta

To jedyny krok w całej instrukcji, który może coś **zepsuć**, a nie tylko
nie zadziałać.

Zmiana serwerów nazw na Cloudflare oznacza, że **Cloudflare przejmuje całą
strefę DNS domeny** — nie tylko wpisy strony, ale też wpisy poczty. Jeśli
rekordy MX nie zostaną odtworzone po stronie Cloudflare, **poczta na adres
`kontakt@skilful.pl` przestanie przychodzić**, a nadawcy będą dostawać odbicia.

Kolejność, która to wyklucza:

1. W panelu OVH otwórzcie **strefę DNS** domeny `skilful.pl` i wyeksportujcie
   ją albo zróbcie zrzut ekranu **wszystkich** rekordów. Interesują Was
   szczególnie: `MX`, `TXT` ze wpisem `v=spf1`, `TXT` z `_dmarc`, oraz
   `CNAME`/`TXT` z nazwą zawierającą `._domainkey` (podpisy DKIM).
2. Dodajcie domenę w Cloudflare (krok 2 poniżej). Cloudflare przy dodawaniu
   **sam skanuje** istniejącą strefę i zwykle przenosi rekordy — ale zwykle
   to nie zawsze.
3. **Porównajcie listę w Cloudflare z tym, co zapisaliście w punkcie 1.**
   Czego brakuje, dopiszcie ręcznie. Rekordy MX muszą się zgadzać co do
   nazwy i priorytetu.
4. Dopiero teraz zmieńcie nameservery w OVH.
5. Po zmianie wyślijcie **wiadomość testową na `kontakt@skilful.pl`** z konta
   spoza domeny (np. prywatnej Gmail) i sprawdźcie, czy doszła.

Jeśli wolicie tego uniknąć, jest droga bez ruszania nameserverów — patrz
„Wariant B” na końcu. Jest wygodniejsza dla poczty, ale trudniejsza dla
domeny bez `www`.

---

## 1. Podłączenie repozytorium (ok. 5 minut)

1. Zalogujcie się na **dash.cloudflare.com**.
2. **Workers & Pages** → **Create** → zakładka **Pages** → **Connect to Git**.
3. Zezwólcie Cloudflare na dostęp do organizacji **SkillsSP** i wskażcie
   repozytorium **SAver.1**, gałąź `main`.
4. W ustawieniach budowania wpiszcie dokładnie:

   | Pole | Wartość |
   | --- | --- |
   | Framework preset | `Astro` |
   | Build command | `npm run build` |
   | Build output directory | `dist` |
   | Root directory | `web` |
   | Zmienna `NODE_VERSION` | `24` |

   **Root directory** jest najważniejsze — bez niego Cloudflare szuka
   `package.json` w korzeniu repozytorium i budowanie kończy się błędem.

5. **Save and Deploy.** Pierwsze budowanie trwa 1–2 minuty. Dostaniecie adres
   `nazwa-projektu.pages.dev`. Sprawdźcie na nim, czy strona ma style, fonty
   i zdjęcia — **zanim** ruszycie domenę.

> Cloudflare buduje serwis sam, bez GitHub Actions. To rozwiązuje przy okazji
> problem, przez który wdrożenia przestały wychodzić po przeniesieniu
> repozytorium do organizacji SkillsSP.

---

## 2. Podłączenie domeny z OVHcloud

1. W Cloudflare: **Websites** → **Add a site** → `skilful.pl` → plan **Free**.
2. Cloudflare przeskanuje obecną strefę DNS i pokaże znalezione rekordy.
   **Teraz wykonajcie punkt 3 z ostrzeżenia powyżej** — porównajcie tę listę
   z wpisami z OVH i uzupełnijcie braki, zwłaszcza `MX` i `SPF`.
3. Cloudflare poda dwa serwery nazw, np. `xxx.ns.cloudflare.com`.
4. W panelu OVH: **Domeny** → `skilful.pl` → zakładka **Serwery DNS** →
   **Zmień serwery DNS** → wpiszcie oba adresy z Cloudflare.
   Propagacja trwa od kilkunastu minut do kilku godzin; OVH potrafi też
   wymagać potwierdzenia mailem.
5. Gdy Cloudflare pokaże domenę jako **Active**, wróćcie do projektu Pages →
   **Custom domains** → **Set up a custom domain** → `skilful.pl`.
   Powtórzcie dla `www.skilful.pl`.
6. Certyfikat SSL Cloudflare wystawia sam. Nic nie kupujecie.

---

## 3. Podłączenie skrzynki do formularza

Formularz zapisu jest podpięty do funkcji `web/functions/api/zapis.js`.
Potrzebuje usługi wysyłającej pocztę. Bez niej odpowiada kodem 503, a rodzic
widzi komunikat „formularz nie jest jeszcze podłączony do skrzynki” zamiast
błędu albo ciszy.

1. Załóżcie konto na **resend.com** (plan darmowy: 3000 wiadomości miesięcznie
   — przy tej skali zapas na lata) i dodajcie w nim domenę `skilful.pl`.
2. Resend poda rekordy DNS do dodania. **Uwaga na SPF:** jeśli w strefie jest
   już wpis `v=spf1` od dotychczasowej poczty, **nie dodawajcie drugiego** —
   domena może mieć tylko jeden rekord SPF. Trzeba dopisać fragment Resendu
   do istniejącego wpisu, przed końcowym `~all` albo `-all`. Dwa osobne wpisy
   SPF unieważniają się nawzajem i psują dostarczalność.
3. W Resend wygenerujcie klucz API. Zaczyna się od `re_`. **Zobaczycie go
   tylko raz** — zapiszcie od razu w menedżerze haseł.
4. W Cloudflare: **Workers & Pages** → projekt → **Settings** →
   **Variables and Secrets** → dodajcie trzy pozycje dla środowiska
   **Production**:

   | Nazwa | Typ | Wartość |
   | --- | --- | --- |
   | `RESEND_API_KEY` | **Secret** | klucz z punktu 3 |
   | `MAIL_DO` | Text | `kontakt@skilful.pl` |
   | `MAIL_OD` | Text | `formularz@skilful.pl` |

   `RESEND_API_KEY` musi być typu **Secret**, nie Text — inaczej klucz zobaczy
   każdy, kto ma dostęp do panelu.

   `MAIL_OD` to adres **nadawcy**, nie skrzynka — nie musi istnieć jako konto
   pocztowe, wystarczy że domena jest potwierdzona w Resend. Celowo jest inny
   niż `info@`, żeby w skrzynce od razu było widać, co przyszło z formularza.

5. Kliknijcie **Retry deployment**, żeby funkcja zobaczyła nowe zmienne.
6. Wyślijcie **jedno prawdziwe zgłoszenie** przez formularz i sprawdźcie, czy
   doszło na `kontakt@skilful.pl`. To jedyny wiarygodny test.

---

## 4. Sprzątanie po GitHub Pages

Dopiero **gdy `skilful.pl` działa z Cloudflare**:

1. W repozytorium: **Settings** → **Pages** → **Source** → **None**.
2. Dajcie znać — usunę wtedy z repozytorium plik `CNAME`, jego kopię
   w `web/public/CNAME` i workflow `.github/workflows/deploy.yml`.
   Wszystkie trzy są mechanizmami GitHub Pages i na Cloudflare nic nie robią.

Zostawienie starego adresu włączonego oznacza tę samą treść pod dwoma
adresami — wyszukiwarka traktuje to jak duplikat.

---

## 5. Zgłoszenie mapy serwisu

Po uruchomieniu domeny dodajcie serwis w **Google Search Console** i zgłoście
mapę:

```
https://skilful.pl/sitemap.xml
```

Mapa zawiera 13 adresów. Regulamin, polityka prywatności i klauzula RODO są
z niej świadomie wyłączone, żeby nie konkurowały w wynikach ze stronami oferty.

---

## Wariant B — bez ruszania nameserverów

Jeśli nie chcecie przenosić DNS z OVH (na przykład dlatego, że poczta jest
tam skonfigurowana i działa), Cloudflare Pages da się podpiąć wpisem CNAME
w OVH. Haczyk: `skilful.pl` bez `www` to domena szczytowa, a klasyczny CNAME
jest tam niedozwolony. OVH nie oferuje odpowiednika ALIAS/ANAME, więc w tym
wariancie:

- `www.skilful.pl` → CNAME na `nazwa-projektu.pages.dev`, działa normalnie,
- `skilful.pl` bez `www` → trzeba przekierować przez usługę przekierowań OVH
  na `www.skilful.pl`.

Serwis działa, ale adres główny staje się `www.skilful.pl`. Wariant A
(nameservery w Cloudflare) jest czystszy — pod warunkiem przeniesienia
rekordów poczty, o którym mowa na górze.

---

## O Supabase

Baza nie jest w tej układance potrzebna i celowo jej nie używamy. Formularz
przepisuje zgłoszenie na skrzynkę i nic nie zapisuje, bo zgłoszenia zawierają
**imię i wiek dziecka**, czyli dane osobowe małoletnich. Trzymanie ich w bazie
oznacza umowę powierzenia przetwarzania z dostawcą, opis w rejestrze czynności
przetwarzania, ustalony okres przechowywania oraz dopisanie tego wszystkiego
do polityki prywatności i klauzuli RODO.

Supabase zacznie się opłacać, gdy pojawi się potrzeba historii zgłoszeń,
statusów („oddzwoniono”, „zapisany”) albo raportów — czyli wtedy, gdy ktoś
faktycznie będzie w tej bazie pracował. Przy kilkunastu zgłoszeniach
miesięcznie e-mail, który sam przychodzi na skrzynkę, jest wygodniejszy
i nie pociąga żadnego z tych obowiązków.

Jeśli mimo to chcecie zapis do Supabase — powiedzcie, dopiszę zapis obok
wysyłki maila (nie zamiast), żeby awaria bazy nie gubiła zgłoszeń.
