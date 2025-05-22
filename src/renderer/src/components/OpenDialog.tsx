import openFolderDialog from '../utils/dialog'
import Button from './Button'

function OpenDialog(): React.ReactElement {
  return (
    <Button
      onClick={async () => {
        const folderPath = await openFolderDialog()
        alert(folderPath)
        if (folderPath === null) return
        await window.api.addFolderPath(folderPath)
      }}
    >
      Add folder paths
    </Button>
  )
}

export default OpenDialog
