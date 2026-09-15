/**
 * Public CMS content is read while Astro builds static pages. Local and preview
 * builds may intentionally lack a database connection, but production must never
 * deploy that empty fallback over the live catalogue and news.
 *
 * The underlying driver error is attached to the thrown message: without it a
 * failed production build only reports "database is unavailable", which is true
 * of a missing connection string, a TLS failure, and a broken migration alike.
 */
export function failIfProductionDatabaseUnavailable(
  area: 'catalogue' | 'news',
  error?: unknown,
): void {
  if (process.env.CONTEXT !== 'production') return;

  const cause = error instanceof Error ? `${error.name}: ${error.message}` : String(error);
  const present = ['NETLIFY_DB_URL', 'NETLIFY_DB_DRIVER', 'CMS_DATABASE_URL']
    .map((name) => `${name}=${process.env[name] ? 'set' : 'unset'}`)
    .join(' ');

  throw new Error(
    `[${area}] Database read failed during a production build; refusing to deploy empty CMS content.\n`
      + `  cause: ${cause}\n`
      + `  connection env: ${present}`,
  );
}
