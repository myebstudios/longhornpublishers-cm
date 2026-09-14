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

Do not run plain `astro build` as a CMS integration test, and do not use the removed
`dev:netlify` wrapper: recent Astro CLI releases background their dev process, which prevents
the Netlify CLI from supervising it correctly.

The site is served at `http://localhost:4321`.

## Verify the local database

With `npm run dev` still running in one terminal:

```bash
npx netlify database status
npx netlify database connect --query "SELECT 1 AS local_database_ready"
curl -i http://localhost:4321/api/catalogue
```

Expected results:

- `database status` reports a local `postgres://localhost:...` connection and the
  `001_initial_content` migration as applied.
- The query returns `1`.
- The catalogue API returns `200` and `[]` until local test content is created.

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
