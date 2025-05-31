varying vec2 vUv;

uniform sampler2D uEnvMap;
uniform int uWidth;
uniform int uHeight;
uniform int uSamples;
uniform float uMipmapLevel;

#define PI 3.14159265359

float t2p(in float t, in int noOfPixels) {
  return t * float(noOfPixels) - 0.5;
}

// Hash Functions for GPU Rendering, Jarzynski et al.
// http://www.jcgt.org/published/0009/03/02/
vec3 random_pcg3d(uvec3 v) {
  v = v * 1664525u + 1013904223u;
  v.x += v.y*v.z; v.y += v.z*v.x; v.z += v.x*v.y;
  v ^= v >> 16u;
  v.x += v.y*v.z; v.y += v.z*v.x; v.z += v.x*v.y;
  return vec3(v) * (1.0/float(0xffffffffu));
}

vec3 sphericalEnvmapToDirection(vec2 tex) {
  float theta = PI * (1.0 - tex.t);
  float phi = 2.0 * PI * (0.5 - tex.s);
  return vec3(sin(theta) * cos(phi), sin(theta) * sin(phi), cos(theta));
}

vec2 directionToSphericalEnvmap(vec3 dir) {
  float phi = atan(dir.y, dir.x);
  float theta = acos(dir.z);
  float s = 0.5 - phi / (2.0 * PI);
  float t = 1.0 - theta / PI;
  return vec2(s, t);
}

mat3 getNormalFrame(in vec3 normal) {
  vec3 someVec = vec3(1.0, 0.0, 0.0);
  float dd = dot(someVec, normal);
  /* Avoid cross product results be zero */
  vec3 tangent = vec3(0.0, 1.0, 0.0);
  if(1.0 - abs(dd) > 1e-6) {
    tangent = normalize(cross(someVec, normal));
  }
  vec3 bitangent = cross(normal, tangent);
  return mat3(tangent, bitangent, normal);
}

vec3 prefilterEnvMapDiffuse(in sampler2D envmapSampler, in vec2 tex) {
  float px = t2p(tex.x, uWidth);
  float py = t2p(tex.y, uHeight);
  
  vec3 normal = sphericalEnvmapToDirection(tex);
  mat3 normalTransform = getNormalFrame(normal);
  vec3 result = vec3(0.0);
  uint N = uint(uSamples);
  for(uint n = 0u; n < N; n++) {
    vec3 random = random_pcg3d(uvec3(px, py, n));
    // inverse transform sampling
    float phi = 2.0 * PI * random.x;
    float theta = asin(sqrt(random.y));
    vec3 posLocal = vec3(sin(theta) * cos(phi), sin(theta) * sin(phi), cos(theta));
    // local to world
    vec3 posWorld = normalTransform * posLocal;
    vec2 uv = directionToSphericalEnvmap(posWorld);
    vec3 radiance = textureLod(envmapSampler, uv, uMipmapLevel).rgb;
    result += radiance;
  }
  result = result / float(N);
  return result;
}

void main(){
  vec3 color = prefilterEnvMapDiffuse(uEnvMap, vUv);
  gl_FragColor = vec4(color, 1.0);
}