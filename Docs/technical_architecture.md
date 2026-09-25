# Technical Architecture Document
**Project:** Longhorn Publishers Cameroon Standalone Website
**Client:** Longhorn Publishers Cameroon Ltd
**Prepared by:** Developer, Gerer Build Studio
**Date:** September 2026
**Domain:** longhornpublishers-cm.com

## 1. Introduction
This document outlines the proposed technical architecture for the bespoke, standalone website for Longhorn Publishers Cameroon Ltd. Following a strategic pivot by CEO Yv, this platform will be entirely distinct from the Kenyan HQ website. It is designed to specifically highlight their localized identity as "Content creators and platform business providers" in Central Africa (Cameroon and DRC). The architecture prioritizes showcasing their end-to-end Professional Publishing Services (Editorial, Design, Printing) and their bilingual (English/French) educational materials for primary and secondary levels.

## 2. Recommended Tech Stack
To support a fast, accessible, highly customized, and SEO-optimized standalone presence, we recommend a modern Static Site Generator (SSG) architecture.

*   **Frontend Framework:** **Astro**
    *   *Rationale:* Astro is ideal for content-rich, bespoke corporate websites. It delivers zero JavaScript by default for maximum performance and has excellent native support for internationalization (i18n), which is critical for the Cameroonian bilingual market. It provides complete freedom to build a unique UI distinct from the Kenyan HQ.
    *   *Public site vs. admin panel:* The public site (Home, Catalogue, News, etc.) is rendered on demand from Netlify Database and served from Netlify's durable CDN cache, so it stays fast and fully server-rendered for SEO while admin saves go live within seconds without a deploy (see §6.1). The `/admin` section is a separate, authenticated area within the same Astro project — an interactive island (React) that calls Netlify Functions for all reads/writes. Static content and admin tooling live in one repository and one deploy, but are architecturally distinct.
*   **Styling:** **Tailwind CSS**
    *   *Rationale:* Enables rapid development of the bespoke UI components required to match the new standalone brand identity, while ensuring minimal CSS bundle sizes.
*   **Database:** **Netlify Database** (`@netlify/database`, managed Postgres)
    *   *Rationale:* Zero-config Postgres provisioned directly by the hosting platform — no separate database vendor, no manual connection wiring. Queryable from Netlify Functions and Astro server endpoints. Schema is managed with Drizzle ORM, migrations committed to the repo (`netlify/database/migrations/`) and applied automatically on deploy. Each deploy preview gets its own database branch seeded from production, so admin panel changes can be tested safely before going live.
*   **Media Storage:** **Netlify Blobs**
    *   *Rationale:* Handles uploaded assets (book covers, hero images, news thumbnails) from the admin panel without standing up separate object storage — same platform as hosting and the database.
*   **Authentication:** **Netlify Identity** (`@netlify/identity`), email + password
    *   *Rationale:* Purpose-built for exactly this need — a small set of trusted admin users logging in with email/password, no social login required. Login/signup/session handling, password reset, and role storage (`app_metadata.roles`) come out of the box; the `/admin/*` section is locked down at the CDN edge via role-based redirect rules, so unauthenticated requests never reach the admin UI or its data.
*   **Deployment & Hosting:** **Netlify**
    *   *Rationale:* Single platform for hosting, the database, media storage, authentication, and serverless functions — minimizes moving parts and vendor accounts for a small standalone site. Global edge CDN for fast delivery across Central Africa, with CI/CD and deploy previews built in.

## 3. Internationalization (i18n) Strategy
Given Cameroon's bilingual education system and the company's dedicated translation services, English (en) and French (fr) must be deeply integrated first-class citizens.

*   **Implementation:** Astro's native i18n routing.
*   **URL Structure:** Sub-path routing (e.g., `longhornpublishers-cm.com/en/` and `longhornpublishers-cm.com/fr/`).
*   **Content Storage:** Every content table in Netlify Database stores English and French fields side by side (e.g., `title_en` / `title_fr`) rather than duplicate rows, so the admin panel can enforce both languages are filled before allowing publish.
*   **UI Components:** A prominent, globally accessible language switcher component will be implemented in the navigation.

## 4. Search Engine Optimization (SEO) Strategy
The bespoke site must establish its own domain authority in Central Africa, distinct from the Kenyan parent company.

*   **Local SEO Focus:** Schema markup and content targeting Yaoundé, Cameroon, and the broader Central African region (including DRC).
*   **Service-Specific Optimization:** Dedicated landing pages for core services (Editing, Proofreading, Translation, Designing, Illustration, Printing) to capture organic search traffic.
*   **Catalogue SEO:** Individual, indexable pages per title (`/catalogue/[slug]`) with structured metadata (level, subject, language) to capture long-tail searches from educators and institutions.
*   **Content Freshness:** The `/news` section provides a recurring publishing cadence, which search engines weight favorably for domain authority — contingent on the client maintaining a regular posting schedule post-launch.
*   **Multilingual SEO:** Strict implementation of `hreflang` tags on all pages to ensure Google serves the correct language version based on user locale.
*   **Structured Data (JSON-LD):** `LocalBusiness` (Total École de police, Tsinga), `Organization`, and `Service` schemas.

