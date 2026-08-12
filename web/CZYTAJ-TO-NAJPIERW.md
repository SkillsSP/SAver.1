# Poprawki do strony produkcyjnej `web/`

**Data:** 11 sierpnia 2026
**Dotyczy:** `web/src/styles/style.css` — krój nagłówkowy

---

## Co było zepsute

Strona produkcyjna ładuje lokalnie **Fredokę** (`Fredoka-Medium/SemiBold/Bold.ttf`)
i używa jej jako kroju nagłówkowego (`--font-odkrywca`).

Fredoka **nie zawiera polskich znaków** ą ć ę ń ś ź ż — ma wyłącznie ł Ł ó Ó.
Sprawdzone pomiarem glifów w pliku kroju, nie na oko.

Skutek: w każdym nagłówku H1–H3 brakujące litery są podstawiane z kroju
systemowego. Na iPhonie jest to SF Pro — inna szerokość i inna wysokość x,
więc „ą" w środku wyrazu wygląda jak wklejone z innej czcionki. Na Androidzie
podmiana jest mniej widoczna, bo Roboto jest wizualnie bliższy.

---

## Co robisz

### 1. Pobierz Quicksand

<https://fonts.google.com/specimen/Quicksand> → **Get font** → **Download all**.
Z rozpakowanego archiwum weź z katalogu `static/` trzy pliki:

    Quicksand-Medium.ttf
    Quicksand-SemiBold.ttf
    Quicksand-Bold.ttf

### 2. Wgraj je obok istniejących krojów

    web/public/SAver.1/fonts/

(w tym samym miejscu, gdzie leżą pliki `Lexend-*.ttf`)

### 3. Podmień arkusz stylów

Plik `style.css` z tego katalogu zastępuje `web/src/styles/style.css`.

### 4. Usuń niepotrzebne pliki

    web/public/SAver.1/fonts/Fredoka-Medium.ttf
    web/public/SAver.1/fonts/Fredoka-SemiBold.ttf
    web/public/SAver.1/fonts/Fredoka-Bold.ttf

### 5. Popraw dwie wzmianki w tekście

- `web/README.md`, tabela katalogów: „Lexend + Fredoka" → „Lexend + Quicksand"
- `web/src/pages/exams/e8.astro`, wiersz 11 (komentarz): „Fredoka w nagłówkach"
  → „Quicksand w nagłówkach"

---

## Co dokładnie zmieniłem w `style.css`

1. `--font-odkrywca` wskazuje teraz na Quicksand.
2. Dodana zmienna `--waga-naglowka: 700`. Quicksand kończy się na 700 i jest
   optycznie lżejszy od Fredoki, więc nagłówki muszą stać na maksimum skali.
   Dwanaście reguł używających kroju akcentowego przestawionych z
   `--waga-polgruba` (600) na `--waga-naglowka` (700). Wszystkie pozostałe
   użycia `--waga-polgruba` (te w Lexendzie) zostały nietknięte.
3. Trzy bloki `@font-face` wskazują pliki Quicksand, z komentarzem
   wyjaśniającym powód zmiany.

Reszta arkusza — kolory, odstępy, siatki, komponenty — bez zmian.

---

## Przycisk CTA — zmiana wykonana (decyzja z 11 sierpnia 2026)

Produkcja i prototyp rozwiązały kontrast przycisku inaczej. Wybrany został
wariant z identyfikacji wizualnej i `style.css` jest już na niego przestawiony:

| | Tło | Napis | Kontrast |
|---|---|---|---|
| **Teraz** | koral marki `#E8654A` | grafit `#1A2230` | 4,86:1 ✓ |
| Poprzednio w `web/` | ciemniejszy koral `#C94F36` | biel | 4,51:1 ✓ |
| Stan błędny (dawno usunięty) | `#E8654A` | biel | 3,29:1 ✗ |

Powód wyboru: jeden koral w znaku, w druku i na ekranie zamiast dwóch podobnych
odcieni, które przez lata ktoś będzie mylił. Do druku idzie jeden Pantone.

Co się zmieniło w kodzie:

- `--akcja` wskazuje `--koral-500` (było `--koral-600`)
- `--akcja-hover` to `#F0785F` — najechanie **rozjaśnia** tło, nie przyciemnia
- nowa zmienna `--tekst-na-akcji: var(--grafit-900)`, używana przez
  `.przycisk--akcja` i `.unikat` zamiast `var(--bialy)`

Sprawdźcie po podmianie, czy nigdzie indziej nie ma białego napisu na
`var(--akcja)` — w komponentach Astro, nie w tym arkuszu.
