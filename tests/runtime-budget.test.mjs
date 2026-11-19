import test from 'node:test';
import assert from 'node:assert/strict';
import {createLocalAdapter} from '../packages/intelligence/local-runtime.mjs';
const messages=[{role:'user',content:'hello'}];
const adapter=(fetchImpl,provider='ollama')=>createLocalAdapter({provider,model:'test',fetchImpl});
async function collect(a,signal){let out='';for await(const text of a.stream(messages,{signal}))out+=text;return out;}
function response(chunks){return new Response(new ReadableStream({pull(controller){if(chunks.length)controller.enqueue(new TextEncoder().encode(chunks.shift()));else controller.close();}}));}
test('pre-aborted request never invokes transport',async()=>{const c=new AbortController();c.abort();let calls=0;await assert.rejects(collect(adapter(async()=>{calls++;return new Response('');}),c.signal),{name:'AbortError'});assert.equal(calls,0);});
test('cumulative byte budget includes ignored SSE data',async()=>{const frame=': '+ 'x'.repeat(200000)+'\n';await assert.rejects(collect(adapter(async()=>response(Array(11).fill(frame)),'llamacpp')), /Stream byte limit/);});
test('event budget includes blank lines',async()=>{await assert.rejects(collect(adapter(async()=>response(['\n'.repeat(16385)]))),/Stream event limit/);});
test('frame limit still enforced',async()=>{await assert.rejects(collect(adapter(async()=>response(['x'.repeat(256001)]))),/Stream frame too large/);});
test('valid fragmented NDJSON still succeeds',async()=>{assert.equal(await collect(adapter(async()=>response(['{"message":{"content":"he','llo"},"done":false}\n','{"done":true}\n']))),'hello');});
