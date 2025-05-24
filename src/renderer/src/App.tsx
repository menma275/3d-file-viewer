import MainCanvas from './components/Canvas'
import Button from './components/Button'
import OpenDialog from './components/OpenDialog'
import ShowFolderPaths from './components/ShowFolderPaths'

import { FaRegBell } from 'react-icons/fa6'

function App(): React.ReactElement {
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
