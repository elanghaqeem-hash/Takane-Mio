import {readFileSync,statSync} from 'node:fs';
import {assessDependencies} from '../packages/reliability/dependency-gate.mjs';
function read(name){const path=new URL('../'+name,import.meta.url);if(statSync(path).size>8388608)throw Error('File too large');return JSON.parse(readFileSync(path,'utf8'));}
try{const manifest=read('package.json');let lock=null;try{lock=read('package-lock.json');}catch(e){if(e.code!=='ENOENT')throw e;}const r=assessDependencies(manifest,lock);console.log(JSON.stringify(r));if(r.status==='BLOCKED')process.exitCode=1;}catch{console.error('Dependency review blocked');process.exitCode=1;}
