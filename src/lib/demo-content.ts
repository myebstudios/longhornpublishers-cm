/**
 * Demo records may be rendered only by Netlify's local development runtime.
 *
 * This check deliberately ignores the seed opt-in flag: the flag authorizes a
 * one-time write, while an already-seeded local database must remain usable on
 * later `npm run dev` sessions. Exact positive checks make this fail closed for
 * production, deploy previews, branch deploys, CI, and ordinary Astro builds.
 */
export function canRenderLocalDemoContent(
  env: Record<string, string | undefined> = process.env,
): boolean {
  return env.NETLIFY_LOCAL === 'true'
    && env.CONTEXT === 'dev'
    && env.NETLIFY !== 'true'
    && !env.DEPLOY_ID
    && !env.DEPLOY_URL
    && !env.DEPLOY_PRIME_URL
    && !env.CI;
}
