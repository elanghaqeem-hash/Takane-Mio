export class ExecutionGate {
  #stopped=false; #active=new Set(); #authorize;
  constructor(authorize) { if(typeof authorize!=='function') throw new TypeError('Policy required'); this.#authorize=authorize; }
  get stopped(){return this.#stopped;}
  async execute(operation, handler) {
    if(this.#stopped || typeof handler!=='function' || this.#authorize(operation)!==true || this.#stopped) throw new Error('Execution denied');
    const controller=new AbortController(); this.#active.add(controller);
    try { const result=await handler(controller.signal); controller.signal.throwIfAborted(); return result; }
    finally { this.#active.delete(controller); }
  }
  stop(){this.#stopped=true; for(const controller of this.#active) controller.abort();}
}
