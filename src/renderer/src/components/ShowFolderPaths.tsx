import Button from './Button'

function ShowFolderPaths(): React.ReactElement {
  return (
    <Button
      onClick={async () => {
        const folderPath = await window.api.getFolderPaths()
        console.log(folderPath)
      }}
    >
      Show folder paths
    </Button>
  )
}

export default ShowFolderPaths
