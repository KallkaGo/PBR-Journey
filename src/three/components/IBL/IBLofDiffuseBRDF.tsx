/*
Importance Sampling: Image-based Lighting of a Lambertian Diffuse BRDF
*/

import { OrthographicCamera } from '@react-three/drei'
import { useInteractStore } from '@utils/Store'
import { useEffect, useMemo } from 'react'
import { BufferGeometry, Float32BufferAttribute, ShaderMaterial, Uniform, Vector2 } from 'three'
import fragmentShader from '../shaders/IBLofDiffuseBRDF/fragment.glsl'
import vertexShader from '../shaders/IBLofDiffuseBRDF/vertex.glsl'

function IBLofDiffuseBRDF() {
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
      uResolution: new Uniform(new Vector2(innerWidth, innerHeight)),
      uTime: new Uniform(0),
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
