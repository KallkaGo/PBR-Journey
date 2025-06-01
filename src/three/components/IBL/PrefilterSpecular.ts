/*
Importance Sampling: Image-based Lighting of a Lambertian Diffuse BRDF
*/

import { useEnvironment, useFBO } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import { LinearFilter, LinearMipMapLinearFilter, ShaderMaterial, Uniform } from 'three'
import { FullScreenQuad } from 'three-stdlib'
import RES from '../RES'
import fragmentShader from '../shaders/IBLofSpecularBRDF/fragment.glsl'
import vertexShader from '../shaders/IBLofSpecularBRDF/vertex.glsl'

function PrefilterSpecular() {
  const envHdr = useEnvironment({ files: RES.texture.hdr })
  envHdr.generateMipmaps = true
  envHdr.minFilter = LinearMipMapLinearFilter

  const fbo = useFBO(envHdr.image.width, envHdr.image.height, {
    generateMipmaps: true,
    minFilter: LinearMipMapLinearFilter,
    magFilter: LinearFilter,
  })

  const isInit = useRef(false)

  const uniforms = useMemo(() => {
    return {
      uEnvMap: new Uniform(envHdr),
      uWidth: new Uniform(envHdr.image.width),
      uHeight: new Uniform(envHdr.image.height),
      uSamples: new Uniform(512),
      uMipmapLevel: new Uniform(0),
      uRoughness: new Uniform(0),
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
  PrefilterSpecular,
}
