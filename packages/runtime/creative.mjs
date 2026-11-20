import {box,cylinder,toOBJ} from '../creative/mesh.mjs';
function validateMeshRequest(request){
 if(!request||Object.getPrototypeOf(request)!==Object.prototype)throw TypeError('Invalid mesh request');
 const {shape,dimensions}=request;
 if(Object.keys(request).length!==2||!Array.isArray(dimensions)||dimensions.length!==3)throw TypeError('Invalid dimensions');
 const [a,b,c]=dimensions;
 if(![a,b].every(n=>Number.isFinite(n)&&n>0&&n<=1000))throw TypeError('Invalid dimensions');
 if(!((shape==='box'&&Number.isFinite(c)&&c>0&&c<=1000)||(shape==='cylinder'&&Number.isInteger(c)&&c>=3&&c<=128)))throw TypeError('Unsupported shape or dimensions');
 return {shape,dimensions:[a,b,c]};
}
export function createMeshPreview(request,{consent=false}={}){
 if(consent!==true)throw Error('Creative consent required');
 const {shape,dimensions:[a,b,c]}=validateMeshRequest(request);
 const mesh=shape==='box'?box(a,b,c):cylinder(a,b,c);
 return {format:'obj',vertices:mesh.vertices.length,faces:mesh.faces.length,content:toOBJ(mesh)};
}

export function registerCreativeTools(registry){registry.register({id:'creative.mesh',level:0,scope:'internal:creative',purpose:'preview',validate:a=>{try{validateMeshRequest(a);return true;}catch{return false;}},run:(a,signal)=>{signal?.throwIfAborted();return createMeshPreview(a,{consent:true});}});return registry;}
