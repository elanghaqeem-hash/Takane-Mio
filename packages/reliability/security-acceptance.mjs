export const domains=Object.freeze(['runtime','authority','injection','memory','agent','emergency-stop','supply-chain','recovery']);
export function assessSecurity({commit,evidence=[],dependencyStatus}={}){
 if(typeof commit!=='string'||!/^[a-f0-9]{40}$/.test(commit)||!Array.isArray(evidence)||evidence.length>domains.length)throw TypeError('Invalid security evidence');
 const seen=new Map();
 for(const e of evidence){if(!e||!domains.includes(e.domain)||seen.has(e.domain)||e.commit!==commit||!['PASS','FAIL'].includes(e.status)||typeof e.reference!=='string'||!e.reference.trim()||e.reference.length>512||e.scope!=='integrated-target')throw TypeError('Invalid domain evidence');seen.set(e.domain,{status:e.status,reference:e.reference});}
 const results=domains.map(domain=>({domain,status:seen.get(domain)?.status??'PENDING',reference:seen.get(domain)?.reference??null}));
 const blockers=results.filter(r=>r.status!=='PASS').map(r=>r.domain);
 if(dependencyStatus!=='REVIEW_REQUIRED')blockers.push('dependency-preflight');
 return {commit,decision:blockers.length?'BLOCKED':'REVIEW_REQUIRED',blockers,results};
}
