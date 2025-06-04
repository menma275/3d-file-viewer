import dataAnalyze from '../utils/diffAnalyzer';
import Button from './Button';
import type { FileData } from '../../../types/index'

function OpenDialog(): React.ReactElement {
    return (
        <Button
            onClick={async () => {
                const folders = await window.api.getFolderPaths();
                const folderPaths: string[] = folders.map(folder => folder.folderPath);
                const textFiles: string[] = []
                const graphicFiles: string[] = []
                for (const folderPath of folderPaths) {
                    const fileNames = await window.api.readDir(folderPath)
                    if(fileNames){
                        for (const name of fileNames) {
                            // 隠しファイルを除外
                            if (name.charAt(0) !== '.') {
                                const fullPath = `${folderPath}/${name}`
                                const ext = name.split('.').pop()?.toLowerCase()

                                if (['txt', 'md', 'json'].includes(ext || '')) {
                                textFiles.push(fullPath)
                                } else if (['png', 'jpg', 'jpeg', 'gif'].includes(ext || '')) {
                                // 必要なら画像ファイルの処理もここで書く
                                graphicFiles.push(fullPath)
                                }
                            }
                        }
                    }
                }

                const textFileContents = await Promise.all(
                    textFiles.map(filePath => window.api.readFile(filePath))
                );

                const graphicFileContents = await Promise.all(
                    graphicFiles.map(filePath => window.api.readFile(filePath))
                )

                const stats = await Promise.all(
                    textFiles.map(filePath => window.api.statFile(filePath))
                );

                const gStats = await Promise.all(
                    graphicFiles.map(filePath => window.api.statFile(filePath))
                )

                const analyzedDatas = await window.api.getFileDatas();

                const newData:FileData[] = await dataAnalyze(analyzedDatas, graphicFiles, graphicFileContents, textFiles, textFileContents, gStats,stats);
                
                if (newData === null) return;

                await window.api.addFileDatas(newData);
                alert('新しいデータを追加しました');
            }}
            >
            Add file data
        </Button>
    );
}

export default OpenDialog;