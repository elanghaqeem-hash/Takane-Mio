import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,mkdirSync,writeFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {baseline,missingSuites,verifySuite} from '../scripts/verify-suite.mjs';
function fixture(t,names=baseline){const root=mkdtempSync(join(tmpdir(),'mio-suite-'));t.after(()=>rmSync(root,{recursive:true,force:true}));mkdirSync(join(root,'tests'));for(const name of names)writeFileSync(join(root,'tests',name),'');return root;}
test('baseline inventory detects missing suites and tolerates extra files',()=>{assert.equal(baseline.length,52);assert.deepEqual(missingSuites([...baseline,'extra.test.mjs']),[]);assert.deepEqual(missingSuites(baseline.slice(1)),[baseline[0]]);});
test('missing suite and low Node version fail before subprocess',t=>{const run=()=>assert.fail('unexpected subprocess');assert.equal(verifySuite({root:fixture(t,[]),version:'24.0.0',run}).stage,'inventory');assert.equal(verifySuite({root:fixture(t),version:'22.16.0',run}).stage,'node-version');});
test('syntax failure blocks regression',t=>{let calls=0;const result=verifySuite({root:fixture(t),version:'24.0.0',run:()=>{calls++;return {status:1};}});assert.equal(result.ok,false);assert.equal(result.stage,'syntax');assert.equal(calls,1);});
test('regression failure or timeout is not a pass; both stages required',t=>{const root=fixture(t);let calls=[];const run=(_bin,args)=>{calls.push(args);return {status:0};};assert.equal(verifySuite({root,version:'24.0.0',run}).ok,true);assert.deepEqual(calls,[['scripts/check.mjs'],['--test']]);let i=0;assert.equal(verifySuite({root,version:'24.0.0',run:()=>++i===1?{status:0}:{status:null,error:new Error('timeout')}}).ok,false);});
