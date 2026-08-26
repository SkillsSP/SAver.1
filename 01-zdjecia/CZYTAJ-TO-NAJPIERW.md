# Zdjęcia na stronie produkcyjnej `web/`

**Data:** 26 sierpnia 2026
**Dotyczy:** zdjęcia w tle nagłówków wszystkich podstron + kafle tematyczne
**Materiał źródłowy:** folder `zdjęcia/` (7 podfolderów, 60 plików)

---

## Co jest w tej paczce

    foto/                     52 pliki JPEG (26 kadrów × 2 rozmiary)
    naglowek-zdjecia.css      dopisek do arkusza stylów
    CZYTAJ-TO-NAJPIERW.md     ten plik

Folder `foto/` zawiera **26 kadrów z 60** plików źródłowych. Reszta odpadła — powody
niżej, w sekcji „Czego nie wziąłem". Każdy kadr ma dwie wersje: `-800.jpg`
(kafle, karty) i `-1600.jpg` (tła nagłówków). Oryginały miały 4000–8000 px
i po kilka MB — na stronę nie idą.

**Wszystkie 26 kadrów pracuje na stronie w 37 miejscach.** Zapasu na rotację
nie ma — sesja zdjęciowa została odwołana, a dwa ostatnie nieużyte kadry
weszły do treści.

---

## Co robisz

### 1. Wgraj zdjęcia

    web/public/SAver.1/foto/

Cały folder `foto/` z tej paczki, obok katalogu `fonts/`. Jeśli wolicie inną
ścieżkę — zmieńcie ją konsekwentnie w `src` wszystkich `<img>` z tabeli niżej.

### 2. Dopisz CSS

Zawartość `naglowek-zdjecia.css` **na koniec** `web/src/styles/style.css`.
Nic w istniejącym arkuszu nie wymaga zmiany — dopisek dodaje tylko nowe
klasy i nadpisania w ich obrębie.

### 3. Dodaj `<img>` i klasę do każdego nagłówka

Nagłówki podstron (`.naglowek-strony`) — pierwszym dzieckiem sekcji:

    <section class="naglowek-strony naglowek-strony--foto"
             style="--foto-kadr: center 50%">
      <img class="naglowek-strony__foto"
           src="/SAver.1/foto/life-robotyka-1600.jpg"
           alt="" aria-hidden="true"
           loading="eager" fetchpriority="high" decoding="async">
      <div class="naglowek-strony__tresc">
        ... bez zmian ...
      </div>
    </section>

Baner strony głównej (`.hero`) — identycznie, klasa `hero--foto`
i `<img class="hero__foto">`.

Strony formalne dostają dodatkowo `naglowek-strony--cichy`.

**`alt` jest puste celowo.** Zdjęcie jest dekoracją tła — treść nagłówka
niesie tekst obok. Czytnik ekranu ma je pominąć, nie odczytywać.

### 4. Przypisz kadry

| Podstrona | Plik (1600) | `--foto-kadr` | Klasy |
|---|---|---|---|
| Strona główna | `motion-2` | `center 42%` | `hero--foto` |
| Zajęcia podstawowe | `life-robotyka` | `center 50%` | `naglowek-strony--foto` |
| Fakultety | `life-przyjaciele` | `center 40%` | `naglowek-strony--foto` |
| Zajęcia indywidualne | `cooking-3` | `center 45%` | `naglowek-strony--foto` |
| Exams | `exam-1` | `center 55%` | `naglowek-strony--foto` |
| Zapisy | `life-grupa` | `center 45%` | `naglowek-strony--foto` |
| Cennik | `motion-5` | `center 40%` | `naglowek-strony--foto` |
| Bezpieczeństwo | `life-bezpieczenstwo` | `center 40%` | `naglowek-strony--foto` |
| Regulamin | `art-2` | `center 40%` | `+ --cichy` |
| Polityka prywatności | `art-2` | `center 40%` | `+ --cichy` |
| Klauzula RODO | `art-2` | `center 40%` | `+ --cichy` |

### 5. Kafle tematyczne — strona główna

Osiem kafli w siatce nad sekcją zapisów, wysokość 200 px, wersje `-800`,
`loading="lazy"`. Kolejność i podpisy:

| Plik | Podpis |
|---|---|
| `life-dron` | Elektronika i robotyka |
| `acting-2` | Scena i wystąpienia |
| `cooking-1` | Kuchnia i praca w drużynie |
| `motion-1` | Ruch i drużyna |
| `music-3` | Muzyka i głos |
| `art-2` | Rysunek i praca ręczna |
| `life-grupa` | Rozmowa w małej grupie |
| `life-warsztat` | Narzędzia i własny przedmiot |

Kafel = biała karta, kreska włoskowa `var(--linia)`, promień 14 px, podpis
**pod** kadrem (13 px, `var(--tekst-drugi)`) — nigdy na zdjęciu.

### 6. Kafle Life Skills — zajęcia podstawowe

Sekcja „Life Skills w praktyce", sześć kart, zdjęcie 190 px + tytuł + jedno
zdanie:

