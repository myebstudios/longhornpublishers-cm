import { getStore } from '@netlify/blobs';
import { getDatabase } from '@netlify/database';
import type { Config } from '@netlify/functions';
import { canRenderLocalDemoContent } from '../../src/lib/demo-content';
import { requireAdmin } from './_shared/auth';
import { json, methodNotAllowed } from './_shared/http';
import { isPubliclyApproved } from './_shared/media-approval';
import { mediaCacheTag } from './_shared/media-cache';

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
 * Does this request even carry a credential?
 *
 * `requireAdmin()` resolves the caller by calling Netlify Identity's `/user`
 * over HTTPS. On the public read path that call is reached for any well-formed
 * key that is not publicly approved — including from a fully anonymous caller,
 * who is then answered with the same 404 they would have received anyway. That
 * makes an unauthenticated endpoint spend a database query plus an outbound
 * round-trip per request, unbounded and unrated.
 *
 * A request with no bearer token and no `nf_jwt` cookie cannot resolve to an
 * admin, so the outbound call is pure waste and is skipped. The public
 * behaviour is unchanged: the answer is 404 either way.
 */
function hasCredential(req: Request): boolean {
  const authorization = req.headers.get('authorization');
  if (authorization && /^bearer\s+\S/i.test(authorization)) return true;
  return /(?:^|;\s*)nf_jwt=\S/.test(req.headers.get('cookie') ?? '');
}

async function serveMedia(req: Request, key: string): Promise<Response> {
  if (!KEY_PATTERN.test(key)) return new Response('Not found', { status: 404 });

  // Authorize before touching the store: a timing or error difference between
  // "exists but unapproved" and "does not exist" would leak which keys are real.
  //
  // Signed-in admins may also read unapproved blobs, otherwise the cover an
  // editor just attached to an unpublished draft would 404 in their own
  // preview. The public rule is unchanged: this branch is reached only after
  // the published-content check has already failed, and requireAdmin() rejects
  // anyone without the admin role.
  let adminOnly = false;
  if (!(await isPubliclyApproved(key, getDatabase(), canRenderLocalDemoContent()))) {
    if (!hasCredential(req)) return new Response('Not found', { status: 404 });
    if (await requireAdmin()) return new Response('Not found', { status: 404 });
    adminOnly = true;
  }

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
      // Admin-only reads are never cached: the response is authorized per
      // request, so a shared cache must not be able to replay it to the public.
      'Cache-Control': adminOnly
        ? 'private, no-store'
        : 'public, max-age=300, stale-while-revalidate=600',
      // Lets the admin handlers revoke this exact blob at the CDN the moment
      // the content referencing it is unpublished, deleted, or re-imaged,
      // instead of waiting out the TTL. Admin-only reads are never cached, so
      // there is nothing to tag on that branch.
      ...(adminOnly ? {} : { 'Netlify-Cache-Tag': mediaCacheTag(key) }),
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
    return serveMedia(req, key);
  }

  if (req.method !== 'POST') return methodNotAllowed();

  const denied = await requireAdmin(); if (denied) return denied;
  const contentType = req.headers.get('content-type')?.split(';')[0]?.trim() ?? '';
  let file: File | null = null;
  if (contentType === 'multipart/form-data') {
    const form = await req.formData();
    const candidate = form.get('file');
    file = candidate instanceof File ? candidate : null;
  } else if (ALLOWED_TYPES.has(contentType)) {
    const extension = contentType.split('/')[1];
    file = new File([await req.arrayBuffer()], `upload.${extension}`, { type: contentType });
  }
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
