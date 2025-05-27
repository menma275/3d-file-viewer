export type FolderPath = {
  id: string
  customName: string
  folderPath: string
}

export type FileData = {
  id: string
  filePath: string
  fileType: string
  fileContent: string
  createdAt: string
  updatedAt: string
  analyzedAt: string
  vectors: {
    embedding: number[]
    parameter01: number
    parameter02: number
    parameter03: number
  }
}

export type FolderSchema = {
  folders: FolderPath[]
}

export type FileSchema = {
  files: FileData[]
}
