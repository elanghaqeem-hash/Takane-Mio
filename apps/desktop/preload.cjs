const {contextBridge,ipcRenderer}=require('electron');
contextBridge.exposeInMainWorld('mio',Object.freeze({
  status:()=>ipcRenderer.invoke('mio:status'),
  hardware:()=>ipcRenderer.invoke('mio:hardware'),
  knowledge:()=>ipcRenderer.invoke('mio:knowledge'),
  stop:()=>ipcRenderer.invoke('mio:stop')
}));
