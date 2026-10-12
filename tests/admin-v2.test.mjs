import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import {
  cloneRecord,
  calendarDateForPayload,
  hydrateEditorField,
  editorBaseline,
  assertReadFields,
  operationFieldLock,
  fingerprint,
  mergeOwned,
  mergeArrayItem,
  mergeRowControls,
  isSingletonEditor,
  legalPreviewSections,
  secondsToMilliseconds,
  catalogueBadges,
  countLabel,
  sortedRecords,
  pageRecords,
} from "../src/lib/admin-v2-model.ts";
import {
  validateHomepage,
  validateAbout,
} from "../netlify/functions/_shared/cms-validation.ts";
test("section save preserves nullable siblings, media, arrays, flags and unknown supported values", () => {
  const original = {
    heritage_copy_en: "before",
    heritage_copy_fr: "avant",
    published: true,
    optional: null,
    hero_image_id: "private/image",
    team_capacity_blocks: [
      { title: "Legacy", title_en: null, tags_en: null, custom: "kept" },
    ],
  };
  const edited = mergeOwned(
    original,
    { heritage_copy_en: "after", published: false, optional: "" },
    ["heritage_copy_en", "heritage_copy_fr"],
  );
  assert.deepEqual(edited, { ...original, heritage_copy_en: "after" });
  edited.team_capacity_blocks[0].title = "working";
  assert.equal(original.team_capacity_blocks[0].title, "Legacy");
});
test("row editing retains sibling order and unknown fields without fabricated row ids", () => {
  const parent = {
    published: true,
    items: [{ title: "a", tags: null, custom: "keep" }, { title: "b" }],
  };
  const result = mergeArrayItem(parent, "items", 0, { title: "changed" });
  assert.deepEqual(result, {
    published: true,
    items: [{ title: "changed", tags: null, custom: "keep" }, { title: "b" }],
  });
  assert.deepEqual(
    mergeArrayItem(parent, "items", null, { title: "c" }).items.map(
      (r) => r.title,
    ),
    ["a", "b", "c"],
  );
  assert.throws(() => mergeArrayItem(parent, "items", 9, {}));
});
test("deep fingerprint ignores object key order but includes all nested/array/media changes", () => {
  const record = {
    id: "a",
    rows: [{ title: "one" }, { title: "two" }],
    media: null,
  };
  assert.equal(
    fingerprint(record),
    fingerprint({ media: null, rows: record.rows, id: "a" }),
  );
  for (const edit of [
    { ...record, rows: [...record.rows].reverse() },
    { ...record, media: "upload" },
    { ...record, rows: [...record.rows, { title: "new" }] },
  ])
    assert.notEqual(fingerprint(record), fingerprint(edit));
  assert.deepEqual(cloneRecord(record), record);
});
test("seconds adapter preserves custom untouched millisecond values and enforces changed half steps", () => {
  for (const seconds of [3, 6, 30, 3.5, 29.5])
    assert.equal(secondsToMilliseconds(seconds, 6000), seconds * 1000);
  assert.equal(secondsToMilliseconds(6.123, 6123), 6123);
  for (const seconds of [NaN, Infinity, 2.5, 30.5, 6.1])
    assert.throws(() => secondsToMilliseconds(seconds, 6000));
});
test("published Other developed covers are public regardless of rights checkbox", () => {
  for (const rights of [false, true]) {
    const state = catalogueBadges({
      published: true,
      classification: "other_developed",
      featured: false,
      cover_image_id: "cover",
      cover_rights_approved: rights,
    });
    assert.deepEqual(state.labels, [
      "Published · Text eligible",
      "Not featured",
      "Other developed",
      "Cover · Public eligible",
    ]);
    assert.equal(state.coverReason, "");
  }
});
test("catalogue badges keep draft/text/classification/feature/cover axes separate", () => {
  const base = {
    published: true,
    classification: "national_book_list_verified",
    featured: true,
    cover_image_id: "cover",
    cover_rights_approved: true,
  };
  assert.equal(catalogueBadges(base).labels[3], "Cover · Public eligible");
  assert.equal(
    catalogueBadges({ ...base, published: false }).labels[0],
    "Draft",
  );
  assert.equal(
    catalogueBadges({ ...base, classification: "unclassified" }).labels[0],
    "Published · Listing withheld",
  );
  assert.equal(
    catalogueBadges({ ...base, cover_image_id: null }).labels[3],
    "No cover added",
  );
});
test("count grammar covers zero, singular, plural and irregular plurals", () => {
  assert.equal(countLabel(0, "draft"), "0 drafts");
  assert.equal(countLabel(1, "draft"), "1 draft");
  assert.equal(countLabel(2, "draft"), "2 drafts");
  assert.equal(countLabel(1, "subject"), "1 subject");
  assert.equal(countLabel(2, "entry", "entries"), "2 entries");
});
test("sort falls back to title and stable id when edit dates are missing, never creation dates", () => {
  const rows = [
    { id: "b", title: "A", created_at: "2099-01-01" },
    { id: "a", title: "A" },
    { id: "c", title: "B", updated_at: "2026-10-12" },
  ];
  assert.deepEqual(
    sortedRecords(rows, "updated", (r) => r.title).map((r) => r.id),
    ["c", "a", "b"],
  );
  assert.deepEqual(
    sortedRecords(rows, "za", (r) => r.title).map((r) => r.id),
    ["c", "a", "b"],
  );
});
test("pagination clamps after deletion and respects the 24 record threshold", () => {
  const rows = Array.from({ length: 49 }, (_, i) => ({ id: i }));
  assert.equal(pageRecords(rows, 2).rows.length, 24);
  assert.equal(pageRecords(rows, 3).rows.length, 1);
  assert.equal(pageRecords(rows.slice(0, 24), 8).page, 1);
  assert.equal(pageRecords([], 1).pages, 1);
});
test("whole-record merge remains valid through original page validators", () => {
  const original = {
    heritage_copy_en: "heritage",
    heritage_copy_fr: "histoire",
    purpose_en: "purpose",
    purpose_fr: "but",
    vision_en: "vision",
    vision_fr: "vision",
    mission_en: "mission",
    mission_fr: "mission",
    values_en: "values",
    values_fr: "valeurs",
    team_capacity_blocks: [],
    published: true,
  };
  const merged = mergeOwned(
    original,
    { purpose_en: "updated", purpose_fr: "modifié" },
    ["purpose_en", "purpose_fr"],
  );
  assert.equal(validateAbout(merged).ok, true);
  assert.equal(merged.published, true);
  assert.equal(merged.heritage_copy_en, "heritage");
});

