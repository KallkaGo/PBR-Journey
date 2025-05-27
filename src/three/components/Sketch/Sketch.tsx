import { OrbitControls } from '@react-three/drei'
import { useInteractStore, useLoadedStore } from '@utils/Store'
import { useEffect } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { IBLofDiffuseBRDF } from '../IBL/IBLofDiffuseBRDF'

function Sketch() {
  const { controlDom, controlEnabled } = useInteractStore(useShallow(state => ({
    controlDom: state.controlDom,
    controlEnabled: state.controlEnabled,
  })))

  useEffect(() => {
    useLoadedStore.setState({ ready: true })
  }, [])

  return (
    <>
      <OrbitControls domElement={controlDom} enabled={controlEnabled} />
      <color attach="background" args={['black']} />
      <IBLofDiffuseBRDF />
    </>
  )
}

export default Sketch
