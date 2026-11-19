export function assessWindows({platform,arch,nodeVersion,lockPresent=false,electronPresent=false,freeBytes}={}){
 const major=typeof nodeVersion==='string'&&/^\d+\.\d+\.\d+$/.test(nodeVersion)?Number(nodeVersion.split('.')[0]):0;
 const checks=[['windows',platform==='win32'],['architecture',arch==='x64'||arch==='arm64'],['node',major>=24],['dependency-lock',lockPresent===true],['electron',electronPresent===true],['disk',Number.isSafeInteger(freeBytes)&&freeBytes>=2*1024**3]];
 return {ready:checks.every(([,ok])=>ok),checks:checks.map(([id,ok])=>({id,ok})),installerVerified:false};
}
