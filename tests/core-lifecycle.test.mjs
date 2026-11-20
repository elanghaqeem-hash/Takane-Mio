import test from 'node:test';
import assert from 'node:assert/strict';
import {CoreState} from '../packages/core/state.mjs';
test('STOP terminal and idempotent',()=>{const c=new CoreState(),seen=[];c.subscribe(s=>seen.push(s.state));c.stop();c.stop();assert.deepEqual(seen,['STOPPED']);assert.throws(()=>c.transition('IDLE'));});
test('observer failure does not prevent other stop handlers',()=>{const c=new CoreState();let stopped=false;c.subscribe(()=>{throw Error('observer');});c.subscribe(s=>{stopped=s.stopped;});c.stop();assert.equal(stopped,true);});
test('reentrant STOP prevents stale notifications',()=>{const c=new CoreState(),seen=[];c.subscribe(s=>{if(s.state==='EXECUTING')c.stop();});c.subscribe(s=>seen.push(s.state));c.transition('EXECUTING');assert.deepEqual(seen,['STOPPED']);});
test('unsubscribe and immutable snapshot',()=>{const c=new CoreState();let count=0;const off=c.subscribe(()=>count++);c.transition('THINKING');off();c.transition('SUCCESS');assert.equal(count,1);assert.ok(Object.isFrozen(c.snapshot));});
test('async observer rejection does not escape',async()=>{const c=new CoreState();c.subscribe(async()=>{throw Error('async observer');});c.stop();await new Promise(r=>setImmediate(r));assert.equal(c.snapshot.stopped,true);});
