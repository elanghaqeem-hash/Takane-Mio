import test from 'node:test';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const cli=fileURLToPath(new URL('../scripts/model-activate.mjs',import.meta.url));
for(const [name,args,pattern] of [
 ['missing consent',['ollama','test-model'],/Usage:/],
 ['extra arguments',['ollama','test-model','--confirm-local-inference','extra'],/Usage:/],
 ['unknown provider',['not-supported','test-model','--confirm-local-inference'],/Invalid probe configuration/],
 ['empty model',['ollama','','--confirm-local-inference'],/Invalid probe configuration/],
 ['oversized model',['ollama','x'.repeat(201),'--confirm-local-inference'],/Invalid probe configuration/]
]) test(`activation CLI rejects ${name}`,()=>{
 const r=spawnSync(process.execPath,[cli,...args],{encoding:'utf8',timeout:10000,windowsHide:true});
 assert.ifError(r.error);assert.equal(r.signal,null);assert.equal(r.status,1);assert.equal(r.stdout,'');assert.match(r.stderr,pattern);
});
