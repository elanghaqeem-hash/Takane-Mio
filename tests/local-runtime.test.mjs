import test from 'node:test';
import assert from 'node:assert/strict';
import {createLocalAdapter,validateMessages} from '../packages/intelligence/local-runtime.mjs';
import {LocalRouter} from '../packages/intelligence/router.mjs';
const messages=[{role:'user',content:'hello'}];
async function collect(iter){let out='';for await(const t of iter)out+=t;return out;}
test('Ollama NDJSON streaming, loopback and no redirects',async()=>{const a=createLocalAdapter({provider:'ollama',model:'test',fetchImpl:async(url,opt)=>{assert.equal(url,'http://127.0.0.1:11434/api/chat');assert.equal(opt.redirect,'error');return new Response('{"message":{"content":"hi"},"done":false}\n{"done":true}\n');}});assert.equal(await collect(a.stream(messages)),'hi');});
test('llama.cpp SSE streaming',async()=>{const a=createLocalAdapter({provider:'llamacpp',model:'test',fetchImpl:async()=>new Response('data: {"choices":[{"delta":{"content":"hey"}}]}\n\ndata: [DONE]\n\n')});assert.equal(await collect(a.stream(messages)),'hey');});
test('external provider denied and invalid context rejected',()=>{assert.throws(()=>createLocalAdapter({provider:'https://example.com',model:'a'}));assert.throws(()=>validateMessages([{role:'tool',content:'x'}]));assert.throws(()=>validateMessages([{role:'user',content:'x'.repeat(32001)}]));});
test('incomplete stream fails',async()=>{const a=createLocalAdapter({provider:'ollama',model:'test',fetchImpl:async()=>new Response('{"message":{"content":"hi"}}\n')});await assert.rejects(collect(a.stream(messages)),/Incomplete/);});
test('router rejects unknown model and inventory is unverified',async()=>{const r=new LocalRouter();await assert.rejects(collect(r.stream('missing',messages)),/not configured/);r.register('a',createLocalAdapter({provider:'ollama',model:'test'}));assert.equal(r.inventory()[0].verified,false);});
test('abort propagates and denies output',async()=>{const c=new AbortController();c.abort();const a=createLocalAdapter({provider:'ollama',model:'test',fetchImpl:async()=>new Response('{"done":true}\n')});await assert.rejects(collect(a.stream(messages,{signal:c.signal})),{name:'AbortError'});});
