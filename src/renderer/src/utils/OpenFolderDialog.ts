import { ipcRenderer } from 'electron/renderer'

async function openFolderDialog(): Promise<string> {
  const folderPath = await ipcRenderer.invoke('dialog:openFolder')
  if (folderPath) {
    console.log(folderPath)
  }
  return folderPath
}

export default openFolderDialog
