const MAX_TEXT = 10_000;
const MEDIA_KEY = /^uploads\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(jpeg|png|webp)$/;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type Valid<T> = { ok: true; value: T };
type Invalid = { ok: false; error: string };
export type Validation<T> = Valid<T> | Invalid;

function text(value: unknown, label: string, required = false, max = MAX_TEXT): Validation<string | null> {
  if (value === undefined || value === null) {
    return required ? { ok: false, error: `${label} is required.` } : { ok: true, value: null };
  }
  if (typeof value !== 'string') return { ok: false, error: `${label} must be text.` };
  const cleaned = value.trim();
  if (required && !cleaned) return { ok: false, error: `${label} is required.` };
  if (cleaned.length > max) return { ok: false, error: `${label} must be ${max} characters or fewer.` };
  return { ok: true, value: cleaned || null };
}

function pair(
  body: Record<string, unknown>,
  stem: string,
  label: string,
  required = false,
  max = MAX_TEXT,
): Validation<{ en: string | null; fr: string | null }> {
  const en = text(body[`${stem}_en`], `${label} (English)`, required, max);
  if (!en.ok) return en;
  const fr = text(body[`${stem}_fr`], `${label} (French)`, required, max);
  if (!fr.ok) return fr;
  if (!required && Boolean(en.value) !== Boolean(fr.value)) {
    return { ok: false, error: `${label} must be provided in both English and French, or left blank in both.` };
  }
  return { ok: true, value: { en: en.value, fr: fr.value } };
}

function url(value: unknown, label: string): Validation<string | null> {
  const result = text(value, label, false, 2_000);
  if (!result.ok || !result.value) return result;
  try {
    const parsed = new URL(result.value);
    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') throw new Error('protocol');
    return result;
  } catch {
    return { ok: false, error: `${label} must be a valid http(s) URL.` };
  }
}

function mediaKey(value: unknown, label: string): Validation<string | null> {
  const result = text(value, label, false, 200);
  if (!result.ok || !result.value) return result;
  return MEDIA_KEY.test(result.value)
    ? result
    : { ok: false, error: `${label} must be an uploaded media key.` };
}

export interface SiteSettingsInput {
  company_name_en: string;
  company_name_fr: string;
  tagline_en: string | null;
  tagline_fr: string | null;
  address: string | null;
  phone_1: string | null;
  phone_2: string | null;
  email: string | null;
  social_links: Array<{ platform: string; url: string }>;
  footer_tagline_en: string | null;
  footer_tagline_fr: string | null;
  newsletter_copy_en: string | null;
  newsletter_copy_fr: string | null;
  parent_company_url: string | null;
  seo_default_title: string | null;
  seo_default_description: string | null;
  og_image_id: string | null;
}

export function validateSiteSettings(value: unknown): Validation<SiteSettingsInput> {
  if (!value || typeof value !== 'object') return { ok: false, error: 'Site settings payload is required.' };
  const body = value as Record<string, unknown>;
  const company = pair(body, 'company_name', 'Company name', true, 160);
  if (!company.ok) return company;
  const tagline = pair(body, 'tagline', 'Tagline', false, 500);
  if (!tagline.ok) return tagline;
  const footer = pair(body, 'footer_tagline', 'Footer tagline', false, 1_000);
  if (!footer.ok) return footer;
  const newsletter = pair(body, 'newsletter_copy', 'Newsletter copy', false, 300);
  if (!newsletter.ok) return newsletter;

  const address = text(body.address, 'Address', false, 500); if (!address.ok) return address;
  const phone1 = text(body.phone_1, 'Primary phone', false, 80); if (!phone1.ok) return phone1;
  const phone2 = text(body.phone_2, 'Secondary phone', false, 80); if (!phone2.ok) return phone2;
  const email = text(body.email, 'Email', false, 320); if (!email.ok) return email;
  if (email.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
    return { ok: false, error: 'Email must be a valid address.' };
  }
  const parent = url(body.parent_company_url, 'Parent company URL'); if (!parent.ok) return parent;
  const seoTitle = text(body.seo_default_title, 'Default SEO title', false, 160); if (!seoTitle.ok) return seoTitle;
  const seoDescription = text(body.seo_default_description, 'Default SEO description', false, 320); if (!seoDescription.ok) return seoDescription;
  const ogImage = mediaKey(body.og_image_id, 'Open Graph image'); if (!ogImage.ok) return ogImage;

  if (!Array.isArray(body.social_links) || body.social_links.length > 10) {
    return { ok: false, error: 'Social links must be a list of 10 items or fewer.' };
  }
  const socialLinks: Array<{ platform: string; url: string }> = [];
  for (const [index, item] of body.social_links.entries()) {
    if (!item || typeof item !== 'object') return { ok: false, error: `Social link ${index + 1} is invalid.` };
    const row = item as Record<string, unknown>;
    const platform = text(row.platform, `Social link ${index + 1} platform`, true, 60); if (!platform.ok) return platform;
    const href = url(row.url, `Social link ${index + 1} URL`); if (!href.ok || !href.value) return href.ok ? { ok: false, error: `Social link ${index + 1} URL is required.` } : href;
    socialLinks.push({ platform: platform.value!, url: href.value });
  }

  return { ok: true, value: {
    company_name_en: company.value.en!, company_name_fr: company.value.fr!,
    tagline_en: tagline.value.en, tagline_fr: tagline.value.fr,
    address: address.value, phone_1: phone1.value, phone_2: phone2.value, email: email.value,
    social_links: socialLinks,
    footer_tagline_en: footer.value.en, footer_tagline_fr: footer.value.fr,
    newsletter_copy_en: newsletter.value.en, newsletter_copy_fr: newsletter.value.fr,
    parent_company_url: parent.value,
    seo_default_title: seoTitle.value, seo_default_description: seoDescription.value,
    og_image_id: ogImage.value,
  } };
}

