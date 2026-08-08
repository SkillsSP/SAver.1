import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";

// Statyczny serwis wizytówkowy.
//
// `site` i `base` są ustawione pod adres projektowy GitHub Pages
// (https://<uzytkownik>.github.io/SAver.1/). Po podłączeniu własnej domeny:
//   1. `site` -> adres domeny, `base` -> "/",
//   2. usunąć przedrostek "/SAver.1" z reguł @font-face w src/styles/style.css.
export default defineConfig({
  site: "https://evolynvoncersival-debug.github.io",
  base: "/SAver.1",
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
