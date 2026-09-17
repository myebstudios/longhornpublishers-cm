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

/**
 * Unsaved-changes guard for the admin editors.
 *
 * Seven of the eleven editor screens write to tables that had no draft state
 * before migration 005, and losing a half-written form to a stray sidebar
 * click is the cheapest way to lose real editorial work. Every editor form
 * registers here.
 *
 * `beforeunload` alone is not enough: the admin is a multi-page app and the
 * sidebar links are ordinary anchors, so an in-app navigation is exactly the
 * case Z's audit reported and the one the native prompt handles least
 * reliably. The capture-phase click interception covers it, and
 * `confirmAction` is reused rather than `window.confirm` for the event-loop
 * reason documented above it.
 */
export interface FormGuard {
  /** True when the form differs from the last `markClean()` baseline. */
  isDirty(): boolean;
  /** Re-baselines after a load or a successful save. */
  markClean(): void;
}

const dirtyChecks = new Set<() => boolean>();
let navGuardInstalled = false;
/** Set while a confirmed navigation is in flight, so the guard does not re-prompt. */
let leaving = false;

const anyDirty = () => !leaving && [...dirtyChecks].some((check) => check());

/**
 * Registers an existing dirty-check so screens that already track their own
 * baseline (catalogue, news, subjects) gain in-app navigation interception
 * without rewriting their load and reset bookkeeping.
 */
export function registerDirtyCheck(isDirty: () => boolean): void {
  dirtyChecks.add(isDirty);
  installNavGuard();
}

/**
 * Snapshots a form plus any repeatable-row containers whose fields live
 * outside it. Those rows are built as detached DOM and serialised by hand at
 * submit time, so `FormData` alone does not see them — without the containers
 * an editor could lose every team block or project-type option unwarned.
 */
export function guardUnsavedChanges(
  form: HTMLFormElement,
  ...containers: (Element | null)[]
): FormGuard {
  const snapshot = () => {
    const fields = new URLSearchParams(new FormData(form) as unknown as Record<string, string>).toString();
    const rows = containers
      .filter((container): container is Element => Boolean(container))
      .flatMap((container) => [
        ...container.querySelectorAll<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>('input, textarea, select'),
      ])
      .map((field) =>
        field instanceof HTMLInputElement && (field.type === 'checkbox' || field.type === 'radio')
          ? String(field.checked)
          : field.value,
      )
      .join('|');
    return `${fields}::${rows}`;
  };

  let pristine = snapshot();
  const guard: FormGuard = {
    isDirty: () => snapshot() !== pristine,
    markClean: () => { pristine = snapshot(); },
  };
  dirtyChecks.add(guard.isDirty);
  installNavGuard();
  return guard;
}

function installNavGuard(): void {
  if (navGuardInstalled) return;
  navGuardInstalled = true;

  window.addEventListener('beforeunload', (event) => {
    if (anyDirty()) event.preventDefault();
  });

  document.addEventListener('click', (event) => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const link = (event.target as Element | null)?.closest?.('a[href]') as HTMLAnchorElement | null;
    if (!link || link.target === '_blank' || link.hasAttribute('download')) return;

    const url = new URL(link.href, location.href);
    // Same-document fragments and external targets are not a loss of work.
    if (url.origin !== location.origin) return;
    if (url.pathname === location.pathname && url.search === location.search) return;
    if (!anyDirty()) return;

    event.preventDefault();
    void confirmAction('You have unsaved changes. Leave without saving?').then((confirmed) => {
      if (!confirmed) return;
      // Suppress the native prompt that would otherwise fire for the same
      // navigation the editor has just explicitly approved.
      leaving = true;
      location.href = link.href;
    });
  }, true);
}

/**
 * Builds the "<thing> Unavailable" card shown when a list screen fails to load.
 *
 * The message is written with `textContent`, never interpolated into
 * `innerHTML`. Netlify Identity sets the `nf_jwt` session cookie with
 * `httpOnly: false`, so any script execution in the admin origin yields a live
 * admin token — which makes an error-message sink a credential-theft path, not
 * a cosmetic defect. Today every error reaching here is a server-side
 * constant, but an error that ever echoes a slug, a filename or an API
 * response would be one careless string away from stored XSS.
 */
export function errorCard(heading: string, message: string): HTMLElement {
  const card = document.createElement('div');
  card.className = 'admin-empty-state';

  const icon = document.createElement('div');
  icon.className = 'admin-empty-icon';
  icon.textContent = '⚠️';

  const title = document.createElement('h3');
  title.className = 'admin-empty-title';
  title.textContent = heading;

  const text = document.createElement('p');
  text.className = 'admin-empty-text';
  text.textContent = message;

  card.append(icon, title, text);
  return card;
}
