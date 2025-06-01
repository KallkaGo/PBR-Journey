import { OrbitControls, OrthographicCamera, useEnvironment } from '@react-three/drei'
import { useThree } from '@react-three/fiber'
import { useInteractStore, useLoadedStore } from '@utils/Store'
import { useEffect, useMemo } from 'react'
import { NearestMipMapLinearFilter, ShaderMaterial, Uniform } from 'three'
import { FullScreenTriangle } from '../FullScreenTriangle/FullScreenTriangle'
import { PrefilterSpecular } from '../IBL/PrefilterSpecular'
import RES from '../RES'
import debugFragment from '../shaders/debug/fragment.glsl'
import debugVertex from '../shaders/debug/vertex.glsl'

function Sketch() {
  const controlDom = useInteractStore(state => state.controlDom)

  const scene = useThree(state => state.scene)

  const hdrTexture = useEnvironment({ files: RES.texture.hdr })

  const debugTex = PrefilterSpecular()

  const mat = useMemo(() => new ShaderMaterial({
    vertexShader: debugVertex,
    fragmentShader: debugFragment,
    uniforms: {
      uDebugTexture: new Uniform(debugTex),
    },

  }), [])

  useEffect(() => {
    // scene.background = hdrTexture

    useLoadedStore.setState({ ready: true })
  }, [])

  return (
    <>
      <OrbitControls domElement={controlDom} enabled={false} />
      <color attach="background" args={['black']} />
      {/* <Gun /> */}
      <OrthographicCamera makeDefault manual top={1} bottom={-1} left={-1} right={1} near={0} far={1} />
      <FullScreenTriangle material={mat} />
    </>
  )
}

export default Sketch
