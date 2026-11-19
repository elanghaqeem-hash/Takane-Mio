import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,rmSync,readFileSync,existsSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {randomBytes} from 'node:crypto';
import {DatabaseSync} from 'node:sqlite';
import {EncryptedMemoryStore} from '../packages/memory/encrypted.mjs';
function fixture(t){const root=mkdtempSync(join(tmpdir(),'mio-encrypted-'));t.after(()=>rmSync(root,{recursive:true,force:true}));return {path:join(root,'sealed.sqlite'),key:randomBytes(32)};}
const data={kind:'semantic',cluster:'private-cluster',content:'confidential-synthetic-MIO',consent:true};
test('encrypted persistence and reopen; raw file excludes synthetic plaintext',t=>{const f=fixture(t);let s=new EncryptedMemoryStore(f.path,{key:f.key,create:true});const id=s.remember(data);s.close();assert.equal(readFileSync(f.path).includes(Buffer.from(data.content)),false);assert.equal(readFileSync(f.path).includes(Buffer.from(data.cluster)),false);s=new EncryptedMemoryStore(f.path,{key:f.key});assert.equal(s.search('synthetic',{consent:true})[0].id,id);s.close();});
test('explicit consent for read write delete and close',t=>{const f=fixture(t),s=new EncryptedMemoryStore(f.path,{key:f.key,create:true});assert.throws(()=>s.remember({...data,consent:false}));const id=s.remember(data);assert.throws(()=>s.search('MIO'));assert.throws(()=>s.forget(id));assert.equal(s.forget(id,{consent:true}),true);assert.deepEqual(s.search('MIO',{consent:true}),[]);s.close();assert.throws(()=>s.search('MIO',{consent:true}));});
test('wrong key cannot read or delete record',t=>{const f=fixture(t),s=new EncryptedMemoryStore(f.path,{key:f.key,create:true});const id=s.remember(data);s.close();const wrong=new EncryptedMemoryStore(f.path,{key:randomBytes(32)});assert.throws(()=>wrong.search('MIO',{consent:true}));assert.throws(()=>wrong.forget(id,{consent:true}));wrong.close();});
test('record swap detected by authenticated ID',t=>{const f=fixture(t),s=new EncryptedMemoryStore(f.path,{key:f.key,create:true});const a=s.remember(data),b=s.remember({...data,content:'another'});s.close();const db=new DatabaseSync(f.path);db.prepare('UPDATE sealed_memory SET payload=(SELECT payload FROM sealed_memory WHERE id=?) WHERE id=?').run(a,b);db.close();const s2=new EncryptedMemoryStore(f.path,{key:f.key});assert.throws(()=>s2.search('MIO',{consent:true}));s2.close();});
test('no implicit creation or migration of legacy database',t=>{const f=fixture(t);assert.throws(()=>new EncryptedMemoryStore(f.path,{key:f.key}));assert.equal(existsSync(f.path),false);const db=new DatabaseSync(f.path);db.exec('PRAGMA user_version=1');db.close();assert.throws(()=>new EncryptedMemoryStore(f.path,{key:f.key,create:true}));assert.throws(()=>new EncryptedMemoryStore(f.path,{key:f.key}));const check=new DatabaseSync(f.path);assert.equal(check.prepare('PRAGMA user_version').get().user_version,1);check.close();});
