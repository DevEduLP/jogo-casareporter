// props.js — biblioteca de móveis. Cada função compõe um objeto a partir de
// primitivas e devolve peças em coordenadas de mundo. Cada factory equivale a
// uma cena reutilizável do Godot; nenhum código de engine vive aqui.

/**
 * Builder que resolve posição e rotação: as peças são descritas em espaço
 * local (mais fácil de raciocinar) e saem já colocadas no mundo.
 */
class Prop {
  constructor(x, y, z, rot = 0) {
    this.ox = x; this.oy = y; this.oz = z; this.rot = rot;
    this.parts = [];
    this.colliders = [];
    this.lights = [];
  }
  _world(lx, lz) {
    const c = Math.cos(this.rot), s = Math.sin(this.rot);
    return [this.ox + lx * c + lz * s, this.oz - lx * s + lz * c];
  }
  /** Caixa com pivô no chão, centrada em X/Z. */
  box(w, h, d, lx, ly, lz, tex, opts = {}) {
    const [wx, wz] = this._world(lx, lz);
    this.parts.push({
      geo: ['box', w, h, d],
      position: [wx, this.oy + ly, wz],
      rotationY: this.rot,
      material: { texture: tex, tint: opts.tint, uvScale: opts.uvScale || [0.5, 0.5], gloss: opts.gloss || 0, emissive: opts.emissive || 0 },
    });
    return this;
  }
  cyl(r, h, lx, ly, lz, tex, opts = {}) {
    const [wx, wz] = this._world(lx, lz);
    this.parts.push({
      geo: ['cylinder', r, h, opts.segments || 10],
      position: [wx, this.oy + ly, wz],
      rotationY: this.rot,
      material: { texture: tex, tint: opts.tint, uvScale: opts.uvScale || [0.5, 0.5], gloss: opts.gloss || 0, emissive: opts.emissive || 0 },
    });
    return this;
  }
  /** Painel vertical voltado para +Z local (quadros, fotos, espelhos). */
  panel(w, h, lx, ly, lz, tex, opts = {}) {
    const [wx, wz] = this._world(lx, lz);
    this.parts.push({
      geo: ['panel', w, h],
      position: [wx, this.oy + ly, wz],
      rotationY: this.rot + (opts.faceRot || 0),
      material: { texture: tex, tint: opts.tint, uvScale: opts.uvScale || [1, 1], gloss: opts.gloss || 0, emissive: opts.emissive || 0 },
      id: opts.id,
    });
    return this;
  }
  /** Plano horizontal (tapetes, poças, manchas no teto). */
  flat(w, d, lx, ly, lz, tex, opts = {}) {
    const [wx, wz] = this._world(lx, lz);
    this.parts.push({
      geo: ['floor', w, d, !!opts.flip],
      position: [wx, this.oy + ly, wz],
      rotationY: this.rot,
      material: { texture: tex, tint: opts.tint, uvScale: opts.uvScale || [0.5, 0.5], gloss: opts.gloss || 0, emissive: opts.emissive || 0 },
    });
    return this;
  }
  /** Footprint de colisão. Usa a extensão máxima — suficiente para 90° e o
   *  jogador nunca percebe a folga em móveis rotacionados. */
  solid(w, d, lx = 0, lz = 0, h = 2) {
    const [wx, wz] = this._world(lx, lz);
    const c = Math.abs(Math.cos(this.rot)), s = Math.abs(Math.sin(this.rot));
    const ew = w * c + d * s, ed = w * s + d * c;
    this.colliders.push({
      min: [wx - ew / 2, wz - ed / 2],
      max: [wx + ew / 2, wz + ed / 2],
      // baseY é obrigatório para que um obstáculo saiba em que andar ele está:
      // sem isso, uma viga acima da cabeça bloqueia os pés.
      baseY: this.oy,
      height: h,
    });
    return this;
  }
  light(lx, ly, lz, color, range, intensity, opts = {}) {
    const [wx, wz] = this._world(lx, lz);
    this.lights.push({
      id: opts.id,
      position: [wx, this.oy + ly, wz],
      color, range, intensity,
      flicker: opts.flicker || 0,
      enabled: opts.enabled !== false,
    });
    return this;
  }
}

