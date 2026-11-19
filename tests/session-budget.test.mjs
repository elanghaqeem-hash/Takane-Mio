import test from 'node:test';
import assert from 'node:assert/strict';
import {SessionMemory} from '../packages/memory/session.mjs';
test('incremental budget matches reference across varied messages',()=>{const m=new SessionMemory({limit:7,maxChars:120});let ref=[];for(let i=0;i<1000;i++){const role=i%2?'assistant':'user',content='x'.repeat(i%119+1);m.append(role,content);ref.push({role,content});while(ref.length>7||ref.reduce((n,x)=>n+x.content.length,0)>120)ref.shift();assert.deepEqual(m.snapshot(),ref);}});
test('clear resets budget and snapshots are independent',()=>{const m=new SessionMemory({limit:4,maxChars:5});m.append('user','12345');m.clear();m.append('assistant','ab');m.append('user','xyz');const s=m.snapshot();s[0].content='corrupt';assert.deepEqual(m.snapshot(),[{role:'assistant',content:'ab'},{role:'user',content:'xyz'}]);});
test('invalid input does not consume budget',()=>{const m=new SessionMemory({maxChars:5});m.append('user','abc');assert.throws(()=>m.append('system','z'));assert.throws(()=>m.append('user','abcdef'));m.append('assistant','de');assert.equal(m.snapshot().length,2);});
