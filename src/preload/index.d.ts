import { ElectronAPI } from '@electron-toolkit/preload'

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      openFolderDialog: () => Promise<string | null>
      getFolderPaths: () => Promise<FolderPath[]>
      addFolderPath: (folderPath: string) => Promise<void>
    }
  }
}
