import test from 'node:test';
import assert from 'node:assert/strict';
import {selectRuntime} from './route-policy.mjs';
test('local always wins',()=>assert.deepEqual(selectRuntime({localReady:true,cloudAllowed:true,cloudReady:true}),{provider:'local',status:'ready'}));
test('cloud requires explicit opt-in',()=>assert.equal(selectRuntime({cloudReady:true}).provider,null));
test('opted-in cloud is optional',()=>assert.equal(selectRuntime({cloudAllowed:true,cloudReady:true}).provider,'openrouter'));
test('offline blocks cloud',()=>assert.equal(selectRuntime({offline:true,cloudAllowed:true,cloudReady:true}).provider,null));
test('missing provider fails closed',()=>assert.equal(selectRuntime().status,'unavailable'));
test('truthy strings do not authorize cloud',()=>assert.equal(selectRuntime({cloudAllowed:'true',cloudReady:true}).provider,null));
