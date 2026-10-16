import {
  confirmAction,
  coverFileError,
  emptyToNull,
  request,
  sendJson,
  uploadMedia,
} from "./admin-client";
import { adaptDashboard } from "./admin-dashboard";
import { serviceImageSource } from "./service-image";
import { mountPageImages } from "./admin-page-images";
import { AdminEditor } from "./admin-v2-dialog";
import {
  cloneRecord,
  fingerprint,
  mergeOwned,
  mergeArrayItem,
  mergeRowControls,
  isSingletonEditor,
  legalPreviewSections,
  secondsToMilliseconds,
  countLabel,
  calendarDateForPayload,
  hydrateEditorField,
  editorBaseline,
  assertReadFields,
  catalogueBadges,
  editorFieldIsOwned,
  heroSlotState,
  type RecordData,
} from "./admin-v2-model";
import { pages, sections, recordTitle, type Section } from "./admin-v2-config";
import {
  action,
  node,
  statusBadge,
  thumbnail,
  translated,
  excerpt,
  moreActions,
  PreviewCollection,
} from "./admin-v2-preview";
import { contentIcon, contentIconKeys } from "./admin-content-icons";
import {
  fieldsForHeroSlideError,
  validateHeroSlideDraft,
} from "./admin-hero-slides";
import {
  validateAbout,
  validateContact,
  validateHomepage,
  validateLegalPage,
  validateProcessStep,
  validateService,
  validateSiteSettings,
  validateWhy,
} from "../../netlify/functions/_shared/cms-validation";
import { parseClassification } from "../../netlify/functions/_shared/catalogue-classification";
import { localizeCmsHref } from "../i18n/routes";
const fields = (root: ParentNode) => [
  ...root.querySelectorAll<
    HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
  >("input,textarea,select"),
];
const value = (
  field: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement,
) =>
  field instanceof HTMLInputElement && field.type === "checkbox"
    ? field.checked
    : field.value;
const validators: Record<
  string,
  (record: unknown) => { ok: boolean; error?: string }
