import {createHash,timingSafeEqual} from 'node:crypto';
import {open} from 'node:fs/promises';
// Checks bytes of an operator-selected artifact, not the live endpoint's identity.
export async function verifyRuntimeArtifact({path,expectedSha256,signal}={}){
 if(typeof path!=='string'||!path||typeof expectedSha256!=='string'||!/^[a-f0-9]{64}$/i.test(expectedSha256))throw new TypeError('Invalid artifact verification configuration');
 const base={serverAuthenticated:false,offlineVerified:false};
 let handle;
 try{
  signal?.throwIfAborted();handle=await open(path,'r');const before=await handle.stat({bigint:true});
  if(!before.isFile())return {...base,status:'UNAVAILABLE'};
  const hash=createHash('sha256');const buffer=Buffer.alloc(65536);let size=0n;
  while(true){signal?.throwIfAborted();const {bytesRead}=await handle.read(buffer,0,buffer.length,null);if(!bytesRead)break;size+=BigInt(bytesRead);if(size>before.size)return {...base,status:'CHANGED'};hash.update(buffer.subarray(0,bytesRead));}
  const after=await handle.stat({bigint:true});signal?.throwIfAborted();
  if(size!==before.size||before.size!==after.size||before.mtimeNs!==after.mtimeNs||before.ctimeNs!==after.ctimeNs)return {...base,status:'CHANGED'};
  const digest=hash.digest();return {...base,status:timingSafeEqual(digest,Buffer.from(expectedSha256,'hex'))?'ARTIFACT_MATCH':'ARTIFACT_MISMATCH'};
 }catch{return {...base,status:signal?.aborted?'ABORTED':'UNAVAILABLE'};}finally{await handle?.close();}
}
