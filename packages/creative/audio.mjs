const MAX=48000*30;
const rate=n=>Number.isInteger(n)&&n>=8000&&n<=48000;
function pcm(a){if(!(a instanceof Float32Array)||!a.length||a.length>MAX||a.some(x=>!Number.isFinite(x)||Math.abs(x)>1))throw new TypeError('Invalid PCM');return a;}
export function synthesize({frequency=440,duration=1,sampleRate=16000,amplitude=.5,wave='sine'}={}){
 if(!rate(sampleRate)||!Number.isFinite(frequency)||frequency<=0||frequency>=sampleRate/2||!Number.isFinite(duration)||duration<=0||duration>30||!Number.isFinite(amplitude)||amplitude<0||amplitude>1||!['sine','triangle'].includes(wave))throw new TypeError('Invalid synthesis settings');
 const n=Math.round(duration*sampleRate);if(n<1)throw new TypeError('Duration too short');const out=new Float32Array(n);
 for(let i=0;i<n;i++){const x=2*Math.PI*frequency*i/sampleRate;out[i]=amplitude*(wave==='sine'?Math.sin(x):2/Math.PI*Math.asin(Math.sin(x)));}
 return out;
}
export function mix(tracks){if(!Array.isArray(tracks)||!tracks.length||tracks.length>16)throw new TypeError('Invalid tracks');const arrays=tracks.map(pcm);const out=new Float32Array(Math.max(...arrays.map(a=>a.length)));for(let i=0;i<out.length;i++){let v=0;for(const a of arrays)v+=a[i]??0;out[i]=Math.max(-1,Math.min(1,v));}return out;}
export function lowPass(samples,{sampleRate=16000,cutoff=1000}={}){pcm(samples);if(!rate(sampleRate)||!Number.isFinite(cutoff)||cutoff<=0||cutoff>=sampleRate/2)throw new TypeError('Invalid cutoff');const a=1-Math.exp(-2*Math.PI*cutoff/sampleRate),out=new Float32Array(samples.length);let prev=0;for(let i=0;i<out.length;i++){prev+=a*(samples[i]-prev);out[i]=prev;}return out;}
export function toWAV(samples,sampleRate=16000){pcm(samples);if(!rate(sampleRate))throw new TypeError('Invalid sample rate');const b=Buffer.alloc(44+2*samples.length);b.write('RIFF',0);b.writeUInt32LE(b.length-8,4);b.write('WAVEfmt ',8);b.writeUInt32LE(16,16);b.writeUInt16LE(1,20);b.writeUInt16LE(1,22);b.writeUInt32LE(sampleRate,24);b.writeUInt32LE(sampleRate*2,28);b.writeUInt16LE(2,32);b.writeUInt16LE(16,34);b.write('data',36);b.writeUInt32LE(samples.length*2,40);for(let i=0;i<samples.length;i++)b.writeInt16LE(Math.round(samples[i]*(samples[i]<0?32768:32767)),44+2*i);return b;}
