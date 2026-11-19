import test from 'node:test';
import assert from 'node:assert/strict';
import {ResearchEngine} from '../packages/research/engine.mjs';
const source={url:'https://example.org/a',title:'Test',publisher:'Example',excerpt:'Fixture evidence'};
test('sources are unverified and duplicates deduplicated',()=>{const r=new ResearchEngine();assert.equal(r.addSource(source),r.addSource(source));assert.equal(r.report().sources.length,1);assert.equal(r.report().sources[0].review,'UNVERIFIED');});
test('rejects non HTTPS and credential URLs',()=>{const r=new ResearchEngine();for(const url of ['http://example.org','https://user:pass@example.org'])assert.throws(()=>r.addSource({...source,url}));});
test('distinct hosts are not truth verification',()=>{const r=new ResearchEngine();const a=r.addSource(source),b=r.addSource({...source,url:'https://example.net/a'});const c=r.addClaim({statement:'Claim',sourceIds:[a,a,b]});assert.equal(c.distinctHosts,2);assert.equal(c.status,'UNVERIFIED');assert.equal(c.sourceIds.length,2);});
test('unknown evidence denied',()=>{assert.throws(()=>new ResearchEngine().addClaim({statement:'Claim',sourceIds:['fake']}));});
test('save needs consent and preserves uncertainty',()=>{const r=new ResearchEngine();const id=r.addSource(source);r.addClaim({statement:'Claim',sourceIds:[id]});let saved;const memory={remember:x=>{saved=x;return 'id';}};assert.throws(()=>r.saveClaim(0,{memory}));assert.equal(r.saveClaim(0,{memory,consent:true}),'id');assert.equal(JSON.parse(saved.content).claim.status,'UNVERIFIED');});
