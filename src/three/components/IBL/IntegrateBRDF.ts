/*
Importance Sampling: Image-based Lighting of a Lambertian Diffuse BRDF
*/

import { useFBO } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import { ShaderMaterial, Uniform } from 'three'
import { FullScreenQuad } from 'three-stdlib'
import vertexShader from '../shaders/common/vertex.glsl'
import fragmentShader from '../shaders/IBLofIntegrateBRDF/fragment.glsl'

function IntegrateBRDF() {
  const fbo = useFBO(256, 256,{
    generateMipmaps:false
  })

  const isInit = useRef(false)

  const uniforms = useMemo(() => {
    return {
      uSamples: new Uniform(8096),
      uWidth: new Uniform(256),
      uHeight: new Uniform(256),
    }
  }, [])

  const material = useMemo(() => new ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms,
  }), [])

  const fullScreenQuad = useMemo(() => new FullScreenQuad(material), [])

  useFrame((state, _) => {
    const { gl } = state
    if (!isInit.current) {
      isInit.current = true
      gl.setRenderTarget(fbo)
      fullScreenQuad.render(gl)
      gl.setRenderTarget(null)
    }
  })

  return fbo.texture
}

export {
  IntegrateBRDF,
}
