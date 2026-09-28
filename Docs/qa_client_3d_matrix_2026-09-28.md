# QA CLIENT-3D: client corrections acceptance matrix

**Owner:** Dell (QA). **Source:** `Docs/CORRECTIONS TO BE MADE ON THE COMPANY WEBSITE.docx`, read-only text extract; the file is unchanged. **Related:** `client_corrections_tracker_2026-09-28.md` (C01–C15 IDs reused here), `client_3b_ux_implementation_plan_2026-09-28.md`.
**Baseline:** repo `99f12ed`, before SoSo's implementation (in progress, uncommitted). Production was read anonymously with GETs only. No site data or source was changed.

Status key: **FAIL (baseline)** = the old behaviour is still live, as expected before release. **BLOCKED** = cannot pass without a client or owner decision. Local and live columns stay `pending` until tested against a committed implementation.

## 1. Remark-by-remark matrix

| ID | Client remark (DOCX wording) | Test steps (run in EN and FR, local and live) | Pass criteria | Live baseline 2026-09-28 | Local | Live |
| --- | --- | --- | --- | --- | --- | --- |
| C01 | "Remove DRC or any statement related to Congo wherever you spot it." | Run the geography sweep (§2) on every public route, including non-sitemap routes and the 404, across body, `<head>` meta, OG/Twitter and JSON-LD. Check the CMS-backed state and the fallback state. Check the admin copy. | 0 matches for `DRC`, `RDC`, `R.D.C`, `Congo*`, `Congolais*`, `Congolese`, `Kinshasa`, `Lubumbashi` in any public response. "Central African" is allowed (client wording). | **FAIL**: see §2. 20/20 sitemap routes plus contact, privacy, terms and 404 all match (JSON-LD `areaServed` on every page) | pending | pending |
| C02 | Replace "Local publishing team" with "Educational content creators and service providers" | Home trust strip, EN/FR. Check the CMS trust stats and the `t.home.trust` fallback. | Exact EN client wording. FR shows approved Marty wording. Old label absent in both. Strip doesn't wrap badly at 320–1440 px. | FAIL: `en.ts:173` still says "Local publishing team" | pending | pending |
| C03 | Opening sentence "Professional publishing…" becomes "Expanding Minds" / "Enriching lives through knowledge" | Hero heading and subheading, static fallback **and** CMS slide 1. First-load CLS at 768/1024 EN/FR (re-run the HERO-7 check, since longer or shorter H1 changes the reflow). CTA still routes 200. | Both lines present EN/FR in both data states. No "Professional publishing" opening remains. CLS ≤ 0.1. | FAIL: live slide 1 still has the old copy with "…Cameroon and the DRC" | pending | pending |
| C03-G | Regression gate: the staged HERO-7 launch set must not undo C01/C03 | Read-only scan of local `longhorn_cms.homepage_hero_slides` (54329) before any HERO-7 Phase 2 swap. After the corrections are applied, re-scan the staged set and the live set. | No staged or live slide contains "Professional publishing", DRC/RDC/Congo, or the unsupported "Approved" / "agréés". Slide 1 carries the C03 copy. The HERO-7 swap is **not approved** while this row fails. | **FAIL (staged, local)**: position 0 (launch slide 1) still opens with "Professional publishing". Position 1 still says "Approved" / "agréés". Position 100 (current slide) has "Professional publishing" + DRC/RDC. Positions 2–3 clean. | pending | pending |
| C04 | Who We Are paragraph 2 becomes the Tsinga, Yaoundé / "content creators and platform business providers across the Central African Market" text, plus the EN/FR learning-materials sentence | Home Who We Are, CMS `who_we_are_copy_*` and fallback | Paragraph 1 kept. Paragraph 2 matches client meaning. No DRC. | pending (not DRC-hit; copy check at local) | pending | pending |
| C05 | Catalogue: segment into "Titles on the national booklist" and "Other developed titles" | `/en/catalogue/`, `/fr/catalogue/`: two headed groups with counts. Filters (search, Level, Subject, Language) work across groups; empty group hides; count is announced. | Groups present EN/FR with localised headings. Membership matches the evidence in §3 exactly. No unverified title in the Book List group. | FAIL: single ungrouped list | pending | pending |
| C06 | More About Us: take off paragraph 2 and "Congolese education"; replace with the proximity sentence ("…Cameroonian and Central African publishing ecosystem as a whole in both official languages") | `/en/about/`, `/fr/a-propos/` heritage section, CMS and fallback | New sentence present. "Congolese / congolais" absent. Paragraphs 1 and 3 kept. | **FAIL**: "Cameroonian and Congolese education context" / "contexte éducatif camerounais et congolais" live | pending | pending |
| C07a | "Why partner choose us" becomes "Why choose us" | About link label, nav, footer, page `<title>` and H1 of `/why-choose-us/`, `/fr/pourquoi-nous-choisir/` | "Why choose us" / approved FR. `fr.ts:262` "Pourquoi nos partenaires…" gone. Route slugs unchanged (no broken links or redirects needed). | FAIL: `en.ts:257`, `fr.ts:262` | pending | pending |
| C07b | Take off "Local Judgement" | About heading | Phrase absent EN/FR. Replacement accent approved by Marty/Z. | FAIL: `en.ts:251` | pending | pending |
| C08 | Core Identity: "To enrich lives through knowledge." / "To develop and deliver high-quality learning and teaching materials that support learners, educators and institutions." | About identity cards, CMS `purpose_*`, `mission_*`, `vision_*` | Both statements exact in EN, approved FR. Vision no longer reads "…in Cameroon and the DRC…". Order per client ruling. | **FAIL + BLOCKED on order**: live vision says "partner of choice in Cameroon and the DRC" | pending | pending |
| C09 | At a glance: take off "3 disciplines"; show "six services" | Services overview and Home services preview | Exactly six offering cards in the §1.2 order. No "three disciplines" / "trois disciplines" string anywhere. | FAIL: `en.ts:273, 322, 328` | pending | pending |
| C10 | Services opening: "Every Stage. Every Solution" + lede; former opening moves under Publishing | Services hero and `#publishing` section | New hero EN/FR. "From manuscript to masterpiece" (or the former opening) appears inside Publishing, not deleted. | FAIL | pending | pending |
| C11 | Segment: Publishing, Tertiary, Cambridge, Reference books (Bibles, Law Africa), E-learning product LoHo (coming soon), E-Marketing (coming soon) | Six cards, desktop 3×2, tablet 2 columns, mobile 1 column at 320/375/768/1024/1440, EN/FR. Keyboard: Tab through all six. | Coming-soon cards have a text badge (not colour only), are not links or buttons, and have no quote/purchase/date CTA. Active cards route 200. No empty detail sections for Tertiary/Cambridge/Reference. Publishing capabilities (Editing … Printing) not counted as offerings. | FAIL | pending | pending |
| C11-Q | LoHo labelled both "E-learning product" (text) and "Elementary product" (image mock-up) | Check label | **BLOCKED** until client rules. Interim pass = "LoHo — Coming soon" with neither qualifier. | BLOCKED | — | — |
| C12 | Editing: new paragraph, "We assess:" 7 points, "Our role: Preserve the author's voice. Strengthen the publication." | `#editing` EN/FR | All 7 points in a semantic `<ul>`: Language accuracy, Clarity, Flow, Organisation, Structure, Consistency, Overall readability. Role line present. Wraps at 320 px. | FAIL | pending | pending |
| C13 | Translation: "English ↔ French / French ↔ English", support paragraph, "not merely word-for-word… clear, appropriate and fit for its intended audience" | `#translation` EN/FR | Both direction labels shown once. Copy matches client meaning. `↔` renders cleanly. The `3769712` fonts are Latin subsets with no `unicode-range`, so the glyph may come from a system fallback; check visually for a mismatched weight or baseline. | FAIL | pending | pending |
| C14 | Printing: take off the last paragraph "Because production sits…" | `#printing` EN/FR | EN "Because production sits…" and FR "La production étant intégrée…" both absent. | FAIL: `site.ts:122` EN, `site.ts:130` FR | pending | pending |
| C15 | "Only allow covers of books on the National Book List." | See §3. Catalogue grid, detail pages, Home cover carousel, `og:image`/`twitter:image`, preload links, JSON-LD `image`, `/api/catalogue` JSON, direct `/api/media/uploads/<id>` | Cover only for titles classified `national_book_list_verified`. Every other title is text-only everywhere, including metadata and API. Detail page has no empty cover placeholder. | **FAIL**: all 4 titles show covers live | pending | pending |
| C15-M | Raw cover media endpoint for hidden covers | Anonymous GET `/api/media/uploads/<id>.png` for each non-Book List cover, directly and through `/.netlify/images?url=…`. Check `cache-control` and whether the CDN still serves a cached copy after release. | **Decided (Yv, tracker `ee687ac`, board rev3):** after release **and** CDN purge, every unverified cover returns **403 or 404** anonymously, both directly and through `/.netlify/images`. No public HTML, JSON, preload or metadata references the ID. An authenticated editor can still fetch the private blob (code review plus the 401 gate unless an admin session is provided). A 200 from any CDN edge after the purge = FAIL. Verified Book List covers (if any) still return 200. | **FAIL**: all 4 IDs return 200 `image/png` anonymously and are referenced in HTML | pending | pending |
| R01 | Regression: approved content not in the DOCX | Hero slides 2–4 (HERO-7 staged), news, contact form, legal pages, admin login gate, 404 `no-store`, routing test, build | No change except the listed remarks. All suites and the build pass. HERO-7 CLS still ≤ 0.1. | — | pending | pending |
| R02 | Admin editability | Admin forms for new fields (offerings, classification, verification ref) | Fields present and validated. Cannot set Book List without a verification reference. Checked by code review plus the 401 gate only unless an admin session is provided. | — | pending | n/a (no prod writes) |
| R03 | Cache freshness after release | Each changed route: `cache-control`, `age`, `cache-status`. Retry with a cache-bust query. | Live HTML reflects the new copy with no stale DRC copy on a CDN hit. | — | n/a | pending |

