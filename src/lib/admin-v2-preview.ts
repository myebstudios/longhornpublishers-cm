import { adminIcon } from "./admin-icons";
import { contentIcon } from "./admin-content-icons";
import {
  catalogueBadges,
  countLabel,
  fingerprint,
  pageRecords,
  sortedRecords,
  type RecordData,
} from "./admin-v2-model";
import { recordTitle } from "./admin-v2-config";
export const node = (tag: string, text = "", className = "") => {
  const el = document.createElement(tag);
  el.textContent = text;
  el.className = className;
  return el;
};
export function action(
  label: string,
  fn: (button: HTMLButtonElement) => void,
  className = "button secondary",
) {
  const b = node("button", label, className) as HTMLButtonElement;
  b.type = "button";
  b.addEventListener("click", () => {
    if (b.getAttribute("aria-disabled") !== "true") fn(b);
    else
      b.dispatchEvent(new CustomEvent("admin:busy-attempt", { bubbles: true }));
  });
  return b;
}
export const translated = (row: RecordData, stem: string, lang: string) =>
  String(row[`${stem}_${lang}`] ?? "").trim() ||
  `${lang === "fr" ? "French" : "English"} copy missing`;
export function fullText(parent: HTMLElement, copy: string) {
  const excerpt = node("p", copy, "admin-excerpt");
  const details = document.createElement("details");
  details.append(node("summary", "View full summary"), node("p", copy));
  parent.append(excerpt, details);
}
export function thumbnail(
  id: unknown,
  title: string,
  cover = false,
  first = false,
) {
  const shell = node(
    "div",
    "",
    "" + (cover ? "admin-cover-shell" : "admin-landscape-shell"),
  );
  const empty = () => {
    const message = node("div", "", "admin-image-empty");
    const icon = node("span");
    icon.innerHTML = adminIcon(cover ? "book-open" : "house");
    message.append(
      icon,
      node("span", cover ? "No cover added" : "No image added"),
    );
    shell.replaceChildren(message);
  };
  if (!id) {
    empty();
    return shell;
  }
  const image = document.createElement("img");
  image.width = cover ? 180 : 640;
  image.height = cover ? 224 : 360;
  image.alt = `${title} — ${cover ? "cover" : "image"} preview`;
  image.loading = first ? "eager" : "lazy";
  image.decoding = "async";
  const read = () => {
    image.src = `/api/media/${String(id).split("/").map(encodeURIComponent).join("/")}`;
    shell.replaceChildren(image);
  };
  image.addEventListener("error", () => {
    const message = node("div", "", "admin-image-empty");
    message.append(
      node("span", "Image unavailable"),
      action("Retry image", () => read()),
    );
    shell.replaceChildren(message);
  });
  read();
  return shell;
}
export function moreActions(
  name: string,
  remove: (trigger: HTMLButtonElement) => void,
) {
  const host = node("div", "", "admin-more"),
    menu = node("div", "", "admin-more-menu");
  menu.hidden = true;
  menu.setAttribute("role", "menu");
  const trigger = action("More actions", () => {
    menu.hidden = !menu.hidden;
    trigger.setAttribute("aria-expanded", String(!menu.hidden));
    if (!menu.hidden) deleteButton.focus();
  });
  trigger.setAttribute("aria-label", `More actions for ${name}`);
  trigger.setAttribute("aria-haspopup", "menu");
  trigger.setAttribute("aria-expanded", "false");
  const close = () => {
    menu.hidden = true;
    trigger.setAttribute("aria-expanded", "false");
  };
  const deleteButton = action(
    "Delete",
    () => {
      close();
      trigger.focus();
      remove(trigger);
    },
    "button danger",
  );
  deleteButton.setAttribute("role", "menuitem");
  deleteButton.setAttribute("aria-label", `Delete ${name}`);
  menu.append(deleteButton);
  host.append(trigger, menu);
  host.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      close();
      trigger.focus();
    } else if (["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) {
      event.preventDefault();
      menu.hidden = false;
      trigger.setAttribute("aria-expanded", "true");
      deleteButton.focus();
    }
  });
  host.addEventListener("focusout", (event) => {
    if (!host.contains(event.relatedTarget as Node)) close();
  });
  document.addEventListener("click", (event) => {
    if (!host.contains(event.target as Node)) close();
  });
  return host;
}
export class PreviewCollection {
  root: HTMLElement;
  grid: HTMLElement;
  toolbar: HTMLElement;
  count: HTMLElement;
  pager: HTMLElement;
  empty: HTMLElement;
  query: HTMLInputElement;
  sort: HTMLSelectElement;
  filters = new Map<string, HTMLSelectElement>();
  rows: RecordData[] = [];
  language = "en";
  page = 1;
  view = "cards";
  fresh = false;
  private cards = new Map<string, { el: HTMLElement; stamp: string }>();
  private timer: ReturnType<typeof setTimeout> | undefined;
  constructor(
    public host: HTMLElement,
    public kind: string,
    public edit: (row: RecordData, trigger: HTMLButtonElement) => void,
    public remove:
      | ((row: RecordData, trigger: HTMLButtonElement) => void)
      | null,
    public context: () => {
      subjects?: RecordData[];
      homeIds?: string[] | null;
    } = () => ({}),
  ) {
    this.root = node("section");
    this.toolbar = node("div", "", "admin-preview-toolbar");
    this.query = this.control("Search", "input") as HTMLInputElement;
    this.query.type = "search";
    this.query.name = "search";
    this.query.id =
      kind === "catalogue" || kind === "news" || kind === "subjects"
        ? "searchFilter"
        : `${kind}Search`;
    this.sort = this.select(
      "Sort",
      kind === "hero" || kind === "process"
        ? [["order", "Display order"]]
        : kind === "legal"
          ? [
              ["az", "Page name A–Z"],
              ["updated", "Last saved"],
            ]
          : kind === "subjects"
            ? [
                ["az", "Name A–Z"],
                ["assigned", "Assigned titles descending"],
              ]
            : kind === "services"
              ? [
                  ["order", "Display order"],
                  ["az", "Name A–Z"],
                ]
              : kind === "news"
                ? [
                    ["updated", "Last edited"],
                    ["az", "Headline A–Z"],
                    ["date", "Stated publication date"],
                  ]
                : [
                    ["updated", "Last edited"],
                    ["az", "Title A–Z"],
                    ["za", "Title Z–A"],
                  ],
    );
    const controls = node("div", "", "admin-view-actions");
    for (const [value, label] of [
      ["cards", "Cards"],
      ["compact", "Compact cards"],
    ]) {
      const b = action(label, () => {
        this.view = value;
        this.grid.dataset.view = value;
        if (value === "compact") this.grid.style.gridTemplateColumns = "1fr";
        else this.grid.style.gridTemplateColumns = "";
        controls
          .querySelectorAll("button")
          .forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
      });
      b.setAttribute("aria-pressed", String(value === "cards"));
      controls.append(b);
    }
    if (kind !== "legal") this.toolbar.append(controls);
    this.count = node("p", "Loading saved content…", "admin-count");
    this.count.tabIndex = -1;
    this.count.setAttribute("role", "status");
    this.count.setAttribute("aria-live", "polite");
    this.grid = node("ul", "", "admin-card-grid");
    this.grid.dataset.kind = kind;
    this.grid.dataset.view = this.view;
    this.grid.setAttribute("aria-busy", "true");
    this.pager = node("div", "", "admin-pagination");
    this.empty = node("div");
    this.empty.id = ["catalogue", "news", "subjects"].includes(kind)
      ? "empty"
      : `${kind}Empty`;
    this.root.append(
      this.toolbar,
      this.count,
      this.empty,
      this.grid,
      this.pager,
    );
    if (kind === "subjects") {
      this.count.id = "countChip";
    }
    host.append(this.root);
    this.query.addEventListener("input", () => {
      clearTimeout(this.timer);
      this.timer = setTimeout(() => {
        this.page = 1;
        this.render();
      }, 250);
    });
    this.sort.addEventListener("change", () => {
      this.page = 1;
      this.render();
    });
    this.toolbar.append(
      action("Clear filters", () => {
        this.query.value = "";
        this.filters.forEach((f) => (f.value = "all"));
        this.page = 1;
        this.render();
        this.query.focus();
      }),
    );
    for (let i = 0; i < 3; i++) {
      const li = node("li");
      li.append(node("div", "", "admin-preview-card admin-skeleton"));
      li.style.minHeight = "18rem";
      this.grid.append(li);
    }
    new ResizeObserver(() =>
      requestAnimationFrame(() => {
        if (this.view === "compact") {
          if (this.grid.style.gridTemplateColumns !== "1fr")
            this.grid.style.gridTemplateColumns = "1fr";
          return;
        }
        const width = this.host.clientWidth;
        const cap = [
          "catalogue",
          "hero",
          "news",
          "subjects",
          "process",
        ].includes(kind)
          ? 3
          : 4;
        const columns =
          width >= 900 ? cap : width >= 560 ? Math.min(cap, 2) : 1;
        const desired = `repeat(${columns}, minmax(0px, 1fr))`;
        if (this.grid.style.gridTemplateColumns !== desired)
          this.grid.style.gridTemplateColumns = desired;
      }),
    ).observe(this.host);
  }
  control(label: string, tag: string) {
    const wrap = node("label");
    wrap.append(node("span", label));
    const field = document.createElement(tag) as
      | HTMLInputElement
      | HTMLSelectElement;
    wrap.append(field);
    this.toolbar.append(wrap);
    return field;
  }
  select(label: string, options: string[][]) {
    const field = this.control(label, "select") as HTMLSelectElement;
    for (const [value, text] of options) {
      const option = node("option", text) as HTMLOptionElement;
      option.value = value;
      field.append(option);
    }
    return field;
  }
  addFilter(key: string, label: string, options: string[][]) {
    const field = this.select(label, [
      ["all", `All ${label.toLowerCase()}`],
      ...options,
    ]);
    field.id =
      {
        published: "filterStatus",
        level: "filterLevel",
        category: "filterCategory",
      }[key] ?? `${this.kind}Filter${key}`;
    this.filters.set(key, field);
    field.addEventListener("change", () => {
      this.page = 1;
      this.render();
    });
    return field;
  }
  setRows(rows: RecordData[], fresh = true) {
    this.rows = rows;
    this.fresh = fresh;
    this.render();
  }
  render() {
    const query = this.query.value.trim().toLocaleLowerCase();
    const matching = this.rows.filter((row) => {
      if (
        query &&
        !Object.entries(row)
          .filter(
            ([key, value]) =>
              typeof value === "string" &&
              /_(en|fr)$|slug|product_code|page|platform/.test(key),
          )
          .map(([, v]) => v)
          .join(" ")
          .toLowerCase()
          .includes(query)
      )
        return false;
      for (const [key, filter] of this.filters) {
        if (filter.value === "all") continue;
        const value = filter.value;
        if (
          key === "published" &&
          (value === "unset"
            ? row.published !== undefined
            : value === "published"
              ? row.published !== true
              : row.published !== false)
        )
          return false;
        if (key === "enabled" && String(row.enabled) !== value) return false;
        if (
          key === "assigned" &&
          (value === "with"
            ? Number(row.title_count) === 0
            : Number(row.title_count) > 0)
        )
          return false;
        if (
          !["published", "enabled", "assigned"].includes(key) &&
          String(row[key] ?? "") !== value
        )
          return false;
      }
      return true;
    });
    const ordered =
      this.kind === "hero" || this.kind === "process"
        ? sortedRecords(matching, "order", (r) => recordTitle(r, this.language))
        : sortedRecords(matching, this.sort.value, (r) =>
            recordTitle(r, this.language),
          );
    const page = ["catalogue", "news"].includes(this.kind)
      ? pageRecords(ordered, this.page)
      : { rows: ordered, page: 1, pages: 1 };
    this.page = page.page;
    this.count.textContent = `Showing ${matching.length} of ${this.rows.length}${!this.fresh ? " · Last loaded — editing unavailable" : ""}`;
    this.grid.setAttribute("aria-busy", "false");
    const wanted = new Set<string>();
    for (const [rowIndex, row] of page.rows.entries()) {
      const key = String(row.id ?? row.page ?? rowIndex);
      wanted.add(key);
      const stamp = fingerprint({
        row,
        language: this.language,
        fresh: this.fresh,
        context: this.context(),
      });
      let cached = this.cards.get(key);
      if (!cached || cached.stamp !== stamp) {
        const el = this.card(row, rowIndex === 0);
        if (cached?.el.contains(document.activeElement)) this.count.focus();
        cached?.el.remove();
        cached = { el, stamp };
        this.cards.set(key, cached);
      }
      this.grid.append(cached.el);
    }
    for (const [key, cached] of this.cards)
      if (!wanted.has(key)) {
        cached.el.remove();
        this.cards.delete(key);
      }
    for (const child of [...this.grid.children])
      if (![...this.cards.values()].some((c) => c.el === child)) child.remove();
    this.empty.replaceChildren();
    this.grid.hidden = !page.rows.length;
    if (!page.rows.length) {
      const li = node("li");
      const empty = node("div", "", "admin-empty-state");
      empty.append(
        node("h3", this.rows.length ? "No matching items" : "No saved items"),
        node(
          "p",
          this.rows.length
            ? "Clear filters to see saved content."
            : "Use Add to create the first item.",
        ),
      );
      li.append(empty);
      this.empty.append(empty);
    }
    this.pager.replaceChildren();
    if (page.pages > 1) {
      for (const [label, delta] of [
        ["Previous", -1],
        ["Next", 1],
      ] as const) {
        const b = action(label, () => {
          this.page += delta;
          this.render();
          this.count.focus();
        });
        b.setAttribute(
          "aria-disabled",
          String(delta < 0 ? page.page === 1 : page.page === page.pages),
        );
        this.pager.append(b);
        if (delta < 0)
          this.pager.append(node("span", `Page ${page.page} of ${page.pages}`));
      }
    }
  }
  card(row: RecordData, first: boolean) {
    const li = node("li"),
      article = node("article", "", "admin-preview-card"),
      copy = node("div", "", "admin-card-copy"),
      name = recordTitle(row, this.language),
      heading = node("h3", name);
    heading.tabIndex = -1;
    article.dataset.recordKey = String(row.id ?? row.page ?? "");
    li.append(article);
    article.append(copy);
    const imageKey =
      this.kind === "catalogue"
        ? "cover_image_id"
        : this.kind === "news"
          ? "hero_image_id"
          : this.kind === "hero"
            ? "image_id"
            : "";
    if (this.kind === "hero") {
      heading.dataset.slideTitle = "";
      const number = node("small", `Slide ${row.sort_order}`);
      number.dataset.slideNumber = "";
      copy.append(number);
      article.classList.add("hero-slide-card");
      article.dataset.slideId = row.id;
    }
    if (imageKey)
      article.prepend(
        thumbnail(row[imageKey], name, this.kind === "catalogue", first),
      );
    else {
      const symbol = node("span");
      symbol.innerHTML = contentIcon(row.icon ?? "layout");
      copy.append(symbol);
      if (this.kind === "process")
        copy.append(node("p", `Step ${row.step_number}`));
    }
    copy.append(heading);
    if (row.title_fr || row.headline_fr || row.name_fr) {
      const alternate = node(
        "small",
        recordTitle(row, this.language === "en" ? "fr" : "en"),
      );
      if (this.kind === "hero") alternate.dataset.slideTitleFr = "";
      copy.append(alternate);
    }
    const badges = node("div", "", "admin-status-group");
    if (this.kind === "catalogue") {
      const state = catalogueBadges(row);
      for (const label of state.labels)
        badges.append(node("span", label, "admin-badge"));
      copy.append(
        node("p", `Product code: ${row.product_code}`),
        node(
          "p",
          `${row.level} · ${this.context().subjects?.find((s) => s.id === row.subject_id)?.[`name_${this.language}`] ?? (row.subject_id ? "Assigned subject unavailable" : "No subject")}`,
        ),
        node(
          "small",
          `Editions: ${(row.languages ?? []).join(" / ") || "None selected"}`,
        ),
        badges,
      );
      if (state.coverReason) copy.append(node("small", state.coverReason));
      const ids = this.context().homeIds;
      copy.append(
        node(
          "small",
          ids === null || ids === undefined
            ? "Homepage selection unavailable"
            : ids.includes(row.id)
              ? "Selected on homepage"
              : "Not selected on homepage",
        ),
      );
      if (
        row.title_en === row.title_fr &&
        row.description_en === row.description_fr
      )
        copy.append(
          node("small", "English and French text match — review translation"),
        );
    } else if (this.kind === "subjects")
      copy.append(
        node(
          "p",
          Number(row.title_count)
            ? `Used by ${countLabel(Number(row.title_count), "title")}`
            : "No titles assigned",
        ),
      );
    else {
      if (this.kind === "hero") {
        badges.append(
          node("span", row.enabled ? "Enabled" : "Disabled", "admin-badge"),
          node("span", `Order ${row.sort_order}`, "admin-badge"),
        );
        const accent = row[`headline_accent_${this.language}`];
        if (accent) copy.append(node("p", String(accent)));
        for (const stem of ["primary", "secondary"]) {
          const label = row[`${stem}_cta_label_${this.language}`];
          if (label)
            copy.append(
              node("small", `${label} → ${row[`${stem}_cta_href`] ?? ""}`),
            );
        }
      } else
        badges.append(
          node(
            "span",
            row.published === undefined
              ? "Not set up"
              : row.published
                ? "Published"
                : "Draft",
            "admin-badge",
          ),
        );
      copy.append(badges);
      if (row.category)
        copy.append(node("small", String(row.category).replaceAll("_", " ")));
      if (this.kind === "news")
        copy.append(
          node(
            "small",
            `Stated publication date: ${row.publish_date ? String(row.publish_date).slice(0, 10) : "Not stated"}`,
          ),
        );
      if (this.kind === "legal")
        copy.append(
          node(
            "small",
            `Stated content date: ${row.content_updated_at ? String(row.content_updated_at).slice(0, 10) : "Not stated"}`,
          ),
        );
      if (this.kind === "services") {
        copy.append(node("small", `Display order ${row.sort_order}`));
        if (row[`short_${this.language}`])
          copy.append(node("p", String(row[`short_${this.language}`])));
      }
    }
    const stem =
      this.kind === "news"
        ? "excerpt"
        : this.kind === "hero"
          ? "subheadline"
          : this.kind === "legal"
            ? "body"
            : "description";
    if (Object.hasOwn(row, `${stem}_en`) || Object.hasOwn(row, `${stem}_fr`))
      fullText(copy, translated(row, stem, this.language));
    if (
      typeof row.updated_at === "string" &&
      Number.isFinite(Date.parse(row.updated_at))
    )
      copy.append(
        node(
          "small",
          `Last saved: ${new Date(row.updated_at).toLocaleString("en-GB")}`,
        ),
      );
    const footer = node("footer", "", "admin-card-footer"),
      edit = action(
        row.published === undefined && this.kind === "legal"
          ? "Set up"
          : "Edit",
        (b) => this.edit(row, b),
      );
    edit.setAttribute(
      "aria-label",
      `${edit.textContent} ${name}${this.kind === "hero" ? ` · Order ${row.sort_order} · ${row.enabled ? "Enabled" : "Disabled"}` : ""}`,
    );
    edit.setAttribute("aria-disabled", String(!this.fresh));
    footer.append(edit);
    if (this.remove && row.id)
      footer.append(
        moreActions(
          this.kind === "hero"
            ? `${name} · Order ${row.sort_order} · ${row.enabled ? "Enabled" : "Disabled"}`
            : name,
          (b) => this.remove!(row, b),
        ),
      );
    article.append(footer);
    return li;
  }
}
