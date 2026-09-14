# CMS Rebuild Trigger

**Owner:** Developer (implementation) + CEO/Client (Netlify account access)
**Status:** Not implemented. This document specifies the work; nothing in the repository performs it yet.

---

## 1. Why this is needed

The public site is static-rendered. `Docs/technical_architecture.md` §16 states the public
site "stays fully static-rendered for speed and SEO, reading published content from Netlify
Database at **build/request time**". The implementation reads at **build time**:

| Surface | Reads via | Runs |
|---|---|---|
| `/news`, `/actualites` | `getPublishedNews()` — `src/lib/news.ts` | `astro build` |
| Homepage news teaser | `getPublishedNews(3)` | `astro build` |
| `/catalogue` (both locales) | `getPublishedTitles()` — `src/lib/catalogue.ts` | `astro build` |
| Catalogue detail routes | `getPublishedTitles()` in `getStaticPaths` | `astro build` |
| Homepage catalogue showcase | `getPublishedTitles(8)` | `astro build` |
| `sitemap.xml` | `getPublishedTitles()` | `astro build` |

The query result is baked into HTML at deploy time. **Nothing re-runs it afterwards.**

### Consequence if this is never wired

An editor signs in, fills both language fields, ticks *Publish now*, and saves. The admin
panel reports success and the row is genuinely `published = true` in Postgres. The live site
does not change — not after a minute, not after a week — because no build has run since.

To the client this is indistinguishable from the CMS being broken, and it will be reported as
a bug against the admin panel rather than as missing deployment configuration. **This is the
single blocking dependency for both CMS integrations** (`a914214` news, `4d92f62` catalogue).

---

## 2. What to build

### 2.1 Create the build hook

In the Netlify UI: **Site configuration → Build & deploy → Build hooks → Add build hook**.

- Name: `cms-publish`
- Branch to build: `main`

Netlify returns a URL of the form `https://api.netlify.com/build_hooks/<id>`. **Treat it as a
secret** — anyone holding it can trigger unlimited builds against the account's build minutes.

### 2.2 Store it as a scoped environment variable

Add `CMS_REBUILD_HOOK_URL` under **Site configuration → Environment variables**, scoped to
**Functions only**. It must not be scoped to the build or exposed to the client bundle: an
`import.meta.env` value reachable from the browser would leak the hook to every visitor.

Anything prefixed `PUBLIC_` in Astro is client-visible. Do not use that prefix here.

### 2.3 Trigger it from the content functions

The natural call site is `netlify/functions/catalogue.mts` and `netlify/functions/news.mts`,
which already handle every write. Both end with a `json(...)` return after a successful
`POST`/`PUT`/`DELETE`.

Recommended shape — a shared helper beside the existing `_shared/auth.ts` and `_shared/http.ts`:

```ts
// netlify/functions/_shared/rebuild.ts
/**
 * Ask Netlify to rebuild the site so newly published content reaches the
 * public pages, which read the database at build time.
 *
 * Deliberately never throws: a failed rebuild must not turn a successful save
 * into an error response. The editor's content is already committed.
 */
export async function requestRebuild(reason: string): Promise<void> {
  const hook = process.env.CMS_REBUILD_HOOK_URL;
  if (!hook) {
    console.warn('[rebuild] CMS_REBUILD_HOOK_URL is not set; skipping rebuild request.');
    return;
  }
  try {
    await fetch(hook, { method: 'POST', body: JSON.stringify({ trigger_title: reason }) });
  } catch (error) {
    console.error('[rebuild] Failed to trigger rebuild', error);
  }
}
```

Two properties matter and are easy to get wrong:

- **Never fail the write.** If the hook call throws, the editor must still see "Published".
  The database row is already correct; only propagation is delayed.
- **Do not `await` it into the response latency** if the hook is slow. Fire it after the
  database work and before returning; a rejected promise must stay handled.

### 2.4 Only rebuild when it changes public output

Triggering on every save wastes build minutes and delays the build that matters. A draft save
changes nothing publicly.

Trigger when, and only when:

- a row is created with `published = true`;
- a row's `published` flips in either direction;
- a row that **is** `published` is edited or deleted.

Skip when a draft is created, edited, or deleted while `published` stays `false`. The `PUT`
handlers already read the incoming `body.published`; they need the previous value too, which
means capturing it in the `UPDATE ... RETURNING` or reading the row first.

---

## 3. Debounce

Netlify build hooks have no built-in debounce. An editor publishing six articles in a row
queues six builds, each superseding the last.

Options, cheapest first:

1. **Accept it.** At this content cadence (`technical_architecture.md` §42 assumes a periodic
   posting schedule, not bulk imports) the waste is small. Recommended for launch.
2. **Manual "Publish changes" button** in the admin panel. Editors save drafts freely and
   push one rebuild when finished. Most predictable, and makes the delay visible rather than
   mysterious — an editor who pressed the button understands why the site lags.
3. **Scheduled rebuild** — a Netlify scheduled function on a cron, rebuilding only if
   `MAX(updated_at)` across content tables is newer than the last deploy. Adds moving parts.

Option 2 is worth considering on its own merits: it removes the "why isn't my article live
yet" question entirely, at the cost of one screen element.

---

## 4. Verification

After wiring, confirm end to end — not just that the hook returns 200:

1. Publish an article in `/admin/news/`. Confirm a new deploy appears in the Netlify UI within
   a minute.
2. When that deploy finishes, load `/en/news/` and confirm the article is present in the
   **served HTML** (view source, not the rendered DOM — there is no client-side fetch to mask
   a failure).
3. Confirm the French headline renders at `/fr/actualites/`.
4. Unpublish it. Confirm a second deploy runs and the article disappears from both locales.
5. Save a **draft**. Confirm **no** deploy is triggered (§2.4).
6. Repeat 1–4 for a catalogue title, additionally checking that its detail route
   `/en/catalogue/<slug>/` appears and then 404s after unpublishing.

---

## 5. Related risk: a silent empty build

Both `getPublishedNews()` and `getPublishedTitles()` resolve to `[]` rather than throwing when
the database is unreachable. That is deliberate — a checkout without `DATABASE_URL` must still
build — but it means **a production build missing the variable publishes an empty catalogue
and empty news over working content, and the build stays green.**

The failure is visible only as a `console.warn` in the build log:

```
[catalogue] Could not read published titles at build time; rendering the empty state instead.
[news] Could not read published articles at build time; rendering the empty state instead.
```

Recommended guard: fail the build when the database is unreachable *and* the build is a
production context — for example, check `process.env.CONTEXT === 'production'` in the catch
and rethrow. Deploy previews and local builds keep the forgiving behaviour. This is a small
change to both `src/lib/*.ts` catch blocks and should land with the hook work.

---

## 6. Open questions for the CEO

- **Who owns the Netlify account** and can create the build hook? The developer cannot
  complete §2.1 without that access.
- **Manual publish button, or automatic on every publish?** (§3) — this is a product decision
  about how much control editors should have, not a technical one.
- **Is a delay of one build cycle acceptable** for news going live? If the client expects
  instant publication, the architecture would have to change from static reads to SSR for
  those two routes, which trades away the speed and SEO benefits the static approach was
  chosen for.
