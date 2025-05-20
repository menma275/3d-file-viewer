import MainCanvas from './components/Canvas'

function App(): React.JSX.Element {
  return (
    <div className="w-full h-full overflow-hidden">
      <div
        className="absolute top-0 left-0 p-8 pt-12 w-full h-full flex flex-col
        justify-between items-center"
      >
        <div className="flex flex-row w-full justify-between">
          <div>Hi there</div>
          <div className="text-accent">this is a test</div>
        </div>

        <div className="flex flex-row w-full justify-between">
          <button className="bg-mg text-bg px-4 py-2 rounded-xl text-xs ">なんらかのボタン1</button>
          <button className="bg-mg text-accent px-4 py-2 rounded-xl text-xs">
            なんらかのボタン2
          </button>
        </div>
      </div>
      <div className="absolute top-0 left-0 w-full h-dvh bg-transparent">
        <MainCanvas />
      </div>
    </div>
  )
}

export default App
