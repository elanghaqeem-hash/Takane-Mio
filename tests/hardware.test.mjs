import test from 'node:test';
import assert from 'node:assert/strict';
import { hardwareProfile, inspectHardware } from '../packages/reliability/hardware.mjs';
test('light and standard boundaries',()=>{assert.equal(hardwareProfile({ramGiB:8}),'LIGHT');assert.equal(hardwareProfile({ramGiB:16}),'STANDARD');});
test('advanced requires confirmed VRAM',()=>{assert.equal(hardwareProfile({ramGiB:64}),'STANDARD');assert.equal(hardwareProfile({ramGiB:32,gpuVRAMGiB:8}),'ADVANCED');});
test('reject invalid measurements',()=>{for(const ramGiB of [0,-1,NaN,Infinity,'32']) assert.throws(()=>hardwareProfile({ramGiB}));assert.throws(()=>hardwareProfile({ramGiB:32,gpuVRAMGiB:-1}));});
test('diagnostic never assumes model or GPU availability',()=>{const result=inspectHardware();assert.equal(result.modelVerified,false);assert.equal(result.gpuVRAMGiB,null);assert.ok(result.logicalCPU>0);});