## 2. Geography sweep (C01): live baseline

Script: `/tmp/c3d/sweep.py <base> <out.json>` walks `sitemap.xml` and splits every page into `jsonld`, `head` and `body` (scripts stripped). Non-sitemap routes are checked separately. The same script runs locally against `netlify serve` and live after release.

| Location | EN | FR | Source |
| --- | --- | --- | --- |
| JSON-LD `areaServed: ["Cameroon","Democratic Republic of the Congo"]` | every HTML response, **including 404, contact, privacy, terms** | same | `src/layouts/Layout.astro:56` |
| Home hero slide 1 lede "…across Cameroon and the DRC" | `/en/` | `/fr/` "…du Cameroun et de la RDC" | CMS hero slide + `en.ts:42` / `fr.ts:47` |
| Home catalogue preview "national curricula of Cameroon and the DRC" | `/en/` | `/fr/` | `en.ts:198` / `fr.ts:203` |
| About heritage "Cameroonian and Congolese education context" | `/en/about/` | `/fr/a-propos/` "camerounais et congolais" | `en.ts:254` / `fr.ts:259`, CMS `about_page` |
| About vision "partner of choice in Cameroon and the DRC" | `/en/about/` | `/fr/a-propos/` | `en.ts:266` / `fr.ts:271`, CMS `vision_*` |
| Why choose us "Cameroonian and DRC national curricula" | `/en/why-choose-us/` | `/fr/pourquoi-nous-choisir/` "camerounais et congolais" | `en.ts:396` / `fr.ts:401` |
| Catalogue hero + `description`/`og:description`/`twitter:description` | `/en/catalogue/` (body + 5 head tags) | `/fr/catalogue/` | `en.ts:165,167,352` / `fr.ts:170,172,357` |
| Fallback SEO description "…in Cameroon and the DRC." | on a CMS miss | same | `src/lib/cms-content.ts:162` |
| Admin workflow note "Cameroonian & DRC public sites" | `/admin/` (behind auth, not public) | — | `src/pages/admin/index.astro:79` (fix recommended, P3) |
| Live CMS rows (hero slides, homepage/about/site settings, catalogue `curriculum_alignment_*`) | visible via the pages above | | Historical migrations `007`, `009` and seed scripts contain DRC. **Do not edit applied migrations**; a forward migration plus production content writes is required. Seed scripts need updating or they re-seed DRC locally. |

