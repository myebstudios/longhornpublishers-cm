import { LOCALES, NAV_KEYS, path } from '../i18n';
import { getPublishedTitles } from '../lib/catalogue';

export const prerender = true;

/**
 * Includes only public routes that are implemented today. Admin routes stay out
 * deliberately.
 *
 * Legal routes remain directly reachable from the footer but deliberately stay
 * out of the sitemap until approved copy is published.
 */
export async function GET({ site }: { site: URL }) {
  // Detail URLs must match what the catalogue route actually generates, so both
  // read the same published-titles query.
  const titles = await getPublishedTitles();
  const pages = LOCALES.flatMap((locale) => [
    ...NAV_KEYS.map((key) => path(key, locale)),
    path('news', locale),
    ...titles.map((title) => `${path('catalogue', locale)}${title.slug}/`),
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
