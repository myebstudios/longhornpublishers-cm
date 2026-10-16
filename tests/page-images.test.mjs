import assert from "node:assert/strict";
import fs from "node:fs";
import test, { before, after } from "node:test";
import { stripTypeScriptTypes } from "node:module";
import { serviceImageSource } from "../src/lib/service-image.ts";
import { PGlite } from "@electric-sql/pglite";
import {
  PAGE_IMAGE_KEYS,
  PAGE_IMAGE_SLOTS,
  pageImageSource,
  validatePageImage,
} from "../src/lib/page-image-slots.ts";
import { createPageImagesHandler } from "../netlify/functions/_shared/page-images-handler.ts";
import { createServicesHandler } from "../netlify/functions/_shared/services-handler.ts";
import { isPubliclyApproved } from "../netlify/functions/_shared/media-approval.ts";

const KEY = "uploads/00000000-0000-0000-0000-000000000001.png";
const REPLACEMENT = "uploads/00000000-0000-0000-0000-000000000002.webp";
const read = (p) =>
  fs.readFileSync(new URL(`../${p}`, import.meta.url), "utf8");
let pg, db, originalServices;
before(async () => {
  pg = new PGlite();
  db = {
    sql: async (strings, ...values) =>
      (
        await pg.query(
          strings.reduce((s, part, i) => s + (i ? `$${i}` : "") + part, ""),
          values,
        )
      ).rows,
  };
  const root = new URL("../netlify/database/migrations/", import.meta.url);
  for (const name of fs
    .readdirSync(root)
    .filter((name) => /^\d/.test(name))
    .sort()) {
    if (name === "018_page_images")
      originalServices = (await pg.query("SELECT * FROM services ORDER BY id"))
        .rows;
    await pg.exec(
      fs.readFileSync(new URL(`${name}/migration.sql`, root), "utf8"),
    );
  }
});
after(async () => {
  await pg?.close();
});
const req = (method, body, page = "about") =>
  new Request(`https://local/api/page-images-admin?page=${page}`, {
    method,
    ...(body === undefined
      ? {}
      : {
          body: JSON.stringify(body),
          headers: { "Content-Type": "application/json" },
        }),
  });
const changes = [],
  mediaPurges = [];
const deps = () => ({
  db,
  authorize: async () => null,
  imageExists: async (key) => [KEY, REPLACEMENT].includes(key),
  purgeMedia: async (...keys) => {
    mediaPurges.push(keys);
  },
  purgePublic: async (...tags) => {
    changes.push(tags);
  },
  purgeIfPublic: async (kind, state, ...tags) => {
    if (state.wasPublished || state.isPublished) changes.push(tags);
  },
});

test("additive migration preserves existing services and all new image fields default to null", async () => {
  const rows = (await pg.query("SELECT * FROM services ORDER BY id")).rows;
  assert.equal(rows.length, originalServices.length);
  for (let i = 0; i < rows.length; i++) {
    const { image_id, ...rest } = rows[i];
    assert.equal(image_id, null);
    assert.deepEqual(rest, originalServices[i]);
  }
  assert.deepEqual((await pg.query("SELECT * FROM page_images")).rows, []);
  for (const key of PAGE_IMAGE_KEYS)
    await pg.query("INSERT INTO page_images(key,image_id) VALUES ($1,null)", [
      key,
    ]);
  await assert.rejects(
    pg.query("INSERT INTO page_images(key) VALUES ('unknown.hero')"),
  );
  await pg.exec("DELETE FROM page_images");
});

test("every declared slot retains the exact existing fallback until assigned, and removal restores it", () => {
  assert.equal(PAGE_IMAGE_KEYS.length, 14);
  for (const [page, slots] of Object.entries(PAGE_IMAGE_SLOTS))
    for (const slot of slots) {
      const key = `${page}.${slot.slot}`;
      assert.ok(
        fs.existsSync(
          new URL(`../public/img/${slot.fallback}`, import.meta.url),
        ),
        key,
      );
      assert.equal(
        pageImageSource(page, slot.slot, []),
        `/img/${slot.fallback}`,
      );
      assert.equal(
        pageImageSource(page, slot.slot, [{ key, image_id: KEY }]),
        `/api/media/${KEY}`,
      );
      assert.equal(
        pageImageSource(page, slot.slot, [{ key, image_id: null }]),
        `/img/${slot.fallback}`,
      );
      assert.equal(
        pageImageSource(page, slot.slot, [
          { key, image_id: "https://bad.example/x.png" },
        ]),
        `/img/${slot.fallback}`,
      );
    }
  assert.throws(() => pageImageSource("about", "unknown", []));
});

test("slot validation rejects arbitrary keys, omitted images, URLs, traversal, SVG and oversized or malformed inputs", () => {
  for (const body of [
    null,
    [],
    {},
    { key: "__proto__.hero", image_id: KEY },
    { key: "homepage.hero", image_id: KEY },
    { key: "about.hero" },
    { key: "about.hero", image_id: 42 },
    { key: "about.hero", image_id: "https://example.com/x.png" },
    { key: "about.hero", image_id: "uploads/../x.png" },
    { key: "about.hero", image_id: KEY.replace(".png", ".svg") },
    { key: "about.hero", image_id: "x".repeat(300) },
    { key: "about.hero", image_id: KEY, published: false },
  ])
    assert.equal(validatePageImage(body).ok, false, JSON.stringify(body));
  for (const key of PAGE_IMAGE_KEYS)
    for (const image_id of [null, KEY])
      assert.equal(validatePageImage({ key, image_id }).ok, true);
});

