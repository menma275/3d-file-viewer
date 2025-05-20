import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'

function MainCanvas(): React.JSX.Element {
  return (
    <Canvas>
      <mesh>
        <boxGeometry />
        <meshStandardMaterial color="orange" />
      </mesh>
      <ambientLight intensity={0.75} />
      <directionalLight position={[-5, 5, 5]} />
      <OrbitControls
        enableZoom={true}
        enablePan={true}
        mouseButtons={{
          LEFT: 0, // Rotate (default)
          MIDDLE: 1, // Zoom
          RIGHT: 2 // Pan OR rotate — we’ll customize below
        }}
      />
    </Canvas>
  )
}

export default MainCanvas
