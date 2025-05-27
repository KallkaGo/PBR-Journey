/*
Importance Sampling: Image-based Lighting of a Lambertian Diffuse BRDF
*/

import { OrthographicCamera, useEnvironment } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useInteractStore } from '@utils/Store'
import { useEffect, useMemo, useRef } from 'react'
import { BufferGeometry, Float32BufferAttribute, ShaderMaterial, Uniform } from 'three'
import RES from '../RES'
import fragmentShader from '../shaders/IBLofDiffuseBRDF/fragment.glsl'
import vertexShader from '../shaders/IBLofDiffuseBRDF/vertex.glsl'

function IBLofDiffuseBRDF() {
  const envHdr = useEnvironment({ files: RES.texture.hdr })

  const params = useRef({
    init: false,
  })

  const geometry = useMemo(() => {
    const bufferGeo = new BufferGeometry()
    bufferGeo.setAttribute(
      'position',
      new Float32BufferAttribute([-1, 3, 0, -1, -1, 0, 3, -1, 0], 3),
    )
    bufferGeo.setAttribute(
      'uv',
      new Float32BufferAttribute([0, 2, 0, 0, 2, 0], 2),
    )

    return bufferGeo
  }, [])

  const uniforms = useMemo(() => {
    return {
      uEnvMap: new Uniform(envHdr),
      uWidth: new Uniform(envHdr.image.width),
      uHeight: new Uniform(envHdr.image.height),
      uSamples: new Uniform(256),
      uMipmapLevel: new Uniform(0),
    }
  }, [])

  const material = useMemo(() => {
    return new ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms,
    })
  }, [])

  useEffect(() => {
    useInteractStore.setState({ controlEnabled: false })
  }, [])

  useFrame((state, delta) => {
    const { gl, scene, camera } = state
    if (!params.current.init) {
      params.current.init = true
      gl.render(scene, camera)
    }
  }, 1)

  return (

    <>
      <OrthographicCamera makeDefault left={-1} right={1} top={1} bottom={-1} near={0} far={1} />
      <mesh geometry={geometry} material={material} />
    </>
  )
}

export {
  IBLofDiffuseBRDF,
}