const WOOD = 'wood', WOOD_L = 'woodLight', FAB = 'fabric', MET = 'metal', PAP = 'paper';

/* ------------------------------- mobiliário ------------------------------ */

export function table(x, z, rot = 0, w = 1.4, d = 0.9, h = 0.76) {
  const p = new Prop(x, 0, z, rot);
  p.box(w, 0.06, d, 0, h - 0.06, 0, WOOD, { uvScale: [0.7, 0.7] });
  const lx = w / 2 - 0.09, lz = d / 2 - 0.09;
  for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
    p.box(0.07, h - 0.06, 0.07, sx * lx, 0, sz * lz, WOOD);
  }
  p.solid(w, d, 0, 0, h);
  return p;
}

export function chair(x, z, rot = 0) {
  const p = new Prop(x, 0, z, rot);
  p.box(0.44, 0.05, 0.44, 0, 0.45, 0, WOOD);
  p.box(0.44, 0.5, 0.06, 0, 0.5, -0.19, WOOD);
  for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
    p.box(0.05, 0.45, 0.05, sx * 0.18, 0, sz * 0.18, WOOD);
  }
  p.solid(0.5, 0.5, 0, 0, 0.9);
  return p;
}

export function bed(x, z, rot = 0) {
  const p = new Prop(x, 0, z, rot);
  p.box(1.42, 0.34, 2.0, 0, 0, 0, WOOD, { uvScale: [0.6, 0.6] });       // estrado
  p.box(1.34, 0.20, 1.92, 0, 0.34, 0, FAB, { tint: [0.72, 0.68, 0.60] }); // colchão
  p.box(1.34, 0.08, 1.3, 0, 0.54, 0.28, FAB, { tint: [0.55, 0.52, 0.47] }); // lençol
  p.box(0.6, 0.14, 0.34, -0.3, 0.54, -0.78, FAB, { tint: [0.78, 0.75, 0.68] }); // travesseiro
  p.box(1.5, 0.9, 0.08, 0, 0, -1.02, WOOD);                              // cabeceira
  p.solid(1.5, 2.1, 0, 0, 0.6);
  return p;
}

export function nightstand(x, z, rot = 0) {
  const p = new Prop(x, 0, z, rot);
  p.box(0.46, 0.58, 0.4, 0, 0, 0, WOOD);
  p.box(0.4, 0.02, 0.03, 0, 0.34, 0.2, MET, { tint: [0.6, 0.58, 0.5] }); // puxador
  p.solid(0.5, 0.44, 0, 0, 0.6);
  return p;
}

export function wardrobe(x, z, rot = 0) {
  const p = new Prop(x, 0, z, rot);
  p.box(1.2, 2.05, 0.58, 0, 0, 0, WOOD, { uvScale: [0.5, 0.4] });
  p.box(0.02, 1.7, 0.02, 0, 0.2, 0.3, MET);
  p.solid(1.25, 0.62, 0, 0, 2.05);
  return p;
}

export function bookshelf(x, z, rot = 0, w = 1.0, h = 2.0) {
  const p = new Prop(x, 0, z, rot);
  p.box(w, h, 0.32, 0, 0, 0, WOOD, { uvScale: [0.5, 0.4] });
  // Livros: cada prateleira recebe uma fileira de lombadas de larguras e tons
  // variados. É o detalhe que faz uma estante parecer usada, não modelada.
  const shelves = Math.max(2, Math.floor(h / 0.42));
  let seed = Math.floor(Math.abs(x * 37 + z * 91));
  const rnd = () => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed % 1000) / 1000; };
  for (let s = 0; s < shelves; s++) {
    const y = 0.12 + s * (h - 0.2) / shelves;
    p.box(w - 0.06, 0.02, 0.3, 0, y, 0, WOOD, { tint: [0.8, 0.8, 0.8] });
    let cursor = -w / 2 + 0.06;
    while (cursor < w / 2 - 0.12) {
      const bw = 0.025 + rnd() * 0.045;
      if (cursor + bw > w / 2 - 0.06) break;
      const bh = 0.20 + rnd() * 0.12;
      const tone = 0.35 + rnd() * 0.5;
      // Alguns livros tombados: a estante nunca está perfeitamente arrumada.
      p.box(bw, bh, 0.2 + rnd() * 0.06, cursor + bw / 2, y + 0.02, -0.02, WOOD,
        { tint: [tone * 0.9, tone * 0.72, tone * 0.55] });
      cursor += bw + 0.004 + rnd() * 0.02;
    }
  }
  p.solid(w + 0.04, 0.36, 0, 0, h);
  return p;
}

