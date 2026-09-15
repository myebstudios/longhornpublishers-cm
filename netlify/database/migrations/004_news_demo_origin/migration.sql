-- Mirrors 003_local_demo_origin for news. Demo rows exist only to exercise the
-- CMS-backed news list and detail routes in local development.
-- DEFAULT false keeps every existing and future editor-authored row public-data
-- eligible, so this applies cleanly over a table that already holds articles.
ALTER TABLE news_articles
  ADD COLUMN is_demo boolean NOT NULL DEFAULT false;

CREATE INDEX news_articles_public_non_demo_idx
  ON news_articles (published, publish_date DESC)
  WHERE is_demo = false;
