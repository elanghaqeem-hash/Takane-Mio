import {randomUUID} from 'node:crypto';
export class ApprovalVault {
 #pending=null;#clock;#last=-1;#stopped=false;
 constructor({clock=()=>performance.now()}={}){if(typeof clock!=='function')throw TypeError('Invalid approval clock');this.#clock=clock;}
 #now(){if(this.#stopped)throw Error('Approval unavailable');let now;try{now=this.#clock();}catch{this.stop();throw Error('Approval clock failed');}if(!Number.isFinite(now)||now<0||now<this.#last||now>Number.MAX_SAFE_INTEGER-60000){this.stop();throw Error('Approval clock invalid');}this.#last=now;return now;}
 issue(steps){this.clear();const now=this.#now();if(!Array.isArray(steps)||steps.length<1||steps.length>16)throw Error('Invalid approval plan');const copy=structuredClone(steps);if(JSON.stringify(copy).length>32000)throw Error('Approval plan limit');const expiresAt=Date.now()+60000;const review={id:randomUUID(),steps:copy,expiresAt};this.#pending={review,deadline:now+60000};return structuredClone(review);}
 get pending(){if(!this.#pending)return false;try{if(this.#now()>=this.#pending.deadline)this.clear();}catch{return false;}return !!this.#pending;}
 consume(id,confirmed){if(!this.pending||confirmed!==true||this.#pending.review.id!==id)throw Error('Approval denied');const steps=this.#pending.review.steps;this.clear();return structuredClone(steps);}
 clear(){this.#pending=null;}
 stop(){this.clear();this.#stopped=true;}
}
