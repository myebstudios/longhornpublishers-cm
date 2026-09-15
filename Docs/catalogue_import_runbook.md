# Catalogue pre-import validation and publication runbook

**Owner:** Developer (SoSo)  
**Reviewers:** QA (Dell), CEO/project manager (Yv), client content approver  
**Task:** `c760c1b8-d244-40b7-b415-21ef2bc3e726`  
**State:** Ready to execute; blocked only on the approved client source pack.  
**Production rule:** Do not create, update, delete, upload, or publish production content until Gate 1 passes.

This is the release procedure for the first real catalogue import. It is deliberately fail-closed: one invalid title, unapproved cover, ambiguous subject, duplicate code/slug, or missing authorization rejects the batch before production is touched.

## 1. Required source-pack contract

The client must deliver one signed or otherwise traceably approved manifest plus its referenced cover files. Preserve the original pack read-only and work from a copy.

One manifest row represents one catalogue title and must contain:

| Field | Rule |
|---|---|
| `product_code` | Required; trimmed; 1–64 characters; unique case-insensitively across the pack and production. Use the client-approved ISBN or internal code. |
| `slug` | Required; lowercase ASCII matching `^[a-z0-9]+(?:-[a-z0-9]+)*$`; unique across the pack and production; no `/en/`, `/fr/`, or `catalogue/` prefix. |
| `title_en`, `title_fr` | Required, non-placeholder text in both languages. |
| `description_en`, `description_fr` | Required, non-placeholder text in both languages. |
| `curriculum_alignment_en`, `curriculum_alignment_fr` | Both supplied or both empty. Any curriculum claim requires explicit client approval. |
| `level` | Exactly `primary` or `secondary`. |
| `subject_en`, `subject_fr` | Both required and mapped as one approved bilingual subject pair. No inferred translation. |
| `languages` | Non-empty set containing only `en` and/or `fr`; records edition availability, not UI-copy completeness. |
| `cover_filename` | Required; exact case-sensitive filename present once in the cover pack. |
| `cover_sha256` | Required; lowercase SHA-256 of the approved source file. |
| `featured` | Explicit `true` or `false`. |
| `display_order` | Required non-negative integer, unique within the intended display group. Preserve it in the evidence even though the current public query orders featured titles first and then by creation time. Do not simulate ordering by falsifying timestamps. |
| `publication_authorized` | Explicit `true` or `false`; blank is false. Import remains draft regardless. |
| `authorized_by`, `authorized_at`, `authorization_ref` | Required when `publication_authorized=true`; identify the approver, timestamp, and durable approval artifact/message. |

The pack is incomplete if any row or cover exists outside the manifest, a filename maps to multiple rows unexpectedly, or the manifest was edited after client approval without a recorded re-approval.

## 2. Gate 0 — operator and environment safety

- [ ] Work from the intended repository and record the commit SHA used for validation.
- [ ] Confirm migrations `001`–`003` are applied in the target environment. Migration `002` can fail on a populated branch because `product_code` is `NOT NULL` with no default; reconcile legacy rows before applying it.
- [ ] Confirm the target is production only at the execution step; run all pack validation offline first.
- [ ] Take a timestamped database backup/export of `subjects` and `catalogue_titles`; record its location and restore test/reference.
- [ ] Record pre-import counts for non-demo subjects, drafts, and published titles.
- [ ] Confirm the CMS rebuild hook is configured and healthy, but do not trigger it for draft-only work.
- [ ] Confirm the operator has admin/database access without placing credentials or hook URLs in logs.

Stop on an environment mismatch, unavailable backup, pending migration, or rebuild-hook uncertainty.

## 3. Gate 1 — offline pack validation (no production access)

### 3.1 Custody and completeness

- [ ] Record source-pack filename/version, received timestamp, sender, approver, and approval reference.
- [ ] Compute and record SHA-256 for the manifest and every cover.
- [ ] Verify every computed cover digest equals `cover_sha256`.
- [ ] Confirm every manifest cover exists exactly once and there are no unexplained extra cover files.
- [ ] Reject temporary files, hidden copies, zero-byte files, and filename collisions differing only by case.

### 3.2 Bilingual parity

