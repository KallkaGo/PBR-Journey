import { OrbitControls, useEnvironment } from '@react-three/drei'
import { useThree } from '@react-three/fiber'
import { useInteractStore, useLoadedStore } from '@utils/Store'
import { useEffect } from 'react'
import { Gun } from '../Gun/Gun'
import RES from '../RES'

function Sketch() {
  const controlDom = useInteractStore(state => state.controlDom)

  const scene = useThree(state => state.scene)

  const hdrTexture = useEnvironment({ files: RES.texture.hdr })

  useEffect(() => {
    scene.background = hdrTexture

    useLoadedStore.setState({ ready: true })
  }, [])

  return (
    <>
      <OrbitControls domElement={controlDom} />
      <color attach="background" args={['black']} />
      <Gun />
    </>
  )
}

export default Sketch
