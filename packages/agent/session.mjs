import {randomUUID} from 'node:crypto';
import {CoreState} from '../core/state.mjs';
import {ToolRegistry,registerSafeTools} from './registry.mjs';
import {AgentEngine} from './engine.mjs';
import {propose} from './advanced.mjs';
export class ReviewedSession {
 #core=new CoreState(); #registry=registerSafeTools(new ToolRegistry()); #router; #model; #pending=null; #busy=false; #abort=new AbortController(); #agent;
 constructor({router,model}={}){if(typeof router?.stream!=='function'||typeof model!=='string'||!model.trim())throw new TypeError('Model required');this.#router=router;this.#model=model;}
 get status(){return this.#core.snapshot;}
 async prepare(request){
  if(this.#busy||this.status.stopped)throw new Error('Session unavailable');
  this.#busy=true;this.#pending=null;
  try{this.#core.transition('THINKING');const steps=await propose({request,router:this.#router,model:this.#model,registry:this.#registry,signal:this.#abort.signal});this.#abort.signal.throwIfAborted();const review={id:randomUUID(),steps,expiresAt:Date.now()+60000};this.#pending=review;this.#core.transition('WAITING_PERMISSION');return structuredClone(review);}
  catch(e){if(!this.status.stopped)this.#core.transition('ERROR');throw e;}finally{this.#busy=false;}
 }
 async approve(id,{confirmed=false}={}){
  if(this.#busy||this.status.stopped||confirmed!==true||!this.#pending||this.#pending.id!==id||this.#pending.expiresAt<=Date.now())throw new Error('Approval denied');
  const {steps}=this.#pending;this.#pending=null;this.#busy=true;
  try{this.#agent=new AgentEngine({registry:this.#registry,core:this.#core,grants:[{level:0,scope:'internal:text',purpose:'analyze',expiresAt:Date.now()+60000}]});const result=await this.#agent.execute(steps);return this.status.stopped?{status:'STOPPED',results:[]}:result;}
  finally{this.#busy=false;this.#agent=undefined;}
 }
 stop(){this.#pending=null;this.#abort.abort();if(this.#agent)this.#agent.stop();else if(!this.status.stopped)this.#core.stop();}
}