export function desk(x, z, rot = 0) {
  const p = new Prop(x, 0, z, rot);
  p.box(1.6, 0.06, 0.75, 0, 0.72, 0, WOOD, { uvScale: [0.6, 0.6] });
  p.box(0.5, 0.66, 0.7, -0.5, 0, 0, WOOD);              // gaveteiro
  p.box(0.44, 0.02, 0.02, -0.5, 0.5, 0.36, MET, { tint: [0.65, 0.6, 0.5] });
  p.box(0.44, 0.02, 0.02, -0.5, 0.25, 0.36, MET, { tint: [0.65, 0.6, 0.5] });
  p.box(0.06, 0.72, 0.7, 0.75, 0, 0, WOOD);
  p.solid(1.65, 0.8, 0, 0, 0.78);
  return p;
}

export function sofa(x, z, rot = 0) {
  const p = new Prop(x, 0, z, rot);
  p.box(1.95, 0.38, 0.85, 0, 0, 0, 'fabricRed', { uvScale: [0.8, 0.8] });
  p.box(1.95, 0.55, 0.22, 0, 0.38, -0.32, 'fabricRed', { uvScale: [0.8, 0.8] });
  p.box(0.22, 0.30, 0.85, -0.87, 0.38, 0, 'fabricRed', { uvScale: [0.8, 0.8] });
  p.box(0.22, 0.30, 0.85, 0.87, 0.38, 0, 'fabricRed', { uvScale: [0.8, 0.8] });
  p.box(0.55, 0.12, 0.5, -0.4, 0.38, 0.06, 'fabricRed', { tint: [1.1, 1.05, 1.0] });
  p.solid(2.0, 0.9, 0, 0, 0.8);
  return p;
}

export function armchair(x, z, rot = 0) {
  const p = new Prop(x, 0, z, rot);
  p.box(0.8, 0.38, 0.8, 0, 0, 0, FAB, { uvScale: [0.9, 0.9] });
  p.box(0.8, 0.55, 0.2, 0, 0.38, -0.3, FAB, { uvScale: [0.9, 0.9] });
  p.box(0.18, 0.28, 0.8, -0.31, 0.38, 0, FAB);
  p.box(0.18, 0.28, 0.8, 0.31, 0.38, 0, FAB);
  p.solid(0.85, 0.85, 0, 0, 0.8);
  return p;
}

export function rug(x, z, rot = 0, w = 2.4, d = 1.7, tint = [0.55, 0.42, 0.36]) {
  const p = new Prop(x, 0, z, rot);
  p.flat(w, d, 0, 0.012, 0, FAB, { tint, uvScale: [1.2, 1.2] });
  return p;
}

export function counter(x, z, rot = 0, w = 2.2) {
  const p = new Prop(x, 0, z, rot);
  p.box(w, 0.86, 0.62, 0, 0, 0, WOOD, { uvScale: [0.5, 0.5] });
  p.box(w + 0.04, 0.05, 0.66, 0, 0.86, 0, 'floorTile', { uvScale: [1.2, 0.4], gloss: 0.25 });
  p.solid(w + 0.04, 0.66, 0, 0, 0.91);
  return p;
}

export function sink(x, z, rot = 0) {
  const p = new Prop(x, 0, z, rot);
  p.box(0.7, 0.86, 0.6, 0, 0, 0, WOOD);
  p.box(0.66, 0.06, 0.56, 0, 0.86, 0, MET, { gloss: 0.4, tint: [0.8, 0.82, 0.85] });
  p.box(0.5, 0.03, 0.4, 0, 0.80, 0, MET, { gloss: 0.5, tint: [0.55, 0.57, 0.6] });
  p.cyl(0.02, 0.26, 0, 0.9, -0.2, MET, { gloss: 0.6, tint: [0.75, 0.75, 0.7] });
  p.box(0.16, 0.02, 0.03, 0, 1.14, -0.14, MET, { gloss: 0.6 });
  p.solid(0.74, 0.64, 0, 0, 0.91);
  return p;
}

