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
