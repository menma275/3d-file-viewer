// import { useAtom } from 'jotai'
// import { axisXAtom, axisYAtom, axisZAtom } from '../../../state/atoms'

function AxisControl(): React.ReactElement {
  // const [axisX, setAxisX] = useAtom(axisXAtom)
  // const [axisY, setAxisY] = useAtom(axisYAtom)
  // const [axisZ, setAxisZ] = useAtom(axisZAtom)

  return (
    <div className="absolute bottom-0 left-0 p-15 h-fit w-fit">
      <div className="flex flex-row gap-4 w-full h-full justify-between bg-mg/30 backdrop-blur-lg text-xs text-primary p-3 border-[0.5px] border-bdr rounded-xl cursor-default">
        <label>
          X
          <select>
            <option>Option 01</option>
            <option>Option 02</option>
            <option>Option 03</option>
          </select>
        </label>
        <label>
          Y
          <select>
            <option>Option 01</option>
            <option>Option 02</option>
            <option>Option 03</option>
          </select>
        </label>
        <label>
          Z
          <select>
            <option>Option 01</option>
            <option>Option 02</option>
            <option>Option 03</option>
          </select>
        </label>
      </div>
    </div>
  )
}

export default AxisControl
