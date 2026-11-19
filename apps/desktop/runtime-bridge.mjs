import {UnifiedRuntime} from '../../packages/runtime/unified.mjs';
export function createRuntimeBridge({provider,model,fetchImpl}={}){
 const configured=!!(provider||model);
 const runtime=configured?new UnifiedRuntime({modelConfig:{provider,model,...(fetchImpl?{fetchImpl}:{})}}):null;
 let stopped=false;
 const status=()=>{const s=runtime?.status();return {state:stopped?'STOPPED':s?.assistant.state??'IDLE',stopped,busy:s?.busy??false,modelConfigured:configured,modelVerified:false};};
 const stop=()=>{stopped=true;runtime?.stop();return status();};
 const chat=async text=>{if(stopped||!runtime)throw new Error('Local assistant unavailable');if(typeof text!=='string'||!text.trim()||text.length>8000)throw new Error('Invalid request');return runtime.chat(text);};
 return Object.freeze({status,stop,chat});
}
export function createDesktopDispatch({bridge,hardware,knowledge=()=>[]}={}){
 const routes=new Map([['mio:status',[0,bridge.status]],['mio:stop',[0,bridge.stop]],['mio:hardware',[0,hardware]],['mio:knowledge',[0,knowledge]],['mio:chat',[1,bridge.chat]]]);
 return (channel,args)=>{const route=routes.get(channel);if(!route||!Array.isArray(args)||args.length!==route[0])throw new Error('Invalid IPC request');return route[1](...args);};
}
