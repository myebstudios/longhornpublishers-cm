import { adminPages } from './admin-navigation';
import { adminIcon } from './admin-icons';
const sidebar = document.querySelector<HTMLElement>('#adminSidebar')!;
const drawer = document.querySelector<HTMLDialogElement>('#adminNavDrawer')!;
const search = document.querySelector<HTMLDialogElement>('#adminSearchDialog')!;
const menu = document.querySelector<HTMLButtonElement>('#menuButton')!;
const toggle = document.querySelector<HTMLButtonElement>('#sidebarToggle')!;
const query = document.querySelector<HTMLInputElement>('#adminPageQuery')!;
const results = document.querySelector<HTMLElement>('#adminSearchResults')!;
const desktop = matchMedia('(min-width: 1200px)');
const mobile = matchMedia('(max-width: 767px)');
let collapsed = false;
let searchTrigger: HTMLElement | null = null;
let drawerTrigger: HTMLElement | null = null;
try { collapsed = localStorage.getItem('lh-admin-sidebar-collapsed') === 'true'; } catch { /* unavailable storage */ }
function applyLayout() {
 document.body.classList.toggle('sidebar-collapsed', desktop.matches && collapsed);
 toggle.setAttribute('aria-label', desktop.matches ? (collapsed ? 'Expand navigation' : 'Collapse navigation') : 'Open admin navigation');
 sidebar.inert = mobile.matches;
}
function unlock() { if (!drawer.open && !search.open) document.body.style.overflow = ''; }
function closeDrawer(restore = true) {
 if (!drawer.open) return;
 drawer.close();
 document.body.insertBefore(sidebar, document.querySelector('.app-main'));
 sidebar.classList.remove('in-drawer');
 applyLayout(); unlock();
 if (restore) (drawerTrigger ?? menu).focus();
}
function openDrawer(trigger: HTMLElement) {
 if (search.open) return;
 drawerTrigger = trigger;
 document.querySelector('#drawerContent')!.append(sidebar);
 sidebar.classList.add('in-drawer'); sidebar.inert = false;
 drawer.showModal(); document.body.style.overflow = 'hidden';
 document.querySelector<HTMLButtonElement>('#closeDrawer')!.focus();
}
menu.addEventListener('click', () => openDrawer(menu));
toggle.addEventListener('click', () => {
 if (drawer.open) { closeDrawer(); return; }
 if (!desktop.matches) { openDrawer(toggle); return; }
 collapsed = !collapsed;
 try { localStorage.setItem('lh-admin-sidebar-collapsed', String(collapsed)); } catch { /* unavailable storage */ }
 applyLayout();
});
document.querySelector('#closeDrawer')!.addEventListener('click', () => closeDrawer());
drawer.addEventListener('cancel', e => { e.preventDefault(); closeDrawer(); });
drawer.addEventListener('click', e => { if (e.target === drawer) { const r = drawer.getBoundingClientRect(); if (e.clientX > r.right || e.clientY > r.bottom || e.clientX < r.left) closeDrawer(); } });
// Keep the original links mounted: the existing capture-phase dirty guard still covers drawer/search links.
// A cancelled dirty-leave dialog leaves this drawer and the originating link intact.
drawer.addEventListener('click', e => { const a = (e.target as Element).closest('a'); if (a && !e.defaultPrevented) closeDrawer(false); });
function renderSearch() {
 results.replaceChildren();
 const value = query.value.trim().toLowerCase();
 const matches = adminPages.filter(p => `${p.label} ${p.group}`.toLowerCase().includes(value));
 for (const group of ['Workspace', 'Website', 'Content', 'Settings', 'Account']) {
  const pages = matches.filter(p => p.group === group); if (!pages.length) continue;
  const heading = document.createElement('h3'); heading.textContent = group; results.append(heading);
  for (const page of pages) { const a = document.createElement('a'); a.href = page.href; a.innerHTML = adminIcon(page.icon); a.append(document.createTextNode(page.label)); results.append(a); }
 }
 if (!matches.length) { const empty = document.createElement('p'); empty.textContent = 'No matching admin pages found.'; results.append(empty); }
}
function openSearch(trigger: HTMLElement | null) {
 if (document.querySelector('dialog[open]') && !drawer.open) return;
 searchTrigger = drawer.open ? menu : trigger;
 closeDrawer(false); query.value = ''; renderSearch();
 search.showModal(); document.body.style.overflow = 'hidden'; query.focus();
}
function closeSearch() { search.close(); unlock(); (searchTrigger ?? (mobile.matches ? menu : toggle)).focus(); }
document.querySelectorAll<HTMLElement>('[data-open-search]').forEach(b => b.addEventListener('click', () => openSearch(b)));
document.querySelector('#closeSearch')!.addEventListener('click', closeSearch);
search.addEventListener('cancel', e => { e.preventDefault(); closeSearch(); });
search.addEventListener('click', e => { if (e.target === search) { const r = search.getBoundingClientRect(); if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) closeSearch(); } });
query.addEventListener('input', renderSearch);
document.addEventListener('keydown', e => {
 const target = e.target as HTMLElement;
 if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k' && !target.closest('input,textarea,[contenteditable="true"]')) {
  e.preventDefault(); openSearch(target);
 }
});
function resize() { const hadDrawer = drawer.open; if (hadDrawer) closeDrawer(false); if (search.open) closeSearch(); applyLayout(); if (hadDrawer) (mobile.matches ? menu : toggle).focus(); }
desktop.addEventListener('change', resize); mobile.addEventListener('change', resize); applyLayout();
const notice = document.querySelector<HTMLElement>('#localAdminNotice')!;
const head = document.querySelector('.admin-page-head'); if (head) head.after(notice);
document.querySelector('#dismissDevNotice')!.addEventListener('click', () => { notice.hidden = true; try { sessionStorage.setItem('lh-admin-dev-notice-dismissed', 'true'); } catch { /* unavailable storage */ } });

