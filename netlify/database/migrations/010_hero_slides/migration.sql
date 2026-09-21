-- Homepage hero carousel data layer.
--
-- Slides are rows rather than JSON so media references remain directly
-- queryable and cache purges can diff exact image ids on every write. They do
-- not carry a separate `published` flag: like the other homepage sections,
-- publication belongs to the singleton homepage_content row. `enabled` only
-- controls whether a slide participates in that published carousel.

ALTER TABLE homepage_content
  ADD COLUMN hero_autoplay_enabled boolean NOT NULL DEFAULT true,
  ADD COLUMN hero_autoplay_interval integer NOT NULL DEFAULT 7000
    CHECK (hero_autoplay_interval BETWEEN 3000 AND 30000);

CREATE TABLE homepage_hero_slides (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  homepage_id text NOT NULL DEFAULT 'default'
    REFERENCES homepage_content(id) ON DELETE CASCADE,
  sort_order integer NOT NULL DEFAULT 0 CHECK (sort_order >= 0),
  image_id text,
  eyebrow_en text,
  eyebrow_fr text,
  headline_en text,
  headline_fr text,
  headline_accent_en text,
  headline_accent_fr text,
  subheadline_en text,
  subheadline_fr text,
  primary_cta_label_en text,
  primary_cta_label_fr text,
  primary_cta_href text,
  secondary_cta_label_en text,
  secondary_cta_label_fr text,
  secondary_cta_href text,
  enabled boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX homepage_hero_slides_order_idx
  ON homepage_hero_slides (homepage_id, sort_order, created_at);

-- BACKFILL — the legacy hero is already approved, published content.
--
-- Preserve it as slide 1 before any reader switches to the carousel table.
-- The legacy hero_* columns deliberately remain untouched as the rollback
-- path until the carousel has been verified on the live site.
--
-- `/contact` is the locale-neutral CMS href. The public carousel localizes
-- internal paths when rendering, just as the current hero uses path('contact').
INSERT INTO homepage_hero_slides (
  homepage_id, sort_order, image_id,
  eyebrow_en, eyebrow_fr,
  headline_en, headline_fr,
  headline_accent_en, headline_accent_fr,
  subheadline_en, subheadline_fr,
  primary_cta_label_en, primary_cta_label_fr, primary_cta_href,
  secondary_cta_label_en, secondary_cta_label_fr, secondary_cta_href,
  enabled
)
SELECT
  id, 0, hero_image_id,
  hero_eyebrow_en, hero_eyebrow_fr,
  hero_headline_en, hero_headline_fr,
  hero_headline_accent_en, hero_headline_accent_fr,
  hero_subheadline_en, hero_subheadline_fr,
  hero_cta_label_en, hero_cta_label_fr, '/contact',
  NULL, NULL, NULL,
  true
FROM homepage_content
WHERE id = 'default';
