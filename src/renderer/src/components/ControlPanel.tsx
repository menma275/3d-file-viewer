import OpenDialog from './OpenDialog'
import LoadData from './LoadData'
import Analyze from './Analyze'
import type { FolderPath } from '../../../types/index'
import { useState, useEffect } from 'react'

function ChildPanel({ title, children }: { title: string, children: React.ReactNode }): React.ReactElement {
  return (
    <>
      <p className='ml-1'>{title}</p>
      <div className="flex flex-col gap-2 bg-bg p-3 rounded-lg">
        {children}
      </div>
    </>
  )
}

function ControlPanel(): React.ReactElement {
  const [folderPaths, setFolderPaths] = useState<FolderPath[]>([])

  useEffect(() => {
    window.api.getFolderPaths().then(setFolderPaths)
  })

  return (
    <div className="absolute bottom-6 right-6 max-w-xs flex flex-col gap-2 w-full justify-between bg-mg/30 backdrop-blur-lg  text-xs text-primary p-2 pt-3 rounded-xl cursor-default">
      <ChildPanel title='Folders' >
        <ul className="flex flex-col items-start gap-1 w-full box-border truncate">
          {folderPaths.map((folderPath: FolderPath) => (
            <li key={folderPath.id} className="flex flex-col items-start gap-1">
              <span className="text-sm">{folderPath.customName}</span>
              <span className="text-xs text-primary/50 text-end">{folderPath.folderPath}</span>
            </li>
          ))}
        </ul>
        <OpenDialog />
      </ChildPanel>
      <ChildPanel title='Files' >
        <div className='flex flex-row gap-2'>
          <LoadData />
          <Analyze />
        </div>
      </ChildPanel>
    </div>
  )
}

export default ControlPanel
