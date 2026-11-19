import {randomUUID} from 'node:crypto';
import {authorize} from './policy.mjs';
export class GrantAuthority {
 #grants=new Map(); #stopped=false; #clock; #last=-1;
 constructor(clock=Date.now){if(typeof clock!=='function')throw new TypeError('Invalid clock');this.#clock=clock;}
 #now(){if(this.#stopped)return null;let now;try{now=this.#clock();}catch{this.stop();return null;}if(!Number.isSafeInteger(now)||now<0||now<this.#last){this.stop();return null;}this.#last=now;for(const [id,g] of this.#grants)if(g.expiresAt<=now)this.#grants.delete(id);return now;}
 issue({scope,purpose,level,ttlMs,explicit=false}={}){
  if(this.#stopped||typeof scope!=='string'||!scope.trim()||scope.length>256||typeof purpose!=='string'||!purpose.trim()||purpose.length>256||!Number.isInteger(level)||level<0||level>4||!Number.isInteger(ttlMs)||ttlMs<1||ttlMs>3600000||(level>=3&&explicit!==true))throw new Error('Grant denied');
  const now=this.#now();if(now===null||this.#grants.size>=256||!Number.isSafeInteger(now+ttlMs))throw new Error('Grant denied');
  const id=randomUUID();this.#grants.set(id,{scope,purpose,level,explicit:explicit===true,expiresAt:now+ttlMs});return id;
 }
 allows(operation){const now=this.#now();return now!==null&&authorize({operation,grants:[...this.#grants.values()],now,stopped:this.#stopped});}
 revoke(id){return this.#grants.delete(id);}
 stop(){this.#stopped=true;this.#grants.clear();}
}
