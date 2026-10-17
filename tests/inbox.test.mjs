import assert from "node:assert/strict";
import fs from "node:fs";
import test, { before, after } from "node:test";
import { PGlite } from "@electric-sql/pglite";
import {
  mapSubmission,
  storeSubmission,
  createSubmissionEventHandler,
} from "../netlify/functions/_shared/inbox-submissions.ts";
import {
  createInboxHandler,
  parseInboxQuery,
  validateInboxStatus,
} from "../netlify/functions/_shared/inbox-api.ts";
import {
  replyLink,
  replySubject,
  newsletterCsv,
} from "../src/lib/admin-inbox-model.ts";
let pg, db;
before(async () => {
  pg = new PGlite();
  await pg.exec(
    fs.readFileSync(
      new URL(
        "../netlify/database/migrations/019_form_submissions/migration.sql",
        import.meta.url,
      ),
      "utf8",
    ),
  );
  db = {
    sql: async (strings, ...values) =>
      (
        await pg.query(
          strings.reduce((sql, part, i) => sql + (i ? `$${i}` : "") + part, ""),
          values,
        )
      ).rows,
  };
});
after(async () => {
  await pg?.close();
});
const payload = (id, data = {}, form = "contact") => ({
  id,
  form_name: form,
  created_at: "2026-10-17T10:00:00Z",
  data: { name: "Test reader", email: "reader@example.invalid", ...data },
});
const handler = () => createInboxHandler({ db, authorize: async () => null });
const req = (query = "", method = "GET", body) =>
  new Request(`https://example.invalid/api/form-submissions-admin${query}`, {
    method,
    ...(body === undefined
      ? {}
      : {
          body: JSON.stringify(body),
          headers: { "Content-Type": "application/json" },
        }),
  });
async function reset() {
  await pg.exec("TRUNCATE form_submissions");
}

