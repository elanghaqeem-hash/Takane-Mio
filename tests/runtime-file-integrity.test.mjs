import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,writeFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {createHash} from 'node:crypto';
import {verifyRuntimeFile} from '../packages/intelligence/runtime-identity.mjs';
const digest=createHash('sha256').update('fixture').digest('hex');
async function fixture(t){const dir=await mkdtemp(join(tmpdir(),'mio-identity-'));t.after(()=>rm(dir,{recursive:true,force:true}));const path=join(dir,'runtime.bin');await writeFile(path,'fixture');return {dir,path,expectedSha256:digest,consent:true};}
test('matching bytes require review, never authenticate server',async t=>{const r=await verifyRuntimeFile(await fixture(t));assert.deepEqual(r,{serverAuthenticated:false,offlineVerified:false,releaseApproved:false,status:'DIGEST_MATCH_REVIEW_REQUIRED'});});
test('modified bytes fail digest check',async t=>{const x=await fixture(t);await writeFile(x.path,'changed');assert.equal((await verifyRuntimeFile(x)).status,'DIGEST_MISMATCH');});
test('missing path and directory blocked',async t=>{const x=await fixture(t);for(const path of [join(x.dir,'missing'),x.dir])assert.equal((await verifyRuntimeFile({...x,path})).status,'BLOCKED');});
test('empty file blocked',async t=>{const x=await fixture(t);await writeFile(x.path,'');assert.equal((await verifyRuntimeFile(x)).status,'BLOCKED');});
test('consent and configuration required',async t=>{const x=await fixture(t);await assert.rejects(verifyRuntimeFile({...x,consent:false}),/consent/);for(const bad of [{path:'relative'},{expectedSha256:'invalid'}])await assert.rejects(verifyRuntimeFile({...x,...bad}),/configuration/);});
test('pre-aborted verification fails closed',async t=>{const x=await fixture(t);const c=new AbortController();c.abort();assert.equal((await verifyRuntimeFile({...x,signal:c.signal})).status,'ABORTED');});
