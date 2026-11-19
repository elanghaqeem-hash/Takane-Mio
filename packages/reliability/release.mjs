export const gates=Object.freeze(['ci-linux','ci-windows','desktop-smoke','installer','local-inference','offline','security','recovery','user-manual']);
export function assessRelease({commit,evidence=[]}={}){
 if(typeof commit!=='string'||!/^[a-f0-9]{40}$/.test(commit)||!Array.isArray(evidence)||evidence.length>gates.length)throw new TypeError('Invalid release evidence');
 const seen=new Map();
 for(const e of evidence){if(!e||!gates.includes(e.gate)||seen.has(e.gate)||!['PASS','FAIL'].includes(e.status)||e.commit!==commit||typeof e.reference!=='string'||!e.reference.trim()||e.reference.length>512)throw new TypeError('Invalid gate evidence');seen.set(e.gate,e);}
 const results=gates.map(gate=>({gate,status:seen.get(gate)?.status??'PENDING',reference:seen.get(gate)?.reference??null}));
 return {commit,decision:results.every(r=>r.status==='PASS')?'REVIEW_REQUIRED':'BLOCKED',results};
}
