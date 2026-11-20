import test from 'node:test';
import assert from 'node:assert/strict';
import {createCore} from './core.mjs';
test('independent instances and stop latch', () => {
  const a=createCore(), b=createCore();
  const old=a.begin();
  assert.throws(()=>a.begin(), /CORE_NOT_IDLE/);
  a.stop();
  assert.equal(old.aborted,true);
  assert.equal(b.status().state,'idle');
  assert.throws(()=>a.begin(), /CORE_NOT_IDLE/);
  a.reset(); const fresh=a.begin();
  assert.equal(a.finish(old),false);
  assert.equal(a.finish(fresh),true);
  assert.equal(a.status().runtime,'not_configured');
});
