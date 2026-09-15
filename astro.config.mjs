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

  // The root path is deliberately not redirected here. Astro would emit a static
  // `/ -> /en/ 301` into _redirects, which matches before the Accept-Language
  // rules in netlify.toml and sends French visitors to the English site. Root
  // language negotiation is owned by netlify.toml.

  vite: {
    plugins: [tailwindcss()],
    build: {
      rollupOptions: {
        external: ['@netlify/database', '@netlify/blobs', 'netlify-identity-widget'],
      },
    },
    ssr: {
      external: ['@netlify/database', '@netlify/blobs', '@netlify/identity', 'netlify-identity-widget'],
    },
  },
});
