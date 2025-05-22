const openFolderDialog = async (): Promise<string | null> => {
  const folderPath = await window.api.openFolderDialog()
  return folderPath
}

export default openFolderDialog
