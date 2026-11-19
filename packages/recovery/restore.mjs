import {mkdirSync,writeFileSync,readFileSync,realpathSync} from 'node:fs';
import {isAbsolute,dirname,basename,join,resolve} from 'node:path';
import {createHash} from 'node:crypto';
import {recoverCheckpoint} from './checkpoint.mjs';
const digest=b=>createHash('sha256').update(b).digest('hex');
export function restoreToNewDirectory(bytes,{key,expectedCommit,output,consent=false}={}){
 if(consent!==true||typeof output!=='string'||!isAbsolute(output)||output!==resolve(output)||dirname(output)===output)throw Error('Explicit consent and canonical absolute output required');
 const entries=recoverCheckpoint(bytes,{key,expectedCommit,consent:true});
 const destination=join(realpathSync(dirname(output)),basename(output));
 mkdirSync(destination,{mode:0o700});
 // Never overwrite or delete existing data. Partial output remains for review on failure.
 const files=[];
 for(const {name,text} of entries){const path=join(destination,name),data=Buffer.from(text,'utf8');writeFileSync(path,data,{flag:'wx',mode:0o600});const sha256=digest(data);if(digest(readFileSync(path))!==sha256)throw Error('Restore readback mismatch');files.push({name,bytes:data.length,sha256});}
 const receipt={status:'RESTORED_TEXT_ONLY',commit:expectedCommit,files};
 writeFileSync(join(destination,'RESTORE_RECEIPT.json'),JSON.stringify(receipt,null,2)+'\n',{flag:'wx',mode:0o600});
 return receipt;
}
