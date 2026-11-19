const palette={IDLE:'#66ddff',THINKING:'#a6caff',PROCESSING:'#9bc7ff',LISTENING:'#7df2dd',SPEAKING:'#77dfff',CREATING:'#c4a0ff',STOPPED:'#ed7888',ERROR:'#ed7888',WARNING:'#ffca80',SLEEP:'#738da9'};
export function coreColor(state){return palette[state]??palette.IDLE;}
export function renderBudget(profile){return ({LIGHT:160,STANDARD:500,ADVANCED:1200})[profile]??160;}
function hash(s){let h=2166136261;for(const c of s){h=Math.imul(h^c.charCodeAt(0),16777619);}return h>>>0;}
export function layoutGalaxy(records,profile='LIGHT'){
  if(!Array.isArray(records))throw new TypeError('Records must be an array');
  const unique=new Map();
  for(const r of records)if(r?.authorized===true&&r.indexed===true&&typeof r.id==='string'&&r.id.trim()&&typeof r.cluster==='string'&&r.cluster.trim()&&!unique.has(r.id))unique.set(r.id,{id:r.id,cluster:r.cluster});
  const ordered=[...unique.values()].sort((a,b)=>a.id<b.id?-1:a.id>b.id?1:0);
  const stars=ordered.slice(0,renderBudget(profile)).map(r=>{const a=hash(r.cluster)/2**32*Math.PI*2;const h=hash(r.id);const radius=.24+(h%1000)/1000*.65;const theta=a+radius*2+((h>>>12)%100)/100*.6;return {...r,x:Math.cos(theta)*radius,y:Math.sin(theta)*radius*.65};});
  return {total:ordered.length,visible:stars.length,stars};
}
