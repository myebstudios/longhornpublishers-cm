import { getDatabase } from '@netlify/database';
import type { Config } from '@netlify/functions';
import { requireAdmin } from './_shared/auth';
import { validateProcessStep, validateService } from './_shared/cms-validation';
import { json, methodNotAllowed } from './_shared/http';
import { rebuildIfPublic, requestRebuild } from './_shared/rebuild';

const db = getDatabase();

export default async function handler(req: Request) {
  const denied = await requireAdmin(); if (denied) return denied;
  const url = new URL(req.url);
  const kind = url.searchParams.get('kind') ?? 'service';
  const id = url.searchParams.get('id');
  if (!['service', 'process'].includes(kind)) return json({ error: 'Kind must be service or process.' }, { status: 400 });
  if (req.method === 'GET') {
    const services = await db.sql`SELECT * FROM services ORDER BY sort_order, created_at`;
    const process = await db.sql`SELECT * FROM process_steps ORDER BY step_number`;
    return json({ services, process });
  }
  if (!['POST', 'PUT', 'DELETE'].includes(req.method)) return methodNotAllowed();
  if (req.method === 'DELETE') {
    if (!id) return json({ error: 'An item id is required.' }, { status: 400 });
    if (kind === 'service') {
      const [deleted] = await db.sql`DELETE FROM services WHERE id = ${id} RETURNING id, published`;
      if (!deleted) return json({ error: 'Service not found.' }, { status: 404 });
      await rebuildIfPublic('delete', { wasPublished: deleted.published }, 'publishing service deleted');
    } else {
      const [deleted] = await db.sql`DELETE FROM process_steps WHERE id = ${id} RETURNING id, published`;
      if (!deleted) return json({ error: 'Process step not found.' }, { status: 404 });
      await rebuildIfPublic('delete', { wasPublished: deleted.published }, 'publishing process step deleted');
    }
    return json({ deleted: id });
  }
  const payload = await req.json().catch(() => null);
  if (req.method === 'PUT' && payload && typeof payload === 'object' && (payload as Record<string, unknown>).action === 'reorder') {
    const ids = (payload as Record<string, unknown>).ids;
    if (!Array.isArray(ids) || ids.length > 100 || ids.some((value) => typeof value !== 'string') || new Set(ids).size !== ids.length) {
      return json({ error: 'Reorder ids must be a unique list of 100 items or fewer.' }, { status: 400 });
    }
    if (kind === 'service') {
      const current = await db.sql`SELECT id, published FROM services`;
      const currentIds = new Set(current.map((row) => String(row.id)));
      if (ids.length !== currentIds.size || ids.some((value) => !currentIds.has(value))) return json({ error: 'Reorder ids must include every service exactly once.' }, { status: 400 });
      for (const [index, serviceId] of ids.entries()) await db.sql`UPDATE services SET sort_order = ${index}, updated_at = now() WHERE id = ${serviceId}`;
      if (current.some((row) => row.published)) await requestRebuild('publishing services reordered');
    } else {
      const current = await db.sql`SELECT id, published FROM process_steps`;
      const currentIds = new Set(current.map((row) => String(row.id)));
      if (ids.length !== currentIds.size || ids.some((value) => !currentIds.has(value))) return json({ error: 'Reorder ids must include every process step exactly once.' }, { status: 400 });
      await db.sql`UPDATE process_steps SET step_number = step_number + 10000`;
      for (const [index, stepId] of ids.entries()) await db.sql`UPDATE process_steps SET step_number = ${index + 1} WHERE id = ${stepId}`;
      if (current.some((row) => row.published)) await requestRebuild('publishing process reordered');
    }
    return json({ reordered: ids });
  }
  if (req.method === 'PUT' && !id) return json({ error: 'An item id is required.' }, { status: 400 });
  if (kind === 'service') {
    const parsed = validateService(payload); if (!parsed.ok) return json({ error: parsed.error }, { status: 400 });
    const value = parsed.value;
    if (req.method === 'POST') {
      const [created] = await db.sql`INSERT INTO services (name_en, name_fr, category, description_en, description_fr, icon, sort_order, published) VALUES (${value.name_en}, ${value.name_fr}, ${value.category}, ${value.description_en}, ${value.description_fr}, ${value.icon}, ${value.sort_order}, ${value.published}) RETURNING *`;
      await rebuildIfPublic('create', { isPublished: created.published }, 'publishing service created');
      return json(created, { status: 201 });
    }
    const [before] = await db.sql`SELECT published FROM services WHERE id = ${id}`;
    if (!before) return json({ error: 'Service not found.' }, { status: 404 });
    const [updated] = await db.sql`UPDATE services SET name_en = ${value.name_en}, name_fr = ${value.name_fr}, category = ${value.category}, description_en = ${value.description_en}, description_fr = ${value.description_fr}, icon = ${value.icon}, sort_order = ${value.sort_order}, published = ${value.published}, updated_at = now() WHERE id = ${id} RETURNING *`;
    await rebuildIfPublic('update', { wasPublished: before.published, isPublished: updated.published }, 'publishing service updated');
    return json(updated);
  }
  const parsed = validateProcessStep(payload); if (!parsed.ok) return json({ error: parsed.error }, { status: 400 });
  const value = parsed.value;
  if (req.method === 'POST') {
    const [created] = await db.sql`INSERT INTO process_steps (step_number, title_en, title_fr, description_en, description_fr, published) VALUES (${value.step_number}, ${value.title_en}, ${value.title_fr}, ${value.description_en}, ${value.description_fr}, ${value.published}) RETURNING *`;
    await rebuildIfPublic('create', { isPublished: created.published }, 'publishing process step created');
    return json(created, { status: 201 });
  }
  const [beforeStep] = await db.sql`SELECT published FROM process_steps WHERE id = ${id}`;
  const [updated] = await db.sql`UPDATE process_steps SET step_number = ${value.step_number}, title_en = ${value.title_en}, title_fr = ${value.title_fr}, description_en = ${value.description_en}, description_fr = ${value.description_fr}, published = ${value.published} WHERE id = ${id} RETURNING *`;
  if (!updated) return json({ error: 'Process step not found.' }, { status: 404 });
  await rebuildIfPublic('update', { wasPublished: beforeStep?.published === true, isPublished: updated.published === true }, 'publishing process step updated');
  return json(updated);
}

export const config: Config = { path: '/api/services-admin' };