export function stove(x, z, rot = 0) {
  const p = new Prop(x, 0, z, rot);
  p.box(0.76, 0.88, 0.62, 0, 0, 0, MET, { tint: [0.72, 0.70, 0.66], uvScale: [0.6, 0.6] });
  p.box(0.72, 0.04, 0.58, 0, 0.88, 0, MET, { tint: [0.35, 0.34, 0.32], gloss: 0.2 });
  for (const [ox, oz] of [[-0.16, -0.13], [0.16, -0.13], [-0.16, 0.15], [0.16, 0.15]]) {
    p.cyl(0.075, 0.015, ox, 0.92, oz, MET, { tint: [0.28, 0.27, 0.25], segments: 12 });
  }
  p.box(0.6, 0.36, 0.02, 0, 0.4, 0.32, 'glass', { tint: [0.4, 0.4, 0.42] });
  p.solid(0.8, 0.66, 0, 0, 0.92);
  return p;
}

export function fridge(x, z, rot = 0) {
  const p = new Prop(x, 0, z, rot);
  p.box(0.72, 1.62, 0.68, 0, 0, 0, MET, { tint: [0.80, 0.78, 0.72], uvScale: [0.4, 0.4], gloss: 0.1 });
  p.box(0.03, 0.5, 0.03, 0.3, 0.95, 0.35, MET, { tint: [0.6, 0.6, 0.58] });
  p.box(0.7, 0.02, 0.02, 0, 1.05, 0.35, MET, { tint: [0.3, 0.3, 0.3] });
  p.solid(0.76, 0.72, 0, 0, 1.62);
  return p;
}

export function toilet(x, z, rot = 0) {
  const p = new Prop(x, 0, z, rot);
  p.box(0.38, 0.42, 0.6, 0, 0, 0, 'floorTile', { tint: [1.1, 1.1, 1.05], uvScale: [1, 1] });
  p.box(0.4, 0.05, 0.5, 0, 0.42, 0.03, 'floorTile', { tint: [1.05, 1.05, 1] });
  p.box(0.42, 0.62, 0.2, 0, 0, -0.35, 'floorTile', { tint: [1.1, 1.1, 1.05] });
  p.solid(0.45, 0.7, 0, -0.1, 0.7);
  return p;
}

export function bathtub(x, z, rot = 0) {
  const p = new Prop(x, 0, z, rot);
  p.box(0.76, 0.55, 1.65, 0, 0, 0, 'floorTile', { tint: [1.05, 1.05, 1.0], uvScale: [0.8, 0.8] });
  p.box(0.64, 0.06, 1.5, 0, 0.45, 0, 'black', { tint: [0.5, 0.5, 0.5] }); // interior sombrio
  p.solid(0.8, 1.7, 0, 0, 0.6);
  return p;
}

export function mirror(x, y, z, rot = 0, w = 0.6, h = 0.8) {
  const p = new Prop(x, y, z, rot);
  p.box(w + 0.06, h + 0.06, 0.04, 0, 0, 0.01, WOOD);
  p.panel(w, h, 0, 0.03, 0.035, 'glass', { tint: [0.55, 0.6, 0.65], gloss: 0.8 });
  return p;
}

export function cabinet(x, z, rot = 0, w = 0.9, h = 1.1) {
  const p = new Prop(x, 0, z, rot);
  p.box(w, h, 0.42, 0, 0, 0, WOOD, { uvScale: [0.5, 0.5] });
  p.box(w * 0.42, h * 0.7, 0.02, -w * 0.22, h * 0.15, 0.22, WOOD, { tint: [0.85, 0.85, 0.85] });
  p.box(w * 0.42, h * 0.7, 0.02, w * 0.22, h * 0.15, 0.22, WOOD, { tint: [0.85, 0.85, 0.85] });
  p.solid(w + 0.04, 0.46, 0, 0, h);
  return p;
}

