import type { SqlDatabase } from "./sql-types.ts";
import { validateProcessStep, validateService } from "./cms-validation.ts";
import { json, methodNotAllowed } from "./http.ts";

type Dependencies = {
  db: SqlDatabase;
  authorize: () => Promise<Response | null>;
  imageExists: (key: string) => Promise<boolean>;
  purgeMedia: (...keys: (string | null | undefined)[]) => Promise<void>;
  purgePublic: (...tags: string[]) => Promise<void>;
  purgeIfPublic: (
    kind: "create" | "update" | "delete",
    state: { wasPublished?: boolean; isPublished?: boolean },
    ...tags: string[]
  ) => Promise<void>;
};
export function createServicesHandler({
  db,
  authorize,
  imageExists,
  purgeMedia,
  purgePublic,
  purgeIfPublic,
}: Dependencies) {
  return async function handler(req: Request) {
    const denied = await authorize();
    if (denied) return denied;
    const url = new URL(req.url);
    const kind = url.searchParams.get("kind") ?? "service";
    const id = url.searchParams.get("id");
    if (!["service", "process"].includes(kind))
      return json(
        { error: "Kind must be service or process." },
        { status: 400 },
      );
    if (req.method === "GET") {
      const services =
        await db.sql`SELECT * FROM services ORDER BY sort_order, created_at`;
      const process =
        await db.sql`SELECT * FROM process_steps ORDER BY step_number`;
      return json({ services, process });
    }
    if (!["POST", "PUT", "DELETE"].includes(req.method))
      return methodNotAllowed();
    if (req.method === "DELETE") {
      if (!id)
        return json({ error: "An item id is required." }, { status: 400 });
      if (kind === "service") {
        const [deleted] =
          await db.sql`DELETE FROM services WHERE id = ${id} RETURNING id, published, image_id`;
        if (!deleted)
          return json({ error: "Service not found." }, { status: 404 });
        if (deleted.published) await purgeMedia(deleted.image_id);
        await purgeIfPublic(
          "delete",
          { wasPublished: deleted.published },
          "services",
          "homepage",
        );
      } else {
        const [deleted] =
          await db.sql`DELETE FROM process_steps WHERE id = ${id} RETURNING id, published`;
        if (!deleted)
          return json({ error: "Process step not found." }, { status: 404 });
        await purgeIfPublic(
          "delete",
          { wasPublished: deleted.published },
          "services",
          "homepage",
        );
      }
      return json({ deleted: id });
    }
    const payload = await req.json().catch(() => null);
    if (
      req.method === "PUT" &&
      payload &&
      typeof payload === "object" &&
      (payload as Record<string, unknown>).action === "reorder"
    ) {
      const ids = (payload as Record<string, unknown>).ids;
      if (
        !Array.isArray(ids) ||
        ids.length > 100 ||
        ids.some((value) => typeof value !== "string") ||
        new Set(ids).size !== ids.length
      ) {
        return json(
          { error: "Reorder ids must be a unique list of 100 items or fewer." },
          { status: 400 },
        );
      }
      if (kind === "service") {
        const current = await db.sql`SELECT id, published FROM services`;
        const currentIds = new Set(current.map((row) => String(row.id)));
        if (
          ids.length !== currentIds.size ||
          ids.some((value) => !currentIds.has(value))
        )
          return json(
            { error: "Reorder ids must include every service exactly once." },
            { status: 400 },
          );
        for (const [index, serviceId] of ids.entries())
          await db.sql`UPDATE services SET sort_order = ${index}, updated_at = now() WHERE id = ${serviceId}`;
        if (current.some((row) => row.published))
          await purgePublic("services", "homepage");
      } else {
        const current = await db.sql`SELECT id, published FROM process_steps`;
        const currentIds = new Set(current.map((row) => String(row.id)));
        if (
          ids.length !== currentIds.size ||
          ids.some((value) => !currentIds.has(value))
        )
          return json(
            {
              error:
                "Reorder ids must include every process step exactly once.",
            },
            { status: 400 },
          );
        await db.sql`UPDATE process_steps SET step_number = step_number + 10000`;
        for (const [index, stepId] of ids.entries())
          await db.sql`UPDATE process_steps SET step_number = ${index + 1} WHERE id = ${stepId}`;
        if (current.some((row) => row.published))
          await purgePublic("services", "homepage");
      }
      return json({ reordered: ids });
    }
    if (req.method === "PUT" && !id)
      return json({ error: "An item id is required." }, { status: 400 });
    if (kind === "service") {
      const parsed = validateService(payload);
      if (!parsed.ok) return json({ error: parsed.error }, { status: 400 });
      const value = parsed.value;
      if (req.method === "POST") {
        if (value.image_id && !(await imageExists(value.image_id)))
          return json(
            { error: "Upload the service image before saving." },
            { status: 400 },
          );
        const [created] =
          await db.sql`INSERT INTO services (slug, short_en, short_fr, name_en, name_fr, category, description_en, description_fr, icon, sort_order, published, image_id) VALUES (${value.slug}, ${value.short_en}, ${value.short_fr}, ${value.name_en}, ${value.name_fr}, ${value.category}, ${value.description_en}, ${value.description_fr}, ${value.icon}, ${value.sort_order}, ${value.published}, ${value.image_id}) RETURNING *`;
        await purgeIfPublic(
          "create",
          { isPublished: created.published },
          "services",
          "homepage",
        );
        return json(created, { status: 201 });
      }
      const [before] =
        await db.sql`SELECT published, image_id FROM services WHERE id = ${id}`;
      if (!before)
        return json({ error: "Service not found." }, { status: 404 });
      // Older editors omit this additive field; a text-only save must retain it.
      const imageId = Object.hasOwn(payload, "image_id")
        ? value.image_id
        : before.image_id;
      if (
        imageId &&
        imageId !== before.image_id &&
        !(await imageExists(imageId))
      )
        return json(
          { error: "Upload the service image before saving." },
          { status: 400 },
        );
      const [updated] =
        await db.sql`UPDATE services SET slug = ${value.slug}, short_en = ${value.short_en}, short_fr = ${value.short_fr}, name_en = ${value.name_en}, name_fr = ${value.name_fr}, category = ${value.category}, description_en = ${value.description_en}, description_fr = ${value.description_fr}, icon = ${value.icon}, sort_order = ${value.sort_order}, published = ${value.published}, image_id = ${imageId}, updated_at = now() WHERE id = ${id} RETURNING *`;
      if (before.published || updated.published)
        await purgeMedia(before.image_id, updated.image_id);
      await purgeIfPublic(
        "update",
        { wasPublished: before.published, isPublished: updated.published },
        "services",
        "homepage",
      );
      return json(updated);
    }
    const parsed = validateProcessStep(payload);
    if (!parsed.ok) return json({ error: parsed.error }, { status: 400 });
    const value = parsed.value;
    if (req.method === "POST") {
      const [created] =
        await db.sql`INSERT INTO process_steps (step_number, title_en, title_fr, description_en, description_fr, published) VALUES (${value.step_number}, ${value.title_en}, ${value.title_fr}, ${value.description_en}, ${value.description_fr}, ${value.published}) RETURNING *`;
      await purgeIfPublic(
        "create",
        { isPublished: created.published },
        "services",
        "homepage",
      );
      return json(created, { status: 201 });
    }
    const [beforeStep] =
      await db.sql`SELECT published FROM process_steps WHERE id = ${id}`;
    const [updated] =
      await db.sql`UPDATE process_steps SET step_number = ${value.step_number}, title_en = ${value.title_en}, title_fr = ${value.title_fr}, description_en = ${value.description_en}, description_fr = ${value.description_fr}, published = ${value.published} WHERE id = ${id} RETURNING *`;
    if (!updated)
      return json({ error: "Process step not found." }, { status: 404 });
    await purgeIfPublic(
      "update",
      {
        wasPublished: beforeStep?.published === true,
        isPublished: updated.published === true,
      },
      "services",
      "homepage",
    );
    return json(updated);
  };
}