## 5. Component Breakdown
The UI will be built using a modular component architecture tailored to the company profile.

### 5.1. Core Layout Components
*   `BespokeBaseLayout`: The core HTML skeleton, injecting bespoke fonts, SEO metadata, and i18n configurations.
*   `LocalizedHeader`: Main navigation, bespoke branding, and Language Switcher.
*   `RegionalFooter`: Contact info (Tsinga, Yaoundé office), specific Cameroonian phone numbers, and local social links.

### 5.2. Profile-Specific Feature Components
*   **`ServiceShowcase`**: A modular grid highlighting the Editorial & Publishing Services (Editing, Proofreading, Translation, Designing, Illustration, Printing).
*   **`WhyChooseUs`**: A component detailing their credibility (60 years experience, regional expertise) and full-service capability.
*   **`ProcessTimeline`**: A visual component illustrating their 5-step Quality Commitment process (Consultation -> Planning -> Execution -> Quality Review -> Delivery).
*   **`TeamCapacity`**: Sections showcasing the Editorial Team, Design & Production Team, and Project Management capabilities.
*   **`CurriculumCatalog`**: A bespoke product grid displaying primary and secondary learning materials aligned with the National Curriculum in Cameroon and DRC.
*   **`ConsultationForm`**: A specialized "Contact Us / Let's Work Together" form designed to capture leads for publishing and editorial services.
*   **`NewsList` / `NewsArticle`**: Category-filterable article listing and detail view for company news, new title launches, partnerships, and events. Sourced from Netlify Database so the Cameroon team can publish independently post-launch.

## 6. Admin Panel & Content Management

The admin panel is a **custom-built** authenticated section of the Astro site at `/admin`, backed by Netlify Database (content), Netlify Blobs (media), and Netlify Identity (email/password login, role-gated access). It is not a third-party CMS UI — it's purpose-built screens for exactly the content types this site needs: Site Settings, Catalogue, News & Updates, Services, Team, Why Choose Us, Contact form options, and Legal pages.

Full schema, API surface, auth flow, and screen-by-screen breakdown are detailed in `admin_panel_spec.md`.

### 6.1. How published content reaches visitors

Decided 2026-09-25: **an admin save must never require a Netlify deploy.** Deploys are for code changes only.

- **Public pages render on demand.** Every public route sets `prerender = false` and reads Netlify Database per request. `/admin/*` stays prerendered, because the role gate in `netlify.toml` rewrites to those static files.
- **The CDN caches every successful public page** (`src/middleware.ts`, `src/lib/public-cache.ts`): `Netlify-CDN-Cache-Control: public, durable, max-age=300, stale-while-revalidate=604800`, and `Cache-Control: public, max-age=0, must-revalidate` for browsers. The five-minute fresh window bounds a failed purge; the seven-day stale window keeps quiet pages instant and covers a database outage.
- **Each page carries `Netlify-Cache-Tag` values** for the content it shows. Every page carries `site-settings`; the homepage also carries `homepage`, `services`, `catalogue` and `news`; the sitemap carries `catalogue` and `news`.
- **Saves purge tags instead of building.** Admin functions call `purgeCache({ tags })` through `netlify/functions/_shared/public-cache.ts` only when a write changes public output (draft-only saves purge nothing). A failed purge never fails the save; the five-minute window then applies.
- **Failures are never cached.** A database error during a render returns an uncached bilingual 503, so visitors keep getting the last good cached copy. 404s are `no-store`.
- **Changes made outside the admin functions** (direct SQL, bulk imports, migrations) do not purge anything. Either purge the relevant tags manually — `netlify api purgeCache --data '{"site_id":"<site id>","cache_tags":["catalogue"]}'` (site id from `netlify status`) — or wait five minutes plus one visit. A deploy also clears the cache.

Cost: one production deploy costs 15 Netlify credits; an on-demand render costs a small fraction of one credit. Verified live on 2026-09-25 (`Docs/qa_log_2026-09-25.md`): saves visible in under 4 s with no deploy, and homepage LCP on throttled mobile unchanged (1.94 s cached, 2.09 s cold).

## 7. Development Workflow
1.  **Repository:** Independent GitHub repository for the Cameroon entity.
2.  **Branching:** standard feature branch workflow (`main`, `develop`).
3.  **CI/CD:** Automated deployments to preview environments for QA by the Cameroon team before production releases.
