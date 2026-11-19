import {DatabaseSync} from 'node:sqlite';
export function createKnowledgeReader(path,{limit=1200}={}){
 if(typeof path!=='string'||!path||!Number.isInteger(limit)||limit<1||limit>1200)throw new TypeError('Invalid knowledge configuration');
 const db=new DatabaseSync(path,{readOnly:true});let closed=false;
 try{db.exec('PRAGMA busy_timeout=1000; PRAGMA query_only=ON;');if(db.prepare('PRAGMA user_version').get().user_version!==1)throw Error('Unsupported schema');}catch(e){db.close();throw e;}
 function snapshot(){if(closed)throw Error('Knowledge reader closed');db.exec('BEGIN');try{const total=db.prepare('SELECT count(*) AS n FROM memory WHERE consent=1').get().n;const records=db.prepare('SELECT id,cluster FROM memory WHERE consent=1 ORDER BY id LIMIT ?').all(limit).map(r=>({id:r.id,cluster:r.cluster,authorized:true,indexed:true}));db.exec('COMMIT');return {available:true,total,records};}catch(e){db.exec('ROLLBACK');throw e;}}
 function close(){if(!closed){closed=true;db.close();}}
 return Object.freeze({snapshot,close});
}
