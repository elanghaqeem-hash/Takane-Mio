const state=document.getElementById('state'),hardware=document.getElementById('hardware'),stop=document.getElementById('stop'),error=document.getElementById('error');
async function refresh(){try{const s=await window.mio.status();state.textContent=s.state;stop.disabled=s.stopped;hardware.textContent=JSON.stringify(await window.mio.hardware(),null,2);}catch{error.textContent='Desktop connection unavailable';}}
stop.addEventListener('click',async()=>{stop.disabled=true;try{const s=await window.mio.stop();state.textContent=s.state;}catch{error.textContent='STOP request failed';stop.disabled=false;}});
refresh();
