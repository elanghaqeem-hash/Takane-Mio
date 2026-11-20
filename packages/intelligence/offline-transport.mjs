const routes=Object.freeze({
 ollama:Object.freeze({'http://127.0.0.1:11434/api/tags':'GET','http://127.0.0.1:11434/api/chat':'POST'}),
 llamacpp:Object.freeze({'http://127.0.0.1:8080/v1/models':'GET','http://127.0.0.1:8080/v1/chat/completions':'POST'})
});
export function createOfflineTransport({provider,fetchImpl=globalThis.fetch}={}){
 if(!Object.hasOwn(routes,provider)||typeof fetchImpl!=='function')throw TypeError('Invalid offline transport configuration');
 return async function guardedFetch(url,init={}){
  if(typeof url!=='string'||!Object.hasOwn(routes[provider],url)||init.method!==routes[provider][url])throw Error('Offline transport denied');
  init.signal?.throwIfAborted();
  const response=await fetchImpl(url,{...init,redirect:'error',credentials:'omit'});
  if(response.redirected|| (response.url&&response.url!==url)){
   await response.body?.cancel().catch(()=>{});
   throw Error('Offline transport redirect denied');
  }
  return response;
 };
}
