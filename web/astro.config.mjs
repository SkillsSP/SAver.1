import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";

// Statyczny serwis wizytówkowy pod własną domeną skilful.pl.
//
// Serwis stoi w katalogu głównym domeny, więc `base` to "/". Gdyby kiedyś
// wrócił pod adres projektowy (https://<uzytkownik>.github.io/<repo>/), trzeba
// ustawić `base` na nazwę repozytorium i dopisać ten sam przedrostek do reguł
// @font-face w src/styles/style.css — to jedyne ścieżki w arkuszu, które
// o `base` wiedzą.
export default defineConfig({
  site: "https://skilful.pl",
  base: "/",
  trailingSlash: "ignore",

  /* Stary adres ścieżki ósmoklasisty. Mógł trafić do materiałów drukowanych
     i do wiadomości wysłanych przed zmianą, więc musi prowadzić do nowego —
     inaczej rodzic z ulotki ląduje na stronie błędu. Astro generuje dla
     takiego wpisu stronę przekierowującą, co przy serwisie statycznym jest
     jedynym dostępnym mechanizmem.

     Kotwic `/exams#e8` i `/exams#matura` nie da się tu obsłużyć: fragment
     adresu po krzyżyku nigdy nie dociera do serwera. Przenosi je skrypt
     na stronie rozdzielającej Exams. */
  redirects: {
    "/exams/e8": "/exams/egzamin-osmoklasisty",
  },
  build: {
    format: "directory",
  },
  integrations: [
    sitemap({
      // Dokumenty formalne nie mają czego szukać w wynikach wyszukiwania.
      filter: (strona) =>
        !["polityka-prywatnosci", "regulamin", "klauzula-rodo"].some((s) =>
          strona.includes(`/${s}`)
        ),
    }),
  ],
});