test("maps actual contact names, nullable fields, arrays and clean original JSON", () => {
  const value = mapSubmission(
    payload("netlify-1", {
      projectType: "Publishing",
      languages: ["EN", "FR"],
      phone: "",
      "bot-field": "discard",
      "form-name": "contact",
      extra: { key: "<script>" },
    }),
  );
  assert.equal(value.project_type, "Publishing");
  assert.equal(value.languages, "EN, FR");
  assert.equal(value.phone, null);
  assert.equal(value.created_at, "2026-10-17T10:00:00.000Z");
  assert.deepEqual(value.data.extra, { key: "<script>" });
  assert.ok(!("bot-field" in value.data));
  assert.ok(!("form-name" in value.data));
  assert.equal(value.data.projectType, "Publishing");
  assert.equal(mapSubmission(payload("x", {}, "unknown")), null);
  for (const p of [
    null,
    {},
    { ...payload("x"), id: "" },
    { ...payload("x"), created_at: "bad" },
    { ...payload("x"), data: [] },
  ])
    assert.equal(mapSubmission(p), null);
});
test("idempotent insert keeps first payload and later read status; insert defaults and constraints work", async () => {
  await reset();
  assert.equal(await storeSubmission(db, payload("same")), "stored");
  const [original] = await db.sql`SELECT * FROM form_submissions`;
  assert.equal(original.status, "new");
  assert.ok(original.id);
  assert.ok(original.updated_at);
  await db.sql`UPDATE form_submissions SET status = 'read'`;
  assert.equal(
    await storeSubmission(db, payload("same", { message: "Retry changed" })),
    "duplicate",
  );
  const rows = await db.sql`SELECT * FROM form_submissions`;
  assert.equal(rows.length, 1);
  assert.equal(rows[0].message, null);
  assert.equal(rows[0].status, "read");
  assert.equal(
    await storeSubmission(db, payload("bad", {}, "other")),
    "skipped",
  );
  await assert.rejects(
    pg.query("UPDATE form_submissions SET status = 'invalid'"),
  );
  await assert.rejects(
    pg.query("UPDATE form_submissions SET form_name = 'invalid'"),
  );
});
test("storage runs first; database failure never blocks email and email failure never undoes insert", async () => {
  await reset();
  const order = [],
    logs = [];
  const event = createSubmissionEventHandler({
    store: async (p) => {
      order.push("store");
      return storeSubmission(db, p);
    },
    notify: async () => {
      order.push("notify");
      throw new Error("private email");
    },
    log: (s) => logs.push(s),
  });
  assert.equal(
    (await event(req("", "POST", { payload: payload("event") }))).status,
    204,
  );
  assert.deepEqual(order, ["store", "notify"]);
  assert.equal((await db.sql`SELECT * FROM form_submissions`).length, 1);
  let mailed = false;
  const failing = createSubmissionEventHandler({
    store: async () => {
      throw new Error("private SQL");
    },
    notify: async () => {
      mailed = true;
    },
    log: (s) => logs.push(s),
  });
  assert.equal(
    (await failing(req("", "POST", { payload: payload("fail") }))).status,
    204,
  );
  assert.equal(mailed, true);
  assert.ok(
    logs.every((s) => s.startsWith("[inbox]") && !s.includes("private")),
  );
});
test("all API methods authorize before reading the DB, including counts-only and malformed requests", async () => {
  for (const status of [401, 403])
    for (const [method, query] of [
      ["GET", ""],
      ["GET", "?counts_only=true"],
      ["PUT", ""],
      ["DELETE", "?id=bad"],
      ["POST", ""],
    ]) {
      const protectedHandler = createInboxHandler({
        db: {
          sql: () => {
            throw new Error("must not query");
          },
        },
        authorize: async () => new Response("Denied", { status }),
      });
      const response = await protectedHandler(req(query, method));
      assert.equal(response.status, status);
      assert.match(response.headers.get("cache-control"), /private.*no-store/);
      assert.equal(await response.text(), "Denied");
    }
  const entry = fs.readFileSync(
    new URL("../netlify/functions/form-submissions.mts", import.meta.url),
    "utf8",
  );
  assert.match(entry, /authorize: requireAdmin/);
  assert.match(entry, /path: ['"]\/api\/form-submissions-admin['"]/);
});
test("API validates query, JSON status, UUID and methods without exposing data", async () => {
  for (const q of [
    "form=unknown",
    "status=deleted",
    "page=0",
    "page=1.5",
    "page=1000001",
    "page_size=101",
    "page_size=0",
    "counts_only=1",
    `search=${"x".repeat(201)}`,
  ]) {
    assert.equal(parseInboxQuery(new URLSearchParams(q)), null);
    assert.equal((await handler()(req(`?${q}`))).status, 400);
  }
  for (const body of [
    null,
    [],
    {},
    { id: "bad", status: "read" },
    { id: "00000000-0000-0000-0000-000000000001", status: "bad" },
    {
      id: "00000000-0000-0000-0000-000000000001",
      status: "read",
      email: "bad",
    },
  ]) {
    assert.equal(validateInboxStatus(body), null);
    assert.equal((await handler()(req("", "PUT", body))).status, 400);
  }
  assert.equal(
    (
      await handler()(
        new Request("https://example.invalid/api/form-submissions-admin", {
          method: "PUT",
          body: "{bad",
        }),
      )
    ).status,
    400,
  );
  assert.equal((await handler()(req("?id=bad", "DELETE"))).status, 400);
  const disallowed = await handler()(req("", "POST"));
  assert.equal(disallowed.status, 405);
  assert.equal(disallowed.headers.get("allow"), "GET, PUT, DELETE");
});
test("real SQL filters literal search, paginates, counts, changes status and deletes only Inbox rows", async () => {
  await reset();
  await storeSubmission(
    db,
    payload("contact-a", {
      message: "100%_ guaranteed!",
      organisation: "Reader's school",
    }),
  );
  await storeSubmission(db, {
    ...payload("contact-b"),
    created_at: "2026-10-17T11:00:00Z",
  });
  await storeSubmission(
    db,
    payload(
      "newsletter",
      { email: "newsletter@example.invalid" },
      "newsletter",
    ),
  );
  let response = await handler()(req("?form=contact&status=new&page_size=1"));
  assert.equal(response.status, 200);
  assert.match(response.headers.get("cache-control"), /private.*no-store/);
  assert.equal(response.headers.get("netlify-cdn-cache-control"), "no-store");
  assert.match(response.headers.get("vary"), /Cookie, Authorization/);
  let result = await response.json();
  assert.equal(result.total, 2);
  assert.equal(result.total_pages, 2);
  assert.equal(result.items[0].netlify_id, "contact-b");
  assert.deepEqual(result.counts, { new: 3, inquiries: 2 });
  result = await (
    await handler()(req("?form=contact&page_size=1&page=2"))
  ).json();
  assert.equal(result.items[0].netlify_id, "contact-a");
  result = await (
    await handler()(req("?search=" + encodeURIComponent("%_")))
  ).json();
  assert.equal(result.total, 1);
  assert.equal(
    (
      await (
        await handler()(req("?search=" + encodeURIComponent("' OR 1=1 --")))
      ).json()
    ).total,
    0,
  );
  const id = result.items[0].id;
  result = await (
    await handler()(req("", "PUT", { id, status: "read" }))
  ).json();
  assert.equal(result.item.status, "read");
  assert.equal(result.item.message, "100%_ guaranteed!");
  assert.deepEqual(result.counts, { new: 2, inquiries: 1 });
  assert.equal(
    (await (await handler()(req("?form=contact&status=read"))).json()).total,
    1,
  );
  result = await (await handler()(req("?counts_only=true"))).json();
  assert.deepEqual(Object.keys(result), ["counts"]);
  assert.equal(
    (await handler()(req("", "PUT", { id, status: "archived" }))).status,
    200,
  );
  assert.equal((await handler()(req(`?id=${id}`, "DELETE"))).status, 200);
  assert.equal((await handler()(req(`?id=${id}`, "DELETE"))).status, 404);
  assert.equal(
    (await handler()(req("", "PUT", { id, status: "read" }))).status,
    404,
  );
  assert.equal((await db.sql`SELECT * FROM form_submissions`).length, 2);
});
test("database errors return a private generic response with no submitted personal data", async () => {
  const original = console.error,
    logs = [];
  console.error = (line) => logs.push(line);
  try {
    const failing = createInboxHandler({
      db: {
        sql: () => {
          throw new Error("private@example.invalid");
        },
      },
      authorize: async () => null,
    });
    const response = await failing(req());
    assert.equal(response.status, 503);
    assert.ok(!(await response.text()).includes("private@example.invalid"));
    assert.ok(logs.every((s) => !s.includes("@")));
  } finally {
    console.error = original;
  }
});
test("CSV preserves quotes, Unicode and newlines while preventing spreadsheet formulas; mailto has exact subject", () => {
  const csv = newsletterCsv([
    {
      email: 'é,"x"\n@example.invalid',
      created_at: "2026-10-17",
      status: "new",
    },
    { email: "=cmd@example.invalid", created_at: "2026-10-17", status: "read" },
  ]);
  assert.ok(csv.startsWith('\ufeff"Email","Date","Status"\r\n'));
  assert.ok(csv.includes('"é,""x""\n@example.invalid"'));
  assert.ok(csv.includes('"\'=cmd@example.invalid"'));
  assert.equal(
    new URL(replyLink("reader+test@example.invalid")).searchParams.get(
      "subject",
    ),
    replySubject,
  );
  for (const bad of [
    null,
    "bad",
    "a@example.invalid\r\nBcc:other@example.invalid",
    "a@example.invalid?bcc=x",
    "a@example.invalid,other@example.invalid",
  ])
    assert.equal(replyLink(bad), null);
});
