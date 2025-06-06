import { Canvas } from '@react-three/fiber'
import { useInteractStore } from '@utils/Store'
import { Leva } from 'leva'
import { Perf } from 'r3f-perf'
import { Suspense } from 'react'
import { NoToneMapping } from 'three'
import Sketch from './components/Sketch/Sketch'

export default function ThreeContainer() {
  const demand = useInteractStore(state => state.demand)
  return (
    <>
      <Leva collapsed hidden={location.hash !== '#debug'} />
      <Canvas
        frameloop={demand ? 'never' : 'always'}
        className="webgl"
        dpr={[1, 1]}
        camera={{
          fov: 50,
          near: 0.1,
          position: [1.5, 0, 1.5],
          far: 100,
        }}
        gl={{ toneMapping: NoToneMapping }}

      >
        {location.hash.includes('debug') && (
          <Perf position="top-left" />
        )}
        <Suspense fallback={null}>
          <Sketch />
        </Suspense>
      </Canvas>
    </>
  )
}
