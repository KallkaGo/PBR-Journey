varying vec2 vUv;
varying vec3 vWorldNormal;
varying vec3 vWorldPosition;

uniform sampler2D albedoMap;
uniform sampler2D metalicMap;
uniform sampler2D normalMap;
uniform sampler2D roughnessMap;
uniform sampler2D prefilterDiffuse;
uniform sampler2D prefilterSpecular[5];
uniform sampler2D environmentBRDF;
uniform int uMipMapLevels;

uniform float lightIntensity;
uniform float reflectance;
uniform vec3 lightDirection;
uniform vec3 lightColor;

#define PI 3.1415926535897932384626433832795
#define RECIPROCAL_PI 0.3183098861837907
#define RECIPROCAL_2PI 0.15915494309189535

// from http://www.thetenthplanet.de/archives/1180
mat3 cotangentFrame(in vec3 N, in vec3 p, in vec2 uv) {
    // get edge vectors of the pixel triangle
  vec3 dp1 = dFdx(p);
  vec3 dp2 = dFdy(p);
  vec2 duv1 = dFdx(uv);
  vec2 duv2 = dFdy(uv);

    // solve the linear system
  vec3 dp2perp = cross(dp2, N);
  vec3 dp1perp = cross(N, dp1);
  vec3 T = dp2perp * duv1.x + dp1perp * duv2.x;
  vec3 B = dp2perp * duv1.y + dp1perp * duv2.y;

    // construct a scale-invariant frame 
  float invmax = inversesqrt(max(dot(T, T), dot(B, B)));
  return mat3(T * invmax, B * invmax, N);
}

vec3 applyNormalMap(in vec3 normal, in vec3 viewVec, in vec2 texcoord) {
  vec3 highResNormal = texture(normalMap, texcoord).xyz;
  highResNormal = normalize(highResNormal * 2.0 - 1.0);
  mat3 TBN = cotangentFrame(normal, -viewVec, texcoord);
  return normalize(TBN * highResNormal);
}

vec3 fresnelSchlick(float cosTheta, vec3 F0) {
  return F0 + (1.0 - F0) * pow(1.0 - cosTheta, 5.0);
}

float D_GGX(float NoH, float roughness) {
  float alpha = roughness * roughness;
  float alpha2 = alpha * alpha;
  float NoH2 = NoH * NoH;
  float b = (NoH2 * (alpha2 - 1.0) + 1.0);
  return alpha2 * RECIPROCAL_PI / (b * b);
}

float G1_GGX_Schlick(float NoV, float roughness) {
  float alpha = roughness * roughness;
  float k = alpha / 2.0;
  return max(NoV, 0.001) / (NoV * (1.0 - k) + k);
}

float G_Smith(float NoV, float NoL, float roughness) {
  return G1_GGX_Schlick(NoL, roughness) * G1_GGX_Schlick(NoV, roughness);
}

float fresnelSchlick90(float cosTheta, float F0, float F90) {
  return F0 + (F90 - F0) * pow(1.0 - cosTheta, 5.0);
}

float disneyDiffuseFactor(float NoV, float NoL, float VoH, float roughness) {
  float alpha = roughness * roughness;
  float F90 = 0.5 + 2.0 * alpha * VoH * VoH;
  float F_in = fresnelSchlick90(NoL, 1.0, F90);
  float F_out = fresnelSchlick90(NoV, 1.0, F90);
  return F_in * F_out;
}
// dir in world space
vec2 directionToSphericalEnvmap(vec3 dir) {
  float phi = atan(dir.x, dir.z);
  float theta = acos(dir.y);
  float s = 0.5 - phi / (2.0 * PI);
  float t = 1.0 - theta / PI;
  return vec2(s, t);
}

