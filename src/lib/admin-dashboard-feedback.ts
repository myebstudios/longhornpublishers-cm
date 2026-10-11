/** Keep failed-source nodes stable across independent read settlements. */
export function dashboardFeedback(container: HTMLElement, refresh: HTMLButtonElement, retrySource: (source: string) => void) {
  const cards = new Map<string, { card: HTMLElement; message: HTMLElement; retry: HTMLButtonElement }>();
  const doc = container.ownerDocument;
  return (errors: ReadonlyMap<string, string>, pending: ReadonlySet<string>, label: (source: string) => string) => {
    for (const [source, nodes] of cards) {
      if (errors.has(source)) continue;
      // A successful Retry removes its card; move focus to a persistent control.
      if (nodes.card.contains(doc.activeElement)) refresh.focus();
      nodes.card.remove();
      cards.delete(source);
    }
    for (const [source, value] of errors) {
      let nodes = cards.get(source);
      if (!nodes) {
        const card = doc.createElement('section'); card.className = 'card';
        const heading = doc.createElement('h2'); heading.textContent = `${label(source)} · Could not load`;
        const message = doc.createElement('p'); message.setAttribute('role', 'alert'); message.setAttribute('aria-atomic', 'true');
        const retry = doc.createElement('button'); retry.type = 'button'; retry.className = 'button secondary'; retry.textContent = 'Retry';
        retry.setAttribute('aria-label', `Retry ${label(source)}`);
        retry.addEventListener('click', () => { if (retry.getAttribute('aria-disabled') !== 'true') retrySource(source); });
        card.append(heading, message, retry);
        nodes = { card, message, retry }; cards.set(source, nodes);
        // Insert an empty alert first, then update its text once per new failure.
        container.append(card);
      }
      if (nodes.message.textContent !== value) nodes.message.textContent = value;
      nodes.retry.setAttribute('aria-disabled', String(pending.has(source)));
    }
    refresh.setAttribute('aria-disabled', String(pending.size > 0));
  };
}
