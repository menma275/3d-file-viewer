import MainCanvas from './components/Canvas'
import OpenDialog from './components/OpenDialog'
import LoadData from './components/LoadData'
import Analyze from './components/Analyze'
import { useState, useEffect } from 'react'
import type { FolderPath } from '../../types/index'

function App(): React.ReactElement {
  const [folderPaths, setFolderPaths] = useState<FolderPath[]>([])

  useEffect(() => {
    window.api.getFolderPaths().then(setFolderPaths)
  })

  return (
    <div className="w-full h-full overflow-hidden">
      {/* Main Area */}
      <div className="absolute top-0 left-0 w-full h-dvh ">
        <MainCanvas />
      </div>
      {/* Operation Area */}
      <div
        className="absolute bottom-0 right-0 p-8 pt-12 w-fit h-fit flex flex-col
        justify-end items-center"
      >
        <div className="flex flex-col gap-2 w-full justify-between bg-mg/10 backdrop-blur-lg  text-xs text-primary p-4 rounded-xl cursor-default">
          <p>Folders</p>
          <ul>
            {folderPaths.map((folderPath: FolderPath) => (
              <li className='flex flex-col items-start gap-1'>
                <span className='text-sm'>{folderPath.customName}</span>
                <span className='text-xs text-primary/50'>{folderPath.folderPath}</span>
              </li>
            ))}
          </ul>
          <OpenDialog />
          <p>Manage Files</p>
          <LoadData />
          <Analyze />
        </div>
      </div>
    </div>
  )
}

export default App
