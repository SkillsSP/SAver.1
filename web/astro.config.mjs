import { defineConfig } from 'astro/config';

// Static marketing site. `site` and `base` are set for GitHub Pages project-page
// hosting (https://<user>.github.io/SAver.1/); change both if a custom domain
// is connected, and `base` back to '/' when serving from a domain root.
export default defineConfig({
  site: 'https://evolynvoncersival-debug.github.io',
  base: '/SAver.1',
  trailingSlash: 'ignore',
  build: {
    format: 'directory',
  },
});
