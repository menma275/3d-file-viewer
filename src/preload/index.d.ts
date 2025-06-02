import { ElectronAPI } from '@electron-toolkit/preload'

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      openFolderDialog: () => Promise<string | null>
      getFolderPaths: () => Promise<FolderPath[]>
      addFolderPath: (folderPath: string) => Promise<void>
      embedding: (prompt: string) => Promise<number[]>
      readFile: (filePath: string) => Promise<string | null>
      readDir: (dirPath: string) => Promise<string[] | null>
      statFile: (filePath: string) => Promise<fs.Stats>
      getFileDatas: () => Promise<FileData[]>
      addFileDatas: (newData: FileData[]) => Promise<void>
      showItemInFolder: (filePath: string) => Promise<void>
      getCustomVectorName: () => Promise<CustomVectorSchema[]>
      addCustomVectorName: (customName: string) => Promise<void>
    }
  }
}
