import {createHash,createHmac,timingSafeEqual} from 'node:crypto';
const hash=b=>createHash('sha256').update(b).digest('hex');
const pathOK=p=>typeof p==='string'&&p.length<=240&&p.split('/').every(x=>/^[a-zA-Z0-9_-][a-zA-Z0-9_.-]*$/.test(x)&&!x.endsWith('.')&&!/^(con|prn|aux|nul|com[1-9]|lpt[1-9])(?:\.|$)/i.test(x));
const keyOK=k=>Buffer.isBuffer(k)&&k.length>=32;
function tag(key,body){return createHmac('sha256',key).update(body).digest('hex');}
export function createBundle(files,{key,commit,consent=false}={}){
 if(consent!==true||!keyOK(key)||typeof commit!=='string'||!/^[a-f0-9]{40}$/.test(commit)||!Array.isArray(files)||files.length<1||files.length>100)throw new Error('Invalid bundle request');
 const seen=new Set();let total=0;
 const entries=files.map(({path,bytes})=>{if(!pathOK(path)||seen.has(path.toLowerCase())||!(bytes instanceof Uint8Array)||bytes.length>1048576)throw new Error('Invalid entry');seen.add(path.toLowerCase());total+=bytes.length;if(total>4194304)throw new Error('Bundle limit');const b=Buffer.from(bytes);return {path,size:b.length,sha256:hash(b),data:b.toString('base64')};});
 const body=JSON.stringify({version:1,commit,entries});return JSON.stringify({body,tag:tag(key,body)});
}
export function inspectBundle(serialized,{key,expectedCommit}={}){
 if(!keyOK(key)||typeof serialized!=='string'||serialized.length>6000000||typeof expectedCommit!=='string'||!/^[a-f0-9]{40}$/.test(expectedCommit))throw new Error('Invalid verification request');
 const envelope=JSON.parse(serialized);if(typeof envelope?.body!=='string'||typeof envelope.tag!=='string'||!/^[a-f0-9]{64}$/.test(envelope.tag)||!timingSafeEqual(Buffer.from(envelope.tag,'hex'),Buffer.from(tag(key,envelope.body),'hex')))throw new Error('Authentication failed');
 const b=JSON.parse(envelope.body);if(b.version!==1||b.commit!==expectedCommit||!Array.isArray(b.entries)||b.entries.length<1||b.entries.length>100)throw new Error('Invalid manifest');
 const seen=new Set();let total=0;const files=b.entries.map(e=>{if(!pathOK(e.path)||seen.has(e.path.toLowerCase())||!Number.isInteger(e.size)||e.size<0||e.size>1048576||typeof e.data!=='string'||e.data.length>1398104)throw new Error('Invalid entry');seen.add(e.path.toLowerCase());const bytes=Buffer.from(e.data,'base64');total+=bytes.length;if(total>4194304||bytes.length!==e.size||bytes.toString('base64')!==e.data||hash(bytes)!==e.sha256)throw new Error('Integrity failed');return {path:e.path,bytes};});
 return {commit:b.commit,files};
}
