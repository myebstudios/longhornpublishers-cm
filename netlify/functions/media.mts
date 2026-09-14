import { getStore } from '@netlify/blobs';
import { getDatabase } from '@netlify/database';
import type { Config } from '@netlify/functions';
import { requireAdmin } from './_shared/auth';
import { json, methodNotAllowed } from './_shared/http';

const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;
const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const STORE = 'longhorn-media';

/**
 * Keys this function issues, and the only shape it will read back.
 *
 * Upload derives the extension from the MIME subtype, so the set here matches
 * ALLOWED_TYPES. Anchored because the key becomes a blob-store lookup: without
 * it, a crafted value could address objects outside `uploads/`.
 */
const KEY_PATTERN = /^uploads\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(jpeg|png|webp)$/;

const EXTENSION_TYPE: Record<string, string> = {
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
};

/**
 * Is this blob referenced by content that is actually published?
 *
 * This is the whole authorization model for reads. The blob store also holds
 * images attached to unpublished drafts, and images uploaded and then abandoned
 * when an editor changed their mind — serving the store by key would expose all
 * of them to anyone who guessed or obtained a key. Reachability is therefore
 * derived from published content rather than from the object's existence.
 *
 * Unpublishing a title consequently revokes its cover, which is why the
 * response below is not cached immutably.
 */
async function isPubliclyApproved(key: string): Promise<boolean> {
  const db = getDatabase();
  const [row] = await db.sql`
    SELECT 1 AS ok WHERE EXISTS (
      SELECT 1 FROM catalogue_titles WHERE published = true AND cover_image_id = ${key}
      UNION ALL
      SELECT 1 FROM news_articles WHERE published = true AND hero_image_id = ${key}
    )
  `;
  return Boolean(row);
}

async function serveMedia(key: string): Promise<Response> {
  if (!KEY_PATTERN.test(key)) return new Response('Not found', { status: 404 });

  // Authorize before touching the store: a timing or error difference between
  // "exists but unapproved" and "does not exist" would leak which keys are real.
  if (!(await isPubliclyApproved(key))) return new Response('Not found', { status: 404 });

  const blob = await getStore({ name: STORE, consistency: 'strong' })
    .getWithMetadata(key, { type: 'arrayBuffer' });
  if (!blob) return new Response('Not found', { status: 404 });

  // Content type comes from the key's extension, not from stored metadata.
  // Metadata was written from a client-supplied File.type at upload time;
  // echoing it back would let a crafted upload choose the type the browser
  // renders it as.
  const extension = key.slice(key.lastIndexOf('.') + 1);
  const contentType = EXTENSION_TYPE[extension] ?? 'application/octet-stream';

  return new Response(blob.data as ArrayBuffer, {
    headers: {
      'Content-Type': contentType,
      'X-Content-Type-Options': 'nosniff',
      'Content-Disposition': 'inline',
      // Deliberately not immutable. Keys never change, but approval does —
      // unpublishing must actually take the image down within a short window.
      'Cache-Control': 'public, max-age=300, stale-while-revalidate=600',
    },
  });
}

export default async function handler(req: Request) {
  const url = new URL(req.url);

  if (req.method === 'GET') {
    // Public read. Key arrives as the path after /api/media/, matching the id
    // stored in cover_image_id / hero_image_id.
    const key = decodeURIComponent(url.pathname.replace(/^\/api\/media\/?/, ''));
    if (!key) return new Response('Not found', { status: 404 });
    return serveMedia(key);
  }

  if (req.method !== 'POST') return methodNotAllowed();

  const denied = await requireAdmin(); if (denied) return denied;
  const form = await req.formData();
  const file = form.get('file');
  if (!(file instanceof File) || !ALLOWED_TYPES.has(file.type) || file.size > MAX_UPLOAD_BYTES) {
    return json({ error: 'Upload a JPEG, PNG, or WebP image up to 8 MB.' }, { status: 400 });
  }
  const extension = file.type.split('/')[1];
  const key = `uploads/${crypto.randomUUID()}.${extension}`;
  await getStore({ name: STORE, consistency: 'strong' }).set(key, await file.arrayBuffer(), {
    metadata: { contentType: file.type, originalName: file.name, uploadedAt: new Date().toISOString() },
  });
  return json({ id: key }, { status: 201 });
}

export const config: Config = { path: ['/api/media', '/api/media/*'] };
