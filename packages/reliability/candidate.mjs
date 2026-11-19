import {assessRelease} from './release.mjs';
import {assessSecurity} from './security-acceptance.mjs';
export function assessCandidate({commit,releaseEvidence=[],securityEvidence=[],dependencyStatus}={}){
 const release=assessRelease({commit,evidence:releaseEvidence});
 const security=assessSecurity({commit,evidence:securityEvidence,dependencyStatus});
 const blockers=[...release.results.filter(r=>r.status!=='PASS').map(r=>'release:'+r.gate),...security.blockers.map(d=>'security:'+d)];
 return {commit,decision:blockers.length?'BLOCKED':'REVIEW_REQUIRED',blockers,release,security};
}
