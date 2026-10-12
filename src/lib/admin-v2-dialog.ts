import { registerDirtyCheck } from './admin-client';
import { fingerprint } from './admin-v2-model';
export class AdminEditor {
 dialog=document.querySelector<HTMLDialogElement>('#adminEditorDialog')!;
 body=document.querySelector<HTMLElement>('#adminEditorBody')!;
 footer=document.querySelector<HTMLElement>('#adminEditorFooter')!;
 title=document.querySelector<HTMLElement>('#adminEditorTitle')!;
 status=document.querySelector<HTMLElement>('#adminEditorStatus')!;
 errors=document.querySelector<HTMLElement>('#adminEditorErrors')!;
 actions=document.querySelector<HTMLElement>('#adminEditorActions')!;
 decision=document.querySelector<HTMLElement>('#adminDiscardDecision')!;
 trigger:HTMLElement|null=null; form:HTMLFormElement|null=null; pending=0; baseline=''; snapshot:()=>unknown=()=>null; cleanup:()=>void=()=>{};
 private decisionResolve:((value:boolean)=>void)|null=null; private previousFocus:HTMLElement|null=null;private scroll=0;private overflow='';
 constructor(){
  document.querySelector('#adminEditorClose')!.addEventListener('click',()=>void this.close());
  this.dialog.addEventListener('cancel',event=>{event.preventDefault();void this.close();});
  document.querySelector('#adminKeepEditing')!.addEventListener('click',()=>this.finishDecision(false));
  document.querySelector('#adminDiscardChanges')!.addEventListener('click',()=>this.finishDecision(true));
  registerDirtyCheck(()=>this.dialog.open&&(this.pending>0||this.isDirty()));
  document.addEventListener('admin:confirm',event=>{const detail=(event as CustomEvent).detail;if(this.dialog.open){detail.promise=this.discardDecision();}});
  const viewport=window.visualViewport;const resize=()=>{if(!this.dialog.open)return;this.dialog.style.setProperty('--editor-available-height',`${viewport?.height??innerHeight}px`);this.dialog.style.setProperty('--editor-top',`${viewport?.offsetTop??0}px`);};viewport?.addEventListener('resize',resize);viewport?.addEventListener('scroll',resize);this.dialog.addEventListener('admin:opened',resize);
 }
 isDirty(){return fingerprint(this.snapshot())!==this.baseline;}
 markClean(){this.baseline=fingerprint(this.snapshot());}
 open(form:HTMLFormElement,title:string,context:string,mode:'short'|'medium'|'large',trigger:HTMLElement|null,snapshot:()=>unknown,cleanup:()=>void){
  if(this.dialog.open) return false;
  document.dispatchEvent(new CustomEvent('admin:close-navigation'));
  this.form=form;this.trigger=trigger;this.snapshot=snapshot;this.cleanup=cleanup;this.title.textContent=title;document.querySelector('#adminEditorContext')!.textContent=context;
  this.dialog.dataset.mode=mode;this.status.textContent='';this.errors.hidden=true;this.actions.replaceChildren();this.dialog.querySelectorAll<HTMLFormElement>('form').forEach(f=>f.hidden=f!==form);form.hidden=false;
  this.overflow=document.body.style.overflow;document.body.style.overflow='hidden';this.markClean();this.dialog.showModal();this.body.scrollTop=0;this.dialog.dispatchEvent(new CustomEvent('admin:opened'));
  if(mode==='short')form.querySelector<HTMLElement>('input:not([type=hidden]),select,textarea')?.focus();else this.title.focus();return true;
 }
 setPending(delta:number){this.pending=Math.max(0,this.pending+delta);this.dialog.setAttribute('aria-busy',String(this.pending>0));for(const button of this.actions.querySelectorAll('button'))button.setAttribute('aria-disabled',String(this.pending>0));}
 async close(){if(this.decisionResolve){this.finishDecision(false);return;}if(this.pending){if(this.status.textContent!=='Wait for this operation to finish.')this.status.textContent='Wait for this operation to finish.';return;}if(this.isDirty()&&!(await this.discardDecision()))return;this.closeNow();}
 closeNow(target?:HTMLElement|null){this.cleanup();this.dialog.close();this.form!.hidden=true;this.actions.replaceChildren();document.body.style.overflow=this.overflow;(target??this.trigger)?.isConnected&&(target??this.trigger)!.focus();this.form=null;}
 discardDecision():Promise<boolean>{
  if(this.pending){this.status.textContent='Wait for this operation to finish.';return Promise.resolve(false);}if(this.decisionResolve)return Promise.resolve(false);
  this.previousFocus=document.activeElement as HTMLElement;this.scroll=this.body.scrollTop;this.body.hidden=true;this.footer.hidden=true;document.querySelector<HTMLElement>('#adminEditorIndex')!.hidden=true;this.decision.hidden=false;this.title.textContent='Discard unsaved changes?';document.querySelector<HTMLElement>('#adminKeepEditing')!.focus();return new Promise(resolve=>this.decisionResolve=resolve);
 }
 private finishDecision(value:boolean){const resolve=this.decisionResolve;if(!resolve)return;this.decisionResolve=null;this.decision.hidden=true;this.body.hidden=false;this.footer.hidden=false;document.querySelector<HTMLElement>('#adminEditorIndex')!.hidden=false;this.title.textContent=this.dialog.dataset.editTitle??'Edit content';this.body.scrollTop=this.scroll;this.previousFocus?.isConnected&&this.previousFocus.focus();resolve(value);}
 showErrors(message:string,fields:HTMLElement[]=[]){
  this.errors.replaceChildren();this.errors.hidden=false;this.errors.setAttribute('role','alert');const heading=document.createElement('h3');heading.textContent='Could not save changes';const copy=document.createElement('p');copy.textContent=message;this.errors.append(heading,copy);
  for(const [index,field]of fields.entries()){field.id ||= `admin-error-field-${index}`;field.setAttribute('aria-invalid','true');const a=document.createElement('a');a.href=`#${field.id}`;a.textContent=field.closest('label')?.textContent?.trim().slice(0,100)??'Review field';a.addEventListener('click',event=>{event.preventDefault();field.focus();field.scrollIntoView({block:'center'});});this.errors.append(a);}
  this.errors.focus();this.errors.scrollIntoView({block:'start'});
 }
}
