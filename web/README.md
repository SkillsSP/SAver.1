# Skills Academy — serwis

Statyczny serwis zbudowany w [Astro](https://astro.build). Strony powstają
z plików `.astro`, style siedzą w jednym arkuszu, a wynik to zwykły HTML —
bez frameworka po stronie przeglądarki.

## Uruchomienie lokalne

```bash
npm install --prefix web
npm run dev --prefix web
```

Serwis otworzy się pod `http://localhost:4321/SAver.1/`.

Budowanie wersji produkcyjnej: `npm run build --prefix web` (wynik w `web/dist/`).

## Co gdzie leży

| Ścieżka | Zawartość |
| --- | --- |
| `src/pages/` | Po jednym pliku na podstronę. Nazwa pliku = adres strony. |
| `src/layouts/Baza.astro` | Wspólny szkielet: `<head>`, pasek, stopka, pasek akcji. |
| `src/components/` | Powtarzalne elementy: nawigacja, stopka, odesłania, wezwania. |
| `src/styles/style.css` | **Cały wygląd serwisu.** Zmienne `:root` na górze pliku. |
| `src/lib/site.js` | Dane kontaktowe, menu, grupy wiekowe, fakultety. |
| `public/logo/` | Pakiet znaku. Kroje (Lexend + Quicksand) pobierane są z Google Fonts — patrz komentarz na górze `style.css`. |

## Zanim opublikujecie — do uzupełnienia

Wszystko, co wymaga Waszej decyzji, jest oznaczone w dwóch miejscach:

1. **`src/lib/site.js`** — dane kontaktowe. Pola ustawione na `null` (telefon,
   e-mail, adres, NIP, godziny biura, adres formularza). Dopóki są puste, serwis
   pokazuje neutralny zastępnik zamiast martwego odnośnika, a przycisk wysyłki
   formularza jest wyłączony. Wypełnienie ich tutaj podmienia dane naraz w całym
   serwisie.

2. **Komponent `DoUzupelnienia`** — bloki na stronach z listą tego, co trzeba
   dopisać (kwoty w cenniku, sylwetki prowadzących, zakresy fakultetów).
   Znajdziecie je wyszukiwaniem frazy `DoUzupelnienia` w `src/`.

Osobno: trzy strony formalne (polityka prywatności, regulamin, klauzula RODO)
oraz strona Bezpieczeństwo są **wersjami roboczymi i wymagają przeglądu
prawnego** przed publikacją. Każda mówi to wprost na górze.

## Zmiana adresu serwisu

Serwis stoi pod adresem projektowym GitHub Pages, dlatego `astro.config.mjs` ma
`base: '/SAver.1'`. Jeśli podłączycie własną domenę:

1. zmieńcie `base` na `'/'` i `site` na adres domeny w `astro.config.mjs`,
2. usuńcie przedrostek `/SAver.1` z siedmiu reguł `@font-face` na górze
   `src/styles/style.css` — to jedyne miejsce w arkuszu, które zna ten adres.

## Wdrożenie

Każde wypchnięcie na gałąź `main` uruchamia `.github/workflows/deploy.yml`,
który buduje serwis i publikuje go na GitHub Pages. Warunek: w ustawieniach
repozytorium **Settings → Pages → Source** musi być wybrane **GitHub Actions**
(nie „Deploy from a branch").
