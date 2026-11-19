import {createHash} from 'node:crypto';
const digest=s=>createHash('sha256').update(s,'utf8').digest('hex');
function pathOK(p){return typeof p==='string'&&p.length<=240&&p.split('/').every(x=>/^[a-zA-Z0-9_.-]+$/.test(x)&&x!=='.'&&x!=='..');}
function sourceOK(s){return typeof s==='string'&&Buffer.byteLength(s,'utf8')<=262144&&!s.includes('\0');}
export function inventory(files){
 if(!Array.isArray(files)||files.length>100)throw new Error('Invalid inventory');
 const seen=new Set();let bytes=0;
 return files.map(({path,source})=>{if(!pathOK(path)||!sourceOK(source)||seen.has(path))throw new Error('Invalid file');seen.add(path);bytes+=Buffer.byteLength(source);if(bytes>4194304)throw new Error('Inventory limit');return {path,bytes:Buffer.byteLength(source),lines:source?source.split(/\r\n|\n|\r/).length:0,sha256:digest(source)};});
}
export function inspectManifest(source){
 if(!sourceOK(source))throw new Error('Invalid manifest');const p=JSON.parse(source);if(!p||typeof p!=='object'||Array.isArray(p))throw new Error('Invalid manifest');
 const dependencies=[];for(const group of ['dependencies','devDependencies','optionalDependencies','peerDependencies']){const d=p[group];if(d===undefined)continue;if(!d||typeof d!=='object'||Array.isArray(d))throw new Error('Invalid dependency map');for(const [name,version] of Object.entries(d)){if(!/^(?:@[a-z0-9._-]+\/)?[a-z0-9._-]+$/i.test(name)||typeof version!=='string'||!version.trim()||version.length>300||dependencies.length>=500)throw new Error('Invalid dependency');dependencies.push({group,name,version,exact:/^\d+\.\d+\.\d+$/.test(version)});}}
 return {dependencies};
}
export function proposeReplacement({path,before,after,consent=false}={}){
 if(consent!==true||!pathOK(path)||!sourceOK(before)||!sourceOK(after)||before===after)throw new Error('Invalid proposal');
 return Object.freeze({path,baseHash:digest(before),candidateHash:digest(after),candidate:after,status:'REVIEW_REQUIRED'});
}
export function verifyReplacement(proposal,current){return !!proposal&&proposal.status==='REVIEW_REQUIRED'&&pathOK(proposal.path)&&sourceOK(current)&&sourceOK(proposal.candidate)&&digest(current)===proposal.baseHash&&digest(proposal.candidate)===proposal.candidateHash;}
