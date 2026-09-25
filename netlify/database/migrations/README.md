# Database migrations

Netlify applies every migration in this directory automatically when the site
deploys. Nobody runs a command.

---

## Content migrations reach the live site in ONE deploy (since 2026-09-25)

Public pages now render on demand and read the database per request (see
`Docs/technical_architecture.md` §6.1). The old two-deploy rule, which existed
because pages read the CMS **at build time** before the deploy's own migration
had applied, no longer applies.

- A deploy clears the CDN cache, so the first requests after a migration's
  deploy render from the migrated database.
- The build itself no longer reads the database for public pages, so a
  migration that adds a table cannot fail the build the way `010` did.
- Still confirm on the live site, not in `dist/`:

```
npm run verify:production
```

**Content changed outside a deploy** — a manual SQL fix, a bulk import — does
not purge the cache. Purge the affected tags (`catalogue`, `news`, `homepage`,
…) with `netlify api purgeCache`, or allow five minutes plus one visit.

---

## Two other things that have bitten us here

**Never edit an applied migration.** Once a migration has run in production,
editing the file changes nothing there — the runner records it by name and will
not re-apply it — and it destroys the record of what was actually run. Write a
new migration. `009` exists because `007` was wrong and `007` had already been
applied.

**A `NOT NULL` column with a default needs an explicit backfill** when the table
already holds rows. `005` adds `published boolean NOT NULL DEFAULT false` to
six tables whose every existing row was live; without the explicit
`UPDATE ... SET published = true`, deploying it would have unpublished the live
site with no error anywhere. The backfill is written as its own commented
statement so a reviewer cannot miss it.

---

## Checking before you write

- `npm run verify:cms-parity` — serves the site on demand twice, once reading
  the local CMS and once falling back to the i18n dictionaries, and diffs every
  public route. Any difference is a copy divergence or a reader bug.
- `npm run verify:production` — asserts known approved strings on the live site.
- `node scripts/preflight-draft-state.mjs` — read-only; reports which tables
  carry `published`, which migrations a database has recorded, and any row
  sitting at `published = false`.
