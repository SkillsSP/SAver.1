SKILLS ACADEMY — PAKIET ZNAKU
Wariant finalny: dwa koi tworzące literę „S". Górne koi grafitowe, dolne koralowe.
Wersja pakietu 1.0.

──────────────────────────────────────────────
1. LOGO PEŁNE (poziome, sygnet w miejscu pierwszej litery)

skills-academy-logo.svg              podstawowe, na jasnym tle (Cloud Dancer / biel)
skills-academy-logo-rewers.svg       na kobalcie i grafitcie — górne koi Cloud Dancer
skills-academy-logo-mono-grafit.svg  druk jednokolorowy, oczy wybrane na biel podłoża
skills-academy-logo-mono-bialy.svg   kontra, bez oczu (czysta sylweta)

2. LOGO PIONOWE

skills-academy-logo-pionowy.svg      sygnet nad nazwą, wyrównanie do środka.
                                     Stosować, gdy szerokość jest ograniczona (roll-up, stopka, awatar z nazwą).

3. SYGNET (bez nazwy)

skills-academy-sygnet.svg            podstawowy, z oczami — od 32 px
skills-academy-sygnet-rewers.svg     na ciemnym tle
skills-academy-sygnet-mono.svg       druk jednokolorowy
skills-academy-sygnet-1024.png       raster przezroczysty 1024 px

4. RASTRY LOGO PEŁNEGO (wordmark w prawdziwym Lexend)

skills-academy-logo-2400.png         przezroczyste tło, do dużych formatów i druku cyfrowego
skills-academy-logo-1200.png         przezroczyste tło, do prezentacji, dokumentów, mediów
skills-academy-logo-500.png          przezroczyste tło, do maila i stopek
skills-academy-logo-rewers-1200.png  na kobaltowym tle
skills-academy-logo-1200-biale-tlo.jpg  na bieli, dla systemów nieobsługujących przezroczystości
skills-academy-logo-pionowy-1000.png    układ pionowy, przezroczyste tło

5. FAVICON I IKONY

skills-academy-favicon.svg           sygnet bez oczu — podstawowy favicon wektorowy
skills-academy-favicon.ico           16 + 32 + 48 px w jednym pliku
skills-academy-favicon-16/32/48.png  bez oczu (czytelność w małej skali)
skills-academy-favicon-180.png       Apple Touch Icon — z oczami
skills-academy-favicon-192/512.png   manifest PWA / sklepy — z oczami

6. AWATARY (media, GBP, Instagram, Facebook)

skills-academy-avatar-kwadrat.png         512 px, tło Cloud Dancer
skills-academy-avatar-kolo.png            512 px, kadr kołowy, tło Cloud Dancer
skills-academy-avatar-kwadrat-kobalt.png  512 px, tło kobaltowe, znak w rewersie

──────────────────────────────────────────────
KOLORY

Grafit (górne koi, tekst)   #1A2230   CMYK 80/70/50/70   Pantone 532 C*
Koral (dolne koi, iskra)    #E8654A   CMYK  0/72/70/0    Pantone 7416 C*
Kobalt (tła marki)          #1E5FCC   CMYK 85/62/0/0     Pantone 2145 C*
Cloud Dancer (baza, oczy)   #FBF8F3   CMYK  2/3/5/0
Slate (tylko Teens Senior)  #5B6B7A   CMYK 65/50/40/15

* Wartości CMYK i Pantone są punktem wyjścia. Przed pierwszym drukiem
  wymagany proof i wizualne dopasowanie w profilu docelowym.

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

CO ZOSTAJE DO MASTERA PRODUKCYJNEGO

Rastry logo pełnego są już wygenerowane (sekcja 4) — wordmark renderował się
prawdziwym krojem Lexend, więc nadają się do użytku od zaraz.

W plikach SVG wordmark („kills" i „ACADEMY") pozostaje żywym tekstem Lexend:
sylwety koi są w pełni wektorowe, litery nie. Przed przekazaniem do drukarni:
  1. zamienić tekst na krzywe i zapisać master .ai/.eps/.pdf
     (wymaga programu wektorowego z zainstalowanym krojem Lexend),
  2. wykonać wersję CMYK/Pantone i zatwierdzić proof.

Do czasu mastera: do druku używać plików rastrowych 2400 px lub przekazać
drukarni SVG razem z krojem Lexend (Google Fonts, licencja OFL, bez opłat).
