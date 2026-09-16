-- Draft state for managed content pages.
--
-- These six tables had no `published` column, so every save was instantly
-- public: an editor typing a half-finished About page had published it. That
-- is the defect this closes. Catalogue, news and services already had draft
-- state and are untouched here.
--
-- DELIBERATELY EXCLUDED, both considered and rejected:
--
--   subjects       — taxonomy, not content. catalogue_titles.subject_id is a
--                    foreign key into it and the public filter chips are
--                    derived from it, so an unpublished subject would leave
--                    published titles with a missing subject name and remove
--                    the chip while its titles remain. A subject is not
--                    published, it is referenced.
--   site_settings  — global configuration. With a published filter, an
--                    unpublished row falls back to a hardcoded constant,
--                    silently reverting company name, address, both phone
--                    numbers, email, SEO and footer across EVERY page with no
--                    error surfaced. There is no useful draft of a phone
--                    number.

ALTER TABLE homepage_content  ADD COLUMN published boolean NOT NULL DEFAULT false;
ALTER TABLE about_page        ADD COLUMN published boolean NOT NULL DEFAULT false;
ALTER TABLE why_choose_us     ADD COLUMN published boolean NOT NULL DEFAULT false;
ALTER TABLE contact_settings  ADD COLUMN published boolean NOT NULL DEFAULT false;
ALTER TABLE legal_pages       ADD COLUMN published boolean NOT NULL DEFAULT false;
ALTER TABLE process_steps     ADD COLUMN published boolean NOT NULL DEFAULT false;

-- BACKFILL — the single most dangerous line in this migration if omitted.
--
-- Every row that already exists in these tables is LIVE. They had no draft
-- state, so anything stored was rendering publicly by definition. The ADD
-- COLUMN above has just set all of them to false. Without the promotion
-- below, deploying this migration would UNPUBLISH THE LIVE SITE — the public
-- pages would fall back to static copy and the editor's real content would
-- disappear from view with no error anywhere.
--
-- New rows still default to false, which is the behaviour we want: content
-- created from here on starts as a draft. Only pre-existing rows are promoted.
--
-- Each statement is a no-op on an empty table, so this is safe regardless of
-- how many rows production actually holds. Confirm those counts with
-- scripts/preflight-draft-state.mjs before running this against production.
UPDATE homepage_content  SET published = true;
UPDATE about_page        SET published = true;
UPDATE why_choose_us     SET published = true;
UPDATE contact_settings  SET published = true;
UPDATE legal_pages       SET published = true;
UPDATE process_steps     SET published = true;
