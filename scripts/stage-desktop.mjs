import { readdirSync, lstatSync, mkdirSync, copyFileSync, writeFileSync, readFileSync, rmSync } from 'node:fs';
import { join, resolve, relative, isAbsolute } from 'node:path';
import { fileURLToPath } from 'node:url';
const extensions=/\.(mjs|cjs|js|html|css)$/;
export function stageDesktop({root=fileURLToPath(new URL('../',import.meta.url)),output}={}){
 root=resolve(root);if(typeof output!=='string'||!output.trim())throw Error('Explicit output required');output=resolve(output);
 const rel=relative(root,output);if(!rel||(!rel.startsWith('..'+(process.platform==='win32'?'\\':'/'))&&!isAbsolute(rel)&&rel!=='..'))throw Error('Output must be outside repository');
 const pkg=JSON.parse(readFileSync(join(root,'package.json'),'utf8'));
 if(pkg.name!=='takane-mio'||!/^\d+\.\d+\.\d+$/.test(pkg.version)||pkg.main!=='apps/desktop/main.mjs')throw Error('Invalid desktop manifest');
 const files=[];function scan(dir){if(!lstatSync(join(root,dir)).isDirectory())throw Error('Invalid source directory');for(const e of readdirSync(join(root,dir),{withFileTypes:true})){if(e.name.startsWith('.'))continue;const path=join(dir,e.name);if(e.isSymbolicLink())throw Error('Symlink rejected');if(e.isDirectory())scan(path);else if(e.isFile()&&extensions.test(e.name))files.push(path);}}
 scan('apps/desktop');scan('packages');if(!files.includes(join('apps','desktop','main.mjs'))||files.length>1000)throw Error('Invalid source inventory');
 mkdirSync(output);try{for(const path of files.sort()){const dest=join(output,path);mkdirSync(resolve(dest,'..'),{recursive:true});copyFileSync(join(root,path),dest);}writeFileSync(join(output,'package.json'),JSON.stringify({name:pkg.name,version:pkg.version,private:true,type:'module',main:pkg.main},null,2)+'\n',{flag:'wx'});return {status:'STAGED_SOURCE_ONLY',files:files.length+1,output};}catch(e){rmSync(output,{recursive:true,force:true});throw e;}
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){try{console.log(JSON.stringify(stageDesktop({output:process.argv[2]})));}catch(e){console.error(e.message);process.exitCode=1;}}
