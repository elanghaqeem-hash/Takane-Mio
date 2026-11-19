import {createHash} from 'node:crypto';
const MAX=16*1024*1024;
export function inspectFile(name,bytes){
 if(typeof name!=='string'||!name.trim()||name.length>255||/[\\/\x00-\x1f]/u.test(name)||name==='.'||name==='..'||!(bytes instanceof Uint8Array)||bytes.byteLength>MAX)throw new TypeError('Invalid file input');
 const b=Buffer.from(bytes),ext=name.includes('.')?name.split('.').at(-1).toLowerCase():'';
 let format='unknown',text=null;
 if(b.subarray(0,5).toString('ascii')==='%PDF-')format='pdf-signature';
 else if(b.length>=4&&b.readUInt32LE(0)===0x04034b50)format='zip-container';
 else if(b.length>=8&&b.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])))format='png-signature';
 else if(b.length>=3&&b[0]===255&&b[1]===216&&b[2]===255)format='jpeg-signature';
 else if(['txt','md','csv','json'].includes(ext)){
  try{const decoded=new TextDecoder('utf-8',{fatal:true}).decode(b);if(!/[\x00-\x08\x0b\x0c\x0e-\x1f]/u.test(decoded)){format='utf8-text';text=decoded;}}catch{}
 }
 return {name,extension:ext,format,size:b.length,sha256:createHash('sha256').update(b).digest('hex'),text};
}
export function proposeOrganization(files){
 if(!Array.isArray(files)||files.length>1000)throw new TypeError('Invalid file list');
 const seen=new Map();
 return files.map(file=>{if(!file||typeof file.name!=='string'||!/^[a-f0-9]{64}$/.test(file.sha256)||!['unknown','pdf-signature','zip-container','png-signature','jpeg-signature','utf8-text'].includes(file.format))throw new TypeError('Invalid metadata');
 const duplicateOf=seen.get(file.sha256)??null;if(duplicateOf===null)seen.set(file.sha256,file.name);
 return {name:file.name,category:file.format,duplicateOf,action:'REVIEW_ONLY'};});
}
export function saveText(file,{memory,consent=false}={}){
 if(consent!==true)throw new Error('Explicit consent required');
 if(file?.format!=='utf8-text'||typeof file.text!=='string'||!file.text.trim()||file.text.length>12000)throw new Error('Unsupported text input');
 return memory.remember({kind:'semantic',cluster:'files',content:JSON.stringify({name:file.name,sha256:file.sha256,text:file.text,trust:'UNVERIFIED'}),consent:true});
}
