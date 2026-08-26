# Kontakt, pasek użytkowy i grafitowy Exams

**Data:** 26 sierpnia 2026
**Dotyczy:** nowa podstrona `/kontakt`, pasek użytkowy nad nawigacją, sekcja
„trzy kroki" na stronie głównej, grafitowy nagłówek matury, matura z historii,
rozdzielenie Exams na dwie podstrony
**Wymaga:** wcześniejszego wdrożenia paczki `01-zdjecia` (nagłówki ze zdjęciem)

---

## Skąd te zmiany

Trzy z nich to rekomendacja z porównania z układem Oponly.pl: wzięliśmy
z niego trzy najmocniejsze elementy zamiast całego układu sprzedażowego.
Czwarta to domknięcie luki — **kontakt nie miał własnej podstrony**, mimo że
był w pasku nawigacji. Pozycja prowadziła do zakotwiczenia w stopce, a wszystkie
przyciski kontaktowe na formularz zapisu.

---

## 1. Podstrona `/kontakt` — najważniejsza z czterech

### Dlaczego nie wystarczały Zapisy

Zapisy obsługują **jedną intencję**: „chcę umówić zajęcia próbne". Kontakt
musi obsłużyć cztery pozostałe:

1. pytanie o zajęcia, termin albo cenę,
2. prośbę o rozmowę **bez zapisu**,
3. sprawę formalną — faktura, rezygnacja, dane,
4. **zgłoszenie ze standardów ochrony małoletnich.**

Czwarta ścieżka jest wymagana ustawowo i nie może kończyć się formularzem
zapisowym. Musi też omijać osoby prowadzące zajęcia — dlatego ma osobną kartę
z danymi osoby odpowiedzialnej, jej telefonem i e-mailem.

### Struktura strony

    1. Nagłówek ze zdjęciem            (motion-3, kadr center 45%)
    2. Trzy karty dróg kontaktu       telefon · e-mail · formularz
                                      (siatka jednorzędowa, minimum kolumny 300 px)
    3. Formularz + dwie karty obok    wybór tematu, potem pola
    4. Gdzie jesteśmy                 jedno zdanie — patrz „Brak lokalu" niżej
    5. Dane firmy                     nazwa · NIP · REGON · administrator

### Brak lokalu — co jest ukryte

Do podpisania umowy na lokal wszystko, co go dotyczy, jest **zdjęte ze strony**,
a nie wstawione jako pusty nawias. Pusty nawias w miejscu adresu wygląda jak
błąd wdrożenia; brak sekcji nie wygląda na nic.

Ukryte: czwarta karta „Osobiście — przyjdźcie do biura", cała sekcja z adresem,
godzinami, dojazdem, parkingiem i mapą, godziny biura w nagłówku, adres
w stopce i na zapisach, adres w kafelku „Gdzie" na stronie głównej.

W miejscu sekcji dojazdu stoi jedna karta: *„Zajęcia prowadzimy stacjonarnie
w Szczecinie. Adres, godziny i dojazd podamy razem z uruchomieniem zapisów…"*.
Miasto i tryb zajęć zostają — to nie jest informacja o lokalu.

**Po podpisaniu umowy** wraca: czwarta karta (siatka wraca na minimum 420 px,
bo cztery karty muszą stać 2×2), sekcja adresu z trzema kartami i notką o mapie,
godziny w nagłówku, adres w stopce i na zapisach. Zakotwiczenie `#dojazd`
działa już teraz i prowadzi do tej jednej karty — nie trzeba go zmieniać.

**Etykiety do przywrócenia razem z adresem:** odnośnik w pasku użytkowym
i w stopce brzmi teraz „Kontakt", nie „Kontakt i dojazd" — nie obiecujemy
dojazdu, dopóki go nie ma. Po podpisaniu umowy oba wracają do dłuższej wersji.

### Formularz — jedna rzecz do zaprogramowania

Pole „W jakiej sprawie" (`<select name="temat">`) zmienia **dwie rzeczy**:
podpowiedź pod polem i przykład (`placeholder`) w polu treści. Mapowanie:

