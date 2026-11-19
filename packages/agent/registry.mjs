export class ToolRegistry {
 #tools=new Map();
 register({id,level,scope,purpose,validate,run}={}){
  if(typeof id!=='string'||!/^[a-z][a-z0-9.-]{0,63}$/.test(id)||this.#tools.has(id)||!Number.isInteger(level)||level<0||level>4||typeof scope!=='string'||!scope||typeof purpose!=='string'||!purpose||typeof validate!=='function'||typeof run!=='function')throw new TypeError('Invalid tool');
  this.#tools.set(id,Object.freeze({id,level,scope,purpose,validate,run}));
 }
 get(id){const tool=this.#tools.get(id);if(!tool)throw new Error('Unknown tool');return tool;}
 inventory(){return [...this.#tools.values()].map(({id,level,scope,purpose})=>({id,level,scope,purpose}));}
}
export function registerSafeTools(registry){
 registry.register({id:'text.length',level:0,scope:'internal:text',purpose:'analyze',validate:a=>typeof a?.text==='string'&&a.text.length<=16000,run:a=>({characters:[...a.text].length})});
 registry.register({id:'text.words',level:0,scope:'internal:text',purpose:'analyze',validate:a=>typeof a?.text==='string'&&a.text.length<=16000,run:a=>({words:a.text.trim()?a.text.trim().split(/\s+/u).length:0})});
 return registry;
}
