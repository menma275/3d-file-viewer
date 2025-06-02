import OpenDialog from './OpenDialog'
import LoadData from './LoadData'
import Analyze from './Analyze'
import Button from './Button'
import ShowItemInFolder from './ShowItemInFolder'
import { BsLayoutSidebarReverse } from 'react-icons/bs'
import type { FolderPath } from '../../../types/index'
import { useState, useEffect } from 'react'
import { useAtom } from 'jotai'
import { selectedFileIdAtom } from '../../../state/atoms'
import searchFile from '../utils/searchFile'
import type { FileData, CustomVectorSchema } from '../../../types/index'

function ChildPanel({
  title,
  children
}: {
  title: string
  children: React.ReactNode
}): React.ReactElement {
  return (
    <div className="flex flex-col gap-2">
      <p className="ml-1.5 font-medium ">{title}</p>
      <div className="flex flex-col gap-2 bg-bg p-3 rounded-lg">{children}</div>
    </div>
  )
}

function ControlPanel(): React.ReactElement {
  const [isOpen, setIsOpen] = useState<boolean>(true)
  const [folderPaths, setFolderPaths] = useState<FolderPath[]>([])
  const [selectedFile, setSelectedFile] = useState<FileData | null>(null)
  const [selectedFileId] = useAtom(selectedFileIdAtom)
  const [vectorName, setVectorName] = useState<string>('')
  const [customVectors, setCustomVectors] = useState<CustomVectorSchema[]>([])

  useEffect(() => {
    window.api.getFolderPaths().then(setFolderPaths)
  }, [])

  useEffect(() => {
    window.api.getCustomVectorName().then(setCustomVectors)
  }, [])

  useEffect(() => {
    if (!selectedFileId) return
    searchFile({ id: selectedFileId }).then(setSelectedFile)
  }, [selectedFileId])

  const setCustomVectorName = (): void => {
    window.api.addCustomVectorName(vectorName)
  }

  return (
    <div className="absolute bottom-0 right-0 p-2 h-dvh max-w-xs ">
      {isOpen && (
        <div className="flex flex-col gap-2 pt-10 w-full h-full justify-between bg-mg/30 backdrop-blur-md text-xs text-primary p-2 pt-3 border-[0.5px] border-bdr rounded-xl cursor-default overflow-x-hidden overflow-y-auto">
          <ChildPanel title="File Content">
            <div className="h-full flex flex-col gap-1">
              <p className="text-secondary">
                {selectedFile
                  ? selectedFile.filePath.split('/').pop()
                  : 'No File Selected : Click a file to see its content'}
              </p>
              {selectedFile && (
                <>
                  <p>{selectedFile.fileContent}</p>
                  <ShowItemInFolder filePath={selectedFile?.filePath} />
                </>
              )}
            </div>
          </ChildPanel>
          <div className="flex flex-col gap-3">
            <ChildPanel title="Refrenced Folders">
              <ul className="flex flex-col items-start gap-1 w-full box-border truncate">
                {folderPaths.map((folderPath: FolderPath) => (
                  <li key={folderPath.id} className="flex flex-col items-start gap-1">
                    <span className="text-sm">{folderPath.customName}</span>
                    <span className="text-xs text-secondary text-end">{folderPath.folderPath}</span>
                  </li>
                ))}
              </ul>
              <OpenDialog />
            </ChildPanel>
            <ChildPanel title="Manage Files">
              <div className="flex flex-row gap-2">
                <LoadData />
                <Analyze />
              </div>
            </ChildPanel>
            <ChildPanel title="Existing Vectors">
              {customVectors && (
                <ul className="flex flex-col items-start gap-1 w-full box-border truncate">
                  {customVectors.map((vector: CustomVectorSchema) => (
                    <li key={vector.id} className="flex flex-col items-start gap-1">
                      <span className="text-sm">{vector.name}</span>
                    </li>
                  ))}
                </ul>
              )}
              <input
                type="text"
                value={vectorName}
                onChange={(e) => setVectorName(e.target.value)}
                placeholder="Enter Custom Name"
              />
              <Button onClick={() => setCustomVectorName()}>Add Custom Name</Button>
            </ChildPanel>
          </div>
        </div>
      )}
      <div className="fixed top-4 right-4">
        <Button isFull={false} onClick={() => setIsOpen(!isOpen)}>
          <BsLayoutSidebarReverse className="text-sm" />
        </Button>
      </div>
    </div>
  )
}

export default ControlPanel
