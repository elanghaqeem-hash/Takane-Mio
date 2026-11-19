import { EventEmitter } from 'node:events';
export class CoreState {
  #events = new EventEmitter(); #state = 'IDLE'; #stopped = false;
  get snapshot() { return Object.freeze({state:this.#state, stopped:this.#stopped}); }
  subscribe(fn) { this.#events.on('state',fn); return () => this.#events.off('state',fn); }
  transition(next) {
    if (this.#stopped || !['IDLE','LISTENING','THINKING','PROCESSING','SPEAKING','EXECUTING','RESEARCHING','LEARNING','CREATING','WAITING_PERMISSION','WARNING','ERROR','RECOVERING','SUCCESS','SLEEP'].includes(next)) throw new Error('Invalid or stopped transition');
    this.#state=next; this.#events.emit('state',this.snapshot);
  }
  stop() { this.#stopped=true; this.#state='STOPPED'; this.#events.emit('state',this.snapshot); }
}
