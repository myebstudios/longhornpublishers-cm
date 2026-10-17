import { request, confirmAction } from "./admin-client";
import { AdminEditor } from "./admin-v2-dialog";
import { node, action } from "./admin-v2-preview";
import { publishInboxCounts } from "./admin-inbox-count";
import {
  inboxDate,
  newsletterCsv,
  replyLink,
  type InboxItem,
  type InboxCounts,
  type InboxResult,
} from "./admin-inbox-model";
const endpoint = "/api/form-submissions-admin";
const el = <T extends HTMLElement = HTMLElement>(id: string) =>
  document.getElementById(id) as T;
const editor = new AdminEditor();
const detailForm = el<HTMLFormElement>("inboxDetail");
detailForm.addEventListener("submit", (event) => event.preventDefault());
const status = el<HTMLSelectElement>("inboxStatus"),
  search = el<HTMLInputElement>("inboxSearch");
const previous = el<HTMLButtonElement>("inboxPrevious"),
  next = el<HTMLButtonElement>("inboxNext"),
  exportButton = el<HTMLButtonElement>("inboxExport");
const feedback = el("inboxFeedback"),
  list = el("inboxList");
let form = "contact",
  page = 1,
  pages = 0,
  serial = 0,
  timer: ReturnType<typeof setTimeout>;
let selected: InboxItem | null = null;
const query = (extra: Record<string, string> = {}) =>
  new URLSearchParams({
    form,
    status: status.value,
    search: search.value.trim(),
    page: String(page),
    ...extra,
  });
