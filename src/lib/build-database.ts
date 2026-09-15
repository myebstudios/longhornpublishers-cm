import { getDatabase } from '@netlify/database';

/**
 * Returns the database client for build-time CMS reads.
 *
 * Netlify Functions receive their database connection automatically at runtime.
 * Static prerendering runs in the build environment, where this project uses
 * the private, build-scoped CMS_DATABASE_URL secret instead. Falling back to
 * the platform client preserves local Netlify development behavior.
 */
export function getBuildDatabase() {
  const connectionString = process.env.CMS_DATABASE_URL;
  return connectionString ? getDatabase({ connectionString }) : getDatabase();
}
