import { LOCALES, NAV_KEYS, path } from '../i18n';
import { TITLES, titleSlug } from '../data/site';

export const prerender = true;

/**
 * Includes only public routes that are implemented today. Legal and admin
 * routes deliberately stay out until their respective workstreams ship.
 */
export function GET({ site }: { site: URL }) {
  const pages = LOCALES.flatMap((locale) => [
    ...NAV_KEYS.map((key) => path(key, locale)),
    path('news', locale),
    ...TITLES.map((title) => `/${locale}/catalogue/${titleSlug(title, locale)}/`),
  ]);

  const urls = [...new Set(pages)].map((route) => {
    const loc = new URL(route, site).href;
    return `  <url><loc>${loc}</loc></url>`;
  });

  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`,
    { headers: { 'Content-Type': 'application/xml; charset=utf-8' } },
  );
}
