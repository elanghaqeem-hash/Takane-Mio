import {performance} from 'node:perf_hooks';
import {SessionMemory} from '../packages/memory/session.mjs';
class ReferenceMemory{
 #items=[];
 append(role,content){if(!['user','assistant'].includes(role)||typeof content!=='string'||!content.trim()||content.length>32000)throw new TypeError('Invalid message');this.#items.push({role,content});while(this.#items.length>64||this.#items.reduce((n,x)=>n+x.content.length,0)>32000)this.#items.shift();}
}
const inputs=Array.from({length:100000},(_,i)=>'x'.repeat(i%500+1));
function measure(make){const m=make();const start=performance.now();for(const content of inputs)m.append('user',content);return performance.now()-start;}
const ref=()=>new ReferenceMemory(),optimized=()=>new SessionMemory({limit:64,maxChars:32000});
measure(ref);measure(optimized);
const a=[],b=[];for(let i=0;i<7;i++){if(i%2){b.push(measure(optimized));a.push(measure(ref));}else{a.push(measure(ref));b.push(measure(optimized));}}
const median=x=>x.sort((a,b)=>a-b)[3];
console.log(JSON.stringify({node:process.version,platform:process.platform,operations:inputs.length,rounds:7,referenceMedianMs:median(a),optimizedMedianMs:median(b)},null,2));
