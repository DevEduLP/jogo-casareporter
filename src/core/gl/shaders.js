// shaders.js — GLSL ES 1.00 (roda tanto em WebGL1 quanto em WebGL2).

export const MAX_LIGHTS = 8;

export const SCENE_VS = `
precision highp float;

attribute vec3 aPosition;
attribute vec3 aNormal;
attribute vec2 aUV;

uniform mat4 uProjection;
uniform mat4 uView;
uniform mat4 uModel;

varying vec3 vWorldPos;
varying vec3 vNormal;
varying vec2 vUV;

void main() {
  vec4 world = uModel * vec4(aPosition, 1.0);
  vWorldPos = world.xyz;
  // uModel só contém translação + rotação em Y (escala assada na geometria),
  // portanto a parte 3x3 já é ortonormal: serve de matriz normal.
  vNormal = mat3(uModel) * aNormal;
  vUV = aUV;
  gl_Position = uProjection * uView * world;
}
`;

export const SCENE_FS = `
precision highp float;

#define MAX_LIGHTS ${MAX_LIGHTS}

varying vec3 vWorldPos;
varying vec3 vNormal;
varying vec2 vUV;

uniform sampler2D uTex;
uniform vec2  uUVScale;
uniform vec3  uTint;
uniform float uEmissive;   // 0 = totalmente iluminado por luzes, 1 = auto-iluminado
uniform float uRoughGloss; // brilho especular (0 = fosco)

uniform vec3  uAmbient;
uniform vec3  uMoonDir;    // direção *para* a lua, normalizada
uniform vec3  uMoonColor;

uniform int   uLightCount;
uniform vec3  uLightPos[MAX_LIGHTS];
uniform vec3  uLightColor[MAX_LIGHTS];
uniform float uLightRange[MAX_LIGHTS];

// Lanterna (spot ancorada na câmera)
uniform vec3  uFlashPos;
uniform vec3  uFlashDir;
uniform vec3  uFlashColor;
uniform vec2  uFlashCone;  // x = cos(ângulo externo), y = cos(ângulo interno)
uniform float uFlashRange;

uniform vec3  uEyePos;
uniform vec3  uFogColor;
uniform float uFogDensity;

// Atenuação suave com corte no alcance: evita luzes "vazando" pelas paredes
// mais do que o necessário (não temos shadow maps).
float attenuate(float dist, float range) {
  float d = dist / max(range, 0.001);
  float f = clamp(1.0 - d * d * d * d, 0.0, 1.0);
  return (f * f) / (1.0 + dist * dist * 0.65);
}

void main() {
  vec4 texel = texture2D(uTex, vUV * uUVScale);
  vec3 albedo = texel.rgb * uTint;
  if (texel.a < 0.35) discard;

  vec3 N = normalize(vNormal);
  vec3 V = normalize(uEyePos - vWorldPos);

  vec3 lit = uAmbient;

  // Luar direcional — frio, fraco, entrando pelas janelas.
  float moon = max(dot(N, uMoonDir), 0.0);
  lit += uMoonColor * moon;

  // Luzes pontuais (lâmpadas, velas, o rádio, a lareira).
  for (int i = 0; i < MAX_LIGHTS; i++) {
    if (i >= uLightCount) { continue; }
    vec3 toL = uLightPos[i] - vWorldPos;
    float dist = length(toL);
    vec3 L = toL / max(dist, 0.0001);
    float ndl = max(dot(N, L), 0.0);
    float att = attenuate(dist, uLightRange[i]);
    vec3 contrib = uLightColor[i] * ndl * att;

    if (uRoughGloss > 0.0) {
      vec3 H = normalize(L + V);
      float spec = pow(max(dot(N, H), 0.0), 24.0) * uRoughGloss;
      contrib += uLightColor[i] * spec * att;
    }
    lit += contrib;
  }

  // Lanterna.
  if (uFlashColor.r + uFlashColor.g + uFlashColor.b > 0.001) {
    vec3 toF = uFlashPos - vWorldPos;
    float fd = length(toF);
    vec3 L = toF / max(fd, 0.0001);
    float theta = dot(-L, normalize(uFlashDir));
    float cone = smoothstep(uFlashCone.x, uFlashCone.y, theta);
    float ndl = max(dot(N, L), 0.0);
    // O termo 0.25 mantém superfícies quase perpendiculares visíveis:
    // uma lanterna real ilumina por espalhamento, não só por N·L puro.
    float att = attenuate(fd, uFlashRange);
    lit += uFlashColor * cone * att * (ndl * 0.75 + 0.25);
  }

  vec3 color = mix(albedo * lit, albedo, uEmissive);

  // Névoa exponencial ao quadrado — a escuridão come a geometria distante,
  // o que também esconde as bordas do nível.
  float dist = length(uEyePos - vWorldPos);
  float fogAmount = 1.0 - exp(-pow(dist * uFogDensity, 2.0));
  color = mix(color, uFogColor, clamp(fogAmount, 0.0, 1.0));

  gl_FragColor = vec4(color, 1.0);
}
`;

