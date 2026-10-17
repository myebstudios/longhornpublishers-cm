import type { SqlDatabase } from "./sql-types.ts";
import { INBOX_FORMS, INBOX_STATUSES } from "./inbox-submissions.ts";
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const HEADERS = {
  "Cache-Control": "private, no-store",
  "Netlify-CDN-Cache-Control": "no-store",
  Vary: "Cookie, Authorization",
};
const json = (value: unknown, status = 200) =>
  Response.json(value, { status, headers: HEADERS });
export function parseInboxQuery(params: URLSearchParams) {
  const form = params.get("form") ?? "all",
    status = params.get("status") ?? "all",
    search = (params.get("search") ?? "").trim();
  const page = params.get("page") ?? "1",
    size = params.get("page_size") ?? "24",
    countsOnly = params.get("counts_only") ?? "false";
  if (
    !["all", ...INBOX_FORMS].includes(form) ||
    !["all", ...INBOX_STATUSES].includes(status)
  )
    return null;
  if (
    search.length > 200 ||
    !/^\d+$/.test(page) ||
    !/^\d+$/.test(size) ||
    !["true", "false"].includes(countsOnly)
  )
    return null;
  const pageNumber = Number(page),
    pageSize = Number(size);
  if (
    !Number.isSafeInteger(pageNumber) ||
    pageNumber < 1 ||
    pageNumber > 1_000_000 ||
    pageSize < 1 ||
    pageSize > 100
  )
    return null;
  return {
    form,
    status,
    search,
    page: pageNumber,
    pageSize,
    countsOnly: countsOnly === "true",
  };
}
export function validateInboxStatus(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const body = value as Record<string, unknown>;
  if (
    Object.keys(body).some((key) => !["id", "status"].includes(key)) ||
    typeof body.id !== "string" ||
    !UUID.test(body.id) ||
    !INBOX_STATUSES.includes(body.status as any)
  )
    return null;
  return { id: body.id, status: body.status as string };
}
export async function inboxCounts(db: SqlDatabase) {
  const [row] =
    await db.sql`SELECT COUNT(*) FILTER (WHERE status = 'new')::integer AS new, COUNT(*) FILTER (WHERE status = 'new' AND form_name = 'contact')::integer AS inquiries FROM form_submissions`;
  return { new: Number(row.new), inquiries: Number(row.inquiries) };
}
export function createInboxHandler({
  db,
  authorize,
}: {
  db: SqlDatabase;
  authorize: () => Promise<Response | null>;
}) {
  return async (req: Request) => {
    const denied = await authorize();
    if (denied)
      return new Response(denied.body, {
        status: denied.status,
        headers: { ...Object.fromEntries(denied.headers), ...HEADERS },
      });
    const url = new URL(req.url);
    try {
      if (req.method === "GET") {
        const query = parseInboxQuery(url.searchParams);
        if (!query)
          return json(
            {
              error:
                "Choose a valid form, status, search (up to 200 characters), page and page size (1–100).",
            },
            400,
          );
        const counts = await inboxCounts(db);
        if (query.countsOnly) return json({ counts });
        const { form, status, page, pageSize } = query;
        const pattern = `%${query.search.replace(/[!%_]/g, "!$&")}%`;
        const [total] =
          await db.sql`SELECT COUNT(*)::integer AS total FROM form_submissions
          WHERE (${form} = 'all' OR form_name = ${form}) AND (${status} = 'all' OR status = ${status})
          AND concat_ws(' ', name, email, organisation, phone, project_type, languages, stage, message) ILIKE ${pattern} ESCAPE '!'`;
        const items = await db.sql`SELECT * FROM form_submissions
          WHERE (${form} = 'all' OR form_name = ${form}) AND (${status} = 'all' OR status = ${status})
          AND concat_ws(' ', name, email, organisation, phone, project_type, languages, stage, message) ILIKE ${pattern} ESCAPE '!'
          ORDER BY created_at DESC, id DESC LIMIT ${pageSize} OFFSET ${(page - 1) * pageSize}`;
        return json({
          items,
          total: Number(total.total),
          page,
          page_size: pageSize,
          total_pages: Math.ceil(Number(total.total) / pageSize),
          counts,
        });
      }
      if (req.method === "PUT") {
        const value = validateInboxStatus(await req.json().catch(() => null));
        if (!value)
          return json(
            {
              error:
                "Provide a valid item id and status: new, read or archived.",
            },
            400,
          );
        const [item] =
          await db.sql`UPDATE form_submissions SET status = ${value.status}, updated_at = now() WHERE id = ${value.id} RETURNING *`;
        if (!item) return json({ error: "Inbox item not found." }, 404);
        return json({ item, counts: await inboxCounts(db) });
      }
      if (req.method === "DELETE") {
        const id = url.searchParams.get("id");
        if (!id || !UUID.test(id))
          return json({ error: "Provide a valid item id." }, 400);
        const [deleted] =
          await db.sql`DELETE FROM form_submissions WHERE id = ${id} RETURNING id`;
        if (!deleted) return json({ error: "Inbox item not found." }, 404);
        return json({ deleted: deleted.id, counts: await inboxCounts(db) });
      }
      return new Response("Method not allowed", {
        status: 405,
        headers: { ...HEADERS, Allow: "GET, PUT, DELETE" },
      });
    } catch {
      // Never return or log SQL errors: they can include submitted personal data.
      console.error("[inbox] admin database operation failed");
      return json(
        {
          error:
            "Inbox is unavailable. Your action could not be confirmed. Refresh and try again.",
        },
        503,
      );
    }
  };
}
