/**
 * READ-ONLY pre-flight for the draft-state migrations (005 and 006).
 *
 * Answers, in one run, everything needed to authorise a production migration
 * run or to diagnose one that has already partially happened:
 *
 *   1. Which of the six tables already have the `published` column, and which
 *      do not. A split answer means 005 ran against this database in an
 *      INCOMPLETE state — which is exactly what migration 006 exists to
 *      repair, and the reason this question needs asking at all.
 *   2. Which migrations this database has recorded, discovered rather than
 *      assumed: the tracking table's name is not fixed by us, so the script
 *      finds candidates instead of hardcoding a guess that could silently
 *      report "not recorded" for a migration that did run.
 *   3. Per-table row counts, split by published true/false, so any row sitting
 *      at false that should be live is visible before anything is run. On
 *      these six tables every pre-existing row is live by definition, so a
 *      false row after migration means the backfill did not reach it.
 *
 * It issues SELECTs only: no DDL, no writes, no rebuild hook, nothing that
 * changes state. Safe to run against production.
 */
import { execFileSync } from 'node:child_process';

const CLI_SPEC = process.env.NETLIFY_CLI_SPEC ?? 'netlify@27.8.0';
const TABLES = ['homepage_content', 'about_page', 'why_choose_us', 'contact_settings', 'legal_pages', 'process_steps'];
const quoted = TABLES.map((t) => `'${t}'`).join(', ');

const netlify = (args) => execFileSync('npx', ['-y', CLI_SPEC, ...args], {
  cwd: process.cwd(), encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'],
});
const query = (sql) => JSON.parse(netlify(['database', 'connect', '--json', '--query', sql]));
/** Same, but reports a missing relation as null instead of throwing. */
const tryQuery = (sql) => { try { return query(sql); } catch { return null; } };

const { connection_string: connectionString, context } = JSON.parse(netlify(['database', 'connect', '--json']));
const { hostname } = new URL(connectionString);

console.log(`Draft-state pre-flight — READ ONLY\n  host:    ${hostname}\n  context: ${context ?? '(none reported)'}\n`);

/* 1. Column presence, reported both ways. */
const migrated = query(
  `SELECT table_name FROM information_schema.columns
   WHERE table_schema = 'public' AND column_name = 'published' AND table_name IN (${quoted})
   ORDER BY table_name`,
).map((row) => row.table_name);
const missing = TABLES.filter((table) => !migrated.includes(table));

console.log('  1. `published` column\n');
console.log(`    present on: ${migrated.length ? migrated.join(', ') : '(none)'}`);
console.log(`    missing on: ${missing.length ? missing.join(', ') : '(none)'}`);
if (migrated.length && missing.length) {
  console.log('\n    INCOMPLETE MIGRATION. Some tables have the column and some do not,');
  console.log('    which is the state migration 006 exists to repair. Do not re-run 005.');
} else if (!migrated.length) {
  console.log('\n    Not migrated. 005 has never run here.');
} else {
  console.log('\n    All six migrated.');
}

/* 2. Recorded migrations, discovered rather than assumed. */
console.log('\n  2. Recorded migrations\n');
const trackingTables = query(
  `SELECT table_schema, table_name FROM information_schema.tables
   WHERE table_schema NOT IN ('pg_catalog', 'information_schema')
     AND (table_name LIKE '%migration%' OR table_name LIKE '%drizzle%')
   ORDER BY table_schema, table_name`,
).map((row) => `${row.table_schema}.${row.table_name}`);

if (!trackingTables.length) {
  console.log('    No migration-tracking table found. Rely on section 1 for ground truth.');
} else {
  for (const qualified of trackingTables) {
    const [schema, table] = qualified.split('.');
    console.log(`    ${qualified}:`);
    try {
      // Column names vary by runner, so select everything and print it raw
      // rather than assuming a shape that may not match.
      const rows = query(`SELECT * FROM "${schema}"."${table}" ORDER BY 1`);
      if (!rows.length) console.log('      (empty)');
      for (const row of rows) console.log(`      ${JSON.stringify(row)}`);
    } catch (error) {
      console.log(`      unreadable: ${error instanceof Error ? error.message : error}`);
    }
  }
  console.log('\n    Confirm BOTH 005_content_draft_state and 006_draft_state_completion');
  console.log('    appear above. 005 alone on a database with missing columns is the');
  console.log('    incomplete state described in section 1.');
}

/* 3. Row counts, split by published where the column exists. */
console.log('\n  3. Rows\n');
let total = 0;
let unpublished = 0;

for (const table of TABLES) {
  if (!migrated.includes(table)) {
    const counted = tryQuery(`SELECT count(*)::int AS rows FROM ${table}`);
    if (!counted) { console.log(`    ${table.padEnd(18)}    - table does not exist here`); continue; }
    const [{ rows }] = counted;
    total += rows;
    const note = rows === 0 ? '  (empty — backfill is a no-op here)' : '  -> all will be promoted to published = true';
    console.log(`    ${table.padEnd(18)} ${String(rows).padStart(4)} rows, no column yet${note}`);
    continue;
  }
  const counted = tryQuery(
    `SELECT count(*)::int AS rows,
            count(*) FILTER (WHERE published)::int AS live,
            count(*) FILTER (WHERE NOT published)::int AS draft
     FROM ${table}`,
  );
  if (!counted) { console.log(`    ${table.padEnd(18)}    - table does not exist here`); continue; }
  const [{ rows, live, draft }] = counted;
  total += rows;
  unpublished += draft;
  console.log(`    ${table.padEnd(18)} ${String(rows).padStart(4)} rows  ${String(live).padStart(4)} published  ${String(draft).padStart(4)} draft`);
}

console.log(`\n  Total rows across the six tables: ${total}`);

if (unpublished) {
  console.log(`\n  ${unpublished} row(s) sit at published = false.`);
  console.log('  On these tables every pre-existing row was live before the migration,');
  console.log('  so a false row is either content drafted deliberately since, or a row');
  console.log('  the backfill never reached. Confirm which before treating this');
  console.log('  database as correctly migrated.');
} else if (migrated.length === TABLES.length) {
  console.log('\n  No unpublished rows. The backfill reached everything it needed to.');
} else {
  console.log('\n  Expected outcome: every row above stays visible on the public site,');
  console.log('  and content created after the migration starts as a draft.');
  console.log('  If any row above should NOT be live today, STOP — the backfill');
  console.log('  would publish it. Resolve before running the migration.');
}
