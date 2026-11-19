import test from 'node:test';
import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {mkdtempSync,rmSync,existsSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {createKnowledgeReader} from '../apps/desktop/knowledge.mjs';
function fixture(t){const dir=mkdtempSync(join(tmpdir(),'mio-knowledge-'));const path=join(dir,'memory.sqlite');const db=new DatabaseSync(path);db.exec('CREATE TABLE memory(id TEXT PRIMARY KEY,cluster TEXT,content TEXT,consent INTEGER); PRAGMA user_version=1;');t.after(()=>{db.close();rmSync(dir,{recursive:true,force:true});});return {db,path,dir};}
test('metadata only; consent filters and count exceeds render budget',t=>{const {db,path}=fixture(t);const insert=db.prepare('INSERT INTO memory VALUES(?,?,?,?)');insert.run('a','science','private body',1);insert.run('b','work','secret',1);insert.run('c','hidden','excluded',0);const reader=createKnowledgeReader(path,{limit:1});try{assert.deepEqual(reader.snapshot(),{available:true,total:2,records:[{id:'a',cluster:'science',authorized:true,indexed:true}]});}finally{reader.close();}});
test('subsequent snapshot reflects insert and deletion without restart',t=>{const {db,path}=fixture(t);const reader=createKnowledgeReader(path);try{assert.equal(reader.snapshot().total,0);db.prepare('INSERT INTO memory VALUES(?,?,?,?)').run('a','work','body',1);assert.equal(reader.snapshot().total,1);db.exec('DELETE FROM memory');assert.equal(reader.snapshot().total,0);}finally{reader.close();}assert.throws(()=>reader.snapshot());reader.close();});
test('missing database is not created and invalid limits rejected',t=>{const {dir,path}=fixture(t);const missing=join(dir,'absent.sqlite');assert.throws(()=>createKnowledgeReader(missing));assert.equal(existsSync(missing),false);assert.throws(()=>createKnowledgeReader(path,{limit:1201}));});
test('unsupported schema fails closed',t=>{const {db,path}=fixture(t);db.exec('PRAGMA user_version=2');assert.throws(()=>createKnowledgeReader(path));});
