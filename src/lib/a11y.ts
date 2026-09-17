/**
 * Shared accessibility utilities for interactive components.
 */

/**
 * Focusable element selector covering links, buttons, inputs, selects, textareas,
 * and elements with non-negative tabindex.
 */
export const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Returns all currently visible focusable elements within a container element.
 */
export function getFocusableElements(container: HTMLElement): HTMLElement[] {
  return Array.from(
    container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
  ).filter((el) => el.offsetParent !== null);
}

/**
 * Traps Tab and Shift+Tab navigation within a container element.
 *
 * @param container The container element (e.g. drawer, menu, dialog) holding focusable controls.
 * @param isOpen Callback function returning whether the focus trap should be active.
 * @returns Cleanup function that removes the keydown event listener.
 */
export function trapFocus(
  container: HTMLElement,
  isOpen: () => boolean,
): () => void {
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key !== 'Tab') return;
    if (!isOpen()) return;

    const focusable = getFocusableElements(container);
    if (!focusable.length) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };

  container.addEventListener('keydown', handleKeyDown);
  return () => container.removeEventListener('keydown', handleKeyDown);
}