vec3 samplePrefilterSpecular(float prefilterScale, vec2 texcoord) {
  int prefilterLevel = int(floor(prefilterScale));
  float coeMix = prefilterScale - float(prefilterLevel);
  vec3 colorA, colorB, colorP;
  if(prefilterLevel == 0) {
    colorA = texture(prefilterSpecular[0], texcoord).rgb;
    colorB = texture(prefilterSpecular[1], texcoord).rgb;

  } else if(prefilterLevel == 1) {
    colorA = texture(prefilterSpecular[1], texcoord).rgb;
    colorB = texture(prefilterSpecular[2], texcoord).rgb;

  } else if(prefilterLevel == 2) {
    colorA = texture(prefilterSpecular[2], texcoord).rgb;
    colorB = texture(prefilterSpecular[3], texcoord).rgb;

  } else if(prefilterLevel == 3) {
    colorA = texture(prefilterSpecular[3], texcoord).rgb;
    colorB = texture(prefilterSpecular[4], texcoord).rgb;

  } else {
    colorA = texture(prefilterSpecular[4], texcoord).rgb;
    colorB = colorA;
  }
  colorP = mix(colorA, colorB, coeMix);
  return colorP;
}

vec3 brdfMicrofacet(
  in vec3 L,
  in vec3 V,
  in vec3 N,
  in float metallic,
  in float roughness,
  in vec3 baseColor,
  in float reflectance
) {

  vec3 H = normalize(V + L);

  float NoV = clamp(dot(N, V), 0.0, 1.0);
  float NoL = clamp(dot(N, L), 0.0, 1.0);
  float NoH = clamp(dot(N, H), 0.0, 1.0);
  float VoH = clamp(dot(V, H), 0.0, 1.0);

  vec3 f0 = vec3(0.16 * (reflectance * reflectance));
  f0 = mix(f0, baseColor, metallic);

  vec3 F = fresnelSchlick(VoH, f0);
  float D = D_GGX(NoH, roughness);
  float G = G_Smith(NoV, NoL, roughness);

  vec3 spec = (F * D * G) / (4.0 * max(NoV, 0.001) * max(NoL, 0.001));

  vec3 rhoD = baseColor;

  // optionally
  rhoD *= vec3(1.0) - F;
  // rhoD *= disneyDiffuseFactor(NoV, NoL, VoH, roughness);

  rhoD *= (1.0 - metallic);

  vec3 diff = rhoD * RECIPROCAL_PI;

  return diff + spec;

}

//adapted from "Real Shading in Unreal Engine 4", Brian Karis, Epic Games
vec3 specularIBL(vec3 F0, float roughness, vec3 N, vec3 V) {
  float NoV = clamp(dot(N, V), 0.0, 1.0);
  vec3 R = reflect(-V, N);
  vec2 uv = directionToSphericalEnvmap(R);
  vec3 T1 = samplePrefilterSpecular(roughness * float(uMipMapLevels), uv);
  vec4 brdfIntegration = texture(environmentBRDF, vec2(NoV, roughness));
  vec3 T2 = (F0 * brdfIntegration.x + brdfIntegration.y);
  return T1 * T2;
}

void main() {
  vec3 diffuse = texture(albedoMap, vUv).rgb;
  float roughness = texture(roughnessMap, vUv).r;
  float metallic = texture(metalicMap, vUv).r;
  vec3 lightDir = normalize(lightDirection); // towards light
  vec3 viewDir = normalize(cameraPosition - vWorldPosition);
  vec3 normal = normalize(vWorldNormal);
  normal = applyNormalMap(normal, viewDir, vUv);

  vec3 radiance = vec3(0.0);

  float irradiance = max(0., dot(normal, lightDir)) * lightIntensity;

  if(irradiance > 0.) {
    vec3 brdf = brdfMicrofacet(lightDir, viewDir, normal, metallic, roughness, diffuse, reflectance);
    // irradiance contribution from directional light
    radiance += brdf * irradiance * lightColor;
  }

  // compute F0
  vec3 f0 = vec3(0.16 * (reflectance * reflectance));
  f0 = mix(f0, diffuse, metallic);

  // IBL Diffuse part
  vec2 envUV = directionToSphericalEnvmap(normal);
  vec3 rhoD = (1.0 - metallic) * diffuse;
  rhoD *= vec3(1.0) - f0; // optionally
  radiance += rhoD * texture(prefilterDiffuse, envUV).rgb;

  // IBL Specular part
  radiance += specularIBL(f0, roughness, normal, viewDir);

  // gamma correction
  radiance = pow(radiance, vec3(1.0 / 2.2));

  gl_FragColor = vec4(radiance, 1.0);

}