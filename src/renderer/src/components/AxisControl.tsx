import { useAtom } from 'jotai'
import { axisXAtom, axisYAtom, axisZAtom } from '../../../state/atoms'
import { useState, useEffect } from 'react'
import type { CustomVectorSchema } from '../../../types/index'

function AxisControl(): React.ReactElement {
  const [axisX, setAxisX] = useAtom(axisXAtom)
  const [axisY, setAxisY] = useAtom(axisYAtom)
  const [axisZ, setAxisZ] = useAtom(axisZAtom)
  const [axisList, setAxisList] = useState<CustomVectorSchema[]>([])

  useEffect(() => {
    window.api.getCustomVectorName().then(setAxisList)
  }, [])

  return (
    <div className="flex flex-col gap-4 w-full h-full justify-between  text-xs text-primary ">
      <label className="flex w-full justify-between items-center gap-2">
        X
        <select
          className="bg-mg p-1 rounded-md"
          onChange={(e) => setAxisX(e.target.value)}
          value={axisX}
        >
          {axisList.map((axis: CustomVectorSchema) => (
            <option key={axis.id} value={axis.id}>
              {axis.name}
            </option>
          ))}
        </select>
      </label>
      <label className="flex w-full justify-between items-center gap-2">
        Y
        <select
          className="bg-mg p-1 rounded-md"
          onChange={(e) => setAxisY(e.target.value)}
          value={axisY}
        >
          {axisList.map((axis: CustomVectorSchema) => (
            <option key={axis.id} value={axis.id}>
              {axis.name}
            </option>
          ))}
        </select>
      </label>
      <label className="flex w-full justify-between items-center gap-2">
        Z
        <select
          className="bg-mg p-1 rounded-md"
          onChange={(e) => setAxisZ(e.target.value)}
          value={axisZ}
        >
          {axisList.map((axis: CustomVectorSchema) => (
            <option key={axis.id} value={axis.id}>
              {axis.name}
            </option>
          ))}
        </select>
      </label>
    </div>
  )
}

export default AxisControl
