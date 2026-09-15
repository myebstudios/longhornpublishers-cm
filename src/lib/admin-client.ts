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

/**
 * In-page confirmation, replacing `window.confirm()`.
 *
 * The native dialog suspends the JS event loop for the whole tab, so an
 * automated driver can only wait for it and has no DOM element to click to
 * dismiss it; a stalled wait there timed out and reset the browser session
 * mid-QA (Docs/qa_log_2026-09-13.md, "Cleanup-path failure analysis"). A
 * `<dialog>` is ordinary DOM — its buttons accept normal clicks — so it
 * keeps the confirm-before-delete behaviour without blocking the event loop.
 */
let confirmDialog: HTMLDialogElement | null = null;

export function confirmAction(message: string): Promise<boolean> {
  if (!confirmDialog) {
    confirmDialog = document.createElement('dialog');
    confirmDialog.style.cssText = 'border:0;border-radius:.6rem;padding:1.25rem 1.5rem;max-width:24rem;box-shadow:0 1rem 2rem rgba(0,0,0,.2)';
    confirmDialog.innerHTML = `
      <form method="dialog" style="display:grid;gap:1rem">
        <p data-message style="margin:0"></p>
        <div style="display:flex;justify-content:flex-end;gap:.6rem">
          <button type="submit" value="cancel" style="border:0;border-radius:.4rem;padding:.5rem .9rem;cursor:pointer;background:#eee">Cancel</button>
          <button type="submit" value="confirm" style="border:0;border-radius:.4rem;padding:.5rem .9rem;cursor:pointer;color:#8b1e31;background:#fbe8eb">Confirm</button>
        </div>
      </form>
    `;
    document.body.append(confirmDialog);
  }
  const dialog = confirmDialog;
  dialog.querySelector('[data-message]')!.textContent = message;
  return new Promise(resolve => {
    const onClose = () => {
      dialog.removeEventListener('close', onClose);
      resolve(dialog.returnValue === 'confirm');
    };
    dialog.addEventListener('close', onClose);
    dialog.showModal();
  });
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

/** Upload an image through the shared authenticated media endpoint. */
export function uploadMedia(file: File): Promise<Result<{ id: string }>> {
  return request<{ id: string }>('/api/media', {
    method: 'POST',
    headers: { 'Content-Type': file.type },
    body: file,
  }, 'Unable to upload image.');
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

/* -------------------------------------------------------------------------
 * Cover image helpers
 *
 * The rules live here rather than inline in the editor so they can be tested
 * without a DOM, and so the client limits stay visibly aligned with the ones
 * netlify/functions/media.mts enforces.
 * ---------------------------------------------------------------------- */

export const MAX_COVER_BYTES = 8 * 1024 * 1024;
export const COVER_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

/**
 * Reject a file the server would reject anyway, before spending an upload on
 * it. Returns null when the file is acceptable.
 */
export function coverFileError(file: { type: string; size: number }): string | null {
  if (!COVER_TYPES.includes(file.type)) return 'Choose a JPEG, PNG or WebP image.';
  if (file.size > MAX_COVER_BYTES) return 'That image is larger than 8 MB. Choose a smaller file.';
  return null;
}

/** What the cover controls should show for a given state. */
export interface CoverViewState {
  imageSrc: string | null;
  showImage: boolean;
  showEmpty: boolean;
  showClear: boolean;
  /** The file input's label — "Replace" only once a cover actually exists. */
  fileLabel: string;
}

/**
 * Derive the cover UI from the stored id and any locally previewed file.
 *
 * `previewSrc` wins over `id` so a just-picked file appears immediately, before
 * its upload has returned an id.
 */
export function coverViewState(id: string | null, previewSrc?: string | null): CoverViewState {
  const src = previewSrc ?? (id ? `/api/media/${id}` : null);
  return {
    imageSrc: src,
    showImage: Boolean(src),
    showEmpty: !src,
    showClear: Boolean(src),
    fileLabel: src ? 'Replace cover image' : 'Choose a cover image',
  };
}
