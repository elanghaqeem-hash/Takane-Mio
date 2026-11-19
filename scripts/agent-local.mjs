import {ToolRegistry,registerSafeTools} from '../packages/agent/registry.mjs';
import {AgentEngine} from '../packages/agent/engine.mjs';
const text=process.argv.slice(2).join(' ');
if(!text){console.error('Usage: npm run agent:local -- "text"');process.exitCode=1;}else{
 const registry=registerSafeTools(new ToolRegistry());
 const agent=new AgentEngine({registry,grants:[{level:0,scope:'internal:text',purpose:'analyze',expiresAt:Date.now()+60000}]});
 process.once('SIGINT',()=>agent.stop());
 try{const result=await agent.execute([{tool:'text.length',args:{text}},{tool:'text.words',args:{text}}]);console.log(JSON.stringify(result,null,2));if(result.status!=='SUCCESS')process.exitCode=1;}catch(e){console.error(e.message);process.exitCode=1;}
}
