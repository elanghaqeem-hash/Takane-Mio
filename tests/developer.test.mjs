import test from 'node:test';
import assert from 'node:assert/strict';
import {inventory,inspectManifest,proposeReplacement,verifyReplacement} from '../packages/developer/review.mjs';
test('source inventory and hashes',()=>{const r=inventory([{path:'src/a.js',source:'a\nb'}]);assert.equal(r[0].lines,2);assert.equal(r[0].bytes,3);assert.match(r[0].sha256,/^[a-f0-9]{64}$/);});
test('invalid paths and duplicates',()=>{for(const path of ['../a','/a','C:\\a','a/../b'])assert.throws(()=>inventory([{path,source:'x'}]));assert.throws(()=>inventory([{path:'a',source:'x'},{path:'a',source:'y'}]));});
test('inventory bounds',()=>{assert.throws(()=>inventory([{path:'a',source:'x'.repeat(262145)}]));assert.throws(()=>inventory(Array.from({length:17},(_,i)=>({path:`a${i}`,source:'x'.repeat(262144)}))));});
test('dependency inventory without executing scripts',()=>{const r=inspectManifest(JSON.stringify({scripts:{postinstall:'danger'},dependencies:{a:'1.2.3',b:'^2.0.0'},devDependencies:{'@x/y':'3.0.0'}}));assert.deepEqual(r.dependencies.map(x=>x.exact),[true,false,true]);assert.throws(()=>inspectManifest('{"dependencies":[]}'));});
test('review consent and stale source',()=>{assert.throws(()=>proposeReplacement({path:'a',before:'x',after:'y'}));const p=proposeReplacement({path:'a',before:'x',after:'y',consent:true});assert.equal(p.status,'REVIEW_REQUIRED');assert.equal(verifyReplacement(p,'x'),true);assert.equal(verifyReplacement(p,'z'),false);assert.equal(verifyReplacement({...p,candidate:'z'},'x'),false);});
test('no-op and malformed proposal rejected',()=>{assert.throws(()=>proposeReplacement({path:'a',before:'x',after:'x',consent:true}));assert.equal(verifyReplacement(null,'x'),false);});
