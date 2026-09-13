/**
 * Shared fetch helpers for the admin editors — see Docs/ui_ux_audit.md §11.
 *
 * The content functions do not always answer with JSON: `requireAdmin()` returns
 * a plain-text 401/403, `methodNotAllowed()` a plain-text 405, and a crashed
 * function or an edge redirect can return HTML. Calling `response.json()`
 * directly on those throws, and because the editors' submit handlers were not
 * wrapped the rejection was swallowed — the form simply appeared to do nothing.
 * Everything here resolves instead of throwing so callers always have a message
 * to show.
 */

export interface Result<T = unknown> {
  ok: boolean;
  status: number;
  data: T | null;
  /** Human-readable failure reason; `null` when `ok`. */
  error: string | null;
}

/** Fallback copy for responses that carry no usable message of their own. */
function statusMessage(status: number, fallback: string): string {
  if (status === 401) return 'Your session has expired. Sign in again to continue.';
  if (status === 403) return 'Your account does not have administrator access.';
  if (status === 404) return 'That item no longer exists. The list has been refreshed.';
  if (status >= 500) return 'The server could not complete that request. Try again.';
  return fallback;
}

/** Read a response body that is meant to be JSON but may be text or HTML. */
async function readBody(response: Response): Promise<unknown> {
  const raw = await response.text();
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    // Plain-text error from the function, or an HTML error page.
    return raw;
  }
}

/** Pull an error message out of whatever shape the body turned out to be. */
function messageFrom(body: unknown, status: number, fallback: string): string {
  if (typeof body === 'string' && body.trim() && !body.trimStart().startsWith('<')) {
    return body.trim();
  }
  if (body && typeof body === 'object' && typeof (body as { error?: unknown }).error === 'string') {
    return (body as { error: string }).error;
  }
  return statusMessage(status, fallback);
}

/**
 * Perform a request and always resolve with a usable `Result`.
 *
 * Network failures resolve with `status: 0` rather than rejecting, so callers
 * can report them the same way as an HTTP error.
 */
export async function request<T = unknown>(
  url: string,
  init: RequestInit = {},
  fallback = 'That request could not be completed.',
): Promise<Result<T>> {
  let response: Response;
  try {
    response = await fetch(url, init);
  } catch {
    return { ok: false, status: 0, data: null, error: 'Network error — check your connection and try again.' };
  }

  const body = await readBody(response);
  if (!response.ok) {
    return { ok: false, status: response.status, data: null, error: messageFrom(body, response.status, fallback) };
  }
  return { ok: true, status: response.status, data: body as T, error: null };
}

/** Send a JSON payload. */
export function sendJson<T = unknown>(
  url: string,
  method: 'POST' | 'PUT',
  payload: unknown,
  fallback?: string,
): Promise<Result<T>> {
  return request<T>(
    url,
    { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) },
    fallback,
  );
}

/**
 * Blank strings are what an untouched `<input>` yields, but Postgres rejects
 * them for date and numeric columns. Normalise them to null before sending.
 */
export function emptyToNull<T extends Record<string, unknown>>(record: T, keys: string[]): T {
  for (const key of keys) {
    if (record[key] === '') (record as Record<string, unknown>)[key] = null;
  }
  return record;
}
