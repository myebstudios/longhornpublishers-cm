/**
 * Demo records may be rendered only by Netlify's local development runtime.
 *
 * This check deliberately ignores the seed opt-in flag: the flag authorizes a
 * one-time write, while an already-seeded local database must remain usable on
 * later `npm run dev` sessions. Exact positive checks make this fail closed for
 * production, deploy previews, branch deploys, CI, and ordinary Astro builds.
 */

const DEPLOY_CONTEXTS = new Set(['production', 'deploy-preview', 'branch-deploy']);

/**
 * `netlify dev` reports this sentinel deploy id; a real deploy never does. It
 * also sets DEPLOY_URL and DEPLOY_PRIME_URL locally, so those carry no signal
 * and are not tested here — treating them as deploy evidence meant demo rows
 * could never render under the only runtime allowed to show them.
 */
const LOCAL_DEPLOY_ID = '0';

export function canRenderLocalDemoContent(
  env: Record<string, string | undefined> = process.env,
): boolean {
  if (env.NETLIFY_LOCAL !== 'true') return false;
  if (env.CONTEXT !== 'dev') return false;
  if (DEPLOY_CONTEXTS.has(env.CONTEXT)) return false;
  if (env.NETLIFY === 'true') return false;
  if (env.CI) return false;
  if (env.DEPLOY_ID !== undefined && env.DEPLOY_ID !== '' && env.DEPLOY_ID !== LOCAL_DEPLOY_ID) {
    return false;
  }
  return true;
}
