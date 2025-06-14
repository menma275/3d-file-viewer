import { v4 as uuidv4 } from 'uuid'
import type { FileData, CustomVectorSchema } from '../../../types/index'
import reduceTo3D from './reduceDims'
//fileDatasgetで保存済みのファイルデータをとってくる
const dataAnalyze = async (
  analyzedDatas,
  graphicFiles,
  graphicFileContents,
  textFiles,
  fileContents,
  gStats,
  stats
): Promise<any[]> => {
  const newFileDataList: FileData[] = []
  let isCustomNeed: boolean = false
  const unEmbedFiles: string[] = []
  try {
    //テキストファイルの処理スタート
    if (textFiles) {
      for (let i = 0; i < textFiles.length; i++) {
        const filePath = textFiles[i]
        const fileContent = fileContents[i]
        const createdAt = stats[i].birthtime
        const updatedAt = stats[i].mtime
        // 解析済みデータから該当ファイルを探す
        const existing = analyzedDatas.find((d) => d.filePath === filePath)
        let needAnalyze = false
        if (!existing) {
          // 初めてのファイル
          needAnalyze = true
          if (!isCustomNeed) {
            isCustomNeed = true
          }
        } else {
          const analyzedAt = existing?.analyzedAt
            ? new Date(existing.analyzedAt)
            : new Date('1900-01-01T00:00:00Z')
          if (updatedAt > analyzedAt.toISOString) {
            // 更新されたファイル
            needAnalyze = true
            if (!isCustomNeed) {
              isCustomNeed = true
            }
          }
        }
        if (needAnalyze) {
          const fileName = filePath.split('/').pop() || ''
          unEmbedFiles.push(`***${fileName}***${fileContent}`)
          //responseとすでにstoreされている、各ファイルのembeddings多次元データを全て取得してきて、PCRにかけて次元削減
          const response: number[] = await window.api.embedding(fileContent)
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
              // embedding: [], // 失敗時の仮データ
              embeddingRaw: response,
              customVectorValues: [] //仮のデータを入れとく
            }
          }
          newFileDataList.push(newFileData)
        } else {
          newFileDataList.push(existing)
        }
      }
    }
    //ここから画像ファイルの処理スタート
    if (graphicFiles) {
      for (let i = 0; i < graphicFiles.length; i++) {
        const gFilePath = graphicFiles[i]
        // const gFileContent = graphicFileContents[i]
        const gCreatedAt = gStats[i].birthtime
        const gUpdatedAt = gStats[i].mtime
        // 解析済みデータから該当ファイルを探す
        const gExisting = analyzedDatas.find((d) => d.filePath === gFilePath)
        let needAnalyze = false
        if (!gExisting) {
          // 初めてのファイル
          needAnalyze = true
          if (!isCustomNeed) {
            isCustomNeed = true
          }
        } else {
          const analyzedAt = gExisting?.analyzedAt
            ? new Date(gExisting.analyzedAt)
            : new Date('1900-01-01T00:00:00Z')
          if (gUpdatedAt > analyzedAt.toISOString) {
            // 更新されたファイル
            needAnalyze = true
            if (!isCustomNeed) {
              isCustomNeed = true
            }
          }
        }
        if (needAnalyze) {
          const gFileName = gFilePath.split('/').pop() || ''
          //画像をvisionモデルのLLMに文字に変換してもらう
          const graToText = await window.api.graphicToText(gFilePath)
          unEmbedFiles.push(`***${gFileName}***${graToText.content}`)
          //responseとすでにstoreされている、各ファイルのembeddings多次元データを全て取得してきて、PCRにかけて次元削減
          const gResponse: number[] = await window.api.embedding(graToText.content)
          const gFileId = gExisting?.id || uuidv4()
          const newgFileData: FileData = {
            id: gFileId,
            filePath: gFilePath,
            fileType: gFilePath.split('.').pop(),
            fileContent: graToText.content,
            createdAt: gCreatedAt,
            updatedAt: gUpdatedAt,
            analyzedAt: new Date(),
            vectors: {
              // embedding: [], // 失敗時の仮データ
              embeddingRaw: gResponse,
              customVectorValues: [] //仮のデータを入れとく
            }
          }
          newFileDataList.push(newgFileData)
        } else {
          newFileDataList.push(gExisting)
        }
      }
    }
    if (isCustomNeed) {
      //以下は指定したパラメータに対してテキストモデルに判定してもらう処理
      //customvectorshema.nameを持ってきてその単語を投げる
      console.log(`umEmbed: ${unEmbedFiles}`)
      const customVecSchemasAll: CustomVectorSchema[] = await window.api.getCustomVectorName()
      const targetIds = ['ex', 'ey', 'ez']
      const customVecSchemas = customVecSchemasAll.filter((vec) => !targetIds.includes(vec.id))
      const customVecNames: string[] = customVecSchemas.map((c) => c.name)
      const newFileContents = unEmbedFiles.join(', ')
      const scoreContent = await window.api.getCustomScore(newFileContents, customVecNames)
      console.log(`customscore:${scoreContent}`)
      const parsedScores: Record<string, Record<string, number>> = {}
      const cleanedScoreContent = scoreContent.replace(/```json|```/g, '').trim()
      const regex = /([^\s,]+?\.(?:txt|md|jpg|jpeg|png))\s*\n({[\s\S]*?})/g
      let match
      while ((match = regex.exec(cleanedScoreContent)) !== null) {
        const [, fileName, jsonPart] = match
        console.log(`match:${fileName}`)
        try {
          parsedScores[fileName] = JSON.parse(jsonPart)
        } catch (e) {
          console.error(`JSON parse error for ${fileName}:`, e)
        }
      }
      //newFileDataListをJSON形式にパースしたscoreContentで上書きする
      newFileDataList.forEach((file) => {
        const fileName = file.filePath.split('/').pop()
        if (fileName && parsedScores[fileName]) {
          const customVectorValues = customVecSchemas.map((schema) => ({
            schemaId: schema.id,
            value:
              typeof parsedScores[fileName][schema.name] === 'number'
                ? parsedScores[fileName][schema.name]
                : 1
          }))
          file.vectors.customVectorValues = customVectorValues
        }
      })
    }
    console.log('custom解析完了')
    //解析後上書き保存できるようにidを持っておく
    const embedVecs = newFileDataList.map((file) => ({
      id: file.id,
      embeddingRaw: file.vectors.embeddingRaw
    }))
    //pcaへの入力データ
    const rawVecs = embedVecs.map((emb) => emb.embeddingRaw)
    //responseとembedVecをPCAに入力して戻り値をそれぞれのjsonファイルに上書きする
    const reducedVec: number[][] = await reduceTo3D(rawVecs)
    const idToReducedVec = new Map<string, number[]>()
    embedVecs.forEach((data, index) => {
      idToReducedVec.set(data.id, reducedVec[index])
    })
    //更新されたものから新しく次元圧縮したものに上書き
    // const updatedFileDataList = newFileDataList.map((file) => {
    //   const newEmbedding = idToReducedVec.get(file.id)
    //   return {
    //     ...file,
    //     vectors: {
    //       ...file.vectors,
    //       // embedding: newEmbedding
    //     }
    //   }
    // })
    const updatedFileDataList = newFileDataList.map((file) => {
      const newEmbedding = idToReducedVec.get(file.id)
      if (!newEmbedding) return file // 念のため null チェック
      const embeddingKeys = ['ex', 'ey', 'ez']
      // 既存の customVectorValues を Map に変換
      const existingValues = file.vectors?.customVectorValues ?? []
      const customValueMap = new Map(existingValues.map((item) => [item.schemaId, item]))
      // ex, ey, ez を追加または上書き
      embeddingKeys.forEach((key, index) => {
        customValueMap.set(key, {
          schemaId: key,
          value: newEmbedding[index]
        })
      })
      // Map を配列に戻す
      const updatedCustomVectorValues = Array.from(customValueMap.values())
      return {
        ...file,
        vectors: {
          ...file.vectors,
          customVectorValues: updatedCustomVectorValues
        }
      }
    })
    return updatedFileDataList
  } catch (err) {
    console.error(err)
  }
  return []
}
export default dataAnalyze
