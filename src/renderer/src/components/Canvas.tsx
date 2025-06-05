import * as THREE from 'three'
import { useEffect, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { EffectComposer, DepthOfField, Vignette } from '@react-three/postprocessing'
import type { FileData, Vectors, CustomVectorValue } from '../../../types/index'
import { useAtom } from 'jotai'
import { selectedFileIdAtom, axisXAtom, axisYAtom, axisZAtom } from '../../../state/atoms'

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
): void {
  ctx.beginPath()
  ctx.moveTo(x + radius, y)
  ctx.lineTo(x + width - radius, y)
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius)
  ctx.lineTo(x + width, y + height - radius)
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height)
  ctx.lineTo(x + radius, y + height)
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius)
  ctx.lineTo(x, y + radius)
  ctx.quadraticCurveTo(x, y, x + radius, y)
  ctx.closePath()
  ctx.clip() // apply the mask
}

function createTextTexture(text: string): THREE.Texture {
  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d')

  if (!context) throw new Error('Failed to get 2D context')

  canvas.width = 512
  canvas.height = 512

  drawRoundedRect(context, 0, 0, canvas.width, canvas.height, 32)
  context.fillStyle = '#fff'
  context.strokeStyle = '#ccc'
  context.lineWidth = 4
  context.fillRect(0, 0, canvas.width, canvas.height)
  context.stroke()

  context.fillStyle = '#000000'
  context.font = '32px sans-serif'
  context.textAlign = 'left' //center
  context.textBaseline = 'top' //middle
  const textX = 64
  const textY = 64
  const maxWidth = canvas.width - textX * 2
  const lineHeight = 40

  let line = ''
  let y = textY

  for (let i = 0; i < text.length; i++) {
    const testLine = line + text[i]
    const { width: testWidth } = context.measureText(testLine)

    if (testWidth > maxWidth && i > 0) {
      context.fillText(line, textX, y)
      line = text[i]
      y += lineHeight
    } else {
      line = testLine
    }

    if (y - lineHeight > canvas.height - textY * 2) break
  }

  return new THREE.CanvasTexture(canvas)
}

