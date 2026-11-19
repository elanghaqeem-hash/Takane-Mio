import test from 'node:test';
import assert from 'node:assert/strict';
import {box,cylinder,transform,toOBJ,validateMesh} from '../packages/creative/mesh.mjs';
test('box topology and bounds',()=>{const m=box(2,4,6);assert.equal(m.vertices.length,8);assert.equal(m.faces.length,12);assert.deepEqual(m.vertices[6],[1,2,3]);});
test('cylinder topology is closed with opposite directed edge pairs',()=>{const m=cylinder(2,3,16),edges=new Map();assert.equal(m.vertices.length,34);assert.equal(m.faces.length,64);for(const f of m.faces)for(let i=0;i<3;i++){const a=f[i],b=f[(i+1)%3],k=[a,b].sort((x,y)=>x-y).join(':');const v=edges.get(k)??[];v.push(a<b?1:-1);edges.set(k,v);}for(const v of edges.values())assert.deepEqual(v.sort(),[-1,1]);});
test('transformation preserves input',()=>{const m=box(),n=transform(m,{scale:[2,2,2],translate:[1,2,3]});assert.deepEqual(n.vertices[0],[0,1,2]);assert.deepEqual(m.vertices[0],[-.5,-.5,-.5]);});
test('rotation uses radians',()=>{const n=transform(box(2,2,2),{rotateY:Math.PI/2});assert.ok(Math.abs(n.vertices[0][0]+1)<1e-9);assert.ok(Math.abs(n.vertices[0][2]-1)<1e-9);});
test('OBJ uses one-based indices',()=>{const lines=toOBJ(box()).trim().split('\n');assert.equal(lines.filter(x=>x.startsWith('v ')).length,8);assert.ok(lines.includes('f 1 3 2'));});
test('rejects invalid inputs',()=>{assert.throws(()=>box(0));assert.throws(()=>cylinder(1,1,257));assert.throws(()=>transform(box(),{scale:[0,1,1]}));assert.throws(()=>validateMesh({vertices:[[0,0,0],[1,0,0],[0,1,0]],faces:[[0,1,3]]}));});
