import {parseUnambiguousJSON} from './strict-json.mjs';
const key=/^[a-z][a-z0-9.-]{0,63}$/;
export function parseProposal(raw,registry){
 if(typeof raw!=='string'||raw.length>32000)throw new TypeError('Invalid proposal');
 const p=parseUnambiguousJSON(raw);
 if(!p||Object.keys(p).length!==1||!Array.isArray(p.steps)||p.steps.length<1||p.steps.length>16)throw new TypeError('Invalid plan');
 return p.steps.map(s=>{
  if(!s||Object.keys(s).length!==2||typeof s.tool!=='string'||!key.test(s.tool)||!s.args||Object.getPrototypeOf(s.args)!==Object.prototype)throw new TypeError('Invalid step');
  if(!['text.length','text.words'].includes(s.tool))throw new Error('Tool or arguments denied');
  const t=registry.get(s.tool);
  if(t.id!==s.tool||t.level!==0||Object.keys(s.args).length!==1||typeof s.args.text!=='string'||s.args.text.length>16000||!t.validate(s.args))throw new Error('Tool or arguments denied');
  return {tool:t.id,args:{text:s.args.text}};
 });
}
export async function propose({request,router,model,registry,signal}={}){
 if(typeof request!=='string'||!request.trim()||request.length>8000)throw new TypeError('Invalid request');
 signal?.throwIfAborted();let raw='';
 for await(const chunk of router.stream(model,[{role:'system',content:'Return JSON only: {"steps":[{"tool":"text.words","args":{"text":"example"}}]}. Allowed tools text.words and text.length only. Do not execute.'},{role:'user',content:request}],{signal})){
  signal?.throwIfAborted();if(typeof chunk!=='string'||raw.length+chunk.length>32000)throw new Error('Invalid model output');raw+=chunk;
 }
 signal?.throwIfAborted();return parseProposal(raw,registry);
}
export class FeedbackLedger{
 #rows=new Map();
 record({taskId,rating,consent}={}){
  if(consent!==true||typeof taskId!=='string'||!key.test(taskId)||!Number.isInteger(rating)||rating<1||rating>5)throw new Error('Feedback denied');
  if(this.#rows.has(taskId)||this.#rows.size>=1000)throw new Error('Feedback limit or duplicate');
  this.#rows.set(taskId,rating);
 }
 summary(){const a=[...this.#rows.values()];return {count:a.length,average:a.length?a.reduce((x,y)=>x+y,0)/a.length:null};}
 forget(taskId){return this.#rows.delete(taskId);}
}
