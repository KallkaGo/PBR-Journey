import gun from '@models/gun/gun.glb'
import envHDR from '@textures/env/blaubeuren_night_1k.hdr'
import gunAlbedo from '@textures/gun/Cerberus_A.png'
import gunMetalic from '@textures/gun/Cerberus_M.png'
import gunNormal from '@textures/gun/Cerberus_N.png'
import gunRoughness from '@textures/gun/Cerberus_R.png'

export default {
  model: {
    gun,
  },
  texture: {
    gunAlbedo,
    gunMetalic,
    gunNormal,
    gunRoughness,
    hdr: envHDR,
  },
}
