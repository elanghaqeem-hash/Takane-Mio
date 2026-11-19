import {validateMessages} from './local-runtime.mjs';
export class LocalRouter{
  #models=new Map();
  register(id,adapter){if(typeof id!=='string'||!id.trim()||this.#models.has(id)||!adapter||typeof adapter.stream!=='function')throw new TypeError('Invalid model registration');this.#models.set(id,adapter);}
  inventory(){return [...this.#models].map(([id,a])=>({id,provider:a.provider,model:a.model,verified:false}));}
  async *stream(id,messages,options={}){const a=this.#models.get(id);if(!a)throw new Error('Model not configured');yield* a.stream(validateMessages(messages),options);}
}
