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
  published: boolean;
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
    published: body.published === true,
  } };
}

export interface AboutInput {
  heritage_copy_en: string;
  heritage_copy_fr: string;
  purpose_en: string;
  purpose_fr: string;
  vision_en: string;
  vision_fr: string;
  mission_en: string;
  mission_fr: string;
  values_en: string;
  values_fr: string;
  team_capacity_blocks: Array<{ title: string; icon: string | null; description_en: string; description_fr: string }>;
  published: boolean;
}

export function validateAbout(value: unknown): Validation<AboutInput> {
  if (!value || typeof value !== 'object') return { ok: false, error: 'About page payload is required.' };
  const body = value as Record<string, unknown>;
  const heritage = pair(body, 'heritage_copy', 'Heritage copy', true, 8_000); if (!heritage.ok) return heritage;
  const purpose = pair(body, 'purpose', 'Purpose', true, 3_000); if (!purpose.ok) return purpose;
  const vision = pair(body, 'vision', 'Vision', true, 3_000); if (!vision.ok) return vision;
  const mission = pair(body, 'mission', 'Mission', true, 3_000); if (!mission.ok) return mission;
  const values = pair(body, 'values', 'Values', true, 3_000); if (!values.ok) return values;
  if (!Array.isArray(body.team_capacity_blocks) || body.team_capacity_blocks.length > 12) {
    return { ok: false, error: 'Team capacity blocks must be a list of 12 items or fewer.' };
  }
  const blocks: AboutInput['team_capacity_blocks'] = [];
  for (const [index, item] of body.team_capacity_blocks.entries()) {
    if (!item || typeof item !== 'object') return { ok: false, error: `Team capacity block ${index + 1} is invalid.` };
    const row = item as Record<string, unknown>;
    const title = text(row.title, `Team capacity block ${index + 1} title`, true, 160); if (!title.ok) return title;
    const icon = text(row.icon, `Team capacity block ${index + 1} icon`, false, 60); if (!icon.ok) return icon;
    const en = text(row.description_en, `Team capacity block ${index + 1} English description`, true, 2_000); if (!en.ok) return en;
    const fr = text(row.description_fr, `Team capacity block ${index + 1} French description`, true, 2_000); if (!fr.ok) return fr;
    blocks.push({ title: title.value!, icon: icon.value, description_en: en.value!, description_fr: fr.value! });
  }
  return { ok: true, value: {
    heritage_copy_en: heritage.value.en!, heritage_copy_fr: heritage.value.fr!,
    purpose_en: purpose.value.en!, purpose_fr: purpose.value.fr!,
    vision_en: vision.value.en!, vision_fr: vision.value.fr!,
    mission_en: mission.value.en!, mission_fr: mission.value.fr!,
    values_en: values.value.en!, values_fr: values.value.fr!,
    team_capacity_blocks: blocks,
    published: body.published === true,
  } };
}

export interface WhyInput {
  local_presence_copy_en: string;
  local_presence_copy_fr: string;
  quality_commitment_items: Array<{
    icon: string | null;
    title_en: string;
    title_fr: string;
    description_en: string;
    description_fr: string;
  }>;
  published: boolean;
}

export function validateWhy(value: unknown): Validation<WhyInput> {
  if (!value || typeof value !== 'object') return { ok: false, error: 'Why Choose Us payload is required.' };
  const body = value as Record<string, unknown>;
  const local = pair(body, 'local_presence_copy', 'Local presence copy', true, 8_000); if (!local.ok) return local;
  if (!Array.isArray(body.quality_commitment_items) || body.quality_commitment_items.length > 12) {
    return { ok: false, error: 'Quality commitment items must be a list of 12 items or fewer.' };
  }
  const items: WhyInput['quality_commitment_items'] = [];
  for (const [index, item] of body.quality_commitment_items.entries()) {
    if (!item || typeof item !== 'object') return { ok: false, error: `Quality commitment item ${index + 1} is invalid.` };
    const row = item as Record<string, unknown>;
    const icon = text(row.icon, `Quality commitment item ${index + 1} icon`, false, 60); if (!icon.ok) return icon;
    const titleEn = text(row.title_en, `Quality commitment item ${index + 1} English title`, true, 160); if (!titleEn.ok) return titleEn;
    const titleFr = text(row.title_fr, `Quality commitment item ${index + 1} French title`, true, 160); if (!titleFr.ok) return titleFr;
    const descriptionEn = text(row.description_en, `Quality commitment item ${index + 1} English description`, true, 2_000); if (!descriptionEn.ok) return descriptionEn;
    const descriptionFr = text(row.description_fr, `Quality commitment item ${index + 1} French description`, true, 2_000); if (!descriptionFr.ok) return descriptionFr;
    items.push({ icon: icon.value, title_en: titleEn.value!, title_fr: titleFr.value!, description_en: descriptionEn.value!, description_fr: descriptionFr.value! });
  }
  return { ok: true, value: {
    local_presence_copy_en: local.value.en!, local_presence_copy_fr: local.value.fr!,
    quality_commitment_items: items,
    published: body.published === true,
  } };
}

export interface ServiceInput {
  name_en: string;
  name_fr: string;
  category: 'editorial' | 'creative' | 'production';
  description_en: string;
  description_fr: string;
  icon: string | null;
  sort_order: number;
  published: boolean;
}

