import assert from 'node:assert/strict';
import test from 'node:test';
import { adminRecipients, buildNotification, recipients } from '../netlify/functions/_shared/submission-email.ts';

const env = {
  BREVO_API_KEY: 'key', NOTIFY_FROM_EMAIL: 'web@example.com', NOTIFY_FROM_NAME: 'Longhorn site',
  NOTIFY_CONTACT_TO: 'a@example.com, b@example.com', NOTIFY_NEWSLETTER_TO: '',
};
const contact = { form_name: 'contact', created_at: '2026-10-17T10:00:00Z', data: {
  name: 'Jane <Doe>', organisation: 'Ministry', email: 'jane@example.org', phone: '', message: 'Hi\nthere', 'bot-field': '', 'form-name': 'contact',
} };

test('contact enquiry: recipients, subject, reply-to and escaped body', () => {
  const email = buildNotification(contact, env);
  assert.deepEqual(email.to, [{ email: 'a@example.com' }, { email: 'b@example.com' }]);
  assert.equal(email.subject, 'New website enquiry from Jane <Doe> (Ministry)');
  assert.deepEqual(email.replyTo, { email: 'jane@example.org', name: 'Jane <Doe>' });
  assert.match(email.htmlContent, /Jane &lt;Doe&gt;/);
  assert.doesNotMatch(email.htmlContent, /<Doe>/);
  assert.doesNotMatch(email.textContent, /bot-field|form-name|Telephone/);
});

test('newsletter signup falls back to the contact recipients and has no reply-to', () => {
  const email = buildNotification({ form_name: 'newsletter', data: { email: 'sub@example.org' } }, env);
  assert.equal(email.to.length, 2);
  assert.equal(email.subject, 'New newsletter signup: sub@example.org');
  assert.equal(email.replyTo, undefined);
});

test('skips unknown forms and missing configuration', () => {
  assert.equal(buildNotification({ form_name: 'other', data: {} }, env), null);
  assert.equal(buildNotification(contact, { ...env, BREVO_API_KEY: '' }), null);
  assert.equal(buildNotification(contact, { ...env, NOTIFY_CONTACT_TO: 'not-an-email' }), null);
});

test('recipient parsing ignores blanks and invalid addresses', () => {
  assert.deepEqual(recipients(' x@y.com ,, bad, z@w.org '), [{ email: 'x@y.com' }, { email: 'z@w.org' }]);
});

test('site admins: confirmed admin-role users only, de-duplicated, preferred over the fallback list', () => {
  const admins = adminRecipients([
    { email: 'Boss@Example.com', roles: ['admin'], confirmedAt: '2026-01-01' },
    { email: 'boss@example.com', roles: ['admin'], confirmedAt: '2026-01-01' },
    { email: 'pending@example.com', roles: ['admin'] },
    { email: 'reader@example.com', roles: [], confirmedAt: '2026-01-01' },
  ]);
  assert.deepEqual(admins, [{ email: 'boss@example.com' }]);
  assert.deepEqual(buildNotification(contact, env, admins).to, [{ email: 'boss@example.com' }]);
  assert.equal(buildNotification(contact, env, []).to.length, 2);
});
