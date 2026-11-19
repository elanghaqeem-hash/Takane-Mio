import test from 'node:test';
import assert from 'node:assert/strict';
import {assessWindows} from '../packages/reliability/windows-preflight.mjs';
const good={platform:'win32',arch:'x64',nodeVersion:'24.0.0',lockPresent:true,electronPresent:true,freeBytes:2*1024**3};
test('supported inputs pass only preflight',()=>{const r=assessWindows(good);assert.equal(r.ready,true);assert.equal(r.installerVerified,false);});
test('each prerequisite independently blocks',()=>{for(const [key,value] of Object.entries({platform:'linux',arch:'ia32',nodeVersion:'22.16.0',lockPresent:false,electronPresent:false,freeBytes:1}))assert.equal(assessWindows({...good,[key]:value}).ready,false);});
test('invalid or missing values never pass',()=>{assert.equal(assessWindows().ready,false);for(const nodeVersion of ['24junk','24.0','Infinity',null])assert.equal(assessWindows({...good,nodeVersion}).ready,false);});
test('arm64 supported by preflight; disk boundary enforced',()=>{assert.equal(assessWindows({...good,arch:'arm64'}).ready,true);assert.equal(assessWindows({...good,freeBytes:good.freeBytes-1}).ready,false);});