// A single floating tooltip avoids clipping labels inside the scrolling rail.
const tooltip = document.createElement('div'); tooltip.className='admin-nav-tooltip'; tooltip.id='adminNavTooltip'; tooltip.setAttribute('role','tooltip'); tooltip.hidden=true;document.body.append(tooltip);
function hideTooltip(){ tooltip.hidden=true; }
sidebar.querySelectorAll<HTMLElement>('a[title],button[title]').forEach(control=>{
 const show=()=>{ if (drawer.open || (desktop.matches && !collapsed) || mobile.matches) return; const rect=control.getBoundingClientRect(); tooltip.textContent=control.title; tooltip.hidden=false;tooltip.style.left=`${rect.right+8}px`;tooltip.style.top=`${Math.min(rect.top,innerHeight-tooltip.offsetHeight-8)}px`;control.setAttribute('aria-describedby',tooltip.id); };
 control.addEventListener('mouseenter',show);control.addEventListener('focus',show);control.addEventListener('mouseleave',hideTooltip);control.addEventListener('blur',()=>{hideTooltip();control.removeAttribute('aria-describedby');});
});
window.addEventListener('resize',hideTooltip);document.addEventListener('keydown',e=>{if(e.key==='Escape')hideTooltip();});
const hint=document.querySelector('kbd');if(hint)hint.textContent=/Mac|iPhone|iPad/.test(navigator.platform)?'⌘ K':'Ctrl K';

// V2: close navigation surfaces before opening a focused editor.
document.addEventListener('admin:close-navigation',()=>{if(search.open)closeSearch();closeDrawer(false);hideTooltip();});
search.addEventListener('keydown',event=>{if(event.key==='Escape'){event.preventDefault();event.stopPropagation();closeSearch();}},true);
const nav=sidebar.querySelector('nav')!;const cue=document.querySelector<HTMLElement>('#adminNavCue')!;
function updateCue(){const below=nav.scrollHeight-nav.clientHeight-nav.scrollTop>2;const above=nav.scrollTop>2;const message=below?(above?'More above · More below':'More below'):above?'More above':'';if(cue.textContent!==message)cue.textContent=message;}
nav.addEventListener('scroll',updateCue,{passive:true});window.addEventListener('resize',updateCue);new ResizeObserver(()=>requestAnimationFrame(updateCue)).observe(nav);nav.addEventListener('focusin',event=>{(event.target as HTMLElement).scrollIntoView({block:'nearest'});updateCue();});updateCue();
