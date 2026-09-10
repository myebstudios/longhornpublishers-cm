# Admin Panel & Content Management Spec: Longhorn Publishers Cameroon

**Prepared by:** Developer & UI/UX Designer, Gerer Build Studio
**Prepared for:** Yv (CEO), Gerer Build Studio
**Project:** Longhorn Publishers Cameroon Corporate Website
**Domain:** longhornpublishers-cm.com
**Companion documents:** `technical_architecture.md`, `sitemap.md`, `marketing_content_outline.md`

---

## 1. Approach

A **custom-built** admin panel, not a third-party CMS UI — per CEO direction, running entirely on the Netlify platform already chosen for hosting:

*   **Content storage:** Netlify Database (`@netlify/database`, managed Postgres via Drizzle ORM).
*   **Media storage:** Netlify Blobs (cover images, hero images, news thumbnails).
*   **Authentication:** Netlify Identity, email + password only (no social login).
*   **Admin UI:** `/admin` — an authenticated section of the same Astro project as the public site, built as a React island calling Netlify Functions for all data access.

Keeping everything on Netlify (already the hosting choice) means one platform, one set of credentials, and no third-party CMS vendor or subscription for a site this size.

---

## 2. Authentication

*   **Method:** Netlify Identity, email + password (`signup()` / `login()` / `logout()` from `@netlify/identity`). No OAuth providers enabled.
*   **Registration:** set to **Invite-only** in the Netlify Identity dashboard — admins are added by invitation, not open self-signup, since this is a small internal team, not a public user base.
*   **Roles:** a single `admin` role to start (see §5 for whether finer-grained roles are needed).
*   **Access control:** `/admin/*` is protected by a Netlify role-based redirect rule at the CDN edge, with a fallback so unauthenticated visitors are sent to a login page instead of a raw 404:
    ```
    # _redirects
    /admin/*  /admin/:splat  200!  Role=admin
    /admin/*  /admin/login   401!
    ```
*   **Session:** handled by Identity's `nf_jwt` cookie; no custom session/token code to write.
*   **CSRF:** any server-side login/signup/logout endpoint calls `verifyRequestOrigin(req)` before processing credentials.

---

## 3. Data Model (Netlify Database / Drizzle schema)

All content tables carry paired English/French columns (e.g. `title_en`, `title_fr`) rather than duplicate rows, so the admin UI can show both languages side by side and block publish if one is missing.

### 3.1 `site_settings` (single row — global reusable info)
| Column | Type | Notes |
|---|---|---|
| company_name_en / _fr, tagline_en / _fr | text | Header/footer/meta |
| address | text | Total École de police, Tsinga |
| phone_1, phone_2 | text | |
| email | text | |
| social_links | jsonb | Array of `{ platform, url }` |
| footer_tagline_en / _fr | text | |
| newsletter_copy_en / _fr | text | |
| parent_company_url | text | Longhorn Publishers PLC (HQ) |
| seo_default_title / description / og_image | text | Site-wide fallback meta |

Edited in one screen — updates here reflect everywhere the value is used, instead of hunting through individual pages.

### 3.2 `homepage_content` (single row)
hero_headline_en/_fr, hero_subheadline_en/_fr, hero_image_id (→ Blobs), hero_cta_label_en/_fr, who_we_are_copy_en/_fr, who_we_are_image_id, trust_stats (jsonb array of `{label, value}`), one_partner_copy_en/_fr, featured_catalogue_ids (array of `catalogue_titles.id`, max 4, manually curated).

### 3.3 `about_page` (single row)
heritage_copy_en/_fr, purpose/vision/mission/values (text pairs), team_capacity_blocks (jsonb array of `{title, icon, description_en, description_fr}`).

### 3.4 `services` (multi-row, ordered)
id, name_en/_fr, category (enum: editorial / creative / production), description_en/_fr, icon, sort_order. Editable list — add/remove/reorder without a deploy.

### 3.5 `process_steps` (multi-row, ordered)
id, step_number, title_en/_fr, description_en/_fr.

### 3.6 `catalogue_titles` (multi-row)
id, title_en/_fr, cover_image_id (→ Blobs), level (enum: primary / secondary), subject_id (→ `subjects` lookup table), languages (array: en/fr), description_en/_fr, curriculum_alignment_en/_fr, slug, featured (boolean), published (boolean), created_at.

