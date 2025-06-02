import { v4 as uuidv4 } from 'uuid'
import type { FileData } from '../../../types/index'
import reduceTo3D from './reduceDims'

//fileDatasgetで保存済みのファイルデータをとってくる
const dataAnalyze = async (
    analyzedDatas,
    folderPath,
    allFiles,
    fileContents,
    stats
): Promise<any[]> => {
    const newFileDataList:FileData[] = []
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

                //responseとすでにstoreされている、各ファイルのembeddings多次元データを全て取得してきて、PCRにかけて次元削減
                const response: number[] = await window.api.embedding(fileContent)

                //以下は指定したパラメータに対してテキストモデルに判定してもらう処理
                //customvectorshema.nameを持ってきてその単語を投げる

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
                        embeddingRaw: response, // 失敗時の仮データ
                        customVectorValues: {
                            values: [
                                { schemaId: 'parameter01', value: 0.1 },
                                { schemaId: 'parameter02', value: 0.2 },
                                { schemaId: 'parameter03', value: 0.2 }
                            ]
                        }
                    }
                }
                newFileDataList.push(newFileData)
            } else {
                newFileDataList.push(existing)
            }
        }

        //解析後上書き保存できるようにidを持っておく
        const embedVecs = newFileDataList.map(file => ({
            id: file.id,
            embeddingRaw: file.vectors.embeddingRaw
        }))

        //pcaへの入力データ
        const rawVecs = embedVecs.map(emb => emb.embeddingRaw)

        // responseとembedVecをPCAに入力して戻り値をそれぞれのjsonファイルに上書きする
        const reducedVec:number[][] = await reduceTo3D(rawVecs)

        const idToReducedVec = new Map<string, number[]>();
        embedVecs.forEach((data, index) => {
            idToReducedVec.set(data.id, reducedVec[index])
        })

        //更新されたものから新しく次元圧縮したものに上書き
        const updatedFileDataList = newFileDataList.map(file => {
            const newEmbedding = idToReducedVec.get(file.id)
            return {
                ...file,
                vectors: {
                    ...file.vectors,
                    embedding: newEmbedding
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

