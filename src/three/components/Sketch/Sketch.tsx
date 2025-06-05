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

    scene.backgroundRotation.y = -Math.PI / 2

    useLoadedStore.setState({ ready: true })
  }, [])

  //  const debugTexture = IntegrateBRDF()

  // const mat = useMemo(() => new ShaderMaterial({
  //   vertexShader,
  //   fragmentShader,
  //   uniforms: {
  //     uDebugTexture: new Uniform(debugTexture),
  //   },
  // }), [])

  return (
    <>
      <OrbitControls domElement={controlDom} />
      <color attach="background" args={['black']} />
      <Gun />
      {/* <OrthographicCamera makeDefault manual top={1} bottom={-1} left={-1} right={1} near={0} far={1} />
      <FullScreenTriangle material={mat} /> */}
    </>
  )
}

export default Sketch
