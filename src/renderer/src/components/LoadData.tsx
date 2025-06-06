import Button from './Button'

function LoadData(): React.ReactElement {
  return (
    <Button
      onClick={async () => {
        const fileDatas = await window.api.getFileDatas()
        console.log(fileDatas)
      }}
    >
      Load file datas
    </Button>
  )
}

export default LoadData
