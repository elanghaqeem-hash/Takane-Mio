const num=n=>Number.isFinite(n)&&Math.abs(n)<=8192;
const color=c=>typeof c==='string'&&/^#[0-9a-f]{6}$/i.test(c);
const esc=s=>s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
export function toSVG({width,height,layers}={}){
 if(!Number.isInteger(width)||width<1||width>4096||!Number.isInteger(height)||height<1||height>4096||!Array.isArray(layers)||layers.length>256)throw new TypeError('Invalid canvas');
 const out=[];let count=0;
 for(const layer of layers){
  if(!layer||typeof layer.visible!=='boolean'||!Number.isFinite(layer.opacity)||layer.opacity<0||layer.opacity>1||!Array.isArray(layer.shapes))throw new TypeError('Invalid layer');
  count+=layer.shapes.length;if(count>4096)throw new Error('Shape limit');
  const shapes=layer.shapes.map(s=>{
   if(!s||!color(s.fill)||!num(s.x)||!num(s.y))throw new TypeError('Invalid shape');
   if(s.type==='rect'&&num(s.width)&&s.width>0&&num(s.height)&&s.height>0)return `<rect x="${s.x}" y="${s.y}" width="${s.width}" height="${s.height}" fill="${s.fill}"/>`;
   if(s.type==='circle'&&num(s.radius)&&s.radius>0)return `<circle cx="${s.x}" cy="${s.y}" r="${s.radius}" fill="${s.fill}"/>`;
   if(s.type==='text'&&typeof s.text==='string'&&s.text.length<=1000&&!/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/u.test(s.text)&&num(s.fontSize)&&s.fontSize>0)return `<text x="${s.x}" y="${s.y}" font-size="${s.fontSize}" fill="${s.fill}">${esc(s.text)}</text>`;
   throw new TypeError('Unsupported shape');
  });
  if(layer.visible)out.push(`<g opacity="${layer.opacity}">${shapes.join('')}</g>`);
 }
 return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">${out.join('')}</svg>\n`;
}
export function filterRGBA(bytes,{mode='grayscale',brightness=1}={}){
 if(!(bytes instanceof Uint8Array)||!bytes.length||bytes.length%4||bytes.length>16*1024*1024||!['grayscale','brightness'].includes(mode)||!Number.isFinite(brightness)||brightness<0||brightness>2)throw new TypeError('Invalid raster input');
 const out=Uint8Array.from(bytes);
 for(let i=0;i<out.length;i+=4){if(mode==='grayscale'){const y=Math.round(.2126*out[i]+.7152*out[i+1]+.0722*out[i+2]);out[i]=out[i+1]=out[i+2]=y;}else for(let j=0;j<3;j++)out[i+j]=Math.min(255,Math.round(out[i+j]*brightness));}
 return out;
}
