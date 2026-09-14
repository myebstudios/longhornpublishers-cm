import { getDatabase } from '@netlify/database';
import type { Config } from '@netlify/functions';
import { requireAdmin } from './_shared/auth';
import { json, methodNotAllowed } from './_shared/http';

const db = getDatabase();

/** Postgres error codes we translate into editor-facing messages. */
const UNIQUE_VIOLATION = '23505';
const FOREIGN_KEY_VIOLATION = '23503';

function codeOf(error: unknown): string | undefined {
  return typeof error === 'object' && error !== null
    ? (error as { code?: string }).code
    : undefined;
}

export default async function handler(req: Request) {
  const denied = await requireAdmin(); if (denied) return denied;
  const id = new URL(req.url).searchParams.get('id');

  if (req.method === 'GET') {
    // Sorted by English name so the admin dropdown has a stable order.
    return json(await db.sql`
      SELECT s.id, s.name_en, s.name_fr, s.created_at,
             COUNT(c.id)::int AS title_count
      FROM subjects s
      LEFT JOIN catalogue_titles c ON c.subject_id = s.id
      GROUP BY s.id
      ORDER BY s.name_en
    `);
  }

  if (!['POST', 'PUT', 'DELETE'].includes(req.method)) return methodNotAllowed();
  if (req.method !== 'POST' && !id) return json({ error: 'A subject id is required.' }, { status: 400 });

  if (req.method === 'DELETE') {
    try {
      const result = await db.sql`DELETE FROM subjects WHERE id = ${id} RETURNING id`;
      return result.length ? json({ deleted: id }) : json({ error: 'Subject not found.' }, { status: 404 });
    } catch (error) {
      // catalogue_titles.subject_id references subjects(id) with no ON DELETE
      // rule, so removing a subject still in use raises rather than silently
      // orphaning titles. Say which action to take instead of surfacing 23503.
      if (codeOf(error) === FOREIGN_KEY_VIOLATION) {
        return json(
          { error: 'This subject is still assigned to one or more catalogue titles. Reassign them first.' },
          { status: 409 },
        );
      }
      throw error;
    }
  }

  const body = await req.json();
  const nameEn = typeof body.name_en === 'string' ? body.name_en.trim() : '';
  const nameFr = typeof body.name_fr === 'string' ? body.name_fr.trim() : '';
  if (!nameEn || !nameFr) {
    return json({ error: 'Provide the subject name in both English and French.' }, { status: 400 });
  }

  try {
    if (req.method === 'PUT') {
      const [updated] = await db.sql`
        UPDATE subjects SET name_en = ${nameEn}, name_fr = ${nameFr} WHERE id = ${id} RETURNING *
      `;
      return updated ? json(updated) : json({ error: 'Subject not found.' }, { status: 404 });
    }
    const [created] = await db.sql`
      INSERT INTO subjects (name_en, name_fr) VALUES (${nameEn}, ${nameFr}) RETURNING *
    `;
    return json(created, { status: 201 });
  } catch (error) {
    // name_en and name_fr are both UNIQUE — a duplicate is an editor mistake,
    // not a server fault.
    if (codeOf(error) === UNIQUE_VIOLATION) {
      return json({ error: 'A subject with that name already exists.' }, { status: 409 });
    }
    throw error;
  }
}

export const config: Config = { path: '/api/subjects-admin' };
