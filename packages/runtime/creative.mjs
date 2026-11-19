import {box,cylinder,toOBJ} from '../creative/mesh.mjs';
export function createMeshPreview(request,{consent=false}={}){
 if(consent!==true)throw Error('Creative consent required');
 if(!request||Object.getPrototypeOf(request)!==Object.prototype)throw TypeError('Invalid mesh request');
 const {shape,dimensions}=request;
 if(Object.keys(request).length!==2||!Array.isArray(dimensions)||dimensions.length!==3)throw TypeError('Invalid dimensions');
 const [a,b,c]=dimensions;
 if(![a,b].every(n=>Number.isFinite(n)&&n>0&&n<=1000))throw TypeError('Invalid dimensions');
 let mesh;
 if(shape==='box'&&Number.isFinite(c)&&c>0&&c<=1000)mesh=box(a,b,c);
 else if(shape==='cylinder'&&Number.isInteger(c)&&c>=3&&c<=128)mesh=cylinder(a,b,c);
 else throw TypeError('Unsupported shape or dimensions');
 return {format:'obj',vertices:mesh.vertices.length,faces:mesh.faces.length,content:toOBJ(mesh)};
}
