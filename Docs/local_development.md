# Local development and CMS testing

## Start the full local runtime

Use the standard command from the repository root:

```bash
npm run dev
```

This Astro project uses the Netlify adapter, which loads the Netlify Vite runtime during
development. It starts an **isolated local** Netlify Database and emulates Functions, Blobs,
redirects, headers, and the Image CDN. It does not connect to production content or production
media.

`npm run dev` runs `scripts/dev.mjs`, which launches `astro dev` with `NETLIFY_LOCAL=true`
and `CONTEXT=dev`. Those two variables are what `canRenderLocalDemoContent()` checks, so
**plain `astro dev` will start the site but will hide every seeded demo row.** If demo
content is missing, confirm you started the server with `npm run dev` and not `astro dev`.

Do not run plain `astro build` as a CMS integration test, and do not use `netlify dev`:
recent Astro CLI releases background their dev process, so the Netlify CLI sees the command
exit immediately, shuts down, and takes the local database proxy with it.

The site is served at `http://localhost:4321`.

## Verify the local database

With `npm run dev` still running in one terminal:

```bash
npx netlify database status
npx netlify database connect --query "SELECT 1 AS local_database_ready"
curl -i http://localhost:4321/api/catalogue
```

Expected results:

- `database status` reports a local `postgres://localhost:...` connection with all
  migrations applied. A freshly provisioned local database lists them as *pending*; apply
  them with `npx netlify database migrations apply` before seeding.
- The query returns `1`.
- The catalogue API returns `200` and `[]` until local test content is created.

## Seed local-only demo catalogue content

With `npm run dev` running (so the local database and migrations are active),
use the deliberately explicit opt-in command from another terminal:

```bash
NETLIFY_LOCAL=true CONTEXT=dev ALLOW_LOCAL_DEMO_SEED=yes npm run seed:demo
```

The command refuses CI, production, deploy-preview, branch-deploy, a real deploy id,
and non-loopback database connections. `netlify dev` sets `DEPLOY_ID=0` together with
`DEPLOY_URL` and `DEPLOY_PRIME_URL` locally, so only a *real* deploy id is treated as
evidence of a deploy; the decisive guarantee is the loopback database check.

It creates conspicuously labelled fixtures using fixed IDs, so rerunning it updates the
same rows instead of duplicating them:

- 2 subjects and 2 published catalogue titles (`DEMO-CAT-001`, `DEMO-CAT-002`)
- 9 news articles — 8 published, plus 1 deliberately unpublished draft
  (`demo-unpublished-draft`) that must never appear in a list or resolve as a
  detail route. If it does, the `published` filter has regressed.

The news page is a three-column grid with no pagination, so the published set is
sized to wrap onto a second row and to cover all four categories, since each one
drives a different pill label and card icon. One published row
(`demo-undated-notice`) has no publish date, which exercises the conditional
`<time>` element and the `NULLS LAST` ordering.

News fixtures require `004_news_demo_origin`. Until it is applied locally the seed skips
news entirely and says so, rather than failing against an un-migrated database. The rows carry `is_demo = true`; production and
preview queries exclude that marker even if a demo row were copied into their
database branch accidentally. No media is uploaded and no production content is
read or modified.

Run the safeguard regression suite with:

```bash
npm run test:demo-seed
```

To reset only local CMS data, use:

```bash
npx netlify database reset
```

This never resets or reads the production database.

## What can be tested locally

- Public EN/FR pages and routes
- CMS database queries and public API responses
- Netlify Functions, including catalogue/news/subjects endpoints
- Local Blob storage and the protected-media logic
- Redirects, response headers, and Image CDN behavior

## Identity limitation

Netlify Identity does not run in Netlify's local development runtime. Browser login, invite,
role assignment, and authenticated-admin end-to-end tests must run on a Netlify deploy preview
or production with a disposable QA record. Do not add a local authentication bypass: it would
weaken the security model that production uses.

For a complete pre-release test, run the local checks above, then use a deploy preview for the
Identity-specific admin flow. Clean up every disposable preview record and media blob afterwards.
