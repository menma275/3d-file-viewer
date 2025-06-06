export type FolderPath = {
  id: string
  customName: string
  folderPath: string
}

export type CustomVectorSchema = {
  id: string
  name: string
}

export type CustomVectorStoreShape = {
  customVectors: CustomVectorSchema[]
}

export type CustomVectorValue = {
  schemaId: string // refers to CustomVectorSchema.id
  value: number
}

export type CustomVectorValues = {
  values: CustomVectorValue[]
}

export type Vectors = {
  // embedding: number[]
  embeddingRaw: number[]
  customVectorValues: CustomVectorValue[]
}

// export type Vectors = {
//   embedding: number[]
//   embeddingRaw: number[]
//   parameter01: number
//   parameter02: number
//   parameter03: number
// }

export type FileData = {
  id: string
  filePath: string
  fileType: string
  fileContent: string
  createdAt: Date
  updatedAt: Date
  analyzedAt: Date
  vectors: Vectors
}

export type FolderSchema = {
  folders: FolderPath[]
}

export type FileSchema = {
  vectorSchema: CustomVectorSchema[]
  files: FileData[]
}
