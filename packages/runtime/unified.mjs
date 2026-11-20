import {EmergencyStop} from '../core/emergency-stop.mjs';
import {AssistantRuntime} from './assistant.mjs';
import {GrantAuthority} from '../security/authority.mjs';
import {TaskScheduler} from '../automation/scheduler.mjs';
import {ProjectWorkspace} from '../project/workspace.mjs';
import {createMeshPreview} from './creative.mjs';
export class UnifiedRuntime {
 #assistant; #authority; #scheduler; #projects=new ProjectWorkspace(); #emergency=new EmergencyStop(); #busy=false; #clock;
 constructor({modelConfig,persistentMemory,clock=Date.now}={}){this.#clock=clock;this.#assistant=new AssistantRuntime(modelConfig,{persistentMemory});this.#authority=new GrantAuthority(clock);this.#scheduler=new TaskScheduler({authority:this.#authority,clock});this.#emergency.register('authority',()=>this.#authority.stop());this.#emergency.register('scheduler',()=>this.#scheduler.stop());this.#emergency.register('assistant',()=>this.#assistant.stop());}
 status(){return {stopped:this.#emergency.stopped,busy:this.#busy,assistant:this.#assistant.status(),jobs:this.#scheduler.list(),emergency:this.#emergency.status()};}
 #guard(){if(this.#emergency.stopped||this.#busy)throw new Error('Unified runtime unavailable');}
 async #run(fn){this.#guard();this.#busy=true;try{const r=await fn();if(this.#emergency.stopped)throw new Error('Runtime stopped');return r;}finally{this.#busy=false;}}
 chat(text){return this.#run(()=>this.#assistant.chat(text));}
 plan(request){return this.#run(()=>this.#assistant.plan(request));}
 planMesh(request,options){return this.#run(()=>this.#assistant.planMesh(request,options));}
 remember(record,options){this.#guard();return this.#assistant.remember(record,options);}
 recall(query,options){this.#guard();return this.#assistant.recall(query,options);}
 forget(id,options){this.#guard();return this.#assistant.forget(id,options);}
 execute(id,options){return this.#run(()=>this.#assistant.execute(id,options));}
 authorizeAutomation({consent=false,ttlMs}={}){this.#guard();if(consent!==true)throw new Error('Consent required');return this.#authority.issue({scope:'internal:text',purpose:'analyze',level:0,ttlMs});}
 revokeAutomation(id){this.#guard();return this.#authority.revoke(id);}
 schedule(job){this.#guard();this.#scheduler.add(job);}
 tick(){return this.#run(()=>this.#scheduler.tick());}
 previewMesh(request,options){return this.#run(()=>createMeshPreview(request,options));}
 createProject(project){this.#guard();this.#projects.create(project);}
 addTask(id,task){this.#guard();this.#projects.addTask(id,task);}
 transitionTask(id,task,status){this.#guard();this.#projects.transition(id,task,status);}
 projectReport(id){this.#guard();return this.#projects.report(id,this.#clock());}
 stop(){return this.#emergency.stop();}
}
