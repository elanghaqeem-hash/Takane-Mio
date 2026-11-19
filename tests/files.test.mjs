import test from 'node:test';
import assert from 'node:assert/strict';
import {inspectFile,proposeOrganization,saveText} from '../packages/files/engine.mjs';
test('recognizes PDF signature independently of extension',()=>{assert.equal(inspectFile('a.txt',Buffer.from('%PDF-1.7')).format,'pdf-signature');});
test('ZIP is not assumed to be Office',()=>{assert.equal(inspectFile('a.docx',Buffer.from([80,75,3,4])).format,'zip-container');});
test('UTF8 and binary rejection',()=>{assert.equal(inspectFile('a.txt',Buffer.from('halo')).text,'halo');assert.equal(inspectFile('a.txt',Buffer.from([255])).format,'unknown');});
test('rejects paths and oversized bytes',()=>{assert.throws(()=>inspectFile('../secret.txt',Buffer.alloc(0)));assert.throws(()=>inspectFile('x',Buffer.alloc(16*1024*1024+1)));});
test('duplicate detection only proposes review',()=>{const a=inspectFile('a.txt',Buffer.from('same')),b=inspectFile('b.txt',Buffer.from('same'));assert.deepEqual(proposeOrganization([a,b])[1],{name:'b.txt',category:'utf8-text',duplicateOf:'a.txt',action:'REVIEW_ONLY'});});
test('explicit consent required and untrusted content marked',()=>{const a=inspectFile('a.txt',Buffer.from('sample'));let saved;const memory={remember:x=>{saved=x;return 'id';}};assert.throws(()=>saveText(a,{memory}));assert.equal(saveText(a,{memory,consent:true}),'id');assert.equal(JSON.parse(saved.content).trust,'UNVERIFIED');});
