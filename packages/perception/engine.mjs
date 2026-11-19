const MAX=16*1024*1024;
export function mediaDescriptor(kind,bytes){
 if(!['image','audio','video','screen'].includes(kind)||!(bytes instanceof Uint8Array)||!bytes.length||bytes.length>MAX)throw new TypeError('Invalid media');
 return {kind,size:bytes.length,trust:'UNVERIFIED'};
}
export class PerceptionEngine{
 #core;#adapters;#active=null;#disposed=false;#unsubscribe;
 constructor({core,adapters={}}){this.#core=core;this.#adapters=new Map(Object.entries(adapters));this.#unsubscribe=core.subscribe(s=>{if(s.stopped)this.#active?.abort();});}
 async analyze(kind,bytes,{consent=false}={}){
  if(consent!==true)throw new Error('Consent required');
  if(this.#disposed||this.#active||this.#core.snapshot.stopped)throw new Error('Perception unavailable');
  const meta=mediaDescriptor(kind,bytes),adapter=this.#adapters.get(kind);
  if(typeof adapter!=='function')throw new Error('Adapter unavailable');
  const controller=new AbortController();this.#active=controller;
  try{this.#core.transition('PROCESSING');const output=await adapter(Uint8Array.from(bytes),{signal:controller.signal});controller.signal.throwIfAborted();if(typeof output!=='string'||!output.trim()||output.length>16000)throw new Error('Invalid observation');this.#core.transition('IDLE');return {...meta,observation:output};}
  catch(e){if(!this.#core.snapshot.stopped)this.#core.transition('ERROR');throw e;}finally{this.#active=null;}
 }
 dispose(){this.#disposed=true;this.#active?.abort();this.#unsubscribe();}
}
export function fuseObservations(items){
 if(!Array.isArray(items)||!items.length||items.length>8)throw new TypeError('Invalid observations');
 return {trust:'UNVERIFIED',observations:items.map(x=>{if(!x||!['image','audio','video','screen'].includes(x.kind)||typeof x.observation!=='string'||!x.observation.trim()||x.observation.length>16000)throw new TypeError('Invalid observation');return {kind:x.kind,observation:x.observation};})};
}
