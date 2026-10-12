import test from 'node:test';
import assert from 'node:assert/strict';
import { adaptDashboard, websiteCounts, catalogueCounts, recentEdits } from '../src/lib/admin-dashboard.ts';
import { dashboardFeedback } from '../src/lib/admin-dashboard-feedback.ts';
import { beginLoginSubmission, endLoginSubmission, loginStatus, loginFieldError, clearLoginErrors, loginFailureMessage } from '../src/lib/admin-login-presentation.ts';

// Minimal DOM double records node identity, focus and live-message mutations.
function dom() {
 const doc = { activeElement: null, createElement: tag => new Element(tag) };
 class Element {
  constructor(tag) { this.tagName=tag;this.ownerDocument=doc;this.children=[];this.attributes=new Map();this.listeners={};this.value='';this.writes=0; }
  set textContent(value) { this.value=value;this.writes++; } get textContent() { return this.value; }
  setAttribute(key,value) { this.attributes.set(key,value); } getAttribute(key) { return this.attributes.get(key)??null; } removeAttribute(key) { this.attributes.delete(key); }
  append(...nodes) { for(const node of nodes) { node.parent=this;this.children.push(node); } }
  contains(node) { return node===this||this.children.some(child=>child.contains(node)); }
  remove() { this.parent.children=this.parent.children.filter(child=>child!==this); }
  focus() { doc.activeElement=this; } addEventListener(name,fn) { this.listeners[name]=fn; }
  querySelectorAll() { return this.children; }
 }
 return {doc,create:tag=>doc.createElement(tag)};
}
test('dashboard failures retain nodes and announce only changed messages across 11 settlements',()=>{
 const {create}=dom(),container=create('div'),refresh=create('button');
 const render=dashboardFeedback(container,refresh,()=>{}),errors=new Map(),pending=new Set(Array.from({length:11},(_,i)=>String(i)));
 for(let i=0;i<11;i++) { errors.set(String(i),'Unable to load');pending.delete(String(i));render(errors,pending,s=>s); }
 assert.equal(container.children.length,11);
 for(const card of container.children) { assert.equal(card.children[1].writes,1);assert.equal(card.children[1].getAttribute('role'),'alert');assert.equal(card.getAttribute('role'),null); }
 const first=container.children[0];errors.set('0','New error');render(errors,pending,s=>s);
 assert.equal(container.children[0],first);assert.equal(first.children[1].writes,2);
});
test('Retry remains focused during pending and failure; successful Retry transfers focus to Refresh',()=>{
 const {doc,create}=dom(),container=create('div'),refresh=create('button'),calls=[];
 const render=dashboardFeedback(container,refresh,s=>calls.push(s)),errors=new Map([['hero','Failed']]),pending=new Set();
 render(errors,pending,s=>s);const retry=container.children[0].children[2];retry.focus();retry.listeners.click();assert.deepEqual(calls,['hero']);
 pending.add('hero');render(errors,pending,s=>s);retry.listeners.click();assert.equal(calls.length,1);assert.equal(doc.activeElement,retry);assert.equal(refresh.getAttribute('aria-disabled'),'true');
 pending.clear();render(errors,pending,s=>s);assert.equal(doc.activeElement,retry);
 errors.clear();render(errors,pending,s=>s);assert.equal(doc.activeElement,refresh);assert.equal(container.children.length,0);
});
test('Refresh stays focused while independently settled failures are rendered',()=>{
 const {doc,create}=dom(),container=create('div'),refresh=create('button');refresh.focus();
 dashboardFeedback(container,refresh,()=>{})(new Map([['hero','Failed']]),new Set(['catalogue']),s=>s);
 assert.equal(doc.activeElement,refresh);assert.equal(refresh.disabled,undefined);
});
test('login pending guard preserves focus and prevents duplicate submissions',()=>{
 const {doc,create}=dom(),button=create('button');button.focus();
 assert.equal(beginLoginSubmission(button),true);assert.equal(beginLoginSubmission(button),false);assert.equal(doc.activeElement,button);assert.equal(button.disabled,undefined);
 endLoginSubmission(button);assert.equal(beginLoginSubmission(button),true);
});
test('login mismatch is assertive, field-linked and focuses confirmation; cleanup preserves other descriptions',()=>{
 const {doc,create}=dom(),status=create('p'),confirmation=create('input'),form=create('form');form.append(confirmation);confirmation.setAttribute('aria-describedby','passwordHint');
 loginFieldError(status,'Passwords do not match.',[confirmation],true);
 assert.equal(doc.activeElement,confirmation);assert.equal(status.getAttribute('role'),'alert');assert.equal(status.getAttribute('aria-live'),'assertive');assert.equal(confirmation.getAttribute('aria-invalid'),'true');assert.equal(confirmation.getAttribute('aria-describedby'),'passwordHint status');
 clearLoginErrors(form);loginStatus(status,'Signing in…');assert.equal(status.getAttribute('role'),'status');assert.equal(status.getAttribute('aria-live'),'polite');assert.equal(confirmation.getAttribute('aria-invalid'),null);assert.equal(confirmation.getAttribute('aria-describedby'),'passwordHint');
});
test('login credential failures describe both fields; transport errors use contextual safe copy',()=>{
 const {create}=dom(),status=create('p'),email=create('input'),password=create('input');
 loginFieldError(status,loginFailureMessage('login',true),[email,password]);
 assert.equal(status.textContent,'Invalid email or password.');for(const field of [email,password]) assert.equal(field.getAttribute('aria-describedby'),'status');
 for(const flow of ['login','invite','reset']) { const message=loginFailureMessage(flow);assert.match(message,/Try again/);assert.doesNotMatch(message,/Not Found|404|stack/i); }
 assert.equal(loginFailureMessage('login',false,true),'This account does not have administrator access.');
});
test('empty and missing pages remain distinct from failure',()=>{
 assert.deepEqual(adaptDashboard('catalogue',[]),{catalogue:[]});
 assert.deepEqual(adaptDashboard('about',null),{about:[]});
 for (const [source,value] of [['catalogue',{}],['news',null],['subjects',[{id:'s'}]],['hero',[{id:'h',enabled:'yes'}]],['about',{}],['homepage',{content:null}],['services',{services:[],process:null}]]) assert.throws(()=>adaptDashboard(source,value));
});
test('website total excludes subjects, settings and slides and counts missing legal keys',()=>{
 const data={homepage:[{published:true}],about:[],why:[{published:false}],contact:[],services:[{published:true},{published:false}],process:[{published:true}],legal:[{page:'privacy_policy',published:true}],subjects:[{}],settings:[{}],hero:[{enabled:true}]};
 assert.deepEqual(websiteCounts(data),{published:4,drafts:2,missing:3});
 delete data.process;assert.equal(websiteCounts(data),null);
});
test('six absent singleton/legal records are not counted as drafts',()=>{
 assert.deepEqual(websiteCounts({homepage:[],about:[],why:[],contact:[],services:[],process:[],legal:[]}),{published:0,drafts:0,missing:6});
});
test('catalogue eligibility requires a published record in either permitted classification',()=>{
 const result=catalogueCounts([{published:true,classification:'unclassified',level:'primary'},{published:false,classification:'national_book_list_verified',level:'secondary'},{published:true,classification:'national_book_list_verified',level:'secondary'},{published:true,classification:'other_developed',level:'primary'}]);
 assert.deepEqual(result,{total:4,primary:2,secondary:2,published:3,drafts:1,unclassified:1,eligible:2,coverEligible:0});
});
test('homepage projection never supplies catalogue metrics',()=>{
 assert.deepEqual(adaptDashboard('homepage',{content:null,catalogue:[{published:true}]}),{homepage:[]});
});
test('recent edits exclude subjects and stated dates; omit invalid edit timestamps',()=>{
 const result=recentEdits({subjects:[{id:'s',updated_at:'2026-10-11T12:00:00Z'}],news:[{id:'n',publish_date:'2026-10-11',updated_at:'invalid'}],legal:[{page:'privacy_policy',content_updated_at:'2026-10-11'}],settings:[{updated_at:'2026-10-10T10:00:00Z'}]});
 assert.equal(result.length,1);assert.equal(result[0].source,'settings');
});
test('recent edits deduplicate by source/key, break timestamp ties and limit to six',()=>{
 const date='2026-10-10T10:00:00Z';
 const catalogue=Array.from({length:8},(_,i)=>({id:String(i),updated_at:date}));catalogue.push({id:'0',updated_at:'2026-10-11T10:00:00Z'});
 const result=recentEdits({catalogue,news:[{id:'0',updated_at:date}]});
 assert.equal(result.length,6);assert.equal(result[0].key,'catalogue:0');assert.equal(result[1].key,'catalogue:1');assert.equal(new Set(result.map(r=>r.key)).size,6);
});
