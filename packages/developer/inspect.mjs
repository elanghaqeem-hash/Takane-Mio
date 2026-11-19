import {createHash} from 'node:crypto';
const rules=[['DYNAMIC_EVAL',/\beval\s*\(/u],['DYNAMIC_FUNCTION',/\bnew\s+Function\s*\(/u],['PROCESS_EXECUTION',/\b(?:exec|execSync|spawn|spawnSync)\s*\(/u],['SECRET_MARKER',/\b(?:api[_-]?key|password|secret|token)\s*[:=]\s*['"][^'"]+/iu]];
export function inspectSource({name,source,consent=false}={}){
 if(consent!==true||typeof name!=='string'||name.length>255||!name.trim()||/[\\/\x00-\x1f]/u.test(name)||typeof source!=='string'||source.length>200000)throw new TypeError('Invalid source');
 const lines=source.split(/\r\n|\n|\r/u),findings=[];let truncated=false;
 for(let i=0;i<lines.length;i++)for(const [rule,re] of rules)if(re.test(lines[i])){if(findings.length<500)findings.push({rule,line:i+1,status:'REVIEW_REQUIRED'});else truncated=true;}
 return {name,sha256:createHash('sha256').update(source).digest('hex'),lines:source.length?lines.length:0,findings,truncated,method:'HEURISTIC_ONLY'};
}
export function dependencyInventory(raw,{consent=false}={}){
 if(consent!==true||typeof raw!=='string'||raw.length>100000)throw new TypeError('Invalid manifest');
 const p=JSON.parse(raw);if(!p||Object.getPrototypeOf(p)!==Object.prototype)throw new TypeError('Invalid manifest');const dependencies=[];
 for(const group of ['dependencies','devDependencies','optionalDependencies','peerDependencies']){
  const entries=p[group];if(entries===undefined)continue;if(!entries||Object.getPrototypeOf(entries)!==Object.prototype)throw new TypeError('Invalid dependency group');
  for(const [name,version] of Object.entries(entries)){if(!/^(?:@[a-z0-9_.-]+\/)?[a-z0-9_.-]+$/iu.test(name)||name.length>214||typeof version!=='string'||version.length>256||!version.trim()||dependencies.length>=1000)throw new TypeError('Invalid dependency');dependencies.push({group,name,versionKind:/^\d+\.\d+\.\d+(?:-[0-9a-z.-]+)?$/iu.test(version)?'EXACT':'NON_EXACT_OR_REFERENCE'});}
 }
 return {dependencies,verified:false};
}
