SKILLS ACADEMY — PAKIET ZNAKU
Wariant finalny: dwa koi tworzące literę „S". Górne koi grafitowe, dolne koralowe.
Wersja pakietu 1.1 — wordmark na krzywych.

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

Wordmark („kills" / „Skills" i „ACADEMY") jest zamieniony na krzywe we wszystkich
pięciu plikach logo — pliki nie wymagają już zainstalowanego kroju Lexend i można
je przekazać drukarni bez ryzyka podmiany fontu.

Rastry logo pełnego (sekcja 4) renderowały się prawdziwym krojem Lexend, więc
pozostają aktualne.

Do wykonania:
  1. wersja CMYK/Pantone i zatwierdzenie proofu przed pierwszym drukiem
     (SVG żyje w RGB — konwersję robi drukarnia albo grafik w Scribusie /
     Affinity / Illustratorze),
  2. master .ai/.eps/.pdf, jeśli konkretna drukarnia go zażąda.

Do druku cyfrowego i małych nakładów wystarczą obecne SVG oraz rastry 2400 px.
