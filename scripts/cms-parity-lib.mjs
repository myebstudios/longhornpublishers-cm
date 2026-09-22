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
  const withoutHero = `${html.slice(0, start)}<!-- homepage hero compared separately -->${afterHero}`;
  return withoutHero.replace(/ data-homepage-content-source="(?:cms|fallback)"/g, '');
}

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
  const actual = {
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
  return Object.entries(expected)
    .filter(([field, value]) => actual[field] !== value)
    .map(([field, value]) => ({ field, expected: value, actual: actual[field] }));
}

export function assertCmsHomepageEvidence(route, html, slideId) {
  if (!html.includes('data-homepage-content-source="cms"')) {
    throw new Error(`${route} did not render a homepage_content database row.`);
  }
  if (!html.includes(`data-hero-slide-id="${slideId}"`)) {
    throw new Error(`${route} did not render the database-backed slide 1.`);
  }
}
