const {contextBridge,ipcRenderer}=require('electron');
contextBridge.exposeInMainWorld('mio',Object.freeze({
  status:()=>ipcRenderer.invoke('mio:status'),
  hardware:()=>ipcRenderer.invoke('mio:hardware'),
  knowledge:()=>ipcRenderer.invoke('mio:knowledge'),
  chat:text=>ipcRenderer.invoke('mio:chat',text),
  stop:()=>ipcRenderer.invoke('mio:stop')
}));
