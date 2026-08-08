# Przeniesienie serwisu na Cloudflare Pages

Instrukcja dla osoby z dostępem do konta Cloudflare. Zakładania konta ani
logowania nie da się zrobić za Was — reszta jest przygotowana po stronie kodu.

Po przenosinach zmieniają się dwie rzeczy widoczne na zewnątrz: adres traci
przedrostek `/SAver.1`, a serwis zaczyna działać na własnej domenie.

---

## 1. Podłączenie repozytorium (jednorazowo, ok. 5 minut)

1. Zalogujcie się na **dash.cloudflare.com**.
2. Z menu po lewej wybierzcie **Workers & Pages** → przycisk **Create** →
   zakładka **Pages** → **Connect to Git**.
3. Zezwólcie Cloudflare na dostęp do konta GitHub i wskażcie repozytorium
   **SAver.1**.
4. W ustawieniach budowania wpiszcie dokładnie:

   | Pole | Wartość |
   | --- | --- |
   | Framework preset | `Astro` |
   | Build command | `npm run build` |
   | Build output directory | `dist` |
   | Root directory | `web` |
   | Node version (zmienna `NODE_VERSION`) | `20` |

5. **Save and Deploy.** Pierwsze budowanie trwa 1–2 minuty. Dostaniecie adres
   tymczasowy w postaci `nazwa-projektu.pages.dev`.

Na tym etapie serwis działa jeszcze z przedrostkiem `/SAver.1` — poprawiamy to
w kroku 3, razem z domeną.

---

## 2. Podłączenie domeny

1. Domena musi być w Cloudflare: **Websites** → **Add a site**, a potem
   zmiana serwerów nazw (nameserverów) u rejestratora, u którego kupiliście
   domenę. Cloudflare pokaże, jakie wpisać. Propagacja trwa od kilku minut do
   kilku godzin.
2. Wróćcie do projektu Pages → zakładka **Custom domains** → **Set up a custom
   domain** → wpiszcie domenę (np. `skillsacademy.pl`).
3. Cloudflare sam doda wpis DNS i wystawi certyfikat SSL. Nic nie kupujecie.
4. Powtórzcie dla `www`, jeśli chcecie, żeby oba adresy działały.

---

## 3. Zmiany w kodzie po podłączeniu domeny

To jedyny moment, w którym trzeba ruszyć pliki. Trzy miejsca:

**`web/astro.config.mjs`**

```js
site: "https://skillsacademy.pl",   // Wasza domena
base: "/",                          // było "/SAver.1"
```

**`web/src/styles/style.css`** — usuńcie przedrostek `/SAver.1` z siedmiu
reguł `@font-face` na górze pliku, np.:

```css
src: url("/fonts/Lexend-Regular.ttf") format("truetype");
```

**`web/public/robots.txt`** — podmieńcie adres w linii `Sitemap:` i usuńcie
`/SAver.1` z trzech linii `Disallow:`.

Po wypchnięciu zmian Cloudflare przebuduje serwis automatycznie.

> Jeśli wolicie, mogę przygotować te zmiany od razu — wystarczy, że podacie
> docelową domenę.

---

## 4. Co zrobić ze starym adresem GitHub Pages

Kiedy domena zacznie działać, wyłączcie stary adres, żeby ta sama treść nie
istniała pod dwoma adresami (wyszukiwarka traktuje to jako duplikat):

- **Settings → Pages → Source → None** w repozytorium na GitHubie,
- plik `.github/workflows/deploy.yml` możecie wtedy usunąć — Cloudflare buduje
  serwis samodzielnie.

---

## 5. Zgłoszenie mapy serwisu

Po uruchomieniu domeny dodajcie serwis w **Google Search Console** i zgłoście
mapę pod adresem:

```
https://skillsacademy.pl/sitemap.xml
```

---

## Uwaga o D1 (baza danych)

D1 przyda się dopiero wtedy, gdy formularz zapisu ma zapisywać zgłoszenia do
bazy zamiast wysyłać je mailem. Zanim to wdrożycie, warto wiedzieć, co to
za sobą pociąga:

- zgłoszenia zawierają **imię i wiek dziecka**, czyli dane osobowe małoletnich;
- Cloudflare staje się wtedy **podmiotem przetwarzającym** i potrzebna jest
  umowa powierzenia przetwarzania danych;
- w polityce prywatności i klauzuli RODO trzeba dopisać: gdzie dane są
  przechowywane, przez jaki czas i kto ma do nich dostęp;
- ktoś musi te zgłoszenia regularnie odczytywać — baza bez panelu do przeglądania
  jest mniej użyteczna niż e-mail, który sam przychodzi na skrzynkę.

Przy kilkunastu–kilkudziesięciu zgłoszeniach miesięcznie zwykły formularz
wysyłający e-mail załatwia sprawę bez żadnego z tych obowiązków. D1 zaczyna się
opłacać, gdy pojawia się potrzeba historii zgłoszeń, statusów („oddzwoniono”,
„zapisany”) albo raportów.

Jeśli mimo to chcecie D1 od razu — dajcie znać, przygotuję formularz razem
z funkcją zapisującą i schematem bazy.
