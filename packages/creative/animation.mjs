import {transform} from './mesh.mjs';
const vec=(v,positive=false)=>Array.isArray(v)&&v.length===3&&v.every(n=>Number.isFinite(n)&&Math.abs(n)<=1e6&&(!positive||n>0));
export function createTimeline(frames,{duration,loop=false}={}){
 if(!Number.isFinite(duration)||duration<=0||duration>3600||typeof loop!=='boolean'||!Array.isArray(frames)||frames.length<2||frames.length>1000)throw new TypeError('Invalid timeline');
 const keys=frames.map((f,i)=>{if(!f||!Number.isFinite(f.time)||f.time<0||f.time>duration||(i&&f.time<=frames[i-1].time)||!vec(f.translate)||!vec(f.scale,true)||!Number.isFinite(f.rotateY)||Math.abs(f.rotateY)>1e6||!['linear','smooth','step'].includes(f.ease??'linear'))throw new TypeError('Invalid keyframe');return {time:f.time,translate:[...f.translate],scale:[...f.scale],rotateY:f.rotateY,ease:f.ease??'linear'};});
 if(keys[0].time!==0||keys.at(-1).time!==duration)throw new Error('Timeline must span duration');
 return {version:1,duration,loop,frames:keys};
}
export function sample(timeline,time){
 const t=createTimeline(timeline.frames,timeline);if(!Number.isFinite(time))throw new TypeError('Invalid time');
 const x=t.loop?((time%t.duration)+t.duration)%t.duration:Math.max(0,Math.min(time,t.duration));
 let j=t.frames.findIndex(f=>f.time>=x);if(j<=0)j=1;
 const a=t.frames[j-1],b=t.frames[j];let p=(x-a.time)/(b.time-a.time);
 if(a.ease==='smooth')p=p*p*(3-2*p);else if(a.ease==='step')p=p===1?1:0;
 const mix=(m,n)=>m+(n-m)*p;
 return {translate:a.translate.map((v,i)=>mix(v,b.translate[i])),scale:a.scale.map((v,i)=>mix(v,b.scale[i])),rotateY:mix(a.rotateY,b.rotateY)};
}
export function animateMesh(mesh,timeline,time){return transform(mesh,sample(timeline,time));}
export function exportTimeline(timeline){return JSON.stringify(createTimeline(timeline.frames,timeline),null,2)+'\n';}
