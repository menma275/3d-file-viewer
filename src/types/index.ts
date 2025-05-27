export type FolderPath = {
  id: string
  customName: string
  folderPath: string
}

export type Vectors = {
  embedding: number[]
  parameter01: number
  parameter02: number
  parameter03: number

}

export type FileData = {
  id: string
  filePath: string
  fileType: string
  fileContent: string
  createdAt: string
  updatedAt: string
  analyzedAt: string
  vectors: Vectors
}

export type FolderSchema = {
  folders: FolderPath[]
}

export type FileSchema = {
  files: FileData[]
}
