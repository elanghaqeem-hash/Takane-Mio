import {CoreState} from './state.mjs';
import {ExecutionGate} from '../security/execution-gate.mjs';
const id=x=>typeof x==='string'&&/^[a-z][a-z0-9.-]{0,63}$/.test(x);
export class Orchestrator {
 #core; #authority; #audit; #gate; #tools=new Map(); #busy=false; #runs=0;
 constructor({core=new CoreState(),authority,audit,tools}={}){
  if(!authority||!audit||!Array.isArray(tools)||tools.length>64)throw new TypeError('Invalid orchestration dependencies');
  this.#core=core;this.#authority=authority;this.#audit=audit;this.#gate=new ExecutionGate(op=>authority.allows(op));
  for(const t of tools){if(!t||!id(t.id)||!id(t.engine)||!Number.isInteger(t.level)||t.level<0||t.level>2||typeof t.run!=='function'||this.#tools.has(t.id))throw new TypeError('Invalid tool');this.#tools.set(t.id,Object.freeze({...t}));}
  core.subscribe(s=>{if(s.stopped){this.#gate.stop();this.#authority.stop();}});
 }
 inventory(){return [...this.#tools.values()].map(({id,engine,level})=>({id,engine,level}));}
 health(){return {core:this.#core.snapshot,busy:this.#busy,runs:this.#runs,registeredTools:this.#tools.size};}
 stop(){if(!this.#core.snapshot.stopped){this.#core.stop();this.#audit.append('STOP','orchestrator');}}
 async execute(steps){
  if(this.#busy||this.#core.snapshot.stopped)throw new Error('Runtime unavailable');
  if(!Array.isArray(steps)||steps.length<1||steps.length>16)throw new TypeError('Invalid workflow');
  const plan=steps.map((s,i)=>{if(!s||!this.#tools.has(s.tool)||!Number.isInteger(s.from??-1)||(s.from??-1)>=i||(s.from??-1)<-1)throw new TypeError('Invalid step');return {tool:s.tool,from:s.from??-1,input:structuredClone(s.input??null)};});
  this.#busy=true;this.#runs++;const outputs=[];let current='orchestrator';
  try{this.#core.transition('EXECUTING');for(const s of plan){current=s.tool;const t=this.#tools.get(current),op={scope:t.id,purpose:'workflow',level:t.level};if(!this.#authority.allows(op)){this.#audit.append('DENIED',current);throw new Error('Execution denied');}this.#audit.append('START',current);const output=await this.#gate.execute(op,signal=>t.run(structuredClone(s.from===-1?s.input:outputs[s.from]),signal));outputs.push(structuredClone(output));this.#audit.append('SUCCESS',current);}this.#core.transition('SUCCESS');return outputs;}
  catch(e){this.#audit.append('FAILED',current);if(!this.#core.snapshot.stopped)this.#core.transition('ERROR');throw e;}
  finally{this.#busy=false;}
 }
}
