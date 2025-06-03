import ShowItemInFolder from './ShowItemInFolder'
import { useState, useEffect } from 'react'
import { useAtom } from 'jotai'
import { selectedFileIdAtom } from '../../../state/atoms'
import searchFile from '../utils/searchFile'
import type { FileData } from '../../../types/index'

function TextContent(): React.ReactElement {
  const [selectedFileId] = useAtom(selectedFileIdAtom)
  const [selectedFile, setSelectedFile] = useState<FileData | null>(null)

  useEffect(() => {
    if (!selectedFileId) return
    searchFile({ id: selectedFileId }).then(setSelectedFile)
  }, [selectedFileId])

  return (
    <div className="absolute bottom-0 left-0 p-14 h-dvh max-w-xl ">
      <div className="h-full flex flex-col gap-1">
        {selectedFile && (
          <>
            <ShowItemInFolder title={selectedFile.filePath.split('/').pop()} filePath={selectedFile?.filePath} />
            <p className='ml-3 text-base text-bg'>{selectedFile.fileContent}</p>
          </>
        )}
      </div>
    </div>
  )
}

export default TextContent
