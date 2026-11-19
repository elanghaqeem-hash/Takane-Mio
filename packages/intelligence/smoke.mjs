import {createLocalAdapter} from './local-runtime.mjs';
import {randomBytes} from 'node:crypto';
export async function smokeLocalModel({provider,model,fetchImpl,timeoutMs=60000,signal,consent=false}={}){
 if(consent!==true)throw new Error('Explicit inference consent required');
 const adapter=createLocalAdapter({provider,model,timeoutMs,...(fetchImpl?{fetchImpl}:{})});
 const token='MIO-'+randomBytes(8).toString('hex'),start=performance.now();
 let output='';const base={provider,model,serverAuthenticated:false,offlineVerified:false};
 try{signal?.throwIfAborted();for await(const chunk of adapter.stream([{role:'user',content:'Reply with exactly this text and nothing else: '+token}],{signal})){output+=chunk;if(output.length>1024)throw Error('Smoke output limit');}signal?.throwIfAborted();return {...base,status:output.trim()===token?'CHALLENGE_MATCH':'CHALLENGE_MISMATCH',elapsedMs:Math.round(performance.now()-start)};}catch{return {...base,status:signal?.aborted?'ABORTED':'FAILED',elapsedMs:Math.round(performance.now()-start)};}
}
