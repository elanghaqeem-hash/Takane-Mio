import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,mkdirSync,writeFileSync,readFileSync,existsSync,rmSync,symlinkSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {stageDesktop} from '../scripts/stage-desktop.mjs';
function fixture(t){const base=mkdtempSync(join(tmpdir(),'mio-stage-')),root=join(base,'repo'),output=join(base,'stage');t.after(()=>rmSync(base,{recursive:true,force:true}));mkdirSync(join(root,'apps/desktop'),{recursive:true});mkdirSync(join(root,'packages'));writeFileSync(join(root,'package.json'),JSON.stringify({name:'takane-mio',version:'0.0.34',main:'apps/desktop/main.mjs',scripts:{unsafe:'secret'}}));writeFileSync(join(root,'apps/desktop/main.mjs'),'export {};');writeFileSync(join(root,'packages/core.mjs'),'export {};');return {root,output};}
test('stages desktop source and stripped manifest only',t=>{const {root,output}=fixture(t);writeFileSync(join(root,'packages/.env'),'secret');writeFileSync(join(root,'packages/memory.sqlite'),'private');const result=stageDesktop({root,output});assert.equal(result.files,3);assert.equal(result.status,'STAGED_SOURCE_ONLY');assert.equal(existsSync(join(output,'packages/.env')),false);assert.equal(existsSync(join(output,'packages/memory.sqlite')),false);assert.equal(JSON.parse(readFileSync(join(output,'package.json'))).scripts,undefined);});
test('refuses existing output without modifying it',t=>{const {root,output}=fixture(t);mkdirSync(output);writeFileSync(join(output,'keep'),'original');assert.throws(()=>stageDesktop({root,output}));assert.equal(readFileSync(join(output,'keep'),'utf8'),'original');});
test('refuses output within source tree',t=>{const {root}=fixture(t);assert.throws(()=>stageDesktop({root,output:join(root,'out')}));assert.equal(existsSync(join(root,'out')),false);});
test('rejects symlinked source',t=>{const {root,output}=fixture(t);symlinkSync(join(root,'apps','desktop'),join(root,'packages/link'),process.platform==='win32'?'junction':'dir');assert.throws(()=>stageDesktop({root,output}),/Symlink/);assert.equal(existsSync(output),false);});
