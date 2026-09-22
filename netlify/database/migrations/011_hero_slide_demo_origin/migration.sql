-- Demo hero slides exist only to make the carousel demonstrable in local development.
-- The default keeps the migration safe for the rollback-critical backfilled slide and
-- for every slide subsequently authored by the client through the CMS.
ALTER TABLE homepage_hero_slides
  ADD COLUMN is_demo boolean NOT NULL DEFAULT false;

CREATE INDEX homepage_hero_slides_public_non_demo_idx
  ON homepage_hero_slides (homepage_id, enabled, sort_order, created_at)
  WHERE is_demo = false;
