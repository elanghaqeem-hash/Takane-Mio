const exact=/^\d+\.\d+\.\d+$/;
const groups=['dependencies','devDependencies','optionalDependencies','peerDependencies'];
export function assessDependencies(manifest,lock){
 const issues=[];
 if(!manifest||typeof manifest!=='object'||Array.isArray(manifest))throw TypeError('Invalid manifest');
 if(!lock||lock.lockfileVersion!==3||!lock.packages||!Object.hasOwn(lock.packages,''))return {status:'BLOCKED',issues:['MISSING_OR_INVALID_LOCK']};
 const root=lock.packages[''];
 if(!root||root.name!==manifest.name||root.version!==manifest.version||lock.name!==manifest.name||lock.version!==manifest.version)issues.push('ROOT_MISMATCH');
 for(const group of groups){
  const a=manifest[group]??{},b=root?.[group]??{};
  if(!a||typeof a!=='object'||Array.isArray(a)||!b||typeof b!=='object'||Array.isArray(b))throw TypeError('Invalid dependency map');
  for(const [name,version] of Object.entries(a)){
   if(typeof version!=='string'||!exact.test(version))issues.push('DIRECT_NOT_PINNED');
   if(!Object.hasOwn(b,name)||b[name]!==version||lock.packages['node_modules/'+name]?.version!==version)issues.push('DIRECT_MISMATCH');
  }
  if(Object.keys(b).some(name=>!Object.hasOwn(a,name)))issues.push('DIRECT_MISMATCH');
 }
 const entries=Object.entries(lock.packages);if(entries.length>10001)throw RangeError('Lock inventory limit');
 for(const [path,p] of entries){if(path==='')continue;
  if(!path.startsWith('node_modules/')||!p||p.link||typeof p.version!=='string'||!exact.test(p.version)||typeof p.resolved!=='string'||!p.resolved.startsWith('https://registry.npmjs.org/')||typeof p.integrity!=='string'||!/^sha512-[A-Za-z0-9+/]{86}==$/.test(p.integrity))issues.push('UNVERIFIED_PACKAGE_METADATA');
 }
 return {status:issues.length?'BLOCKED':'REVIEW_REQUIRED',issues:[...new Set(issues)],packages:entries.length-1};
}