test("row serialization ignores unnamed icon pickers and preserves untouched nullable metadata", () => {
  const row = {
    title: "Legacy",
    title_en: null,
    tags_en: null,
    icon: "custom",
  };
  const result = mergeRowControls(
    row,
    [
      { value: "custom", initial: "custom" },
      { key: "title_en", value: "Legacy", initial: "Legacy" },
      { key: "tags_en", value: "", initial: "" },
      { key: "icon", value: "custom", initial: "custom" },
    ],
    true,
  );
  assert.deepEqual(result, row);
  assert.deepEqual(
    mergeRowControls(
      row,
      [
        { key: "title_en", value: "New", initial: "Legacy" },
        { key: "tags_en", value: "a, b", initial: "" },
      ],
      true,
    ),
    { ...row, title: "New", title_en: "New", tags_en: ["a", "b"] },
  );
});

test("homepage slide editors stay independent from homepage whole-record edits", () => {
  assert.equal(isSingletonEditor(true, "homepage", "homepage"), true);
  assert.equal(isSingletonEditor(true, "homepage", "hero"), false);
  assert.equal(isSingletonEditor(true, "about", "about"), true);
  assert.equal(isSingletonEditor(false, "services", "process"), false);
});

test("legal preview retains the existing block grammar and treats HTML as text", () => {
  assert.deepEqual(
    legalPreviewSections(
      "Intro\n\n## Heading\nSame block body\n\nNext paragraph",
    ),
    [
      { title: null, body: ["Intro"] },
      { title: "Heading", body: ["Same block body", "Next paragraph"] },
    ],
  );
  assert.deepEqual(
    legalPreviewSections(
      "<script>alert(1)</script>\n## Literal inline heading",
    ),
    [
      {
        title: null,
        body: ["<script>alert(1)</script>\n## Literal inline heading"],
      },
    ],
  );
});

test("operation lock preserves focused controls, rolls back user changes and retains successful media attachment", () => {
  const attributes = new Map();
  const field = {
    value: "old",
    checked: false,
    readOnly: false,
    disabled: false,
    setAttribute: (k, v) => attributes.set(k, v),
    removeAttribute: (k) => attributes.delete(k),
  };
  const lock = operationFieldLock([field]);
  assert.equal(field.disabled, false);
  assert.equal(field.readOnly, true);
  field.value = "unexpected edit";
  field.checked = true;
  lock.rollback(field);
  assert.equal(field.value, "old");
  assert.equal(field.checked, false);
  field.value = "uploaded-media-id";
  lock.release();
  assert.equal(field.value, "uploaded-media-id");
  assert.equal(field.readOnly, false);
  assert.equal(attributes.has("aria-disabled"), false);
});

test("pending file changes never restore a forbidden nonempty file-input value", () => {
  let current = "C:\\fakepath\\selected.jpg";
  const field = {
    type: "file",
    get value() {
      return current;
    },
    set value(next) {
      if (next) throw new Error("File input cannot be assigned a path");
      current = next;
    },
    setAttribute() {},
    removeAttribute() {},
  };
  const lock = operationFieldLock([field]);
  assert.doesNotThrow(() => lock.rollback(field));
  assert.equal(field.value, "");
  lock.release();
});