/** Arquivo de aço — o móvel definidor do escritório de Helena. */
export function fileCabinet(x, z, rot = 0, drawers = 4) {
  const p = new Prop(x, 0, z, rot);
  const h = drawers * 0.34 + 0.1;
  p.box(0.5, h, 0.62, 0, 0, 0, MET, { tint: [0.55, 0.56, 0.52], uvScale: [0.5, 0.4] });
  for (let i = 0; i < drawers; i++) {
    const y = 0.06 + i * 0.34;
    p.box(0.46, 0.3, 0.02, 0, y, 0.32, MET, { tint: [0.62, 0.63, 0.58] });
    p.box(0.16, 0.03, 0.03, 0, y + 0.15, 0.34, MET, { tint: [0.75, 0.75, 0.7], gloss: 0.3 });
  }
  p.solid(0.54, 0.66, 0, 0, h);
  return p;
}

export function crate(x, z, rot = 0, s = 0.5) {
  const p = new Prop(x, 0, z, rot);
  p.box(s, s * 0.8, s, 0, 0, 0, WOOD_L, { uvScale: [1, 1] });
  p.solid(s, s, 0, 0, s * 0.8);
  return p;
}

/** Pilha de papéis — o vocabulário visual de Helena. `baseY` a põe num móvel. */
export function paperStack(x, z, rot = 0, count = 5, baseY = 0) {
  const p = new Prop(x, baseY, z, rot);
  let y = 0;
  for (let i = 0; i < count; i++) {
    const jitter = (i % 3 - 1) * 0.02;
    p.box(0.3, 0.045, 0.22, jitter, y, jitter * 0.6, PAP, { uvScale: [1, 1], tint: [0.9, 0.88, 0.8] });
    y += 0.045;
  }
  return p;
}

/* ------------------------------ iluminação ------------------------------- */

// As luminárias sempre criam a luz (desligada, se for o caso) e marcam a peça
// do bulbo com um id: assim o interruptor pode acendê-las em runtime sem
// reconstruir a geometria da cena.
export function ceilingLamp(x, z, id, on = false, y = 2.42) {
  const p = new Prop(x, 0, z, 0);
  p.cyl(0.012, 0.32, 0, y, 0, MET, { tint: [0.3, 0.3, 0.3] });
  p.cyl(0.16, 0.14, 0, y - 0.14, 0, 'lampGlow', {
    tint: on ? [1, 0.92, 0.75] : [0.35, 0.33, 0.28],
    emissive: on ? 0.85 : 0.05,
  });
  p.parts[p.parts.length - 1].bulbOf = id;
  p.light(0, y - 0.2, 0, [1.0, 0.82, 0.58], 5.2, 0.85, { id, flicker: 0.12, enabled: on });
  return p;
}

export function floorLamp(x, z, id, on = false) {
  const p = new Prop(x, 0, z, 0);
  p.cyl(0.16, 0.03, 0, 0, 0, MET, { tint: [0.4, 0.4, 0.38] });
  p.cyl(0.02, 1.4, 0, 0.03, 0, MET, { tint: [0.45, 0.44, 0.4] });
  p.cyl(0.19, 0.26, 0, 1.4, 0, 'lampGlow', {
    tint: on ? [1, 0.88, 0.68] : [0.42, 0.38, 0.32],
    emissive: on ? 0.7 : 0.05, segments: 12,
  });
  p.parts[p.parts.length - 1].bulbOf = id;
  p.light(0, 1.45, 0, [1.0, 0.78, 0.5], 4.2, 0.7, { id, flicker: 0.2, enabled: on });
  p.solid(0.34, 0.34, 0, 0, 1.6);
  return p;
}

