import test from 'node:test';
import assert from 'node:assert/strict';
import {synthesize,mix,lowPass,toWAV} from '../packages/creative/audio.mjs';
test('sine length and quarter cycle',()=>{const a=synthesize({frequency:1000,duration:.01,sampleRate:8000,amplitude:.5});assert.equal(a.length,80);assert.ok(Math.abs(a[2]-.5)<1e-6);});
test('triangle bounded',()=>{const a=synthesize({wave:'triangle',duration:.01});assert.ok(a.every(x=>Math.abs(x)<=.5));});
test('mix clips and preserves input',()=>{const a=Float32Array.of(.75,-.75),b=Float32Array.of(.75,-.75,.25);assert.deepEqual([...mix([a,b])],[1,-1,.25]);assert.deepEqual([...a],[.75,-.75]);});
test('low pass attenuates alternating input',()=>{const a=Float32Array.from({length:100},(_,i)=>i%2?1:-1);const b=lowPass(a,{sampleRate:8000,cutoff:100});assert.ok(Math.max(...b.map(Math.abs))<.1);});
test('WAV header and signed samples',()=>{const b=toWAV(Float32Array.of(-1,0,1),8000);assert.equal(b.toString('ascii',0,4),'RIFF');assert.equal(b.readUInt32LE(24),8000);assert.equal(b.readUInt32LE(40),6);assert.equal(b.readInt16LE(44),-32768);assert.equal(b.readInt16LE(48),32767);assert.equal(b.length,50);});
test('reject invalid input',()=>{assert.throws(()=>synthesize({frequency:8000}));assert.throws(()=>mix([]));assert.throws(()=>toWAV(Float32Array.of(NaN)));assert.throws(()=>lowPass(Float32Array.of(1),{cutoff:9000}));});
