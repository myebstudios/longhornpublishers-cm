import { purgeCache } from '@netlify/functions';

/**
 * CDN cache tag for a media blob.
 *
 * Emitted by the media function on every publicly-cacheable read, and purged
 * by the admin handlers whenever the content referencing that blob changes.
 * The key is `uploads/<uuid>.<ext>`; tags are restricted to a conservative
 * character set, so everything else collapses to a hyphen. The uuid keeps the
 * result unique.
 */
export const mediaCacheTag = (key: string) => `media-${key.replace(/[^a-z0-9]+/gi, '-')}`;

/**
 * Revoke cached copies of media blobs at the CDN.
 *
 * `/api/media/*` authorizes reads against published content, so unpublishing a
 * title revokes its cover at the origin immediately. The cached copy is the
 * problem: a public read carries `max-age=300, stale-while-revalidate=600`, so
 * without an explicit purge an unpublished cover stays serveable for up to 5
 * minutes fresh and roughly 15 with revalidation. When the reason for
 * unpublishing is that an image was confidential, "it comes down in fifteen
 * minutes" is not an answer we can give a client.
 *
 * Failure is logged, never thrown: a purge that fails must not fail the
 * editor's save. The origin has already revoked access at that point, so the
 * consequence of a failed purge is the old TTL window, not a broken write.
 *
 * In local development `purgeCache` no-ops with a log line, since no purge API
 * token is present. In the deployed runtime Netlify injects both the token and
 * the site id, so no configuration is required.
 */
export async function purgeMedia(...keys: (string | null | undefined)[]): Promise<void> {
  const tags = [...new Set(keys.filter((key): key is string => Boolean(key)))].map(mediaCacheTag);
  if (!tags.length) return;
  try {
    await purgeCache({ tags });
  } catch (error) {
    console.warn('[media] cache purge failed; cached copies expire on their own TTL', error);
  }
}
