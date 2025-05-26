import dataAnalyze from '../utils/diffAnalyzer';
import Button from './Button';

function OpenDialog(): React.ReactElement {
    return (
        <Button
            onClick={async () => {
                const folders = await window.api.getFolderPaths();
                const folderPaths: string[] = folders.map(folder => folder.folderPath);
                const allFiles: string[] = [];
                for (const folderPath of folderPaths) {
                    const fileNames = await window.api.readDir(folderPath);
                    for (const name of fileNames) {
                        allFiles.push(`${folderPath}/${name}`);
                    }
                }

                const fileContents = await Promise.all(
                    allFiles.map(filePath => window.api.readFile(filePath))
                );

                const stats = await Promise.all(
                    allFiles.map(filePath => window.api.statFile(filePath))
                );

                const analyzedDatas = await window.api.getFileDatas();

                const newData = await dataAnalyze(analyzedDatas, folderPaths, allFiles, fileContents, stats);
                
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