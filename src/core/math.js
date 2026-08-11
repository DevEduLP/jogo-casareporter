// math.js — álgebra linear mínima (mat4 column-major, compatível com WebGL).
// Sem dependências. Portável: equivale a Transform3D/Basis no Godot.

export const DEG = Math.PI / 180;

export function clamp(v, a, b) { return v < a ? a : (v > b ? b : v); }
export function lerp(a, b, t) { return a + (b - a) * t; }
export function smoothstep(e0, e1, x) {
  const t = clamp((x - e0) / (e1 - e0), 0, 1);
  return t * t * (3 - 2 * t);
}
// Interpolação estável em relação ao frame-rate (damping exponencial).
export function damp(a, b, lambda, dt) { return lerp(a, b, 1 - Math.exp(-lambda * dt)); }

/* ---------------------------------- vec3 --------------------------------- */

export const v3 = {
  create(x = 0, y = 0, z = 0) { return new Float32Array([x, y, z]); },
  set(o, x, y, z) { o[0] = x; o[1] = y; o[2] = z; return o; },
  copy(o, a) { o[0] = a[0]; o[1] = a[1]; o[2] = a[2]; return o; },
  add(o, a, b) { o[0] = a[0] + b[0]; o[1] = a[1] + b[1]; o[2] = a[2] + b[2]; return o; },
  sub(o, a, b) { o[0] = a[0] - b[0]; o[1] = a[1] - b[1]; o[2] = a[2] - b[2]; return o; },
  scale(o, a, s) { o[0] = a[0] * s; o[1] = a[1] * s; o[2] = a[2] * s; return o; },
  dot(a, b) { return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]; },
  len(a) { return Math.hypot(a[0], a[1], a[2]); },
  dist(a, b) { return Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]); },
  normalize(o, a) {
    const l = Math.hypot(a[0], a[1], a[2]) || 1;
    o[0] = a[0] / l; o[1] = a[1] / l; o[2] = a[2] / l; return o;
  },
  cross(o, a, b) {
    const ax = a[0], ay = a[1], az = a[2], bx = b[0], by = b[1], bz = b[2];
    o[0] = ay * bz - az * by; o[1] = az * bx - ax * bz; o[2] = ax * by - ay * bx; return o;
  },
};

/* ---------------------------------- mat4 --------------------------------- */
// Column-major: m[col*4 + row], igual ao esperado por gl.uniformMatrix4fv.

export function m4() { return new Float32Array(16); }

export function m4identity(o) {
  o.fill(0); o[0] = o[5] = o[10] = o[15] = 1; return o;
}

export function m4perspective(o, fovY, aspect, near, far) {
  const f = 1 / Math.tan(fovY / 2), nf = 1 / (near - far);
  o.fill(0);
  o[0] = f / aspect; o[5] = f; o[10] = (far + near) * nf;
  o[11] = -1; o[14] = 2 * far * near * nf;
  return o;
}

// Matriz de modelo: translação + rotação em Y (a escala é assada na geometria,
// o que mantém as normais válidas sem precisar de matriz normal separada).
export function m4trs(o, x, y, z, ry) {
  const c = Math.cos(ry), s = Math.sin(ry);
  o[0] = c; o[1] = 0; o[2] = -s; o[3] = 0;
  o[4] = 0; o[5] = 1; o[6] = 0; o[7] = 0;
  o[8] = s; o[9] = 0; o[10] = c; o[11] = 0;
  o[12] = x; o[13] = y; o[14] = z; o[15] = 1;
  return o;
}

// View matrix a partir de posição + yaw/pitch (câmera FPS).
// Convenção: yaw 0 olha para -Z; yaw cresce girando para a esquerda.
export function m4viewFPS(o, px, py, pz, yaw, pitch) {
  const cy = Math.cos(yaw), sy = Math.sin(yaw);
  const cp = Math.cos(pitch), sp = Math.sin(pitch);
  // Eixos da câmera em espaço de mundo.
  const rx = cy, ry = 0, rz = -sy;                 // right
  const ux = sy * sp, uy = cp, uz = cy * sp;       // up
  const fx = -sy * cp, fy = sp, fz = -cy * cp;     // forward
  // View = inversa da rotação (transposta) + translação.
  o[0] = rx; o[1] = ux; o[2] = -fx; o[3] = 0;
  o[4] = ry; o[5] = uy; o[6] = -fy; o[7] = 0;
  o[8] = rz; o[9] = uz; o[10] = -fz; o[11] = 0;
  o[12] = -(rx * px + ry * py + rz * pz);
  o[13] = -(ux * px + uy * py + uz * pz);
  o[14] = (fx * px + fy * py + fz * pz);
  o[15] = 1;
  return o;
}

// Vetor "para frente" correspondente ao m4viewFPS acima.
export function forwardFromAngles(out, yaw, pitch) {
  const cp = Math.cos(pitch);
  out[0] = -Math.sin(yaw) * cp;
  out[1] = Math.sin(pitch);
  out[2] = -Math.cos(yaw) * cp;
  return out;
}

/* --------------------------- interseção raio/AABB ------------------------- */
// Slab method. Retorna a distância de entrada, ou -1 se não houver acerto
// dentro de maxDist. box = {min:[x,y,z], max:[x,y,z]}.
export function rayAABB(ro, rd, min, max, maxDist) {
  let tmin = 0, tmax = maxDist;
  for (let i = 0; i < 3; i++) {
    if (Math.abs(rd[i]) < 1e-8) {
      if (ro[i] < min[i] || ro[i] > max[i]) return -1;
    } else {
      const inv = 1 / rd[i];
      let t1 = (min[i] - ro[i]) * inv;
      let t2 = (max[i] - ro[i]) * inv;
      if (t1 > t2) { const tmp = t1; t1 = t2; t2 = tmp; }
      if (t1 > tmin) tmin = t1;
      if (t2 < tmax) tmax = t2;
      if (tmin > tmax) return -1;
    }
  }
  return tmin;
}

/* ------------------------------ aleatoriedade ---------------------------- */
// PRNG determinístico (mulberry32) — essencial para que texturas procedurais e
// eventos "aleatórios" sejam reproduzíveis entre sessões e saves.
export function makeRNG(seed) {
  let a = seed >>> 0;
  return function () {
    a = (a + 0x6D2B79F5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