export interface HomepageInput {
  hero_headline_en: string;
  hero_headline_fr: string;
  hero_subheadline_en: string;
  hero_subheadline_fr: string;
  hero_image_id: string | null;
  hero_cta_label_en: string;
  hero_cta_label_fr: string;
  who_we_are_copy_en: string;
  who_we_are_copy_fr: string;
  who_we_are_image_id: string | null;
  trust_stats: Array<{ value: string; label_en: string; label_fr: string }>;
  one_partner_copy_en: string;
  one_partner_copy_fr: string;
  featured_catalogue_ids: string[];
}

export function validateHomepage(value: unknown): Validation<HomepageInput> {
  if (!value || typeof value !== 'object') return { ok: false, error: 'Homepage payload is required.' };
  const body = value as Record<string, unknown>;
  const heroHeadline = pair(body, 'hero_headline', 'Hero headline', true, 300); if (!heroHeadline.ok) return heroHeadline;
  const heroSubheadline = pair(body, 'hero_subheadline', 'Hero subheadline', true, 1_000); if (!heroSubheadline.ok) return heroSubheadline;
  const heroCta = pair(body, 'hero_cta_label', 'Hero CTA label', true, 100); if (!heroCta.ok) return heroCta;
  const who = pair(body, 'who_we_are_copy', 'Who we are copy', true, 5_000); if (!who.ok) return who;
  const partner = pair(body, 'one_partner_copy', 'One partner copy', true, 2_000); if (!partner.ok) return partner;
  const heroImage = mediaKey(body.hero_image_id, 'Hero image'); if (!heroImage.ok) return heroImage;
  const whoImage = mediaKey(body.who_we_are_image_id, 'Who we are image'); if (!whoImage.ok) return whoImage;

  if (!Array.isArray(body.trust_stats) || body.trust_stats.length < 1 || body.trust_stats.length > 8) {
    return { ok: false, error: 'Trust stats must contain between 1 and 8 items.' };
  }
  const trustStats: HomepageInput['trust_stats'] = [];
  for (const [index, item] of body.trust_stats.entries()) {
    if (!item || typeof item !== 'object') return { ok: false, error: `Trust stat ${index + 1} is invalid.` };
    const row = item as Record<string, unknown>;
    const statValue = text(row.value, `Trust stat ${index + 1} value`, true, 40); if (!statValue.ok) return statValue;
    const labelEn = text(row.label_en, `Trust stat ${index + 1} English label`, true, 160); if (!labelEn.ok) return labelEn;
    const labelFr = text(row.label_fr, `Trust stat ${index + 1} French label`, true, 160); if (!labelFr.ok) return labelFr;
    trustStats.push({ value: statValue.value!, label_en: labelEn.value!, label_fr: labelFr.value! });
  }

  if (!Array.isArray(body.featured_catalogue_ids) || body.featured_catalogue_ids.length > 4) {
    return { ok: false, error: 'Select no more than four featured catalogue titles.' };
  }
  const featuredIds = body.featured_catalogue_ids.map(String);
  if (featuredIds.some((id) => !UUID.test(id)) || new Set(featuredIds).size !== featuredIds.length) {
    return { ok: false, error: 'Featured catalogue title IDs must be unique UUIDs.' };
  }

  return { ok: true, value: {
    hero_headline_en: heroHeadline.value.en!, hero_headline_fr: heroHeadline.value.fr!,
    hero_subheadline_en: heroSubheadline.value.en!, hero_subheadline_fr: heroSubheadline.value.fr!,
    hero_image_id: heroImage.value,
    hero_cta_label_en: heroCta.value.en!, hero_cta_label_fr: heroCta.value.fr!,
    who_we_are_copy_en: who.value.en!, who_we_are_copy_fr: who.value.fr!,
    who_we_are_image_id: whoImage.value,
    trust_stats: trustStats,
    one_partner_copy_en: partner.value.en!, one_partner_copy_fr: partner.value.fr!,
    featured_catalogue_ids: featuredIds,
  } };
}
