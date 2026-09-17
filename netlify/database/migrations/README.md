# Database migrations

Netlify applies every migration in this directory automatically when the site
deploys. Nobody runs a command.

---

## A CONTENT migration needs TWO deploys to reach the live site

**Read this before writing a migration that changes CMS content rather than
schema.** It cost us a live defect and roughly an hour of debugging a migration
that was already correct.

### The symptom, which is the misleading part

- The deploy reaches `ready`.
- The migration applied. The database holds the new values.
- **The published site still serves the old values.**
- It is not a CDN artefact: a cache-busted fetch returns the new deploy's own
  HTML, containing the old content.

Everything looks successful, so the natural conclusion is that the migration
silently failed. It did not. Do not start rewriting it.

### Why

This site is statically built. Pages read the CMS **at build time**, not per
request. Within a single deploy, the build and the migration are not ordered the
way you would need:

```
deploy N     build reads the CMS   ->   pre-migration data baked into the HTML
             migration applies     ->   database now correct
             deploy goes live      ->   HTML still shows the OLD content

deploy N+1   build reads the CMS   ->   post-migration data
             deploy goes live      ->   correct
```

The build for the very deploy that carries the migration cannot see that
migration's effect.

### What to do

Trigger a second build after the migration deploy has finished. Any empty
commit, retry, or manual build works — it needs to be a *new build*, not a
redeploy of the existing one, since a redeploy republishes the same baked HTML.

Then confirm on the live site, not in `dist/`:

```
npm run verify:production
```

### This does not apply to schema-only migrations

Adding a nullable column changes no rendered output, so one deploy is fine.
The two-deploy rule is specifically for migrations that change **content the
build reads** — `homepage_content`, `about_page`, `why_choose_us`,
`contact_settings`, `legal_pages`, `process_steps`, `services`,
`catalogue_titles`, `news_articles`, `site_settings`.

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

- `npm run verify:cms-parity` — builds twice against one commit, once reading
  the local CMS and once falling back to the i18n dictionaries, and diffs every
  public route. Any difference is a copy divergence or a reader bug.
- `npm run verify:production` — asserts known approved strings on the live site.
- `node scripts/preflight-draft-state.mjs` — read-only; reports which tables
  carry `published`, which migrations a database has recorded, and any row
  sitting at `published = false`.
