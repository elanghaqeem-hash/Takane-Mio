import {ExecutionGate} from '../security/execution-gate.mjs';
import {ToolRegistry,registerSafeTools} from '../agent/registry.mjs';
const idRE=/^[a-z][a-z0-9.-]{0,63}$/;
const time=n=>Number.isSafeInteger(n)&&n>=0;
export class TaskScheduler{
 #jobs=new Map();#history=[];#gate;#registry=registerSafeTools(new ToolRegistry());#clock;#busy=false;#stopped=false;
 constructor({authority,clock=Date.now}={}){if(typeof authority?.allows!=='function'||typeof clock!=='function')throw new TypeError('Authority required');this.#clock=clock;this.#gate=new ExecutionGate(op=>authority.allows(op));}
 add({id,tool,args,dueAt,intervalMs=null,dependsOn=[],consent=false}={}){
  if(this.#stopped||this.#busy||consent!==true||typeof id!=='string'||!idRE.test(id)||this.#jobs.has(id)||this.#jobs.size>=100||!time(dueAt)||!['text.words','text.length'].includes(tool)||!args||Object.keys(args).length!==1||typeof args.text!=='string'||!Array.isArray(dependsOn)||dependsOn.length>16||new Set(dependsOn).size!==dependsOn.length||dependsOn.some(d=>!this.#jobs.has(d)||this.#jobs.get(d).intervalMs!==null)||!(intervalMs===null||(Number.isSafeInteger(intervalMs)&&intervalMs>=1000&&intervalMs<=86400000)))throw new Error('Invalid job');
  const t=this.#registry.get(tool);if(!t.validate(args))throw new Error('Invalid arguments');
  this.#jobs.set(id,{id,tool,args:{text:args.text},dueAt,intervalMs,dependsOn:[...dependsOn],status:'PENDING',runs:0});
 }
 list(){return [...this.#jobs.values()].map(({args,...j})=>structuredClone(j));}
 history(){return structuredClone(this.#history);}
 cancel(id){if(this.#busy||this.#stopped)return false;const j=this.#jobs.get(id);if(!j||j.status!=='PENDING')return false;j.status='CANCELLED';return true;}
 async tick(){
  if(this.#busy||this.#stopped)throw new Error('Scheduler unavailable');
  const now=this.#clock();if(!time(now))throw new Error('Invalid clock');this.#busy=true;const outcomes=[];
  try{for(const j of this.#jobs.values()){
    if(this.#stopped)break;if(j.status!=='PENDING'||j.dueAt>now)continue;
    if(j.dependsOn.some(d=>['FAILED','DENIED','CANCELLED','BLOCKED','STOPPED'].includes(this.#jobs.get(d).status))){j.status='BLOCKED';this.#record(j,now,outcomes);continue;}
    if(j.dependsOn.some(d=>this.#jobs.get(d).status!=='SUCCESS'))continue;
    const t=this.#registry.get(j.tool);const op={level:t.level,scope:t.scope,purpose:t.purpose};j.status='RUNNING';
    let entered=false;
    try{await this.#gate.execute(op,signal=>{entered=true;signal.throwIfAborted();return t.run(j.args,signal);});j.status='SUCCESS';}
    catch{j.status=this.#stopped?'STOPPED':entered?'FAILED':'DENIED';}
    j.runs++;this.#record(j,now,outcomes);
    if(j.status==='SUCCESS'&&j.intervalMs!==null){const next=now+j.intervalMs;if(time(next)){j.dueAt=next;j.status='PENDING';}}
  }return outcomes;}finally{this.#busy=false;}
 }
 #record(j,at,out){const row={id:j.id,status:j.status,at,run:j.runs};this.#history.push(row);if(this.#history.length>1000)this.#history.shift();out.push({...row});}
 stop(){this.#stopped=true;this.#gate.stop();for(const j of this.#jobs.values())if(j.status==='PENDING')j.status='STOPPED';}
}
