import test from 'node:test';
import assert from 'node:assert/strict';
import {assessDependencies} from '../packages/reliability/dependency-gate.mjs';
const manifest={name:'mio',version:'1.0.0',devDependencies:{electron:'1.2.3'}};
function lock(){return {name:'mio',version:'1.0.0',lockfileVersion:3,packages:{'':structuredClone(manifest),'node_modules/electron':{version:'1.2.3',resolved:'https://registry.npmjs.org/electron/-/electron-1.2.3.tgz',integrity:'sha512-'+'A'.repeat(86)+'=='}}};}
test('missing lock blocks release',()=>assert.equal(assessDependencies(manifest,null).status,'BLOCKED'));
test('metadata match requires further review not pass',()=>assert.equal(assessDependencies(manifest,lock()).status,'REVIEW_REQUIRED'));
test('root and direct versions must match',()=>{const l=lock();l.packages[''].version='2.0.0';l.packages['node_modules/electron'].version='2.0.0';assert.deepEqual(assessDependencies(manifest,l).issues,['ROOT_MISMATCH','DIRECT_MISMATCH']);});
test('reject nonregistry origins and invalid integrity',()=>{for(const patch of [{resolved:'https://example.org/a.tgz'},{integrity:'sha1-test'},{link:true}]){const l=lock();Object.assign(l.packages['node_modules/electron'],patch);assert.equal(assessDependencies(manifest,l).status,'BLOCKED');}});
test('unpinned direct dependency blocked',()=>{const m=structuredClone(manifest);m.devDependencies.electron='^1.2.3';assert.ok(assessDependencies(m,lock()).issues.includes('DIRECT_NOT_PINNED'));});
