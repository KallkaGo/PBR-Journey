varying vec2 vUv;

varying vec3 vWorldNormal;
varying vec3 vWorldPosition;

void main(){
  gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
  mat4 modelMatrixInverseTranspose = transpose( inverse( modelMatrix ) );
  vWorldNormal = normalize( vec3( modelMatrixInverseTranspose * vec4( normal, 0.0 ) ) );
  vWorldPosition = ( modelMatrix * vec4( position, 1.0 ) ).xyz;
  vUv = uv;
}