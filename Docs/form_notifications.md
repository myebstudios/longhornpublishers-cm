# Form email notifications (Brevo)

When someone submits the contact form or the newsletter form, the admins get an email. This doesn't use Netlify's paid notifications. Netlify runs `netlify/functions/submission-created.mts` for every submission that passes its spam check, and that function sends the email through Brevo's free plan (about 300 emails a day).

Contact enquiry emails set **Reply-To** to the visitor's address, so pressing Reply answers them directly.

## One-time setup

1. Create a free account at <https://www.brevo.com>.
2. Verify a sender: **Senders, domains & dedicated IPs → Senders → Add a sender**. Use an address you can receive mail at, for example the company inbox, then click the confirmation link Brevo sends to it.
3. Create an API key: **SMTP & API → API keys → Generate a new API key**. Copy it once; it starts with `xkeysib-`.
4. Set the environment variables on the Netlify project. Use the dashboard (**Project configuration → Environment variables**) or the CLI, and mark the key as secret.

| Variable | Example | Required |
|---|---|---|
| `BREVO_API_KEY` | `xkeysib-…` | yes (secret) |
| `NOTIFY_FROM_EMAIL` | the sender verified in step 2 | yes |
| `NOTIFY_FROM_NAME` | `Longhorn Cameroon website` | no |
| `NOTIFY_CONTACT_TO` | `a@company.com, b@company.com` (comma-separated) | yes |
| `NOTIFY_NEWSLETTER_TO` | where signup emails go; falls back to `NOTIFY_CONTACT_TO` | no |

Environment variables take effect on the next deploy. Setting them doesn't trigger a build by itself.

## Troubleshooting

Look for `[notify]` lines in **Logs → Functions → submission-created**:
- `skipped … not configured` means a variable is missing or a recipient address is invalid.
- `Brevo 401` means the API key is wrong. `Brevo 400` usually means the sender isn't verified yet.
- If emails arrive in spam, add Brevo's DNS records for the domain (Senders, domains → Domains) when DNS access is available.
