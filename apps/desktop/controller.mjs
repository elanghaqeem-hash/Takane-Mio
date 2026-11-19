import { CoreState } from '../../packages/core/state.mjs';
import { ExecutionGate } from '../../packages/security/execution-gate.mjs';
import { inspectHardware } from '../../packages/reliability/hardware.mjs';
export function createController({core=new CoreState(),gate=new ExecutionGate(()=>false),hardware=inspectHardware}={}) {
  return Object.freeze({
    status:()=>({...core.snapshot,modelVerified:false}),
    hardware:()=>hardware(),
    stop:()=>{gate.stop();core.stop();return core.snapshot;},
    subscribe:fn=>core.subscribe(fn)
  });
}
export function assertTrustedSender(event,contents,expectedURL) {
  if (!contents || contents.isDestroyed() || event.sender!==contents || !event.senderFrame || event.senderFrame!==contents.mainFrame || event.senderFrame.url!==expectedURL) throw new Error('Untrusted IPC sender');
}
