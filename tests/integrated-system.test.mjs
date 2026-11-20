import test from 'node:test';
import assert from 'node:assert/strict';
import {UnifiedRuntime} from '../packages/runtime/unified.mjs';
test('integrated chat, memory, creative, scheduler and terminal stop',async()=>{
 const records=new Map();let closed=0,calls=0;
 const store={remember:r=>{records.set('id',r);return 'id';},search:q=>[...records.values()].filter(r=>r.content.includes(q)),forget:id=>records.delete(id),close:()=>closed++};
 const r=new UnifiedRuntime({modelConfig:{provider:'ollama',model:'fixture',fetchImpl:async(url,opts)=>{calls++;assert.equal(opts.credentials,'omit');return new Response('{"message":{"content":"local reply"},"done":true}\n');}},persistentMemory:store,clock:()=>1000});
 assert.equal(await r.chat('hello'),'local reply');assert.equal(records.size,0);
 assert.equal(r.remember({kind:'semantic',cluster:'project',content:'Mio'},{consent:true}),'id');
 assert.equal(r.recall('Mio',{consent:true}).length,1);
 const plan=await r.planMesh({shape:'box',dimensions:[1,2,3]},{consent:true});
 const result=await r.execute(plan.id,{approved:true});assert.equal(result.results[0].output.faces,12);assert.equal(calls,1);
 r.authorizeAutomation({consent:true,ttlMs:1000});r.schedule({id:'job',tool:'text.words',args:{text:'hello world'},dueAt:1000,consent:true});
 assert.equal((await r.tick())[0].status,'SUCCESS');assert.equal(r.forget('id',{consent:true}),true);
 const stop=r.stop();assert.equal(stop.dispatchComplete,true);assert.equal(stop.cleanupFailed,false);assert.equal(closed,1);assert.equal(r.status().assistant.state,'STOPPED');await assert.rejects(r.chat('again'));assert.throws(()=>r.recall('Mio',{consent:true}));
});
