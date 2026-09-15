-- Demo rows exist only to exercise the CMS-backed catalogue in local development.
-- The default keeps every existing and future production-authored row public-data eligible.
ALTER TABLE subjects
  ADD COLUMN is_demo boolean NOT NULL DEFAULT false;

ALTER TABLE catalogue_titles
  ADD COLUMN is_demo boolean NOT NULL DEFAULT false;

CREATE INDEX subjects_non_demo_idx ON subjects (name_en) WHERE is_demo = false;
CREATE INDEX catalogue_titles_public_non_demo_idx
  ON catalogue_titles (published, featured, created_at DESC)
  WHERE is_demo = false;
