export class SessionMemory{
 #items=[]; #chars=0;
 constructor({limit=32,maxChars=32000}={}){if(!Number.isInteger(limit)||limit<1||limit>64||!Number.isInteger(maxChars)||maxChars<1||maxChars>32000)throw new TypeError('Invalid limits');this.limit=limit;this.maxChars=maxChars;Object.freeze(this);}
 append(role,content){if(!['user','assistant'].includes(role)||typeof content!=='string'||!content.trim()||content.length>this.maxChars)throw new TypeError('Invalid message');this.#items.push({role,content});this.#chars+=content.length;while(this.#items.length>this.limit||this.#chars>this.maxChars)this.#chars-=this.#items.shift().content.length;}
 snapshot(){return this.#items.map(x=>({...x}));}
 clear(){this.#items=[];this.#chars=0;}
}
