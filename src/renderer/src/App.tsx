import MainCanvas from './components/Canvas'
import ControlPanel from './components/ControlPanel'
import AxisControl from './components/AxisControl'
import TextContent from './components/TextContent'

function App(): React.ReactElement {
  return (
    <div className="w-full h-full">
      {/* Main Area */}
      <div className="absolute top-0 left-0 w-full h-dvh ">
        <MainCanvas />
      </div>
      {/* Operation Area */}
      <ControlPanel />
      <AxisControl />
      <TextContent />
    </div>
  )
}

export default App