False positives excluded: `src/lib/catalogue.ts` ("ha**rdc**oded"), and three `public/img/*.jpg` binary byte matches (no text metadata).

## 3. Catalogue classification and cover evidence (C05, C15)

| Title (slug) | Live cover media ID | Book List evidence on file | Expected group | Expected cover |
| --- | --- | --- | --- | --- |
| Workbook of English, Class 5 (`english-workbook-class-5`) | `642bcaad…` | MINEDUB 2025–2026 list names "Workbook of English, Class 5", LONGHORN. Edition/ISBN match **not** confirmed; current-year status not confirmed. | **BLOCKED**: Book List only if the client confirms. Otherwise Other developed titles. | Only if Book List confirmed |
| Physics Form 2 (`physics-form-2`) | `53c3fb86…` | none | Other developed titles | **none** |
| Mathematics Form 1 Teacher's Guide (`mathematics-form-1-teachers-guide`) | `76e88a71…` | none | Other developed titles | **none** |
| Chemistry Form 1 Student's Book (`chemistry-form-1-students-book`) | `6d063b6f…` | none | Other developed titles | **none** |

Live baseline: all four covers render on the grid, the detail pages and the Home preview. All four `/api/media/uploads/<id>.png` URLs return **200 image/png** anonymously. Social `og:image` uses the generic share card (not a cover), which passes. Endpoint behaviour is tracked as row **C15-M**.
**Test to add after release:** the implementation must stop *referencing* hidden covers in HTML, JSON and preloads. Decided: unverified cover URLs must return 403/404 after release and CDN purge (row C15-M).

