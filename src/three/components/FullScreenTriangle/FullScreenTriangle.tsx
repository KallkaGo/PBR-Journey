import type { FC } from 'react'
import type { Material } from 'three'
import { useMemo } from 'react'
import { BufferGeometry, Float32BufferAttribute, MeshBasicMaterial } from 'three'

interface IProps {
  material: Material
}

const FullScreenTriangle: FC<Partial<IProps>> = ({ material }) => {
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

  const defaultMaterial = useMemo(() => {
    return new MeshBasicMaterial()
  }, [])

  return (
    <mesh geometry={geometry} material={material ?? defaultMaterial} />
  )
}

export {
  FullScreenTriangle,
}
