import test from 'node:test';
import assert from 'node:assert/strict';
import { adaptDashboard, websiteCounts, catalogueCounts, recentEdits } from '../src/lib/admin-dashboard.ts';
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
 assert.deepEqual(result,{total:4,primary:2,secondary:2,published:3,drafts:1,unclassified:1,eligible:2});
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
