// TM-P0.01 — local-first routing policy, independent from the web laboratory.
export function selectRuntime({localReady=false, cloudAllowed=false, cloudReady=false, offline=false}={}) {
  if (localReady === true) return {provider:'local',status:'ready'};
  if (offline === false && cloudAllowed === true && cloudReady === true)
    return {provider:'openrouter',status:'ready'};
  return {provider:null,status:'unavailable'};
}
