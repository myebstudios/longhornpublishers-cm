import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

// Netlify registers form fields from public/__forms.html at deploy time and
// silently drops any submitted field it does not know. Keep the visible forms
// in step with that registration (projectType was being dropped).
const registered = (form) => {
  const html = fs.readFileSync(new URL('../public/__forms.html', import.meta.url), 'utf8');
  const block = html.match(new RegExp(`<form[^>]*name="${form}"[\\s\\S]*?</form>`))?.[0] ?? '';
  return new Set([...block.matchAll(/name="([^"]+)"/g)].map((m) => m[1]).filter((n) => n !== form));
};
const used = (file, form) => {
  const src = fs.readFileSync(new URL(file, import.meta.url), 'utf8');
  const block = src.match(new RegExp(`name="${form}"[\\s\\S]*?</form>`))?.[0] ?? '';
  return [...block.matchAll(/<(?:input|select|textarea)\b[^>]*\bname="([^"{]+)"/g)].map((m) => m[1]).filter((n) => n !== form);
};

test('every contact form field is registered with Netlify', () => {
  const known = registered('contact');
  assert.ok(known.size > 0, 'contact form is registered in public/__forms.html');
  for (const name of used('../src/components/pages/Contact.astro', 'contact')) assert.ok(known.has(name), `unregistered field: ${name}`);
});

test('every newsletter form field is registered with Netlify', () => {
  const known = registered('newsletter');
  assert.ok(known.size > 0, 'newsletter form is registered in public/__forms.html');
  for (const name of used('../src/components/Footer.astro', 'newsletter')) assert.ok(known.has(name), `unregistered field: ${name}`);
});
