import assert from 'node:assert/strict';
import test from 'node:test';
import { validateAbout, validateHomepage, validateProcessStep, validateService, validateSiteSettings, validateWhy } from '../netlify/functions/_shared/cms-validation.ts';

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

const about = {
  heritage_copy_en: 'English heritage', heritage_copy_fr: 'Héritage français',
  purpose_en: 'Purpose', purpose_fr: 'Raison d’être', vision_en: 'Vision', vision_fr: 'Vision',
  mission_en: 'Mission', mission_fr: 'Mission', values_en: 'Values', values_fr: 'Valeurs',
  team_capacity_blocks: [{ title: 'Editorial', icon: 'pen', description_en: 'English description', description_fr: 'Description française' }],
};

test('about page accepts complete bilingual singleton content', () => {
  assert.equal(validateAbout(about).ok, true);
});

test('about page rejects incomplete team block translations', () => {
  const result = validateAbout({ ...about, team_capacity_blocks: [{ ...about.team_capacity_blocks[0], description_fr: '' }] });
  assert.equal(result.ok, false);
  if (!result.ok) assert.match(result.error, /French description/);
});

const why = {
  local_presence_copy_en: 'Local presence', local_presence_copy_fr: 'Présence locale',
  quality_commitment_items: [{ icon: 'check', title_en: 'Quality', title_fr: 'Qualité', description_en: 'English description', description_fr: 'Description française' }],
};

test('why choose us accepts bilingual quality commitments', () => {
  assert.equal(validateWhy(why).ok, true);
});

test('why choose us rejects one-sided local presence copy', () => {
  const result = validateWhy({ ...why, local_presence_copy_fr: '' });
  assert.equal(result.ok, false);
  if (!result.ok) assert.match(result.error, /French/);
});

test('publishing service validates bilingual content and publish state', () => {
  const result = validateService({ name_en: 'Editing', name_fr: 'Révision', category: 'editorial', description_en: 'English', description_fr: 'Français', icon: 'pen', sort_order: 0, published: true });
  assert.equal(result.ok, true);
  if (result.ok) assert.equal(result.value.published, true);
});

test('publishing service rejects unsupported categories', () => {
  const result = validateService({ name_en: 'Editing', name_fr: 'Révision', category: 'other', description_en: 'English', description_fr: 'Français', sort_order: 0 });
  assert.equal(result.ok, false);
  if (!result.ok) assert.match(result.error, /category/);
});

test('process step requires a positive integer order and bilingual copy', () => {
  assert.equal(validateProcessStep({ step_number: 1, title_en: 'Plan', title_fr: 'Planifier', description_en: 'English', description_fr: 'Français' }).ok, true);
  assert.equal(validateProcessStep({ step_number: 0, title_en: 'Plan', title_fr: 'Planifier', description_en: 'English', description_fr: 'Français' }).ok, false);
});
