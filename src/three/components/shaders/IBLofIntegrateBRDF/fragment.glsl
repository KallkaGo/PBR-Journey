varying vec2 vUv;

uniform int uWidth;
uniform int uHeight;
uniform int uSamples;
#define PI 3.1415926535897932384626433832795

// convert texture coordinates to pixels
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

float G1_GGX_Schlick(float NoV, float roughness) {
  float alpha = roughness * roughness;
  float k = alpha / 2.0;
  return max(NoV, 0.001) / (NoV * (1.0 - k) + k);
}

float G_Smith(float NoV, float NoL, float roughness) {
  return G1_GGX_Schlick(NoL, roughness) * G1_GGX_Schlick(NoV, roughness);
}

// adapted from "Real Shading in Unreal Engine 4", Brian Karis, Epic Games
vec2 integrateBRDF(float roughness, float NoV) {
  float px = t2p(vUv.x, uWidth);
  float py = t2p(vUv.y, uHeight);
  
  // view direction in normal space from spherical coordinates
  float thetaView = acos(NoV);
  vec3 V = vec3(sin(thetaView), 0.0, cos(thetaView)); // with phiView = 0.0
  
  vec2 result = vec2(0.0);
  uint N = uint(uSamples);
  for(uint n = 0u; n < N; n++) {
    vec3 random = random_pcg3d(uvec3(px, py, n));
    float phi = 2.0 * PI * random.x;
    float u = random.y;
    float alpha = roughness * roughness;
    float theta = acos(sqrt((1.0 - u) / (1.0 + (alpha * alpha - 1.0) * u)));
    vec3 H = vec3(sin(theta) * cos(phi), sin(theta) * sin(phi), cos(theta));
    vec3 L = 2.0 * dot(V, H) * H - V; // or use L = reflect(-V, H);
    float NoL = clamp(L.z, 0.0, 1.0);
    float NoH = clamp(H.z, 0.0, 1.0);
    float VoH = clamp(dot(V, H), 0.0, 1.0);
    if(NoL > 0.0) {
      float G = G_Smith(NoV, NoL, roughness);
      float G_Vis = G * VoH / (NoH * NoV);
      float Fc = pow(1.0 - VoH, 5.0);
      result.x += (1.0 - Fc) * G_Vis;
      result.y += Fc * G_Vis;
    }
  }
  result = result / float(N);
  return result;
}

void main() {
  // BRDF Lut X asix is NoV
  // BRDF Lut Y asix is Roughness
  vec2 r = integrateBRDF(vUv.y, vUv.x);
  gl_FragColor = vec4(r, 0.0, 1.0);
}