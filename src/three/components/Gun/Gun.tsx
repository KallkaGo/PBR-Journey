import { useGLTF, useTexture } from '@react-three/drei'
import { useEffect, useRef } from 'react'
import { Color, Mesh, RepeatWrapping, ShaderMaterial, SRGBColorSpace, Uniform, Vector3 } from 'three'

import { IntegrateBRDF } from '../IBL/IntegrateBRDF'
import { PrefilterDiffuse } from '../IBL/PrefilterDiffuse'
import { PrefilterSpecular } from '../IBL/PrefilterSpecular'
import RES from '../RES'
import gunFragmentShader from '../shaders/gun/fragment.glsl'
import gunVertexShader from '../shaders/gun/vertex.glsl'

function Gun() {
  const gltf = useGLTF(RES.model.gun)

  const albedoTexture = useTexture(RES.texture.gunAlbedo)
  albedoTexture.colorSpace = SRGBColorSpace
  albedoTexture.wrapS = albedoTexture.wrapT = RepeatWrapping
  albedoTexture.flipY = false

  const metalicTexture = useTexture(RES.texture.gunMetalic)
  metalicTexture.flipY = false
  metalicTexture.wrapS = metalicTexture.wrapT = RepeatWrapping

  const normalTexture = useTexture(RES.texture.gunNormal)
  normalTexture.wrapS = normalTexture.wrapT = RepeatWrapping
  normalTexture.flipY = false

  const roughnessTexture = useTexture(RES.texture.gunRoughness)
  roughnessTexture.flipY = false
  roughnessTexture.wrapS = roughnessTexture.wrapT = RepeatWrapping

  const prefilterDiffuse = PrefilterDiffuse()

  const prefilterSpecular = PrefilterSpecular()

  const environmentBRDF = IntegrateBRDF()

  const testMeshRef = useRef<Mesh>(null)

  useEffect(() => {
    gltf.scene.traverse((child) => {
      if (child instanceof Mesh) {
        const newMat = new ShaderMaterial({
          vertexShader: gunVertexShader,
          fragmentShader: gunFragmentShader,
          uniforms: {
            albedoMap: new Uniform(albedoTexture),
            metalicMap: new Uniform(metalicTexture),
            normalMap: new Uniform(normalTexture),
            roughnessMap: new Uniform(roughnessTexture),
            lightDirection: new Uniform(new Vector3(1, 1, 1)),
            lightIntensity: new Uniform(1.0),
            reflectance: new Uniform(0.5),
            lightColor: new Uniform(new Color(1, 1, 1)),
            prefilterDiffuse: new Uniform(prefilterDiffuse),
            prefilterSpecular: new Uniform(prefilterSpecular),
            uMipMapLevels: new Uniform(prefilterSpecular.length),
            environmentBRDF: new Uniform(environmentBRDF),
          },
        })
        child.material = newMat
      }
    })
    // testMeshRef.current!.material = new ShaderMaterial({
    //   vertexShader: gunVertexShader,
    //   fragmentShader: gunFragmentShader,
    //   uniforms: {
    //     albedoMap: new Uniform(null),
    //     metalicMap: new Uniform(null),
    //     normalMap: new Uniform(null),
    //     roughnessMap: new Uniform(null),
    //     lightDirection: new Uniform(new Vector3(1, 1, 1)),
    //     lightIntensity: new Uniform(1.0),
    //     reflectance: new Uniform(0.5),
    //     lightColor: new Uniform(new Color(1, 1, 1)),
    //     prefilterDiffuse: new Uniform(prefilterDiffuse),
    //     prefilterSpecular: new Uniform(prefilterSpecular),
    //     uMipMapLevels: new Uniform(prefilterSpecular.length),
    //     environmentBRDF: new Uniform(environmentBRDF),
    //   },
    // })
  }, [])

  return <primitive object={gltf.scene} />

  // return (
  //   <mesh ref={testMeshRef}>
  //     <sphereGeometry args={[1, 32, 32]} />
  //     <meshBasicMaterial />
  //   </mesh>
  // )
}

export { Gun }
