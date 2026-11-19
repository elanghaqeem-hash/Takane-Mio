import {createHmac, timingSafeEqual} from 'node:crypto';
const zero='0'.repeat(64);
const kinds=new Set(['START','SUCCESS','FAILED','STOP','DENIED']);
function digest(key,row){return createHmac('sha256',key).update(JSON.stringify([row.seq,row.at,row.kind,row.tool,row.previous])).digest('hex');}
export class AuditTrail {
 #key; #rows=[];
 constructor(key){if(!Buffer.isBuffer(key)||key.length<32)throw new TypeError('Audit key must have at least 32 bytes');this.#key=Buffer.from(key);}
 append(kind,tool='agent'){if(!kinds.has(kind)||typeof tool!=='string'||!/^[a-z][a-z0-9.-]{0,63}$/.test(tool))throw new Error('Invalid audit metadata');const row={seq:this.#rows.length+1,at:Date.now(),kind,tool,previous:this.#rows.at(-1)?.mac??zero};row.mac=digest(this.#key,row);this.#rows.push(row);return {...row};}
 snapshot(){return this.#rows.map(r=>({...r}));}
 verify(rows,expectedCount,expectedHead){if(!Array.isArray(rows)||rows.length!==expectedCount||(rows.at(-1)?.mac??zero)!==expectedHead)return false;let previous=zero;for(let i=0;i<rows.length;i++){const r=rows[i];if(!r||r.seq!==i+1||r.previous!==previous||typeof r.mac!=='string'||!/^[a-f0-9]{64}$/.test(r.mac))return false;if(!timingSafeEqual(Buffer.from(r.mac,'hex'),Buffer.from(digest(this.#key,r),'hex')))return false;previous=r.mac;}return true;}
}
