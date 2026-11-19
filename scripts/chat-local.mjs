import {createLocalAdapter} from '../packages/intelligence/local-runtime.mjs';
import {LocalRouter} from '../packages/intelligence/router.mjs';
const [provider,model,...words]=process.argv.slice(2);
if(!provider||!model||!words.length){console.error('Usage: npm run chat:local -- ollama MODEL "prompt"');process.exitCode=1;}else{
 const abort=new AbortController();process.once('SIGINT',()=>abort.abort());
 try{const router=new LocalRouter();router.register('local',createLocalAdapter({provider,model}));for await(const text of router.stream('local',[{role:'user',content:words.join(' ')}],{signal:abort.signal}))process.stdout.write(text);process.stdout.write('\n');}catch(e){console.error(e.message);process.exitCode=1;}
}