function focusTarget() {
  return (
    list.querySelector<HTMLButtonElement>(
      `[data-submission-id="${selected?.id}"]`,
    ) ?? el("inboxHeading")
  );
}
function render(items: InboxItem[]) {
  list.replaceChildren();
  for (const item of items) {
    const card = node("article", "", "inbox-item");
    card.append(
      node(
        "h2",
        item.form_name === "contact"
          ? item.name || item.email || "Contact inquiry"
          : item.email || "Email not provided",
      ),
    );
    if (item.form_name === "contact") {
      card.append(
        node("p", [item.organisation, item.email].filter(Boolean).join(" · ")),
      );
      if (item.message) card.append(node("p", item.message, "admin-excerpt"));
    }
    const footer = node("footer");
    const time = node("time", inboxDate(item.created_at)) as HTMLTimeElement;
    time.dateTime = item.created_at;
    const badge = node(
      "span",
      item.status === "new"
        ? "New"
        : item.status === "read"
          ? "Read"
          : "Archived",
      `admin-badge inbox-state-${item.status}`,
    );
    const open = action("Open", (button) => void openItem(item, button));
    open.dataset.submissionId = item.id;
    open.setAttribute(
      "aria-label",
      `Open ${item.name || item.email || "submission"} from ${inboxDate(item.created_at)}`,
    );
    footer.append(time, badge, open);
    card.append(footer);
    list.append(card);
  }
  if (editor.dialog.open) editor.trigger = focusTarget();
}
async function load() {
  const current = ++serial;
  el("inboxResults").setAttribute("aria-busy", "true");
  feedback.textContent = "Loading submissions…";
  previous.disabled = next.disabled = true;
  // Remove stale rows so a filter change never opens an item from the previous view.
  list.replaceChildren();
  const result = await request<InboxResult>(`${endpoint}?${query()}`);
  if (current !== serial) return;
  el("inboxResults").setAttribute("aria-busy", "false");
  if (!result.ok || !result.data) {
    if (editor.dialog.open) editor.trigger = el("inboxHeading");
    feedback.textContent = `${result.error} Use Refresh to retry.`;
    el("inboxPage").textContent = "";
    return;
  }
  const data = result.data;
  pages = data.total_pages;
  if (page > Math.max(1, pages)) {
    page = Math.max(1, pages);
    return load();
  }
  publishInboxCounts(data.counts);
  render(data.items);
  feedback.textContent = data.total
    ? `${data.total} ${form === "contact" ? (data.total === 1 ? "inquiry" : "inquiries") : data.total === 1 ? "newsletter signup" : "newsletter signups"} found.`
    : "No submissions match these filters.";
  el("inboxPage").textContent = pages
    ? `Page ${page} of ${pages}`
    : "0 results";
  previous.disabled = page <= 1;
  next.disabled = page >= pages;
}
function showDetail(item: InboxItem) {
  const content = el("inboxDetailContent");
  content.replaceChildren();
  content.append(
    node(
      "p",
      `${item.status === "new" ? "New" : item.status === "read" ? "Read" : "Archived"} · ${inboxDate(item.created_at)}`,
    ),
  );
  const fields = node("dl", "", "inbox-details");
  const field = (label: string, value: unknown) => {
    fields.append(
      node("dt", label),
      node(
        "dd",
        value == null || value === ""
          ? "Not provided"
          : typeof value === "object"
            ? JSON.stringify(value, null, 2)
            : String(value),
      ),
    );
  };
  field("Email", item.email);
  if (item.form_name === "contact") {
    for (const [key, label] of [
      ["name", "Name"],
      ["organisation", "Organisation"],
      ["phone", "Phone"],
      ["project_type", "Project type"],
      ["languages", "Languages"],
      ["stage", "Stage"],
      ["message", "Message"],
    ] as const)
      field(label, item[key]);
  }
  const known = new Set([
    "name",
    "email",
    "organisation",
    "phone",
    "projectType",
    "project_type",
    "languages",
    "stage",
    "message",
    "bot-field",
    "form-name",
  ]);
  for (const [key, value] of Object.entries(item.data ?? {}))
    if (!known.has(key))
      field(
        key.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/[_-]/g, " "),
        value,
      );
  content.append(fields);
  const href = replyLink(item.email);
  if (href && item.form_name === "contact") {
    const reply = node(
      "a",
      "Reply by email",
      "button secondary inbox-reply",
    ) as HTMLAnchorElement;
    reply.href = href;
    content.append(reply);
  }
  editor.actions.replaceChildren();
  if (item.status !== "read")
    editor.actions.append(action("Mark read", () => void changeStatus("read")));
  if (item.status !== "archived")
    editor.actions.append(
      action("Archive", () => void changeStatus("archived")),
    );
  editor.actions.append(
    action("Delete", () => void deleteItem(), "button danger"),
  );
  editor.setPending(0);
}
async function changeStatus(value: "read" | "archived") {
  if (!selected || editor.pending) return;
  editor.setPending(1);
  editor.errors.hidden = true;
  editor.status.textContent = "Updating status…";
  try {
    const result = await request<{ item: InboxItem; counts: InboxCounts }>(
      endpoint,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: selected.id, status: value }),
      },
    );
    if (!result.ok || !result.data) {
      editor.status.textContent = "Status update could not be confirmed.";
      editor.showErrors(result.error || "Status could not be updated.");
      return;
    }
    selected = result.data.item;
    publishInboxCounts(result.data.counts);
    showDetail(selected);
    editor.title.focus();
    editor.status.textContent = value === "read" ? "Marked read." : "Archived.";
    await load();
  } finally {
    editor.setPending(-1);
  }
}
async function openItem(item: InboxItem, trigger: HTMLButtonElement) {
  if (editor.dialog.open || editor.pending) return;
  selected = item;
  editor.open(
    detailForm,
    item.form_name === "contact" ? "Contact inquiry" : "Newsletter signup",
    "Inbox · Saved submission",
    "medium",
    trigger,
    () => null,
    () => {
      selected = null;
    },
  );
  showDetail(item);
  if (item.status === "new") await changeStatus("read");
}
async function deleteItem() {
  if (!selected || editor.pending) return;
  const id = selected.id;
  const confirmed = await confirmAction(
    "Delete this submission from the admin Inbox? This cannot be undone here. The original submission in Netlify Forms is not deleted.",
  );
  if (!confirmed) return;
  editor.dialog.showModal();
  editor.setPending(1);
  editor.errors.hidden = true;
  editor.status.textContent = "Deleting…";
  const result = await request<{ counts: InboxCounts }>(
    `${endpoint}?${new URLSearchParams({ id })}`,
    { method: "DELETE" },
  );
  editor.setPending(-1);
  if (!result.ok) {
    editor.status.textContent = "Deletion could not be confirmed.";
    editor.showErrors(result.error || "Submission could not be deleted.");
    return;
  }
  if (result.data) publishInboxCounts(result.data.counts);
  editor.closeNow(el("inboxHeading"));
  await load();
}
const tabs = [
  ...document.querySelectorAll<HTMLButtonElement>("[role=tab][data-form]"),
];
function switchTab(tab: HTMLButtonElement) {
  clearTimeout(timer);
  form = tab.dataset.form!;
  page = 1;
  tabs.forEach((other) => {
    const active = other === tab;
    other.setAttribute("aria-selected", String(active));
    other.tabIndex = active ? 0 : -1;
  });
  el("inboxResults").setAttribute("aria-labelledby", tab.id);
  exportButton.hidden = form !== "newsletter";
  el("inboxExportFeedback").textContent = "";
  void load();
}
tabs.forEach((tab) => {
  tab.addEventListener("click", () => switchTab(tab));
  tab.addEventListener("keydown", (event) => {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    const target =
      event.key === "Home"
        ? tabs[0]
        : event.key === "End"
          ? tabs.at(-1)!
          : tabs[(tabs.indexOf(tab) + 1) % tabs.length];
    target.focus();
    switchTab(target);
  });
});
status.addEventListener("change", () => {
  clearTimeout(timer);
  page = 1;
  void load();
});
search.addEventListener("input", () => {
  clearTimeout(timer);
  ++serial;
  timer = setTimeout(() => {
    page = 1;
    void load();
  }, 250);
});
previous.addEventListener("click", () => {
  if (page > 1) {
    --page;
    void load();
  }
});
next.addEventListener("click", () => {
  if (page < pages) {
    ++page;
    void load();
  }
});
el("inboxRefresh").addEventListener("click", () => {
  clearTimeout(timer);
  void load();
});
exportButton.addEventListener("click", async () => {
  if (exportButton.disabled) return;
  exportButton.disabled = true;
  const output = el("inboxExportFeedback");
  output.textContent = "Preparing CSV…";
  const params = query({ form: "newsletter", page_size: "100", page: "1" });
  const items: InboxItem[] = [];
  try {
    let totalPages = 1;
    for (let current = 1; current <= totalPages; current++) {
      params.set("page", String(current));
      const result = await request<InboxResult>(`${endpoint}?${params}`);
      if (!result.ok || !result.data)
        throw new Error(result.error || "Export failed.");
      items.push(...result.data.items);
      totalPages = result.data.total_pages;
    }
    const unique = [...new Map(items.map((item) => [item.id, item])).values()];
    const url = URL.createObjectURL(
      new Blob([newsletterCsv(unique)], { type: "text/csv;charset=utf-8" }),
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = `longhorn-newsletter-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.append(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    output.textContent = `Exported ${unique.length} newsletter signup${unique.length === 1 ? "" : "s"} matching the selected filters.`;
  } catch (error) {
    output.textContent =
      error instanceof Error ? error.message : "Export failed. Try again.";
  } finally {
    exportButton.disabled = false;
  }
});
void load();
