import Button from './Button'
import { useEffect, useState } from 'react'

function ShowItemInFolder({ filePath }: { filePath: string }) {
  const [path, setPath] = useState<string>(filePath)

  useEffect(() => {
    setPath(filePath)
  }, [filePath])

  const handleShow = async () => {
    if (path) await window.api.showItemInFolder(path)

  }

  return (
    <Button onClick={() => handleShow()}>Open File</Button>
  )
}

export default ShowItemInFolder