- [ ] `title_en`, `title_fr`, `description_en`, and `description_fr` are present after trimming for every row.
- [ ] Curriculum alignment is present in both languages or absent in both.
- [ ] No value contains markers such as `TBD`, `TODO`, `sample`, `placeholder`, lorem ipsum, machine-translation notes, or editorial comments.
- [ ] Every subject is an approved EN/FR pair and both labels are unique case-insensitively across the taxonomy.
- [ ] Punctuation, numerals, grade/book numbers, trademarks, and named curriculum authorities agree across locales.
- [ ] `languages` is non-empty and contains no value other than `en` or `fr`. Both UI locales still require complete metadata even for a single-language edition.

This gate checks parity and obvious contradictions; it does not invent translations or certify linguistic quality. Ambiguity goes back to the client.

### 3.3 Codes, slugs, subjects, and flags

- [ ] Product codes pass trim/length rules and are unique under `lower(product_code)`.
- [ ] Slugs pass the canonical regex and are unique case-insensitively in the pack.
- [ ] A read-only production query confirms no code or slug collision with existing non-demo rows.
- [ ] Levels are exactly `primary` or `secondary`.
- [ ] Every title resolves to exactly one approved subject pair; no title is left with `subject_id = NULL`.
- [ ] `featured` and `display_order` are explicit, parseable, and internally consistent.
- [ ] Import logic is insert-only for this batch. It must reject collisions and must not upsert by slug or product code.

### 3.4 Approved-cover checks

- [ ] Format is JPEG, PNG, or WebP; MIME signature matches the extension; size is at most 8 MB.
- [ ] Cover is RGB/sRGB (not CMYK), portrait, and at least 800 × 1200 px.
- [ ] Visual review confirms the cover exactly matches the approved title/code and has no substitutions, generated text, watermarks, mockup furniture, or rights uncertainty.
- [ ] Preview the current 3:4 card crop at 240, 380, and 560 px widths. Reject any crop that removes title, logo, author, edition, or other required cover content; do not alter the approved master without re-approval.
- [ ] The final blob key returned by upload is recorded against the manifest row; no row proceeds without a one-to-one cover mapping.

Gate 1 passes only when the validator reports zero errors and both Developer and QA sign the evidence record.

## 4. Gate 2 — upload approved covers

Uploads happen only after Gate 1 because blob writes are not covered by the database transaction.

1. Upload each approved file once through the authenticated media endpoint.
2. Record `product_code`, original filename, source SHA-256, returned `cover_image_id`, uploader, and timestamp.
3. As an authenticated admin, fetch each draft-only blob and verify its decoded dimensions and digest/visual identity.
4. Do not expose blob keys in public notes. Unreferenced uploads remain non-public; record any orphan for later controlled cleanup.

Failure of any upload stops the batch before database mutation. Never replace a failed or rejected cover with a substitute.

## 5. Gate 3 — one transactional DRAFT import

Do not use repeated admin API `POST` calls for the bulk import: each request commits independently and cannot guarantee all-or-nothing behavior. Use a reviewed import transaction with a temporary staging table or equivalent database transaction.

Within one transaction:

1. Set a short statement/lock timeout appropriate to the maintenance window.
2. Load the validated manifest copy and cover-key mapping into a temporary staging table.
3. Re-run all required-field, enum, bilingual-pair, code, slug, subject, authorization-metadata, and cover-key assertions in SQL.
4. Lock/check the relevant `subjects` and `catalogue_titles` keys so a concurrent editor cannot introduce a collision between validation and insert.
5. Insert only approved bilingual subject pairs not already present; resolve every staged title to exactly one `subject_id`.
6. Insert every title with `published = false` and `is_demo = false`, regardless of `publication_authorized`.
7. Assert inserted row count equals manifest row count; assert zero inserted rows are published; assert every inserted row has a product code, subject, cover, valid locale metadata, and exact staged slug.
8. Write the returned title IDs and resolved subject IDs to the evidence record.
9. Commit only if every assertion succeeds. On any error, roll back the entire database batch.

Never trigger the rebuild hook for this draft-only import. Do not delete the QA rows in this transaction unless the conditional clearance in section 7 is still valid at execution time.

## 6. Gate 4 — post-import draft verification

- [ ] Admin GET returns exactly the imported titles as drafts; no unexpected rows changed.
- [ ] Row-by-row comparison against the immutable manifest passes for all stored fields.
- [ ] Every cover renders for an authenticated admin and maps to the correct title.
- [ ] Every subject resolves to the approved EN/FR labels; filters yield the expected draft taxonomy in the QA method/tooling.
- [ ] Slug collision query returns zero; planned detail URLs are recorded as `/en/catalogue/<slug>/` and `/fr/catalogue/<slug>/`.
- [ ] The public catalogue, homepage catalogue block, sitemap, and detail routes remain unchanged because all imported rows are drafts.
- [ ] No rebuild was triggered by draft creation.

