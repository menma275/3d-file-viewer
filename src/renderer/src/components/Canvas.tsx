import * as THREE from 'three'
import { useMemo, useEffect, useState, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
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
  position,
  filePath
}: {
  id: string
  isImage?: boolean
  text: string
  position: THREE.Vector3
  filePath?: string
}): React.ReactElement {
  const [selectedFileId, setSelectedFileId] = useAtom(selectedFileIdAtom)
  const [texture, setTexture] = useState<THREE.Texture | null>(null)
  const [hovered, setHovered] = useState<boolean>(false)

  // Create Texture
  useEffect(() => {
    let cancelled = false

    const loadTexture = async (): Promise<void> => {
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

            let srcX = 0,
              srcY = 0,
              srcWidth = img.width,
              srcHeight = img.height

            if (imageAspect > canvasAspect) {
              // Image is wider — crop horizontally
              srcWidth = img.height * canvasAspect
              srcX = (img.width - srcWidth) / 2
            } else {
              // Image is taller — crop vertically
              srcHeight = img.width / canvasAspect
              srcY = (img.height - srcHeight) / 2
            }

            ctx.drawImage(img, srcX, srcY, srcWidth, srcHeight, 0, 0, canvas.width, canvas.height)

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

  const ref = useRef<THREE.Mesh>(null)

  // 位置のアニメーション
  useFrame(() => {
    if (!ref.current) return
    ref.current.position.lerp(position, 0.15)
  })

  // スケールのアニメーション
  useFrame(() => {
    if (!ref.current) return
    const targetScale = hovered ? 1.05 : 1
    const current = ref.current.scale
    const target = new THREE.Vector3(targetScale, targetScale, targetScale)
    current.lerp(target, 0.3) // スムーズに補間
  })

  const handlePointerEnter = (e: PointerEvent): void => {
    e.stopPropagation()
    handleSelectFile(id)
    setHovered(true)
  }
  const handlePointerLeave = (e: PointerEvent): void => {
    e.stopPropagation()
    setHovered(false)
  }
  const handleSelectFile = (fileId: string): void => {
    setSelectedFileId(fileId)
  }

  return (
    <mesh ref={ref} onPointerEnter={handlePointerEnter} onPointerLeave={handlePointerLeave}>
      <planeGeometry args={[1, 1, 1]} />
      <meshBasicMaterial side={THREE.DoubleSide} map={texture} transparent={true} />
    </mesh>
  )
}

function Planes(): React.ReactElement {
  const [datas, setDatas] = useState<FileData[]>([])
  const [positions, setPositions] = useState<THREE.Vector3[]>([])
  const [axisX] = useAtom(axisXAtom)
  const [axisY] = useAtom(axisYAtom)
  const [axisZ] = useAtom(axisZAtom)
  const amp = 10

  useEffect(() => {
    window.api.getFileDatas().then(setDatas)
  }, [])

  useEffect(() => {
    const newPosition: THREE.Vector3[] = datas.map((data: FileData) => {
      const originDataX = data.vectors.customVectorValues.find((v) => v.schemaId === axisX)
      const originDataY = data.vectors.customVectorValues.find((v) => v.schemaId === axisY)
      const originDataZ = data.vectors.customVectorValues.find((v) => v.schemaId === axisZ)

      const defaultIds = ['ex', 'ey', 'ez']

      const originDataXValue = originDataX?.value ?? 0
      const originDataYValue = originDataY?.value ?? 0
      const originDataZValue = originDataZ?.value ?? 0

      const originDataXId = originDataX?.schemaId ?? ''
      const originDataYId = originDataY?.schemaId ?? ''
      const originDataZId = originDataZ?.schemaId ?? ''

      const originX = defaultIds.includes(originDataXId)
        ? originDataXValue
        : (originDataXValue - 0.75) * 1.5
      const originY = defaultIds.includes(originDataYId)
        ? originDataYValue
        : (originDataYValue - 0.75) * 1.5
      const originZ = defaultIds.includes(originDataZId)
        ? originDataZValue
        : (originDataZValue - 0.75) * 1.5

      const x = originX * amp
      const y = originY * amp
      const z = originZ * amp

      // const x = originDataXValue * amp
      // const y = originDataYValue * amp
      // const z = originDataZValue * amp

      return new THREE.Vector3(x, y, z)
    })
    setPositions(newPosition)
  }, [datas, axisX, axisY, axisZ])

  const planeComponents = useMemo(() => {
    if (positions.length === 0) return null
    return datas.map((data, index) => (
      <Plane
        key={data.id}
        isImage={data.fileType === 'jpg' || data.fileType === 'jpeg' || data.fileType === 'png'}
        id={data.id}
        text={data.fileContent}
        position={positions[index]}
        filePath={data.filePath}
      />
    ))
  }, [positions, datas])

  return <>{planeComponents}</>
}

function MainCanvas(): React.ReactElement {
  return (
    <Canvas camera={{ position: [0, 0, 5], fov: 100 }}>
      <color attach="background" args={['#eee']} />
      <OrbitControls
        enableZoom={true}
        enablePan={true}
        enableRotate={false}
        mouseButtons={{
          LEFT: THREE.MOUSE.PAN, // pan with left click
          MIDDLE: THREE.MOUSE.DOLLY, // zoom with middle click
          RIGHT: THREE.MOUSE.ROTATE // not used here since rotation is disabled
        }}
      />
      <Planes />
      <EffectComposer>
        <Vignette eskil={false} offset={0.05} darkness={0.65} />
      </EffectComposer>
    </Canvas>
  )
}

export default MainCanvas