/* ------------------------------ pós-processo ----------------------------- */

export const POST_VS = `
precision highp float;
attribute vec2 aPosition;
varying vec2 vUV;
void main() {
  vUV = aPosition * 0.5 + 0.5;
  gl_Position = vec4(aPosition, 0.0, 1.0);
}
`;

// Todo o "clima" do jogo vive aqui: grão, vinheta, aberração cromática e a
// distorção controlada pelo Sistema de Realidade.
export const POST_FS = `
precision highp float;

varying vec2 vUV;

uniform sampler2D uScene;
uniform vec2  uResolution;
uniform float uTime;
uniform float uGrain;
uniform float uVignette;
uniform float uAberration;
uniform float uDistort;    // Sistema de Realidade: 0 = normal, 1 = casa desfeita
uniform float uPulse;      // batimento cardíaco / pânico
uniform float uFade;       // 1 = imagem visível, 0 = preto total
uniform vec3  uGrade;      // correção de cor por canal

float hash(vec2 p) {
  p = fract(p * vec2(443.897, 441.423));
  p += dot(p, p.yx + 19.19);
  return fract((p.x + p.y) * p.x);
}

void main() {
  vec2 uv = vUV;
  vec2 center = uv - 0.5;
  float r = length(center);

  // Respiração: a imagem pulsa de leve com o batimento.
  uv = 0.5 + center * (1.0 - uPulse * 0.02);

  // Distorção da realidade: ondulação lenta e assimétrica. Não é um "efeito de
  // tela" genérico — é sutil o bastante para o jogador duvidar de tê-lo visto.
  if (uDistort > 0.001) {
    float w = sin(uv.y * 11.0 + uTime * 0.7) * cos(uv.x * 7.0 - uTime * 0.4);
    uv += vec2(w * 0.006, sin(uv.x * 9.0 + uTime * 0.9) * 0.004) * uDistort;
    // Deslocamento horizontal em faixas, tipo fita de vídeo com defeito.
    float band = step(0.985, hash(vec2(floor(uv.y * 90.0), floor(uTime * 8.0))));
    uv.x += band * uDistort * 0.02;
  }

  // Aberração cromática crescendo para as bordas (lente barata, câmera velha).
  float ab = (uAberration + uDistort * 0.004) * (0.35 + r * 1.65);
  vec2 dir = r > 0.0001 ? center / r : vec2(0.0);
  float cr = texture2D(uScene, uv + dir * ab).r;
  float cg = texture2D(uScene, uv).g;
  float cb = texture2D(uScene, uv - dir * ab).b;
  vec3 color = vec3(cr, cg, cb);

  color *= uGrade;

  // Vinheta.
  float vig = smoothstep(0.95, 0.25, r);
  color *= mix(1.0, vig, uVignette);

  // Grão animado — some quase por completo nas áreas claras, como filme real.
  float g = hash(vUV * uResolution + fract(uTime) * 137.0) - 0.5;
  float lum = dot(color, vec3(0.299, 0.587, 0.114));
  color += g * uGrain * (1.0 - lum * 0.6);

  color *= uFade;

  gl_FragColor = vec4(color, 1.0);
}
`;