Developer and Dell must sign Gate 4 before any publication step.

## 7. Conditional disposal of the two QA rows

Rows in scope:

- `qa-catalogue-1789382004024` / `LEGACY-f1d18c341597`
- `qa-20260914-1125-catalogue` / `LEGACY-31ad1891c4df`

Dell's 2026-09-15 verdict is **REMOVE**, conditional on both checks below. No deletion was performed when this runbook was written.

- [x] Repository-wide search found no test, CI, fixture, script, or runbook reference to either slug or code.
- [x] The approved import design is insert-only and rejects collisions; it does not upsert or recreate these QA identities.
- [ ] Re-run both checks against the execution commit immediately before deletion and record the command output/commit SHA.
- [ ] Confirm both rows are still unpublished and match both the exact slug and exact placeholder code before targeting them.

If all checks remain clear, delete exactly those two matched rows during the maintenance window and record returned IDs. A mismatch aborts deletion and is escalated to Dell. Never use a broad `qa-*` or `LEGACY-*` delete.

## 8. Gate 5 — publication authorization and controlled release

Publication is a separate operation from import.

1. Freeze the verified draft set by recording title IDs plus a digest of the stored values and cover mapping.
2. Reconfirm each candidate has `publication_authorized=true`, `authorized_by`, `authorized_at`, and `authorization_ref` in the approved manifest. Authorization is per title; do not infer batch approval from delivery alone.
3. Exclude every unauthorized, disputed, changed-after-approval, or incomplete row. Blank means unauthorized.
4. In one transaction, update `published=true` only for the exact authorized IDs whose stored digest still matches the reviewed draft snapshot.
5. Assert affected count equals the authorized release list, commit, then trigger one rebuild after the commit.
6. Record rebuild request time and deploy ID/status. A hook failure does not roll back valid database publication, but the release remains incomplete until a successful deploy.

Do not publish from the admin UI one row at a time during the initial bulk release.

## 9. Gate 6 — live verification and closeout

After the production deploy succeeds:

- [ ] Both `/en/catalogue/` and `/fr/catalogue/` contain the authorized titles only.
- [ ] Every title has the correct localized title, description, curriculum copy, level, subject, language badges, and approved cover.
- [ ] Every EN and FR detail route returns 200; unauthorized/draft slugs are absent/404.
- [ ] Level, subject, and language filters plus visible counts behave correctly in both locales.
- [ ] Featured titles appear as intended on the homepage; record the current ordering behavior and any client-requested ordering delta.
- [ ] `sitemap.xml` includes authorized detail routes only.
- [ ] Source HTML contains the expected catalogue data (the site is statically rendered).
- [ ] Media responses use an image MIME type and do not expose draft-only covers publicly.
- [ ] No sample/demo content or either disposed QA slug is visible.

Attach the evidence bundle to the board task, then move it to `review` for client verification. Do not mark it `done` until client sign-off.

## 10. Evidence record template

Record this on the shared board or attach a durable file and link it from the task:

```text
Catalogue import evidence
Task: c760c1b8-d244-40b7-b415-21ef2bc3e726
Repository commit:
Target environment:
Source-pack version / manifest SHA-256:
Approval reference:
Validator result: rows __; subjects __; covers __; errors 0; warnings __
Pre-import counts: subjects __; drafts __; published __
Backup reference / restore check:
Cover mapping evidence reference:
Draft transaction: started __; committed __; inserted titles __; inserted subjects __
QA rows: retained/removed; Dell confirmation reference; returned IDs (if removed):
Draft verification: Developer __ at __; QA __ at __
Authorized release IDs/count:
Publication transaction / approver:
Rebuild deploy ID/status:
EN/FR live verification result:
Residual blockers or follow-up:
```

## 11. Abort and rollback rules

- Before a database commit: roll back the transaction; record the failed assertion. Uploaded but unreferenced covers remain non-public and are logged for controlled cleanup.
- After draft commit but before publication: leave verified drafts unpublished or delete the exact imported IDs in a new reviewed transaction; never publish a partial batch to “test”.
- After publication but before/after deploy: set `published=false` for the exact release IDs in a new transaction, trigger one rebuild, verify removal in both locales and the sitemap, and preserve the incident evidence.
- Any source-pack change after approval restarts Gate 1 for the affected rows and covers.

