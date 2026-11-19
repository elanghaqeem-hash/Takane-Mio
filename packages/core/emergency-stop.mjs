export class EmergencyStop {
 #handlers=[]; #stopped=false; #results=[];
 register(name,handler){if(this.#stopped||typeof name!=='string'||!/^[a-z][a-z0-9-]{0,63}$/.test(name)||typeof handler!=='function'||this.#handlers.length>=32||this.#handlers.some(h=>h.name===name))throw Error('Invalid STOP handler');this.#handlers.push({name,handler});}
 get stopped(){return this.#stopped;}
 status(){return {stopped:this.#stopped,results:this.#results.map(r=>({...r}))};}
 stop(){if(this.#stopped)return this.status();this.#stopped=true;for(const {name,handler} of this.#handlers){try{const result=handler();if(result&&typeof result.then==='function'){Promise.resolve(result).catch(()=>{});throw Error('Asynchronous STOP handler unsupported');}this.#results.push({name,status:'RETURNED'});}catch{this.#results.push({name,status:'FAILED'});}}this.#handlers=[];return this.status();}
}
