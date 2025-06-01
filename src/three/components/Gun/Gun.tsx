import { useGLTF, useTexture } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useEffect } from 'react'
import { Color, Mesh, RepeatWrapping, ShaderMaterial, SRGBColorSpace, Uniform, Vector3 } from 'three'
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
          },
        })
        child.material = newMat
      }
    })
  }, [])

  return <primitive object={gltf.scene} />
}

export { Gun }
