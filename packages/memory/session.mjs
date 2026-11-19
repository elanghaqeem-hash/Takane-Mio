export class SessionMemory{
 #items=[];
 constructor({limit=32,maxChars=32000}={}){if(!Number.isInteger(limit)||limit<1||limit>64||!Number.isInteger(maxChars)||maxChars<1||maxChars>32000)throw new TypeError('Invalid limits');this.limit=limit;this.maxChars=maxChars;Object.freeze(this);}
 append(role,content){if(!['user','assistant'].includes(role)||typeof content!=='string'||!content.trim()||content.length>this.maxChars)throw new TypeError('Invalid message');this.#items.push({role,content});while(this.#items.length>this.limit||this.#items.reduce((n,x)=>n+x.content.length,0)>this.maxChars)this.#items.shift();}
 snapshot(){return this.#items.map(x=>({...x}));}
 clear(){this.#items=[];}
}
