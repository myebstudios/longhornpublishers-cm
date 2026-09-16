/**
 * READ-ONLY pre-flight for migration 005_content_draft_state.
 *
 * Migration 005 adds `published` to six tables and promotes every existing row
 * to true, because those rows are already live. That backfill is correct only
 * if we know what is actually in the tables — and dev is not production: dev
 * currently holds zero legal_pages and zero process_steps.
 *
 * Run this against the target database BEFORE the migration and put the output
 * in front of whoever authorises the run. It issues SELECTs only: no DDL, no
 * writes, no rebuild hook, nothing that changes state.
 */
import { execFileSync } from 'node:child_process';

const CLI_SPEC = process.env.NETLIFY_CLI_SPEC ?? 'netlify@27.8.0';
const TABLES = ['homepage_content', 'about_page', 'why_choose_us', 'contact_settings', 'legal_pages', 'process_steps'];

const query = (sql) => JSON.parse(execFileSync('npx', ['-y', CLI_SPEC, 'database', 'connect', '--json', '--query', sql], {
  cwd: process.cwd(), encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'],
}));

const [{ connection_string: connectionString, context }] = [JSON.parse(execFileSync('npx', ['-y', CLI_SPEC, 'database', 'connect', '--json'], {
  cwd: process.cwd(), encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'],
}))];
const { hostname } = new URL(connectionString);

console.log(`Pre-flight for migration 005 — READ ONLY\n  host:    ${hostname}\n  context: ${context ?? '(none reported)'}\n`);

const alreadyMigrated = query(
  `SELECT table_name FROM information_schema.columns WHERE table_schema = 'public' AND column_name = 'published' AND table_name IN (${TABLES.map((t) => `'${t}'`).join(', ')}) ORDER BY table_name`,
).map((row) => row.table_name);

if (alreadyMigrated.length) {
  console.log(`  ALREADY MIGRATED: ${alreadyMigrated.join(', ')}`);
  console.log('  Migration 005 has run here, in whole or in part. Do not re-run it.\n');
}

const counts = query(TABLES.map((t) => `SELECT '${t}' AS table_name, count(*)::int AS rows FROM ${t}`).join(' UNION ALL '));
const byName = Object.fromEntries(counts.map((row) => [row.table_name, row.rows]));

let willPromote = 0;
console.log('  Rows that migration 005 will promote to published = true:\n');
for (const table of TABLES) {
  const rows = byName[table] ?? 0;
  willPromote += rows;
  const note = rows === 0 ? '  (empty — backfill is a no-op here)' : '';
  console.log(`    ${table.padEnd(18)} ${String(rows).padStart(4)}${note}`);
}

console.log(`\n  Total rows to promote: ${willPromote}`);
console.log('\n  Expected outcome: every row above stays visible on the public site,');
console.log('  and content created after the migration starts as a draft.');
console.log('  If any row above should NOT be live today, STOP — the backfill');
console.log('  would publish it. Resolve before running the migration.');
