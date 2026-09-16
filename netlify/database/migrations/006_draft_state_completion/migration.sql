-- Migration 006: Ensure draft state columns on all managed content tables.
-- Fixes schema sync for production database instances where 005_content_draft_state
-- was recorded prior to legal_pages and process_steps columns being included.

ALTER TABLE homepage_content  ADD COLUMN IF NOT EXISTS published boolean NOT NULL DEFAULT false;
ALTER TABLE about_page        ADD COLUMN IF NOT EXISTS published boolean NOT NULL DEFAULT false;
ALTER TABLE why_choose_us     ADD COLUMN IF NOT EXISTS published boolean NOT NULL DEFAULT false;
ALTER TABLE contact_settings  ADD COLUMN IF NOT EXISTS published boolean NOT NULL DEFAULT false;
ALTER TABLE legal_pages       ADD COLUMN IF NOT EXISTS published boolean NOT NULL DEFAULT false;
ALTER TABLE process_steps     ADD COLUMN IF NOT EXISTS published boolean NOT NULL DEFAULT false;

-- Backfill pre-existing rows to published = true so live content remains visible
UPDATE homepage_content  SET published = true WHERE published IS NOT TRUE;
UPDATE about_page        SET published = true WHERE published IS NOT TRUE;
UPDATE why_choose_us     SET published = true WHERE published IS NOT TRUE;
UPDATE contact_settings  SET published = true WHERE published IS NOT TRUE;
UPDATE legal_pages       SET published = true WHERE published IS NOT TRUE;
UPDATE process_steps     SET published = true WHERE published IS NOT TRUE;
