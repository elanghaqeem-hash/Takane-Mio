import {assessLocalActivation} from '../packages/intelligence/activation.mjs';
const [provider,model,approval,...extra]=process.argv.slice(2);
const controller=new AbortController();process.once('SIGINT',()=>controller.abort());
try {
 if(approval!=='--confirm-local-inference'||extra.length)throw Error('Usage: npm run model:activate -- PROVIDER MODEL --confirm-local-inference');
 const r=await assessLocalActivation({provider,model,consent:true,signal:controller.signal});
 console.log(JSON.stringify(r));
 // A matching challenge is not a release or activation approval.
 process.exitCode=controller.signal.aborted?130:r.decision==='REVIEW_REQUIRED'?2:1;
} catch(e){console.error(e.message);process.exitCode=controller.signal.aborted?130:1;}
