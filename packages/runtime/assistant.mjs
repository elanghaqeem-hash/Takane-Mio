import {registerCreativeTools} from './creative.mjs';
import {ApprovalVault} from '../security/approval.mjs';
import {CoreState} from '../core/state.mjs';
import {LocalRouter} from '../intelligence/router.mjs';
import {createLocalAdapter} from '../intelligence/local-runtime.mjs';
import {SessionMemory} from '../memory/session.mjs';
import {ToolRegistry,registerSafeTools} from '../agent/registry.mjs';
import {AgentEngine} from '../agent/engine.mjs';
import {propose} from '../agent/advanced.mjs';
export class AssistantRuntime{
 #core=new CoreState(); #router=new LocalRouter(); #memory=new SessionMemory({limit:30,maxChars:16000}); #registry=registerCreativeTools(registerSafeTools(new ToolRegistry())); #busy=false; #abort; #approval=new ApprovalVault(); #agent; #persistent; #stopStarted=false;
 constructor(config,{persistentMemory}={}){if(persistentMemory!==undefined&&(!persistentMemory||!['remember','search','forget','close'].every(k=>typeof persistentMemory[k]==='function')))throw new TypeError('Invalid persistent memory');this.#router.register('local',createLocalAdapter(config));this.#persistent=persistentMemory;}
 status(){return {...this.#core.snapshot,busy:this.#busy,models:this.#router.inventory(),pendingApproval:this.#approval.pending,persistentMemoryConfigured:!!this.#persistent};}
 #check(){if(this.#stopStarted||this.#busy||this.#core.snapshot.stopped)throw new Error('Runtime unavailable');}
 async #run(state,fn){this.#check();this.#busy=true;this.#abort=new AbortController();try{this.#core.transition(state);const result=await fn(this.#abort.signal);this.#abort.signal.throwIfAborted();this.#core.transition(this.#approval.pending?'WAITING_PERMISSION':'SUCCESS');return result;}catch(e){this.#approval.clear();if(!this.#core.snapshot.stopped)this.#core.transition('ERROR');throw e;}finally{this.#busy=false;this.#abort=undefined;}}
 async chat(text){this.#check();if(typeof text!=='string'||!text.trim()||text.length>8000)throw new TypeError('Invalid request');this.#approval.clear();return this.#run('THINKING',async signal=>{let answer='';for await(const part of this.#router.stream('local',[{role:'system',content:'You are MIO, a local assistant. Do not claim tool execution.'},...this.#memory.snapshot(),{role:'user',content:text}],{signal})){signal.throwIfAborted();answer+=part;if(answer.length>16000)throw new Error('Response limit');}signal.throwIfAborted();if(!answer.trim())throw new Error('Empty response');this.#memory.append('user',text);this.#memory.append('assistant',answer);return answer;});}
 async plan(request){this.#check();this.#approval.clear();return this.#run('THINKING',async signal=>{const steps=await propose({request,router:this.#router,model:'local',registry:this.#registry,signal});signal.throwIfAborted();return this.#approval.issue(steps);});}
 async planMesh(request,{consent=false}={}){this.#check();if(consent!==true)throw Error('Creative consent required');const args=structuredClone(request);if(!this.#registry.get('creative.mesh').validate(args))throw TypeError('Invalid mesh request');this.#approval.clear();return this.#run('CREATING',async signal=>{signal.throwIfAborted();return this.#approval.issue([{tool:'creative.mesh',args}]);});}
 async execute(id,{approved=false}={}){this.#check();const steps=this.#approval.consume(id,approved);return this.#run('EXECUTING',async signal=>{signal.throwIfAborted();this.#agent=new AgentEngine({registry:this.#registry,core:this.#core,grants:[{level:0,scope:'internal:text',purpose:'analyze',expiresAt:Date.now()+60000},...(steps.every(s=>s.tool==='creative.mesh')?[{level:0,scope:'internal:creative',purpose:'preview',expiresAt:Date.now()+60000}]:[])]});try{const result=await this.#agent.execute(steps);if(result.status!=='SUCCESS')throw new Error('Agent execution failed');return result;}finally{this.#agent=undefined;}});}
 #memoryAccess(consent){this.#check();if(consent!==true)throw Error('Explicit memory consent required');if(!this.#persistent)throw Error('Persistent memory not configured');return this.#persistent;}
 remember(record,{consent=false}={}){return this.#memoryAccess(consent).remember({...record,consent:true});}
 recall(query,{consent=false,limit=20}={}){return this.#memoryAccess(consent).search(query,{consent:true,limit});}
 forget(id,{consent=false}={}){return this.#memoryAccess(consent).forget(id,{consent:true});}
 history(){return this.#memory.snapshot();}
 clear(){this.#check();this.#memory.clear();this.#approval.clear();this.#core.transition('IDLE');}
 stop(){if(this.#stopStarted)return;this.#stopStarted=true;const store=this.#persistent;this.#persistent=undefined;const failures=[];for(const cleanup of [()=>this.#approval.stop(),()=>this.#core.stop(),()=>this.#abort?.abort(),()=>this.#agent?.stop(),()=>this.#memory.clear(),()=>store?.close()]){try{const result=cleanup();if(result&&typeof result.then==='function'){Promise.resolve(result).catch(()=>{});throw Error('Asynchronous cleanup unsupported');}}catch(e){failures.push(e);}}if(failures.length)throw new AggregateError(failures,'Assistant STOP cleanup failed');}
}
