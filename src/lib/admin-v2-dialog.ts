import { registerDirtyCheck } from "./admin-client";
import {
  fingerprint,
  operationFieldLock,
  type OperationField,
} from "./admin-v2-model";
export class AdminEditor {
  dialog = document.querySelector<HTMLDialogElement>("#adminEditorDialog")!;
  body = document.querySelector<HTMLElement>("#adminEditorBody")!;
  footer = document.querySelector<HTMLElement>("#adminEditorFooter")!;
  title = document.querySelector<HTMLElement>("#adminEditorTitle")!;
  status = document.querySelector<HTMLElement>("#adminEditorStatus")!;
  errors = document.querySelector<HTMLElement>("#adminEditorErrors")!;
  actions = document.querySelector<HTMLElement>("#adminEditorActions")!;
  decision = document.querySelector<HTMLElement>("#adminDiscardDecision")!;
  trigger: HTMLElement | null = null;
  form: HTMLFormElement | null = null;
  pending = 0;
  baseline = "";
  snapshot: () => unknown = () => null;
  cleanup: () => void = () => {};
  private decisionResolve: ((value: boolean) => void) | null = null;
  private previousFocus: HTMLElement | null = null;
  private scroll = 0;
  private overflow = "";
  private errorIndex = 0;
  private fieldLock: ReturnType<typeof operationFieldLock> | null = null;
  constructor() {
    document
      .querySelector("#adminEditorClose,#closeEditorBtn")!
      .addEventListener("click", () => void this.close());
    this.dialog.addEventListener("cancel", (event) => {
      event.preventDefault();
      void this.close();
    });
    document
      .querySelector("#adminKeepEditing")!
      .addEventListener("click", () => this.finishDecision(false));
    document
      .querySelector("#adminDiscardChanges")!
      .addEventListener("click", () => this.finishDecision(true));
    registerDirtyCheck(
      () => this.dialog.open && (this.pending > 0 || this.isDirty()),
    );
    document.addEventListener("admin:confirm", (event) => {
      const detail = (event as CustomEvent).detail;
      if (this.dialog.open) {
        detail.promise = this.discardDecision();
      }
    });
    this.dialog.addEventListener("admin:busy-attempt", () =>
      this.waitMessage(),
    );
    this.body.addEventListener(
      "click",
      (event) => {
        if (
          this.pending &&
          (event.target as Element).closest(
            "form button,form input[type=checkbox],form input[type=radio],form input[type=file],[role=button]",
          )
        ) {
          event.preventDefault();
          event.stopImmediatePropagation();
          this.waitMessage();
        }
      },
      true,
    );
    this.body.addEventListener(
      "beforeinput",
      (event) => {
        if (this.pending && (event.target as Element).closest("form"))
          event.preventDefault();
      },
      true,
    );
    this.body.addEventListener(
      "change",
      (event) => {
        if (this.pending && this.form?.contains(event.target as Node)) {
          this.fieldLock?.rollback(event.target as unknown as OperationField);
          event.stopImmediatePropagation();
          this.waitMessage();
        }
      },
      true,
    );
    const viewport = window.visualViewport;
    const resize = () => {
      if (!this.dialog.open) return;
      this.dialog.style.setProperty(
        "--editor-available-height",
        `${viewport?.height ?? innerHeight}px`,
      );
      this.dialog.style.setProperty(
        "--editor-top",
        `${viewport?.offsetTop ?? 0}px`,
      );
    };
    viewport?.addEventListener("resize", resize);
    viewport?.addEventListener("scroll", resize);
    this.dialog.addEventListener("admin:opened", resize);
  }
  isDirty() {
    return fingerprint(this.snapshot()) !== this.baseline;
  }
  markClean() {
    this.baseline = fingerprint(this.snapshot());
  }
  open(
    form: HTMLFormElement,
    title: string,
    context: string,
    mode: "short" | "medium" | "large",
    trigger: HTMLElement | null,
    snapshot: () => unknown,
    cleanup: () => void,
  ) {
    if (this.dialog.open) return false;
    document.dispatchEvent(new CustomEvent("admin:close-navigation"));
    this.form = form;
    this.trigger = trigger;
    this.snapshot = snapshot;
    this.cleanup = cleanup;
    this.title.textContent = title;
    const contextElement =
      document.querySelector("#editorTitle") ??
      document.querySelector("#adminEditorContext")!;
    contextElement.textContent = context;
    this.dialog.dataset.mode = mode;
    this.status.textContent = "";
    this.errors.hidden = true;
    this.actions.replaceChildren();
    this.dialog
      .querySelectorAll<HTMLFormElement>("form")
      .forEach((f) => (f.hidden = f !== form));
    form.hidden = false;
    this.overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    this.markClean();
    this.dialog.showModal();
    this.body.scrollTop = 0;
    this.dialog.dispatchEvent(new CustomEvent("admin:opened"));
    if (mode === "short")
      [
        ...form.querySelectorAll<HTMLElement>(
          "input:not([type=hidden]),select,textarea",
        ),
      ]
        .find((field) => field.getBoundingClientRect().height > 0)
        ?.focus();
    else this.title.focus();
    return true;
  }
  private waitMessage() {
    if (this.status.textContent !== "Wait for this operation to finish.")
      this.status.textContent = "Wait for this operation to finish.";
  }
  setPending(delta: number) {
    const wasPending = this.pending;
    this.pending = Math.max(0, this.pending + delta);
    if (!wasPending && this.pending && this.form)
      this.fieldLock = operationFieldLock([
        ...this.form.querySelectorAll<
          HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
        >("input,textarea,select"),
      ]);
    if (wasPending && !this.pending) {
      this.fieldLock?.release();
      this.fieldLock = null;
    }
    this.dialog.setAttribute("aria-busy", String(this.pending > 0));
    for (const button of this.actions.querySelectorAll("button"))
      button.setAttribute("aria-disabled", String(this.pending > 0));
  }
  async close() {
    if (this.decisionResolve) {
      this.finishDecision(false);
      return;
    }
    if (this.pending) {
      if (this.status.textContent !== "Wait for this operation to finish.")
        this.status.textContent = "Wait for this operation to finish.";
      return;
    }
    if (this.isDirty() && !(await this.discardDecision())) return;
    this.closeNow();
  }
  closeNow(target?: HTMLElement | null) {
    this.cleanup();
    this.dialog.close();
    this.form!.hidden = true;
    this.actions.replaceChildren();
    document.body.style.overflow = this.overflow;
    (target ?? this.trigger)?.isConnected && (target ?? this.trigger)!.focus();
    this.form = null;
  }
  discardDecision(): Promise<boolean> {
    if (this.pending) {
      this.status.textContent = "Wait for this operation to finish.";
      return Promise.resolve(false);
    }
    if (this.decisionResolve) return Promise.resolve(false);
    this.previousFocus = document.activeElement as HTMLElement;
    this.scroll = this.body.scrollTop;
    this.body.hidden = true;
    this.footer.hidden = true;
    document.querySelector<HTMLElement>("#adminEditorIndex")!.hidden = true;
    this.decision.hidden = false;
    this.title.textContent = "Discard unsaved changes?";
    document.querySelector<HTMLElement>("#adminKeepEditing")!.focus();
    return new Promise((resolve) => (this.decisionResolve = resolve));
  }
  private finishDecision(value: boolean) {
    const resolve = this.decisionResolve;
    if (!resolve) return;
    this.decisionResolve = null;
    this.decision.hidden = true;
    this.body.hidden = false;
    this.footer.hidden = false;
    document.querySelector<HTMLElement>("#adminEditorIndex")!.hidden = false;
    this.title.textContent = this.dialog.dataset.editTitle ?? "Edit content";
    this.body.scrollTop = this.scroll;
    this.previousFocus?.isConnected && this.previousFocus.focus();
    resolve(value);
  }
  showErrors(message: string, fields: HTMLElement[] = []) {
    this.errors.replaceChildren();
    this.errors.hidden = false;
    this.errors.setAttribute("role", "alert");
    const heading = document.createElement("h3");
    heading.textContent = "Could not save changes";
    const copy = document.createElement("p");
    copy.textContent = message;
    this.errors.append(heading, copy);
    for (const original of fields) {
      const field =
        original instanceof HTMLInputElement &&
        (original.type === "hidden" || original.hidden)
          ? (original
              .closest("label")
              ?.querySelector<HTMLElement>(
                "[data-destination-picker],[data-icon-picker]",
              ) ??
            original
              .closest("fieldset")
              ?.querySelector<HTMLElement>("input[type=file]") ??
            original)
          : original;
      field.id ||= `admin-v2-error-field-${++this.errorIndex}`;
      field.setAttribute("aria-invalid", "true");
      const key = (original as HTMLInputElement).name;
      let inline =
        this.form?.querySelector<HTMLElement>(`[data-error-for="${key}"]`) ??
        field.closest("label")?.querySelector<HTMLElement>("[data-v2-error]");
      if (!inline) {
        inline = document.createElement("small");
        inline.className = "field-error";
        inline.dataset.v2Error = "true";
        (field.closest("label") ?? field.parentElement)?.append(inline);
      }
      inline.id ||= `admin-v2-error-message-${++this.errorIndex}`;
      inline.textContent =
        field instanceof HTMLInputElement ||
        field instanceof HTMLTextAreaElement ||
        field instanceof HTMLSelectElement
          ? field.validationMessage || message
          : message;
      const descriptions = new Set(
        (field.getAttribute("aria-describedby") ?? "")
          .split(/\s+/)
          .filter(Boolean),
      );
      descriptions.add(inline.id);
      field.setAttribute("aria-describedby", [...descriptions].join(" "));
      const a = document.createElement("a");
      a.href = `#${field.id}`;
      a.textContent =
        field
          .closest("label")
          ?.querySelector(".admin-field-caption")
          ?.textContent?.trim() ??
        field.closest("label")?.textContent?.trim() ??
        "Review field";
      a.addEventListener("click", (event) => {
        event.preventDefault();
        field.focus();
        field.scrollIntoView({ block: "center" });
      });
      this.errors.append(a);
    }
    this.errors.focus();
    this.errors.scrollIntoView({ block: "start" });
  }
}
