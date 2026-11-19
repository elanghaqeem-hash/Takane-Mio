import {ExecutionGate} from '../security/execution-gate.mjs';
import {authorize} from '../security/policy.mjs';
import {CoreState} from '../core/state.mjs';
export class AgentEngine{
 #registry; #core; #gate; #grants; #running=false; #approval; #autonomy;
 constructor({registry,core=new CoreState(),grants=[],approve=async()=>false,autonomy='A1'}={}){
  if(!registry||!['A0','A1'].includes(autonomy)||!Array.isArray(grants)||typeof approve!=='function')throw new TypeError('Invalid agent configuration');
  this.#registry=registry;this.#core=core;this.#grants=structuredClone(grants);this.#approval=approve;this.#autonomy=autonomy;
  this.#gate=new ExecutionGate(operation=>authorize({operation,grants:this.#grants,stopped:this.#core.snapshot.stopped}));
 }
 get status(){return this.#core.snapshot;}
 stop(){this.#gate.stop();this.#core.stop();}
 plan(steps){
  if(!Array.isArray(steps)||steps.length<1||steps.length>16)throw new TypeError('Invalid plan');
  return steps.map((step,i)=>{
   if(!step||typeof step.tool!=='string'||!step.args||typeof step.args!=='object'||Array.isArray(step.args))throw new TypeError('Invalid step');
   const t=this.#registry.get(step.tool),args=structuredClone(step.args);
   if(JSON.stringify(args).length>32000||!t.validate(args))throw new TypeError('Invalid tool arguments');
   return {index:i,tool:t.id,args};
  });
 }
 async execute(steps){
  if(this.#running||this.#core.snapshot.stopped)throw new Error('Agent unavailable');
  const plan=this.plan(steps);this.#running=true;const results=[];
  try{
   if(this.#autonomy==='A0')return {status:'PLAN_ONLY',plan};
   for(const step of plan){
    if(this.#core.snapshot.stopped)throw new Error('Agent stopped');
    const tool=this.#registry.get(step.tool);const operation={level:tool.level,scope:tool.scope,purpose:tool.purpose};
    if(tool.level>=3){this.#core.transition('WAITING_PERMISSION');if(await this.#approval(structuredClone({step,operation}))!==true)throw new Error('Approval denied');}
    if(this.#core.snapshot.stopped)throw new Error('Agent stopped');
    this.#core.transition('EXECUTING');
    const output=await this.#gate.execute(operation,signal=>tool.run(step.args,signal));
    results.push({index:step.index,tool:step.tool,output});
   }
   this.#core.transition('SUCCESS');return {status:'SUCCESS',results};
  }catch(e){if(!this.#core.snapshot.stopped)this.#core.transition('ERROR');return {status:this.#core.snapshot.stopped?'STOPPED':'FAILED',results,error:e instanceof Error?e.message:'Unknown error'};}
  finally{this.#running=false;}
 }
}
