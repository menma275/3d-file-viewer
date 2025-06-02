//ファイルが解析済みのデータ群に含まれているか確認。含まれていなければ解析する
//含まれている場合analyzedAtがupdatedAtよりも新しいかどうかを確認。古ければ解析
//話し合った時に言ってたのはrenderer下にあるファイルからstoreを使えないということなのか？
import { v4 as uuidv4 } from 'uuid'

import type { FileData } from '../../../types/index'

//fileDatasgetで保存済みのファイルデータをとってくる
const dataAnalyze = async (
  analyzedDatas,
  folderPath,
  allFiles,
  fileContents,
  stats
): Promise<any[]> => {
  const newFileDataList = []
  try {
    for (let i = 0; i < allFiles.length; i++) {
      const filePath = allFiles[i]
      const fileContent = fileContents[i]
      const createdAt = stats[i].birthtime
      const updatedAt = stats[i].mtime

      // 解析済みデータから該当ファイルを探す
      const existing = analyzedDatas.find((d) => d.filePath === filePath)

      let needAnalyze = false

      if (!existing) {
        // 初めてのファイル
        needAnalyze = true
      } else {
        const analyzedAt = existing?.analyzedAt
          ? new Date(existing.analyzedAt)
          : new Date('1900-01-01T00:00:00Z')

        if (updatedAt > analyzedAt.toISOString) {
          // 更新されたファイル
          needAnalyze = true
        }
      }

      if (needAnalyze) {
        //解析処理は未実装
        // const response = await window.api.embedding(fileContent)

        const fileId = existing?.id || uuidv4()

        const newFileData: FileData = {
          id: fileId,
          filePath,
          fileType: filePath.split('.').pop(),
          fileContent,
          createdAt: createdAt,
          updatedAt: updatedAt,
          analyzedAt: new Date(),
          vectors: {
            embedding: [0.1, 0.2, 0.3], // 失敗時の仮データ
            embeddingRaw: [0.1, 0.2, 0.3], // 失敗時の仮データ
            customVectorValues: [
              { schemaId: 'parameter01', value: 0.1 },
              { schemaId: 'parameter02', value: 0.2 },
              { schemaId: 'parameter03', value: 0.2 }
            ]
          }
        }
        newFileDataList.push(newFileData)
      }
    }
  } catch (err) {
    console.error(err)
  }
  return newFileDataList
}

export default dataAnalyze
