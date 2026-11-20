import {createHash,timingSafeEqual} from 'node:crypto';
import {open,lstat} from 'node:fs/promises';
import {isAbsolute} from 'node:path';
const LIMIT=16*1024**3;
export async function verifyRuntimeFile({path,expectedSha256,consent=false,signal}={}){
 if(consent!==true)throw Error('Explicit verification consent required');
 if(typeof path!=='string'||!isAbsolute(path)||typeof expectedSha256!=='string'||!(/^[a-f0-9]{64}$/i.test(expectedSha256)))throw TypeError('Invalid verification configuration');
 const base={serverAuthenticated:false,offlineVerified:false,releaseApproved:false};
 let handle;
 try{
  signal?.throwIfAborted();
  const before=await lstat(path,{bigint:true});
  if(!before.isFile()||before.size<1n||before.size>BigInt(LIMIT))return {...base,status:'BLOCKED'};
  handle=await open(path,'r');
  const same=s=>s.isFile()&&s.dev===before.dev&&s.ino===before.ino&&s.size===before.size&&s.mtimeNs===before.mtimeNs&&s.ctimeNs===before.ctimeNs;
  if(!same(await handle.stat({bigint:true})))return {...base,status:'BLOCKED'};
  const hash=createHash('sha256'),buffer=Buffer.alloc(1024*1024);let total=0;
  while(true){
   signal?.throwIfAborted();
   const {bytesRead}=await handle.read(buffer,0,buffer.length,null);
   if(!bytesRead)break;
   total+=bytesRead;if(total>Number(before.size))return {...base,status:'BLOCKED'};
   hash.update(buffer.subarray(0,bytesRead));
  }
  signal?.throwIfAborted();
  if(total!==Number(before.size)||!same(await handle.stat({bigint:true}))||!same(await lstat(path,{bigint:true})))return {...base,status:'BLOCKED'};
  const actual=hash.digest();
  return {...base,status:timingSafeEqual(actual,Buffer.from(expectedSha256,'hex'))?'DIGEST_MATCH_REVIEW_REQUIRED':'DIGEST_MISMATCH'};
 }catch{return {...base,status:signal?.aborted?'ABORTED':'BLOCKED'};}
 finally{await handle?.close();}
}
