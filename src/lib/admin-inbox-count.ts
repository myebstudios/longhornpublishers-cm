import { request } from "./admin-client";
import type { InboxCounts } from "./admin-inbox-model";
let revision = 0;
export function publishInboxCounts(counts: InboxCounts | null) {
  ++revision;
  document
    .querySelectorAll<HTMLElement>("[data-inbox-count]")
    .forEach((badge) => {
      badge.hidden = !counts?.new;
      badge.textContent = counts
        ? counts.new > 99
          ? "99+"
          : String(counts.new)
        : "";
      badge
        .closest("a")
        ?.setAttribute(
          "aria-label",
          counts ? `Inbox, ${counts.new} new submissions` : "Inbox",
        );
    });
  document
    .querySelectorAll<HTMLElement>("[data-inbox-inquiries]")
    .forEach((metric) => {
      metric.textContent = counts ? String(counts.inquiries) : "—";
    });
  document
    .querySelectorAll<HTMLElement>("[data-inbox-caption]")
    .forEach((caption) => {
      caption.textContent = counts
        ? "Contact inquiries awaiting review"
        : "Could not load · Refresh to retry";
    });
}
let pending: Promise<void> | null = null;
export function refreshInboxCounts() {
  return (pending ??= (async () => {
    const startedAtRevision = revision;
    const result = await request<{ counts: InboxCounts }>(
      "/api/form-submissions-admin?counts_only=true",
    );
    // A late count read must not overwrite a newer list or status response.
    if (startedAtRevision === revision)
      publishInboxCounts(result.ok ? result.data!.counts : null);
  })().finally(() => {
    pending = null;
  }));
}
void refreshInboxCounts();
