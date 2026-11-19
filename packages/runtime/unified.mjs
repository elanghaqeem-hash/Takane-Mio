import {AssistantRuntime} from './assistant.mjs';
import {GrantAuthority} from '../security/authority.mjs';
import {TaskScheduler} from '../automation/scheduler.mjs';
import {ProjectWorkspace} from '../project/workspace.mjs';
export class UnifiedRuntime {
 #assistant; #authority; #scheduler; #projects=new ProjectWorkspace(); #stopped=false; #busy=false; #clock;
 constructor({modelConfig,clock=Date.now}={}){this.#clock=clock;this.#assistant=new AssistantRuntime(modelConfig);this.#authority=new GrantAuthority(clock);this.#scheduler=new TaskScheduler({authority:this.#authority,clock});}
 status(){return {stopped:this.#stopped,busy:this.#busy,assistant:this.#assistant.status(),jobs:this.#scheduler.list()};}
 #guard(){if(this.#stopped||this.#busy)throw new Error('Unified runtime unavailable');}
 async #run(fn){this.#guard();this.#busy=true;try{const r=await fn();if(this.#stopped)throw new Error('Runtime stopped');return r;}finally{this.#busy=false;}}
 chat(text){return this.#run(()=>this.#assistant.chat(text));}
 plan(request){return this.#run(()=>this.#assistant.plan(request));}
 execute(id,options){return this.#run(()=>this.#assistant.execute(id,options));}
 authorizeAutomation({consent=false,ttlMs}={}){this.#guard();if(consent!==true)throw new Error('Consent required');return this.#authority.issue({scope:'internal:text',purpose:'analyze',level:0,ttlMs});}
 revokeAutomation(id){this.#guard();return this.#authority.revoke(id);}
 schedule(job){this.#guard();this.#scheduler.add(job);}
 tick(){return this.#run(()=>this.#scheduler.tick());}
 createProject(project){this.#guard();this.#projects.create(project);}
 addTask(id,task){this.#guard();this.#projects.addTask(id,task);}
 transitionTask(id,task,status){this.#guard();this.#projects.transition(id,task,status);}
 projectReport(id){this.#guard();return this.#projects.report(id,this.#clock());}
 stop(){if(this.#stopped)return;this.#stopped=true;this.#authority.stop();this.#scheduler.stop();this.#assistant.stop();}
}
