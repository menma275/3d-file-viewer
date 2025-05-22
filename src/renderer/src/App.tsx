import MainCanvas from './components/Canvas'
import Button from './components/Button'
import OpenDialog from './components/OpenDialog'
import ShowFolderPaths from './components/ShowFolderPaths'

import { FaRegBell } from 'react-icons/fa6'

function App(): React.ReactElement {
  return (
    <div className="w-full h-full overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-dvh bg-transparent">
        <MainCanvas />
      </div>
      <div
        className="absolute bottom-0 left-0 p-8 pt-12 w-fit h-full flex flex-col
        justify-end items-center"
      >
        <div className="flex flex-row gap-2 w-full justify-between">
          <Button
            onClick={() => {
              alert('Hello!')
            }}
          >
            <FaRegBell />
          </Button>
          <OpenDialog />
          <ShowFolderPaths />
        </div>
      </div>
    </div>
  )
}

export default App
