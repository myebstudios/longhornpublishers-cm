import { purgeCache } from '@netlify/functions';

export type WriteKind = 'create' | 'update' | 'delete';
export interface PublishState {
  wasPublished?: boolean;
  isPublished?: boolean;
}

export function affectsPublicOutput(kind: WriteKind, state: PublishState): boolean {
  if (kind === 'create') return state.isPublished === true;
  if (kind === 'delete') return state.wasPublished === true;
  return state.wasPublished === true || state.isPublished === true;
}

/** Await the purge, but never turn a committed editor save into a failed save. */
export async function purgePublicWith(
  tags: string[],
  purge: (options: { tags: string[] }) => Promise<unknown> = purgeCache,
): Promise<void> {
  if (!tags.length) return;
  try {
    await purge({ tags: [...new Set(tags)] });
  } catch (error) {
    console.error('[public cache] Tag purge failed; CDN TTL will expire cached pages.', error);
  }
}

export async function purgePublic(...tags: string[]): Promise<void> {
  await purgePublicWith(tags);
}

export async function purgeIfPublic(kind: WriteKind, state: PublishState, ...tags: string[]): Promise<void> {
  if (affectsPublicOutput(kind, state)) await purgePublic(...tags);
}
