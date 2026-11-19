import {smokeLocalModel} from '../packages/intelligence/smoke.mjs';
const [provider,model,approval,...extra]=process.argv.slice(2);
const controller=new AbortController();process.once('SIGINT',()=>controller.abort());
try{if(approval!=='--confirm-local-inference'||extra.length)throw Error('Usage: npm run model:smoke -- PROVIDER MODEL --confirm-local-inference');const result=await smokeLocalModel({provider,model,consent:true,signal:controller.signal});console.log(JSON.stringify(result));if(result.status!=='CHALLENGE_MATCH')process.exitCode=1;}catch(e){console.error(e.message);process.exitCode=1;}
