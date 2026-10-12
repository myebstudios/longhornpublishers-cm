import { coverIsPublic, isPubliclyListed } from '../../netlify/functions/_shared/catalogue-classification';
export type RecordData = Record<string, any>;
export const cloneRecord = <T>(record: T): T => structuredClone(record);
export function fingerprint(value: unknown): string {
 if (Array.isArray(value)) return `[${value.map(fingerprint).join(',')}]`;
 if (value && typeof value === 'object') return `{${Object.entries(value).sort(([a],[b])=>a.localeCompare(b)).map(([key,v])=>`${JSON.stringify(key)}:${fingerprint(v)}`).join(',')}}`;
 return JSON.stringify(value) ?? 'undefined';
}
export function mergeOwned(record: RecordData, edits: RecordData, fields: readonly string[]): RecordData {
 const result=cloneRecord(record);for(const field of fields) if(Object.hasOwn(edits,field)) result[field]=cloneRecord(edits[field]);return result;
}
export function mergeArrayItem(record: RecordData, field: string, index: number | null, edits: RecordData): RecordData {
 const result=cloneRecord(record), rows=result[field]??[];result[field]=rows;
 if(index===null) rows.push(cloneRecord(edits));else { if(index<0||index>=rows.length) throw new Error('That item no longer exists.');rows[index]={...rows[index],...cloneRecord(edits)}; }return result;
}
export function secondsToMilliseconds(value: number, original: number): number {
 if(value===original/1000) return original;
 if(!Number.isFinite(value)||value<3||value>30||Math.abs(value*2-Math.round(value*2))>1e-8) throw new Error('Use 3–30 seconds in half-second increments.');
 return Math.round(value*1000);
}
export const countLabel=(n:number,singular:string,plural=`${singular}s`)=>`${n} ${n===1?singular:plural}`;
export function catalogueBadges(record: RecordData) {
 const title={published:record.published===true,classification:String(record.classification),cover_image_id:record.cover_image_id??null,cover_rights_approved:record.cover_rights_approved===true};
 const labels:Record<string,string>={national_book_list_verified:'National Book List · verified',other_developed:'Other developed',unclassified:'Unclassified'};
 const reasons=[!title.published?'draft':'',title.classification!=='national_book_list_verified'?'classification restriction':'',!title.cover_rights_approved?'rights unapproved':''].filter(Boolean);
 return {labels:[!title.published?'Draft':isPubliclyListed(title)?'Published · Text eligible':'Published · Listing withheld',record.featured?'Catalogue featured':'Not featured',labels[title.classification]??'Unknown classification',!title.cover_image_id?'No cover added':coverIsPublic(title)?'Cover · Public eligible':'Cover · Admin only'],coverReason:title.cover_image_id&&!coverIsPublic(title)?reasons.join(', '):''};
}
export function sortedRecords(rows:RecordData[],sort:string,title:(row:RecordData)=>string) {
 const validDate=(v:unknown)=>typeof v==='string'&&Number.isFinite(Date.parse(v))?Date.parse(v):0;
 return [...rows].sort((a,b)=>{
  let result=0;
  if(sort==='updated') result=validDate(b.updated_at)-validDate(a.updated_at);
  else if(sort==='date') result=validDate(b.publish_date)-validDate(a.publish_date);
  else if(sort==='assigned') result=Number(b.title_count)-Number(a.title_count);
  else if(sort==='order') result=Number(a.sort_order??a.step_number??0)-Number(b.sort_order??b.step_number??0);
  if(result) return result;result=title(a).localeCompare(title(b));if(sort==='za')result=-result;
  return result||String(a.id??a.page??'').localeCompare(String(b.id??b.page??''));
 });
}
export function pageRecords(rows:RecordData[],page:number,size=24){const pages=Math.max(1,Math.ceil(rows.length/size));const current=Math.min(pages,Math.max(1,page));return{rows:rows.slice((current-1)*size,current*size),page:current,pages};}