| Temat | Podpowiedź | Przykład w polu treści |
|---|---|---|
| Pytanie o zajęcia, termin albo cenę | Odpowiadamy konkretnie — jeśli czegoś jeszcze nie wiemy, mówimy wprost, kiedy będzie wiadomo. | np. Córka ma 9 lat, szukamy zajęć w środy po 16:00. |
| Prośba o rozmowę — bez zapisu | Oddzwonimy w dogodnej porze. Nie namawiamy na zapis w trakcie tej rozmowy. | np. Proszę o telefon po 17:00, chcę najpierw dopytać o metodę. |
| Sprawa formalna: faktura, rezygnacja, dane | Sprawy formalne prowadzi biuro, nie osoba prowadząca zajęcia. | np. Proszę o fakturę za wrzesień na dane firmy. |
| Zgłoszenie ze standardów ochrony małoletnich | Ta ścieżka omija osoby prowadzące zajęcia. Dane osoby odpowiedzialnej są w karcie obok — możecie napisać wprost do niej. | Opiszcie sytuację własnymi słowami — data i miejsce pomagają, ale nie są warunkiem. |

Telefon i e-mail są oba opcjonalne, ale **przynajmniej jedno musi być
wypełnione** — walidacja po stronie serwera, komunikat „Wystarczy jedno z dwóch".

Zgłoszenie ze standardów ochrony małoletnich powinno trafiać na **inny adres**
niż pozostałe trzy tematy — do osoby odpowiedzialnej, nie do biura.

### Zabezpieczenie przed botami — bez CAPTCHY

Oba formularze (kontakt i zapisy) mają trzystopniową ochronę. Żadnego
przepisywania znaków z obrazka — CAPTCHA odbija rodziców na telefonie i jest
barierą dostępności dla osób z dysleksją i słabym wzrokiem.

**1. Pole-pułapka (honeypot).** Ukryte pole `firma_www`, wyprowadzone poza
ekran, z `tabindex="-1"`, `aria-hidden` i `autocomplete="off"`. Człowiek go nie
widzi i nie dojdzie do niego tabulatorem; automat wypełnia wszystkie pola.
Wypełnione pole = zgłoszenie odrzucone. **Ważne:** nie ukrywajcie go przez
`display:none` ani `visibility:hidden` — nowsze boty to wykrywają i pomijają.
Nie nazywajcie go też `honeypot` czy `bot` — nazwa musi wyglądać wiarygodnie.

**2. Pułapka czasowa.** Znacznik czasu otwarcia formularza. Wysłanie poniżej
trzech sekund od wczytania nie jest ręcznym wypełnieniem. Nie odrzucamy wtedy
zgłoszenia — pokazujemy jedno pytanie kontrolne (punkt 3), bo może to być
wypełnienie z autouzupełniania przeglądarki.

**3. Pytanie kontrolne, tylko warunkowo.** Proste dodawanie dwóch liczb 2–7,
losowane przy każdym wczytaniu strony. Pojawia się wyłącznie wtedy, gdy zadziała
pułapka czasowa — normalny użytkownik nigdy go nie zobaczy.

**Cztery rzeczy do dopisania po stronie serwera — obowiązkowo, nie opcjonalnie.**
Makieta sprawdza wszystko w przeglądarce, a honeypot jest polem kontrolowanym
przez React: bot, który ustawi `input.value` wprost w DOM, nie zaktualizuje stanu
i **nie zostanie złapany po stronie klienta**. Dopiero kontrola serwerowa
zatrzymuje cokolwiek realnie:

1. Powtórzyć obie pułapki serwerowo. Bot może wysłać żądanie wprost do
   endpointu, omijając cały JavaScript.
2. Limit zgłoszeń na adres IP — np. 3 na godzinę, 10 na dobę.
3. Znacznik czasu podpisany po stronie serwera (HMAC), nie przekazywany
   w ukrytym polu jako czysta liczba — inaczej bot go po prostu podmieni.
4. Filtr treści na linki: wiadomość z trzema i więcej adresami URL to prawie
   zawsze spam. Do kolejki ręcznej, nie do kosza.

Jeśli spam mimo tego przejdzie, dokładamy **Cloudflare Turnstile** — działa
bez klikania w obrazki i nie wysyła danych do Google. Dopiero to, nie reCAPTCHA.

### Mapa

Osadzona mapa ładuje pliki firmy trzeciej, więc może się pojawić **dopiero po
zgodzie** w banerze cookies. Wraca razem z adresem, po podpisaniu umowy na lokal.

