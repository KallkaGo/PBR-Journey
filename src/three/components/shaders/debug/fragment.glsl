varying vec2 vUv;

uniform sampler2D uDebugTexture;

uniform sampler2D uDebugTextureList[5];

vec3 samplePrefilterSpecular(float prefilterScale, vec2 texcoord) {
  int prefilterLevel = int(floor(prefilterScale));
  float coeMix = prefilterScale - float(prefilterLevel);
  vec3 colorA, colorB, colorP;
  if(prefilterLevel == 0) {
    colorA = texture(uDebugTextureList[0], texcoord).rgb;
    colorB = texture(uDebugTextureList[1], texcoord).rgb;

  } else if(prefilterLevel == 1) {
    colorA = texture(uDebugTextureList[1], texcoord).rgb;
    colorB = texture(uDebugTextureList[2], texcoord).rgb;

  } else if(prefilterLevel == 2) {
    colorA = texture(uDebugTextureList[2], texcoord).rgb;
    colorB = texture(uDebugTextureList[3], texcoord).rgb;

  } else if(prefilterLevel == 3) {
    colorA = texture(uDebugTextureList[3], texcoord).rgb;
    colorB = texture(uDebugTextureList[4], texcoord).rgb;

  } else {
    colorA = texture(uDebugTextureList[4], texcoord).rgb;
    colorB = colorA;
  }
  colorP = mix(colorA, colorB, coeMix);
  return colorP;
}

void main() {
  vec3 color = texture2D(uDebugTexture, vUv).rgb;
  // vec3 color = samplePrefilterSpecular(4., vUv);

  // color.rgb = pow(color.rgb, vec3(1.0/2.2));
  gl_FragColor = vec4(color, 1.0);
}