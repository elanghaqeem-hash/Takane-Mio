import {probeLocalModel} from '../packages/intelligence/probe.mjs';
const [provider,model]=process.argv.slice(2);
try{const result=await probeLocalModel({provider,model});console.log(JSON.stringify(result));if(!result.listed)process.exitCode=1;}catch(e){console.error(e.message);process.exitCode=1;}
