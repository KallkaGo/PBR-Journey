import { OrbitControls, OrthographicCamera } from '@react-three/drei'
import { useInteractStore, useLoadedStore } from '@utils/Store'
import { useEffect, useMemo } from 'react'
import { ShaderMaterial, Uniform } from 'three'
import { FullScreenTriangle } from '../FullScreenTriangle/FullScreenTriangle'
import { IBLofDiffuseBRDF } from '../IBL/IBLofDiffuseBRDF'
import debugFragmentShader from '../shaders/debug/fragment.glsl'
import debugVertexShader from '../shaders/debug/vertex.glsl'

function Sketch() {
  const controlDom = useInteractStore(state => state.controlDom)

  const prefilterEnvMapDiffuse = IBLofDiffuseBRDF()

  const uniforms = useMemo(() => ({
    uDebugTexture: new Uniform(prefilterEnvMapDiffuse),
  }), [])

  const material = useMemo(() => new ShaderMaterial({
    vertexShader: debugVertexShader,
    fragmentShader: debugFragmentShader,
    uniforms,
  }), [])

  useEffect(() => {
    useLoadedStore.setState({ ready: true })
  }, [])

  return (
    <>
      <OrbitControls domElement={controlDom} enabled={false} />
      <color attach="background" args={['black']} />
      <OrthographicCamera makeDefault manual top={1} bottom={-1} left={-1} right={1} near={0} far={1} />
      <FullScreenTriangle material={material} />
    </>
  )
}

export default Sketch