| Plik | Tytuł | Zdanie |
|---|---|---|
| `life-pierwsza-pomoc` | Pierwsza pomoc | Ćwiczenie na fantomie, schemat postępowania, numer alarmowy. |
| `life-bezpieczenstwo` | Bezpieczeństwo w mieście | Droga do domu, obcy dorosły, ruch drogowy. |
| `life-warsztat` | Praca ręczna | Narzędzia, miara, dokończony przedmiot na koniec misji. |
| `cooking-2` | Kuchnia i samodzielność | Przepis po angielsku, podział zadań, posiłek do zjedzenia razem. |
| `life-wolontariat` | Empatia i pomaganie | Zbiórka, rozmowa o potrzebach innych, konkretne działanie. |
| `life-globus` | Świat i źródła | Skąd wiem, że to prawda — fakt, opinia, źródło. |

### 7. Karty fakultetów

Cztery karty, zdjęcie `clamp(200px, 17vw, 250px)`, wersje `-800`:
`music-2` (Music), `art-1` (Art), `acting-1` (Acting), `motion-4` (Motion Skills).

**Siatka musi być parzysta.** Trzy kafle w górnym rzędzie i jeden sierotka
w dolnym to najgorszy możliwy układ dla czterech elementów. Minimum kolumny
podnieście tak, żeby trzecia się nie zmieściła:

    grid-template-columns: repeat(auto-fit, minmax(min(100%, 480px), 1fr));

Przy kontenerze 1200 px daje to zawsze 2×2 na desktopie i jedną pełną kolumnę
na telefonie. Nie ograniczajcie tego przez `calc(50% - gap)` jako maksimum
kolumny — przy jednej kolumnie maksimum wypada poniżej minimum i karta
zostaje przypięta do stałej szerokości z pustą przestrzenią obok.

### 8. Karta przy formularzu zapisów

`motion-3-800.jpg`, wysokość 220 px. Podpis mówi o **spotkaniu próbnym**,
nie o miejscu — to nie jest zdjęcie Waszej sali.

### 9. Dwa kadry dodane w drugiej turze

`music-1-800.jpg` na zajęciach indywidualnych — w bloku dwudzielnym obok notki
o warunkach sali, wysokość `clamp(200px, 20vw, 260px)`.

`life-strazak-800.jpg` na stronie bezpieczeństwa — nad sekcją dokumentów,
wysokość `clamp(180px, 20vw, 250px)`, z podpisem o tym, że bezpieczeństwo jest
u nas także tematem zajęć. To domyka lukę: strona z samymi procedurami
wyglądała jak dokument prawny, nie jak część programu.

---

## Podpisy — reguła, nie ozdoba

To zdjęcia stockowe. **Żaden podpis nie może twierdzić, że to nasze zajęcia.**
Podpis nazywa obszar kompetencji, a pod każdą galerią stoi jedno zdanie:

> Zdjęcia ilustracyjne — po starcie zastępujemy je materiałem z własnych zajęć.

Jeśli ten dopisek zniknie, zostaje sugestia, że zdjęcia są Wasze. To jest
ryzyko wizerunkowe, nie drobiazg redakcyjny.

---

## Zdjęcia własne — sesja odwołana na tym etapie

Decyzja: rezygnujemy z sesji zdjęciowej. Trzy kadry, które miały jej wymagać,
zastąpił materiał z folderu. **Nigdzie nie zostało puste pole ani zapowiedź
„wkrótce"** — obietnica bez terminu starzeje się na stronie szybciej niż samo
zdjęcie.

1. **Portrety prowadzących** — kółka na portrety usunięte z zajęć podstawowych
   i z Exams, zostały same opisy tekstowe. To jedyne miejsce, gdzie zdjęcie
   z folderu nie zastępuje własnego: stockowej twarzy pod nazwiskiem
   prowadzącej nie wstawiamy w żadnym scenariuszu.
2. **Sala centrum** — na zapisach kadr z zajęć, na zajęciach 1:1 zdjęcie
   z gitarą obok notki o warunkach sali. Adres i dojście są ukryte do podpisania
   umowy na lokal, co jest osobną decyzją — nie brakiem zdjęcia.
3. **Pokaz na koniec semestru** — karty fakultetów mają kadry z działania i to
   zostaje. Podpis nie zapowiada już podmiany.

**Zapas wyczerpany.** Wszystkie 26 przygotowanych kadrów pracuje na stronie
w 37 miejscach. Dwa ostatnie nieużyte weszy w tej turze: gitara (`music-1`)
na zajęciach indywidualnych i stroje strażackie (`life-strazak`) przy
dokumentach w standardach ochrony małoletnich. Pierwsza podmiana sezonowa albo
pierwsza ilustracja do aktualności będzie wymagać nowego materiału.

---

## Czego nie wziąłem — 34 pliki

- **Halloween (6 zdjęć)** — kostiumy, dynie, malowanie twarzy. Kadr sezonowy
  zestarzeje się na stronie w listopadzie, a Halloween nie jest w programie.
