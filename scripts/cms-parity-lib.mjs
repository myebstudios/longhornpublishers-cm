import { LAUNCH_SLIDES, slidePayload } from './hero-launch-set.mjs';

const HOME_ROUTES = new Set(['en/index.html', 'fr/index.html']);

const nullable = (value) => value === null || value === undefined ? null : String(value);
const labelOr = (value, fallback) => nullable(value)?.trim() ? String(value) : fallback;

/**
 * The carousel intentionally differs from the legacy fallback hero. Remove
 * only that region; every byte after it (including the trust strip) remains
 * under the original strict parity guard.
 */
export function normalizePublicRoute(route, html) {
  if (!HOME_ROUTES.has(route)) return html;
  const start = html.search(/<section class="hero(?:-carousel)?(?:\s|")/);
  if (start < 0) throw new Error(`${route} has no recognizable homepage hero region.`);
  const close = html.indexOf('</section>', start);
  if (close < 0) throw new Error(`${route} has an unclosed homepage hero region.`);
  let afterHero = html.slice(close + 10);
  // Astro emits the carousel's inline enhancement script immediately after
  // its component. It belongs to the intentionally different hero region too.
  if (afterHero.startsWith('<script type="module">')) {
    const scriptClose = afterHero.indexOf('</script>');
    const script = scriptClose < 0 ? '' : afterHero.slice(0, scriptClose + 9);
    if (script.includes('data-hero-carousel')) afterHero = afterHero.slice(scriptClose + 9);
  }
  // The LCP preload in <head> follows slide 1's image, so it belongs to the hero
  // too: after the CLIENT-5B swap it points at an upload, not /img/lh-hero.jpg.
  const head = html.slice(0, start)
    .replace(/<link rel="preload" as="image" href="[^"]*"(?: imagesrcset="[^"]*")?(?: imagesizes="[^"]*")? fetchpriority="high">/, '<!-- hero preload compared separately -->');
  const withoutHero = `${head}<!-- homepage hero compared separately -->${afterHero}`;
  return withoutHero.replace(/ data-homepage-content-source="(?:cms|fallback)"/g, '');
}

/** Normalise a slide row so text fields compare as strings or null. */
function normalizeSlide(slide) {
  return {
    ...slide,
    sort_order: Number(slide.sort_order),
    image_id: nullable(slide.image_id),
    eyebrow_en: nullable(slide.eyebrow_en),
    eyebrow_fr: nullable(slide.eyebrow_fr),
    headline_en: nullable(slide.headline_en),
    headline_fr: nullable(slide.headline_fr),
    headline_accent_en: nullable(slide.headline_accent_en),
    headline_accent_fr: nullable(slide.headline_accent_fr),
    subheadline_en: nullable(slide.subheadline_en),
    subheadline_fr: nullable(slide.subheadline_fr),
    primary_cta_label_en: nullable(slide.primary_cta_label_en),
    primary_cta_label_fr: nullable(slide.primary_cta_label_fr),
    primary_cta_href: nullable(slide.primary_cta_href),
    secondary_cta_label_en: nullable(slide.secondary_cta_label_en),
    secondary_cta_label_fr: nullable(slide.secondary_cta_label_fr),
    secondary_cta_href: nullable(slide.secondary_cta_href),
    enabled: slide.enabled === true,
  };
}

const diff = (expected, actual) => Object.entries(expected)
  .filter(([field, value]) => actual[field] !== value)
  .map(([field, value]) => ({ field, expected: value, actual: actual[field] }));

/** Compare the rollback-critical legacy hero row with migration 010's slide 1. */
export function backfilledHeroMismatches(homepage, slide) {
  const expected = {
    homepage_id: String(homepage.id),
    sort_order: 0,
    image_id: nullable(homepage.hero_image_id),
    eyebrow_en: nullable(homepage.hero_eyebrow_en),
    eyebrow_fr: nullable(homepage.hero_eyebrow_fr),
    headline_en: nullable(homepage.hero_headline_en),
    headline_fr: nullable(homepage.hero_headline_fr),
    headline_accent_en: nullable(homepage.hero_headline_accent_en),
    headline_accent_fr: nullable(homepage.hero_headline_accent_fr),
    subheadline_en: nullable(homepage.hero_subheadline_en),
    subheadline_fr: nullable(homepage.hero_subheadline_fr),
    primary_cta_label_en: labelOr(homepage.hero_cta_label_en, 'Partner With Us'),
    primary_cta_label_fr: labelOr(homepage.hero_cta_label_fr, 'Devenir partenaire'),
    primary_cta_href: '/contact',
    secondary_cta_label_en: 'Explore our services',
    secondary_cta_label_fr: 'Découvrir nos services',
    secondary_cta_href: '/services',
    enabled: true,
  };
  return diff(expected, normalizeSlide(slide));
}

/**
 * Compare the first rendered slide with approved launch slide 1
 * (scripts/hero-launch-set.mjs). Every copy and CTA field must match exactly.
 * The image key is assigned at upload, so it only has to be present.
 */
export function launchSlideMismatches(slide, approved = LAUNCH_SLIDES[0]) {
  const { image_id: _image, ...expected } = slidePayload(approved, null);
  const actual = normalizeSlide(slide);
  const mismatches = diff(expected, actual);
  if (!actual.image_id) mismatches.push({ field: 'image_id', expected: 'an uploaded image', actual: null });
  return mismatches;
}

/**
 * The first enabled slide is what visitors see as slide 1. Before the CLIENT-5B
 * swap it is the backfilled legacy hero; after it, approved launch slide 1.
 * It must match one of them exactly. Otherwise the closer contract's
 * differences are reported, so real copy drift still fails.
 */
export function firstSlideContract(homepage, slide) {
  const legacy = backfilledHeroMismatches(homepage, slide);
  if (!legacy.length) return { contract: 'legacy hero', mismatches: [] };
  const launch = launchSlideMismatches(slide);
  if (!launch.length) return { contract: 'approved launch slide 1', mismatches: [] };
  return launch.length < legacy.length
    ? { contract: 'approved launch slide 1', mismatches: launch }
    : { contract: 'legacy hero', mismatches: legacy };
}

export function assertCmsHomepageEvidence(route, html, slideId) {
  if (!html.includes('data-homepage-content-source="cms"')) {
    throw new Error(`${route} did not render a homepage_content database row.`);
  }
  if (!html.includes(`data-hero-slide-id="${slideId}"`)) {
    throw new Error(`${route} did not render the database-backed slide 1.`);
  }
}
