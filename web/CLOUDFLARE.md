# Uruchomienie serwisu na Cloudflare Pages — skilful.pl

Instrukcja dla osoby z dostępem do konta Cloudflare i do repozytorium
**SkillsSP/SAver.1**. Logowania ani zakładania kont nie da się zrobić za Was;
wszystko po stronie kodu jest już gotowe.

**Stan kodu:** serwis jest ustawiony pod `https://skilful.pl` w katalogu
głównym domeny (`base: "/"`). Formularz zapisu wysyła zgłoszenia do funkcji
`/api/zapis`, która przepisuje je na skrzynkę.

**Uwaga na kolejność:** dopóki nie wykonacie kroku 1, stary adres
`…github.io/SAver.1/` pokazuje stronę bez stylów i bez fontów. Tak ma być —
ścieżki są policzone od katalogu głównego domeny, a nie od podkatalogu.

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
   | Zmienna `NODE_VERSION` | `20` |

   Pole **Root directory** jest najważniejsze — bez niego Cloudflare szuka
   `package.json` w korzeniu repozytorium i budowanie kończy się błędem.

5. **Save and Deploy.** Pierwsze budowanie trwa 1–2 minuty. Dostaniecie adres
   tymczasowy `nazwa-projektu.pages.dev` — sprawdźcie na nim, czy strona ma
   style i fonty, zanim przejdziecie dalej.

---

## 2. Podłączenie domeny skilful.pl

1. Domena musi być w Cloudflare: **Websites** → **Add a site** → `skilful.pl`.
   Potem u rejestratora, u którego kupiliście domenę, zmieniacie serwery nazw
   (nameservery) na te, które pokaże Cloudflare. Propagacja trwa od kilkunastu
   minut do kilku godzin.
2. Wróćcie do projektu Pages → **Custom domains** → **Set up a custom domain**
   → `skilful.pl`.
3. Powtórzcie dla `www.skilful.pl`. Cloudflare sam doda wpisy DNS i wystawi
   certyfikat — nic nie kupujecie.
4. Ustawcie jeden adres jako główny, a drugi jako przekierowanie, żeby ta sama
   treść nie istniała pod dwoma adresami. Wyszukiwarka traktuje to jak duplikat.

---

## 3. Podłączenie skrzynki do formularza

Formularz zapisu jest już podpięty do funkcji `web/functions/api/zapis.js`,
ale sama funkcja potrzebuje dostępu do usługi wysyłającej pocztę. Bez tego
odpowiada kodem 503, a rodzic widzi komunikat „formularz nie jest jeszcze
podłączony do skrzynki” zamiast błędu albo ciszy.

1. Załóżcie konto na **resend.com** (plan darmowy: 3000 wiadomości miesięcznie,
   z zapasem na kilka lat przy tej skali) i potwierdźcie w nim domenę
   `skilful.pl`. Resend poda trzy wpisy DNS do dodania — w Cloudflare wchodzą
   pod **Websites → skilful.pl → DNS**.
2. W Resend wygenerujcie klucz API. Zaczyna się od `re_`. **Zobaczycie go
   tylko raz** — zapiszcie od razu w menedżerze haseł.
3. W Cloudflare: **Workers & Pages** → projekt → **Settings** →
   **Variables and Secrets** → dodajcie trzy pozycje dla środowiska
   **Production**:

   | Nazwa | Typ | Wartość |
   | --- | --- | --- |
   | `RESEND_API_KEY` | **Secret** | klucz z punktu 2 |
   | `MAIL_DO` | Text | adres, na który mają przychodzić zgłoszenia |
   | `MAIL_OD` | Text | `formularz@skilful.pl` |

   `RESEND_API_KEY` musi być typu **Secret**, nie Text — inaczej klucz będzie
   widoczny w panelu dla każdego, kto ma do niego dostęp.

4. Kliknijcie **Retry deployment**, żeby funkcja zobaczyła nowe zmienne.
5. Wyślijcie **jedno prawdziwe zgłoszenie** przez formularz na stronie
   i sprawdźcie, czy doszło. To jedyny wiarygodny test.

Zgłoszenia nigdzie się nie zapisują — lecą na skrzynkę i tyle. To świadomy
wybór: mniej danych osobowych w spoczynku znaczy mniej do opisania w rejestrze
czynności przetwarzania i mniej do stracenia.

---

## 4. Wyłączenie starego adresu GitHub Pages

Kiedy `skilful.pl` zacznie działać, w repozytorium **SkillsSP/SAver.1**:
**Settings** → **Pages** → **Source** → **None**.

Workflow publikujący na Pages został już usunięty z repozytorium. Na jego
miejscu jest `.github/workflows/budowanie.yml`, który tylko sprawdza, czy
projekt się buduje, i niczego nie publikuje.

---

## 5. Zgłoszenie mapy serwisu

Po uruchomieniu domeny dodajcie serwis w **Google Search Console** i zgłoście
mapę pod adresem:

```
https://skilful.pl/sitemap.xml
```

Mapa zawiera 13 adresów. Trzy dokumenty formalne (regulamin, polityka
prywatności, klauzula RODO) są z niej świadomie wyłączone, żeby nie
konkurowały w wynikach ze stronami oferty.

---

## Dlaczego mail, a nie baza D1

D1 przydałby się wtedy, gdyby zgłoszenia miały być zapisywane i przeglądane
w panelu. Przy tej skali to koszt bez pokrycia:

- zgłoszenia zawierają **imię i wiek dziecka**, czyli dane osobowe małoletnich;
- Cloudflare staje się wtedy **podmiotem przetwarzającym** i potrzebna jest
  umowa powierzenia przetwarzania danych;
- w polityce prywatności i klauzuli RODO trzeba dopisać, gdzie dane leżą, jak
  długo i kto ma do nich dostęp;
- ktoś musi te zgłoszenia regularnie odczytywać — baza bez panelu do
  przeglądania jest mniej użyteczna niż e-mail, który sam przychodzi.

Przy kilkunastu–kilkudziesięciu zgłoszeniach miesięcznie formularz wysyłający
e-mail załatwia sprawę bez żadnego z tych obowiązków. D1 zaczyna się opłacać
dopiero przy potrzebie historii zgłoszeń, statusów („oddzwoniono”, „zapisany”)
albo raportów.
