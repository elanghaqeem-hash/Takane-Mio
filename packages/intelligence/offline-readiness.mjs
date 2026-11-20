import {verifyRuntimeFile} from './runtime-identity.mjs';
import {assessLocalActivation} from './activation.mjs';
const routes=new Map([
 ['ollama',new Map([['http://127.0.0.1:11434/api/tags','GET'],['http://127.0.0.1:11434/api/chat','POST']])],
 ['llamacpp',new Map([['http://127.0.0.1:8080/v1/models','GET'],['http://127.0.0.1:8080/v1/chat/completions','POST']])]
]);
export function restrictLocalTransport(provider,transport=fetch){
 const allowed=routes.get(provider);
 if(!allowed||typeof transport!=='function')throw TypeError('Invalid local transport configuration');
 return async (url,options={})=>{
  if(typeof url!=='string'||allowed.get(url)!==options.method||options.redirect!=='error')throw Error('Local transport policy blocked request');
  options.signal?.throwIfAborted();
  return transport(url,{...options,redirect:'error'});
 };
}
export async function assessOfflineReadiness({provider,model,path,expectedSha256,consent=false,fetchImpl,signal}={}){
 if(consent!==true)throw Error('Explicit offline assessment consent required');
 const transport=restrictLocalTransport(provider,fetchImpl);
 const base={serverAuthenticated:false,offlineVerified:false,releaseApproved:false};
 const integrity=await verifyRuntimeFile({path,expectedSha256,consent:true,signal});
 if(integrity.status!=='DIGEST_MATCH_REVIEW_REQUIRED'||signal?.aborted)return {...base,integrity:integrity.status,activation:'NOT_RUN',decision:'BLOCKED'};
 const result=await assessLocalActivation({provider,model,consent:true,fetchImpl:transport,signal});
 return {...base,integrity:integrity.status,activation:result.decision,decision:result.decision==='REVIEW_REQUIRED'&&!signal?.aborted?'REVIEW_REQUIRED':'BLOCKED'};
}
