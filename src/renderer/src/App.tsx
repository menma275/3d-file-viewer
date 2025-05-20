import MainCanvas from './components/Canvas'

function App(): React.JSX.Element {
  return (
    <div className="mt-3 p-8 w-full h-full overflow-hidden">
      <div className="flex justify-between items-center">
        <div>Hi there</div>
        <div className="text-accent">this is a test</div>
      </div>
      <div className="w-full h-dvh bg-mg">
        <MainCanvas />
      </div>
    </div>
  )
}

export default App