function Plane({
  id,
  isImage = false,
  text,
  vectors,
  filePath
}: {
  id: string
  isImage?: boolean
  text: string
  vectors: Vectors
  filePath?: string
}): React.ReactElement {
  const [selectedFileId, setSelectedFileId] = useAtom(selectedFileIdAtom)
  const [texture, setTexture] = useState<THREE.Texture | null>(null)
  const [hovered, setHovered] = useState<boolean>(false)

  const [vector, setVector] = useState<THREE.Vector3>(new THREE.Vector3())
  const [axisX] = useAtom(axisXAtom)
  const [axisY] = useAtom(axisYAtom)
  const [axisZ] = useAtom(axisZAtom)
  const amp = 10


  useEffect(() => {
    let x = vectors.embedding[0]
    switch (axisX) {
      case 'ex':
        x = vectors.embedding[0]
        break
      case 'ey':
        x = vectors.embedding[1]
        break
      case 'ez':
        x = vectors.embedding[2]
        break
      default:
        x =
          vectors?.customVectorValues?.find((v: CustomVectorValue) => v.schemaId === axisX)
            ?.value || vectors.embedding[0]
        break
    }

    setVector((prev) => new THREE.Vector3(x * amp, prev.y, prev.z))
  }, [axisX, vectors])

  useEffect(() => {
    let y = vectors.embedding[0]
    switch (axisY) {
      case 'ex':
        y = vectors.embedding[0]
        break
      case 'ey':
        y = vectors.embedding[1]
        break
      case 'ez':
        y = vectors.embedding[2]
        break
      default:
        y =
          vectors?.customVectorValues?.find((v: CustomVectorValue) => v.schemaId === axisY)
            ?.value || vectors.embedding[0]
        break
    }

    setVector((prev) => new THREE.Vector3(prev.x, y * amp, prev.z))
  }, [axisY, vectors])

  useEffect(() => {
    let z = vectors.embedding[0]
    switch (axisZ) {
      case 'ex':
        z = vectors.embedding[0]
        break
      case 'ey':
        z = vectors.embedding[1]
        break
      case 'ez':
        z = vectors.embedding[2]
        break
      default:
        z =
          vectors?.customVectorValues?.find((v: CustomVectorValue) => v.schemaId === axisZ)
            ?.value || vectors.embedding[0]
        break
    }

    setVector((prev) => new THREE.Vector3(prev.x, prev.y, z * amp))
  }, [axisZ, vectors])

  useEffect(() => {
    let cancelled = false

    const loadTexture = async () => {
      if (isImage && filePath) {
        try {
          const base64 = await window.api.getBase64Image(filePath)
          const img = new Image()
          img.src = base64

          img.onload = () => {
            if (cancelled) return

            const canvas = document.createElement('canvas')
            const ctx = canvas.getContext('2d')
            if (!ctx) return

            canvas.width = 512
            canvas.height = 512

            drawRoundedRect(ctx, 0, 0, canvas.width, canvas.height, 32)
            ctx.fillStyle = '#fff'
            ctx.strokeStyle = '#ccc'
            ctx.lineWidth = 4
            ctx.fillRect(0, 0, canvas.width, canvas.height)
            ctx.stroke()

            const canvasAspect = canvas.width / canvas.height
            const imageAspect = img.width / img.height

            let srcX = 0, srcY = 0, srcWidth = img.width, srcHeight = img.height

            if (imageAspect > canvasAspect) {
              // Image is wider — crop horizontally
              srcWidth = img.height * canvasAspect
              srcX = (img.width - srcWidth) / 2
            } else {
              // Image is taller — crop vertically
              srcHeight = img.width / canvasAspect
              srcY = (img.height - srcHeight) / 2
            }

            ctx.drawImage(
              img,
              srcX,
              srcY,
              srcWidth,
              srcHeight,
              0,
              0,
              canvas.width,
              canvas.height
            )

            setTexture(new THREE.CanvasTexture(canvas))
          }
        } catch (e) {
          console.error('Failed to load image texture:', e)
          setTexture(createTextTexture(text))
        }
      } else {
        setTexture(createTextTexture(text))
      }
    }

    loadTexture()

    return () => {
      cancelled = true
    }
  }, [isImage, filePath, text])

  const scale = hovered ? 1.05 : 1
  const handleSelectFile = (fileId: string): void => {
    setSelectedFileId(fileId)
  }

  return (
    <mesh
      scale={scale}
      position={vector}
      onPointerEnter={(e) => {
        e.stopPropagation()
        setHovered(true)
        handleSelectFile(id)
      }}
      onPointerLeave={(e) => {
        e.stopPropagation()
        setHovered(false)
      }}
    >
      <planeGeometry args={[1, 1, 1]} />
      <meshBasicMaterial side={THREE.DoubleSide} map={texture} transparent={true} />
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
        <Plane
          key={data.id}
          isImage={data.fileType === 'jpg' || data.fileType === 'png'}
          id={data.id}
          text={data.fileContent}
          vectors={data.vectors}
          filePath={data.filePath}
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
        enableRotate={false}
        mouseButtons={{
          LEFT: THREE.MOUSE.PAN,   // pan with left click
          MIDDLE: THREE.MOUSE.DOLLY, // zoom with middle click
          RIGHT: THREE.MOUSE.ROTATE  // not used here since rotation is disabled
        }}
      />
      <Planes />
      <EffectComposer>
        <Vignette eskil={false} offset={0.05} darkness={0.65} />
      </EffectComposer>
    </>
  )
}

function MainCanvas(): React.ReactElement {
  return (
    <Canvas camera={{ position: [0, 0, 5], fov: 100 }}>
      <color attach="background" args={['#eee']} />
      <Scene />
    </Canvas>
  )
}

export default MainCanvas