/** Janela: moldura + vidro auto-iluminado (o céu noturno) + spill de luar. */
export function window_(x, y, z, rot = 0, w = 1.1, h = 1.3, moonlight = 0.35) {
  const p = new Prop(x, y, z, rot);
  p.panel(w, h, 0, 0, 0, 'glass', { tint: [0.30, 0.38, 0.52], emissive: 0.55 });
  p.box(w + 0.12, 0.08, 0.1, 0, -0.06, 0.02, WOOD);
  p.box(w + 0.12, 0.08, 0.1, 0, h, 0.02, WOOD);
  p.box(0.08, h + 0.14, 0.1, -w / 2 - 0.04, -0.06, 0.02, WOOD);
  p.box(0.08, h + 0.14, 0.1, w / 2 + 0.04, -0.06, 0.02, WOOD);
  p.box(0.05, h, 0.06, 0, 0, 0.02, WOOD);              // caixilho central
  p.box(w, 0.05, 0.06, 0, h / 2, 0.02, WOOD);
  if (moonlight > 0) {
    // Luz logo à frente do vidro: simula o feixe de luar entrando. Sem shadow
    // maps, é o que dá às janelas presença real no interior escuro.
    const c = Math.cos(rot), s = Math.sin(rot);
    p.lights.push({
      position: [x + s * 0.6, y + h * 0.55, z + c * 0.6],
      color: [0.42, 0.52, 0.78], range: 4.6, intensity: moonlight, flicker: 0,
    });
  }
  return p;
}

/* -------------------------------- objetos -------------------------------- */

export function radio(x, y, z, rot = 0) {
  const p = new Prop(x, y, z, rot);
  p.box(0.34, 0.2, 0.16, 0, 0, 0, WOOD_L, { uvScale: [1.4, 1.4] });
  p.box(0.16, 0.12, 0.01, -0.06, 0.05, 0.081, MET, { tint: [0.35, 0.34, 0.3] });
  p.cyl(0.028, 0.02, 0.09, 0.06, 0.08, MET, { tint: [0.7, 0.68, 0.6], gloss: 0.3 });
  p.cyl(0.028, 0.02, 0.09, 0.13, 0.08, MET, { tint: [0.7, 0.68, 0.6], gloss: 0.3 });
  return p;
}

export function tapeRecorder(x, y, z, rot = 0) {
  const p = new Prop(x, y, z, rot);
  p.box(0.28, 0.07, 0.2, 0, 0, 0, 'black', { tint: [0.5, 0.5, 0.52] });
  p.box(0.16, 0.01, 0.1, 0, 0.07, 0.01, 'glass', { tint: [0.3, 0.32, 0.34] });
  for (let i = 0; i < 5; i++) {
    p.box(0.035, 0.012, 0.03, -0.1 + i * 0.05, 0.07, -0.07, MET, { tint: [0.65, 0.64, 0.6] });
  }
  return p;
}

export function typewriter(x, y, z, rot = 0) {
  const p = new Prop(x, y, z, rot);
  p.box(0.36, 0.1, 0.3, 0, 0, 0, MET, { tint: [0.28, 0.27, 0.26], uvScale: [1, 1] });
  p.box(0.34, 0.08, 0.06, 0, 0.1, -0.1, MET, { tint: [0.32, 0.31, 0.3] });
  p.cyl(0.03, 0.3, 0, 0.14, -0.1, MET, { tint: [0.4, 0.39, 0.36] });
  // Uma folha ainda na máquina. Helena nunca terminava de guardar as coisas.
  p.panel(0.21, 0.28, 0, 0.13, -0.06, PAP, { tint: [1, 0.98, 0.9], faceRot: 0.18 });
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 9; c++) {
      p.cyl(0.008, 0.012, -0.14 + c * 0.035, 0.1 + r * 0.012, 0.02 + r * 0.035, MET,
        { tint: [0.75, 0.73, 0.68], segments: 6 });
    }
  }
  return p;
}

export function wallClock(x, y, z, rot = 0) {
  const p = new Prop(x, y, z, rot);
  p.cyl(0.14, 0.05, 0, 0, 0, WOOD, { segments: 14 });
  p.panel(0.24, 0.24, 0, -0.12, 0.03, 'white', { tint: [0.82, 0.79, 0.7] });
  p.box(0.012, 0.09, 0.01, 0, 0.0, 0.04, 'black');
  p.box(0.07, 0.012, 0.01, 0.03, 0.0, 0.04, 'black');
  return p;
}

