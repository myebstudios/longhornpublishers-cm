/**
 * Dev server launcher.
 *
 * The local demo fixtures are gated by canRenderLocalDemoContent(), which only
 * trusts a runtime that identifies itself as Netlify's local dev environment.
 * Plain `astro dev` does not set those variables, so seeded rows were written to
 * the local database and then hidden by the dev server's own query filter — the
 * reason demo content never appeared locally.
 *
 * Declaring them here keeps the gate exact and fail-closed: only this script,
 * used only by `npm run dev`, can open it. `npm run build` never runs this file.
 *
 * Pending migrations are applied to the dev database first. The Netlify adapter
 * serves `.netlify/db` (PGlite) to `astro dev` but never migrates it, so the
 * store silently fell behind the repo — it stopped at 011 and every page that
 * reads `catalogue_titles.classification` (012) returned 503. The same
 * @netlify/database-dev copy the adapter uses applies them here, with the same
 * `netlify.migrations` tracking, before the adapter opens the store.
 */
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import net from 'node:net';
import { createRequire } from 'node:module';
import { dirname, join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const require = createRequire(import.meta.url);
const astroBin = join(dirname(require.resolve('astro/package.json')), 'bin', 'astro.mjs');

/** Resolve a package directory along its dependency chain, as Node would. */
function packageDir(chain) {
  let dir = process.cwd();
  for (const name of chain) {
    const from = createRequire(join(dir, 'package.json'));
    const found = from.resolve.paths(name)?.map((base) => join(base, name))
      .find((candidate) => fs.existsSync(join(candidate, 'package.json')));
    if (!found) throw new Error(`Cannot resolve ${name} from ${dir}`);
    dir = found;
  }
  return dir;
}

/** True when another dev server already holds the PGlite store open. */
function storeInUse() {
  let connection;
  try {
    connection = JSON.parse(fs.readFileSync('.netlify/state.json', 'utf8')).dbConnectionString;
  } catch {
    return Promise.resolve(false);
  }
  if (!connection) return Promise.resolve(false);
  const { hostname, port } = new URL(connection);
  return new Promise((done) => {
    const socket = net.connect({ host: hostname, port: Number(port) });
    socket.setTimeout(1000);
    socket.once('connect', () => { socket.destroy(); done(true); });
    socket.once('error', () => done(false));
    socket.once('timeout', () => { socket.destroy(); done(false); });
  });
}

async function migrateDevDatabase() {
  if (await storeInUse()) {
    console.warn('[dev] Another dev server holds .netlify/db open; migrations not applied. Stop it and rerun.');
    return;
  }
  const dir = packageDir(['@astrojs/netlify', '@netlify/vite-plugin', '@netlify/dev', '@netlify/database-dev']);
  const pkg = JSON.parse(fs.readFileSync(join(dir, 'package.json'), 'utf8'));
  const { NetlifyDB } = await import(pathToFileURL(join(dir, pkg.exports['.'].import.default)).href);
  const db = new NetlifyDB({ directory: resolve('.netlify/db'), logger: () => {} });
  await db.start();
  try {
    const applied = await db.applyMigrations(resolve('netlify/database/migrations'));
    console.log(applied.length
      ? `[dev] Applied migrations to .netlify/db: ${applied.join(', ')}`
      : '[dev] .netlify/db schema is up to date.');
  } finally {
    await db.stop();
  }
}

await migrateDevDatabase();

const child = spawn(
  process.execPath,
  [astroBin, 'dev', ...process.argv.slice(2)],
  {
    stdio: 'inherit',
    env: { ...process.env, NETLIFY_LOCAL: 'true', CONTEXT: 'dev' },
  },
);

child.on('exit', (code, signal) => {
  if (signal) process.kill(process.pid, signal);
  else process.exit(code ?? 0);
});
