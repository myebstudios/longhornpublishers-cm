/**
 * Ask Netlify to rebuild the site after a content change.
 *
 * See Docs/cms_rebuild_trigger.md. The public pages read the database at build
 * time, so a published article or title does not reach visitors until a build
 * runs. The `cms-publish` build hook is the thing that makes publishing real.
 *
 * The hook URL lives in the production-only CMS_REBUILD_HOOK_URL environment
 * variable. The current Netlify plan scopes it to server-side build, function,
 * and runtime contexts; it has no PUBLIC_ prefix and this function is its only
 * consumer, so it is never exposed to the client. It is a credential: anyone
 * holding it can burn the account's build minutes, so it is never logged,
 * echoed in a response, or included in an error message.
 */

/** The write that happened, as far as public output is concerned. */
export type WriteKind = 'create' | 'update' | 'delete';

export interface PublishState {
  /** `published` before the write. Undefined for a create. */
  wasPublished?: boolean;
  /** `published` after the write. Undefined for a delete. */
  isPublished?: boolean;
}

/**
 * Would this write change what a visitor sees?
 *
 * Draft churn must not queue builds: an editor saving a draft six times should
 * cost nothing. A row is only publicly visible while `published` is true, so
 * the rebuild matters when the row is published now, was published before, or
 * both — i.e. anything except a draft staying a draft.
 */
export function affectsPublicOutput(kind: WriteKind, state: PublishState): boolean {
  const was = state.wasPublished === true;
  const is = state.isPublished === true;
  if (kind === 'create') return is;
  if (kind === 'delete') return was;
  return was || is;
}

/**
 * Fire the build hook. Never throws and never rejects.
 *
 * A failed rebuild must not turn a successful save into an error: the row is
 * already committed and the editor's work is safe, only propagation is delayed.
 * Callers therefore do not need to guard this.
 */
export async function requestRebuild(reason: string): Promise<void> {
  const hook = process.env.CMS_REBUILD_HOOK_URL;
  if (!hook) {
    // No URL is a configuration gap, not a request failure. Say so without
    // implying the save went wrong.
    console.warn('[rebuild] CMS_REBUILD_HOOK_URL is not set; skipping rebuild request.');
    return;
  }
  try {
    const response = await fetch(hook, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ trigger_title: reason }),
      // Bound hook acknowledgement latency without making a failed trigger a
      // failed CMS save. Netlify build hooks normally return immediately.
      signal: AbortSignal.timeout(5_000),
    });
    if (!response.ok) {
      // Status only — the URL itself must not reach the logs.
      console.error(`[rebuild] Build hook responded ${response.status}; content will publish on the next build.`);
      return;
    }
    console.log(`[rebuild] Requested: ${reason}`);
  } catch (error) {
    console.error(
      '[rebuild] Could not reach the build hook; content will publish on the next build.',
      error instanceof Error ? error.message : error,
    );
  }
}

/**
 * Request a rebuild only when the write changed public output.
 *
 * Callers await the bounded hook acknowledgement so a serverless invocation
 * cannot discard an unfinished fire-and-forget request. `requestRebuild`
 * catches every failure, so this never turns a successful CMS save into an
 * error response.
 */
export async function rebuildIfPublic(
  kind: WriteKind,
  state: PublishState,
  reason: string,
): Promise<void> {
  if (!affectsPublicOutput(kind, state)) return;
  await requestRebuild(reason);
}