test("page images API requires admin access for both reads and writes, accepts only GET/PUT and validates page", async () => {
  for (const status of [401, 403]) {
    const handler = createPageImagesHandler({
      ...deps(),
      authorize: async () => new Response("Denied", { status }),
    });
    for (const request of [
      req("GET"),
      req("PUT", { key: "about.hero", image_id: KEY }),
    ])
      assert.equal((await handler(request)).status, status);
  }
  const handler = createPageImagesHandler(deps());
  const unsupported = await handler(req("POST", {}));
  assert.equal(unsupported.status, 405);
  assert.equal(unsupported.headers.get("allow"), "GET, PUT");
  for (const page of ["homepage", "__proto__", "about%27"])
    assert.equal((await handler(req("GET", undefined, page))).status, 400);
  assert.equal(
    (
      await handler(
        new Request("https://local/api/page-images-admin", {
          method: "PUT",
          body: "{bad",
        }),
      )
    ).status,
    400,
  );
  assert.equal(
    (
      await handler(
        req("PUT", {
          key: "about.hero",
          image_id: KEY.replace("0001", "9999"),
        }),
      )
    ).status,
    400,
  );
});

test("page image save and clear preserve sibling slots, other pages and page copy, and purge affected media/page tags", async () => {
  const handler = createPageImagesHandler(deps());
  const copy = (await pg.query("SELECT * FROM about_page")).rows;
  for (const key of ["about.heritage", "news.hero"])
    assert.equal(
      (await handler(req("PUT", { key, image_id: KEY }))).status,
      200,
    );
  const response = await handler(
    req("PUT", { key: "about.hero", image_id: REPLACEMENT }),
  );
  assert.equal(response.status, 200);
  assert.equal(response.headers.get("cache-control"), "no-store");
  assert.equal((await response.json()).image_id, REPLACEMENT);
  const rows = await (await handler(req("GET"))).json();
  assert.equal(rows.length, 2);
  assert.ok(rows.every((r) => r.key.startsWith("about.")));
  assert.deepEqual((await pg.query("SELECT * FROM about_page")).rows, copy);
  assert.equal(
    (await handler(req("PUT", { key: "about.hero", image_id: null }))).status,
    200,
  );
  assert.equal(
    (
      await pg.query(
        "SELECT image_id FROM page_images WHERE key='about.heritage'",
      )
    ).rows[0].image_id,
    KEY,
  );
  assert.equal(
    (await pg.query("SELECT image_id FROM page_images WHERE key='news.hero'"))
      .rows[0].image_id,
    KEY,
  );
  assert.deepEqual(changes.at(-1), ["about"]);
  assert.deepEqual(mediaPurges.at(-1), [REPLACEMENT, null]);
});

test("media approval includes saved page images, revokes removal, protects unsaved uploads and requires service publication", async () => {
  await pg.exec("DELETE FROM page_images");
  for (const localDemo of [false, true]) {
    assert.equal(await isPubliclyApproved(KEY, db, localDemo), false);
    await pg.query(
      "INSERT INTO page_images(key,image_id) VALUES ('contact.hero',$1)",
      [KEY],
    );
    assert.equal(await isPubliclyApproved(KEY, db, localDemo), true);
    await pg.exec("DELETE FROM page_images");
    assert.equal(await isPubliclyApproved(KEY, db, localDemo), false);
    const row = (
      await pg.query(
        "INSERT INTO services(name_en,name_fr,category,description_en,description_fr,image_id,published) VALUES ('Test','Test','editorial','EN','FR',$1,false) RETURNING id",
        [KEY],
      )
    ).rows[0];
    assert.equal(await isPubliclyApproved(KEY, db, localDemo), false);
    await pg.query("UPDATE services SET published=true WHERE id=$1", [row.id]);
    assert.equal(await isPubliclyApproved(KEY, db, localDemo), true);
    await pg.query("UPDATE services SET image_id=$1 WHERE id=$2", [
      REPLACEMENT,
      row.id,
    ]);
    assert.equal(await isPubliclyApproved(KEY, db, localDemo), false);
    assert.equal(await isPubliclyApproved(REPLACEMENT, db, localDemo), true);
    await pg.query("UPDATE services SET published=false WHERE id=$1", [row.id]);
    assert.equal(await isPubliclyApproved(REPLACEMENT, db, localDemo), false);
    await pg.query("DELETE FROM services WHERE id=$1", [row.id]);
  }
});