test("incomplete GETs cannot hydrate a blank editor, while explicit empty/null saved values remain recognizable", () => {
  assert.throws(
    () =>
      assertReadFields({ id: "n", published: false }, [
        "headline_en",
        "hero_image_id",
      ]),
    /incomplete saved content/,
  );
  assert.doesNotThrow(() =>
    assertReadFields({ headline_en: "", hero_image_id: null }, [
      "headline_en",
      "hero_image_id",
    ]),
  );
});

test("malformed boolean and array responses cannot silently change flags or crash previews", () => {
  assert.throws(
    () => assertReadFields({ featured: "false" }, ["featured"]),
    /incomplete saved content/,
  );
  assert.throws(
    () =>
      assertReadFields({ team_capacity_blocks: "[]" }, [
        "team_capacity_blocks",
      ]),
    /incomplete saved content/,
  );
  assert.throws(() => assertReadFields(null, []), /incomplete saved content/);
  assert.doesNotThrow(() =>
    assertReadFields(
      { featured: false, team_capacity_blocks: [], tags_en: null },
      ["featured", "team_capacity_blocks"],
    ),
  );
});

test("null singleton setup keeps the server baseline empty instead of creating a false conflict from defaults", () => {
  assert.deepEqual(
    editorBaseline(null, true, {
      published: false,
      hero_autoplay_interval: 6000,
    }),
    {},
  );
  assert.equal(
    fingerprint(editorBaseline(null, true, { published: false })),
    fingerprint({}),
  );
  assert.deepEqual(editorBaseline(null, false, { published: false }), {
    published: false,
  });
  assert.deepEqual(
    editorBaseline({ published: true, media: null }, true, {
      published: false,
    }),
    { published: true, media: null },
  );
});

test("hydration fills text and dates while retaining explicit checkbox defaults only for new fields", () => {
  const text = { type: "text", value: "" };
  hydrateEditorField(text, "Saved title");
  assert.equal(text.value, "Saved title");
  const date = { type: "date", value: "" };
  hydrateEditorField(date, "2026-10-12T00:00:00Z");
  assert.equal(date.value, "2026-10-12");
  const checkbox = { type: "checkbox", value: "on", checked: true };
  hydrateEditorField(checkbox, undefined);
  assert.equal(checkbox.checked, true);
  hydrateEditorField(checkbox, false);
  assert.equal(checkbox.checked, false);
  hydrateEditorField(text, null);
  assert.equal(text.value, "");
});

test("calendar dates round-trip without replacing the stated date or null with today", () => {
  assert.equal(
    calendarDateForPayload("2026-10-12T00:00:00.000Z"),
    "2026-10-12",
  );
  assert.equal(calendarDateForPayload("2026-10-12"), "2026-10-12");
  assert.equal(calendarDateForPayload(null), null);
  assert.equal(calendarDateForPayload("invalid"), "invalid");
});

test('admin preview cards show a truncated excerpt with no full-summary disclosure', () => {
  const read = (file) => fs.readFileSync(new URL(`../src/lib/${file}`, import.meta.url), 'utf8');
  for (const file of ['admin-v2.ts', 'admin-v2-preview.ts']) {
    const source = read(file);
    assert.doesNotMatch(source, /View (full|fallback) summary/);
    assert.doesNotMatch(source, /fullText\(/);
  }
  assert.match(read('admin-v2-preview.ts'), /export function excerpt\(parent: HTMLElement, copy: string\) \{\n  parent\.append\(node\("p", copy, "admin-excerpt"\)\);\n\}/);
});

test('live QA polish: catalogue labels, contact reference target and delete-confirm focus', () => {
  const read = (file) => fs.readFileSync(new URL(`../src/${file}`, import.meta.url), 'utf8');
  const catalogue = read('pages/admin/catalogue.astro');
  assert.match(catalogue, /<label>URL name<input name="slug"/);
  assert.match(catalogue, /<label>Product code or ISBN<input name="product_code"/);
  assert.doesNotMatch(catalogue, /<label>Slug<|ISBN \/ Product code/);
  assert.match(read('lib/admin-v2.ts'), /"Office address, email and phone — Site settings",\n\s*"button secondary admin-reference-link"/);
  const client = read('lib/admin-client.ts');
  assert.match(client, /<h2 id="adminConfirmTitle" tabindex="-1">/);
  assert.match(client, /aria-describedby', 'adminConfirmMessage'/);
  assert.doesNotMatch(client, /autofocus/);
  assert.match(client, /dialog\.returnValue = 'cancel';/);
  assert.match(client, /querySelector<HTMLElement>\('#adminConfirmTitle'\)\?\.focus\(\)/);
  assert.ok(client.indexOf('value="cancel"') < client.indexOf('value="confirm"'));
});