> = {
  homepage: validateHomepage,
  about: validateAbout,
  why: validateWhy,
  contact: validateContact,
  settings: validateSiteSettings,
  legal: validateLegalPage,
  services: validateService,
  process: validateProcessStep,
};
export async function startAdminV2(page: string) {
  const config = pages[page],
    canvas = document.querySelector<HTMLElement>("#adminCanvas")!,
    editor = new AdminEditor();
  let data: Record<string, RecordData[]> = {},
    loaded = false,
    reading = false,
    readError = false,
    language = "en",
    subjects: RecordData[] = [],
    catalogue: RecordData[] = [],
    homeIds: string[] | null = null;
  let baseline: RecordData = {},
    initial = new Map<Element, unknown>(),
    activeForm: HTMLFormElement | null = null,
    activeKind = page,
    activeSection: Section | null = null,
    arrayIndex: number | null = null,
    working: RecordData = {},
    opening = false,
    latestConflict: RecordData | null = null;
  const sectionCache = new Map<string, { el: HTMLElement; stamp: string }>();
  const arraySearch = new Map<string, string>();
  const collections = new Map<string, PreviewCollection>();
  const pageStatus =
    document.querySelector<HTMLElement>("#status") ??
    node("p", "", "admin-saved-status");
  pageStatus.id = "status";
  pageStatus.className = "admin-saved-status";
  pageStatus.tabIndex = -1;
  pageStatus.setAttribute("role", "status");
  pageStatus.setAttribute("aria-live", "polite");
  canvas.replaceChildren(pageStatus);
  const languageBar = node("div", "", "admin-language-actions");
  for (const [lang, label] of [
    ["en", "English"],
    ["fr", "Français"],
  ]) {
    const b = action(label, () => {
      language = lang;
      languageBar
        .querySelectorAll("button")
        .forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
      render();
    });
    b.setAttribute("aria-pressed", String(lang === language));
    languageBar.append(b);
  }
  canvas.append(languageBar);
  const savedCanvas = node("div");
  canvas.append(savedCanvas);
  const singleton = () => data[config.source]?.[0] ?? null;
  const status = (message: string, error = false) => {
    pageStatus.textContent = message;
    pageStatus.setAttribute("role", error ? "alert" : "status");
    pageStatus.className = error
      ? "admin-saved-status status status--err"
      : "admin-saved-status";
  };
  const singletonKind = (kind: string) =>
    isSingletonEditor(!!config.singleton, page, kind);
  const snapshot = () =>
    activeForm
      ? fields(activeForm)
          .filter((f) => f.type !== "file" && (f.name || f.dataset.recordField))
          .map((f) => [
            f.name ||
              fingerprint(
                [...f.attributes]
                  .filter((a) => a.name.startsWith("data-"))
                  .map((a) => [a.name, a.value]),
              ),
            value(f),
          ])
      : null;
  const formFor = (kind: string, row?: RecordData) =>
    kind === "hero"
      ? heroForm
      : kind === "services"
        ? document.querySelector<HTMLFormElement>("#serviceForm")!
        : kind === "process"
          ? document.querySelector<HTMLFormElement>("#processForm")!
          : page === "legal"
            ? document.querySelector<HTMLFormElement>(
                `form[data-page="${row?.page}"]`,
              )!
            : document.querySelector<HTMLFormElement>(`#${config.form}`)!;
  let heroForm!: HTMLFormElement;
  if (page === "homepage") {
    const template =
      document.querySelector<HTMLTemplateElement>("#heroSlideTemplate")!;
    heroForm = template.content
      .querySelector<HTMLFormElement>("form")!
      .cloneNode(true) as HTMLFormElement;
    heroForm.id = "heroSlideEditor";
    heroForm.hidden = true;
    editor.body.append(heroForm);
  }
  // All existing form hooks remain mounted inside the closed shared dialog.
  editor.dialog.querySelectorAll<HTMLFormElement>("form").forEach((form) => {
    form.hidden = true;
    form.noValidate = true;
    form
      .querySelectorAll(".form-actions,.hero-slide-actions")
      .forEach((bar) => {
        bar.setAttribute("hidden", "");
      });
    form
      .querySelectorAll("[data-delete-slide],[data-move-up],[data-move-down]")
      .forEach((b) => b.setAttribute("hidden", ""));
  });
  function checkReadRecords(kind: string, rows: RecordData[]) {
    const contract: Record<string, string[]> = {
      catalogue: [
        "title_en",
        "title_fr",
        "product_code",
        "slug",
        "level",
        "subject_id",
        "languages",
        "cover_image_id",
        "description_en",
        "description_fr",
        "curriculum_alignment_en",
        "curriculum_alignment_fr",
        "featured",
        "published",
        "classification",
        "booklist_evidence_ref",
        "booklist_verified_by",
        "booklist_verified_at",
        "cover_rights_approved",
      ],
      news: [
        "headline_en",
        "headline_fr",
        "slug",
        "category",
        "publish_date",
        "excerpt_en",
        "excerpt_fr",
        "body_en",
        "body_fr",
        "published",
        "hero_image_id",
      ],
      subjects: ["name_en", "name_fr", "title_count"],
      hero: [
        "image_id",
        "sort_order",
        "enabled",
        "headline_en",
        "headline_fr",
        "subheadline_en",
        "subheadline_fr",
        "primary_cta_label_en",
        "primary_cta_label_fr",
        "primary_cta_href",
      ],
      services: [
        "image_id",
        "name_en",
        "name_fr",
        "slug",
        "short_en",
        "short_fr",
        "category",
        "icon",
        "description_en",
        "description_fr",
        "sort_order",
        "published",
      ],
      process: [
        "step_number",
        "title_en",
        "title_fr",
        "description_en",
        "description_fr",
        "published",
      ],
      legal: ["page", "body_en", "body_fr", "content_updated_at", "published"],
    };
    const keys =
      contract[kind] ??
      (sections[page] ?? []).flatMap((section) => section.fields);
    rows.forEach((row) => {
      assertReadFields(row, keys);
      for (const section of sections[page] ?? []) {
        if (section.array && Object.hasOwn(row, section.array)) {
          for (const item of row[section.array] ?? [])
            assertReadFields(item, []);
        }
      }
    });
  }
  function initializeInputs(form: HTMLFormElement, record: RecordData) {
    form.reset();
    for (const field of fields(form)) {
      if (field.type === "file") {
        field.value = "";
        continue;
      }
      if (!field.name) continue;
      let v = record[field.name];
      if (["language_en", "language_fr"].includes(field.name))
        v = record.languages?.includes(field.name.slice(-2)) ?? false;
      if (field.name === "hero_autoplay_interval")
        v = Number(record.hero_autoplay_interval ?? 6000) / 1000;
      hydrateEditorField(field, v);
    }
    if (page === "catalogue") {
      const select = form.elements.namedItem("subject_id") as HTMLSelectElement;
      select.replaceChildren(new Option("No subject", ""));
      for (const s of subjects)
        select.append(new Option(`${s.name_en} / ${s.name_fr}`, s.id));
      if (
        record.subject_id &&
        !subjects.some((s) => s.id === record.subject_id)
      )
        select.append(
          new Option("Current subject (unavailable)", record.subject_id),
        );
      select.value = record.subject_id ?? "";
    }
    for (const section of sections[page] ?? [])
      if (section.array && form.querySelector(`#${section.container}`))
        hydrateArray(form, section, record[section.array] ?? []);
    if (page === "homepage" && form.id === "homepageForm")
      hydrateFeatured(form, record.featured_catalogue_ids ?? []);
    friendlyFields(form, record);
    mediaBindings(form);
    renderMedia(form);
    initial = new Map(fields(form).map((field) => [field, value(field)]));
  }
  function hydrateArray(
    form: HTMLFormElement,
    section: Section,
    rows: RecordData[],
  ) {
    const container = form.querySelector<HTMLElement>(`#${section.container}`)!;
    container.replaceChildren();
    rows.forEach((row, index) => {
      const el = node("div", "", "repeat-row");
      el.dataset.rowIndex = String(index);
      el.dataset.array = section.array;
      for (const spec of section.rowFields ?? []) {
        const label = node("label");
        label.append(node("span", spec.label));
        const field = document.createElement(
          spec.type === "textarea" ? "textarea" : "input",
        ) as HTMLInputElement | HTMLTextAreaElement;
        if (field instanceof HTMLInputElement) field.type = spec.type ?? "text";
        field.setAttribute(`data-${spec.hook}`, "");
        field.dataset.recordField = spec.key;
        field.name = `${section.array}__${index}__${spec.key}`;
        field.required = spec.required ?? false;
        if (spec.max) field.maxLength = spec.max;
        field.lang = spec.key.endsWith("_fr") ? "fr" : "en";
        let v = row[spec.key];
        if (spec.key.startsWith("tags_")) v = (v ?? []).join(", ");
        if (spec.key.startsWith("title_") && !v && row.title) v = row.title;
        field.value = String(v ?? "");
        label.append(field);
        el.append(label);
      }
      container.append(el);
    });
  }
  function hydrateFeatured(form: HTMLFormElement, ids: string[]) {
    const choices = form.querySelector("#catalogueChoices")!;
    choices.replaceChildren();
    const rows: RecordData[] = [
      ...catalogue,
      ...ids
        .filter((id) => !catalogue.some((r) => r.id === id))
        .map((id) => ({
          id,
          title_en: "Selected title unavailable",
          published: false,
        })),
    ];
    for (const row of rows) {
      const label = node("label", "", "choice");
      const input = document.createElement("input");
      input.type = "checkbox";
      input.dataset.id = row.id;
      input.value = row.id;
      input.name = "featured_catalogue_ids";
      input.checked = ids.includes(row.id);
      label.append(
        input,
        thumbnail(row.cover_image_id, recordTitle(row), "catalogue" === page),
        node(
          "span",
          `${recordTitle(row)} · ${row.published ? "Published" : "Draft"}`,
        ),
      );
      choices.append(label);
    }
  }
  function serialize() {
    const edits: RecordData = {};
    for (const field of fields(activeForm!)) {
      if (
        !field.name ||
        field.type === "file" ||
        field.dataset.recordField ||
        field.name === "featured_catalogue_ids"
      )
        continue;
      if (
        value(field) === initial.get(field) &&
        Object.hasOwn(baseline, field.name)
      )
        continue;
      let v: any = value(field);
      if (field.name === "hero_autoplay_interval")
        v = secondsToMilliseconds(
          Number(v),
          Number(baseline.hero_autoplay_interval ?? 6000),
        );
      if (["map_lat", "map_lng"].includes(field.name))
        v = v === "" ? null : Number(v);
      if (["sort_order", "step_number"].includes(field.name)) v = Number(v);
      edits[field.name] = v;
    }
    const result = { ...cloneRecord(baseline), ...edits };
    for (const key of [
      "publish_date",
      "booklist_verified_at",
      "content_updated_at",
    ])
      if (Object.hasOwn(result, key))
        result[key] = calendarDateForPayload(result[key]);
    if (page === "catalogue") {
      if (
        edits.language_en !== undefined ||
        edits.language_fr !== undefined ||
        !baseline.id
      )
        result.languages = ["en", "fr"].filter(
          (lang) =>
            (
              activeForm!.elements.namedItem(
                `language_${lang}`,
              ) as HTMLInputElement
            ).checked,
        );
      delete result.language_en;
      delete result.language_fr;
      emptyToNull(result, [
        "id",
        "subject_id",
        "cover_image_id",
        "booklist_evidence_ref",
        "booklist_verified_by",
        "booklist_verified_at",
      ]);
    }
    if (activeKind === "news")
      emptyToNull(result, ["publish_date", "hero_image_id"]);
    if (activeKind === "hero") emptyToNull(result, ["image_id"]);
    for (const section of sections[page] ?? []) {
      if (!section.array || !activeForm!.querySelector(`#${section.container}`))
        continue;
      const rows = [
        ...activeForm!.querySelectorAll<HTMLElement>(
          `#${section.container} .repeat-row`,
        ),
      ];
      const original = baseline[section.array] ?? [];
      result[section.array] = rows.map((row, index) => {
        return mergeRowControls(
          original[index] ?? {},
          fields(row).map((field) => ({
            key: field.dataset.recordField,
            value: field.value,
            initial: initial.get(field),
          })),
          section.array === "team_capacity_blocks",
        );
      });
    }
    if (page === "homepage" && activeForm!.id === "homepageForm") {
      const choices = fields(activeForm!).filter(
        (f) => f.name === "featured_catalogue_ids",
      ) as HTMLInputElement[];
      if (
        choices.some((f) => f.checked !== initial.get(f)) ||
        !baseline.featured_catalogue_ids
      )
        result.featured_catalogue_ids = choices
          .filter((f) => f.checked)
          .map((f) => f.value);
    }
    return activeSection
      ? mergeOwned(baseline, result, activeSection.fields)
      : result;
  }
  function restrictForm(
    form: HTMLFormElement,
    section: Section | null,
    index: number | null,
  ) {
    const owned = section?.fields;
    for (const field of fields(form)) {
      const label = field.closest<HTMLElement>("label");
      if (!label) continue;
      const row = field.closest<HTMLElement>(".repeat-row");
      const show =
        !owned ||
        editorFieldIsOwned(
          field.name,
          field.closest<HTMLElement>("[data-media]")?.dataset.media,
          owned,
        ) ||
        !!(
          row &&
          section?.array === row.dataset.array &&
          (index === null || Number(row.dataset.rowIndex) === index)
        );
      label.hidden = !show;
    }
    form
      .querySelectorAll<HTMLElement>(
        "fieldset,.two,.carousel-settings,.media-field,.checks,.repeat-list,.choice-list,.media-preview,.cover__row",
      )
      .forEach((group) => {
        const media = group.dataset.media;
        group.hidden =
          !!owned &&
          !fields(group).some(
            (f) => !f.closest<HTMLElement>("label")?.hidden,
          ) &&
          !(media && owned.includes(media));
      });
    if (owned)
      form
        .querySelectorAll<HTMLElement>(
          "h2,.toolbar,p:not(.required-hint),.hero-slide-actions",
        )
        .forEach((el) => {
          if (
            !el.closest("label") &&
            !el.matches("#autoplayHint,#autoplayError,[data-status],#status")
          )
            el.hidden = true;
        });
    else
      form.querySelectorAll<HTMLElement>("h2,.toolbar,p").forEach((el) => {
        if (!el.closest(".form-actions")) el.hidden = false;
      });
    if (section?.array) {
      const container = form.querySelector<HTMLElement>(
        `#${section.container}`,
      )!;
      container.hidden = false;
      container
        .querySelectorAll<HTMLElement>(".repeat-row")
        .forEach(
          (row) =>
            (row.hidden =
              index !== null && Number(row.dataset.rowIndex) !== index),
        );
    }
    if (section?.key === "featured") {
      form.querySelector<HTMLElement>("#catalogueChoices")!.hidden = false;
      form
        .querySelectorAll<HTMLElement>("#catalogueChoices label")
        .forEach((x) => (x.hidden = false));
    }
  }
  async function openEdit(
    kind: string,
    row: RecordData | null,
    trigger: HTMLElement | null,
    section: Section | null = null,
    index: number | null = null,
    addItem = false,
  ) {
    if (opening || editor.dialog.open || readError) return;
    opening = true;
    trigger?.setAttribute("aria-disabled", "true");
    try {
      if (!(await read(false))) {
        status("Could not open editor. Retry the read before editing.", true);
        return;
      }
      if (kind === "hero" && !row && !heroSlotState(data.hero ?? []).canAdd) {
        status("Five slides are saved. Delete a slide to add another.", true);
        updateHeroCap();
        return;
      }
      let fresh = row;
      if (singletonKind(kind)) fresh = singleton();
      else if (row)
        fresh =
          (data[kind] ?? []).find(
            (r) => (r.id ?? r.page) === (row.id ?? row.page),
          ) ?? null;
      if (row && !fresh && kind !== "legal") {
        status(
          "That item no longer exists. The previews have been refreshed.",
          true,
        );
        return;
      }
      activeKind = kind;
      activeSection = fresh ? section : null;
      arrayIndex = index;
      const defaults: RecordData = {};
      if (!fresh) {
        if (!["subjects", "hero"].includes(kind)) defaults.published = false;
        if (kind === "hero") defaults.enabled = false;
        if (kind === "services")
          defaults.sort_order = (data.services ?? []).length;
        if (kind === "process")
          defaults.step_number = (data.process ?? []).length + 1;
        if (kind === "legal") defaults.page = row?.page;
      }
      baseline = editorBaseline(fresh, singletonKind(kind), defaults);
      working = cloneRecord(baseline);
      latestConflict = null;
      activeForm = formFor(kind, row ?? undefined);
      if (addItem && section?.array) {
        baseline[section.array] ??= [];
        if (baseline[section.array].length >= (section.limit ?? Infinity)) {
          status(`Maximum ${section.limit} saved items.`, true);
          return;
        }
        index = baseline[section.array].length;
        arrayIndex = index;
        working = mergeArrayItem(baseline, section.array, null, {});
      } else working = cloneRecord(baseline);
      initializeInputs(activeForm, working);
      restrictForm(activeForm, activeSection, index);
      renderMedia(activeForm);
      const form = activeForm;
      const editTitle = !fresh
        ? `Set up ${singletonKind(kind) ? config.title : kind === "hero" ? "hero slide" : kind === "legal" ? recordTitle(row!) : config.title}`
        : section
          ? `${addItem ? "Add" : "Edit"} ${section.title}`
          : `Edit ${kind === "hero" ? "hero slide" : kind === "process" ? "process step" : config.title}`;
      const opened = editor.open(
        form,
        editTitle,
        row && !singletonKind(kind) ? recordTitle(fresh ?? row) : config.title,
        activeSection?.mode ??
          (kind === "subjects"
            ? "short"
            : kind === "process"
              ? "medium"
              : "large"),
        trigger,
        snapshot,
        () => {
          for (const input of form.querySelectorAll<HTMLInputElement>(
            "input[type=file]",
          ))
            input.value = "";
        },
      );
      if (!opened) return;
      editor.dialog.dataset.editTitle = editTitle;
      editor.baseline = fingerprint(snapshot());
      const indexNav = document.querySelector("#adminEditorIndex")!;
      indexNav.replaceChildren();
      if (editor.dialog.dataset.mode === "large") {
        form
          .querySelectorAll<HTMLElement>(
            "fieldset:not([hidden]),h2:not([hidden])",
          )
          .forEach((group, i) => {
            const label =
              group.querySelector("legend")?.textContent ??
              group.textContent ??
              "";
            group.id ||= `admin-form-group-${i}`;
            const link = node("a", label.slice(0, 70)) as HTMLAnchorElement;
            link.href = `#${group.id}`;
            link.addEventListener("click", (event) => {
              event.preventDefault();
              group.scrollIntoView({ block: "start" });
            });
            indexNav.append(link);
          });
      }
      updateConsequence();
      form.addEventListener("change", updateConsequence);
      form.addEventListener("input", updateConsequence);
      const oldSubmit = form.querySelector<HTMLButtonElement>(
        "button[type=submit]",
      )!;
      const save = action("Save", () => void saveDraft(), "button");
      save.id =
        oldSubmit.dataset.saveSlide !== undefined
          ? "heroSaveAction"
          : "adminSaveAction";
      save.dataset.saveSlide = oldSubmit.dataset.saveSlide ?? "";
      const cancel = action("Cancel", () => void editor.close());
      if (["catalogue", "news", "subjects"].includes(page))
        cancel.id = "cancelEditorBtn";
      else if (kind === "services") cancel.id = "resetService";
      else if (kind === "process") cancel.id = "resetProcess";
      editor.actions.append(cancel, save);
      form.addEventListener("submit", submitOnce);
      form.dataset.v2Bound = "true";
      for (const group of sections[page] ?? []) {
        const add = form.querySelector<HTMLButtonElement>(
          `#${group.addHook}InSetup`,
        );
        if (add && !add.dataset.v2ArrayBound) {
          add.dataset.v2ArrayBound = "true";
          add.addEventListener("click", () => {
            if (editor.pending || activeSection || !group.array) return;
            const current = serialize();
            if (
              (current[group.array] ?? []).length >= (group.limit ?? Infinity)
            ) {
              editor.showErrors(`Maximum ${group.limit} items.`);
              return;
            }
            current[group.array] ??= [];
            current[group.array].push({});
            const oldControls = new Map(
              fields(form).map((f) => [f.name, value(f)]),
            );
            hydrateArray(form, group, current[group.array]);
            friendlyFields(form, current);
            fields(form)
              .filter((f) => f.dataset.recordField)
              .forEach((f) => {
                if (oldControls.has(f.name))
                  initial.set(f, oldControls.get(f.name));
              });
          });
        }
      }
    } finally {
      opening = false;
      trigger?.setAttribute("aria-disabled", String(readError));
    }
  }
  function updateConsequence() {
    if (!activeForm) return;
    const target = document.querySelector("#adminSaveConsequence")!;
    const published = activeForm.elements.namedItem(
      "published",
    ) as HTMLInputElement | null;
    const enabled = activeForm.elements.namedItem(
      "enabled",
    ) as HTMLInputElement | null;
    const text =
      activeKind === "subjects"
        ? "Saves subject names"
        : activeKind === "hero"
          ? enabled?.checked
            ? "Enabled slide changes may affect the published homepage"
            : "Saves a disabled slide"
          : page === "settings"
            ? "Updates site-wide settings"
            : published?.checked
              ? "Saves changes to published content"
              : "Saves a draft";
    if (target.textContent !== text) target.textContent = text;
  }
  function submitOnce(event: Event) {
    event.preventDefault();
    void saveDraft();
  }
  function showAllForValidation() {
    if (activeSection) {
      activeSection = null;
      restrictForm(activeForm!, null, null);
      editor.title.textContent = "Complete page setup";
      editor.dialog.dataset.editTitle = "Complete page setup";
      editor.dialog.dataset.mode = "large";
    }
  }
  async function saveDraft() {
    if (editor.pending || !activeForm) return;
    editor.errors.hidden = true;
    activeForm
      .querySelectorAll<HTMLElement>("[data-v2-error],[data-error-for]")
      .forEach((error) => (error.textContent = ""));
    fields(activeForm).forEach((f) => f.removeAttribute("aria-invalid"));
    const invalid = fields(activeForm).filter(
      (f) => f.type !== "hidden" && f.type !== "file" && !f.checkValidity(),
    );
    if (invalid.length) {
      showAllForValidation();
      editor.showErrors(
        "Review the required fields and their format.",
        invalid,
      );
      return;
    }
    let payload: RecordData;
    try {
      payload = serialize();
    } catch (error) {
      editor.showErrors(
        error instanceof Error ? error.message : "Could not prepare changes.",
      );
      return;
    }
    const validation = validators[activeKind]?.(payload);
    if (validation && !validation.ok) {
      showAllForValidation();
      editor.showErrors(
        validation.error ?? "Review the complete page content.",
      );
      return;
    }
    if (activeKind === "hero") {
      const errors = validateHeroSlideDraft(payload);
      if (Object.keys(errors).length) {
        editor.showErrors(
          Object.values(errors).join(" "),
          Object.keys(errors)
            .map((name) => activeForm!.elements.namedItem(name) as HTMLElement)
            .filter(Boolean),
        );
        return;
      }
    }
    if (page === "catalogue") {
      const classification = parseClassification(payload, undefined, {
        requireExplicit: !!baseline.id,
      });
      if (!classification.ok) {
        editor.showErrors(classification.error);
        return;
      }
    }
    editor.setPending(1);
    editor.status.textContent = "Saving…";
    try {
      if (singletonKind(activeKind)) {
        const before = await request(
          config.endpoint,
          {},
          "Unable to check the latest content.",
        );
        if (!before.ok) {
          editor.showErrors(before.error!);
          return;
        }
        const fresh =
          page === "homepage"
            ? (before.data as RecordData)?.content
            : before.data;
        if (fresh) {
          try {
            checkReadRecords(activeKind, [fresh as RecordData]);
          } catch (error) {
            editor.showErrors(
              error instanceof Error
                ? error.message
                : "Latest saved content unavailable.",
            );
            return;
          }
        }
        if (fingerprint(fresh ?? {}) !== fingerprint(baseline)) {
          latestConflict = cloneRecord((fresh as RecordData) ?? {});
          showConflict();
          return;
        }
      }
      const id = baseline.id;
      const url = writeUrl(
        activeKind,
        singletonKind(activeKind) || activeKind === "legal" ? undefined : id,
      );
      const result = await sendJson<RecordData>(
        url,
        singletonKind(activeKind) || activeKind === "legal" || id
          ? "PUT"
          : "POST",
        payload,
        "Unable to save changes.",
      );
      if (!result.ok) {
        const association =
          activeKind === "hero" ? fieldsForHeroSlideError(result.error!) : [];
        editor.showErrors(
          result.error!,
          association
            .map((name) => activeForm!.elements.namedItem(name) as HTMLElement)
            .filter(Boolean),
        );
        return;
      }
      const returned =
        result.data && typeof result.data === "object" ? result.data : payload;
      const kind = activeKind,
        key = returned.id ?? returned.page ?? baseline.id ?? baseline.page;
      const isNew = !baseline.id && !singletonKind(kind) && kind !== "legal";
      baseline = cloneRecord(returned);
      editor.markClean();
      if (singletonKind(kind)) data[config.source] = [returned];
      else {
        const rows = data[kind] ?? [];
        const at = rows.findIndex((r) => (r.id ?? r.page) === key);
        if (at < 0) rows.push(returned);
        else rows[at] = returned;
        data[kind] = rows;
      }
      render();
      const freshRead = await read(false);
      render();
      status(
        freshRead
          ? "Saved changes."
          : "Saved; latest preview could not be loaded. Retry read.",
        !freshRead,
      );
      const card = collections
        .get(kind)
        ?.grid.querySelector<HTMLElement>(
          `[data-record-key="${CSS.escape(String(key))}"]`,
        );
      const sectionKey = activeSection?.key;
      const targetKey = sectionKey
        ? activeSection?.array
          ? `${sectionKey}-${arrayIndex}`
          : sectionKey
        : "publication";
      const sectionTarget = canvas.querySelector<HTMLElement>(
        `[data-editor-key="${CSS.escape(targetKey)}"]`,
      );
      const focusTarget = singletonKind(kind)
        ? sectionTarget
        : isNew
          ? card?.querySelector<HTMLElement>("h3")
          : card?.querySelector<HTMLElement>("button");
      if (!focusTarget && (!singletonKind(kind) || activeSection?.array)) {
        status(
          "Saved; this item is hidden by current filters. Clear filters to view it.",
        );
      }
      editor.closeNow(
        focusTarget ??
          (editor.trigger?.isConnected ? editor.trigger : pageStatus),
      );
    } finally {
      editor.setPending(-1);
    }
  }
  function showConflict() {
    editor.showErrors(
      "Content changed since you opened this editor. Your working draft is retained.",
    );
    const review = action("Review latest", () => {
      const detail = document.createElement("details");
      detail.open = true;
      detail.append(node("summary", "Latest saved content (read-only)"));
      const pre = node("pre", JSON.stringify(latestConflict, null, 2));
      pre.style.whiteSpace = "pre-wrap";
      detail.append(pre);
      editor.errors.append(detail);
    });
    const reload = action("Reload and discard", async () => {
      if (await editor.discardDecision()) {
        baseline = cloneRecord(latestConflict ?? {});
        initializeInputs(activeForm!, baseline);
        restrictForm(activeForm!, activeSection, arrayIndex);
        editor.markClean();
        editor.errors.hidden = true;
        editor.title.focus();
      }
    });
    editor.errors.append(review, reload);
    editor.status.textContent = "";
  }
  function writeUrl(kind: string, id?: string) {
    const base =
      kind === "hero"
        ? "/api/homepage-hero-slides-admin"
        : kind === "process" || kind === "services"
          ? `/api/services-admin?kind=${kind === "process" ? "process" : "service"}`
          : config.endpoint;
    return id
      ? `${base}${base.includes("?") ? "&" : "?"}id=${encodeURIComponent(id)}`
      : base;
  }
  async function removeRecord(
    kind: string,
    row: RecordData,
    trigger: HTMLButtonElement,
  ) {
    if (readError || !row.id || editor.dialog.open) return;
    if (
      !(await confirmAction(
        `Delete “${recordTitle(row)}”? This removes saved content and may affect published pages.`,
      ))
    )
      return;
    trigger.setAttribute("aria-disabled", "true");
    const result = await request(
      writeUrl(kind, row.id),
      { method: "DELETE" },
      "Unable to delete item.",
    );
    if (result.ok) {
      data[kind] = (data[kind] ?? []).filter((r) => r.id !== row.id);
      render();
      await read(false);
      status("Item deleted.");
      (
        collections.get(kind)?.grid.querySelector<HTMLElement>("button") ??
        pageStatus
      ).focus();
    } else {
      status(result.error!, true);
      trigger.focus();
    }
    trigger.setAttribute("aria-disabled", "false");
  }
  async function removeArray(
    section: Section,
    index: number,
    trigger: HTMLButtonElement,
  ) {
    if (editor.dialog.open || readError) return;
    const parent = singleton();
    if (!parent) return;
    const name = recordTitle(parent[section.array!][index]);
    if (
      !(await confirmAction(
        `Delete “${name}”? Removal is saved to the parent page and may affect published content.`,
      ))
    )
      return;
    trigger.setAttribute("aria-disabled", "true");
    try {
      const latest = await request(config.endpoint);
      if (!latest.ok) {
        status(latest.error!, true);
        return;
      }
      const row =
        page === "homepage" ? (latest.data as RecordData).content : latest.data;
      if (fingerprint(row) !== fingerprint(parent)) {
        status(
          "Content changed. Review the latest page before removing this item.",
          true,
        );
        await read(false);
        return;
      }
      const payload = cloneRecord(parent);
      payload[section.array!].splice(index, 1);
      const valid = validators[page]?.(payload);
      if (valid && !valid.ok) {
        status(valid.error!, true);
        return;
      }
      const result = await sendJson(config.endpoint, "PUT", payload);
      if (!result.ok) {
        status(result.error!, true);
        return;
      }
      await read(false);
      status("Item removed from the saved parent page.");
      pageStatus.focus();
    } finally {
      trigger.setAttribute("aria-disabled", "false");
    }
  }
  function friendlyFields(form: HTMLFormElement, record: RecordData) {
    for (const field of fields(form)) {
      const label = field.closest("label");
      if (
        !label ||
        (field.dataset.recordField && field.dataset.recordField !== "icon")
      )
        continue;
      if (field.name === "slug" && !label.querySelector("[data-url-help]")) {
        label.childNodes.forEach((n) => {
          if (n.nodeType === Node.TEXT_NODE && n.textContent?.includes("Slug"))
            n.textContent = "URL name";
        });
        const hint = node(
          "small",
          "Lowercase letters, numbers and hyphens; changing this can affect existing links.",
        );
        hint.dataset.urlHelp = "true";
        label.append(hint);
        const generate = action("Generate from title", () => {
          if (!baseline.id)
            field.value = String(
              (activeForm?.elements.namedItem("title_en") &&
                value(
                  activeForm.elements.namedItem("title_en") as HTMLInputElement,
                )) ||
                (activeForm?.elements.namedItem("headline_en") &&
                  value(
                    activeForm.elements.namedItem(
                      "headline_en",
                    ) as HTMLInputElement,
                  )) ||
                (activeForm?.elements.namedItem("name_en") &&
                  value(
                    activeForm.elements.namedItem(
                      "name_en",
                    ) as HTMLInputElement,
                  )) ||
                "",
            )
              .normalize("NFKD")
              .replace(/[\u0300-\u036f]/g, "")
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, "-")
              .replace(/^-|-$/g, "");
        });
        generate.dataset.generateUrl = "true";
        label.append(generate);
      }
      if (field.name === "slug")
        label.querySelector<HTMLElement>("[data-generate-url]")!.hidden =
          !!record.id;
      if (
        field.name === "product_code" &&
        !label.querySelector("[data-code-help]")
      ) {
        label.childNodes.forEach((n) => {
          if (n.nodeType === Node.TEXT_NODE)
            n.textContent = "Product code or ISBN";
        });
        const help = node(
          "small",
          "Enter the title’s unique product code (for example LHC-PHYS-F2) or its ISBN",
        );
        help.dataset.codeHelp = "true";
        label.append(help);
      }
      if (field.name === "map_lat" || field.name === "map_lng") {
        field.setAttribute(
          "placeholder",
          field.name === "map_lat" ? "4.0511" : "9.7679",
        );
        if (!label.querySelector("[data-coordinate-help]")) {
          const help = node(
            "small",
            "Use verified coordinates; leave blank if unknown. Examples show decimal format only.",
          );
          help.dataset.coordinateHelp = "true";
          label.append(help);
        }
      }
      if (
        (field.name === "icon" || field.dataset.recordField === "icon") &&
        !label.querySelector("[data-icon-picker]")
      ) {
        const input = field as HTMLInputElement;
        const select = document.createElement("select");
        select.dataset.iconPicker = "true";
        select.setAttribute("aria-label", "Icon");
        select.append(new Option("None", ""));
        for (const key of contentIconKeys)
          select.append(new Option(key[0].toUpperCase() + key.slice(1), key));
        if (input.value && !contentIconKeys.includes(input.value))
          select.append(
            new Option(`Current custom icon: ${input.value}`, input.value),
          );
        select.append(new Option("Custom key…", "__custom"));
        select.value = input.value;
        const sample = node("span");
        sample.dataset.iconSample = "true";
        input.addEventListener(
          "input",
          () => (sample.innerHTML = contentIcon(input.value)),
        );
        sample.innerHTML = contentIcon(input.value);
        label.append(select, sample);
        input.type = "hidden";
        select.addEventListener("change", () => {
          if (select.value === "__custom") {
            input.type = "text";
            input.focus();
          } else {
            input.type = "hidden";
            input.value = select.value;
            sample.innerHTML = contentIcon(input.value);
          }
        });
      }
      if (
        field.name.endsWith("_cta_href") &&
        !label.querySelector("[data-destination-picker]")
      ) {
        const input = field as HTMLInputElement;
        const select = document.createElement("select");
        select.dataset.destinationPicker = "true";
        select.setAttribute("aria-label", "Destination page");
        const routes = [
          ["", "None"],
          ["/", "Homepage"],
          ["/services", "Services"],
          ["/catalogue", "Catalogue"],
          ["/contact", "Contact"],
          ["/about", "About us"],
          ["/why-choose-us", "Why choose us"],
          ["/news", "News"],
          ["/privacy-policy", "Privacy Policy"],
          ["/terms-of-use", "Terms of Use"],
        ];
        for (const [url, name] of routes) select.append(new Option(name, url));
        select.append(new Option("Custom destination", "__custom"));
        select.value = routes.some(([url]) => url === input.value)
          ? input.value
          : "__custom";
        const output = node("small");
        const show = () => {
          output.textContent = `English: ${input.value ? localizeCmsHref(input.value, "en") : "None"} · French: ${input.value ? localizeCmsHref(input.value, "fr") : "None"}`;
        };
        select.addEventListener("change", () => {
          if (select.value !== "__custom") input.value = select.value;
          input.hidden = select.value !== "__custom";
          show();
        });
        input.hidden = select.value !== "__custom";
        input.addEventListener("input", show);
        label.append(select, output);
        show();
      }
    }
    form
      .querySelectorAll<HTMLSelectElement>("[data-icon-picker]")
      .forEach((select) => {
        const input = select
          .closest("label")!
          .querySelector<HTMLInputElement>("input")!;
        if (
          input.value &&
          ![...select.options].some((o) => o.value === input.value)
        )
          select.add(
            new Option(`Current custom icon: ${input.value}`, input.value),
          );
        select.value = input.value;
      });
    form
      .querySelectorAll<HTMLSelectElement>("[data-destination-picker]")
      .forEach((select) => {
        const input = select
          .closest("label")!
          .querySelector<HTMLInputElement>("input")!;
        select.value = [...select.options].some((o) => o.value === input.value)
          ? input.value
          : "__custom";
        input.hidden = select.value !== "__custom";
        input.dispatchEvent(new Event("input"));
      });
    if (activeKind === "legal" && !form.querySelector("[data-legal-working]")) {
      for (const textarea of form.querySelectorAll<HTMLTextAreaElement>(
        "textarea[name^=body_]",
      )) {
        textarea
          .closest("label")!
          .append(
            node(
              "small",
              "Start a heading on a new line with ## followed by a space; separate paragraphs with a blank line.",
            ),
          );
      }
      const details = document.createElement("details");
      details.dataset.legalWorking = "true";
      details.append(node("summary", "Preview legal text (unsaved)"));
      const preview = node("div");
      details.append(preview);
      details.addEventListener("toggle", () => {
        if (!details.open) return;
        preview.replaceChildren();
        for (const lang of ["en", "fr"]) {
          preview.append(node("h3", lang === "en" ? "English" : "Français"));
          const body = (
            form.elements.namedItem(`body_${lang}`) as HTMLTextAreaElement
          ).value;
          for (const section of legalPreviewSections(body)) {
            if (section.title) preview.append(node("h4", section.title));
            section.body.forEach((paragraph) =>
              preview.append(node("p", paragraph)),
            );
          }
        }
      });
      form.append(details);
    }
  }
  function mediaBindings(form: HTMLFormElement) {
    if (
      form.getAttribute("id") === "serviceForm" &&
      !form.dataset.v2ServiceImageBound
    ) {
      form.dataset.v2ServiceImageBound = "true";
      form.addEventListener("change", (event) => {
        const target = event.target as HTMLInputElement | HTMLSelectElement;
        if (["slug", "category"].includes(target.name)) renderMedia(form);
      });
    }
    const bindings: {
      id: HTMLInputElement;
      file: HTMLInputElement;
      preview: HTMLImageElement | null;
      status: HTMLElement;
      clear: HTMLElement | null;
    }[] = [];
    if (form.querySelector("#coverFile"))
      bindings.push({
        id: form.elements.namedItem("cover_image_id") as HTMLInputElement,
        file: form.querySelector("#coverFile")!,
        preview: form.querySelector("#coverPreview"),
        status: form.querySelector("#coverStatus")!,
        clear: form.querySelector("#coverClear"),
      });
    if (form.querySelector("[data-slide-file]"))
      bindings.push({
        id: form.elements.namedItem("image_id") as HTMLInputElement,
        file: form.querySelector("[data-slide-file]")!,
        preview: form.querySelector("[data-slide-image]"),
        status: form.querySelector("[data-image-status]")!,
        clear: form.querySelector("[data-remove-image]"),
      });
    if (form.querySelector("#newsImageFile"))
      bindings.push({
        id: form.elements.namedItem("hero_image_id") as HTMLInputElement,
        file: form.querySelector("#newsImageFile")!,
        preview: form.querySelector("#newsImagePreview"),
        status: form.querySelector("#newsImageStatus")!,
        clear: form.querySelector("#newsImageClear"),
      });
    if (form.querySelector("#ogImageFile"))
      bindings.push({
        id: form.elements.namedItem("og_image_id") as HTMLInputElement,
        file: form.querySelector("#ogImageFile")!,
        preview: form.querySelector("#ogImagePreview"),
        status: form.querySelector("#ogImageStatus")!,
        clear: form.querySelector("#ogImageClear"),
      });
    form.querySelectorAll<HTMLElement>("[data-media]").forEach((host) =>
      bindings.push({
        id: form.elements.namedItem(host.dataset.media!) as HTMLInputElement,
        file: host.querySelector("[data-file]")!,
        preview: host.querySelector("[data-preview]"),
        status: host.querySelector("[data-media-status]")!,
        clear: host.querySelector("[data-clear-media]"),
      }),
    );
    for (const binding of bindings) {
      const { id, file, preview, status: mediaStatus, clear } = binding;
      mediaStatus.textContent = "";
      if (file.dataset.v2UploadBound) continue;
      file.dataset.v2UploadBound = "true";
      file.addEventListener("change", async () => {
        if (editor.pending) {
          file.value = "";
          return;
        }
        const selected = file.files?.[0];
        if (!selected) return;
        const error = coverFileError(selected);
        if (error) {
          mediaStatus.textContent = error;
          file.value = "";
          return;
        }
        editor.setPending(1);
        mediaStatus.textContent = "Uploading…";
        try {
          const result = await uploadMedia(selected);
          if (!result.ok || !result.data?.id) {
            mediaStatus.textContent = result.error ?? "Unable to upload image.";
            return;
          }
          id.value = result.data.id;
          renderMedia(form);
          mediaStatus.textContent =
            "Image attached. Save to update this content.";
        } finally {
          editor.setPending(-1);
          file.value = "";
        }
      });
      clear?.addEventListener("click", () => {
        if (editor.pending) return;
        id.value = "";
        renderMedia(form);
        mediaStatus.textContent = "Image removed from working draft.";
      });
      preview?.addEventListener("error", () => {
        mediaStatus.textContent =
          "Image unavailable. The saved ID is retained.";
      });
    }
  }
  function renderMedia(form: HTMLFormElement) {
    for (const input of fields(form).filter((f) =>
      /^(cover_image_id|hero_image_id|image_id|og_image_id|who_we_are_image_id)$/.test(
        f.name,
      ),
    )) {
      const name = input.name;
      const image =
        name === "cover_image_id"
          ? form.querySelector<HTMLImageElement>("#coverPreview")
          : name === "image_id" && activeKind === "hero"
            ? form.querySelector<HTMLImageElement>("[data-slide-image]")
            : name === "og_image_id"
              ? form.querySelector<HTMLImageElement>("#ogImagePreview")
              : name === "hero_image_id" && activeKind === "news"
                ? form.querySelector<HTMLImageElement>("#newsImagePreview")
                : input
                    .closest(".media-field")
                    ?.querySelector<HTMLImageElement>("[data-preview]");
      if (image) {
        const serviceSource =
          name === "image_id" && activeKind === "services"
            ? serviceImageSource({
                ...baseline,
                slug: (form.elements.namedItem("slug") as HTMLInputElement)
                  ?.value,
                category: (
                  form.elements.namedItem("category") as HTMLSelectElement
                )?.value,
                image_id: input.value,
              })
            : null;
        image.hidden = !input.value && !serviceSource;
        if (serviceSource) image.src = serviceSource;
        else if (input.value)
          image.src = `/api/media/${input.value.split("/").map(encodeURIComponent).join("/")}`;
        else image.removeAttribute("src");
      }
      if (name === "hero_image_id" && activeKind === "news") {
        form.querySelector<HTMLElement>("#newsImageEmpty")!.hidden =
          !!input.value;
        form.querySelector<HTMLElement>("#newsImageClear")!.hidden =
          !input.value;
      }
      if (name === "cover_image_id") {
        const empty = form.querySelector<HTMLElement>("#coverEmpty")!;
        empty.hidden = !!input.value;
        form.querySelector<HTMLElement>("#coverClear")!.hidden = !input.value;
        form.querySelector<HTMLElement>("#coverFileLabel")!.textContent =
          input.value ? "Replace cover image" : "Choose cover image";
      }
      if (name === "image_id" && activeKind === "hero")
        form.querySelector<HTMLElement>("[data-slide-image-empty]")!.hidden =
          !!input.value;
    }
  }
  function makeCollection(kind: string, host: HTMLElement) {
    const collection = new PreviewCollection(
      host,
      kind,
      (row, button) => void openEdit(kind, row, button),
      kind === "legal"
        ? null
        : (row, button) => void removeRecord(kind, row, button),
      () => ({ subjects, homeIds }),
    );
    collections.set(kind, collection);
    if (["catalogue", "news", "services", "process", "legal"].includes(kind))
      collection.addFilter("published", "Publication", [
        ["published", "Published"],
        ["draft", "Draft"],
        ...(kind === "legal" ? [["unset", "Not set up"]] : []),
      ]);
    if (kind === "hero")
      collection.addFilter("enabled", "Slide state", [
        ["true", "Enabled"],
        ["false", "Disabled"],
      ]);
    if (kind === "catalogue") {
      collection.addFilter("level", "Education level", [
        ["primary", "Primary"],
        ["secondary", "Secondary"],
      ]);
      collection.addFilter("classification", "Classification", [
        ["unclassified", "Unclassified"],
        ["other_developed", "Other developed"],
        ["national_book_list_verified", "National Book List · verified"],
      ]);
      collection.addFilter(
        "subject_id",
        "Subject",
        subjects.map((s) => [s.id, `${s.name_en} / ${s.name_fr}`]),
      );
    }
    if (kind === "news")
      collection.addFilter("category", "Category", [
        ["company_news", "Company news"],
        ["new_titles", "New titles"],
        ["partnerships", "Partnerships"],
        ["events", "Events"],
      ]);
    if (kind === "services")
      collection.addFilter("category", "Category", [
        ["editorial", "Editorial"],
        ["creative", "Creative"],
        ["production", "Production"],
      ]);
    if (kind === "subjects")
      collection.addFilter("assigned", "Assigned titles", [
        ["with", "With titles"],
        ["without", "Without titles"],
      ]);
    return collection;
  }
  function render() {
    if (!loaded) return;
    if (config.singleton) {
      renderSingleton();
      if (page === "homepage") {
        const c = collections.get("hero");
        if (c) {
          c.language = language;
          c.setRows(data.hero ?? [], !readError);
        }
        updateHeroCap();
      }
    } else if (page === "services") {
      for (const kind of ["services", "process"]) {
        const c = collections.get(kind)!;
        c.language = language;
        c.setRows(data[kind] ?? [], !readError);
      }
    } else {
      const c = collections.get(page)!;
      c.language = language;
      const rows =
        page === "legal"
          ? ["privacy_policy", "terms_of_use"].map(
              (key) =>
                (data.legal ?? []).find((r) => r.page === key) ?? { page: key },
            )
          : (data[page] ?? []);
      c.setRows(rows, !readError);
    }
  }
  function buildCollectionCanvas() {
    if (config.singleton) {
      if (page === "homepage") {
        const hero = node("section");
        hero.id = "hero-slides";
        const header = node("header", "", "toolbar");
        const heading = node("h2", "Hero carousel slides");
        heading.id = "heroSlidesTitle";
        heading.tabIndex = -1;
        hero.setAttribute("aria-labelledby", heading.id);
        header.append(heading);
        const add = action(
          "Add slide",
          (b) => {
            if (heroSlotState(data.hero ?? []).canAdd)
              void openEdit("hero", null, b);
          },
          "button",
        );
        add.id = "addSlide";
        add.setAttribute("aria-describedby", "heroSlideLimit");
        const order = action("Manage order", (b) => void openOrder("hero", b));
        const limit = node("p", "Loading slides…");
        limit.id = "heroSlideLimit";
        header.append(add, order);
        hero.append(header, limit);
        savedCanvas.append(hero);
        const collection = makeCollection("hero", hero);
        collection.grid.id = "heroSlides";
        const heroStatus = node("p");
        heroStatus.id = "heroSlidesStatus";
        heroStatus.setAttribute("role", "status");
        hero.append(heroStatus);
      }
      savedCanvas.append(node("div", "", "admin-singleton-sections"));
      return;
    }
    if (page === "services") {
      for (const kind of ["services", "process"]) {
        const host = node("section");
        const header = node("header", "", "toolbar");
        header.append(
          node("h2", kind === "services" ? "Services" : "Process steps"),
          action(
            kind === "services" ? "Add service" : "Add process step",
            (b) => void openEdit(kind, null, b),
            "button",
          ),
          action("Manage order", (b) => void openOrder(kind, b)),
        );
        host.append(header);
        savedCanvas.append(host);
        const c = makeCollection(kind, host);
        c.grid.id = kind;
      }
      return;
    }
    const c = makeCollection(page, savedCanvas);
    c.grid.id = "items";
    document
      .querySelector("#openEditorBtn")
      ?.addEventListener(
        "click",
        (event) =>
          void openEdit(page, null, event.currentTarget as HTMLElement),
      );
  }
  function updateHeroCap() {
    const rows = data.hero ?? [],
      add = document.querySelector("#addSlide"),
      limit = document.querySelector("#heroSlideLimit");
    add?.setAttribute(
      "aria-disabled",
      String(readError || !heroSlotState(rows).canAdd),
    );
    if (limit)
      limit.textContent = `${rows.length} of 5 saved · ${countLabel(rows.filter((r) => r.enabled).length, "enabled slide")} · ${countLabel(rows.filter((r) => !r.enabled).length, "disabled slide")}. ${rows.length >= 5 ? "Delete a slide to add another." : "Disabled slides still occupy a saved slot."}`;
  }
  function renderSingleton() {
    const host = savedCanvas.querySelector<HTMLElement>(
        ".admin-singleton-sections",
      )!,
      record = singleton();
    host.replaceChildren();
    const strip = node("div", "", "admin-publication-strip");
    strip.append(
      node(
        "strong",
        record
          ? page === "settings"
            ? "Configured"
            : record.published
              ? "Published"
              : "Draft"
          : "Not set up",
      ),
    );
    if (record?.updated_at && Number.isFinite(Date.parse(record.updated_at)))
      strip.append(
        node(
          "small",
          `Last saved: ${new Date(record.updated_at).toLocaleString("en-GB")} (browser local time)`,
        ),
      );
    if (!record) {
      strip.append(
        action("Set up page", (b) => void openEdit(page, null, b), "button"),
      );
      host.append(strip);
      return;
    }
    if (page !== "settings") {
      const publication = action(
        "Change publication",
        (b) =>
          void openEdit(page, record, b, {
            key: "publication",
            title: "publication",
            fields: ["published"],
            mode: "short",
          }),
      );
      publication.dataset.editorKey = "publication";
      strip.append(publication);
    }
    const publicLink = node(
      "a",
      "Open public page",
      "button secondary",
    ) as HTMLAnchorElement;
    publicLink.href = localizeCmsHref(
      config.publicRoute,
      language as "en" | "fr",
    );
    publicLink.target = "_blank";
    publicLink.rel = "noopener noreferrer";
    strip.append(
      publicLink,
      node(
        "small",
        "Shows published content; saved summaries do not verify deployment.",
      ),
    );
    host.append(strip);
    let identityGrid: HTMLElement | null = null;
    if (page === "about") {
      identityGrid = node("div", "", "admin-section-grid");
    }
    for (const section of sections[page]) {
      const stamp = fingerprint({
        values: section.fields.map((field) => record[field]),
        language,
        readError,
        query: arraySearch.get(section.key) ?? "",
        extra:
          section.key === "fallback"
            ? data.hero?.map((r) => [r.id, r.enabled])
            : section.key === "featured"
              ? catalogue
              : null,
      });
      const cached = sectionCache.get(section.key);
      if (cached?.stamp === stamp) {
        if (
          page === "about" &&
          ["purpose", "vision", "mission", "values"].includes(section.key)
        ) {
          identityGrid!.append(cached.el);
          if (section.key === "values") host.append(identityGrid!);
        } else host.append(cached.el);
        continue;
      }
      if (section.array) {
        const card = node("section", "", "admin-section-card");
        const head = node("header");
        const rows = record[section.array] ?? [];
        head.append(node("h2", `${section.title} · ${rows.length}`));
        const add = action(
          `Add ${section.key === "team" ? "block" : section.key === "commitments" ? "commitment" : section.key === "trust" ? "statement" : section.key === "projects" ? "option" : "link"}`,
          (b) => void openEdit(page, record, b, section, null, true),
          "button",
        );
        if (section.addHook) add.id = section.addHook;
        add.setAttribute(
          "aria-disabled",
          String(readError || rows.length >= section.limit!),
        );
        head.append(add);
        card.append(head);
        const toolbar = node("div", "", "admin-preview-toolbar");
        const search = document.createElement("input");
        search.type = "search";
        search.value = arraySearch.get(section.key) ?? "";
        const label = node("label");
        label.append(
          node("span", `Search ${section.title.toLowerCase()}`),
          search,
        );
        toolbar.append(label);
        const itemCount = node("p", "", "admin-count");
        itemCount.setAttribute("role", "status");
        itemCount.setAttribute("aria-live", "polite");
        toolbar.append(
          action("Clear filters", () => {
            search.value = "";
            arraySearch.delete(section.key);
            draw();
            search.focus();
          }),
        );
        card.append(toolbar, itemCount);
        const list = node("ul", "", "admin-card-grid");
        card.append(list);
        const draw = () => {
          list.replaceChildren();
          rows.forEach((item: RecordData, index: number) => {
            const text = fingerprint(item).toLowerCase();
            if (search.value && !text.includes(search.value.toLowerCase()))
              return;
            const li = node("li"),
              article = node("article", "", "admin-preview-card"),
              copy = node("div", "", "admin-card-copy");
            const icon = node("span");
            icon.innerHTML = contentIcon(item.icon ?? "layout");
            const title =
              item[`title_${language}`] ||
              item[`label_${language}`] ||
              item.platform ||
              (item.title
                ? `${item.title} (legacy title fallback)`
                : `${language === "fr" ? "French" : "English"} copy missing`);
            copy.append(icon, node("h3", String(title)));
            if (section.key === "commitments") {
              const eyebrow = item[`eyebrow_${language}`],
                lead = item[`title_lead_${language}`],
                accent = item[`title_accent_${language}`];
              if (eyebrow) copy.append(node("small", String(eyebrow)));
              if (lead || accent) {
                const heading = node("p", String(lead ?? ""));
                const emphasized = node("strong", String(accent ?? ""));
                emphasized.style.color = "var(--admin-accent)";
                heading.append(document.createTextNode(" "), emphasized);
                copy.append(heading);
              }
            }
            if (item.description_en || item.description_fr)
              excerpt(copy, translated(item, "description", language));
            if (item.value) copy.append(node("p", item.value));
            if (item.url) copy.append(node("p", item.url));
            const tags = item[`tags_${language}`] ?? [];
            const group = node("div", "", "admin-status-group");
            tags
              .slice(0, 3)
              .forEach((tag: string) =>
                group.append(node("span", tag, "admin-badge")),
              );
            if (tags.length > 3)
              group.append(node("small", `+${tags.length - 3} more`));
            copy.append(group);
            const footer = node("footer", "", "admin-card-footer");
            const edit = action(
              "Edit",
              (b) => void openEdit(page, record, b, section, index),
            );
            edit.dataset.editorKey = `${section.key}-${index}`;
            edit.setAttribute("aria-label", `Edit ${title}`);
            edit.setAttribute("aria-disabled", String(readError));
            footer.append(
              edit,
              moreActions(
                String(title),
                (b) => void removeArray(section, index, b),
              ),
            );
            article.append(copy, footer);
            li.append(article);
            list.append(li);
          });
          itemCount.textContent = `Showing ${list.children.length} of ${rows.length}`;
          if (!list.children.length)
            list.append(
              node("li", rows.length ? "No matching items" : "No saved items"),
            );
        };
        let timer: ReturnType<typeof setTimeout>;
        search.addEventListener("input", () => {
          arraySearch.set(section.key, search.value);
          clearTimeout(timer);
          timer = setTimeout(draw, 250);
        });
        draw();
        sectionCache.set(section.key, { el: card, stamp });
        host.append(card);
        continue;
      }
      const card = node("section", "", "admin-section-card");
      card.id = `preview-${section.key}`;
      const head = node("header");
      const edit = action(
        `Edit ${section.title.toLowerCase()}`,
        (b) => void openEdit(page, record, b, section),
      );
      edit.dataset.editorKey = section.key;
      edit.setAttribute("aria-disabled", String(readError));
      head.append(node("h2", section.title), edit);
      card.append(head);
      if (section.key === "settings") {
        card.append(
          node(
            "p",
            `Autoplay ${record.hero_autoplay_enabled ? "On" : "Off"} · ${String(Number((Number(record.hero_autoplay_interval) / 1000).toFixed(3)))} seconds`,
          ),
        );
      } else if (section.key === "fallback") {
        card.append(
          node("p", "Used when no carousel slides are saved"),
          node(
            "strong",
            (data.hero ?? []).length
              ? "Not currently used"
              : "Fallback configured",
          ),
        );
        if ((data.hero ?? []).length && !data.hero?.some((r) => r.enabled))
          card.append(
            node(
              "p",
              "Attention: no enabled slides. Fallback does not activate while saved slides exist.",
            ),
          );
        excerpt(card, translated(record, "hero_headline", language));
        card.append(
          node(
            "small",
            record.hero_image_id
              ? "Stored image added"
              : "No stored image added",
          ),
        );
      } else if (section.key === "featured") {
        const ids = record.featured_catalogue_ids ?? [];
        if (!ids.length) card.append(node("p", "No featured titles selected"));
        const list = node("ul", "", "admin-card-grid");
        for (const id of ids) {
          const title = catalogue.find((r) => r.id === id);
          const li = node("li"),
            article = node("article", "", "admin-preview-card");
          article.append(
            thumbnail(
              title?.cover_image_id,
              title
                ? recordTitle(title, language)
                : "Selected title unavailable",
              true,
            ),
            node(
              "div",
              title
                ? recordTitle(title, language)
                : "Selected title unavailable",
              "admin-card-copy",
            ),
          );
          if (title) {
            const badges = node("div", "", "admin-status-group");
            catalogueBadges(title).labels.forEach((label) =>
              badges.append(statusBadge(label)),
            );
            const copy = article.querySelector(".admin-card-copy")!;
            copy.append(badges, node("small", "Selected on homepage"));
          }
          li.append(article);
          list.append(li);
        }
        card.append(list);
      } else {
        for (const key of section.fields) {
          if (key.endsWith("_en") || key.endsWith("_fr")) {
            if (!key.endsWith(`_${language}`)) continue;
            excerpt(
              card,
              String(record[key] ?? "").trim() ||
                `${language === "fr" ? "French" : "English"} copy missing`,
            );
          } else if (key.endsWith("image_id")) {
            const media = thumbnail(record[key], section.title);
            if (key === "og_image_id") media.style.aspectRatio = "1.91";
            card.append(media);
          } else {
            const line = node("p");
            line.append(
              node("strong", `${key.replaceAll("_", " ")}: `),
              document.createTextNode(
                record[key] === null ||
                  record[key] === undefined ||
                  record[key] === ""
                  ? key.startsWith("map_")
                    ? "Coordinates not set"
                    : "Not set"
                  : String(record[key]),
              ),
            );
            card.append(line);
          }
        }
      }
      if (page === "contact" && section.key === "location") {
        const link = node(
          "a",
          "Office address, email and phone — Site settings",
          "button secondary admin-reference-link",
        ) as HTMLAnchorElement;
        link.href = "/admin/site-settings/";
        card.append(link);
      }
      sectionCache.set(section.key, { el: card, stamp });
      if (
        page === "about" &&
        ["purpose", "vision", "mission", "values"].includes(section.key)
      ) {
        identityGrid!.append(card);
      } else host.append(card);
      if (page === "about" && section.key === "values")
        host.append(identityGrid!);
    }
  }
  async function read(renderAfter = true) {
    if (reading) return false;
    reading = true;
    canvas.setAttribute("aria-busy", "true");
    try {
      const result = await request(
        config.endpoint,
        {},
        "Unable to load saved content.",
      );
      if (!result.ok) throw new Error(result.error!);
      const adapted = adaptDashboard(config.source, result.data);
      for (const [kind, rows] of Object.entries(adapted))
        checkReadRecords(kind, rows);
      Object.assign(data, adapted);
      if (page === "homepage") {
        const [hero, titles] = await Promise.all([
          request("/api/homepage-hero-slides-admin"),
          request("/api/catalogue-admin"),
        ]);
        if (!hero.ok || !titles.ok)
          throw new Error(
            hero.error ?? titles.error ?? "Unable to load homepage previews.",
          );
        const heroData = adaptDashboard("hero", hero.data);
        checkReadRecords("hero", heroData.hero);
        Object.assign(data, heroData);
        catalogue = adaptDashboard("catalogue", titles.data).catalogue;
        checkReadRecords("catalogue", catalogue);
      }
      if (page === "catalogue") {
        const [subjectResult, homeResult] = await Promise.all([
          request("/api/subjects-admin"),
          request("/api/homepage-admin"),
        ]);
        if (subjectResult.ok)
          subjects = adaptDashboard("subjects", subjectResult.data).subjects;
        else subjects = [];
        const homeContent =
          homeResult.ok && (homeResult.data as RecordData)?.content;
        homeIds =
          homeContent === null
            ? []
            : homeContent && Array.isArray(homeContent.featured_catalogue_ids)
              ? homeContent.featured_catalogue_ids
              : null;
      }
      if (!loaded) {
        loaded = true;
        buildCollectionCanvas();
      }
      readError = false;
      if (renderAfter) render();
      return true;
    } catch (error) {
      readError = true;
      status(
        error instanceof Error ? error.message : "Saved content unavailable.",
        true,
      );
      pageStatus.append(action("Retry read", () => void read()));
      if (loaded) render();
      return false;
    } finally {
      reading = false;
      canvas.setAttribute("aria-busy", "false");
    }
  }
  async function openOrder(kind: string, trigger: HTMLButtonElement) {
    if (editor.dialog.open || readError) return;
    if (!(await read(false))) return;
    const rows = cloneRecord(data[kind] ?? []);
    if (!rows.length) return;
    const form = document.createElement("form");
    form.id = "adminOrderForm";
    editor.body.append(form);
    let scratch = rows.map((r) => String(r.id));
    const original = [...scratch];
    const renderOrder = (focusId?: string, direction?: number) => {
      form.replaceChildren();
      for (const [index, id] of scratch.entries()) {
        const row = rows.find((r) => r.id === id)!;
        const item = node("div", "", "admin-order-row");
        if (kind === "hero" && row.image_id) {
          const img = document.createElement("img");
          img.src = `/api/media/${row.image_id}`;
          img.alt = `${recordTitle(row)} — image preview`;
          img.width = 80;
          img.height = 45;
          item.append(img);
        }
        item.append(node("span", `${index + 1}. ${recordTitle(row)}`));
        for (const [label, delta] of [
          ["Move up", -1],
          ["Move down", 1],
        ] as const) {
          const b = action(label, () => {
            const next = index + delta;
            if (next < 0 || next >= scratch.length) return;
            [scratch[index], scratch[next]] = [scratch[next], scratch[index]];
            renderOrder(id, delta);
          });
          b.dataset.orderId = id;
          b.dataset.direction = String(delta);
          b.setAttribute("aria-label", `${label} ${recordTitle(row)}`);
          b.setAttribute(
            "aria-disabled",
            String(index + delta < 0 || index + delta >= scratch.length),
          );
          item.append(b);
        }
        form.append(item);
      }
      if (focusId)
        form
          .querySelector<HTMLElement>(
            `[data-order-id="${CSS.escape(focusId)}"][data-direction="${direction}"]`,
          )
          ?.focus();
    };
    renderOrder();
    editor.open(
      form,
      "Manage order",
      `All ${rows.length} saved items, including disabled and drafts`,
      "medium",
      trigger,
      () => scratch,
      () => form.remove(),
    );
    editor.dialog.dataset.editTitle = "Manage order";
    document.querySelector("#adminEditorIndex")!.replaceChildren();
    document.querySelector("#adminSaveConsequence")!.textContent =
      "Saves the order of the entire saved collection.";
    editor.actions.append(
      action("Cancel", () => void editor.close()),
      action(
        "Save order",
        async () => {
          if (editor.pending) return;
          editor.setPending(1);
          try {
            const result = await sendJson(
              writeUrl(kind),
              "PUT",
              { action: "reorder", ids: scratch },
              "Unable to save order.",
            );
            if (!result.ok) {
              editor.showErrors(result.error!);
              return;
            }
            data[kind] = scratch.map((id, index) => ({
              ...rows.find((r) => r.id === id),
              [kind === "process" ? "step_number" : "sort_order"]:
                kind === "process" ? index + 1 : index,
            }));
            editor.markClean();
            render();
            const ok = await read();
            status(
              ok
                ? "Order saved."
                : "Saved; latest preview could not be loaded.",
            );
            editor.closeNow(trigger);
          } finally {
            editor.setPending(-1);
          }
        },
        "button",
      ),
    );
  }
  const focusFragment = () => {
    if (editor.dialog.open) return;
    const target =
      location.hash === "#editor"
        ? document.querySelector<HTMLElement>("#openEditorBtn")
        : location.hash === "#hero-slides"
          ? document.querySelector<HTMLElement>("#heroSlidesTitle")
          : null;
    if (target) {
      target.focus();
      target.scrollIntoView({ block: "start" });
    }
  };
  window.addEventListener("hashchange", focusFragment);
  status("Loading saved content…");
  await read();
  await mountPageImages(page, editor, canvas);
  if (!readError) {
    status("Saved content loaded.");
    focusFragment();
  }
}
