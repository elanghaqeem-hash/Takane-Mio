import test from 'node:test';
import assert from 'node:assert/strict';
import {ReviewedSession} from '../packages/agent/session.mjs';
const raw=JSON.stringify({steps:[{tool:'text.words',args:{text:'hello world'}}]});
const session=(output=raw)=>new ReviewedSession({model:'local',router:{async *stream(){yield output;}}});
test('review is separate, immutable and single-use',async()=>{const s=session();const p=await s.prepare('count');assert.equal(s.status.state,'WAITING_PERMISSION');p.steps[0].args.text='tampered';await assert.rejects(s.approve(p.id));const r=await s.approve(p.id,{confirmed:true});assert.equal(r.status,'SUCCESS');assert.deepEqual(r.results[0].output,{words:2});await assert.rejects(s.approve(p.id,{confirmed:true}));});
test('unknown tool and stale review rejected',async()=>{const s=session(raw.replace('text.words','shell.run'));await assert.rejects(s.prepare('count'));assert.equal(s.status.state,'ERROR');const a=session();const p=await a.prepare('count');await a.prepare('again');await assert.rejects(a.approve(p.id,{confirmed:true}));});
test('stop cancels planning and latches',async()=>{let release;const s=new ReviewedSession({model:'local',router:{async *stream(id,m,{signal}){await new Promise(resolve=>{release=resolve;});signal.throwIfAborted();yield raw;}}});const pending=s.prepare('count');s.stop();release();await assert.rejects(pending);assert.equal(s.status.state,'STOPPED');await assert.rejects(s.prepare('again'));});
test('stop invalidates pending approval',async()=>{const s=session();const p=await s.prepare('count');s.stop();await assert.rejects(s.approve(p.id,{confirmed:true}));});
