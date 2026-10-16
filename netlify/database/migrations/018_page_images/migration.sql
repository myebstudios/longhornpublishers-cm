-- Additive only: null/absent custom images retain the reviewed static fallbacks.
CREATE TABLE page_images (
  key text PRIMARY KEY CHECK (key IN ('about.hero', 'about.heritage', 'about.quality', 'about.capacity_editorial', 'about.capacity_design', 'about.capacity_production', 'services.hero', 'why.hero', 'why.pillar_1', 'why.pillar_2', 'why.pillar_3', 'catalogue.hero', 'news.hero', 'contact.hero')),
  image_id text,
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE services ADD COLUMN image_id text;