- **Pisanki i kartki wielkanocne** — ten sam problem, jeden tydzień w roku.
- **Ściąganie na sprawdzianie** — plik „kid cheating school test". Na stronie
  ścieżki egzaminacyjnej działałby przeciwnie do obietnicy wyniku.
- **Wszawica i mycie zębów** — higiena osobista w bliskim kadrze wygląda na
  gabinet, nie na centrum kompetencji. Nie ma tego też w programie.
- **Terapia logopedyczna (2)** — rejestr terapeutyczny. Marka mówi
  o kompetencjach, nie o korygowaniu deficytów.
- **Transparenty protestacyjne** — kontekst polityczny.
- **Pierniki, przyjęcie urodzinowe, park we Lwowie** — świąteczne albo
  rozpoznawalnie nie z Polski. Dwa duplikaty kadru z chustą też wypadły.
- **Dziadek i tata przy warsztacie** — dobre zdjęcia, ale o rodzinie w domu,
  nie o zajęciach w grupie.

---

## Wariant grafitowy — decyzja otwarta

Dopisek CSS zawiera regułę dla `.naglowek-strony--senior.naglowek-strony--foto`:
jedna warstwa grafitu 74%, bez kobaltu. Produkcja ma już `--senior` na płaskim
graficie, więc to jest domknięcie tego, co istnieje.

**Rekomendacja:** kobalt na całej ofercie, grafit tylko na Exams. Ścieżka
egzaminacyjna mówi do rodzica nastolatka i do nastolatka — poważniejszy ton
pracuje tam na wiarygodność. Reszta serwisu zostaje kobaltowa, bo to jedyne
miejsce, gdzie kolor marki dostaje realną powierzchnię.

Jeśli wolicie jednolitość — wybierzcie jedno i przestawię wszystkie podstrony.
Porównanie obu wariantów na żywo: `Nagłówek - kobalt vs grafit.dc.html`.

---

## Dokumentacja marki — zaktualizowana razem z tą paczką

Fotografia nie miała dotąd żadnej reguły w marce: identyfikacja opisywała
płaskie wypełnienia i zakaz gradientów, co czytano jako zakaz zdjęć. To było
niedopowiedzenie, nie decyzja — i zostało domknięte:

| Dokument | Było | Jest | Co doszło |
|---|---|---|---|
| `wytyczne-marki-kids-skills-academy.md` | v3.1 | **v3.2** | nowa sekcja **5.5 Fotografia** — warstwy krycia, co pokazujemy i czego nie, reguła uczciwości przy zdjęciach stockowych, wizerunek dziecka, parametry techniczne |
| `skills-academy-identyfikacja-final.html` | v1.2 | **v1.3** | nowa sekcja **05 · Fotografia** z tabelą krycia dla czterech zastosowań |
| `skills-academy-brief-graficzny.html` | v2.1 | **v2.2** | nowa sekcja **05 / FOTOGRAFIA** — zakres sesji zdjęciowej na miejscu, warunki kadru i obróbki |
| `PRZECZYTAJ - stan plikow.txt` | 12 sierpnia | **26 sierpnia** | nowe wersje, ta paczka w sekcji dla programisty, sesja zdjęciowa i wybór koloru nagłówków w pozycjach otwartych |
| „Struktura serwisu" | — | — | pozycja „Opinie i zdjęcia z zajęć" rozdzielona na materiał ilustracyjny i trzy kadry własne |

Sekcja 5.4 wytycznych („Marka jest wizualnie płaska i statyczna") dostała
odsyłacz do 5.5, żeby zakaz gradientów nie był ponownie czytany jako zakaz
fotografii.

**Zasada, którą trzeba znać przed dotknięciem kodu:** zdjęcie nigdy nie leży
samo pod tekstem i nigdy nie dostaje gradientu. Wchodzi pod płaskie warstwy
krycia — i to jest jedyny sposób, w jaki fotografia mieści się w tej
identyfikacji.

---

## Do sprawdzenia po podmianie

1. **Kontrast tekstu na każdym nagłówku.** Receptura jest policzona, ale przy
   podmianie kadru na jaśniejszy warto zmierzyć ponownie — tekst zawsze
   w pełnej bieli, nigdy `--tekst-na-marce-miekki`.
2. **Linki w nagłówkach.** Domyślny kobaltowy link na kobaltowym tle jest
   niewidoczny (kontrast 1:1). Dopisek CSS to łapie regułą
   `.naglowek-strony--foto a:not(.przycisk)`, ale sprawdźcie komponenty Astro,
   które mogą mieć własny kolor inline.
3. **Polskie znaki w podpisach** — ą ć ę ł ń ó ś ź ż.
4. **Waga plików.** 52 pliki JPEG, po dwa na kadr. Baner ładuje się
   z `fetchpriority="high"`, wszystko poniżej z `loading="lazy"` — bez tego
   pierwsze wejście na stronę ciągnie kilkanaście zdjęć naraz.
