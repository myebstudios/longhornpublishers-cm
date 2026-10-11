/** Only accessible presentation enhancements; fields, payloads and handlers remain unchanged. */
import { adminIcon } from './admin-icons';
let fieldIndex = 0;
function enhance(root: ParentNode) {
 root.querySelectorAll<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>('input,textarea,select').forEach(field => {
  const key = field.name || [...field.attributes].find(a => a.name.startsWith('data-') && /-(en|fr)$/.test(a.name))?.name || '';
  if (key.endsWith('_en') || key.endsWith('-en')) field.lang = 'en';
  if (key.endsWith('_fr') || key.endsWith('-fr')) field.lang = 'fr';
  if (field.type === 'hidden') return;
  const label = field.closest('label');
  if (label && field.required && !label.querySelector('.required-marker')) { const marker=document.createElement('span'); marker.className='required-marker'; marker.textContent='Required'; label.append(marker); }
  if (label) {
   const helpers = [...label.querySelectorAll<HTMLElement>('small')];
   if (helpers.length) { const ids = new Set((field.getAttribute('aria-describedby') ?? '').split(' ').filter(Boolean)); for (const helper of helpers) { if (!helper.id) helper.id=`admin-field-help-${++fieldIndex}`; ids.add(helper.id); } field.setAttribute('aria-describedby',[...ids].join(' ')); }
  }
 });
 root.querySelectorAll<HTMLElement>('.status--ok,.status--err').forEach(status => {
  // A CSS mask supplies a shared line icon without changing live-region text or children.
  status.dataset.statusIcon = status.classList.contains('status--err') ? 'alert' : 'check';
 });
}
enhance(document);
new MutationObserver(records => { for (const record of records) {
 if (record.type==='attributes') { if (record.target instanceof HTMLElement) enhance(record.target.parentElement ?? record.target); }
 else record.addedNodes.forEach(node => { if (node instanceof Element) enhance(node.parentElement ?? node); });
}}).observe(document.querySelector('.page-content')!, {childList:true,subtree:true,attributes:true,attributeFilter:['class']});
const coverLabel=document.querySelector<HTMLElement>('#coverFileLabel');
coverLabel?.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();document.querySelector<HTMLInputElement>('#coverFile')?.click();}});
// Styling-only record action names and SVGs; preserve click callbacks and boundary behavior.
function actionNames() {
 document.querySelectorAll<HTMLElement>('.ordered-item').forEach(row=>{
  const name=row.querySelector('h3')?.textContent ?? 'item';
  row.querySelectorAll<HTMLButtonElement>('button').forEach(b=>{if(b.textContent==='↑'||b.textContent==='↓'){const up=b.textContent==='↑'; b.setAttribute('aria-label',`Move ${name} ${up?'up':'down'}`); b.title=b.getAttribute('aria-label')!; b.innerHTML=adminIcon('arrow'); b.querySelector<SVGElement>('svg')!.style.transform=`rotate(${up?'-90':'90'}deg)`;}});
 });
}
new MutationObserver(actionNames).observe(document.querySelector('.page-content')!,{childList:true,subtree:true});actionNames();
