import {existsSync,statfsSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {assessWindows} from '../packages/reliability/windows-preflight.mjs';
const root=fileURLToPath(new URL('../',import.meta.url));
let freeBytes=0;try{const s=statfsSync(root);freeBytes=s.bavail*s.bsize;}catch{}
const result=assessWindows({platform:process.platform,arch:process.arch,nodeVersion:process.versions.node,lockPresent:existsSync(new URL('../package-lock.json',import.meta.url)),electronPresent:existsSync(new URL('../node_modules/electron/dist/electron.exe',import.meta.url)),freeBytes});
console.log(JSON.stringify(result,null,2));if(!result.ready)process.exitCode=1;
