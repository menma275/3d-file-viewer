const openFolderDialog = async (): Promise<string | null> => {
  const folderPath = await window.api.openFolderDialog()
  if (folderPath) {
    console.log(folderPath)
  }
  return folderPath
}

export default openFolderDialog
