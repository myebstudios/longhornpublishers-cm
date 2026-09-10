# Longhorn Publishers Cameroon — Static Prototype (Phase 1)

A zero-build, locally runnable static prototype of the public site. It exists so the
CEO and client can react to something tangible **before** we commit to the Astro
scaffolding, and so that every component here converts 1:1 into an Astro component.

## Run it

```bash
cd prototype
npx serve -l 4321 .        # or: python3 -m http.server 4321
```

Then open <http://localhost:4321>. No install, no build step, no dependencies.

## Pages

| File | Route (phase 2) | Notes |
|---|---|---|
| `index.html` | `/` | Hero, trust bar, marquee, who-we-are, services carousel, catalogue preview, end-to-end banner, process, testimonials, news, CTA |
| `about.html` | `/about` | Heritage, Purpose/Vision/Mission/Values, team & capacity, quality commitment |
| `services.html` | `/services` | Service grid, zigzag deep-dive (6 anchors), 5-step process timeline |
| `catalogue.html` | `/catalogue` | Sticky filter bar (level / subject / language) with working client-side filtering |
| `why-choose-us.html` | `/why-choose-us` | Three pillars + full-service vs fragmented comparison |
| `contact.html` | `/contact` | Split info/form layout, B2B inquiry form, map placeholder |
| `news.html` | `/news` | Category filter + article grid |

## Provenance — read this

The client supplied `https://lawnbustercentral.ca/` and the mockups in
`Assets/Style guide/` as a **visual benchmark**. Per CEO directive we did not clone it.

What was carried across is the *layout and interaction vocabulary* — patterns, which are
not protectable: pill CTAs with a circular arrow badge, dotted section eyebrows, a
bold-sans + italic-serif headline pairing, dark image heroes with tag pills, rounded
overlay media cards, numbered process steps, carousel controls, a logo/keyword marquee,
and a dark multi-column footer.

What was **not** carried across: any copy, imagery, brand mark, colour palette, place
name, or contact detail belonging to that site. Every word here is written for Longhorn;
the palette and type come from `Docs/ui_ux_structure.md` §5; imagery is generated
placeholder artwork in `assets/img/`.

Verified: `grep -ri` for the benchmark's brand, place names and phone number returns zero
hits across the prototype.

## Architecture → Astro mapping

| Prototype | Phase-2 Astro |
|---|---|
| `buildHeader()` in `site.js` | `LocalizedHeader.astro` |
| `buildFooter()` in `site.js` | `RegionalFooter.astro` |
| `:root` tokens in `styles.css` | Tailwind `theme.extend` |
| `.media-card` carousel | `ServiceShowcase.astro` |
| `.steps` | `ProcessTimeline.astro` |
| `.book-card` + `.filter-bar` | `CurriculumCatalog.astro` (island) |
| `.form[data-prototype-form]` | `ConsultationForm.astro` → Netlify Function |
| `initFilters()` / `initCarousels()` | `client:visible` islands |

Header and footer are injected by JS specifically so they stay identical across all seven
pages — the same reason they become a shared layout in Astro. This does mean the prototype
must be **served**, not opened via `file://`.

## Known placeholders (deliberate, flagged in-page)

- **EN/FR toggle** is visual only. Real i18n is Astro sub-path routing (`Docs/technical_architecture.md` §3).
- **Catalogue titles** are sample data — a real title list is open item 4 in `Docs/README.md`.
- **News articles** are placeholders — News scope is open item 5.
- **Testimonials** are placeholder quotes pending client approval.
- **Email address** `info@longhornpublishers-cm.com` is assumed; confirm with client.
- **Privacy Policy / Terms of Use** link to `#` — no source material yet (open item 3).
- **Forms** alert instead of submitting; nothing is sent or stored.
- **Imagery** is generated abstract placeholder art, to be replaced with authentic
  photography of the Cameroon team per `Docs/ui_ux_structure.md` §5.

## Accessibility & responsiveness

Semantic landmarks, `aria-current` on the active nav item, labelled form fields, visible
focus rings, `prefers-reduced-motion` honoured for marquee/reveal/smooth-scroll, and
mobile nav with `aria-expanded`. Layouts are fluid with breakpoints at 1080 / 900 / 860 / 560px.
