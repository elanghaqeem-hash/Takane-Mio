import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,rmSync,readFileSync,existsSync,mkdirSync,writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {randomBytes} from 'node:crypto';
import {createCheckpoint} from '../packages/recovery/checkpoint.mjs';
import {restoreToNewDirectory} from '../packages/recovery/restore.mjs';
function fixture(t){const root=mkdtempSync(join(tmpdir(),'mio-restore-'));t.after(()=>rmSync(root,{recursive:true,force:true}));const key=randomBytes(32),commit='a'.repeat(40),entries=[{name:'state.json',text:'{"state":"IDLE"}'},{name:'directive.md',text:'Takane MIO — pemulihan'}];return {root,output:join(root,'restore'),key,commit,entries,bytes:createCheckpoint({key,commit,entries,consent:true})};}
const options=f=>({key:f.key,expectedCommit:f.commit,output:f.output,consent:true});
test('encrypted checkpoint restores exact UTF-8 bytes and receipt',t=>{const f=fixture(t),r=restoreToNewDirectory(f.bytes,options(f));assert.equal(r.status,'RESTORED_TEXT_ONLY');for(const e of f.entries)assert.equal(readFileSync(join(f.output,e.name),'utf8'),e.text);assert.deepEqual(JSON.parse(readFileSync(join(f.output,'RESTORE_RECEIPT.json'),'utf8')),r);});
test('existing directory and files never overwritten',t=>{const f=fixture(t);mkdirSync(f.output);writeFileSync(join(f.output,'state.json'),'keep');assert.throws(()=>restoreToNewDirectory(f.bytes,options(f)));assert.equal(readFileSync(join(f.output,'state.json'),'utf8'),'keep');});
test('tampering and wrong key rejected before directory creation',t=>{const f=fixture(t),bad=Buffer.from(f.bytes);bad[bad.length-1]^=1;assert.throws(()=>restoreToNewDirectory(bad,options(f)));assert.throws(()=>restoreToNewDirectory(f.bytes,{...options(f),key:randomBytes(32)}));assert.equal(existsSync(f.output),false);});
test('wrong commit and missing consent rejected before disk write',t=>{const f=fixture(t);assert.throws(()=>restoreToNewDirectory(f.bytes,{...options(f),expectedCommit:'b'.repeat(40)}));assert.throws(()=>restoreToNewDirectory(f.bytes,{...options(f),consent:false}));assert.equal(existsSync(f.output),false);});
test('relative or noncanonical destination rejected',t=>{const f=fixture(t);for(const output of ['relative',f.root+'/../restore'])assert.throws(()=>restoreToNewDirectory(f.bytes,{...options(f),output}));assert.equal(existsSync(f.output),false);});
