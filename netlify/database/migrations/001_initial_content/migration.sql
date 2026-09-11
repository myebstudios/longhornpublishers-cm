CREATE TABLE site_settings (
  id text PRIMARY KEY DEFAULT 'default', company_name_en text NOT NULL, company_name_fr text NOT NULL,
  tagline_en text, tagline_fr text, address text, phone_1 text, phone_2 text, email text,
  social_links jsonb NOT NULL DEFAULT '[]', footer_tagline_en text, footer_tagline_fr text,
  newsletter_copy_en text, newsletter_copy_fr text, parent_company_url text,
  seo_default_title text, seo_default_description text, og_image_id text, updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE homepage_content (
  id text PRIMARY KEY DEFAULT 'default', hero_headline_en text, hero_headline_fr text,
  hero_subheadline_en text, hero_subheadline_fr text, hero_image_id text, hero_cta_label_en text,
  hero_cta_label_fr text, who_we_are_copy_en text, who_we_are_copy_fr text, who_we_are_image_id text,
  trust_stats jsonb NOT NULL DEFAULT '[]', one_partner_copy_en text, one_partner_copy_fr text,
  featured_catalogue_ids jsonb NOT NULL DEFAULT '[]', updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE about_page (id text PRIMARY KEY DEFAULT 'default', heritage_copy_en text, heritage_copy_fr text,
  purpose_en text, purpose_fr text, vision_en text, vision_fr text, mission_en text, mission_fr text,
  values_en text, values_fr text, team_capacity_blocks jsonb NOT NULL DEFAULT '[]', updated_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE services (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), name_en text NOT NULL, name_fr text NOT NULL,
  category text NOT NULL CHECK (category IN ('editorial','creative','production')), description_en text NOT NULL,
  description_fr text NOT NULL, icon text, sort_order integer NOT NULL DEFAULT 0, published boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE process_steps (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), step_number integer NOT NULL,
  title_en text NOT NULL, title_fr text NOT NULL, description_en text NOT NULL, description_fr text NOT NULL,
  UNIQUE (step_number));
CREATE TABLE subjects (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), name_en text NOT NULL UNIQUE, name_fr text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE catalogue_titles (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), title_en text NOT NULL, title_fr text NOT NULL,
  cover_image_id text, level text NOT NULL CHECK (level IN ('primary','secondary')), subject_id uuid REFERENCES subjects(id),
  languages jsonb NOT NULL DEFAULT '[]', description_en text NOT NULL, description_fr text NOT NULL,
  curriculum_alignment_en text, curriculum_alignment_fr text, slug text NOT NULL UNIQUE, featured boolean NOT NULL DEFAULT false,
  published boolean NOT NULL DEFAULT false, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE why_choose_us (id text PRIMARY KEY DEFAULT 'default', local_presence_copy_en text, local_presence_copy_fr text,
  quality_commitment_items jsonb NOT NULL DEFAULT '[]', updated_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE news_articles (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), headline_en text NOT NULL, headline_fr text NOT NULL,
  category text NOT NULL CHECK (category IN ('company_news','new_titles','partnerships','events')), publish_date timestamptz,
  hero_image_id text, body_en text NOT NULL, body_fr text NOT NULL, excerpt_en text NOT NULL, excerpt_fr text NOT NULL,
  slug text NOT NULL UNIQUE, published boolean NOT NULL DEFAULT false, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE contact_settings (id text PRIMARY KEY DEFAULT 'default', hero_copy_en text, hero_copy_fr text,
  project_type_options jsonb NOT NULL DEFAULT '[]', map_lat numeric, map_lng numeric, updated_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE legal_pages (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), page text NOT NULL UNIQUE CHECK (page IN ('privacy_policy','terms_of_use')),
  body_en text NOT NULL, body_fr text NOT NULL, updated_at timestamptz NOT NULL DEFAULT now());
CREATE INDEX catalogue_titles_public_idx ON catalogue_titles (published, slug);
CREATE INDEX news_articles_public_idx ON news_articles (published, publish_date DESC);