const service = {
  name_en: "Custom service",
  name_fr: "Service personnalisé",
  slug: "custom-image-test",
  short_en: "Summary",
  short_fr: "Résumé",
  category: "creative",
  description_en: "English description",
  description_fr: "Description française",
  icon: "pen",
  sort_order: 12,
  published: true,
};
test("services API creates, replaces and removes images, and older text-only PUTs preserve the stored image", async () => {
  const handler = createServicesHandler(deps());
  const request = (method, body, id) =>
    new Request(`https://local/api/services-admin${id ? `?id=${id}` : ""}`, {
      method,
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
  const created = await handler(request("POST", { ...service, image_id: KEY }));
  assert.equal(created.status, 201);
  let row = await created.json();
  const id = row.id;
  const original = { ...row };
  row = await (
    await handler(
      request("PUT", { ...service, name_en: "Text-only update" }, id),
    )
  ).json();
  assert.equal(row.image_id, KEY);
  assert.equal(row.name_en, "Text-only update");
  assert.equal(row.description_fr, original.description_fr);
  row = await (
    await handler(request("PUT", { ...service, image_id: REPLACEMENT }, id))
  ).json();
  assert.equal(row.image_id, REPLACEMENT);
  assert.deepEqual(mediaPurges.at(-1), [KEY, REPLACEMENT]);
  assert.equal(
    (
      await handler(
        request(
          "PUT",
          { ...service, image_id: KEY.replace("0001", "9999") },
          id,
        ),
      )
    ).status,
    400,
  );
  row = await (
    await handler(request("PUT", { ...service, image_id: null }, id))
  ).json();
  assert.equal(row.image_id, null);
  assert.equal(row.short_fr, original.short_fr);
  assert.equal(
    (
      await handler(
        request("PUT", { ...service, image_id: "//evil.example/x" }, id),
      )
    ).status,
    400,
  );
  await handler(request("PUT", { ...service, image_id: KEY }, id));
  assert.equal((await handler(request("DELETE", undefined, id))).status, 200);
  assert.deepEqual(mediaPurges.at(-1), [KEY]);
});

test("all six public templates read page images and the shared editor retains the existing upload and dirty guards", () => {
  for (const [name, page] of [
    ["About", "about"],
    ["Services", "services"],
    ["Why", "why"],
    ["Catalogue", "catalogue"],
    ["News", "news"],
    ["Contact", "contact"],
  ]) {
    const source = read(`src/components/pages/${name}.astro`);
    assert.ok(source.includes(`getPageImages('${page}')`));
    assert.match(source, /img=\{pageImage\('hero'\)\}/);
  }
  assert.match(
    read("src/components/pages/About.astro"),
    /pageImage\('heritage'\)/,
  );
  assert.match(
    read("src/components/pages/About.astro"),
    /pageImage\('quality'\)/,
  );
  assert.match(
    read("src/components/pages/Services.astro"),
    /serviceImageSource\(service\)/,
  );
  assert.match(read("src/lib/cms-content.ts"), /image_id: typeof row.image_id/);
  assert.match(
    read("src/lib/admin-v2.ts"),
    /mountPageImages\(page, editor, canvas\)/,
  );
  const ui = read("src/lib/admin-page-images.ts");
  for (const contract of [
    /editor.open\(/,
    /uploadMedia\(selected\)/,
    /editor.setPending\(1\)/,
    /editor.markClean\(/,
    /fingerprint\(latest\) !== fingerprint\(baseline\)/,
  ])
    assert.match(ui, contract);
  assert.match(ui, /editor\.closeNow\(\s*section\.querySelector/);
  assert.match(
    read("src/lib/admin-v2.ts"),
    /form\.getAttribute\("id"\) === "serviceForm"/,
  );
});

test("service previews and public splits keep slug/category defaults, override them with uploads and restore them on removal", () => {
  assert.equal(
    serviceImageSource({ id: "editing", discipline: "editorial" }),
    "/img/lh-student-reading.jpg",
  );
  assert.equal(
    serviceImageSource({
      id: "db-uuid",
      slug: "printing",
      category: "production",
    }),
    "/img/lh-print-inspection-wide.jpg",
  );
  assert.equal(
    serviceImageSource({ slug: "custom", category: "creative" }),
    "/img/lh-creative-wall.jpg",
  );
  assert.equal(
    serviceImageSource({ slug: "custom", category: "creative", image_id: KEY }),
    `/api/media/${KEY}`,
  );
  assert.equal(
    serviceImageSource({
      slug: "custom",
      category: "creative",
      image_id: null,
    }),
    "/img/lh-creative-wall.jpg",
  );
});

test("root-relative page-image defaults retain the same production responsive widths as original bare filenames", async () => {
  const source = read("src/lib/images.ts")
    .replace(
      "'./image-sizes'",
      JSON.stringify(
        new URL("../src/lib/image-sizes.ts", import.meta.url).href,
      ),
    )
    .replace("import.meta.env.PROD", "true");
  const { responsive } = await import(
    `data:text/javascript;base64,${Buffer.from(stripTypeScriptTypes(source)).toString("base64")}`
  );
  for (const slots of Object.values(PAGE_IMAGE_SLOTS))
    for (const { fallback } of slots)
      assert.deepEqual(
        responsive(`/img/${fallback}`),
        responsive(fallback),
        fallback,
      );
});
