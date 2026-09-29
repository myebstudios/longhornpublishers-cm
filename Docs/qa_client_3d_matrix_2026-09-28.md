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

## 6. Results: independent local and live pass, 2026-09-29

**Builds under test.** Local: `7783ac5` (code identical to `e60eb35`), run from an isolated worktree with its own Postgres on port 54341. All migrations `001`–`015` were applied, plus one catalogue fixture per cover-gate state; the worktree and DB were removed afterwards. The shared DB on 54329 and the other bot's dev server on 4321 were not touched. Live: production as served 08:30–08:50Z, which already includes the copy fixes up to `15a9b13` (Home `<title>` "Expanding Minds —", FR language pair, Who We Are full stop). All live requests were anonymous GETs.

**Suites.** 9 suites, 80 tests, 0 failures (product-code, catalogue-classification, cms, hero, hero-admin, hero-launch, cms-parity, public-cache, demo-seed). Production build passes.

| ID | Local | Live | Evidence / note |
| --- | --- | --- | --- |
| C01 | PASS | PASS | Live sweep of 20 sitemap URLs plus contact, privacy, terms, `/`, EN/FR 404, `robots.txt`, `/api/catalogue` (31 responses): **0** DRC/RDC/Congo/Congolese/Kinshasa matches in body, head or JSON-LD. JSON-LD `areaServed` is now `["Cameroon","Central Africa"]` (see D4). |
| C02 | PASS | PASS | Trust label is exactly "Educational content creators and service providers" / "Créateurs de contenus éducatifs et prestataires de services", with no location suffix. The old label is absent. |
| C03 | PASS | PASS | H1 "Expanding Minds" / "Éveiller les esprits". The subline is a separate `<p>`, not an accent span. Live shows 1 slide; the demo "Heading test" slides no longer render. First-load CLS on live Home at EN/FR 375/768/1024: max **0.028**. |
| C03-G | PASS (source) | n/a | `scripts/hero-launch-set.mjs`: slide 1 = C03 copy; slide 2 now "Curriculum-aligned…" (no "Approved"/"agréés"). The staged rows in DB 54329 were not re-scanned (DB stopped). HERO-7 swap remains gated on its own sign-off. |
| C04 | PASS | PASS | Tsinga paragraph present EN/FR. Paragraph 1 kept. |
| C05 | PASS | PASS | Local fixtures: "Titles on the national booklist" (2 verified) and "Other developed titles" (1), localized FR headings; the unclassified title is hidden and its detail page returns 404. Live: Book List group hidden (0 verified), 4 titles under Other developed EN/FR. |
| C06 | PASS | PASS | Proximity sentence present EN/FR; no "Congolese"/"congolais"; paragraphs 1 and 3 kept; no empty `<p>` from the `split_part` migration. |
| C07 | PASS (with D3) | PASS (with D3) | Link reads "Why choose us" / "Pourquoi nous choisir". "Local Judgement" is gone, but the heading now ends in a bare comma (D3). |
| C08 | PASS (with D4) | PASS (with D4) | Purpose and Mission match the client statements EN/FR. Vision is new, unapproved wording (D4). |
| C09 | **FAIL** | **FAIL** | The Services overview is fixed ("Six services"). But About still has H2 "**Three disciplines, one workflow**" / "**Trois métiers, un seul flux de travail**" (D1). |
| C10 | PASS | PASS | Services H1 "Every Stage. Every Solution" + client lede EN/FR. "From manuscript to masterpiece" moved under Publishing. |
| C11 | PASS | PASS | Six cards in client order on Home and Services, EN/FR. LoHo and E-Marketing are `<article>` elements with a text badge "Coming soon" / "Bientôt disponible", not focusable, with no CTA. The other four route 200. Card columns at 320/375/768/1440 = 1/1/2/3. Label is plain "LoHo" (interim ruling). None of the copy-matrix card summaries shipped (see §7). |
| C12 | PASS | PASS | 7-item `<ul>` EN/FR plus the role line. |
| C13 | PASS | PASS | "English ↔ French · French ↔ English" / "Anglais ↔ Français · Français ↔ Anglais"; both paragraphs present. |
| C14 | PASS | PASS | "Because production sits…" / "La production étant intégrée…" absent. |
| C15 | PASS | PASS | Local fixtures: a cover renders only for verified + rights approved (grid, detail, Home). Verified without rights, other_developed and unclassified titles are text-only or hidden. `/api/catalogue` SQL (both branches) masks `cover_image_id` identically. `og:image` is the generic share card on every detail page. Live: 0 references to the 4 former cover IDs in any HTML or `/api/catalogue`. |
| C15-M | n/a | PASS | 08:35Z and 08:48Z, more than 12 h after the deploy (so well past the 15-min window): each former ID returns **404** direct, via `/.netlify/images` at w=560/720/1120, `fm=webp`, and with a cache-busting query (24/24). |
| R01 | PASS | PASS | Layout matrix: EN/FR × Home, Services, About, Catalogue, Why × 320/375/768/1440 = 40 cases local + 40 live. **0** horizontal overflow; the only "clipped" element is the visually hidden form honeypot label (intentional). 404 now returns `no-store` (`533e593` is live). |
| R02 | PASS (code review) | gate only | DB `CHECK` rejects Book List classification without evidence (tested). `parseClassification` validates the enum, requires evidence/reviewer/date, rejects future dates, and clears evidence and rights for non-verified titles. The admin form sends and prefills all five fields. `requireAdmin` runs first. Live `/api/catalogue-admin` returns 401 and `/admin/catalogue/` redirects to login. See D7. |
| R03 | n/a | PASS | Cached HTML matches cache-busted HTML on 10 changed routes (only Netlify's HUD script differs; D2). Durable TTL ≈300 s, `max-age=0, must-revalidate`. |

### Defects

| # | Sev | Defect | Route | Owner |
| --- | --- | --- | --- | --- |
| D1 | **P2** | About H2 "Three disciplines, one workflow" / "Trois métiers, un seul flux de travail" keeps the three-discipline framing the client asked to remove (C09 criterion: no three-discipline string anywhere). | `/en/about/`, `/fr/a-propos/` (`en.ts`/`fr.ts` about team section) | SoSo / Marty |
| D2 | **P2** | Netlify's platform HUD ("Powered by Netlify" badge, `/.netlify/scripts/hud?variant=public`) is injected into the cached HTML of most live pages (Services, About, Catalogue, Contact; not Home at test time). At 320 px it floats over content, e.g. the FR Services "Aller au processus" link. Not in the repo; it's a Netlify site/team setting. Out of CLIENT-3 scope, but visible to the client. | all | Yv / owner (Netlify settings) |
| D3 | P3 | After removing "Local Judgement", the About heritage H2 renders as a bare "Continental backing," / "L'appui d'un groupe continental," with nothing after the comma. | `/en/about/`, `/fr/a-propos/` | Marty / SoSo |
| D4 | P3 | Vision rewritten to wording that isn't in the DOCX ("To be a trusted publishing partner for institutions across Cameroon and Central Africa"), and JSON-LD `areaServed` adds "Central Africa". Both are new geographic claims needing Marty/client approval (B7). | About, all JSON-LD | Marty / Yv |
| D5 | P3 | FR service CTAs read "Discuter d'un projet **de impression**" and "**de illustration**" (should be "d'impression", "d'illustration"). This predates the release (`discussPrefix` unchanged). | `/fr/services-edition/` | SoSo |
| D6 | P3 | Services meta description still says "Editing, proofreading… plus our five-step publishing process", which doesn't reflect the six offerings or the new H1. | `/en/services/`, `/fr/services-edition/` | Marty / SoSo |
| D7 | P4 | `parseClassification` treats a missing `classification` as `unclassified` and clears the evidence, so an API PUT that omits the field silently removes a verified title from public view. The admin form always sends it, so there's no user-facing path today; requiring the field on PUT would fail closed without data loss. | `netlify/functions/_shared/catalogue-classification.ts:33` | SoSo |

Observation (not a defect): live Home LCP unthrottled from this machine was 2.8–5.2 s (IMG). It's network-variable and not a CLIENT-3 criterion.

## 7. Preflight: `Docs/client_corrections_copy_matrix_2026-09-28.md` (Marty, CLIENT-3A) vs DOCX and Z plan

Reviewed as requested. **None of the items below shipped**, because the live offering cards are labels only. But the document must not be reused as an approved source until they're corrected.

- **Cambridge (§3.5):** "Official curriculum resources… authorized Cambridge materials" / "Ressources pédagogiques officielles… manuels agréés Cambridge". Unsupported endorsement claims; the Z plan forbids endorsement or accreditation wording.
- **Reference books (§3.5):** "authoritative statutory volumes" (EN), "recueils de lois et ouvrages institutionnels" (FR drops the Bibles). These are unsupported legal-product claims and EN/FR don't match.
- **LoHo (§3.5):** the title picks "E-Learning Product LoHo" while the client ruling is open, and the audience claims differ ("21st-century students" EN vs "élèves du primaire" FR). Interim label must stay "LoHo — Coming soon".
- **Tertiary / E-Marketing summaries:** add unsupported scope ("research materials", "vocational"; FR "visibilité en ligne des auteurs").
- **§4.1 legal assertions:** "established exclusively by ministerial decree" and "violates… consumer protection laws" are unsourced legal statements. The Gazette/Arrêté evidence rule also conflicts with the tracker's title/edition/ISBN rule.
- **§2 stat replacement:** "60+ Years of continental publishing heritage" is a new claim, relabelled from parent-group history.
- **Trust label / hero:** the current document text is correct (exact label, no location suffix; heading plus separate subline), and so is the live output. The Services hero row still labels "Every Stage. Every Solution" as a single "Lead & Accent" without a defined split. Live renders "À chaque étape. / *Chaque solution*" acceptably.
- §2 line references are off by a few lines, and the inventory omits CMS rows and seed scripts (covered by migration `015` in practice).

**Sign-off:** C02, C03 and C11 pass on the live output. That doesn't approve the copy-matrix document itself.

## 8. Verdict

Local and live QA are complete. **Everything passes except C09 (D1, P2).** D2 is a P2 platform issue outside the code. D3–D6 are P3 copy/SEO items, and D7 is P4. Client-dependent items stay open: Book List evidence (B1), the LoHo qualifier (B2), and approval of the Vision and `areaServed` wording (D4). Recommend moving CLIENT-3D to **review** once D1 is fixed and re-verified live, or once Yv explicitly rules the About section out of scope.

## 9. Recheck after SoSo's fixes `f6943ec`, `645d094`, `b25e888`, 2026-09-29 09:00Z

Live was checked with anonymous GETs after the new deploy started serving ("One team" present at 09:00:02Z). Local: `316ab4a`, 9 suites / **82 tests, 0 failures** (catalogue-classification now 8), production build passes.

| Item | Result | Evidence |
| --- | --- | --- |
| C09 / D1 | **PASS** | About H2 now "One team, one workflow" / "Une équipe, un seul flux de travail". No three-discipline wording on any live route. |
| D3 | **PASS** | Heritage H2 "Continental backing" / "L'appui d'un groupe continental", with no dangling comma. The accent is omitted cleanly (`About.astro` renders `<em>` only when an accent exists). |
| D4 | **PASS** | Vision reverts to the previously approved wording without geography ("…publishing partner of choice for institutions that will not compromise on quality." / "Devenir le partenaire éditorial de référence…"), in both the fallback and CMS (migration `017`). JSON-LD `areaServed` is `["Cameroon"]` on Home, About and 404. |
| D5 | **PASS** | FR CTAs: "d'illustration", "d'impression"; "de révision / de traduction / de conception graphique / de correction d'épreuves" unchanged. EN CTAs unaffected. The elision regex treats every initial "h" as mute, which is fine for the current service names; revisit if an aspirated-h name is ever added. |
| D6 | **PASS** | Services `description` and `og:description` now use the client's services lede, EN/FR. Minor note: the FR text is about 200 characters and will be truncated in search snippets (P4, no action required). |
| D7 | **PASS (code + tests)** | `parseClassification(..., { requireExplicit: req.method === 'PUT' })`: a PUT without `classification` returns 400. A PUT marking a title verified without an explicit boolean `cover_rights_approved` returns 400. POST may still default to `unclassified` (hides, fails closed). New unit tests cover both. |
| `b25e888` | PASS | Section heading accents: no heading on 8 checked routes has a missing space before `<em>`. |
| C01 regression | PASS | Full live sweep again: 31 responses, **0** matches. |
| R01 regression | PASS | Live EN/FR × 5 pages × 320/375: 20 cases, 0 overflow, 0 clipped (excluding the honeypot). |

D2 (Netlify HUD badge) is out of CLIENT-3 scope; Yv has documented it as a platform setting.

### Final verdict

**CLIENT-3D passes locally and live for every client remark C01–C15**, plus the C03-G, C15-M and R01–R03 checks. No open client-scope defects. Items that stay open depend on the client, not on QA: National Book List evidence (the group stays hidden and covers stay off until it arrives), the LoHo qualifier (interim "LoHo"), and the separately gated HERO-7 swap. Recommend CLIENT-3D → **review**.