### 3.7 `subjects` (lookup table)
id, name_en/_fr — editable taxonomy list (see Open Item #2).

### 3.8 `why_choose_us` (single row + array)
local_presence_copy_en/_fr, quality_commitment_items (jsonb array of `{icon, title_en, title_fr, description_en, description_fr}`).

### 3.9 `news_articles` (multi-row)
id, headline_en/_fr, category (enum: company_news / new_titles / partnerships / events), publish_date, hero_image_id (→ Blobs), body_en/_fr (rich text/markdown), excerpt_en/_fr, slug, published (boolean), created_at, updated_at.

### 3.10 `contact_settings` (single row)
hero_copy_en/_fr, project_type_options (jsonb array of bilingual strings), map_lat, map_lng.

### 3.11 `legal_pages`
id, page (enum: privacy_policy / terms_of_use), body_en/_fr, updated_at.

### 3.12 Users
Managed entirely by Netlify Identity (`app_metadata`, `user_metadata`) — no separate `users` table needed in the database.

---

## 4. Admin Panel Screens

| Screen | Maps to | Notes |
|---|---|---|
| Login | Netlify Identity | Email + password form, "forgot password" via Identity's recovery flow |
| Dashboard | — | At-a-glance: draft counts, recently edited items, quick links |
| Site Settings | `site_settings` | Single form |
| Homepage | `homepage_content` | Single form, incl. featured catalogue picker |
| About Us | `about_page` | Single form |
| Publishing Services | `services`, `process_steps` | List + reorder + add/edit/delete |
| Catalogue | `catalogue_titles`, `subjects` | List with filters, add/edit/delete, image upload, publish toggle |
| Why Choose Us | `why_choose_us` | Single form + repeatable items |
| Contact | `contact_settings` | Single form |
| News & Updates | `news_articles` | List, add/edit/delete, image upload, publish toggle, category filter |
| Legal Pages | `legal_pages` | Rich text editor per page |

Every list screen (Catalogue, News, Services) supports draft vs. published state so content can be prepared and reviewed before it goes live on the public site.

---

## 5. Roles

Starting scope: **one role, `admin`** — full access to every screen. This matches "just email and password" for a small internal team where everyone using the panel is trusted staff.

If the client later needs a split (e.g., marketing staff who can edit but not publish, or a translator role), Netlify Identity supports additional roles (`app_metadata.roles`) and additional redirect rules without changing the data model — flagged as a phase-2 option, not a launch requirement.

---

## 6. Media Management

*   Uploads (cover images, hero images, thumbnails) go through an admin-only Netlify Function that writes to Netlify Blobs and returns a reference ID stored on the relevant row (`*_image_id`).
*   The public site resolves `*_image_id` to a Blobs URL at render time, passed through Astro's image optimization.
*   No separate file storage or media server to run.

## 7. API Surface (Netlify Functions)

Each content type gets a REST-style Function route, e.g.:
```
GET/POST    /api/catalogue
GET/PUT/DEL /api/catalogue/:id
GET/POST    /api/news
GET/PUT/DEL /api/news/:id
GET/PUT     /api/site-settings
GET/PUT     /api/homepage
...
```
Every write endpoint checks `getUser()` and requires the `admin` role before touching the database — the public site's read paths never go through these authenticated routes; they read published content directly.

## 8. Migrations & Environments

*   Schema changes are committed as SQL/Drizzle migrations under `netlify/database/migrations/` and applied automatically on deploy — never run directly against the hosted database.
*   Every deploy preview gets its own database branch seeded from production data, so admin panel changes (new fields, new content) can be tested end-to-end before merging — **preview links can contain production data and are publicly reachable, so they're not to be shared casually.**

---

## 9. What This Replaces / Avoids Building

Handled by Netlify Identity and Netlify Database/Blobs rather than hand-rolled:
*   Login, password reset, session cookies
*   Role storage and edge-level access control
*   Database provisioning, connection management, branch-per-preview
*   Image upload storage and CDN delivery

Our build effort is scoped to: the Drizzle schema (§3), the admin screens (§4), the Function endpoints (§7) — not auth or infrastructure plumbing.

---

## 10. Open Items for CEO Sign-Off

1. **Confirm Invite-only registration** for the admin panel (recommended) vs. open signup.
2. **Confirm Subject taxonomy** for the Catalogue (e.g., Mathematics, English Language, Science, French, Social Studies) — needed before `subjects` is seeded.
3. **Confirm single `admin` role is sufficient at launch**, or whether a split (editor vs. publisher, or a translator-only role) is needed from day one.
4. Ties into `sitemap.md` Open Item #4 (catalogue data) and #5 (news ownership) — the admin panel is the tool that resolves both, but someone on the client side still needs to be trained and responsible for using it, and initial admin accounts need to be identified for the first Netlify Identity invites.