export function picture(x, y, z, rot = 0, w = 0.4, h = 0.5, tex = 'paper', tint) {
  const p = new Prop(x, y, z, rot);
  p.box(w + 0.05, h + 0.05, 0.03, 0, 0, 0.005, WOOD);
  p.panel(w, h, 0, 0.025, 0.025, tex, { tint });
  return p;
}

export function curtain(x, y, z, rot = 0, w = 1.4, h = 1.8, tint = [0.42, 0.38, 0.34]) {
  const p = new Prop(x, y, z, rot);
  p.box(w, h, 0.05, 0, 0, 0, FAB, { tint, uvScale: [0.8, 1.2] });
  p.box(w + 0.16, 0.04, 0.04, 0, h, 0, MET, { tint: [0.5, 0.48, 0.44] });
  return p;
}

export function flowerpot(x, z) {
  const p = new Prop(x, 0, z, 0);
  p.cyl(0.17, 0.28, 0, 0, 0, 'brick', { tint: [0.85, 0.6, 0.5], segments: 12 });
  p.cyl(0.15, 0.05, 0, 0.28, 0, 'dirt', { segments: 12 });
  // Planta morta: hastes secas, nenhuma folha.
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2;
    p.cyl(0.008, 0.22 + (i % 3) * 0.08, Math.cos(a) * 0.05, 0.3, Math.sin(a) * 0.05,
      WOOD, { tint: [0.45, 0.4, 0.3], segments: 5 });
  }
  p.solid(0.36, 0.36, 0, 0, 0.35);
  return p;
}

export function stairsDown(x, z, rot = 0, steps = 8) {
  const p = new Prop(x, 0, z, rot);
  for (let i = 0; i < steps; i++) {
    p.box(1.1, 0.05, 0.28, 0, -0.2 * i, i * 0.28, WOOD, { uvScale: [0.8, 0.8] });
  }
  return p;
}

/** Caixa avulsa. `opts.y` eleva a peça (vigas, telhado, prateleiras soltas). */
export function box_(x, z, rot, w, h, d, tex, opts = {}) {
  const p = new Prop(x, opts.y || 0, z, rot);
  p.box(w, h, d, 0, 0, 0, tex, opts);
  if (opts.collide !== false) p.solid(w, d, 0, 0, h);
  return p;
}

/** Plano horizontal avulso (terreno, caminho, assoalho da varanda). */
export function ground(x, y, z, w, d, tex, uvScale = [1, 1], tint) {
  const p = new Prop(x, y, z, 0);
  p.flat(w, d, 0, 0, 0, tex, { uvScale, tint });
  return p;
}

/**
 * Marca todas as peças e colisores de um prop com um id de grupo. É assim que
 * um objeto "muda de lugar": duas cópias em cômodos diferentes, uma visível e
 * outra não, trocadas pelo Sistema de Realidade enquanto ninguém olha.
 */
export function tag(prop, groupId, visible = true) {
  for (const part of prop.parts) { part.group = groupId; part.visible = visible; }
  for (const col of prop.colliders) { col.group = groupId; col.enabled = visible; }
  return prop;
}

/** Lance de escada descendente, usado como degraus visuais (sem colisor:
 *  quem resolve a altura é o floorHeightAt do World). */
export function staircase(x, z, steps, run, rise, width = 2.2) {
  const p = new Prop(x, 0, z, 0);
  for (let i = 0; i < steps; i++) {
    const y = -(i + 1) * rise;
    // Espelho (a face vertical) e piso (a face horizontal) de cada degrau.
    p.box(width, rise, 0.04, 0, y, -i * run, 'wood', { uvScale: [0.8, 0.8] });
    p.box(width, 0.05, run, 0, y + rise, -i * run - run / 2, 'wood', { uvScale: [0.8, 0.8] });
  }
  return p;
}

/** Combina vários props num só conjunto — açúcar sintático para os cômodos. */
export function combine(...props) {
  const out = { parts: [], colliders: [], lights: [] };
  for (const p of props) {
    if (!p) continue;
    out.parts.push(...p.parts);
    out.colliders.push(...p.colliders);
    out.lights.push(...p.lights);
  }
  return out;
}
