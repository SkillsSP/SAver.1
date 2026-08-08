SKILLS ACADEMY — PAKIET ZNAKU
Wariant finalny: dwa koi tworzące literę „S". Górne koi grafitowe, dolne koralowe.
Wersja pakietu 1.1.

Zmiany względem wersji 1.0:
  — skorygowany opis roli koloru Slate (sekcja KOLORY),
  — dodana sekcja MASTER PRODUKCYJNY z decyzją o formatach,
  — dodana sekcja TYPOGRAFIA z ostrzeżeniem o kroju Fredoka One.

──────────────────────────────────────────────
1. LOGO PEŁNE (poziome, sygnet w miejscu pierwszej litery)

skills-academy-logo.svg              podstawowe, na jasnym tle (Cloud Dancer / biel)
skills-academy-logo-rewers.svg       na kobalcie i grafitcie — górne koi Cloud Dancer
skills-academy-logo-mono-grafit.svg  druk jednokolorowy, oczy wybrane na biel podłoża
skills-academy-logo-mono-bialy.svg   kontra, bez oczu (czysta sylweta)

2. LOGO PIONOWE

skills-academy-logo-pionowy.svg      sygnet nad nazwą, wyrównanie do środka.
                                     Stosować, gdy szerokość jest ograniczona (roll-up, stopka, awatar z nazwą).
                                     Uwaga: w wariancie pionowym wordmark zawiera pełne słowo „Skills",
                                     ponieważ sygnet nie stoi w linii tekstu i nie zastępuje litery.

3. SYGNET (bez nazwy)

skills-academy-sygnet.svg            podstawowy, z oczami — od 32 px
skills-academy-sygnet-rewers.svg     na ciemnym tle
skills-academy-sygnet-mono.svg       druk jednokolorowy
skills-academy-sygnet-1024.png       raster przezroczysty 1024 px

4. FAVICON I IKONY

skills-academy-favicon.svg           sygnet bez oczu — podstawowy favicon wektorowy
skills-academy-favicon.ico           16 + 32 + 48 px w jednym pliku
skills-academy-favicon-16/32/48.png  bez oczu (czytelność w małej skali)
skills-academy-favicon-180.png       Apple Touch Icon — z oczami
skills-academy-favicon-192/512.png   manifest PWA / sklepy — z oczami

5. AWATARY (media, GBP, Instagram, Facebook)

skills-academy-avatar-kwadrat.png         512 px, tło Cloud Dancer
skills-academy-avatar-kolo.png            512 px, kadr kołowy, tło Cloud Dancer
skills-academy-avatar-kwadrat-kobalt.png  512 px, tło kobaltowe, znak w rewersie

──────────────────────────────────────────────
KOLORY

Grafit (górne koi, tekst)   #1A2230   CMYK 80/70/50/70   Pantone 532 C*
Koral (dolne koi, iskra)    #E8654A   CMYK  0/72/70/0    Pantone 7416 C*
Kobalt (tła marki)          #1E5FCC   CMYK 85/62/0/0     Pantone 2145 C*
Cloud Dancer (baza, oczy)   #FBF8F3   CMYK  2/3/5/0
Slate                       #5B6B7A   CMYK 65/50/40/15

* Wartości CMYK i Pantone są punktem wyjścia. Przed pierwszym drukiem
  wymagany proof i wizualne dopasowanie w profilu docelowym.

ROLA KOLORU SLATE — SKORYGOWANY ZAPIS

