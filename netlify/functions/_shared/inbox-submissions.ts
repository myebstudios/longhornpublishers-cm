import type { SqlDatabase } from "./sql-types.ts";
export const INBOX_STATUSES = ["new", "read", "archived"] as const;
export const INBOX_FORMS = ["contact", "newsletter"] as const;
export type InboxStatus = (typeof INBOX_STATUSES)[number];
export type InboxForm = (typeof INBOX_FORMS)[number];
const text = (value: unknown): string | null => {
  if (Array.isArray(value))
    return (
      value
        .filter((v) => typeof v === "string" || typeof v === "number")
        .join(", ")
        .trim() || null
    );
  return typeof value === "string" || typeof value === "number"
    ? String(value).trim() || null
    : null;
};
export function mapSubmission(payload: unknown) {
  if (!payload || typeof payload !== "object" || Array.isArray(payload))
    return null;
  const p = payload as Record<string, unknown>;
  if (
    typeof p.id !== "string" ||
    !p.id.trim() ||
    p.id.length > 200 ||
    !INBOX_FORMS.includes(p.form_name as InboxForm)
  )
    return null;
  if (
    typeof p.created_at !== "string" ||
    !p.created_at.trim() ||
    !Number.isFinite(Date.parse(p.created_at))
  )
    return null;
  if (!p.data || typeof p.data !== "object" || Array.isArray(p.data))
    return null;
  const data = Object.fromEntries(
    Object.entries(p.data).filter(
      ([key]) => key !== "bot-field" && key !== "form-name",
    ),
  );
  return {
    netlify_id: p.id.trim(),
    form_name: p.form_name as InboxForm,
    created_at: new Date(p.created_at).toISOString(),
    name: text(data.name),
    email: text(data.email),
    organisation: text(data.organisation),
    phone: text(data.phone),
    project_type: text(data.project_type ?? data.projectType),
    languages: text(data.languages),
    stage: text(data.stage),
    message: text(data.message),
    data,
  };
}
export async function storeSubmission(db: SqlDatabase, payload: unknown) {
  const value = mapSubmission(payload);
  if (!value) return "skipped" as const;
  const rows = await db.sql`
    INSERT INTO form_submissions (netlify_id, form_name, name, email, organisation, phone, project_type, languages, stage, message, data, created_at)
    VALUES (${value.netlify_id}, ${value.form_name}, ${value.name}, ${value.email}, ${value.organisation}, ${value.phone}, ${value.project_type}, ${value.languages}, ${value.stage}, ${value.message}, ${JSON.stringify(value.data)}, ${value.created_at})
    ON CONFLICT (netlify_id) DO NOTHING RETURNING id`;
  return rows.length ? ("stored" as const) : ("duplicate" as const);
}
/** Storage and notification failures are isolated; log no payload or DB errors containing personal data. */
export function createSubmissionEventHandler(deps: {
  store: (payload: unknown) => Promise<"stored" | "duplicate" | "skipped">;
  notify: (payload: unknown) => Promise<void>;
  log: (message: string) => void;
}) {
  return async (req: Request) => {
    const body = await req.json().catch(() => null);
    const payload = body?.payload;
    try {
      deps.log(`[inbox] ${await deps.store(payload)}`);
    } catch {
      deps.log("[inbox] storage failed; notification will still be attempted");
    }
    try {
      await deps.notify(payload);
    } catch {
      deps.log("[inbox] notification failed; storage attempt is independent");
    }
    return new Response(null, { status: 204 });
  };
}
