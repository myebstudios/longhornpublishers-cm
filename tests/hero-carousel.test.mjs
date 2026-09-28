import assert from 'node:assert/strict';
import test from 'node:test';
import { localizeCmsHref } from '../src/i18n/routes.ts';
import { canHeroAutoplay } from '../src/lib/hero-carousel.ts';

test('locale-neutral CMS paths resolve through the canonical bilingual route map', () => {
  assert.equal(localizeCmsHref('/contact', 'en'), '/en/contact/');
  assert.equal(localizeCmsHref('/contact', 'fr'), '/fr/contact/');
  assert.equal(localizeCmsHref('/services', 'en'), '/en/services/');
  assert.equal(localizeCmsHref('/services', 'fr'), '/fr/services-edition/');
  assert.equal(localizeCmsHref('/services?from=hero#editing', 'fr'), '/fr/services-edition/?from=hero#editing');
});

test('external, fragment, already-localized, and unknown CMS hrefs are preserved', () => {
  assert.equal(localizeCmsHref('https://longhornpublishers.com', 'fr'), 'https://longhornpublishers.com');
  assert.equal(localizeCmsHref('#catalogue', 'fr'), '#catalogue');
  assert.equal(localizeCmsHref('/fr/services-edition/', 'fr'), '/fr/services-edition/');
  assert.equal(localizeCmsHref('/documents/profile.pdf', 'fr'), '/documents/profile.pdf');
});

const playable = {
  multipleSlides: true,
  reducedMotion: false,
  manuallyStopped: false,
  hoverPaused: false,
  focusPaused: false,
  documentHidden: false,
};

test('autoplay requires multiple slides and stops under every pause gate', () => {
  assert.equal(canHeroAutoplay(playable), true);
  for (const key of ['reducedMotion', 'manuallyStopped', 'hoverPaused', 'focusPaused', 'documentHidden']) {
    assert.equal(canHeroAutoplay({ ...playable, [key]: true }), false, key);
  }
  assert.equal(canHeroAutoplay({ ...playable, multipleSlides: false }), false);
});

test('temporary hover and focus pauses do not mutate the permanent stop state', () => {
  const temporaryFocus = { ...playable, focusPaused: true };
  const temporaryHover = { ...playable, hoverPaused: true };
  assert.equal(temporaryFocus.manuallyStopped, false);
  assert.equal(temporaryHover.manuallyStopped, false);
  assert.equal(canHeroAutoplay({ ...temporaryFocus, focusPaused: false }), true);
  assert.equal(canHeroAutoplay({ ...temporaryHover, hoverPaused: false }), true);
});

test('the focusable carousel region has a visible focus ring and the dot group names its purpose', async () => {
  const { readFile } = await import('node:fs/promises');
  const source = await readFile(new URL('../src/components/HeroCarousel.astro', import.meta.url), 'utf8');
  // An outline on the region paints beneath its z-indexed slides, so the ring must be an overlay.
  assert.match(source, /\.hero-carousel:focus-visible::after\s*\{[^}]*z-index:\s*4;[^}]*border:\s*3px solid var\(--green\)/);
  assert.match(source, /class="hero-carousel__dots" role="group" aria-label=\{copy\.dots\}/);
  assert.match(source, /dots: 'Choose a slide'/);
  assert.match(source, /dots: 'Choisir une diapositive'/);
});
