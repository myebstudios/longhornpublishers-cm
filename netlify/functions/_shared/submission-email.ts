/**
 * Builds the admin notification for a verified Netlify Forms submission.
 *
 * Kept free of I/O so it can be unit tested; submission-created.mts sends the
 * result through Brevo's transactional API. Netlify only fires the event for
 * submissions that passed its spam filter and the bot-field honeypot.
 */
export interface SubmissionPayload {
  form_name?: string;
  created_at?: string;
  data?: Record<string, unknown>;
}

export interface NotifyEnv {
  BREVO_API_KEY?: string;
  NOTIFY_FROM_EMAIL?: string;
  NOTIFY_FROM_NAME?: string;
  NOTIFY_CONTACT_TO?: string;
  NOTIFY_NEWSLETTER_TO?: string;
}

export interface BrevoEmail {
  sender: { email: string; name: string };
  to: { email: string }[];
  replyTo?: { email: string; name?: string };
  subject: string;
  htmlContent: string;
  textContent: string;
}

const LABELS: Record<string, string> = {
  name: 'Name',
  organisation: 'Organisation',
  email: 'Email',
  phone: 'Telephone',
  project_type: 'Project type',
  languages: 'Languages',
  stage: 'Current stage',
  message: 'Message',
};
const HIDDEN = new Set(['bot-field', 'form-name', 'ip', 'user_agent', 'referrer']);
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const escapeHtml = (value: string) =>
  value.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

export function recipients(list: string | undefined): { email: string }[] {
  return (list ?? '').split(',').map((e) => e.trim()).filter((e) => EMAIL.test(e)).map((email) => ({ email }));
}

/**
 * Confirmed Identity users holding the `admin` role. Invited-but-unaccepted
 * accounts are skipped so nobody is emailed before they have joined.
 */
export function adminRecipients(users: { email?: string; roles?: string[]; confirmedAt?: string }[]): { email: string }[] {
  const seen = new Set<string>();
  return users
    .filter((u) => u.roles?.includes('admin') && u.confirmedAt && u.email && EMAIL.test(u.email))
    .map((u) => u.email!.toLowerCase())
    .filter((e) => (seen.has(e) ? false : (seen.add(e), true)))
    .map((email) => ({ email }));
}

/**
 * Returns null when the form is unknown or notifications are not configured.
 * `admins` (current site admins) takes precedence; the NOTIFY_* lists are the
 * fallback when the admin lookup is unavailable.
 */
export function buildNotification(payload: SubmissionPayload, env: NotifyEnv, admins: { email: string }[] = []): BrevoEmail | null {
  const form = payload.form_name;
  if (form !== 'contact' && form !== 'newsletter') return null;
  if (!env.BREVO_API_KEY || !env.NOTIFY_FROM_EMAIL) return null;
  const to = admins.length ? admins : recipients(form === 'newsletter' ? (env.NOTIFY_NEWSLETTER_TO || env.NOTIFY_CONTACT_TO) : env.NOTIFY_CONTACT_TO);
  if (!to.length) return null;

  const data = payload.data ?? {};
  const rows = Object.entries(data)
    .filter(([key, value]) => !HIDDEN.has(key) && String(value ?? '').trim() !== '')
    .map(([key, value]) => [LABELS[key] ?? key, String(value).trim()] as const);

  const visitorEmail = String(data.email ?? '').trim();
  const visitorName = String(data.name ?? '').trim();
  const organisation = String(data.organisation ?? '').trim();
  const who = [visitorName || visitorEmail || 'a visitor', organisation && `(${organisation})`].filter(Boolean).join(' ');
  const subject = form === 'newsletter'
    ? `New newsletter signup: ${visitorEmail || 'unknown email'}`
    : `New website enquiry from ${who}`;
  const heading = form === 'newsletter' ? 'New newsletter signup' : 'New enquiry from the website';
  const received = payload.created_at ? new Date(payload.created_at).toUTCString() : new Date().toUTCString();

  const htmlRows = rows.map(([label, value]) =>
    `<tr><td style="padding:8px 12px;border-bottom:1px solid #EFE6DA;color:#5A4C52;font-size:13px;white-space:nowrap;vertical-align:top">${escapeHtml(label)}</td>` +
    `<td style="padding:8px 12px;border-bottom:1px solid #EFE6DA;color:#1A1216;font-size:14px;white-space:pre-wrap">${escapeHtml(value)}</td></tr>`).join('');
  const htmlContent = `<!doctype html><html><body style="margin:0;background:#FAF7F3;font-family:Arial,Helvetica,sans-serif">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:24px 12px"><tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#FFFFFF;border-radius:12px;overflow:hidden;border:1px solid #E4D9CD">
<tr><td style="background:#5C1A2B;color:#FFFFFF;padding:20px 24px;font-size:18px;font-weight:bold">${escapeHtml(heading)}</td></tr>
<tr><td style="padding:20px 12px 8px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0">${htmlRows}</table></td></tr>
<tr><td style="padding:12px 24px 22px;color:#5A4C52;font-size:12px">Received ${escapeHtml(received)} via the Longhorn Publishers Cameroon website.${form === 'contact' && EMAIL.test(visitorEmail) ? ' Reply to this email to answer the sender directly.' : ''}</td></tr>
</table></td></tr></table></body></html>`;
  const textContent = `${heading}\n\n${rows.map(([l, v]) => `${l}: ${v}`).join('\n')}\n\nReceived ${received}.`;

  return {
    sender: { email: env.NOTIFY_FROM_EMAIL, name: env.NOTIFY_FROM_NAME || 'Longhorn Cameroon website' },
    to,
    ...(form === 'contact' && EMAIL.test(visitorEmail) ? { replyTo: { email: visitorEmail, ...(visitorName ? { name: visitorName } : {}) } } : {}),
    subject,
    htmlContent,
    textContent,
  };
}
