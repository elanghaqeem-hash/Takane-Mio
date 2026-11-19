import test from 'node:test';
import assert from 'node:assert/strict';
import {createHmac,createHash} from 'node:crypto';
import {createBundle,inspectBundle} from '../packages/recovery/bundle.mjs';
const key=Buffer.alloc(32,7),commit='a'.repeat(40),opts={key,commit,consent:true},verify={key,expectedCommit:commit};
const file=path=>({path,bytes:Buffer.from('x')});
function signed(paths){const entries=paths.map(path=>({path,size:1,sha256:createHash('sha256').update('x').digest('hex'),data:'eA=='}));const body=JSON.stringify({version:1,commit,entries});return JSON.stringify({body,tag:createHmac('sha256',key).update(body).digest('hex')});}
test('creation rejects file/directory collisions in either order and case',()=>{for(const paths of [['a','a/b'],['a/b','a'],['A','a/b/c']])assert.throws(()=>createBundle(paths.map(file),opts));});
test('authenticated legacy bundle with conflicting paths is rejected',()=>{for(const paths of [['a','a/b'],['a/b','A']])assert.throws(()=>inspectBundle(signed(paths),verify));});
test('siblings and unrelated prefix names remain valid',()=>{const paths=['a/b','a/c','ab','a-b'];assert.deepEqual(inspectBundle(createBundle(paths.map(file),opts),verify).files.map(f=>f.path),paths);});
