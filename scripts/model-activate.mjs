import {assessLocalActivation} from '../packages/intelligence/activation.mjs';
const [provider,model,approval,...extra]=process.argv.slice(2);
const controller=new AbortController();process.once('SIGINT',()=>controller.abort());
try{if(approval!=='--confirm-local-inference'||extra.length)throw Error('Usage: npm run model:activate -- PROVIDER MODEL --confirm-local-inference');const r=await assessLocalActivation({provider,model,consent:true,signal:controller.signal});console.log(JSON.stringify(r));if(r.decision==='BLOCKED')process.exitCode=1;}catch(e){console.error(e.message);process.exitCode=1;}
