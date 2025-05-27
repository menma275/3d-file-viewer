import OpenDialog from './OpenDialog'
import LoadData from './LoadData'
import Analyze from './Analyze'
import Button from "./Button"
import { FiSidebar } from "react-icons/fi";
import { BsLayoutSidebarReverse } from "react-icons/bs";
import type { FolderPath } from '../../../types/index'
import { useState, useEffect } from 'react'

function ChildPanel({ title, children }: { title: string, children: React.ReactNode }): React.ReactElement {
  return (
    <div className='flex flex-col gap-2'>
      <p className='ml-1.5 font-medium'>{title}</p>
      <div className="flex flex-col gap-2 bg-bg p-3 rounded-lg">
        {children}
      </div>
    </div>
  )
}

function ControlPanel(): React.ReactElement {
  const [isOpen, setIsOpen] = useState<boolean>(false)
  const [folderPaths, setFolderPaths] = useState<FolderPath[]>([])

  useEffect(() => {
    window.api.getFolderPaths().then(setFolderPaths)
  })

  return (
    <div className="absolute bottom-0 right-0 p-2 h-dvh max-w-xs">
      {isOpen && (
        <div className="flex flex-col gap-2 pt-10 w-full h-full justify-between bg-mg/30 backdrop-blur-lg text-xs text-primary p-2 pt-3 border-[0.5px] border-bdr rounded-xl cursor-default">
          <ChildPanel title='File Content' >
            <div className='h-full'>
              hi
            </div>
          </ChildPanel>
          <div className='flex flex-col gap-3'>
            <ChildPanel title='Refrenced Folders'>
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
            <ChildPanel title='Manage Files' >
              <div className='flex flex-row gap-2'>
                <LoadData />
                <Analyze />
              </div>
            </ChildPanel>
          </div>
        </div>
      )}
      <div className='fixed top-4 right-4'>
        <Button isFull={false} onClick={() => setIsOpen(!isOpen)}>
          <BsLayoutSidebarReverse className='text-sm' />
        </Button>
      </div>
    </div>
  )
}

export default ControlPanel
