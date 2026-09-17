/**
 * A local Postgres on a FIXED port, for reproducible round-trip evidence.
 *
 * Why this exists rather than using `netlify database connect`:
 *
 * The Netlify CLI serves `.netlify/db` through PGlite behind a pg-gateway
 * wire-protocol proxy that is spun up per command on a fresh ephemeral port,
 * and torn down when that command exits. Measured across six consecutive
 * calls: 55533, 55542, 63356, 63464, 63721, 64258 — including two while a
 * long-running query was deliberately held open. There is no long-lived
 * server to attach to.
 *
 * That makes the project's acceptance test impossible to run. The test is:
 * build, snapshot every public route, change the data, build again, snapshot
 * again, diff — and a clean diff is the pass condition for every CMS schema
 * phase. Both builds must read the SAME database at a STABLE address, which
 * the CLI cannot provide.
 *
 * So: a plain Postgres cluster under .netlify/ (already gitignored), on a
 * fixed port, independent of the CLI. Migrations are still applied by the
 * Netlify CLI against it, so the schema is identical to what deploys.
 *
 * Usage:
 *   node scripts/local-db.mjs start     # init if needed, then start
 *   node scripts/local-db.mjs migrate   # apply the repo's migrations in order
 *   node scripts/local-db.mjs stop
 *   node scripts/local-db.mjs status
 *   node scripts/local-db.mjs url       # prints CMS_DATABASE_URL and nothing else
 *
 * Requires PostgreSQL binaries on PATH or at a standard Homebrew prefix;
 * `brew install postgresql@17` provides them. Nothing here talks to
 * production, and the cluster is disposable: stop it and delete the data
 * directory.
 */
import { execFileSync, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const PORT = process.env.LOCAL_DB_PORT ?? '54329';
const DATA_DIR = path.resolve('.netlify/local-postgres');
const LOG_FILE = path.join(DATA_DIR, 'server.log');
const DB_NAME = 'longhorn_cms';
// The role is explicit: node-postgres falls back to the OS username when the
// URL omits it, which fails here with `role "<you>" does not exist`.
export const url = `postgres://postgres@localhost:${PORT}/${DB_NAME}`;

/** Homebrew does not link postgresql@17 onto PATH, so look there too. */
function binDir() {
  const candidates = [
    process.env.PG_BIN_DIR,
    '/opt/homebrew/opt/postgresql@17/bin',
    '/usr/local/opt/postgresql@17/bin',
  ].filter(Boolean);
  for (const dir of candidates) {
    if (fs.existsSync(path.join(dir, 'pg_ctl'))) return dir;
  }
  // Fall back to PATH.
  const probe = spawnSync('which', ['pg_ctl'], { encoding: 'utf8' });
  if (probe.status === 0) return path.dirname(probe.stdout.trim());
  throw new Error(
    'PostgreSQL binaries not found. Install with `brew install postgresql@17`, '
    + 'or set PG_BIN_DIR to the directory containing pg_ctl.',
  );
}

const bin = (name) => path.join(binDir(), name);
// LC_ALL is set explicitly for every child: on macOS the postmaster aborts
// with "became multithreaded during startup" when the ambient locale is
// unset, and initdb refuses to run at all. C is correct here — collation
// order is irrelevant for a disposable test cluster.
const ENV = { ...process.env, LC_ALL: 'C', LANG: 'C' };
const run = (name, args, options = {}) =>
  execFileSync(bin(name), args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], env: ENV, ...options });

function isRunning() {
  try {
    run('pg_ctl', ['-D', DATA_DIR, 'status']);
    return true;
  } catch {
    return false;
  }
}

function start() {
  if (!fs.existsSync(path.join(DATA_DIR, 'PG_VERSION'))) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
    console.log(`Initialising cluster at ${DATA_DIR}`);
    // --locale=C rather than inheriting: initdb rejects the ambient locale on
    // macOS when LANG/LC_* are unset or inconsistent, and collation order is
    // irrelevant for a disposable test cluster.
    run('initdb', ['-D', DATA_DIR, '-U', 'postgres', '--auth=trust', '--encoding=UTF8', '--locale=C']);
  }
  if (isRunning()) {
    console.log(`Already running on port ${PORT}`);
  } else {
    // -h localhost keeps it off the network; trust auth is acceptable only
    // because this listens on loopback and holds no real data.
    run('pg_ctl', ['-D', DATA_DIR, '-l', LOG_FILE, '-o', `-p ${PORT} -h localhost`, '-w', 'start']);
    console.log(`Started on port ${PORT}`);
  }
  const exists = run('psql', ['-h', 'localhost', '-p', PORT, '-U', 'postgres', '-d', 'postgres', '-tAc',
    `SELECT 1 FROM pg_database WHERE datname = '${DB_NAME}'`]).trim();
  if (!exists) {
    run('createdb', ['-h', 'localhost', '-p', PORT, '-U', 'postgres', DB_NAME]);
    console.log(`Created database ${DB_NAME}`);
  }
  console.log(`\nCMS_DATABASE_URL=${url}`);
}

/**
 * Apply the repo's migrations in order.
 *
 * `netlify database migrations apply` always targets the CLI's own PGlite
 * store and ignores a connection string, so the same SQL files are applied
 * directly here. They are the identical files that run on deploy, so the
 * resulting schema matches production. Applied names are recorded in
 * netlify.migrations with the same shape the CLI uses, so
 * scripts/preflight-draft-state.mjs reads this cluster correctly too.
 */
function migrate() {
  if (!isRunning()) { console.error('Not running. Run `node scripts/local-db.mjs start` first.'); process.exit(1); }
  const psql = (args) => run('psql', ['-h', 'localhost', '-p', PORT, '-U', 'postgres', '-d', DB_NAME, '-v', 'ON_ERROR_STOP=1', ...args]);
  psql(['-c', 'CREATE SCHEMA IF NOT EXISTS netlify']);
  psql(['-c', 'CREATE TABLE IF NOT EXISTS netlify.migrations (name text PRIMARY KEY, applied_at timestamptz NOT NULL DEFAULT now())']);

  const root = path.resolve('netlify/database/migrations');
  const applied = new Set(
    psql(['-tAc', 'SELECT name FROM netlify.migrations']).split('\n').map((line) => line.trim()).filter(Boolean),
  );
  for (const name of fs.readdirSync(root).sort()) {
    const file = path.join(root, name, 'migration.sql');
    if (!fs.existsSync(file)) continue;
    if (applied.has(name)) { console.log(`  skip    ${name}`); continue; }
    psql(['-f', file]);
    psql(['-c', `INSERT INTO netlify.migrations (name) VALUES ('${name}')`]);
    console.log(`  applied ${name}`);
  }
  console.log('\nSchema up to date.');
}

const command = process.argv[2] ?? 'status';
if (command === 'start') start();
else if (command === 'migrate') migrate();
else if (command === 'stop') {
  if (!isRunning()) console.log('Not running.');
  else { run('pg_ctl', ['-D', DATA_DIR, '-w', 'stop']); console.log('Stopped.'); }
} else if (command === 'url') process.stdout.write(url);
else if (command === 'status') console.log(isRunning() ? `Running on port ${PORT}\n${url}` : 'Not running.');
else { console.error(`Unknown command: ${command}`); process.exit(1); }
