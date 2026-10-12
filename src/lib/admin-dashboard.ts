import { coverIsPublic } from '../../netlify/functions/_shared/catalogue-classification';
/** Read-only presentation adapters. These never infer public visibility from Published. */
export type DashboardRecord = Record<string, unknown>;
export type DashboardData = Record<string, DashboardRecord[]>;
export const dashboardSources = [
 ['catalogue', '/api/catalogue-admin'], ['news', '/api/news-admin'], ['subjects', '/api/subjects-admin'],
 ['homepage', '/api/homepage-admin'], ['hero', '/api/homepage-hero-slides-admin'], ['about', '/api/about-admin'],
 ['why', '/api/why-choose-us-admin'], ['contact', '/api/contact-settings-admin'], ['services', '/api/services-admin'],
 ['legal', '/api/legal-pages-admin'], ['settings', '/api/site-settings-admin'],
] as const;
const isRecord = (value: unknown): value is DashboardRecord => value !== null && typeof value === 'object' && !Array.isArray(value);
const arrayOf = (value: unknown, valid: (row: DashboardRecord) => boolean): DashboardRecord[] => {
 if (!Array.isArray(value) || !value.every(row => isRecord(row) && valid(row))) throw new Error('The server returned an unexpected content format.');
 return value;
};
const publishable = (row: DashboardRecord) => typeof row.published === 'boolean';
const identified = (row: DashboardRecord) => typeof row.id === 'string';
const singleton = (value: unknown, publish = true): DashboardRecord[] => {
 if (value === null) return [];
 if (!isRecord(value) || (publish && !publishable(value))) throw new Error('The server returned an unexpected page format.');
 return [value];
};
export function adaptDashboard(source: string, value: unknown): DashboardData {
 switch (source) {
  case 'homepage':
   if (!isRecord(value) || !('content' in value) || !Array.isArray(value.catalogue)) throw new Error('The server returned an unexpected homepage format.');
   return { homepage: singleton(value.content) };
  case 'services':
   if (!isRecord(value)) throw new Error('The server returned an unexpected services format.');
   return { services: arrayOf(value.services, r => identified(r) && publishable(r)), process: arrayOf(value.process, r => identified(r) && publishable(r)) };
  case 'settings': return { settings: singleton(value, false) };
  case 'about': case 'why': case 'contact': return { [source]: singleton(value) };
  case 'hero': return { hero: arrayOf(value, r => identified(r) && typeof r.enabled === 'boolean') };
  case 'subjects': return { subjects: arrayOf(value, r => identified(r) && typeof r.title_count === 'number') };
  case 'legal': return { legal: arrayOf(value, r => typeof r.page === 'string' && publishable(r)) };
  case 'catalogue': return { catalogue: arrayOf(value, r => identified(r) && publishable(r) && typeof r.level === 'string' && typeof r.classification === 'string') };
  case 'news': return { news: arrayOf(value, r => identified(r) && publishable(r)) };
  default: throw new Error('Unknown dashboard section.');
 }
}
export const websiteSources = ['homepage', 'about', 'why', 'contact', 'services', 'process', 'legal'];
export function publicationCounts(rows: DashboardRecord[]) {
 return { published: rows.filter(r => r.published === true).length, drafts: rows.filter(r => r.published === false).length };
}
export function websiteCounts(data: DashboardData) {
 if (websiteSources.some(source => !data[source])) return null;
 const counts = publicationCounts(websiteSources.flatMap(source => data[source]));
 const missing = ['homepage', 'about', 'why', 'contact'].filter(source => !data[source].length).length +
  ['privacy_policy', 'terms_of_use'].filter(key => !data.legal.some(row => row.page === key)).length;
 return { ...counts, missing };
}
export function catalogueCounts(rows: DashboardRecord[]) {
 return { total: rows.length, primary: rows.filter(r => r.level === 'primary').length, secondary: rows.filter(r => r.level === 'secondary').length,
  ...publicationCounts(rows), unclassified: rows.filter(r => r.classification === 'unclassified').length,
  coverEligible: rows.filter(r => coverIsPublic({published:r.published===true,classification:String(r.classification),cover_rights_approved:r.cover_rights_approved===true,cover_image_id:typeof r.cover_image_id==='string'?r.cover_image_id:null})).length,
  eligible: rows.filter(r => r.published === true && ['national_book_list_verified', 'other_developed'].includes(String(r.classification))).length };
}
export const sourceLabels: Record<string, {label: string; href: string; icon: string}> = {
 catalogue: { label: 'Catalogue', href: '/admin/catalogue/', icon: 'book-open' }, news: { label: 'News & updates', href: '/admin/news/', icon: 'newspaper' },
 homepage: { label: 'Homepage', href: '/admin/homepage/', icon: 'house' }, hero: { label: 'Hero slide', href: '/admin/homepage/#hero-slides', icon: 'house' },
 about: { label: 'About us', href: '/admin/about/', icon: 'building-2' }, why: { label: 'Why choose us', href: '/admin/why-choose-us/', icon: 'badge-check' },
 contact: { label: 'Contact', href: '/admin/contact/', icon: 'map-pin' }, services: { label: 'Services', href: '/admin/services/', icon: 'layers' },
 process: { label: 'Process steps', href: '/admin/services/', icon: 'layers' }, legal: { label: 'Legal pages', href: '/admin/legal-pages/', icon: 'file-text' },
 settings: { label: 'Site settings', href: '/admin/site-settings/', icon: 'settings' },
};
export function recentEdits(data: DashboardData) {
 const unique = new Map<string, {source: string; key: string; row: DashboardRecord; timestamp: number}>();
 for (const source of Object.keys(sourceLabels)) for (const row of data[source] ?? []) {
  if (typeof row.updated_at !== 'string' || !row.updated_at.trim()) continue;
  const timestamp = Date.parse(row.updated_at); if (!Number.isFinite(timestamp)) continue;
  const key = `${source}:${row.id ?? row.page ?? source}`;
  const previous = unique.get(key); if (!previous || previous.timestamp < timestamp) unique.set(key, { source, key, row, timestamp });
 }
 return [...unique.values()].sort((a,b) => b.timestamp - a.timestamp || (a.key < b.key ? -1 : a.key > b.key ? 1 : 0)).slice(0,6);
}
