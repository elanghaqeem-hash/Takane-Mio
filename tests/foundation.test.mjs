import test from 'node:test';
import assert from 'node:assert/strict';
import { CoreState } from '../packages/core/state.mjs';
import { authorize } from '../packages/security/policy.mjs';
test('state event and irreversible stop in current instance',()=>{const c=new CoreState();const events=[];c.subscribe(s=>events.push(s.state));c.transition('THINKING');c.stop();assert.deepEqual(events,['THINKING','STOPPED']);assert.throws(()=>c.transition('IDLE'));});
test('deny by default, exact scope and expiry',()=>{const operation={level:2,scope:'project:a',purpose:'edit'};const g={...operation,expiresAt:100};assert.equal(authorize({operation}),false);assert.equal(authorize({operation,grants:[g],now:99}),true);assert.equal(authorize({operation,grants:[g],now:100}),false);assert.equal(authorize({operation:{...operation,scope:'project:b'},grants:[g],now:99}),false);});
test('critical requires explicit grant; restricted and stopped denied',()=>{const operation={level:4,scope:'project:a',purpose:'export'};const g={...operation,expiresAt:100};assert.equal(authorize({operation,grants:[g],now:99}),false);assert.equal(authorize({operation,grants:[{...g,explicit:true}],now:99}),true);assert.equal(authorize({operation:{...operation,level:5},grants:[{...g,level:5,explicit:true}],now:99}),false);assert.equal(authorize({operation,grants:[{...g,explicit:true}],now:99,stopped:true}),false);});
