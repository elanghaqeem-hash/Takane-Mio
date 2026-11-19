import {MemoryStore} from '../packages/memory/store.mjs';
import {mkdirSync} from 'node:fs';
import {join} from 'node:path';
import {homedir} from 'node:os';
const root=join(homedir(),'.mio');mkdirSync(root,{recursive:true,mode:0o700});const db=new MemoryStore(join(root,'memory.sqlite'));
try{const [cmd,...args]=process.argv.slice(2);if(cmd==='remember'&&args[0]==='--consent'){const [,kind,cluster,...words]=args;console.log(db.remember({kind,cluster,content:words.join(' '),consent:true}));}else if(cmd==='search')console.log(JSON.stringify(db.search(args.join(' ')),null,2));else if(cmd==='forget'&&args.length===1)console.log(db.forget(args[0]));else if(cmd==='galaxy')console.log(JSON.stringify(db.galaxy(),null,2));else{console.error('Usage: remember --consent KIND CLUSTER TEXT | search QUERY | forget ID | galaxy');process.exitCode=1;}}catch(e){console.error(e.message);process.exitCode=1;}finally{db.close();}
