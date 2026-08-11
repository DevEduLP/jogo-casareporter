// geometry.js — construtores de malha. A escala é assada nos vértices (não na
// matriz de modelo) para que as normais continuem corretas sem matriz normal.
// Os UVs são gerados em metros, então uma mesma textura tem densidade
// consistente em qualquer objeto.

function pushQuad(m, p0, p1, p2, p3, n, uMax, vMax) {
  const base = m.positions.length / 3;
  const pts = [p0, p1, p2, p3];
  const uvs = [[0, 0], [uMax, 0], [uMax, vMax], [0, vMax]];
  for (let i = 0; i < 4; i++) {
    m.positions.push(pts[i][0], pts[i][1], pts[i][2]);
    m.normals.push(n[0], n[1], n[2]);
    m.uvs.push(uvs[i][0], uvs[i][1]);
  }
  m.indices.push(base, base + 1, base + 2, base, base + 2, base + 3);
}

function empty() {
  return { positions: [], normals: [], uvs: [], indices: [] };
}

function finish(m) {
  return {
    positions: new Float32Array(m.positions),
    normals: new Float32Array(m.normals),
    uvs: new Float32Array(m.uvs),
    indices: new Uint16Array(m.indices),
  };
}

/**
 * Caixa centrada na origem em X/Z e apoiada em y=0 (pivô no chão), o que torna
 * o posicionamento de móveis muito mais intuitivo nos dados do nível.
 */
export function buildBox(w, h, d) {
  const m = empty();
  const x = w / 2, z = d / 2;
  // +X
  pushQuad(m, [x, 0, z], [x, 0, -z], [x, h, -z], [x, h, z], [1, 0, 0], d, h);
  // -X
  pushQuad(m, [-x, 0, -z], [-x, 0, z], [-x, h, z], [-x, h, -z], [-1, 0, 0], d, h);
  // +Y (topo)
  pushQuad(m, [-x, h, z], [x, h, z], [x, h, -z], [-x, h, -z], [0, 1, 0], w, d);
  // -Y (base)
  pushQuad(m, [-x, 0, -z], [x, 0, -z], [x, 0, z], [-x, 0, z], [0, -1, 0], w, d);
  // +Z
  pushQuad(m, [-x, 0, z], [x, 0, z], [x, h, z], [-x, h, z], [0, 0, 1], w, h);
  // -Z
  pushQuad(m, [x, 0, -z], [-x, 0, -z], [-x, h, -z], [x, h, -z], [0, 0, -1], w, h);
  return finish(m);
}

/** Plano horizontal (chão/teto). `flip` vira a normal para baixo. */
export function buildFloor(w, d, flip = false) {
  const m = empty();
  const x = w / 2, z = d / 2;
  if (!flip) pushQuad(m, [-x, 0, z], [x, 0, z], [x, 0, -z], [-x, 0, -z], [0, 1, 0], w, d);
  else pushQuad(m, [-x, 0, -z], [x, 0, -z], [x, 0, z], [-x, 0, z], [0, -1, 0], w, d);
  return finish(m);
}

/**
 * Quad vertical de frente para +Z, apoiado em y=0. Usado para quadros,
 * fotografias, papéis na parede, cartazes.
 */
export function buildPanel(w, h) {
  const m = empty();
  const x = w / 2;
  pushQuad(m, [-x, 0, 0], [x, 0, 0], [x, h, 0], [-x, h, 0], [0, 0, 1], 1, 1);
  // Face de trás, para o painel não sumir se visto pelo outro lado.
  pushQuad(m, [x, 0, 0], [-x, 0, 0], [-x, h, 0], [x, h, 0], [0, 0, -1], 1, 1);
  return finish(m);
}

/** Cilindro em pé (pernas de mesa, canos, garrafas, abajures). */
export function buildCylinder(radius, h, segments = 10) {
  const m = empty();
  for (let i = 0; i < segments; i++) {
    const a0 = (i / segments) * Math.PI * 2;
    const a1 = ((i + 1) / segments) * Math.PI * 2;
    const c0 = Math.cos(a0), s0 = Math.sin(a0);
    const c1 = Math.cos(a1), s1 = Math.sin(a1);
    const nx = Math.cos((a0 + a1) / 2), nz = Math.sin((a0 + a1) / 2);
    // Ordem a1 -> a0 para que a face fique CCW vista de fora do cilindro:
    // invertida, a parede lateral seria comida pelo back-face culling.
    pushQuad(m,
      [c1 * radius, 0, s1 * radius], [c0 * radius, 0, s0 * radius],
      [c0 * radius, h, s0 * radius], [c1 * radius, h, s1 * radius],
      [nx, 0, nz], (Math.PI * 2 * radius) / segments, h);
  }
  // Tampa superior (leque de triângulos).
  const base = m.positions.length / 3;
  m.positions.push(0, h, 0); m.normals.push(0, 1, 0); m.uvs.push(0.5, 0.5);
  for (let i = 0; i <= segments; i++) {
    const a = (i / segments) * Math.PI * 2;
    m.positions.push(Math.cos(a) * radius, h, Math.sin(a) * radius);
    m.normals.push(0, 1, 0);
    m.uvs.push(0.5 + Math.cos(a) * 0.5, 0.5 + Math.sin(a) * 0.5);
  }
  // Mesma correção de orientação na tampa (normal +Y exige esta ordem).
  for (let i = 0; i < segments; i++) m.indices.push(base, base + 2 + i, base + 1 + i);
  return finish(m);
}

/**
 * Cache de geometria: caixas de mesmo tamanho compartilham o mesmo buffer de
 * GPU. Uma casa mobiliada tem centenas de caixas mas poucas dimensões únicas.
 */
export class GeometryCache {
  constructor(renderer) {
    this.renderer = renderer;
    this.map = new Map();
  }
  _get(key, build) {
    let g = this.map.get(key);
    if (!g) { g = this.renderer.createMesh(build()); this.map.set(key, g); }
    return g;
  }
  box(w, h, d) {
    const r = (n) => Math.round(n * 1000) / 1000;
    return this._get(`b:${r(w)},${r(h)},${r(d)}`, () => buildBox(w, h, d));
  }
  floor(w, d, flip = false) {
    return this._get(`f:${w},${d},${flip}`, () => buildFloor(w, d, flip));
  }
  panel(w, h) {
    const r = (n) => Math.round(n * 1000) / 1000;
    return this._get(`p:${r(w)},${r(h)}`, () => buildPanel(w, h));
  }
  cylinder(radius, h, seg = 10) {
    const r = (n) => Math.round(n * 1000) / 1000;
    return this._get(`c:${r(radius)},${r(h)},${seg}`, () => buildCylinder(radius, h, seg));
  }
}
