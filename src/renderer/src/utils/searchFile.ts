import type { FileData } from '../../../types/index'

const searchFile = async ({ id }: { id: string }): Promise<FileData> => {
  const files = await window.api.getFileDatas()
  const fileData = files.find((file: FileData) => file.id === id)

  return fileData
}

export default searchFile
