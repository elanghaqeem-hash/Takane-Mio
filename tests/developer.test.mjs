import test from 'node:test';
import assert from 'node:assert/strict';
import {inspectSource,dependencyInventory} from '../packages/developer/inspect.mjs';
const scan=source=>inspectSource({name:'app.js',source,consent:true});
test('heuristic findings and line numbers',()=>{const r=scan('const x=1;\neval(input);\nspawn(cmd);');assert.deepEqual(r.findings.map(x=>[x.rule,x.line]),[['DYNAMIC_EVAL',2],['PROCESS_EXECUTION',3]]);assert.equal(r.method,'HEURISTIC_ONLY');});
test('does not execute source or echo secret',()=>{const r=scan('const password="sensitive-value";\nthrow new Error("never run");');assert.equal(r.findings[0].rule,'SECRET_MARKER');assert.ok(!JSON.stringify(r).includes('sensitive-value'));});
test('hash deterministic and findings bounded',()=>{const s='eval(x);\n'.repeat(501);const a=scan(s);assert.equal(a.sha256,scan(s).sha256);assert.equal(a.findings.length,500);assert.equal(a.truncated,true);});
test('dependency inventory without leaking references',()=>{const r=dependencyInventory(JSON.stringify({dependencies:{a:'1.2.3',b:'https://private.example/token'},devDependencies:{c:'^2.0.0'}}),{consent:true});assert.deepEqual(r.dependencies.map(x=>x.versionKind),['EXACT','NON_EXACT_OR_REFERENCE','NON_EXACT_OR_REFERENCE']);assert.equal(r.verified,false);assert.ok(!JSON.stringify(r).includes('private.example'));});
test('invalid input and consent',()=>{assert.throws(()=>inspectSource({name:'x.js',source:''}));assert.throws(()=>inspectSource({name:'../x.js',source:'',consent:true}));assert.throws(()=>scan('x'.repeat(200001)));assert.throws(()=>dependencyInventory('{}'));assert.throws(()=>dependencyInventory('{"dependencies":[]}',{consent:true}));});
