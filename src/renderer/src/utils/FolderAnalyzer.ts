import { readFile, readdir, stat } from 'node:fs/promises';
import { v4 as uuidv4 } from 'uuid';
import ollama from 'ollama';
const Store = require('electron-store') as typeof import('electron-store');

const store = new Store();

async function fileAnalyze(path: string): Promise<void> {
    try {
        // 既存のフォルダ情報を検索して異なったidで重複して保存するのを避ける
        let folderId: string | null = null;
        for (const key of Object.keys(store.store)) {
            if (key.startsWith('folder-')) {
                const folderData = store.get(key) as {folderPath: string, id: string};
                if (folderData.folderPath === path) {
                    folderId = folderData.id;
                    break;
                }
            }
        }
        if (!folderId) {
            folderId = uuidv4();
            //フォルダのjson生成
            store.set(`folder-${folderId}`, {
                id: folderId,
                customName: path.split('/').pop(),
                folderPath: path
            });
        }
        const files = await readdir(path);
        for (const fileName of files) {
            const filePath = path + '/' + fileName;
            const fileStat = await stat(filePath);
            const existingFileKey = Object.keys(store.store).find(key => {
                if (key.startsWith('file-')) {
                    const fileData = store.get(key) as { parent: string; filePath: string };
                    return fileData.parent === path && fileData.filePath === fileName;
                }
                return false;
            });
            let needAnalyze = true;
            if (existingFileKey) {
                const existingFileData = store.get(existingFileKey) as { updatedAt: string; analyzedAt: string };
                if (new Date(existingFileData.updatedAt) <= new Date(existingFileData.analyzedAt)) {
                    // 更新日時が解析日時より新しくないので再解析不要
                    needAnalyze = false;
                }
            }
            if (needAnalyze) {
                const fileContent = await readFile(filePath, 'utf-8');
                const response = await ollama.embeddings({model: 'nomic-embed-text', prompt: fileContent});
                const fileId = existingFileKey ? existingFileKey.replace('file-', '') : uuidv4();
                //ファイルのjson生成
                const fileData = {
                    id: fileId,
                    parent: path,
                    filePath: fileName,
                    fileType: fileName.split('.').pop(),
                    fileContent: fileContent,
                    createdAt: fileStat.birthtime.toISOString(),
                    updatedAt: fileStat.mtime.toISOString(),
                    analyzedAt: new Date().toISOString(),
                    vectors: {
                        //embeddingの処理についてはまだ未実装
                        // embedding: response.embedding,
                        embedding: [0.1, 0.2, 0.3],
                        parameter01: 0.1,
                        parameter02: 0.2,
                        parameter03: 0.2
                    }
                };
                store.set(`file-${fileId}`, fileData);
            }
        }
    } catch (err) {
        console.error(err);
    }
}

export default fileAnalyze;