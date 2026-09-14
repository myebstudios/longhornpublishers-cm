# Longhorn Publishers Cameroon — Project Documentation Index

**Client:** Longhorn Publishers Cameroon Ltd (subsidiary of Longhorn Publishers PLC)
**Domain:** longhornpublishers-cm.com
**Scope:** Bespoke bilingual (EN/FR) corporate website with a custom admin panel — does not mirror the Kenyan HQ site (longhornpublishers.com). Content is sourced from `Assets/Longhorn Company Profile _ Sep 2026.pdf`.

---

## Documents

| Document | Owns | Read this for |
|---|---|---|
| [`marketing_content_outline.md`](./marketing_content_outline.md) | Marketer | Brand voice, positioning, and the actual page copy/content requirements |
| [`sitemap.md`](./sitemap.md) | UI/UX Designer + Developer | **Source of truth for site structure** — page hierarchy, bilingual URL structure, nav/footer, page-by-page component mapping |
| [`ui_ux_structure.md`](./ui_ux_structure.md) | UI/UX Designer | Visual identity, design system (color/type/imagery), high-level page layout descriptions |
| [`wireframes.md`](./wireframes.md) | UI/UX Designer | ASCII wireframes for every public page **and** the admin panel, drawn as they'll actually render |
| [`technical_architecture.md`](./technical_architecture.md) | Developer | Tech stack (Astro, Netlify Database, Netlify Blobs, Netlify Identity, Netlify hosting), i18n, SEO, component breakdown |
| [`admin_panel_spec.md`](./admin_panel_spec.md) | Developer | Admin panel auth, database schema, screens, and API surface |
| [`local_development.md`](./local_development.md) | Developer | Local CMS, database, media, and production-preview test workflow |
| [`implementation_plan.md`](./implementation_plan.md) | CEO / Project team | Delivery sequencing, decision register, dependencies, and progress log |
| [`cms_rebuild_trigger.md`](./cms_rebuild_trigger.md) | Developer + CEO | Why published CMS content does not reach the live site until a build runs, and how to wire the Netlify build hook that fixes it |
| [`client_approval_packet.md`](./client_approval_packet.md) | Marketer / Executive | Client-facing approval request for 3 testimonials/logos & French URL slugs (`a-propos`, `services-edition`, `pourquoi-nous-choisir`, `actualites`) |

**Reading order for a first pass:** `marketing_content_outline.md` → `sitemap.md` → `ui_ux_structure.md` → `wireframes.md` → `technical_architecture.md` → `admin_panel_spec.md` → `client_approval_packet.md`.

---

## Current Architecture Snapshot

- **Frontend:** Astro (static-rendered public site) + Tailwind CSS
- **Database:** Netlify Database (managed Postgres, Drizzle ORM)
- **Media:** Netlify Blobs
- **Auth:** Netlify Identity, email + password, invite-only registration, single `admin` role
- **Hosting:** Netlify (single platform for site, database, media, auth, functions)
- **i18n:** Sub-path routing, `/en/` and `/fr/`, localized French slugs
- **Public pages:** Home, About Us, Publishing Services, Catalogue, Why Choose Us, Contact Us, News & Updates (footer nav), Privacy Policy, Terms of Use
- **Admin panel:** `/admin`, custom-built, 11 screens covering every content type on the site

---

## Consolidated Open Items for CEO Sign-Off

Pulled from `sitemap.md` §6 and `admin_panel_spec.md` §10 — resolve here rather than hunting through both files.

1. **"Why Choose Us" as standalone nav page** vs. folding into Home/Services sections only. *(sitemap.md)*
2. **French slug translations** — 🛑 **EXTERNAL CLIENT BLOCKER:** Technical implementation complete; pending formal client sign-off on official French URL slugs and terminology. *(sitemap.md, bilingual_content_request_pack.md)*
3. **Legal content** (Privacy Policy, Terms of Use) — ✅ **Factual copy wired:** Bilingual pages implemented based on actual form behavior; routes live at `/en/privacy-policy`, `/en/terms-of-use`, `/fr/politique-de-confidentialite`, `/fr/conditions-utilisation`, and the data-subject contact is the client-confirmed `longhorncameroon@longhornpublishers.com` (confirmed 2026-09-14). 🛑 Final legal sign-off still pending client — **no named owner assigned yet on the client side.** *(sitemap.md, bilingual_content_request_pack.md)*
4. **Catalogue data source** — no title list in the company profile. Need a spreadsheet of titles (level, subject, language, cover art) from the client, or agreement to launch with a small curated set and grow via the admin panel. *(sitemap.md, admin_panel_spec.md)*
5. **News & Updates: in-scope for launch?** — and who on the Cameroon team owns posting updates post-launch. An unmaintained news feed hurts more than not having one. *(sitemap.md, marketing_content_outline.md)*
6. **Admin panel registration mode** — confirm Invite-only (recommended) vs. open signup. *(admin_panel_spec.md)*
7. **Catalogue Subject taxonomy** — confirm the subject list (e.g., Mathematics, English Language, Science, French, Social Studies) before the `subjects` table is seeded. *(admin_panel_spec.md)*
8. **Single `admin` role sufficient at launch?** — or split roles (editor/publisher/translator) needed from day one. *(admin_panel_spec.md)*
9. **Initial admin accounts** — who gets the first Netlify Identity invites. *(admin_panel_spec.md)*

---

## Document Maintenance Note

These documents cross-reference each other (e.g., `wireframes.md` defers to `sitemap.md` for structure; `technical_architecture.md` defers to `admin_panel_spec.md` for admin panel detail). When one changes in a way that affects another — a new page, a renamed field, a stack change — update both in the same pass to avoid drift. This index was last fully cross-checked for consistency on 2026-09-10.
