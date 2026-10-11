/**
 * Production hero swap through the admin API — the browser-free path for
 * Docs/hero_launch_runbook.md steps 1–5.
 *
 * It calls the same endpoints as /admin/homepage/ (`/api/media`,
 * `/api/homepage-hero-slides-admin`), so server-side validation, the
 * five-slide cap and cache purges all apply exactly as in the UI. It never
 * deletes a slide and never writes to the database or blob store directly.
 *
 *   node scripts/hero-swap-production.mjs             # dry run: sign in, pre-check, no writes
 *   node scripts/hero-swap-production.mjs --execute   # steps 1–5
 *   node scripts/hero-swap-production.mjs --rollback  # re-enable the anchor, disable the rest
 *
 * Sign-in is a Netlify Identity password grant against the site itself. The
 * password is read without echo and the token is held in memory only. Run it
 * in your own terminal; the prompts need a TTY.
 */
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { createInterface } from 'node:readline';
import { LAUNCH_SLIDES, slidePayload } from './hero-launch-set.mjs';

const SITE_URL = (process.env.SITE_URL ?? 'https://longhornpublishers-cm.netlify.app').replace(/\/$/, '');
const ANCHOR_ID = '5ad099ec-d5e0-4bea-af7d-83aa829879ca';
const SLIDES_API = '/api/homepage-hero-slides-admin';
const FIELDS = Object.keys(slidePayload(LAUNCH_SLIDES[0], null)).filter((key) => key !== 'enabled');
const mode = process.argv.includes('--execute') ? 'execute' : process.argv.includes('--rollback') ? 'rollback' : 'dry-run';

let token = null;

function ask(question, { hidden = false } = {}) {
  const rl = createInterface({ input: process.stdin, output: process.stdout, terminal: true });
  if (hidden) rl._writeToOutput = (text) => { if (text.includes(question)) rl.output.write(text); };
  return new Promise((resolve) => rl.question(question, (answer) => {
    rl.close();
    if (hidden) process.stdout.write('\n');
    resolve(answer.trim());
  }));
}

async function signIn() {
  const email = process.env.LONGHORN_ADMIN_EMAIL || await ask('Admin email: ');
  const password = await ask('Admin password: ', { hidden: true });
  const response = await fetch(`${SITE_URL}/.netlify/identity/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'password', username: email, password }),
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok || !body.access_token) throw new Error(`Sign-in failed (${response.status}): ${body.error_description ?? body.msg ?? 'no token'}`);
  token = body.access_token;
}

async function api(path, init = {}) {
  const response = await fetch(`${SITE_URL}${path}`, {
    ...init,
    headers: { ...init.headers, Authorization: `Bearer ${token}`, Cookie: `nf_jwt=${token}` },
  });
  const text = await response.text();
  let body; try { body = JSON.parse(text); } catch { body = text; }
  if (!response.ok) throw new Error(`${init.method ?? 'GET'} ${path} → ${response.status}: ${typeof body === 'string' ? body : body.error ?? text}`);
  return body;
}

const listSlides = () => api(SLIDES_API);
const fieldsOf = (row) => Object.fromEntries(FIELDS.map((key) => [key, row[key] ?? null]));
const putSlide = (id, payload) => api(`${SLIDES_API}?id=${id}`, {
  method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
});

function printSlides(label, slides) {
  console.log(`\n${label}`);
  for (const slide of slides) {
    console.log(`  ${slide.sort_order}  ${slide.enabled ? 'ENABLED ' : 'disabled'}  ${slide.id}  ${slide.headline_en}${slide.headline_accent_en ? ` ${slide.headline_accent_en}` : ''}`);
  }
}

async function rollback(reason) {
  console.log(`\nRolling back${reason ? ` (${reason})` : ''}…`);
  const slides = await listSlides();
  const anchor = slides.find((slide) => slide.id === ANCHOR_ID);
  if (!anchor) throw new Error(`Anchor ${ANCHOR_ID} not found; roll back by hand in /admin/homepage/.`);
  if (!anchor.enabled) await putSlide(anchor.id, { ...fieldsOf(anchor), enabled: true });
  for (const slide of slides) {
    if (slide.id !== ANCHOR_ID && slide.enabled) await putSlide(slide.id, { ...fieldsOf(slide), enabled: false });
  }
  printSlides('After rollback:', await listSlides());
}

async function execute(before) {
  await mkdir('.netlify', { recursive: true });
  const snapshot = `.netlify/hero-swap-production-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
  await writeFile(snapshot, JSON.stringify(before, null, 2));
  console.log(`\nRollback record: ${snapshot}`);

  // Step 2: upload and create all four slides disabled. Public pages are untouched.
  const created = [];
  for (const [index, slide] of LAUNCH_SLIDES.entries()) {
    const image = await readFile(`Assets/hero-launch/${slide.upload}`);
    const { id: imageId } = await api('/api/media', { method: 'POST', headers: { 'Content-Type': 'image/jpeg' }, body: image });
    const row = await api(SLIDES_API, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(slidePayload(slide, imageId, false)),
    });
    if (row.enabled !== false) throw new Error(`Slide ${index + 1} saved enabled; stopping.`);
    created.push(row);
    console.log(`  created slide ${index + 1} (disabled): ${row.id} image ${imageId}`);
  }

  // Step 3: proof every saved field against the approved set.
  const saved = await listSlides();
  for (const [index, slide] of LAUNCH_SLIDES.entries()) {
    const row = saved.find((candidate) => candidate.id === created[index].id);
    const expected = slidePayload(slide, created[index].image_id, false);
    const wrong = FIELDS.filter((key) => (row?.[key] ?? null) !== expected[key]);
    if (wrong.length) throw new Error(`Slide ${index + 1} fields differ from hero-launch-set.mjs: ${wrong.join(', ')}. Nothing enabled; slides left disabled.`);
  }
  console.log('  proof: all four slides match hero-launch-set.mjs exactly');

  // Steps 4–5: enable 1→4, then disable (never delete) the anchor. Roll back on any failure.
  try {
    for (const [index, row] of created.entries()) {
      await putSlide(row.id, { ...fieldsOf(row), enabled: true });
      console.log(`  enabled slide ${index + 1}`);
    }
    const anchor = saved.find((slide) => slide.id === ANCHOR_ID);
    await putSlide(ANCHOR_ID, { ...fieldsOf(anchor), enabled: false });
    console.log('  disabled anchor (kept for rollback)');

    const after = await listSlides();
    const live = after.filter((slide) => slide.enabled).map((slide) => slide.id);
    if (live.join() !== created.map((row) => row.id).join()) throw new Error('Enabled slides are not exactly launch slides 1–4 in order.');
    printSlides('After swap:', after);
  } catch (error) {
    await rollback(error.message);
    throw error;
  }
}

await signIn();
const before = await listSlides();
printSlides('Saved slides now:', before);

if (mode === 'rollback') {
  await rollback();
} else {
  // Step 1: exactly one saved slide, the enabled anchor. Anything else stops the swap.
  const [only] = before;
  if (before.length !== 1 || only.id !== ANCHOR_ID || only.enabled !== true) {
    throw new Error(`Pre-check failed: expected only the enabled anchor ${ANCHOR_ID}. Nothing changed; report to Yv.`);
  }
  for (const slide of LAUNCH_SLIDES) await readFile(`Assets/hero-launch/${slide.upload}`);
  console.log('\nPre-check passed: one saved slide, the enabled anchor; all four upload files present.');
  if (mode === 'execute') await execute(before);
  else console.log('Dry run only. Re-run with --execute to swap.');
}
