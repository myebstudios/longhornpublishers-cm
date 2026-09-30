import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import {
  MAX_HOMEPAGE_HERO_SLIDES,
  validateHomepageHeroSlide,
  validateHomepageHeroSlidesState,
} from '../netlify/functions/_shared/cms-validation.ts';
import { localizeCmsHref, ROUTES } from '../src/i18n/routes.ts';
import {
  LAUNCH_SLIDES, LOCAL_IMAGE_KEYS, SUBHEADLINE_LIMIT, slidePayload,
} from '../scripts/hero-launch-set.mjs';

const enSlugs = new Set(Object.values(ROUTES).map((slugs) => slugs.en).filter(Boolean));

test('the launch set is four slides', () => {
  assert.equal(LAUNCH_SLIDES.length, 4);
});

test('every launch slide passes the server-side HERO-2 validator unchanged', () => {
  LAUNCH_SLIDES.forEach((slide, index) => {
    const payload = slidePayload(slide, slide.upload ? LOCAL_IMAGE_KEYS[index] : null);
    const result = validateHomepageHeroSlide(payload);
    assert.ok(result.ok, `slide ${index + 1}: ${result.ok ? '' : result.error}`);
    for (const [field, value] of Object.entries(payload)) {
      assert.deepEqual(result.value[field], value, `slide ${index + 1} ${field} was normalised`);
    }
  });
});

test('CTA hrefs are locale-neutral slugs that resolve to a real route in both locales', () => {
  for (const [index, slide] of LAUNCH_SLIDES.entries()) {
    for (const href of [slide.primary_cta_href, slide.secondary_cta_href].filter(Boolean)) {
      assert.match(href, /^\/[a-z-]+$/, `slide ${index + 1} href ${href} must be a neutral slug`);
      assert.ok(enSlugs.has(href.slice(1)), `slide ${index + 1} href ${href} is not a known route`);
      assert.notEqual(localizeCmsHref(href, 'fr'), href, `slide ${index + 1} href ${href} would not localise`);
    }
  }
});

test('subheadlines fit the §4 layout budget in both locales', () => {
  for (const [index, slide] of LAUNCH_SLIDES.entries()) {
    assert.ok(slide.subheadline_en.length <= SUBHEADLINE_LIMIT.en, `slide ${index + 1} EN is ${slide.subheadline_en.length} chars`);
    assert.ok(slide.subheadline_fr.length <= SUBHEADLINE_LIMIT.fr, `slide ${index + 1} FR is ${slide.subheadline_fr.length} chars`);
  }
});

test('each slide pairs with its CLIENT-5C image and an optimised upload master exists', () => {
  assert.deepEqual(LAUNCH_SLIDES.map((slide) => slide.image), [
    'lh-hero.jpg', 'client5-catalogue-v2.jpg', 'lh-print-inspection-wide.jpg', 'client5-loho-v2.jpg',
  ]);
  // Generated images must say so, and name their original.
  for (const slide of LAUNCH_SLIDES.filter((s) => s.image?.startsWith('client5-'))) {
    assert.match(slide.provenance ?? '', /AI-generated.*Assets\/hero-generated\//);
  }
  for (const slide of LAUNCH_SLIDES.filter((s) => s.upload)) {
    assert.ok(fs.existsSync(new URL(`../Assets/hero-launch/${slide.upload}`, import.meta.url)), `${slide.upload} is missing`);
  }
});

test('the swap fits the saved-slide cap: one retained rollback slide plus the launch set', () => {
  assert.ok(1 + LAUNCH_SLIDES.length <= MAX_HOMEPAGE_HERO_SLIDES);
  // Placeholders must be deleted first: three existing rows plus four new ones exceed the cap.
  assert.ok(3 + LAUNCH_SLIDES.length > MAX_HOMEPAGE_HERO_SLIDES);
  const created = LAUNCH_SLIDES.map(() => ({ enabled: false }));
  assert.ok(validateHomepageHeroSlidesState([{ enabled: true }, ...created], true).ok);
});

test('no slide claims booklist status, approval, or LoHo availability', () => {
  const text = LAUNCH_SLIDES.flatMap((slide) => Object.values(slide)).filter((v) => typeof v === 'string').join('\n');
  assert.doesNotMatch(text, /book list|liste officielle|approved|agréé|accredit|accrédit|curriculum|programmes nationaux|preorder|précommande|early access|available now|assessment|kenya|congo|central africa|afrique centrale/i);
  const loho = LAUNCH_SLIDES[3];
  assert.match(`${loho.eyebrow_en} ${loho.headline_accent_en}`, /coming soon/i);
  assert.match(`${loho.eyebrow_fr} ${loho.headline_accent_fr}`, /bientôt disponible/i);
});
