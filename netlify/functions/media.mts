import { getStore } from '@netlify/blobs';
import type { Config } from '@netlify/functions';
import { requireAdmin } from './_shared/auth';
import { json, methodNotAllowed } from './_shared/http';

const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;
const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

export default async function handler(req: Request) {
  if (req.method !== 'POST') return methodNotAllowed();
  const denied = await requireAdmin(); if (denied) return denied;
  const form = await req.formData();
  const file = form.get('file');
  if (!(file instanceof File) || !ALLOWED_TYPES.has(file.type) || file.size > MAX_UPLOAD_BYTES) {
    return json({ error: 'Upload a JPEG, PNG, or WebP image up to 8 MB.' }, { status: 400 });
  }
  const extension = file.type.split('/')[1];
  const key = `uploads/${crypto.randomUUID()}.${extension}`;
  await getStore({ name: 'longhorn-media', consistency: 'strong' }).set(key, await file.arrayBuffer(), {
    metadata: { contentType: file.type, originalName: file.name, uploadedAt: new Date().toISOString() },
  });
  return json({ id: key }, { status: 201 });
}

export const config: Config = { path: '/api/media' };
