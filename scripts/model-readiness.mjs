import {assessOfflineReadiness} from '../packages/intelligence/offline-readiness.mjs';
const [provider,model,path,expectedSha256,approval,...extra]=process.argv.slice(2);
const controller=new AbortController();process.once('SIGINT',()=>controller.abort());
try{
 if(!['ollama','llamacpp'].includes(provider)||typeof model!=='string'||!model.trim()||model.length>200||approval!=='--confirm-local-inference'||extra.length)throw Error('Usage: npm run model:readiness -- PROVIDER MODEL ABSOLUTE_RUNTIME_PATH SHA256 --confirm-local-inference');
 const result=await assessOfflineReadiness({provider,model,path,expectedSha256,consent:true,signal:controller.signal});
 console.log(JSON.stringify(result));process.exitCode=controller.signal.aborted?130:result.decision==='REVIEW_REQUIRED'?2:1;
}catch(e){console.error(e.message);process.exitCode=controller.signal.aborted?130:1;}
