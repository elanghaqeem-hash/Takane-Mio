export function voiceActivity(samples,threshold=0.03){
 if(!(samples instanceof Float32Array)||samples.length<1||samples.length>480000||!Number.isFinite(threshold)||threshold<=0||threshold>1)throw new TypeError('Invalid audio frame');
 let sum=0;for(const v of samples){if(!Number.isFinite(v)||Math.abs(v)>1)throw new TypeError('Invalid PCM sample');sum+=v*v;}
 const rms=Math.sqrt(sum/samples.length);return {rms,active:rms>=threshold};
}
export class VoiceEngine{
 #core;#stt;#tts;#active=null;#unsubscribe;
 constructor({core,stt,tts}){if(!core||typeof stt!=='function'||typeof tts!=='function')throw new TypeError('Voice dependencies required');this.#core=core;this.#stt=stt;this.#tts=tts;this.#unsubscribe=core.subscribe(s=>{if(s.stopped)this.#active?.abort();});}
 async #run(state,fn,consent){if(consent!==true)throw new Error('Explicit voice consent required');if(this.#active||this.#core.snapshot.stopped)throw new Error('Voice unavailable');const c=new AbortController();this.#active=c;try{this.#core.transition(state);const out=await fn(c.signal);c.signal.throwIfAborted();this.#core.transition('IDLE');return out;}catch(e){if(!this.#core.snapshot.stopped)this.#core.transition('ERROR');throw e;}finally{this.#active=null;}}
 transcribe(samples,{consent=false,language='id'}={}){voiceActivity(samples);if(!['id','en'].includes(language))throw new TypeError('Unsupported language');const copy=samples.slice();return this.#run('LISTENING',async signal=>{const result=await this.#stt(copy,{signal,language});if(typeof result!=='string'||result.length>16000)throw new Error('Invalid transcript');return result;},consent);}
 speak(text,{consent=false,language='id'}={}){if(typeof text!=='string'||!text.trim()||text.length>4000||!['id','en'].includes(language))throw new TypeError('Invalid speech request');return this.#run('SPEAKING',signal=>this.#tts(text,{signal,language}),consent);}
 dispose(){this.#active?.abort();this.#unsubscribe();}
}
