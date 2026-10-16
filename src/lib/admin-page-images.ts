import { coverFileError, request, sendJson, uploadMedia } from "./admin-client";
import type { AdminEditor } from "./admin-v2-dialog";
import { fingerprint } from "./admin-v2-model";
import { action, node } from "./admin-v2-preview";
import {
  isImagePage,
  PAGE_IMAGE_KEYS,
  PAGE_IMAGE_SLOTS,
  UPLOADED_IMAGE_KEY,
  pageImageSource,
  type PageImageRow,
} from "./page-image-slots";

/** Shares the page's single v2 dialog, dirty guard and operation lock. */
export async function mountPageImages(
  page: string,
  editor: AdminEditor,
  canvas: HTMLElement,
) {
  if (!isImagePage(page)) return;
  const imagePage = page;
  const slots = PAGE_IMAGE_SLOTS[imagePage];
  const endpoint = `/api/page-images-admin?page=${imagePage}`;
  const section = node("section", "", "admin-section-card");
  section.id = "pageImages";
  const header = node("header");
  const heading = node("h2", "Page images");
  heading.id = "pageImagesTitle";
  section.setAttribute("aria-labelledby", heading.id);
  header.append(heading);
  const status = node("p", "Loading page images…", "admin-saved-status");
  status.setAttribute("role", "status");
  status.setAttribute("aria-live", "polite");
  const list = node("ul", "", "admin-card-grid");
  section.append(
    header,
    node(
      "p",
      "Images are shared by English and French. Save applies the image to this page; removing a custom image restores the current default.",
    ),
    status,
    list,
  );
  canvas.after(section);
  const jump = node(
    "a",
    "Page images",
    "button secondary",
  ) as HTMLAnchorElement;
  jump.href = "#pageImages";
  document.querySelector(".admin-page-head")?.append(jump);
  section.style.scrollMarginTop = "6rem";
  let rows: PageImageRow[] = [];
  let opening = false;
  const form = document.createElement("form");
  form.id = "pageImageForm";
  form.hidden = true;
  const media = node("div", "", "media-field");
  const input = document.createElement("input");
  input.type = "hidden";
  input.name = "image_id";
  const label = node("label", "Choose or replace image");
  const file = document.createElement("input");
  file.type = "file";
  file.accept = "image/jpeg,image/png,image/webp";
  label.append(file);
  const image = document.createElement("img");
  image.width = 640;
  image.height = 360;
  image.alt = "Page image preview";
  const note = node("p");
  note.setAttribute("role", "status");
  note.setAttribute("aria-live", "polite");
  const help = node(
    "small",
    "JPEG, PNG or WebP, up to 8 MB. Landscape images work best.",
  );
  const clear = action("Remove custom image", () => {
    if (editor.pending) return;
    input.value = "";
    renderImage();
    note.textContent = "Default image restored in this draft. Save to apply.";
  });
  media.append(input, label, clear, image, help, note);
  form.append(media);
  editor.body.append(form);
  let activeSlot: string = slots[0].slot;
  let baseline: PageImageRow = {
    key: `${imagePage}.${activeSlot}`,
    image_id: null,
  };
  const snapshot = () => ({ image_id: input.value || null });
  const savedRow = (slot: string) =>
    rows.find((row) => row.key === `${imagePage}.${slot}`) ?? {
      key: `${imagePage}.${slot}`,
      image_id: null,
    };
  function renderImage() {
    image.src = pageImageSource(imagePage, activeSlot, [
      { key: `${imagePage}.${activeSlot}`, image_id: input.value || null },
    ]);
    clear.hidden = !input.value;
  }
  image.addEventListener("error", () => {
    note.textContent =
      "Image unavailable. Its saved reference is retained; retry opening this editor or upload a replacement.";
  });
  file.addEventListener("change", async () => {
    if (editor.pending) {
      file.value = "";
      return;
    }
    const selected = file.files?.[0];
    if (!selected) return;
    const error = coverFileError(selected);
    if (error) {
      note.textContent = error;
      file.value = "";
      return;
    }
    editor.setPending(1);
    note.textContent = "Uploading…";
    try {
      const result = await uploadMedia(selected);
      if (!result.ok || !result.data?.id) {
        note.textContent = result.error ?? "Unable to upload image.";
        return;
      }
      input.value = result.data.id;
      renderImage();
      note.textContent = "Image attached. Save to update the page.";
    } finally {
      editor.setPending(-1);
      file.value = "";
    }
  });
  async function read() {
    const result = await request<PageImageRow[]>(endpoint);
    if (
      !result.ok ||
      !Array.isArray(result.data) ||
      result.data.some(
        (row) =>
          !row ||
          typeof row.key !== "string" ||
          !PAGE_IMAGE_KEYS.includes(row.key) ||
          !row.key.startsWith(`${imagePage}.`) ||
          (row.image_id !== null &&
            (typeof row.image_id !== "string" ||
              !UPLOADED_IMAGE_KEY.test(row.image_id))),
      )
    ) {
      status.classList.add("status", "status--err");
      status.replaceChildren(
        node("span", result.error ?? "Could not read page images."),
        action("Retry page images", () => void refresh()),
      );
      return false;
    }
    rows = result.data;
    status.classList.remove("status", "status--err");
    status.textContent = "Saved page images loaded.";
    return true;
  }
  function renderCards() {
    list.replaceChildren();
    for (const slot of slots) {
      const li = node("li"),
        card = node("article", "", "admin-preview-card");
      card.dataset.imageSlot = slot.slot;
      const well = node("div", "", "admin-landscape-shell");
      const preview = document.createElement("img");
      preview.src = pageImageSource(imagePage, slot.slot, rows);
      preview.alt = `${slot.label} — saved image preview`;
      preview.loading = "lazy";
      preview.width = 640;
      preview.height = 360;
      preview.addEventListener("error", () => {
        well.replaceChildren(
          node(
            "p",
            "Image unavailable. The saved reference is retained.",
            "admin-image-empty",
          ),
        );
      });
      well.append(preview);
      const copy = node("div", "", "admin-card-copy");
      copy.append(
        node("h3", slot.label),
        node(
          "small",
          savedRow(slot.slot).image_id ? "Custom image" : "Default image",
        ),
      );
      const footer = node("footer", "", "admin-card-footer");
      footer.append(
        action(
          `Edit ${slot.label.toLowerCase()} image`,
          (button) => void open(slot.slot, slot.label, button),
        ),
      );
      card.append(well, copy, footer);
      li.append(card);
      list.append(li);
    }
  }
  async function refresh() {
    if (!(await read())) return false;
    status.classList.remove("status", "status--err");
    status.textContent = "Saved page images loaded.";
    renderCards();
    return true;
  }
  async function open(slot: string, title: string, trigger: HTMLElement) {
    if (opening || editor.dialog.open) return;
    opening = true;
    trigger.setAttribute("aria-disabled", "true");
    try {
      if (!(await read())) return;
      activeSlot = slot;
      baseline = structuredClone(savedRow(slot));
      input.value = baseline.image_id ?? "";
      file.value = "";
      note.textContent = "";
      renderImage();
      if (
        !editor.open(
          form,
          `Edit ${title.toLowerCase()} image`,
          "Page images",
          "medium",
          trigger,
          snapshot,
          () => {
            file.value = "";
          },
        )
      )
        return;
      editor.dialog.dataset.editTitle = `Edit ${title.toLowerCase()} image`;
      document.querySelector("#adminEditorIndex")!.replaceChildren();
      document.querySelector("#adminSaveConsequence")!.textContent =
        "Updates this page image in English and French";
      editor.actions.append(
        action("Cancel", () => void editor.close()),
        action("Save image", () => void save(), "button"),
      );
    } finally {
      opening = false;
      trigger.setAttribute("aria-disabled", "false");
    }
  }
  async function save() {
    if (editor.pending) return;
    editor.setPending(1);
    try {
      if (!(await read())) {
        editor.showErrors(
          "Could not check the saved image. Your draft is retained. Retry Save.",
        );
        return;
      }
      const latest = savedRow(activeSlot);
      if (fingerprint(latest) !== fingerprint(baseline)) {
        editor.showErrors(
          "This image changed elsewhere. Your draft is retained. Close and reopen to load the latest saved image.",
        );
        return;
      }
      const result = await sendJson<PageImageRow>(
        "/api/page-images-admin",
        "PUT",
        { key: baseline.key, image_id: input.value || null },
      );
      if (
        !result.ok ||
        !result.data ||
        result.data.key !== baseline.key ||
        result.data.image_id !== (input.value || null)
      ) {
        editor.showErrors(
          result.error ??
            "Unable to confirm the saved image. Your draft is retained; reopen to check the saved state.",
        );
        return;
      }
      // Apply the acknowledged write before reading previews; a failed follow-up
      // must never leave a successfully saved draft marked dirty.
      rows = [...rows.filter((row) => row.key !== baseline.key), result.data!];
      renderCards();
      status.textContent = "Page image saved.";
      editor.markClean();
      editor.closeNow(
        section.querySelector<HTMLButtonElement>(
          `[data-image-slot="${activeSlot}"] button`,
        ),
      );
    } finally {
      editor.setPending(-1);
    }
  }
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    void save();
  });
  await refresh();
}
