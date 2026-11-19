import {readdirSync} from 'node:fs';
import {join} from 'node:path';
import {spawnSync} from 'node:child_process';
function walk(dir){return readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(join(dir,e.name)):/\.(mjs|cjs|js)$/.test(e.name)?[join(dir,e.name)]:[]);}
for(const file of ['apps','packages','scripts','tests'].flatMap(walk)){const result=spawnSync(process.execPath,['--check',file],{stdio:'inherit'});if(result.status!==0)process.exit(1);}
