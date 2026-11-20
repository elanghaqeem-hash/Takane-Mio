const states=new Set(['IDLE','LISTENING','THINKING','PROCESSING','SPEAKING','EXECUTING','RESEARCHING','LEARNING','CREATING','WAITING_PERMISSION','WARNING','ERROR','RECOVERING','SUCCESS','SLEEP']);
export class CoreState {
 #listeners=new Set(); #state='IDLE'; #stopped=false; #revision=0;
 get snapshot(){return Object.freeze({state:this.#state,stopped:this.#stopped});}
 subscribe(fn){if(typeof fn!=='function')throw new TypeError('Invalid CORE listener');const entry={fn};this.#listeners.add(entry);return ()=>this.#listeners.delete(entry);}
 #publish(){const revision=++this.#revision,snapshot=this.snapshot;for(const entry of [...this.#listeners]){if(revision!==this.#revision)break;if(!this.#listeners.has(entry))continue;try{const result=entry.fn(snapshot);if(result&&typeof result.then==='function')Promise.resolve(result).catch(()=>{});}catch{/* Observer failure must not prevent STOP delivery. */}}}
 transition(next){if(this.#stopped||!states.has(next))throw new Error('Invalid or stopped transition');this.#state=next;this.#publish();}
 stop(){if(this.#stopped)return;this.#stopped=true;this.#state='STOPPED';this.#publish();}
}
