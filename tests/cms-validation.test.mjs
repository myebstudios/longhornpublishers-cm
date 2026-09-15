import assert from 'node:assert/strict';
import test from 'node:test';
import { validateHomepage, validateSiteSettings } from '../netlify/functions/_shared/cms-validation.ts';

const site = {
  company_name_en: 'Longhorn Cameroon', company_name_fr: 'Longhorn Cameroun',
  tagline_en: 'English tagline', tagline_fr: 'Slogan français',
  address: 'Yaoundé', phone_1: '+237 1', phone_2: '', email: 'hello@example.com',
  social_links: [{ platform: 'LinkedIn', url: 'https://linkedin.com/company/longhorn' }],
  footer_tagline_en: 'Footer', footer_tagline_fr: 'Pied de page',
  newsletter_copy_en: 'Publishing insights', newsletter_copy_fr: 'Actualités éditoriales',
  parent_company_url: 'https://longhornpublishers.com', seo_default_title: 'Longhorn',
  seo_default_description: 'Publishing', og_image_id: null,
};

test('site settings normalize optional blanks and structured links', () => {
  const result = validateSiteSettings(site);
  assert.equal(result.ok, true);
  if (result.ok) {
    assert.equal(result.value.phone_2, null);
    assert.equal(result.value.social_links[0].platform, 'LinkedIn');
  }
});

test('site settings reject one-sided bilingual copy', () => {
  const result = validateSiteSettings({ ...site, tagline_fr: '' });
  assert.equal(result.ok, false);
  if (!result.ok) assert.match(result.error, /both English and French/);
});

const homepage = {
  hero_headline_en: 'Publishing from start to finish', hero_headline_fr: 'L’édition de bout en bout',
  hero_subheadline_en: 'English summary', hero_subheadline_fr: 'Résumé français',
  hero_image_id: null, hero_cta_label_en: 'Partner with us', hero_cta_label_fr: 'Devenir partenaire',
  who_we_are_copy_en: 'English copy', who_we_are_copy_fr: 'Texte français', who_we_are_image_id: null,
  trust_stats: [{ value: '60+', label_en: 'Years', label_fr: 'Années' }],
  one_partner_copy_en: 'One accountable partner', one_partner_copy_fr: 'Un partenaire responsable',
  featured_catalogue_ids: [],
};

test('homepage accepts complete bilingual content', () => {
  assert.equal(validateHomepage(homepage).ok, true);
});

test('homepage rejects incomplete trust-stat translations', () => {
  const result = validateHomepage({ ...homepage, trust_stats: [{ value: '60+', label_en: 'Years', label_fr: '' }] });
  assert.equal(result.ok, false);
  if (!result.ok) assert.match(result.error, /French label/);
});

test('homepage limits featured catalogue selection to four unique UUIDs', () => {
  const id = '123e4567-e89b-42d3-a456-426614174000';
  const result = validateHomepage({ ...homepage, featured_catalogue_ids: [id, id] });
  assert.equal(result.ok, false);
  if (!result.ok) assert.match(result.error, /unique UUIDs/);
});
