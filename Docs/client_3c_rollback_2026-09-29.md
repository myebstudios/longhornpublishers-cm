# CLIENT-3C release — rollback record

**Release:** `e60eb35` (+ `fa2b761`, `fc72f14`), Netlify production deploy `6abab325def2b000082704d9` (per `client_corrections_tracker_2026-09-28.md`). **Migrations applied in production:** 012–015. **Author:** SoSo, independent review 2026-09-29.

## 1. Code rollback: never go behind the cover gate

Netlify "Publish deploy" rolls back **code only**. Migrations 012–015 stay applied, and the four titles stay `published = true` with their `cover_image_id` still stored.

Every deploy built from before `660bce1` serves a cover for **any** published title. It checks only `published = true AND cover_image_id = …` in `media.mts`, and has no classification filter in `getPublishedTitles()` or `/api/catalogue`. Rolling back to one of those deploys would immediately re-expose all four unverified covers on the catalogue, the detail pages, Home and the direct media URLs. That breaks C15.

- **Safe rollback targets:** deploy `6abab325…` (`e60eb35`) and any later deploy. These all contain the classification gate.
- **If an older deploy is ever required**, hide the covers in the database *first*. The following is reversible, because the keys stay in the private store:

  ```sql
  -- Record the keys before clearing them; restore from this list afterwards.
  SELECT id, slug, cover_image_id FROM catalogue_titles WHERE cover_image_id IS NOT NULL AND classification <> 'national_book_list_verified';
  UPDATE catalogue_titles SET cover_image_id = NULL WHERE classification <> 'national_book_list_verified';
  ```

  Then purge the `catalogue`, `homepage` and four media cache tags.
- Prefer roll-forward. Every CLIENT-3 content change is a CMS row that an admin can edit without a deploy.

## 2. Content rollback (015): pre-release values

015 overwrote CMS copy. The values below are the pre-015 rows, dumped from the local QA database on 2026-09-28. That database was seeded by 007/009, the same seeds as production. The live site matched them for the trust label, Who We Are paragraph 2, About heritage paragraph 2, purpose, vision, and the Editing and Translation bodies (read-only checks on 2026-09-28).

**These values contain the DRC/Congo wording the client asked to remove.** Restore them only to undo a broken release, and then re-apply the corrections.

| Row / field | Pre-015 value (EN; FR in the same row) |
|---|---|
| `homepage_content.hero_headline` / `accent` / `subheadline` | "Professional publishing services," / "start to finish" / "Editing, proofreading, translation, design, illustration and printing — delivered bilingually from Yaoundé for publishers, institutions and organisations across Cameroon and the DRC." |
| `homepage_content.trust_stats[1]` | "Local publishing team in Tsinga, Yaoundé" / "Équipe d’édition basée à Tsinga, Yaoundé" |
| `homepage_content.who_we_are_copy` ¶2 | "From our office in Tsinga, Yaoundé, we operate as content creators and platform business providers: an editorial, creative and production team working in both official languages, close enough to the market to get the cultural detail right." |
| `about_page.heritage_copy` ¶2 | "That heritage gives us editorial standards, production capacity and institutional relationships that a new entrant simply cannot assemble. What we add is proximity: a team based in Tsinga, Yaoundé, working daily in the Cameroonian and Congolese education context, in both official languages." |
| `about_page.purpose` / `vision` / `mission` | "To expand minds — creating content that makes learning accessible, accurate and relevant across Central Africa." / "To be the publishing partner of choice in Cameroon and the DRC for institutions that will not compromise on quality." / "To deliver end-to-end publishing — editorial, creative and production — bilingually, on schedule, at a fair price." |
| `services` `editing` / `translation` descriptions | See migration `007_cms_baseline_content` (unchanged seed text). |
| `homepage_hero_slides` `5ad099ec…` | Backfilled by 010 from the homepage hero fields above. **Verify against a production DB snapshot before restoring**, because the slide may have been edited in the admin after the backfill. |

The French values are in `007_cms_baseline_content`. `why_choose_us.local_presence_copy` ¶2 and `site_settings.seo_default_description` were changed only where they contained "DRC". Their prior text is in 007, and production's SEO description did not match that pattern.

**Recommended:** take a Netlify DB snapshot or `pg_dump` of these tables before the next content migration, so rollback does not depend on seed provenance. No production snapshot is recorded for this release.

## 3. Catalogue (012/013) and cache

- 012/013 need no rollback. Classification is additive, and 013 kept all four published titles public (text-only).
- To reverse a single title, edit its classification in the admin. An admin save purges `catalogue` and `homepage`.
- **CDN purge:** none needed now. On 2026-09-29 the three recorded former cover keys returned uncached 404s, both raw and via `/.netlify/images` (w=560/720). The deploy invalidated the earlier cached responses, and the stale window has long passed.
