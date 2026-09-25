export const CDN_CACHE_CONTROL = 'public, durable, max-age=300, stale-while-revalidate=3600';
export const BROWSER_CACHE_CONTROL = 'public, max-age=0, must-revalidate';

/** Tags describe content dependencies, including shared navigation and footer. */
export function cacheTagsForPath(pathname: string): string[] {
  const tags = ['site-settings'];
  if (pathname === '/sitemap.xml') return [...tags, 'catalogue', 'news'];
  const parts = pathname.split('/').filter(Boolean);
  if (parts[0] !== 'en' && parts[0] !== 'fr') return [];
  const segment = parts[1] ?? '';
  if (!segment) return [...tags, 'homepage', 'services', 'catalogue', 'news'];
  if (['about', 'a-propos'].includes(segment)) return [...tags, 'about'];
  if (['services', 'services-edition'].includes(segment)) return [...tags, 'services'];
  if (segment === 'catalogue') return [...tags, 'catalogue'];
  if (['why-choose-us', 'pourquoi-nous-choisir'].includes(segment)) return [...tags, 'why'];
  if (segment === 'contact') return [...tags, 'contact'];
  if (['news', 'actualites'].includes(segment)) return [...tags, 'news'];
  if (['privacy-policy', 'politique-de-confidentialite', 'terms-of-use', 'conditions-utilisation'].includes(segment)) return [...tags, 'legal'];
  return [];
}
