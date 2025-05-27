import MainCanvas from './components/Canvas'
import ControlPanel from './components/ControlPanel'

function App(): React.ReactElement {

  return (
    <div className="w-full h-full box-border">
      {/* Main Area */}
      <div className="absolute top-0 left-0 w-full h-dvh ">
        <MainCanvas />
      </div>
      {/* Operation Area */}
      <ControlPanel />
    </div>
  )
}

export default App
