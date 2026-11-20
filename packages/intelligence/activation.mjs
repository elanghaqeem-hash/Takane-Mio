import {probeLocalModel} from './probe.mjs';
import {smokeLocalModel} from './smoke.mjs';
import {createOfflineTransport} from './offline-transport.mjs';
export async function assessLocalActivation({provider,model,consent=false,fetchImpl,signal}={}){
 if(consent!==true)throw Error('Explicit activation consent required');
 if(!['ollama','llamacpp'].includes(provider)||typeof model!=='string'||!model.trim()||model.length>200)throw new TypeError('Invalid probe configuration');
 const options={provider,model,fetchImpl:createOfflineTransport({provider,fetchImpl}),signal};
 const inventory=await probeLocalModel(options);
 const base={provider,model,inventory:inventory.status,serverAuthenticated:false,offlineVerified:false};
 if(inventory.status!=='LISTED'||signal?.aborted)return {...base,decision:'BLOCKED',challenge:'NOT_RUN'};
 const smoke=await smokeLocalModel({...options,consent:true});
 return {...base,decision:smoke.status==='CHALLENGE_MATCH'&&!signal?.aborted?'REVIEW_REQUIRED':'BLOCKED',challenge:smoke.status};
}
