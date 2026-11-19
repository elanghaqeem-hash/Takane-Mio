import test from 'node:test';
import assert from 'node:assert/strict';
import {smokeLocalModel} from '../packages/intelligence/smoke.mjs';
const opts={provider:'ollama',model:'test',consent:true};
function token(req){return JSON.parse(req.body).messages[0].content.split(': ').at(-1);}
const frame=(content,done=true)=>JSON.stringify({message:{content},done})+'\n';
test('Ollama challenge matches complete stream without claiming offline or identity',async()=>{const r=await smokeLocalModel({...opts,fetchImpl:async(url,req)=>{assert.equal(url,'http://127.0.0.1:11434/api/chat');assert.equal(req.redirect,'error');return new Response(frame(token(req)));}});assert.equal(r.status,'CHALLENGE_MATCH');assert.equal(r.serverAuthenticated,false);assert.equal(r.offlineVerified,false);});
test('llama.cpp SSE challenge matches',async()=>{const r=await smokeLocalModel({...opts,provider:'llamacpp',fetchImpl:async(url,req)=>{assert.equal(url,'http://127.0.0.1:8080/v1/chat/completions');return new Response('data: '+JSON.stringify({choices:[{delta:{content:token(req)}}]})+'\n\ndata: [DONE]\n\n');}});assert.equal(r.status,'CHALLENGE_MATCH');});
test('wrong or empty answer does not pass',async()=>{for(const output of ['wrong',''])assert.equal((await smokeLocalModel({...opts,fetchImpl:async()=>new Response(frame(output))})).status,'CHALLENGE_MISMATCH');});
test('incomplete stream or HTTP error or excessive response fails',async()=>{for(const fetchImpl of [async(_u,req)=>new Response(frame(token(req),false)),async()=>new Response('',{status:503}),async()=>new Response(frame('x'.repeat(1025)))])assert.equal((await smokeLocalModel({...opts,fetchImpl})).status,'FAILED');});
test('consent and pre-aborted signal prevent network request',async()=>{const fetchImpl=async()=>assert.fail('unexpected request');await assert.rejects(smokeLocalModel({...opts,consent:false,fetchImpl}));const c=new AbortController();c.abort();assert.equal((await smokeLocalModel({...opts,signal:c.signal,fetchImpl})).status,'ABORTED');});
