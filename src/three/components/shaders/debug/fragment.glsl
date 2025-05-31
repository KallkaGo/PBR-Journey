varying vec2 vUv;

uniform sampler2D uDebugTexture;

void main(){
  vec4 color = texture2D(uDebugTexture, vUv);
  color.rgb = pow(color.rgb, vec3(1.0/2.2));
  gl_FragColor = vec4(color.rgb, 1.0);
}