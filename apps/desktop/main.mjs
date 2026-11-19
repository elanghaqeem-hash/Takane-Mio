import { app, BrowserWindow, ipcMain, session } from 'electron';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createController, assertTrustedSender } from './controller.mjs';
const controller=createController();
const page=fileURLToPath(new URL('./index.html',import.meta.url));
const expectedURL=pathToFileURL(page).href;
let win=null;
function createWindow(){
  win=new BrowserWindow({width:1000,height:720,minWidth:640,minHeight:480,backgroundColor:'#081120',webPreferences:{preload:fileURLToPath(new URL('./preload.cjs',import.meta.url)),contextIsolation:true,sandbox:true,nodeIntegration:false,webSecurity:true}});
  win.webContents.setWindowOpenHandler(()=>({action:'deny'}));
  win.webContents.on('will-navigate',e=>e.preventDefault());
  win.webContents.on('will-redirect',e=>e.preventDefault());
  win.webContents.on('will-attach-webview',e=>e.preventDefault());
  win.on('closed',()=>{win=null;});
  win.loadFile(page).catch(()=>app.quit());
}
if(!app.requestSingleInstanceLock()){app.quit();}
else {
  app.on('second-instance',()=>{if(win){if(win.isMinimized())win.restore();win.focus();}});
  app.whenReady().then(()=>{
    session.defaultSession.setPermissionRequestHandler((_wc,_permission,callback)=>callback(false));
    session.defaultSession.setPermissionCheckHandler(()=>false);
    for(const [channel,handler] of Object.entries({'mio:status':controller.status,'mio:hardware':controller.hardware,'mio:stop':controller.stop})){
      ipcMain.handle(channel,(event,...args)=>{assertTrustedSender(event,win?.webContents,expectedURL);if(args.length)throw new Error('Unexpected arguments');return handler();});
    }
    createWindow();
    app.on('activate',()=>{if(!win)createWindow();});
  }).catch(()=>app.quit());
  app.on('before-quit',()=>controller.stop());
  app.on('window-all-closed',()=>app.quit());
}
