import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,writeFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {createHash} from 'node:crypto';
import {restrictLocalTransport,assessOfflineReadiness} from '../packages/intelligence/offline-readiness.mjs';
test('only exact configured loopback routes, methods and redirect policy',async()=>{
 let calls=0;const f=restrictLocalTransport('ollama',async()=>{calls++;return new Response('{}');});
 for(const [url,method,redirect] of [['https://example.com','GET','error'],['http://localhost:11434/api/tags','GET','error'],['http://127.0.0.1:11434/api/tags?x=1','GET','error'],['http://127.0.0.1:11434/api/tags','POST','error'],['http://127.0.0.1:11434/api/tags','GET','follow'],['http://127.0.0.1:8080/v1/models','GET','error']])await assert.rejects(f(url,{method,redirect}),/blocked/);
 assert.equal(calls,0);await f('http://127.0.0.1:11434/api/tags',{method:'GET',redirect:'error'});assert.equal(calls,1);
});
async function fixture(t){const dir=await mkdtemp(join(tmpdir(),'mio-offline-'));t.after(()=>rm(dir,{recursive:true,force:true}));const path=join(dir,'runtime');await writeFile(path,'fixture');return {provider:'ollama',model:'test-model',path,expectedSha256:createHash('sha256').update('fixture').digest('hex'),consent:true};}
test('digest mismatch prevents all network requests',async t=>{
 const x=await fixture(t);let calls=0;const r=await assessOfflineReadiness({...x,expectedSha256:'0'.repeat(64),fetchImpl:async()=>{calls++;throw Error('unexpected');}});assert.equal(r.decision,'BLOCKED');assert.equal(r.activation,'NOT_RUN');assert.equal(calls,0);
});
test('simulated successful inference still requires review',async t=>{
 const x=await fixture(t);let calls=0;const r=await assessOfflineReadiness({...x,fetchImpl:async(url,opts)=>{calls++;if(opts.method==='GET')return Response.json({models:[{name:x.model}]});const token=JSON.parse(opts.body).messages[0].content.match(/MIO-[a-f0-9]+$/)[0];return new Response(JSON.stringify({message:{content:token},done:true})+'\n');}});assert.equal(calls,2);assert.deepEqual(r,{serverAuthenticated:false,offlineVerified:false,releaseApproved:false,integrity:'DIGEST_MATCH_REVIEW_REQUIRED',activation:'REVIEW_REQUIRED',decision:'REVIEW_REQUIRED'});
});
test('consent required before artifact or transport operation',async()=>{await assert.rejects(assessOfflineReadiness(),/consent/);});
test('pre-aborted assessment does not contact model',async t=>{const x=await fixture(t);let calls=0;const r=await assessOfflineReadiness({...x,signal:AbortSignal.abort(),fetchImpl:async()=>{calls++;}});assert.equal(r.decision,'BLOCKED');assert.equal(calls,0);});
