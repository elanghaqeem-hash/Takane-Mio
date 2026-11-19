import {DatabaseSync} from 'node:sqlite';
import {createCipheriv,createDecipheriv,randomBytes,randomUUID} from 'node:crypto';
import {closeSync,openSync} from 'node:fs';
const aad=id=>Buffer.from('takane-mio:memory:v2:'+id);
function decrypt(key,id,blob){const b=Buffer.from(blob);if(b.length<29||b.length>100000)throw Error('Invalid sealed record');const d=createDecipheriv('aes-256-gcm',key,b.subarray(0,12));d.setAAD(aad(id));d.setAuthTag(b.subarray(12,28));return JSON.parse(Buffer.concat([d.update(b.subarray(28)),d.final()]).toString('utf8'));}
function encrypt(key,id,record){const iv=randomBytes(12),c=createCipheriv('aes-256-gcm',key,iv);c.setAAD(aad(id));const data=Buffer.concat([c.update(JSON.stringify(record),'utf8'),c.final()]);return Buffer.concat([iv,c.getAuthTag(),data]);}
export class EncryptedMemoryStore {
 #db;#key;#closed=false;
 constructor(path,{key,create=false}={}){
  if(typeof path!=='string'||!path||path===':memory:'||!Buffer.isBuffer(key)||key.length!==32)throw TypeError('Invalid encrypted store configuration');
  this.#key=Buffer.from(key);
  try{if(create===true)closeSync(openSync(path,'wx',0o600));else closeSync(openSync(path,'r+'));this.#db=new DatabaseSync(path);this.#db.exec('PRAGMA busy_timeout=1000; PRAGMA secure_delete=ON;');if(create===true)this.#db.exec('BEGIN; CREATE TABLE sealed_memory(id TEXT PRIMARY KEY, payload BLOB NOT NULL); PRAGMA user_version=2; COMMIT;');if(this.#db.prepare('PRAGMA user_version').get().user_version!==2)throw Error('Unsupported encrypted memory schema');this.#db.prepare('SELECT id,payload FROM sealed_memory LIMIT 0').all();}catch(e){this.#db?.close();this.#key.fill(0);throw e;}
 }
 #check(){if(this.#closed)throw Error('Encrypted store closed');}
 remember({kind,cluster,content,consent=false}={}){this.#check();if(consent!==true||!['episodic','semantic'].includes(kind)||typeof cluster!=='string'||!cluster.trim()||cluster.length>100||typeof content!=='string'||!content.trim()||content.length>16000)throw Error('Invalid memory or consent');const id=randomUUID(),record={kind,cluster,content,createdAt:Date.now()};this.#db.exec('BEGIN IMMEDIATE');try{if(this.#db.prepare('SELECT count(*) AS n FROM sealed_memory').get().n>=1000)throw Error('Memory limit');this.#db.prepare('INSERT INTO sealed_memory VALUES(?,?)').run(id,encrypt(this.#key,id,record));this.#db.exec('COMMIT');return id;}catch(e){this.#db.exec('ROLLBACK');throw e;}}
 search(query,{consent=false,limit=20}={}){this.#check();if(consent!==true||typeof query!=='string'||!query.trim()||query.length>200||!Number.isInteger(limit)||limit<1||limit>100)throw Error('Invalid search or consent');const rows=this.#db.prepare('SELECT id,payload FROM sealed_memory LIMIT 1001').all();if(rows.length>1000)throw Error('Memory limit');return rows.map(r=>({id:r.id,...decrypt(this.#key,r.id,r.payload)})).filter(r=>r.content.toLowerCase().includes(query.toLowerCase())).sort((a,b)=>b.createdAt-a.createdAt||a.id.localeCompare(b.id)).slice(0,limit);}
 forget(id,{consent=false}={}){this.#check();if(consent!==true||typeof id!=='string'||!id)throw Error('Deletion consent required');const row=this.#db.prepare('SELECT payload FROM sealed_memory WHERE id=?').get(id);if(!row)return false;decrypt(this.#key,id,row.payload);return this.#db.prepare('DELETE FROM sealed_memory WHERE id=?').run(id).changes===1;}
 close(){if(!this.#closed){this.#closed=true;try{this.#db.close();}finally{this.#key.fill(0);}}}
}
