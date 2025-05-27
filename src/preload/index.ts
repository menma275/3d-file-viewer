import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

const api = {
  openFolderDialog: () => ipcRenderer.invoke('dialog:openFolder'),
  getFolderPaths: () => ipcRenderer.invoke('folderPath:get'),
  addFolderPath: (folderPath: string) => ipcRenderer.invoke('folderPath:add', folderPath),
  embedding: (prompt: string) => ipcRenderer.invoke('ollama:embed', prompt),
  readFile: (filePath: string) => ipcRenderer.invoke('readFile', filePath),
  readDir: (dirPath: string) => ipcRenderer.invoke('readDir', dirPath),
  statFile: (filePath: string) => ipcRenderer.invoke('fileStat', filePath),
  getFileDatas: () => ipcRenderer.invoke('fileDatas:get'),
  addFileDatas: (newData: string) => ipcRenderer.invoke('fileDatas:add', newData)
}

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
