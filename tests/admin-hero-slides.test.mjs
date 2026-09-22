import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { fieldsForHeroSlideError, validateHeroSlideDraft } from '../src/lib/admin-hero-slides.ts';

const complete = {
  eyebrow_en: '', eyebrow_fr: '',
  headline_en: 'Publishing services', headline_fr: 'Services d’édition',
  headline_accent_en: '', headline_accent_fr: '',
  subheadline_en: 'English summary', subheadline_fr: 'Résumé français',
  primary_cta_label_en: 'Contact us', primary_cta_label_fr: 'Nous contacter',
  primary_cta_href: '/contact',
  secondary_cta_label_en: '', secondary_cta_label_fr: '', secondary_cta_href: '',
  enabled: true,
};

test('complete bilingual slide passes client validation', () => {
  assert.deepStrictEqual(validateHeroSlideDraft(complete), {});
});

test('missing translations are attached to the missing locale field', () => {
  const errors = validateHeroSlideDraft({ ...complete, headline_fr: '', eyebrow_en: 'Our work' });
  assert.match(errors.headline_fr, /French/);
  assert.match(errors.eyebrow_fr, /French/);
  assert.equal(errors.headline_en, undefined);
});

test('CTA labels and hrefs must be complete and safe', () => {
  assert.match(validateHeroSlideDraft({ ...complete, primary_cta_href: '' }).primary_cta_href, /needs a link/);
  assert.match(validateHeroSlideDraft({ ...complete, primary_cta_href: 'javascript:alert(1)' }).primary_cta_href, /site path/);
  const labelsOnly = validateHeroSlideDraft({
    ...complete,
    secondary_cta_label_en: 'Services', secondary_cta_label_fr: 'Services', secondary_cta_href: '',
  });
  assert.match(labelsOnly.secondary_cta_href, /needs a link/);
  const hrefOnly = validateHeroSlideDraft({ ...complete, secondary_cta_href: '/services' });
  assert.match(hrefOnly.secondary_cta_label_en, /both CTA labels/);
  assert.match(hrefOnly.secondary_cta_label_fr, /both CTA labels/);
});

test('server validation messages map back to editable fields', () => {
  assert.deepStrictEqual(fieldsForHeroSlideError('Hero slide headline (French) is required.'), ['headline_en', 'headline_fr']);
  assert.deepStrictEqual(fieldsForHeroSlideError('Primary CTA label and href must be provided together.'), ['primary_cta_label_en', 'primary_cta_label_fr', 'primary_cta_href']);
  assert.deepStrictEqual(fieldsForHeroSlideError('Unknown failure'), []);
});

test('homepage admin exposes the complete carousel editing contract', async () => {
  const page = await readFile(new URL('../src/pages/admin/homepage.astro', import.meta.url), 'utf8');
  for (const field of [
    'eyebrow_en', 'eyebrow_fr', 'headline_en', 'headline_fr',
    'headline_accent_en', 'headline_accent_fr', 'subheadline_en', 'subheadline_fr',
    'primary_cta_label_en', 'primary_cta_label_fr', 'primary_cta_href',
    'secondary_cta_label_en', 'secondary_cta_label_fr', 'secondary_cta_href', 'enabled',
  ]) {
    assert.match(page, new RegExp(`data-field="${field}"`), field);
  }
  for (const action of ['data-save-slide', 'data-move-up', 'data-move-down', 'data-delete-slide', 'data-slide-file']) {
    assert.match(page, new RegExp(action));
  }
  assert.strictEqual((page.match(/name="hero_autoplay_enabled"/g) ?? []).length, 1);
  assert.strictEqual((page.match(/name="hero_autoplay_interval"/g) ?? []).length, 1);
  assert.match(page, /confirmAction\(`Delete/);
  assert.match(page, /MAX_SLIDES = 5/);
  assert.match(page, /id="addSlide" aria-describedby="heroSlideLimit"/);
  assert.match(page, /id="heroSlideLimit">Maximum: five saved slides\. To add another at the limit, delete an existing slide\./);
  assert.match(page, /addSlideButton\.setAttribute\('aria-disabled', String\(atSlideCap\)\)/);
  assert.doesNotMatch(page, /addSlideButton\.disabled/);
  assert.doesNotMatch(page, /addSlideButton\.title/);
});
