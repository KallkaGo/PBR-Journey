/*
Importance Sampling: Image-based Lighting of a Lambertian Diffuse BRDF
*/

import { useEnvironment } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import { LinearMipMapLinearFilter, ShaderMaterial, Uniform, WebGLRenderTarget } from 'three'
import { FullScreenQuad } from 'three-stdlib'
import RES from '../RES'
import vertexShader from '../shaders/common/vertex.glsl'
import fragmentShader from '../shaders/IBLofSpecularBRDF/fragment.glsl'

function PrefilterSpecular() {
  const envHdr = useEnvironment({ files: RES.texture.hdr })
  envHdr.generateMipmaps = true
  envHdr.minFilter = LinearMipMapLinearFilter

  const fboList = useMemo(() => {
    const list = []
    for (let i = 0; i < 5; i++) {
      list.push(new WebGLRenderTarget(envHdr.image.width >> i, envHdr.image.height >> i, {
        generateMipmaps: false,
      }))
    }
    return list
  }, [])

  const isInit = useRef(false)

  const uniforms = useMemo(() => {
    return {
      uEnvMap: new Uniform(envHdr),
      uWidth: new Uniform(envHdr.image.width),
      uHeight: new Uniform(envHdr.image.height),
      uSamples: new Uniform(1024),
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
      fboList.forEach((fbo, i) => {
        gl.setRenderTarget(fbo)
        uniforms.uMipmapLevel.value = i
        uniforms.uRoughness.value = i / fboList.length
        uniforms.uSamples.value = Math.max(8096, uniforms.uSamples.value * 2)
        fullScreenQuad.render(gl)
      })
      gl.setRenderTarget(null)
      isInit.current = true
    }
  })

  return fboList.map((fbo, i) => fbo.texture)
}

export {
  PrefilterSpecular,
}