## 4. Blockers and open questions

| # | Severity | Item | Owner |
| --- | --- | --- | --- |
| B1 | Blocker (C05/C15) | No title has confirmed current National Book List status. With no evidence, the correct result is an **empty Book List group (hidden)** and **zero covers anywhere**. The client must confirm exact titles, editions and ISBNs, plus cover rights. | Client via Yv |
| B2 | Blocker (C11 label) | LoHo: "E-learning product" vs "Elementary product". Interim: "LoHo — Coming soon". | Client via Yv |
| B3 | Blocker (C08) | Core Identity card order (Purpose/Mission first?). | Client via Yv |
| B4 | Required | French wording for all new client copy needs Marty's approval; no machine translation (CLIENT-3A still `doing`). | Marty |
| B5 | Required | Live CMS rows carry DRC copy. Production content writes by SoSo (user-authorised in CLIENT-3C) are needed before the live C01 pass. QA stays read-only. | SoSo |
| B6 | Interaction | HERO-7 Phase 2 is still gated and its slide 1 copy overlaps C03. The two hero changes must be released in one agreed order, or slide 1 will regress to old copy. | Yv |
| B7 | P3 | JSON-LD `areaServed`: removing "Democratic Republic of the Congo" leaves `["Cameroon"]`. Adding "Central Africa" is a new geographic claim that the client wording supports but needs approval. | Marty/Yv |

## 5. Execution log

- 2026-09-28: Matrix built from the DOCX. Live baseline sweep run (read-only GETs): every public HTML route fails C01, and C15 fails for 4/4 titles. SoSo's implementation observed as uncommitted work in progress in 10 source files; local testing waits for SoSo's handoff commit.
- 2026-09-28: Yv requested explicit gates. Added C03-G after a read-only scan of the staged HERO-7 slides in local `longhorn_cms`: launch slide 1 still has the pre-correction opening, and slide 2 still has the unsupported approval claim. Added C15-M for the raw cover media endpoint. CLIENT-3D stays `doing` until the local and live passes are recorded.
- 2026-09-28: C15-M criteria updated to Yv's decision (`ee687ac`): 403/404 for unverified covers after the CDN purge, private blobs kept for editors.
- 2026-09-28: Early code read of SoSo's `660bce1` (catalogue split and cover gate). This is a review, not a test pass. `media.mts` now serves a catalogue cover only when the title is `national_book_list_verified` with `cover_rights_approved`, and `/api/catalogue` masks `cover_image_id` the same way. Two points for the live pass:
  1. **Release sequencing:** existing titles default to `unclassified` and leave the public catalogue. Unless production classification writes land in the same release, `/en|fr/catalogue/` goes empty and the 8 indexed detail URLs return 404. The sitemap must drop them at the same moment. This differs from the CLIENT-3B plan's "preserve existing published records" (`6504d63`); Yv's ruling is noted in the commit message.
  2. **Cache window:** live media responses are `public, max-age=300, stale-while-revalidate=600` and are stored by Netlify Edge/Durable. So C15-M is re-tested immediately after the purge **and** again after 15 min, including the `/.netlify/images` variants (w=560/720), which are cached separately.
