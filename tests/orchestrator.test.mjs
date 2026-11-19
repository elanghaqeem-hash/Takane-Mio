import test from 'node:test';
import assert from 'node:assert/strict';
import {randomBytes} from 'node:crypto';
import {Orchestrator} from '../packages/core/orchestrator.mjs';
import {GrantAuthority} from '../packages/security/authority.mjs';
import {AuditTrail} from '../packages/security/audit.mjs';
const tools=[{id:'text.length',engine:'files',level:0,run:x=>x.length},{id:'math.double',engine:'compute',level:0,run:x=>x*2}];
function setup(list=tools){const authority=new GrantAuthority(),audit=new AuditTrail(randomBytes(32));const runtime=new Orchestrator({authority,audit,tools:list});return {runtime,authority,audit};}
const grant=(a,scope)=>a.issue({scope,purpose:'workflow',level:0,ttlMs:60000});
test('cross-engine workflow and audit chain',async()=>{const {runtime,authority,audit}=setup();for(const t of tools)grant(authority,t.id);assert.deepEqual(await runtime.execute([{tool:'text.length',input:'mio'},{tool:'math.double',from:0}]),[3,6]);const rows=audit.snapshot();assert.equal(rows.length,4);assert.ok(audit.verify(rows,4,rows.at(-1).mac));assert.equal(runtime.health().core.state,'SUCCESS');});
test('deny by default and stop downstream',async()=>{const {runtime,audit}=setup();await assert.rejects(runtime.execute([{tool:'text.length',input:'mio'},{tool:'math.double',from:0}]),/denied/);assert.deepEqual(audit.snapshot().map(r=>r.kind),['DENIED','FAILED']);});
test('revocation blocks downstream',async()=>{const {runtime,authority}=setup();grant(authority,'text.length');const token=grant(authority,'math.double');authority.revoke(token);await assert.rejects(runtime.execute([{tool:'text.length',input:'mio'},{tool:'math.double',from:0}]),/denied/);});
test('invalid workflow and unsafe tools rejected',async()=>{const {runtime}=setup();await assert.rejects(runtime.execute([{tool:'text.length',from:0}]),/Invalid/);assert.throws(()=>setup([{id:'unsafe',engine:'files',level:3,run:()=>0}]));});
test('concurrent execution and STOP suppress late result',async()=>{let release,started;const begin=new Promise(r=>started=r);const {runtime,authority}=setup([{id:'wait',engine:'compute',level:0,run:(_,signal)=>new Promise(resolve=>{release=()=>resolve(1);started(signal);})}]);grant(authority,'wait');const pending=runtime.execute([{tool:'wait'}]);const signal=await begin;await assert.rejects(runtime.execute([{tool:'wait'}]),/unavailable/);runtime.stop();assert.equal(signal.aborted,true);release();await assert.rejects(pending,{name:'AbortError'});assert.equal(runtime.health().core.state,'STOPPED');assert.equal(authority.allows({scope:'wait',purpose:'workflow',level:0}),false);});
