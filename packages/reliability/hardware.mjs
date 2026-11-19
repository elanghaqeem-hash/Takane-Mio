import os from 'node:os';
export function hardwareProfile({ramGiB, gpuVRAMGiB=null}={}) {
  if (!Number.isFinite(ramGiB) || ramGiB<=0 || (gpuVRAMGiB!==null && (!Number.isFinite(gpuVRAMGiB)||gpuVRAMGiB<0))) throw new TypeError('Invalid hardware values');
  if (ramGiB>=32 && gpuVRAMGiB>=8) return 'ADVANCED';
  return ramGiB>=16 ? 'STANDARD' : 'LIGHT';
}
export function inspectHardware() {
  const ramGiB=os.totalmem()/2**30;
  return {platform:os.platform(),architecture:os.arch(),node:process.version,logicalCPU:os.cpus().length,ramGiB,gpuVRAMGiB:null,profile:hardwareProfile({ramGiB}),targetWindows:os.platform()==='win32'&&os.arch()==='x64',nodeTarget:Number(process.versions.node.split('.')[0])>=24,modelVerified:false};
}
