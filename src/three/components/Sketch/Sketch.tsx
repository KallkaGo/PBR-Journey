import { Environment, OrbitControls } from '@react-three/drei'
import { useInteractStore, useLoadedStore } from '@utils/Store'
import { useEffect, useMemo } from 'react'
import { ShaderMaterial, Uniform } from 'three'
import { Gun } from '../Gun/Gun'
import { IBLofDiffuseBRDF } from '../IBL/IBLofDiffuseBRDF'
import debugFragmentShader from '../shaders/debug/fragment.glsl'
import debugVertexShader from '../shaders/debug/vertex.glsl'

function Sketch() {
  const controlDom = useInteractStore(state => state.controlDom)

  useEffect(() => {
    useLoadedStore.setState({ ready: true })
  }, [])

  return (
    <>
      <OrbitControls domElement={controlDom}  />
      <color attach="background" args={['black']} />
      <Gun />
    </>
  )
}

export default Sketch
