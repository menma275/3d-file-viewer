import { ElectronAPI } from '@electron-toolkit/preload'
import { MessageContent } from '@langchain/core/messages'

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      openFolderDialog: () => Promise<string | null>
      getFolderPaths: () => Promise<FolderPath[]>
      addFolderPath: (folderPath: string) => Promise<void>
      embedding: (prompt: string) => Promise<number[]>
      graphicToText: (graphic: Buffer) => Promise<{content: string, base64: string}>
      getCustomScore: (file: string, customVecs: CustomVectorSchema[]) => Promise<string>
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
