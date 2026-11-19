import {randomUUID} from 'node:crypto';
import {authorize} from './policy.mjs';
export class GrantAuthority {
 #grants=new Map(); #stopped=false; #clock;
 constructor(clock=Date.now){this.#clock=clock;}
 issue({scope,purpose,level,ttlMs,explicit=false}={}){
  if(this.#stopped||typeof scope!=='string'||!scope.trim()||typeof purpose!=='string'||!purpose.trim()||!Number.isInteger(level)||level<0||level>4||!Number.isInteger(ttlMs)||ttlMs<1||ttlMs>3600000||(level>=3&&explicit!==true))throw new Error('Grant denied');
  const id=randomUUID();this.#grants.set(id,{scope,purpose,level,explicit:explicit===true,expiresAt:this.#clock()+ttlMs});return id;
 }
 allows(operation){return authorize({operation,grants:[...this.#grants.values()],now:this.#clock(),stopped:this.#stopped});}
 revoke(id){return this.#grants.delete(id);}
 stop(){this.#stopped=true;this.#grants.clear();}
}
