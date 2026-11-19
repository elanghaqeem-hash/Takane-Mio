import { readdirSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
export const baseline=Object.freeze('advanced agent animation assistant-runtime audio bundle checkpoint desktop-runtime desktop developer execution-gate files foundation galaxy hardware local-runtime memory mesh music orchestrator perception research scheduler security-t6 session unified visual voice workspace recovery-path verify-suite session-budget authority-hardening model-probe'.split(' ').map(n=>`${n}.test.mjs`));
export function missingSuites(names){const found=new Set(names);return baseline.filter(n=>!found.has(n));}
export function verifySuite({root=fileURLToPath(new URL('../',import.meta.url)),version=process.versions.node,run=spawnSync}={}){
 const suites=readdirSync(resolve(root,'tests'),{withFileTypes:true}).filter(e=>e.isFile()).map(e=>e.name);
 const missing=missingSuites(suites);
 if(missing.length)return {ok:false,stage:'inventory',missing};
 if(Number(version.split('.')[0])<24)return {ok:false,stage:'node-version',version};
 for(const [stage,args] of [['syntax',['scripts/check.mjs']],['regression',['--test']]]){
  const r=run(process.execPath,args,{cwd:root,stdio:'inherit',timeout:480000});
  if(r.error||r.status!==0)return {ok:false,stage,exitCode:r.status??null,signal:r.signal??null};
 }
 return {ok:true,stage:'regression',baselineSuites:baseline.length,platform:process.platform,node:version};
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 try{const result=verifySuite();console.log(JSON.stringify(result));if(!result.ok)process.exitCode=1;}catch(e){console.error('Suite verification failed:',e.message);process.exitCode=1;}
}
