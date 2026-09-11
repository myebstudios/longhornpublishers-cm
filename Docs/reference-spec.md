# Reference Pattern Specification & Longhorn Alignment

**Reference reviewed:** `lawnbustercentral.ca`  
**Authority for Longhorn:** `Docs/README.md`, `sitemap.md`, `marketing_content_outline.md`, `ui_ux_structure.md`, and `wireframes.md`.

## Decision

Use the reference only for reusable conversion and layout patterns. Longhorn must remain an original bilingual publishing-services website: its burgundy/green identity, editorial copy, Longhorn logo, approved imagery, information architecture, and technical requirements take precedence. Do not reuse reference copy, source markup, photography, logos, service names, customer claims, reviews, or contact details.

## Reference patterns approved for adaptation

| Pattern | Reference behaviour | Longhorn application |
| --- | --- | --- |
| Conversion header | Compact navigation, direct contact affordance, prominent CTA | Existing EN/FR navigation and `Get in Touch` CTA; keep News in the footer per sitemap. |
| Immersive hero | Large rounded, media-led hero with concise message and CTA | Use Longhorn's approved professional-team imagery and `Professional Publishing Services` message. |
| Credibility block | Small trust signal near key conversion content | Present verified Longhorn proof only: 60+ years, Central Africa presence, Cameroon/DRC curriculum alignment. |
| Service discovery | Visual service cards, clear progression to details | Preserve the documented editorial, creative, and production groups; use accessible carousel or static grid. |
| Split narrative | Alternating image/text sections | Apply to About and Publishing Services with project-owned photography. |
| Process | Numbered, scannable multi-step journey | Use the documented five steps: consultation, planning, execution, quality review, delivery. |
| Reassurance CTA | Dark contrast band near the end of a page | Reuse Longhorn's `One Partner, End-to-End Solution` proposition and `Get in Touch` action. |
| Editorial updates | Three-card preview with a continuation link | Render only published CMS articles; hide the preview cleanly until an approved news decision and content exist. |
| Footer | Dense but ordered navigation, contact, and utility links | Use the documented address/contact data and add real EN/FR legal pages once approved. |

## Component taxonomy

`SiteHeader`, `LanguageToggle`, `PrimaryCTA`, `Hero`, `TrustIndicators`, `SectionHead`, `SplitStory`, `ServiceCard`, `ServiceCarousel`, `CatalogueCard`, `ProcessTimeline`, `EditorialCard`, `CtaBand`, `ContactForm`, `SiteFooter`.

Every component must support both English and French strings, keyboard focus, sufficient contrast, and a useful small-screen layout.

## Layout and responsive rules

- Keep Longhorn's current content container: 1240px maximum with fluid gutters.
- Use rounded media and card surfaces as a recurring visual motif, not as an imitation of one specific source layout.
- Desktop: multi-column grids and horizontal process progression. Tablet: reduce card columns before reducing readable type. Mobile: single-column content, horizontal service scrolling only when it has visible controls and keyboard access, and a vertical process list.
- Preserve generous section rhythm and clear CTA hierarchy; a hero should contain one primary action and, at most, one secondary action.
- Avoid auto-playing motion that is essential to comprehension. Carousels must have pause, previous/next controls, and a reduced-motion fallback.

## Page-level alignment

| Longhorn route family | Required documented surface | Pattern use |
| --- | --- | --- |
| `/en/`, `/fr/` | Hero, About summary, services, catalogue preview, end-to-end banner, verified trust indicators, conditional news preview, CTA | All listed conversion patterns, without third-party content. |
| About | Heritage, purpose/vision/mission/values, capacity, quality commitment | Compact banner, identity-card grid, split narrative. |
| Services | Editorial, creative, production, five-step process | Alternating service deep dives and accessible timeline. |
| Catalogue + detail | Filters, title grid, curriculum details, request CTA | Data-backed cards and clear conversion CTA; no fabricated titles. |
| Why Choose Us | Local expertise, quality, bilingual capability | Evidence-led feature cards and trust content. |
| Contact | Yaounde contacts, B2B form, map | Clear conversion layout; map only when approved/configured. |
| News | List, detail, related articles | CMS-backed editorial cards only after launch scope/owner are approved. |

## Current document-to-code audit

The public route set, bilingual routing, shared header/footer, hero and CTA primitives, service/catalogue/news surfaces, and initial CMS admin shell are present. The following remain release gates, consistent with `implementation_plan.md`:

1. Approved EN/FR legal content and real legal routes; footer links are currently placeholders.
2. Approved catalogue import data and cover assets; the production catalogue is empty.
3. A launch decision, owner, and approved articles for News; sample content must not ship.
4. Final SEO/social metadata, map configuration, and no-placeholder route/link verification after content decisions.
5. CMS completion against the documented 11-screen administration scope, with configured invite-only Identity acceptance testing.

## Handoff order

1. CEO resolves the nine decision-register items with the client.
2. Marketing supplies approved bilingual content and asset permissions.
3. Developer completes the smallest unblocked CMS/public-site slices without replacing existing team work.
4. UI/UX checks responsive and accessible application of these patterns against the Longhorn documents.
5. QA verifies the route, form, CMS, i18n, and launch checklists before client UAT.
