const validNumber=x=>typeof x==='number'&&Number.isFinite(x)&&Math.abs(x)<=1e9;
export function validateMesh(mesh){
 if(!mesh||!Array.isArray(mesh.vertices)||!Array.isArray(mesh.faces)||mesh.vertices.length<3||mesh.vertices.length>100000||mesh.faces.length<1||mesh.faces.length>200000)throw new TypeError('Invalid mesh size');
 for(const v of mesh.vertices)if(!Array.isArray(v)||v.length!==3||!v.every(validNumber))throw new TypeError('Invalid vertex');
 for(const f of mesh.faces)if(!Array.isArray(f)||f.length!==3||new Set(f).size!==3||!f.every(i=>Number.isInteger(i)&&i>=0&&i<mesh.vertices.length))throw new TypeError('Invalid face');
 return mesh;
}
export function box(width=1,height=1,depth=1){
 if(![width,height,depth].every(x=>validNumber(x)&&x>0))throw new TypeError('Invalid dimensions');
 const x=width/2,y=height/2,z=depth/2;
 return validateMesh({vertices:[[-x,-y,-z],[x,-y,-z],[x,y,-z],[-x,y,-z],[-x,-y,z],[x,-y,z],[x,y,z],[-x,y,z]],faces:[[0,2,1],[0,3,2],[4,5,6],[4,6,7],[0,1,5],[0,5,4],[3,7,6],[3,6,2],[0,4,7],[0,7,3],[1,2,6],[1,6,5]]});
}
export function cylinder(radius=1,height=1,segments=32){
 if(!validNumber(radius)||radius<=0||!validNumber(height)||height<=0||!Number.isInteger(segments)||segments<3||segments>256)throw new TypeError('Invalid cylinder parameters');
 const vertices=[],faces=[];
 for(const y of [-height/2,height/2])for(let i=0;i<segments;i++){const a=i*2*Math.PI/segments;vertices.push([radius*Math.cos(a),y,radius*Math.sin(a)]);}
 vertices.push([0,-height/2,0],[0,height/2,0]);
 for(let i=0;i<segments;i++){const j=(i+1)%segments;faces.push([i,i+segments,j],[j,i+segments,j+segments],[2*segments,i,j],[2*segments+1,j+segments,i+segments]);}
 return validateMesh({vertices,faces});
}
export function transform(mesh,{scale=[1,1,1],translate=[0,0,0],rotateY=0}={}){
 validateMesh(mesh);if(!Array.isArray(scale)||scale.length!==3||!scale.every(x=>validNumber(x)&&x>0)||!Array.isArray(translate)||translate.length!==3||!translate.every(validNumber)||!validNumber(rotateY))throw new TypeError('Invalid transform');
 const c=Math.cos(rotateY),s=Math.sin(rotateY);
 return validateMesh({vertices:mesh.vertices.map(v=>{const [x,y,z]=v.map((n,i)=>n*scale[i]);return [c*x+s*z+translate[0],y+translate[1],-s*x+c*z+translate[2]];}),faces:mesh.faces.map(f=>[...f])});
}
export function toOBJ(mesh){validateMesh(mesh);return ['# MIO procedural mesh',...mesh.vertices.map(v=>'v '+v.join(' ')),...mesh.faces.map(f=>'f '+f.map(i=>i+1).join(' '))].join('\n')+'\n';}
