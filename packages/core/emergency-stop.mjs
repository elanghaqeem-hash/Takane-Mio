export class EmergencyStop {
 #handlers=[]; #stopped=false; #results=[]; #dispatching=false;
 register(name,handler){if(this.#stopped||typeof name!=='string'||!/^[a-z][a-z0-9-]{0,63}$/.test(name)||typeof handler!=='function'||this.#handlers.length>=32||this.#handlers.some(h=>h.name===name))throw Error('Invalid STOP handler');this.#handlers.push({name,handler});}
 get stopped(){return this.#stopped;}
 status(){return {stopped:this.#stopped,dispatching:this.#dispatching,dispatchComplete:this.#stopped&&!this.#dispatching,cleanupFailed:this.#results.some(r=>r.status==='FAILED'),results:this.#results.map(r=>({...r}))};}
 stop(){if(this.#stopped)return this.status();this.#stopped=true;this.#dispatching=true;try{for(const {name,handler} of this.#handlers){try{const result=handler();if(result&&typeof result.then==='function'){Promise.resolve(result).catch(()=>{});throw Error('Asynchronous STOP handler unsupported');}this.#results.push({name,status:'RETURNED'});}catch{this.#results.push({name,status:'FAILED'});}}}finally{this.#handlers=[];this.#dispatching=false;}return this.status();}
}
