// Pure policy primitive; not yet connected to privileged services.
export function authorize({operation, grants=[], now=Date.now(), stopped=false}={}) {
  if(stopped || !operation || !Number.isInteger(operation.level) || operation.level<0 || operation.level>4 || typeof operation.scope!=='string' || !operation.scope || typeof operation.purpose!=='string' || !operation.purpose) return false;
  return grants.some(g=>g && g.scope===operation.scope && g.purpose===operation.purpose && Number.isInteger(g.level) && g.level>=operation.level && g.level<=4 && Number.isFinite(g.expiresAt) && g.expiresAt>now && (operation.level<3 || g.explicit===true));
}
