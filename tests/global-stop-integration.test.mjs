import test from 'node:test';
import assert from 'node:assert/strict';
import {UnifiedRuntime} from '../packages/runtime/unified.mjs';
import {TaskScheduler} from '../packages/automation/scheduler.mjs';
test('global stop rejects pending chat even if transport ignores abort',async()=>{
 let release,started;const ready=new Promise(r=>started=r);
 const runtime=new UnifiedRuntime({modelConfig:{provider:'ollama',model:'fixture',fetchImpl:()=>{started();return new Promise(r=>release=r);}}});
 const pending=runtime.chat('hello');await ready;runtime.stop();await assert.rejects(pending,/stopped/);
 assert.equal(runtime.status().stopped,true);assert.equal(runtime.status().assistant.state,'STOPPED');
 release(new Response('{"message":{"content":"late"},"done":true}\n'));await new Promise(r=>setImmediate(r));
 assert.equal(runtime.status().assistant.state,'STOPPED');await assert.rejects(runtime.chat('again'),/unavailable/);
});
test('stop before queued work begins prevents transport',async()=>{
 let calls=0;const runtime=new UnifiedRuntime({modelConfig:{provider:'ollama',model:'fixture',fetchImpl:()=>{calls++;}}});
 const pending=runtime.chat('hello');runtime.stop();await assert.rejects(pending,/stopped/);assert.equal(calls,0);
});
test('scheduler stop latches running and pending jobs without late success',async()=>{
 const scheduler=new TaskScheduler({authority:{allows:()=>true},clock:()=>1000});
 for(const id of ['a','b'])scheduler.add({id,tool:'text.words',args:{text:'hello'},dueAt:1000,consent:true});
 const pending=scheduler.tick();scheduler.stop();assert.deepEqual(scheduler.list().map(j=>j.status),['STOPPED','STOPPED']);
 const rows=await pending;assert.equal(rows[0].status,'STOPPED');await assert.rejects(scheduler.tick(),/unavailable/);
});
