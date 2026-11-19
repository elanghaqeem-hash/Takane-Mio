import test from 'node:test';
import assert from 'node:assert/strict';
import {EmergencyStop} from '../packages/core/emergency-stop.mjs';
test('latches before invoking handlers and runs once',()=>{const s=new EmergencyStop(),calls=[];s.register('authority',()=>{assert.equal(s.stopped,true);calls.push('authority');});s.register('assistant',()=>calls.push('assistant'));s.stop();s.stop();assert.deepEqual(calls,['authority','assistant']);});
test('failure isolated from remaining handlers',()=>{const s=new EmergencyStop();let stopped=false;s.register('first',()=>{throw Error('private');});s.register('second',()=>{stopped=true;});assert.deepEqual(s.stop().results,[{name:'first',status:'FAILED'},{name:'second',status:'RETURNED'}]);assert.equal(stopped,true);});
test('registration locked and status isolated',()=>{const s=new EmergencyStop();s.register('one',()=>{});assert.throws(()=>s.register('one',()=>{}));const r=s.stop();r.results[0].status='wrong';assert.equal(s.status().results[0].status,'RETURNED');assert.throws(()=>s.register('two',()=>{}));});
test('reentrant stop does not repeat cleanup',()=>{const s=new EmergencyStop();let calls=0;s.register('one',()=>{calls++;s.stop();});s.stop();assert.equal(calls,1);});
test('async handler flagged, remaining synchronous handler runs',()=>{const s=new EmergencyStop();let calls=0;s.register('async',async()=>{throw Error('async');});s.register('next',()=>{calls++;});assert.equal(s.stop().results[0].status,'FAILED');assert.equal(calls,1);});
