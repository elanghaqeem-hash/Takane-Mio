import test from 'node:test';
import assert from 'node:assert/strict';
import {createMeshPreview} from '../packages/runtime/creative.mjs';
test('box preview uses real mesh and OBJ serialization',()=>{const r=createMeshPreview({shape:'box',dimensions:[2,3,4]},{consent:true});assert.equal(r.vertices,8);assert.equal(r.faces,12);assert.equal(r.content.split('\n').filter(x=>x.startsWith('f ')).length,12);});
test('cylinder preview is bounded',()=>{const r=createMeshPreview({shape:'cylinder',dimensions:[1,2,128]},{consent:true});assert.equal(r.vertices,258);assert.equal(r.faces,512);assert.throws(()=>createMeshPreview({shape:'cylinder',dimensions:[1,2,129]},{consent:true}));});
test('explicit consent required',()=>assert.throws(()=>createMeshPreview({shape:'box',dimensions:[1,2,3]})));
test('reject invalid shapes, dimensions and extra fields',()=>{for(const r of [{shape:'sphere',dimensions:[1,2,3]},{shape:'box',dimensions:[1,2,Infinity]},{shape:'box',dimensions:[1001,2,3]},{shape:'box',dimensions:[1,2,3],path:'output.obj'},{shape:'box',dimensions:[1,2]}])assert.throws(()=>createMeshPreview(r,{consent:true}));});
