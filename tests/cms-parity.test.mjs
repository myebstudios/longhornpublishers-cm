import assert from 'node:assert/strict';
import test from 'node:test';
import {
  assertCmsHomepageEvidence,
  backfilledHeroMismatches,
  normalizePublicRoute,
} from '../scripts/cms-parity-lib.mjs';

const homepage = {
  id: 'default', hero_image_id: null, hero_eyebrow_en: null, hero_eyebrow_fr: null,
  hero_headline_en: 'Approved EN', hero_headline_fr: 'Texte approuvé',
  hero_headline_accent_en: 'accent', hero_headline_accent_fr: 'accent fr',
  hero_subheadline_en: 'Summary', hero_subheadline_fr: 'Résumé',
  hero_cta_label_en: null, hero_cta_label_fr: '  ',
};
const slide = {
  homepage_id: 'default', sort_order: 0, image_id: null, eyebrow_en: null, eyebrow_fr: null,
  headline_en: 'Approved EN', headline_fr: 'Texte approuvé',
  headline_accent_en: 'accent', headline_accent_fr: 'accent fr',
  subheadline_en: 'Summary', subheadline_fr: 'Résumé',
  primary_cta_label_en: 'Partner With Us', primary_cta_label_fr: 'Devenir partenaire',
  primary_cta_href: '/contact', secondary_cta_label_en: 'Explore our services',
  secondary_cta_label_fr: 'Découvrir nos services', secondary_cta_href: '/services', enabled: true,
};

test('homepage parity removes only the intentionally different hero region', () => {
  const cms = '<main><section class="hero-carousel hero-carousel--single">five slides</section><script type="module">init("data-hero-carousel")</script><section class="trust-bar" data-homepage-content-source="cms">Approved trust</section></main>';
  const fallback = '<main><section class="hero">legacy hero</section><section class="trust-bar" data-homepage-content-source="fallback">Approved trust</section></main>';
  assert.equal(normalizePublicRoute('en/index.html', cms), normalizePublicRoute('en/index.html', fallback));
  assert.notEqual(
    normalizePublicRoute('en/index.html', cms.replace('Approved trust', 'Drifted trust')),
    normalizePublicRoute('en/index.html', fallback),
  );
  assert.equal(normalizePublicRoute('en/about/index.html', '<p>strict</p>'), '<p>strict</p>');
});

test('slide 1 must preserve every legacy field and both CTA contracts', () => {
  assert.deepStrictEqual(backfilledHeroMismatches(homepage, slide), []);
  const broken = { ...slide, secondary_cta_label_fr: null, headline_en: 'Drifted' };
  assert.deepStrictEqual(backfilledHeroMismatches(homepage, broken).map(({ field }) => field), [
    'headline_en', 'secondary_cta_label_fr',
  ]);
});

test('CMS evidence requires a returned homepage row and the database slide id', () => {
  const html = '<section data-homepage-content-source="cms"><article data-hero-slide-id="slide-1"></article></section>';
  assert.doesNotThrow(() => assertCmsHomepageEvidence('en/index.html', html, 'slide-1'));
  assert.throws(() => assertCmsHomepageEvidence('en/index.html', html.replace('cms', 'fallback'), 'slide-1'), /homepage_content/);
  assert.throws(() => assertCmsHomepageEvidence('en/index.html', html, 'slide-2'), /slide 1/);
});
