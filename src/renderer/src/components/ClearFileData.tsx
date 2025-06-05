import Button from './Button'

function ClearFileData(): React.ReactElement {
  return (
    <Button
      onClick={async () => {
        await window.api.deleteFileDatas()
        alert('Cleared file datas')
      }}
    >
      Clear file datas
    </Button>
  )
}

export default ClearFileData
