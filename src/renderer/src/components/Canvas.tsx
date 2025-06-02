import * as THREE from 'three'
import { useMemo, useEffect, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { EffectComposer, DepthOfField, Vignette } from '@react-three/postprocessing'
import type { FileData, Vectors } from '../../../types/index'
import { useAtom } from 'jotai'
import { selectedFileIdAtom } from '../../../state/atoms'

function createTextTexture(text: string): THREE.Texture {
  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d')

  if (!context) throw new Error('Failed to get 2D context')

  canvas.width = 512
  canvas.height = 512

  context.fillStyle = '#ffffff'
  context.fillRect(0, 0, canvas.width, canvas.height)

  context.fillStyle = '#000000'
  context.font = '32px sans-serif'
  context.textAlign = 'left' //center
  context.textBaseline = 'top' //middle
  const textX = canvas.width / 7.5
  const textY = canvas.height / 7.5
  context.fillText(text, textX, textY)

  return new THREE.CanvasTexture(canvas)
}

function PlaneWithTextTexture({
  id,
  text,
  vectors
}: {
  id: string
  text: string
  vectors: Vectors
}): React.ReactElement {
  const [vector, setVector] = useState<THREE.Vector3>(new THREE.Vector3())
  const [selectedFileId, setSelectedFileId] = useAtom(selectedFileIdAtom)
  const texture = useMemo(() => createTextTexture(text), [])

  useEffect(() => {
    const amp = 10
    let x = vectors.embedding[0]
    let y = vectors.embedding[1]
    let z = vectors.embedding[2]
    x = x * amp - amp / 2
    y = y * amp - amp / 2
    z = -z * amp
    // x = Math.random() * amp - amp / 2
    // y = Math.random() * amp - amp / 2
    // z = -Math.random() * amp
    setVector(new THREE.Vector3(x, y, z))
  }, [])

  const handleClick = (fileId: string): void => {
    setSelectedFileId(fileId)
  }

  return (
    <mesh position={vector} onClick={() => handleClick(id)}>
      <planeGeometry args={[1, 1, 1]} />
      <meshBasicMaterial side={THREE.DoubleSide} map={texture} />
    </mesh>
  )
}

function Planes(): React.ReactElement {
  const [datas, setDatas] = useState<FileData[]>([])

  useEffect(() => {
    window.api.getFileDatas().then(setDatas)
  })

  return (
    <>
      {datas.map((data: FileData) => (
        <PlaneWithTextTexture
          key={data.id}
          id={data.id}
          text={data.fileContent}
          vectors={data.vectors}
        />
      ))}
    </>
  )
}

function Scene(): React.ReactElement {
  return (
    <>
      <OrbitControls
        enableZoom={true}
        enablePan={true}
        mouseButtons={{
          LEFT: 0, // Rotate (default)
          MIDDLE: 1, // Zoom
          RIGHT: 2 // Pan OR rotate — we’ll customize below
        }}
      />
      <Planes />
      <EffectComposer>
        {/* <DepthOfField focusDistance={0} focalLength={0.05} bokehScale={5} height={480} /> */}
        <Vignette eskil={false} offset={0.05} darkness={0.65} />
      </EffectComposer>
    </>
  )
}

function MainCanvas(): React.ReactElement {
  return (
    <Canvas camera={{ position: [0, 0, 5], fov: 100 }}>
      <color attach="background" args={['#eee']} />
      {/* <color attach="background" args={['#252525']} /> */}
      <Scene />
    </Canvas>
  )
}

export default MainCanvas
