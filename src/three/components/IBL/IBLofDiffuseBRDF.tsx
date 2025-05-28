/*
Importance Sampling: Image-based Lighting of a Lambertian Diffuse BRDF
*/

import type { OrthographicCamera as IOrthographicCamera } from 'three'
import { OrthographicCamera, useEnvironment } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import { useInteractStore } from '@utils/Store'
import { useEffect, useMemo, useRef } from 'react'
import { BufferGeometry, Float32BufferAttribute, ShaderMaterial, Uniform } from 'three'
import { useShallow } from 'zustand/react/shallow'
import RES from '../RES'
import fragmentShader from '../shaders/IBLofDiffuseBRDF/fragment.glsl'
import vertexShader from '../shaders/IBLofDiffuseBRDF/vertex.glsl'

function IBLofDiffuseBRDF() {
  const envHdr = useEnvironment({ files: RES.texture.hdr })

  const { camera, gl, scene } = useThree(useShallow(state => ({
    camera: state.camera,
    gl: state.gl,
    scene: state.scene,
  })))

  const cameraRef = useRef<IOrthographicCamera>(null)

  const params = useRef({
    init: false,
    sizes: { width: 0, height: 0 },
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
    let timer: NodeJS.Timeout | undefined
    const handleResize = () => {
      if (timer)
        clearTimeout(timer)
      timer = setTimeout(() => {
        const { sizes } = params.current
        sizes.width = window.innerWidth
        sizes.height = window.innerHeight

        const activeCamera = cameraRef.current

        if (activeCamera) {
          activeCamera.left = -1
          activeCamera.right = 1
          activeCamera.top = 1
          activeCamera.bottom = -1
          activeCamera.near = 0
          activeCamera.far = 1

          activeCamera.updateProjectionMatrix()

          gl.setSize(sizes.width, sizes.height)

          gl.render(scene, activeCamera)
        }
      }, 100)
    }

    window.addEventListener('resize', handleResize)
    useInteractStore.setState({ controlEnabled: false })

    return () => {
      window.removeEventListener('resize', handleResize)
    }
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
      <OrthographicCamera ref={cameraRef} makeDefault left={-1} right={1} top={1} bottom={-1} near={0} far={1} />
      <mesh geometry={geometry} material={material} />
    </>
  )
}

export {
  IBLofDiffuseBRDF,
}
