// @ts-check
import { defineConfig } from 'astro/config';
import netlify from '@astrojs/netlify';
import tailwindcss from '@tailwindcss/vite';

// Longhorn Publishers Cameroon — see Docs/technical_architecture.md
export default defineConfig({
  site: 'https://longhornpublishers-cm.netlify.app',
  output: 'static',
  adapter: netlify(),

  // Sub-path routing: /en/ and /fr/ with localized French slugs.
  // Slug map lives in src/i18n/routes.ts — Astro only owns the prefix.
  i18n: {
    locales: ['en', 'fr'],
    defaultLocale: 'en',
    routing: {
      prefixDefaultLocale: true,
      redirectToDefaultLocale: false,
    },
  },

  redirects: {
    '/': '/en/',
  },

  vite: {
    plugins: [tailwindcss()],
  },
});
