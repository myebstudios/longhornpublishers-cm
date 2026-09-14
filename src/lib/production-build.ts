/**
 * Public CMS content is read while Astro builds static pages. Local and preview
 * builds may intentionally lack DATABASE_URL, but production must never deploy
 * that empty fallback over the live catalogue and news.
 */
export function failIfProductionDatabaseUnavailable(area: 'catalogue' | 'news'): void {
  if (process.env.CONTEXT === 'production') {
    throw new Error(
      `[${area}] Database is unavailable during a production build; refusing to deploy empty CMS content.`,
    );
  }
}
