import {createOfflineTransport} from './offline-transport.mjs';
const endpoints={ollama:'http://127.0.0.1:11434/api/chat',llamacpp:'http://127.0.0.1:8080/v1/chat/completions'};
export function validateMessages(messages){
  if(!Array.isArray(messages)||messages.length<1||messages.length>64)throw new TypeError('Invalid message count');
  let size=0;return messages.map(m=>{if(!m||!['user','assistant','system'].includes(m.role)||typeof m.content!=='string'||!m.content.trim())throw new TypeError('Invalid message');size+=m.content.length;if(size>32000)throw new RangeError('Context too large');return {role:m.role,content:m.content};});
}
export function createLocalAdapter({provider,model,fetchImpl=fetch,timeoutMs=120000}={}){
  if(!Object.hasOwn(endpoints,provider)||typeof model!=='string'||!model.trim()||model.length>200)throw new TypeError('Invalid local model configuration');
  if(!Number.isInteger(timeoutMs)||timeoutMs<1||timeoutMs>300000)throw new TypeError('Invalid timeout');
 const guardedFetch=createOfflineTransport({provider,fetchImpl});
  return Object.freeze({provider,model,async *stream(messages,{signal}={}){
    const timeout=AbortSignal.timeout(timeoutMs);const combined=signal?AbortSignal.any([signal,timeout]):timeout;
    combined.throwIfAborted();
    const response=await guardedFetch(endpoints[provider],{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({model,messages:validateMessages(messages),stream:true}),signal:combined,redirect:'error'});
    if(!response.ok||!response.body)throw new Error('Local model unavailable: HTTP '+response.status);
    const reader=response.body.getReader(),decoder=new TextDecoder();let buffer='',total=0,done=false,bytes=0,events=0;
    function parse(line){if(++events>16384)throw new RangeError('Stream event limit');const t=line.trim();if(!t)return null;if(provider==='llamacpp'){if(!t.startsWith('data:'))return null;const data=t.slice(5).trim();if(data==='[DONE]')return {done:true};const j=JSON.parse(data);if(j.error)throw new Error('Local model stream error');return {text:j.choices?.[0]?.delta?.content,done:false};}const j=JSON.parse(t);if(j.error)throw new Error('Local model stream error');return {text:j.message?.content,done:j.done===true};}
    function checked(text){if(typeof text!=='string')return '';total+=text.length;if(total>64000)throw new RangeError('Output too large');return text;}
    try{while(!done){combined.throwIfAborted();const chunk=await reader.read();combined.throwIfAborted();if(chunk.done)break;bytes+=chunk.value.byteLength;if(bytes>2097152)throw new RangeError('Stream byte limit');buffer+=decoder.decode(chunk.value,{stream:true});if(buffer.length>256000)throw new RangeError('Stream frame too large');let idx;while((idx=buffer.indexOf('\n'))>=0){const line=buffer.slice(0,idx);buffer=buffer.slice(idx+1);const event=parse(line);if(!event)continue;const text=checked(event.text);if(text)yield text;if(event.done){done=true;break;}}}if(!done){buffer+=decoder.decode();const event=parse(buffer);if(event){const text=checked(event.text);if(text)yield text;done=event.done;}}if(!done)throw new Error('Incomplete model stream');combined.throwIfAborted();}
    finally{await reader.cancel().catch(()=>{});reader.releaseLock();}
  }});
}
