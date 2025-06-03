import Button from './Button'
import { useEffect, useState } from 'react'
import { FiArrowUpRight } from "react-icons/fi";

function ShowItemInFolder({ filePath, title = "Open File" }: { filePath: string, title?: string }): React.ReactElement {
  const [path, setPath] = useState<string>(filePath)

  useEffect(() => {
    setPath(filePath)
  }, [filePath])

  const handleShow = async () => {
    if (path) await window.api.showItemInFolder(path)

  }

  return (
    <Button onClick={() => handleShow()} isFull={false} isFill={false}>
      <p className='text-base flex flex-row gap-1 items-center'>
        {title}
        <FiArrowUpRight className='text-xl' />
      </p>
    </Button>
  )
}

export default ShowItemInFolder
