import test from 'node:test';
import assert from 'node:assert/strict';
import {createLocalAdapter} from '../packages/intelligence/local-runtime.mjs';
import {probeLocalModel} from '../packages/intelligence/probe.mjs';
const cfg={provider:'ollama',model:'fixture'};
test('direct probe enforces guarded options',async()=>{
 const r=await probeLocalModel({...cfg,fetchImpl:async(url,opts)=>{
  assert.equal(url,'http://127.0.0.1:11434/api/tags');assert.equal(opts.redirect,'error');assert.equal(opts.credentials,'omit');
  return Response.json({models:[{name:'fixture'}]});
 }});assert.equal(r.status,'LISTED');
});
test('direct probe rejects redirected response',async()=>{
 const r=await probeLocalModel({...cfg,fetchImpl:async()=>({redirected:true})});assert.equal(r.status,'UNAVAILABLE');
});
test('direct chat enforces guarded options',async()=>{
 const a=createLocalAdapter({...cfg,fetchImpl:async(url,opts)=>{
  assert.equal(url,'http://127.0.0.1:11434/api/chat');assert.equal(opts.redirect,'error');assert.equal(opts.credentials,'omit');
  return new Response('{"message":{"content":"hi"},"done":true}\n');
 }});let output='';for await(const part of a.stream([{role:'user',content:'hello'}]))output+=part;assert.equal(output,'hi');
});
test('direct chat rejects redirected response before yielding',async()=>{
 const a=createLocalAdapter({...cfg,fetchImpl:async()=>({redirected:true})});
 await assert.rejects(async()=>{for await(const part of a.stream([{role:'user',content:'hello'}]))assert.fail(part);},/redirect denied/);
});
