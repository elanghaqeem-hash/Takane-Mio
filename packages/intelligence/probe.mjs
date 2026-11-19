const endpoints={ollama:'http://127.0.0.1:11434/api/tags',llamacpp:'http://127.0.0.1:8080/v1/models'};
export async function probeLocalModel({provider,model,fetchImpl=fetch,timeoutMs=5000,signal}={}){
 if(!Object.hasOwn(endpoints,provider)||typeof model!=='string'||!model.trim()||model.length>200||!Number.isInteger(timeoutMs)||timeoutMs<1||timeoutMs>30000)throw new TypeError('Invalid probe configuration');
 const timeout=AbortSignal.timeout(timeoutMs),combined=signal?AbortSignal.any([signal,timeout]):timeout;
 const result={provider,model,listed:false,inferenceVerified:false};
 try{combined.throwIfAborted();const response=await fetchImpl(endpoints[provider],{method:'GET',redirect:'error',signal:combined});if(!response.ok||!response.body)return {...result,status:'UNAVAILABLE'};
 const reader=response.body.getReader();let bytes=0;const chunks=[];try{while(true){combined.throwIfAborted();const r=await reader.read();combined.throwIfAborted();if(r.done)break;bytes+=r.value.byteLength;if(bytes>1048576)throw Error('Probe limit');chunks.push(r.value);}}finally{await reader.cancel().catch(()=>{});reader.releaseLock();}
 const data=JSON.parse(Buffer.concat(chunks).toString('utf8')),rows=provider==='ollama'?data.models:data.data;if(!Array.isArray(rows)||rows.length>10000)throw Error('Invalid inventory');
 const listed=rows.some(r=>provider==='ollama'?(r?.name===model||r?.model===model):r?.id===model);return {...result,listed,status:listed?'LISTED':'NOT_LISTED'};
 }catch{return {...result,status:combined.aborted?'ABORTED':'UNAVAILABLE'};}
}
