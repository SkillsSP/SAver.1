# Paczka do podmiany — Skills Academy

**Data:** 26 sierpnia 2026

Trzy foldery, w kolejności wdrażania. Każdy ma własną instrukcję.

    01-zdjecia/              zdjęcia w tle nagłówków + kafle tematyczne
    02-kontakt-i-uklad/      kontakt, pasek, trzy kroki, matura, podział Exams
    03-dokumentacja-marki/   wytyczne v3.3, identyfikacja v1.3, brief v2.2
    04-audyt/                audyt gotowości — co sprawdzone, co blokuje start
    05-cennik/               ceny 2026/2027 i sprzeczności, które ujawniły
    06-o-nas/                podstrona zespołu i metody
    07-metoda/               korekta twierdzeń o skuteczności + aneks naukowy

**Kolejność jest istotna.** Paczka 02 zakłada, że dopisek CSS z paczki 01 jest
już w arkuszu — grafitowy nagłówek Exams korzysta z reguł zdefiniowanych tam.

---

## 01-zdjecia

52 pliki JPEG (26 kadrów × 2 rozmiary) + dopisek CSS + instrukcja z tabelą
przypisania kadru do każdej podstrony.

Wdrożenie: wgrać `foto/` do `web/public/SAver.1/`, dopisać
`naglowek-zdjecia.css` na koniec `style.css`, dodać `<img>` i klasę `--foto`
do każdego nagłówka.

## 02-kontakt-i-uklad

Nowa podstrona `/kontakt` (cztery drogi kontaktu, formularz z wyborem tematu,
adres i dojazd, dane firmy), pasek użytkowy nad nawigacją, sekcja „trzy kroki"
na stronie głównej, grafitowy nagłówek matury, matura z historii oraz
rozdzielenie Exams na stronę rozdzielającą i dwie podstrony.

**Najważniejsze:** kontakt nie miał dotąd własnej podstrony, mimo że był
w pasku nawigacji. Osobna ścieżka zgłoszeń ze standardów ochrony małoletnich
jest wymogiem ustawowym i musi trafiać na inny adres niż pozostałe tematy.

## 03-dokumentacja-marki

Zaktualizowane dokumenty źródłowe. Nowa w tej turze jest **sekcja 5.5
Fotografia** w wytycznych — do wersji 3.1 marka nie miała żadnej reguły dla
zdjęć, a zakaz gradientów i tekstur czytano jako zakaz fotografii.

`PRZECZYTAJ - stan plikow.txt` zawiera aktualną listę pozycji otwartych.

## 04-audyt

**Przeczytajcie to pierwsze, jeśli macie czas tylko na jeden plik.** Audyt
sprawdza spójność całości — nazewnictwo, rejestry wieku, kontrasty, siatki,
odnośniki, wersje dokumentów — i wypisuje wprost, co jeszcze blokuje start.

Sprzeczności: zero. Martwych odnośników: zero. Blokery: trzy, żaden projektowy.

---

## Blokery produkcji

Dwie rzeczy blokują publikację, niezależnie od wdrożenia technicznego:

1. **Imię, nazwisko i funkcja osoby odpowiedzialnej za standardy ochrony
   małoletnich.** — ZAMKNIĘTE: Karolina Dumała, wpisana na kontakcie
   i w standardach.
2. **Pozostałe dane firmowe** — NIP, REGON, administrator danych. W makiecie
   stoją jako `[nawias]`. Te same dane muszą być zgodne w czterech miejscach:
   kontakt, regulamin, polityka prywatności, klauzula RODO.
3. **Kwalifikacje trzech prowadzących** — nazwiska i przedmioty są wpisane:
   Karolina Dumała (angielski, matematyka, fakultety Acting i Motion Skills),
   Kamil Dumała (angielski, matematyka, historia rozszerzona), Natalia
   Marczewska (angielski, fakultety Music i Art). Wszyscy prowadzą też 1:1.
   Opisy wykształcenia i doświadczenia stoją puste — w tej kategorii to pole
   waży więcej niż samo nazwisko.

**Ryzyko obsadowe:** historia ma jedną osobę, więc brak zastępstwa przy
chorobie — a to przedmiot sprzedawany pod konkretny termin egzaminu.
Matematykę prowadzą dwie osoby.

Osoba odpowiedzialna za standardy ochrony małoletnich jest wskazana: **Karolina
Dumała**. Zostaje jej bezpośredni e-mail i numer — nie mogą prowadzić do biura
ani do osób prowadzących zajęcia.

Ustalone i wpisane na stronie: telefon **508 069 007**, e-mail
**kontakt@skilful.pl** na domenie **skilful.pl** — tej samej, która idzie na
ulotkę i do materiałów drukowanych.

**Lokal** — do podpisania umowy wszystko, co go dotyczy, jest ukryte, nie
wstawione jako pusty nawias: adres, godziny biura, dojazd, parking, mapa
i karta „przyjdźcie do biura". W ich miejscu stoi jedno zdanie o tym, że podamy
je przy uruchomieniu zapisów. Miasto i tryb zajęć zostają. Lista miejsc do
przywrócenia jest w instrukcji paczki 02, punkt 1.

## Otwarta decyzja

**Fakultet bez zajęć podstawowych.** Cennik pozwala wziąć fakultety
samodzielnie, dokumentacja marki mówi, że zajęcia podstawowe są bazą każdego
karnetu. Strony są przepisane pod cennik — albo przepisujemy trzy dokumenty
marki, albo cennik. Opis w paczce 05.

Czy wchodzimy w pełny układ lądowania sprzedażowego (wariant wzorowany na
Oponly.pl). Obecna wersja ma już z niego trzy najmocniejsze elementy, więc
różnica dotyczy teraz roli kobaltu i długości strony. Porównanie i opis
konsekwencji: „Strona główna - wariant Oponly" oraz „Wariant Oponly -
dokumentacja".

Druga otwarta rzecz: **podstrona „O nas"**. Pozycja jest w pasku i w stopce, ale
prowadzi do zakotwiczenia na stronie głównej — ten sam problem, który miał
kontakt. Zbuduję ją, gdy będą nazwiska prowadzących; bez nich powtórzyłaby
problem pustych kart.
