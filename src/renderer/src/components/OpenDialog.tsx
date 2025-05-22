import openFolderDialog from '../utils/dialog'
import Button from './Button'
import { FaRegFolderOpen } from 'react-icons/fa6'

function OpenDialog(): React.ReactElement {
  return (
    <Button
      onClick={async () => {
        const folderPath = await openFolderDialog()
        alert(folderPath)
      }}
    >
      <FaRegFolderOpen />
    </Button>
  )
}

export default OpenDialog
