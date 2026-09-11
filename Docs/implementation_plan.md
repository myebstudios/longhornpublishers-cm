# Longhorn Publishers Cameroon — Delivery Plan & Progress Tracker

**Status:** Active — 2026-09-10
**Owner:** Yv, CEO / Lead Project Manager
**Source of truth for scope:** `README.md`, `sitemap.md`, `technical_architecture.md`, and `admin_panel_spec.md`.

## Delivery Position

The bilingual Astro public-site shell is implemented and builds successfully. It is not yet complete against the agreed scope: production content and media, legal pages, news detail publishing, technical SEO closeout, and the complete Netlify-backed admin platform remain outstanding.

## Workstreams

| Stream | Outcome | Owner | Status | Gate |
|---|---|---|---|---|
| CEO decisions | Recorded client and launch decisions | Yv / Client | In progress | Enables content and CMS configuration |
| Content readiness | Approved bilingual launch-content pack | Marketer | Assigned | Client inputs required |
| Public-site closeout | Complete public routes, approved content, SEO and assets | Developer | Blocked | Legal, catalogue, News decisions/assets |
| CMS foundation | Schema, authenticated APIs, media handling, authorization | Developer | Assigned | Admin governance decisions |
| Admin product | 11 content-management screens | Developer + UI/UX | Pending | CMS foundation |
| Quality and launch | Accessibility, functional, security and release evidence | UI/UX + QA | Assigned | Implemented workstreams |

## CEO / Client Decision Register

| Decision | Current recommendation | Launch impact | Owner |
|---|---|---|---|
| Why Choose Us standalone page | Retain; already implemented as a primary navigation page | Approval needed | Client |
| French slugs | Approve current draft terms or supply official alternatives | Affects canonical URLs | Client |
| Privacy Policy and Terms | Supply or approve EN/FR legal copy | Launch blocker | Client / legal reviewer |
| Catalogue source | Provide approved import sheet and cover assets; curated launch set is acceptable | Catalogue production data blocked | Client |
| News at launch | Launch only with an owner and three approved articles; otherwise defer cleanly | Avoids empty/placeholder news | Client |
| Admin registration | Invite-only | CMS configuration | Client approval |
| Subject taxonomy | Approve seed taxonomy | Catalogue schema/content blocked | Client |
| Roles | One `admin` role at launch | CMS authorization configuration | Client approval |
| Initial admins | Name invite recipients | Handover and access blocked | Client |

## Implementation Sequence

1. **Decision and content intake.** CEO sends the client request pack; Marketing validates EN/FR completeness and approved claims.
2. **CMS foundation.** Developer creates migrations, data access, authenticated APIs, upload handling, and authorization tests.
3. **Public-site closeout.** Developer replaces placeholders with approved data; adds legal and news routes, SEO assets, metadata, and validated links.
4. **Admin screens.** Developer and UI/UX deliver each documented screen with bilingual, draft/publish, and error states.
5. **Migration and editorial acceptance.** Import launch content; verify French and English publication completeness.
6. **Quality gate.** QA and UI/UX validate routes, forms, responsive accessibility, role security, performance, structured data, and publication flow.
7. **Client UAT and handover.** Client approves staging content and receives admin training before release authorization.

## Definition of Complete

- All documented EN/FR public routes exist, are linked, and have correct canonical/hreflang metadata.
- No placeholders, dead links, or unapproved claims remain visible to visitors.
- Legal, catalogue, news, and media content are approved and publishable through the admin panel.
- The 11 specified admin screens operate with invite-only, role-protected access and audited write paths.
- Forms, media uploads, data migration, accessibility, SEO, and responsive behavior have verification evidence.
- The client has completed UAT and received administrator handover/training.

## Progress Log

| Date | Update |
|---|---|
| 2026-09-10 | CEO audit completed. `npm run build` passes; existing EN/FR public routes return 200. Privacy/Terms and `/admin` routes return 404. No CMS foundation files exist yet. Workstreams delegated on the shared board. |
| 2026-09-10 | Added original project-owned photographic media for the public-site hero, editorial work, and print production. Images are optimized JPEGs in `public/img/`; the local dev server is running at `http://127.0.0.1:4321`. Build and direct asset checks pass. |
| 2026-09-10 | Added the unblocked technical SEO foundation: `robots.txt`, generated `sitemap.xml` limited to current canonical public routes, Organization/ProfessionalService JSON-LD, and a favicon. Build and local endpoint checks pass. |
| 2026-09-10 | Added CMS foundation files: initial Netlify Database migration covering the documented content model, role-protected catalogue API, validated admin-only Blobs media upload API, and Netlify Identity route protection configuration. Astro build and standalone Function bundling pass. Live database/Identity validation requires Netlify preview configuration and invite-only admin setup. |
| 2026-09-10 | Added the initial admin experience: Identity-backed login, protected dashboard shell, and Catalogue/News workspaces. All admin routes render locally; real login and route enforcement require a configured Netlify Identity preview. |
| 2026-09-10 | Production release completed. Netlify Database is enabled on the production branch and migration `001_initial_content` is applied with no pending migrations. The live `/api/catalogue` read endpoint returns HTTP 200 from the managed database (currently an empty catalogue), and the production site remains available. |
| 2026-09-11 | Local database readiness completed: the initial migration is applied locally and the Astro development server returns HTTP 200 with `[]` from `/api/catalogue`. Production Netlify Identity is enabled as invite-only; the initial administrator invitation has been issued and assigned the `admin` role. |
| 2026-09-11 | Prepared the Identity invitation callback repair: public invitation links now route their hash token to the admin activation screen, which asks the invited administrator to create a password and securely redeems the invitation. This repair is awaiting production release before the original invitation can be retried. |
