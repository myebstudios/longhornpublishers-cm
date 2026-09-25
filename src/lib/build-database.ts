import { getDatabase } from '@netlify/database';

/**
 * Returns the database client for CMS reads.
 *
 * Netlify Functions receive their database connection automatically at runtime.
 * Public pages now render on demand. CMS_DATABASE_URL remains a local
 * development override; Netlify supplies the runtime connection otherwise.
 */
export function getBuildDatabase() {
  const connectionString = process.env.CMS_DATABASE_URL;
  return connectionString ? getDatabase({ connectionString }) : getDatabase();
}
