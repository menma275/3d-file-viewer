import { useAtom } from 'jotai'
import { axisXAtom, axisYAtom, axisZAtom } from '../../../state/atoms'
import { useState, useEffect } from 'react'
import type { CustomVectorSchema } from '../../../types/index'

function AxisControl(): React.ReactElement {
  const [axisX, setAxisX] = useAtom(axisXAtom)
  const [axisY, setAxisY] = useAtom(axisYAtom)
  const [axisZ, setAxisZ] = useAtom(axisZAtom)
  const [axisList, setAxisList] = useState<string[]>(['ex', 'ey', 'ez'])
  const [customAxisList, setCustomAxisList] = useState<CustomVectorSchema[]>([])

  useEffect(() => {
    window.api.getCustomVectorName().then(setCustomAxisList)
  }, [])

  useEffect(() => {
    setAxisList((prevList) => [
      ...new Set([...prevList, ...customAxisList.map((axis) => axis.name)])
    ])
  }, [customAxisList])

  const handleAxisId = (name: string): string => {
    if (['ex', 'ey', 'ez'].includes(name)) return name

    const axis = customAxisList.find((axis) => axis.name === name)

    if (axis?.id) return axis.id
    else return ''
  }

  return (
    <div className="flex flex-col gap-4 w-full h-full justify-between  text-xs text-primary ">
      <label className="flex w-full justify-between items-center gap-2">
        X
        <select
          className="bg-mg p-1 rounded-md"
          onChange={(e) => setAxisX(handleAxisId(e.target.value))}
          value={axisX}
        >
          {axisList.map((axis: string) => (
            <option key={axis} value={axis}>
              {axis}
            </option>
          ))}
        </select>
      </label>
      <label className="flex w-full justify-between items-center gap-2">
        Y
        <select
          className="bg-mg p-1 rounded-md"
          onChange={(e) => setAxisY(handleAxisId(e.target.value))}
          value={axisY}
        >
          {axisList.map((axis: string) => (
            <option key={axis} value={axis}>
              {axis}
            </option>
          ))}
        </select>
      </label>
      <label className="flex w-full justify-between items-center gap-2">
        Z
        <select
          className="bg-mg p-1 rounded-md"
          onChange={(e) => setAxisZ(handleAxisId(e.target.value))}
          value={axisZ}
        >
          {axisList.map((axis: string) => (
            <option key={axis} value={axis}>
              {axis}
            </option>
          ))}
        </select>
      </label>
    </div>
  )
}

export default AxisControl
