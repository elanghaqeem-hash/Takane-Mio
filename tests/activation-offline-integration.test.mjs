import test from 'node:test';
import assert from 'node:assert/strict';
import {assessLocalActivation} from '../packages/intelligence/activation.mjs';
const config={provider:'ollama',model:'fixture',consent:true};
test('activation uses guarded settings for both requests',async()=>{
 const seen=[];
 const r=await assessLocalActivation({...config,fetchImpl:async(url,opts)=>{
  seen.push([url,opts.method,opts.redirect,opts.credentials]);
  if(opts.method==='GET')return Response.json({models:[{name:'fixture'}]});
  const token=JSON.parse(opts.body).messages[0].content.split(' ').at(-1);
  return new Response(JSON.stringify({message:{content:token},done:true})+'\n');
 }});
 assert.deepEqual(seen,[['http://127.0.0.1:11434/api/tags','GET','error','omit'],['http://127.0.0.1:11434/api/chat','POST','error','omit']]);
 assert.equal(r.decision,'REVIEW_REQUIRED');assert.equal(r.offlineVerified,false);assert.equal(r.serverAuthenticated,false);
});
test('redirected inventory response blocks challenge',async()=>{
 let calls=0;const r=await assessLocalActivation({...config,fetchImpl:async()=>{calls++;return {redirected:true};}});
 assert.equal(calls,1);assert.equal(r.decision,'BLOCKED');assert.equal(r.challenge,'NOT_RUN');
});
test('redirected inference response blocks activation',async()=>{
 const r=await assessLocalActivation({...config,fetchImpl:async(url,opts)=>opts.method==='GET'?Response.json({models:[{name:'fixture'}]}):{redirected:true}});
 assert.equal(r.decision,'BLOCKED');assert.equal(r.challenge,'FAILED');
});
test('invalid provider preserves CLI validation contract',async()=>{
 await assert.rejects(assessLocalActivation({...config,provider:'invalid',fetchImpl:()=>assert.fail('unexpected transport')}),/Invalid probe configuration/);
});