export function validateService(value: unknown): Validation<ServiceInput> {
  if (!value || typeof value !== 'object') return { ok: false, error: 'Service payload is required.' };
  const body = value as Record<string, unknown>;
  const name = pair(body, 'name', 'Service name', true, 160); if (!name.ok) return name;
  const description = pair(body, 'description', 'Service description', true, 8_000); if (!description.ok) return description;
  if (!['editorial', 'creative', 'production'].includes(String(body.category))) {
    return { ok: false, error: 'Service category must be editorial, creative, or production.' };
  }
  const icon = text(body.icon, 'Service icon', false, 60); if (!icon.ok) return icon;
  const sortOrder = Number(body.sort_order);
  if (!Number.isInteger(sortOrder) || sortOrder < 0 || sortOrder > 10_000) {
    return { ok: false, error: 'Service sort order must be an integer from 0 to 10000.' };
  }
  return { ok: true, value: {
    name_en: name.value.en!, name_fr: name.value.fr!, category: body.category as ServiceInput['category'],
    description_en: description.value.en!, description_fr: description.value.fr!, icon: icon.value,
    sort_order: sortOrder, published: body.published === true,
  } };
}

export interface ProcessStepInput {
  step_number: number;
  title_en: string;
  title_fr: string;
  description_en: string;
  description_fr: string;
  published: boolean;
}

export function validateProcessStep(value: unknown): Validation<ProcessStepInput> {
  if (!value || typeof value !== 'object') return { ok: false, error: 'Process step payload is required.' };
  const body = value as Record<string, unknown>;
  const title = pair(body, 'title', 'Process step title', true, 160); if (!title.ok) return title;
  const description = pair(body, 'description', 'Process step description', true, 4_000); if (!description.ok) return description;
  const stepNumber = Number(body.step_number);
  if (!Number.isInteger(stepNumber) || stepNumber < 1 || stepNumber > 1_000) {
    return { ok: false, error: 'Step number must be an integer from 1 to 1000.' };
  }
  return { ok: true, value: {
    step_number: stepNumber, title_en: title.value.en!, title_fr: title.value.fr!,
    description_en: description.value.en!, description_fr: description.value.fr!,
    published: body.published === true,
  } };
}

export interface ContactInput {
  hero_copy_en: string;
  hero_copy_fr: string;
  project_type_options: Array<{ label_en: string; label_fr: string }>;
  map_lat: number | null;
  map_lng: number | null;
  published: boolean;
}

export function validateContact(value: unknown): Validation<ContactInput> {
  if (!value || typeof value !== 'object') return { ok: false, error: 'Contact settings payload is required.' };
  const body = value as Record<string, unknown>;
  const hero = pair(body, 'hero_copy', 'Hero copy', true, 2_000); if (!hero.ok) return hero;
  if (!Array.isArray(body.project_type_options) || body.project_type_options.length > 30) {
    return { ok: false, error: 'Project type options must be a list of 30 items or fewer.' };
  }
  const options: ContactInput['project_type_options'] = [];
  for (const [index, item] of body.project_type_options.entries()) {
    if (!item || typeof item !== 'object') return { ok: false, error: `Project type option ${index + 1} is invalid.` };
    const row = item as Record<string, unknown>;
    const en = text(row.label_en, `Project type option ${index + 1} English label`, true, 160); if (!en.ok) return en;
    const fr = text(row.label_fr, `Project type option ${index + 1} French label`, true, 160); if (!fr.ok) return fr;
    options.push({ label_en: en.value!, label_fr: fr.value! });
  }
  const latitude = body.map_lat === '' || body.map_lat === null || body.map_lat === undefined ? null : Number(body.map_lat);
  const longitude = body.map_lng === '' || body.map_lng === null || body.map_lng === undefined ? null : Number(body.map_lng);
  if ((latitude === null) !== (longitude === null)) return { ok: false, error: 'Map latitude and longitude must both be provided, or both left blank.' };
  if (latitude !== null && (!Number.isFinite(latitude) || latitude < -90 || latitude > 90)) return { ok: false, error: 'Map latitude must be between -90 and 90.' };
  if (longitude !== null && (!Number.isFinite(longitude) || longitude < -180 || longitude > 180)) return { ok: false, error: 'Map longitude must be between -180 and 180.' };
  return { ok: true, value: {
    hero_copy_en: hero.value.en!, hero_copy_fr: hero.value.fr!, project_type_options: options,
    map_lat: latitude, map_lng: longitude,
    published: body.published === true,
  } };
}

export interface LegalPageInput {
  page: 'privacy_policy' | 'terms_of_use';
  body_en: string;
  body_fr: string;
  published: boolean;
}

export function validateLegalPage(value: unknown): Validation<LegalPageInput> {
  if (!value || typeof value !== 'object') return { ok: false, error: 'Legal page payload is required.' };
  const body = value as Record<string, unknown>;
  if (!['privacy_policy', 'terms_of_use'].includes(String(body.page))) return { ok: false, error: 'Legal page must be privacy_policy or terms_of_use.' };
  const content = pair(body, 'body', 'Legal body', true, 50_000); if (!content.ok) return content;
  return { ok: true, value: { page: body.page as LegalPageInput['page'], body_en: content.value.en!, body_fr: content.value.fr!, published: body.published === true } };
}
