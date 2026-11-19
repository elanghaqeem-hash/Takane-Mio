import {createHash} from 'node:crypto';
const digest=s=>createHash('sha256').update(s).digest('hex');
const clean=(s,n)=>{if(typeof s!=='string'||!s.trim()||s.length>n)throw new TypeError('Invalid text');return s.trim();};
export class ResearchEngine {
 #sources=new Map(); #claims=[];
 addSource({url,title,publisher,excerpt,primary=false,publishedAt=null}={}){
  const u=new URL(url);if(u.protocol!=='https:'||u.username||u.password)throw new Error('Invalid source URL');u.hash='';
  const data={url:u.href,title:clean(title,200),publisher:clean(publisher,150),excerpt:clean(excerpt,16000),primary:primary===true,publishedAt};
  if(publishedAt!==null&&(typeof publishedAt!=='string'||!Number.isFinite(Date.parse(publishedAt))))throw new TypeError('Invalid publication date');
  const id=digest(data.url+'\n'+data.excerpt);this.#sources.set(id,{id,...data,host:u.hostname,review:'UNVERIFIED'});return id;
 }
 addClaim({statement,sourceIds}={}){
  const text=clean(statement,2000);if(!Array.isArray(sourceIds)||!sourceIds.length||sourceIds.some(id=>!this.#sources.has(id)))throw new Error('Unknown evidence');
  const ids=[...new Set(sourceIds)];const hosts=new Set(ids.map(id=>this.#sources.get(id).host));
  const row={statement:text,sourceIds:ids,distinctHosts:hosts.size,status:'UNVERIFIED'};this.#claims.push(row);return structuredClone(row);
 }
 report(){return structuredClone({sources:[...this.#sources.values()],claims:this.#claims});}
 saveClaim(index,{memory,consent}={}){if(consent!==true)throw new Error('Explicit consent required');const claim=this.#claims[index];if(!claim)throw new Error('Unknown claim');const content=JSON.stringify({claim,sources:claim.sourceIds.map(id=>{const {url,title,publisher}=this.#sources.get(id);return {url,title,publisher};})});return memory.remember({kind:'semantic',cluster:'research',content,consent:true});}
}
