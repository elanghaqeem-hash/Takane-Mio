import test from 'node:test';
import assert from 'node:assert/strict';
import {domains,assessSecurity} from '../packages/reliability/security-acceptance.mjs';
const commit='a'.repeat(40),all=()=>domains.map(domain=>({domain,commit,status:'PASS',scope:'integrated-target',reference:'synthetic-review'}));
test('missing evidence blocks every domain',()=>assert.equal(assessSecurity({commit}).blockers.length,9));
test('all evidence requires review, never automatic acceptance',()=>assert.equal(assessSecurity({commit,evidence:all(),dependencyStatus:'REVIEW_REQUIRED'}).decision,'REVIEW_REQUIRED'));
test('failed domain or missing lock blocks review',()=>{const evidence=all();evidence[0].status='FAIL';assert.deepEqual(assessSecurity({commit,evidence,dependencyStatus:'BLOCKED'}).blockers,['runtime','dependency-preflight']);});
test('component-only or stale evidence rejected',()=>{for(const patch of [{scope:'unit'},{commit:'b'.repeat(40)},{reference:' '}]){const evidence=all();Object.assign(evidence[0],patch);assert.throws(()=>assessSecurity({commit,evidence}));}});
test('duplicate and unknown domains rejected',()=>{const evidence=all();assert.throws(()=>assessSecurity({commit,evidence:[evidence[0],evidence[0]]}));assert.throws(()=>assessSecurity({commit,evidence:[{...evidence[0],domain:'other'}]}));});
