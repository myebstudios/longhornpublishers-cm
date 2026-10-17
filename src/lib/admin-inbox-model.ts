export interface InboxItem {
  id: string;
  form_name: "contact" | "newsletter";
  status: "new" | "read" | "archived";
  name: string | null;
  email: string | null;
  organisation: string | null;
  phone: string | null;
  project_type: string | null;
  languages: string | null;
  stage: string | null;
  message: string | null;
  data: Record<string, unknown>;
  created_at: string;
}
export interface InboxCounts {
  new: number;
  inquiries: number;
}
export interface InboxResult {
  items: InboxItem[];
  total: number;
  page: number;
  total_pages: number;
  counts: InboxCounts;
}
export const replySubject = "Re: your enquiry to Longhorn Publishers Cameroon";
export function replyLink(email: string | null): string | null {
  if (!email || !/^[^\s@<>?,;:]+@[^\s@<>?,;:]+\.[^\s@<>?,;:]+$/.test(email))
    return null;
  return `mailto:${encodeURIComponent(email)}?subject=${encodeURIComponent(replySubject)}`;
}
export function newsletterCsv(
  items: Pick<InboxItem, "email" | "created_at" | "status">[],
) {
  const cell = (value: string | null) => {
    let text = value ?? "";
    if (/^[\s]*[=+\-@]/.test(text) || /^[\t\r\n]/.test(text)) text = `'${text}`;
    return `"${text.replaceAll('"', '""')}"`;
  };
  return (
    "\ufeff" +
    [
      ["Email", "Date", "Status"],
      ...items.map((item) => [item.email, item.created_at, item.status]),
    ]
      .map((row) => row.map(cell).join(","))
      .join("\r\n") +
    "\r\n"
  );
}
export function inboxDate(value: string) {
  const date = new Date(value);
  return Number.isFinite(date.getTime())
    ? new Intl.DateTimeFormat("en-GB", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(date)
    : "Date unavailable";
}