Slate pełni dwie funkcje i wcześniejszy opis („tylko Teens Senior") był nieścisły:

  1. W ZNAKU — wordmark „ACADEMY" w logo poziomym i pionowym.
     Jest to element nierozdzielny marki. Umieszczenie logo nie liczy się
     jako użycie koloru Slate.

  2. W MATERIAŁACH — wyłącznie oznaczenie oferty Teens Senior
     (przygotowanie do matury).

Rozgraniczenie kontekstu sprawia, że obie funkcje nie kolidują: obecność Slate
w logo jest ambientowa i nie osłabia jego roli jako etykiety kategorii.
Poza logo Slate nie występuje w żadnej innej roli.

Kobalt nie występuje w sylwetach znaku. Jest kolorem tła marki i pojawia się
wyłącznie jako podłoże wersji rewersowej.

──────────────────────────────────────────────
TYPOGRAFIA

Lexend    wordmark w znaku oraz cały tekst w materiałach
          wagi 400 / 500 / 600 / 700
          w znaku: „kills" w wadze 550, „ACADEMY" w wadze 500, odstęp liter 4,4

Fredoka   wyłącznie nagłówki dla Kids i Teens Junior
          wagi 500 / 600
          nie występuje w materiałach Teens Senior

Oba kroje na licencji SIL Open Font License, bez kosztów licencyjnych.

OBSŁUGA POLSKICH ZNAKÓW

Znaki ą, ć, ę, ł, ń, ś, ź, ż należą do bloku Latin Extended-A. Jedynie „ó"
mieści się w bloku Latin-1. Oba kroje zawierają podzbiór latin-ext, który
obejmuje pełny blok Latin Extended-A, więc obsługują całą polszczyznę.

  Lexend    podzbiory: latin, latin-ext, vietnamese
  Fredoka   podzbiory: latin, latin-ext, hebrew

UWAGA — PUŁAPKA PRZY POBIERANIU FREDOKI

Istnieje starszy, osobny krój o nazwie FREDOKA ONE, zawierający zaledwie
10 znaków z bloku Latin Extended-A. Polszczyzna wymaga z tego bloku
szesnastu znaków (osiem małych i osiem wielkich). Pobranie Fredoki One
zamiast właściwej Fredoki spowoduje brak polskich znaków w nagłówkach.

Do produkcji używać wyłącznie kroju FREDOKA w wariancie zmiennym.

Przy samodzielnym hostowaniu plików webfont podzbiór latin-ext należy
zaznaczyć jawnie — generatory domyślnie pobierają sam latin, w którym
z polskich znaków obecne jest wyłącznie „ó".

──────────────────────────────────────────────
ZASADY

Pole ochronne: wysokość sygnetu z każdej strony znaku.
Minimalny rozmiar logo pełnego: 90 px / 30 mm szerokości.
Minimalny rozmiar sygnetu: 24 px / 10 mm. Poniżej 32 px używać wersji bez oczu (favicon).
Nigdy: obrót, odbicie lustrzane, zmiana proporcji, zamiana kolorów koi, cień, obrys, gradient.
Na zdjęciach i tłach o niskim kontraście stosować rewers lub mono.

WDROŻENIE NA STRONIE

<link rel="icon" href="skills-academy-favicon.svg" type="image/svg+xml">
<link rel="icon" href="skills-academy-favicon.ico" sizes="any">
<link rel="apple-touch-icon" href="skills-academy-favicon-180.png">

──────────────────────────────────────────────
MASTER PRODUKCYJNY — DECYZJE

Sylwety koi są w pełni wektorowe. Wordmark („Skills" i „ACADEMY") pozostaje
żywym tekstem Lexend. To jedyny element blokujący przekazanie plików do druku:
drukarnia bez zainstalowanego kroju podstawi inną czcionkę.

FORMAT MASTERA — dwa pliki, nie jeden:

  1. .ai (Adobe Illustrator), tekst zamieniony na krzywe
     Master roboczy. Standard w polskich studiach DTP i drukarniach,
     każdy podwykonawca go otworzy i będzie mógł wprowadzić zmiany.

  2. .svg z obrysami zamiast tekstu
     Master archiwalny. Format otwarty, niezależny od licencji na
     oprogramowanie, czytelny również za dziesięć lat. Zabezpiecza przed
     sytuacją, w której dostęp do Illustratora zniknie razem ze studiem,
     które wykonało master.

FORMAT PRZEKAZANIA DO DRUKU:

  PDF/X-4 — standard przekazania do drukarni. Obsługuje przezroczystość
  i osadzone profile kolorystyczne. Format .eps przygotować wyłącznie
  wtedy, gdy konkretna drukarnia go zażąda; jest to format przestarzały,
  nieobsługujący przezroczystości.

PRZESTRZEŃ KOLORU:

  CMYK jako standard. Kolory dodatkowe (Pantone) podnoszą koszt każdego
  nakładu i przy obecnej skali działalności nie są uzasadnione. Wartości
  Pantone pozostają w dokumentacji jako odniesienie na przyszłość, do
  zastosowań premium lub przy większych nakładach.

KOLEJNOŚĆ PRAC:

  1. zamiana tekstu na krzywe, zapis obu masterów (.ai oraz .svg z obrysami)
  2. wygenerowanie rastrów logo pełnego wyłącznie z mastera po krzywych
     (PNG z przezroczystością oraz JPG na bieli)
  3. przygotowanie wersji CMYK i wykonanie proofu przed pierwszym
     nakładem, z wizualnym dopasowaniem w profilu drukarni

Rastrów nie generować z plików roboczych ani z podglądów — wyłącznie
z mastera po krzywych.
