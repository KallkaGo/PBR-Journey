varying vec2 vUv;

uniform sampler2D uDebugTexture;

void main(){
  vec4 color = textureLod(uDebugTexture, vUv,8.);
  // vec4 color = texture(uDebugTexture, vUv);

  // color.rgb = pow(color.rgb, vec3(1.0/2.2));
  gl_FragColor = vec4(color.rgb, 1.0);
}