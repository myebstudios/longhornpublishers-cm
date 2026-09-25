/** A failed request-time CMS read must abort public rendering before caching. */
import { inPublicRender } from './request-context';

export function failIfProductionDatabaseUnavailable(
  area: string,
  error?: unknown,
): void {
  // Parity verification deliberately renders the reviewed fallback through a
  // local on-demand server with no database. Never permit that mode in prod.
  if (process.env.CONTEXT !== 'production' && process.env.CMS_PARITY_FALLBACK === '1') return;
  if (!inPublicRender()) return;

  const chain: string[] = [];
  for (let e: unknown = error; e !== undefined && e !== null && chain.length < 5; ) {
    chain.push(e instanceof Error ? `${e.name}: ${e.message}` : String(e));
    e = e instanceof Error ? (e as Error & { cause?: unknown }).cause : undefined;
  }
  const cause = chain.join('\n  caused by: ');
  const present = ['NETLIFY_DB_URL', 'NETLIFY_DB_DRIVER', 'CMS_DATABASE_URL']
    .map((name) => `${name}=${process.env[name] ? 'set' : 'unset'}`)
    .join(' ');

  throw new Error(
    `[${area}] Database read failed during public rendering; refusing to cache fallback content.\n`
      + `  cause: ${cause}\n`
      + `  connection env: ${present}`,
  );
}
