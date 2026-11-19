import test from 'node:test';
import assert from 'node:assert/strict';
import {ApprovalVault} from '../packages/security/approval.mjs';
const steps=[{tool:'text.words',args:{text:'hello world'}}];
test('proposal snapshot isolated and approval single use',()=>{const v=new ApprovalVault(),p=v.issue(steps);p.steps[0].args.text='wrong';assert.deepEqual(v.consume(p.id,true),steps);assert.throws(()=>v.consume(p.id,true));});
test('wrong id and nonboolean consent cannot execute',()=>{const v=new ApprovalVault(),p=v.issue(steps);assert.throws(()=>v.consume('wrong',true));assert.throws(()=>v.consume(p.id,1));assert.equal(v.pending,true);});
test('expiry is exclusive and clears stale approval',()=>{let now=100;const v=new ApprovalVault({clock:()=>now}),p=v.issue(steps);now+=60000;assert.equal(v.pending,false);assert.throws(()=>v.consume(p.id,true));});
test('clock rollback fails closed permanently',()=>{let now=100;const v=new ApprovalVault({clock:()=>now}),p=v.issue(steps);now=99;assert.throws(()=>v.consume(p.id,true));now=101;assert.throws(()=>v.issue(steps));});
test('replacement and stop invalidate older reviews',()=>{const v=new ApprovalVault(),a=v.issue(steps),b=v.issue(steps);assert.throws(()=>v.consume(a.id,true));v.stop();assert.throws(()=>v.consume(b.id,true));assert.throws(()=>v.issue(steps));});