### Wpięcie w nawigację — trzy miejsca

    pasek nawigacji     Kontakt  →  /kontakt   (było: /#kontakt)
    menu mobilne        Kontakt  →  /kontakt   (było: /#kontakt)
    stopka, kolumna     Kontakt  →  /kontakt   (nowa pozycja w „O centrum")
    stopka, adres       „Kontakt" pod danymi kontaktowymi
    pasek użytkowy      „Kontakt"

`id="kontakt"` na `<footer>` **zostaje** — stare odnośniki z materiałów
drukowanych i wiadomości nadal muszą działać.

---

## 2. Pasek użytkowy nad nawigacją

Jeden pasek na wszystkich podstronach: hasło z lewej, kontakt i telefon
z prawej. Przewija się razem ze stroną, a nawigacja pod nim zostaje przyklejona.

    <div class="pasek-uzytkowy">
      <div class="pasek-uzytkowy__tresc">
        <div class="pasek-uzytkowy__haslo">Centrum kompetencji przyszłości · Szczecin</div>
        <div class="pasek-uzytkowy__kontakt">
          <a href="/kontakt">Kontakt i dojazd</a>
          <a href="tel:+48508069007" class="pasek-uzytkowy__telefon">508 069 007</a>
        </div>
      </div>
    </div>
    <header class="naglowek"> ... bez zmian ... </header>

**Kolejność jest istotna.** Pasek musi być rodzeństwem `<header>`, umieszczonym
przed nim — nie jego dzieckiem. Włożony do środka przykleiłby się razem
z nawigacją i zabrał 38 px wysokości na każdym ekranie.

Na telefonie pasek zawija się na dwa wiersze — to jest zamierzone, nic nie
znika. Nie wprowadzajcie tu skracania numeru do „ZADZWOŃ": marka nie używa
wersalików w treści.

---

## 3. Sekcja „trzy kroki" — strona główna

Wchodzi **przed** blokiem zapisów, po pasku kafli tematycznych. Trzy białe
karty: numer kobaltowy 34 px, tytuł, jedno zdanie.

    01  Rozmowa i dobór grupy
    02  Zajęcia próbne
    03  Zapis i karnet

Odpowiada na pytanie „co się stanie, jak zadzwonię", którego strona wcześniej
nie obsługiwała wprost. Siatka: minimum kolumny 240 px, żeby na laptopie
utrzymał się rząd trzech.

Treść kart jest w pliku `trzy-kroki.html` obok.

---

## 4. Grafitowy nagłówek matury

Decyzja wdrożona: **kobalt na całej ofercie, grafit tylko na maturze.** Ścieżka
maturalna mówi do rodzica nastolatka i do samego maturzysty — poważniejszy ton
pracuje tam na wiarygodność.

    <section class="naglowek-strony naglowek-strony--foto naglowek-strony--senior">

Reguła CSS jest już w dopisku z paczki `01-zdjecia`
(`.naglowek-strony--senior.naglowek-strony--foto` — jedna warstwa grafitu 74%,
bez kobaltu). Tutaj dochodzi tylko kolor tła samego bloku.

**Uwaga:** grafit należy do matury, nie do całego Exams. Strona rozdzielająca
i egzamin ósmoklasisty zostają kobaltowe — patrz punkt 6.

---

## Do sprawdzenia po wdrożeniu

1. **Zakotwiczenia `#formularz` i `#dojazd`** — muszą zejść pod przyklejoną
   nawigację, `scroll-margin-top: 88px`. Sprawdźcie przy realnej wysokości
   paska, bo zmieni się po wgraniu logo.
2. **Pasek nie przykleja się razem z nawigacją** — najczęstszy błąd przy tym
   układzie. Przewińcie stronę i sprawdźcie, czy pasek znika.
3. **Kontrast telefonu w pasku** — grafit na kremowym daje 13,2:1, w porządku.
   Nie zamieniajcie go na koral: koral na kremowym to 3,1:1, poniżej progu.
4. **Trasa zgłoszenia ze standardów** — musi iść na inny adres niż pozostałe
   trzy tematy formularza. To nie jest kosmetyka, to wymóg ustawowy.
5. **Dane firmy w czterech miejscach** — kontakt, regulamin, polityka
   prywatności, klauzula RODO. Jedno brzmienie, nie cztery warianty.
6. **Zabezpieczenie przed botami powtórzone serwerowo** — makieta sprawdza
   honeypot i czas w przeglądarce. Bez kontroli po stronie serwera bot ominie
   to jednym żądaniem wprost do endpointu.

---

## Czego wciąż brakuje

Wszystkie pozostałe dane są w makiecie jako `[nawias]`: NIP, REGON
i administrator danych oraz **imię, nazwisko i funkcja osoby odpowiedzialnej za
standardy ochrony małoletnich**.

Ustalone i wpisane na stronie: **508 069 007** i **kontakt@skilful.pl**.

Bez ostatniej pozycji podstrona kontaktu nie może iść na produkcję — ustawa
wymaga wskazania konkretnej osoby, nie adresu ogólnego.

Dane lokalu — adres, godziny, dojazd, parking, mapa — nie są brakiem do
wypełnienia, a świadomie ukrytą sekcją. Patrz „Brak lokalu" w punkcie 1.

Adres e-mail jest ustalony: **kontakt@skilful.pl**, na domenie **skilful.pl** —
tej samej, która idzie na ulotkę i do materiałów drukowanych. Nie zamieniajcie
jej na wariant z nazwą marki.

---

## 5. Matura z historii — dodane do Exams

Czwarta pozycja w sekcji Matura, obok angielskiego (podstawowy i rozszerzony)
oraz matematyki podstawowej. Historia jest **tylko rozszerzona** — to przedmiot
dodatkowy, nie ma poziomu podstawowego.

    <h3>Historia — rozszerzona</h3>  + plakietka „Nowość"

Treść karty: praca na źródłach i zadaniach z arkuszy CKE, osobny blok ćwiczeń
na wypracowanie historyczne, forma i częstotliwość do uzupełnienia.

**Argument sprzedażowy jest inny niż przy matematyce** — i to musi zostać
w copy. Matematyka jest obowiązkowa, więc mówimy o **przekroczeniu progu**.
Historia jest wyborem, więc mówimy o **punktach na konkretny kierunek** (prawo,
historia, stosunki międzynarodowe, kierunki humanistyczne). Zdanie
„przygotowujemy też do matematyki i historii" gubi sens drugiego przedmiotu.
Pełne uzasadnienie: wytyczne marki v3.3, sekcja 1, „Uwaga o historii".

**Siatka:** sekcja Matura ma teraz cztery karty, więc minimum kolumny podnieście
do 420 px — inaczej wychodzi trzy w rzędzie i jedna sierotka.

Do nawigacji dochodzi pozycja w panelu Exams, kolumna Matura:
`Historia — rozszerzony` z plakietką „Nowość".

**Kolor plakietek na Exams to grafit `#5B6B7A`, nie koral.** Design system
rezerwuje grafit właśnie na oznaczenia Teens Senior, a koral na tych podstronach
zostaje wyłącznie na jednym przycisku akcji. Dotyczy trzech plakietek („Unikat"
przy matematyce ósmoklasisty i maturalnej, „Nowość" przy historii) oraz numerów
kroków 01–04 w sekcji „Jak pracujemy" na maturze. Koral na bieli daje 3,29:1 —
poniżej progu WCAG AA, ten sam powód, dla którego w wersji 1.2 identyfikacji
zmieniono biel na koralu na grafit. Na stronie rozdzielającej i przy egzaminie
ósmoklasisty numery kroków są kobaltowe.

Brakuje jeszcze **imienia, nazwiska i wykształcenia prowadzącego historię** —
ta sama luka co przy matematyce.

---

## 6. Exams rozdzielone na dwie podstrony

Było: jedna długa strona `/exams` z sekcjami `#e8` i `#matura`.
Jest: strona rozdzielająca `/exams` + dwie samodzielne podstrony.

    /exams                      dwie karty ścieżek, wspólny schemat pracy, CTA
    /exams/egzamin-osmoklasisty  angielski i matematyka
    /exams/matura                angielski ×2, matematyka, historia

**Paleta się zmienia razem z podziałem.** Grafit obowiązuje teraz wyłącznie
na maturze (`--senior`). Strona rozdzielająca i egzamin ósmoklasisty są
kobaltowe — ósmoklasista to Teens Junior (13–15 lat), a grafit jest w systemie
zarezerwowany dla Teens Senior. Wcześniej grafit obejmował cały Exams, co było
niezgodne z tą regułą.

**Odnośniki do przekierowania** — stare kotwice `#e8` i `#matura` znikają:

    pasek nawigacji, panel Exams   nagłówki kolumn i wszystkie przedmioty
    menu mobilne                   dwie pozycje wcięte pod „Exams"
    stopka, kolumna Oferta         dwie pozycje wcięte pod „Exams"
    cennik                         dwa wiersze Exams
    zajęcia indywidualne          dwa odnośniki w liście zakresów

Zachowajcie przekierowania serwera z `/exams#e8` i `/exams#matura` na nowe
adresy — te kotwice mogły trafić do materiałów i wiadomości.

**Powielenie treści jest zamierzone:** sekcja „Jak pracujemy" stoi na wszystkich
trzech stronach, bo każda musi być samodzielna — rodzic wchodzi z wyszukiwarki
wprost na maturę, nie przez stronę rozdzielającą. Różni się tylko krok 04:
przy ósmoklasiście raport idzie do rodzica, przy pełnoletnim maturzyście do niego.
