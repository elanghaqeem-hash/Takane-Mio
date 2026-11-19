import { DatabaseSync } from 'node:sqlite';
import { randomUUID } from 'node:crypto';
export class MemoryStore {
 #db;
 constructor(path=':memory:'){
  this.#db=new DatabaseSync(path);
  try{
   this.#db.exec('PRAGMA busy_timeout=5000; PRAGMA secure_delete=ON;');
   const version=this.#db.prepare('PRAGMA user_version').get().user_version;
   if(version===0){this.#db.exec("BEGIN; CREATE TABLE memory(id TEXT PRIMARY KEY,kind TEXT NOT NULL CHECK(kind IN ('episodic','semantic')),cluster TEXT NOT NULL,content TEXT NOT NULL,consent INTEGER NOT NULL CHECK(consent IN (0,1)),created_at INTEGER NOT NULL); CREATE INDEX memory_kind ON memory(kind); PRAGMA user_version=1; COMMIT;");}
   else if(version!==1)throw new Error('Unsupported schema version');
  }catch(e){this.#db.close();throw e;}
 }
 remember({kind,cluster,content,consent}={}){
  if(consent!==true)throw new Error('Explicit memory consent required');
  if(!['episodic','semantic'].includes(kind)||typeof cluster!=='string'||!cluster.trim()||cluster.length>100||typeof content!=='string'||!content.trim()||content.length>16000)throw new TypeError('Invalid memory');
  const id=randomUUID();this.#db.prepare('INSERT INTO memory VALUES(?,?,?,?,?,?)').run(id,kind,cluster.trim(),content,1,Date.now());return id;
 }
 search(query,{limit=20}={}){
  if(typeof query!=='string'||!query.trim()||query.length>200||!Number.isInteger(limit)||limit<1||limit>100)throw new TypeError('Invalid search');
  return this.#db.prepare('SELECT id,kind,cluster,content,created_at FROM memory WHERE consent=1 AND instr(lower(content),lower(?))>0 ORDER BY created_at DESC,id LIMIT ?').all(query,limit).map(r=>({...r}));
 }
 galaxy(){return this.#db.prepare('SELECT id,cluster FROM memory WHERE consent=1 ORDER BY id').all().map(r=>({id:r.id,cluster:r.cluster,indexed:true,authorized:true}));}
 forget(id){if(typeof id!=='string'||!id)throw new TypeError('Invalid id');return Number(this.#db.prepare('DELETE FROM memory WHERE id=?').run(id).changes)===1;}
 close(){this.#db.close();}
}
