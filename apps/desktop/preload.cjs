const {contextBridge,ipcRenderer}=require('electron');
contextBridge.exposeInMainWorld('mio',Object.freeze({
  status:()=>ipcRenderer.invoke('mio:status'),
  hardware:()=>ipcRenderer.invoke('mio:hardware'),
  stop:()=>ipcRenderer.invoke('mio:stop')
}));
