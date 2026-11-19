// JSON.parse validates syntax; this second pass rejects ambiguous object keys.
export function parseUnambiguousJSON(raw){
 if(typeof raw!=='string'||raw.length>32000)throw new TypeError('Invalid JSON input');
 const value=JSON.parse(raw),stack=[];
 const tokens=/"(?:[^"\\]|\\.)*"|[{}\[\]:,]/gs;
 for(const match of raw.matchAll(tokens)){
  const token=match[0];
  if(token==='{'||token==='['){if(stack.length>=8)throw new Error('JSON nesting limit');stack.push(token==='{'?new Set():null);}
  else if(token==='}'||token===']')stack.pop();
  else if(token[0]==='"'&&/^\s*:/.test(raw.slice(match.index+token.length))){const keys=stack.at(-1);if(!(keys instanceof Set))throw new Error('Invalid JSON key');const key=JSON.parse(token);if(keys.has(key))throw new Error('Duplicate JSON key');keys.add(key);}
 }
 return value;
}
