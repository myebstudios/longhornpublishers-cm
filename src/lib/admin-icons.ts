const paths: Record<string, string> = {
 inbox: '<path d="m3 3-2 12v6h22v-6L21 3Z M1 15h6l2 3h6l2-3h6"/>',
 'layout-dashboard': '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="11" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="18" width="7" height="3" rx="1"/>',
 house: '<path d="m3 10 9-7 9 7v10H3Z M9 20v-7h6v7"/>',
 'building-2': '<path d="M4 21V3h12v18 M16 9h4v12 M8 7h4 M8 11h4 M8 15h4 M8 21v-3h4v3"/>',
 layers: '<path d="m12 3 10 5-10 5L2 8Z M2 12l10 5 10-5 M2 16l10 5 10-5"/>',
 'badge-check': '<path d="m12 3 3 2 4 1 1 4 2 2-2 3-1 4-4 1-3 2-3-2-4-1-1-4-2-3 2-2 1-4 4-1Z m-4 9 3 3 5-6"/>',
 'book-open': '<path d="M12 5v16 M12 5C9 3 5 3 2 4v15c4-1 7-1 10 2 3-3 6-3 10-2V4c-3-1-7-1-10 1Z"/>',
 tags: '<path d="M3 3h7l10 10-7 7L3 10Z M14 3l8 8-3 3"/><circle cx="7" cy="7" r="1"/>',
 newspaper: '<path d="M5 3h16v16a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8h3 M5 8v11 M9 7h8 M9 11h8 M9 15h3 M15 15h2"/>',
 'map-pin': '<path d="M20 10c0 6-8 11-8 11S4 16 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/>',
 'file-text': '<path d="M14 2H4v20h16V8Z M14 2v6h6 M8 12h8 M8 16h8"/>',
 settings: '<path d="m9 3-1 3-3 1-2 4 2 2v3l3 1 1 4h6l1-4 3-1v-3l2-2-2-4-3-1-1-3Z"/><circle cx="12" cy="12" r="3"/>',
 'log-out': '<path d="M9 3H3v18h6 M9 12h12 m-4-4 4 4-4 4"/>',
 search: '<circle cx="10" cy="10" r="7"/><path d="m15 15 6 6"/>',
 menu: '<path d="M3 6h18 M3 12h18 M3 18h18"/>',
 close: '<path d="m6 6 12 12 M6 18 18 6"/>',
 collapse: '<path d="M4 3v18 M20 3v18 M15 7l-5 5 5 5"/>',
 globe: '<circle cx="12" cy="12" r="9"/><ellipse cx="12" cy="12" rx="4" ry="9"/><path d="M3 12h18"/>',
 'external-link': '<path d="M14 3h7v7 M21 3l-10 10 M10 3H3v18h18v-7"/>',
 info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6 M12 7h.01"/>',
 alert: '<path d="m12 3 10 18H2Z M12 9v5 M12 17h.01"/>',
 check: '<path d="m5 12 4 4L19 6"/>',
 arrow: '<path d="M3 12h18 m-6-6 6 6-6 6"/>',
};
export function adminIcon(key: string): string {
 return `<svg class="admin-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[key] ?? paths['file-text']}</svg>`;
}
