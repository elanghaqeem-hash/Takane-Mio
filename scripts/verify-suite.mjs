import { readdirSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
export const baseline=Object.freeze(["activation-cli.test.mjs","activation-offline-integration.test.mjs","activation.test.mjs","advanced.test.mjs","agent-core-stop.test.mjs","agent.test.mjs","animation.test.mjs","approval.test.mjs","assistant-persistent-memory.test.mjs","assistant-runtime.test.mjs","audio.test.mjs","authority-hardening.test.mjs","bundle.test.mjs","candidate.test.mjs","checkpoint.test.mjs","core-lifecycle.test.mjs","creative-runtime.test.mjs","dependency-gate.test.mjs","desktop-runtime.test.mjs","desktop.test.mjs","developer.test.mjs","direct-offline-integration.test.mjs","emergency-dispatch.test.mjs","emergency-stop.test.mjs","encrypted-memory.test.mjs","execution-gate.test.mjs","files.test.mjs","foundation.test.mjs","galaxy.test.mjs","global-stop-integration.test.mjs","hardware.test.mjs","inference-smoke.test.mjs","integrated-system.test.mjs","knowledge-reader.test.mjs","local-runtime.test.mjs","memory.test.mjs","mesh.test.mjs","model-probe.test.mjs","music.test.mjs","offline-readiness.test.mjs","offline-transport.test.mjs","orchestrator.test.mjs","perception.test.mjs","proposal-boundary.test.mjs","recovery-path.test.mjs","release.test.mjs","research.test.mjs","restore.test.mjs","runtime-budget.test.mjs","runtime-file-integrity.test.mjs","runtime-identity.test.mjs","scheduler.test.mjs","security-acceptance.test.mjs","security-t6.test.mjs","session-budget.test.mjs","session.test.mjs","stage-desktop.test.mjs","unified-creative-agent.test.mjs","unified.test.mjs","verify-suite.test.mjs","visual.test.mjs","voice.test.mjs","web-uat.test.mjs","windows-preflight.test.mjs","workspace.test.mjs"]);
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
