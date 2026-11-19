import test from 'node:test';
import assert from 'node:assert/strict';
import { ExecutionGate } from '../packages/security/execution-gate.mjs';
test('denied operation never invokes handler',async()=>{const gate=new ExecutionGate(()=>false);let ran=false;await assert.rejects(gate.execute({},()=>{ran=true;}));assert.equal(ran,false);});
test('authorized operation returns actual result',async()=>{const gate=new ExecutionGate(()=>true);assert.equal(await gate.execute({},()=>42),42);});
test('stop aborts active signal, rejects late output and blocks new work',async()=>{const gate=new ExecutionGate(()=>true);let signal,finish;const work=gate.execute({},s=>{signal=s;return new Promise(r=>{finish=r;});});gate.stop();assert.equal(signal.aborted,true);finish(42);await assert.rejects(work,{name:'AbortError'});await assert.rejects(gate.execute({},()=>42));});
