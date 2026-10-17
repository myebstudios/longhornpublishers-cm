import { buildNotification, type NotifyEnv } from './_shared/submission-email';

/**
 * Netlify event function: runs automatically for every verified form
 * submission (the file name is the trigger). Emails the admins through
 * Brevo's free transactional API instead of Netlify's paid notifications.
 *
 * Configuration lives in environment variables only (see
 * Docs/form_notifications.md). Failures are logged and swallowed so a mail
 * outage never affects the visitor's submission, which Netlify has already
 * stored.
 */
export default async function handler(req: Request) {
  const body = await req.json().catch(() => null);
  const payload = body?.payload;
  const env: NotifyEnv = {
    BREVO_API_KEY: process.env.BREVO_API_KEY,
    NOTIFY_FROM_EMAIL: process.env.NOTIFY_FROM_EMAIL,
    NOTIFY_FROM_NAME: process.env.NOTIFY_FROM_NAME,
    NOTIFY_CONTACT_TO: process.env.NOTIFY_CONTACT_TO,
    NOTIFY_NEWSLETTER_TO: process.env.NOTIFY_NEWSLETTER_TO,
  };
  const email = payload ? buildNotification(payload, env) : null;
  if (!email) {
    console.log(`[notify] skipped: form=${payload?.form_name ?? 'unknown'} (unknown form or notifications not configured)`);
    return new Response(null, { status: 204 });
  }
  try {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: { 'api-key': env.BREVO_API_KEY!, 'content-type': 'application/json', accept: 'application/json' },
      body: JSON.stringify(email),
    });
    if (!response.ok) console.error(`[notify] Brevo ${response.status}: ${(await response.text()).slice(0, 300)}`);
    else console.log(`[notify] sent ${payload.form_name} notification to ${email.to.length} recipient(s)`);
  } catch (error) {
    console.error('[notify] Brevo request failed', error instanceof Error ? error.message : error);
  }
  return new Response(null, { status: 204 });
}
