import test from 'node:test';
import assert from 'node:assert/strict';
import {gates,assessRelease} from '../packages/reliability/release.mjs';
const commit='a'.repeat(40), row=gate=>({gate,status:'PASS',commit,reference:'artifact:'+gate});
test('missing evidence blocks release',()=>{const result=assessRelease({commit});assert.equal(result.decision,'BLOCKED');assert.equal(result.results.length,9);assert.ok(result.results.every(r=>r.status==='PENDING'));});
test('all passes still require independent review',()=>{assert.equal(assessRelease({commit,evidence:gates.map(row)}).decision,'REVIEW_REQUIRED');});
test('failure blocks even if all other gates pass',()=>{const evidence=gates.map(row);evidence[0].status='FAIL';assert.equal(assessRelease({commit,evidence}).decision,'BLOCKED');});
test('reject duplicate, stale, unknown or unsupported evidence',()=>{for(const evidence of [[row(gates[0]),row(gates[0])],[{...row(gates[0]),commit:'b'.repeat(40)}],[row('unknown')],[{...row(gates[0]),status:'SKIP'}],[{...row(gates[0]),reference:''}]])assert.throws(()=>assessRelease({commit,evidence}));});
