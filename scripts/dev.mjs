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
 */
import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';

const require = createRequire(import.meta.url);
const astroBin = join(dirname(require.resolve('astro/package.json')), 'bin', 'astro.mjs');

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
