// textures.js — todas as texturas são geradas em Canvas 2D em tempo de carga.
// Nenhum asset binário: o jogo roda offline e as imagens narrativas (sobretudo
// a fotografia) podem ser REDESENHADAS quando a realidade muda.

import { makeRNG } from '../math.js';

function canvasOf(size) {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  return c;
}

/** Ruído granulado aplicado por cima de qualquer textura — sujeira, idade. */
function grain(ctx, size, amount, rng) {
  const img = ctx.getImageData(0, 0, size, size);
  const d = img.data;
  for (let i = 0; i < d.length; i += 4) {
    const n = (rng() - 0.5) * amount;
    d[i] = Math.max(0, Math.min(255, d[i] + n));
    d[i + 1] = Math.max(0, Math.min(255, d[i + 1] + n));
    d[i + 2] = Math.max(0, Math.min(255, d[i + 2] + n));
  }
  ctx.putImageData(img, 0, 0);
}

/** Manchas escuras irregulares: umidade, mofo, gordura, tempo. */
function stains(ctx, size, count, color, rng, maxR = 0.22) {
  for (let i = 0; i < count; i++) {
    const x = rng() * size, y = rng() * size;
    const r = (0.03 + rng() * maxR) * size;
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, color.replace('ALPHA', (0.10 + rng() * 0.22).toFixed(3)));
    g.addColorStop(1, color.replace('ALPHA', '0'));
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
}

/* ------------------------------- materiais ------------------------------- */

function woodFloor(size, rng) {
  const c = canvasOf(size), ctx = c.getContext('2d');
  ctx.fillStyle = '#4a382a';
  ctx.fillRect(0, 0, size, size);
  const planks = 6, ph = size / planks;
  for (let i = 0; i < planks; i++) {
    const shade = 0.78 + rng() * 0.4;
    ctx.fillStyle = `rgb(${Math.floor(88 * shade)},${Math.floor(64 * shade)},${Math.floor(44 * shade)})`;
    ctx.fillRect(0, i * ph, size, ph - 1);
    // Veios da madeira.
    for (let g = 0; g < 26; g++) {
      const y = i * ph + rng() * ph;
      ctx.strokeStyle = `rgba(30,20,12,${0.05 + rng() * 0.18})`;
      ctx.lineWidth = 0.5 + rng() * 1.6;
      ctx.beginPath();
      ctx.moveTo(0, y);
      for (let x = 0; x <= size; x += 16) {
        ctx.lineTo(x, y + Math.sin((x / size) * Math.PI * (1 + rng() * 3)) * 2.2);
      }
      ctx.stroke();
    }
    // Frestas entre as tábuas.
    ctx.fillStyle = 'rgba(12,8,5,0.85)';
    ctx.fillRect(0, i * ph + ph - 2, size, 2);
  }
  stains(ctx, size, 14, 'rgba(20,12,6,ALPHA)', rng);
  grain(ctx, size, 26, rng);
  return c;
}

function wallpaper(size, rng) {
  const c = canvasOf(size), ctx = c.getContext('2d');
  ctx.fillStyle = '#6d6353';
  ctx.fillRect(0, 0, size, size);
  // Listras verticais discretas.
  for (let x = 0; x < size; x += 32) {
    ctx.fillStyle = `rgba(120,110,92,${0.10 + rng() * 0.05})`;
    ctx.fillRect(x, 0, 14, size);
  }
  // Motivo floral esquemático, do tipo que ninguém escolheria hoje.
  for (let y = 20; y < size; y += 64) {
    for (let x = 20; x < size; x += 64) {
      const ox = x + (y % 128 === 20 ? 0 : 32);
      ctx.strokeStyle = 'rgba(96,84,64,0.5)';
      ctx.lineWidth = 1.4;
      for (let p = 0; p < 5; p++) {
        const a = (p / 5) * Math.PI * 2;
        ctx.beginPath();
        ctx.ellipse(ox + Math.cos(a) * 7, y + Math.sin(a) * 7, 5, 3, a, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
  }
  // Descolamento perto do topo + umidade subindo do rodapé.
  stains(ctx, size, 10, 'rgba(48,38,22,ALPHA)', rng, 0.3);
  stains(ctx, size, 5, 'rgba(20,26,18,ALPHA)', rng, 0.16);
  grain(ctx, size, 20, rng);
  return c;
}

function plaster(size, rng) {
  const c = canvasOf(size), ctx = c.getContext('2d');
  ctx.fillStyle = '#8a8377';
  ctx.fillRect(0, 0, size, size);
  stains(ctx, size, 22, 'rgba(60,54,44,ALPHA)', rng, 0.3);
  // Rachaduras.
  for (let i = 0; i < 7; i++) {
    ctx.strokeStyle = `rgba(40,36,30,${0.25 + rng() * 0.35})`;
    ctx.lineWidth = 0.6 + rng();
    ctx.beginPath();
    let x = rng() * size, y = rng() * size;
    ctx.moveTo(x, y);
    for (let s = 0; s < 14; s++) {
      x += (rng() - 0.5) * 34;
      y += (rng() - 0.5) * 34;
      ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
  grain(ctx, size, 24, rng);
  return c;
}

function woodDark(size, rng) {
  const c = canvasOf(size), ctx = c.getContext('2d');
  ctx.fillStyle = '#3b2a1d';
  ctx.fillRect(0, 0, size, size);
  for (let i = 0; i < 90; i++) {
    ctx.strokeStyle = `rgba(${20 + rng() * 60},${14 + rng() * 40},${8 + rng() * 26},${0.12 + rng() * 0.3})`;
    ctx.lineWidth = 0.5 + rng() * 2.4;
    const y = rng() * size;
    ctx.beginPath();
    ctx.moveTo(0, y);
    for (let x = 0; x <= size; x += 20) ctx.lineTo(x, y + Math.sin(x * 0.02 + i) * 3);
    ctx.stroke();
  }
  grain(ctx, size, 18, rng);
  return c;
}

function tile(size, rng) {
  const c = canvasOf(size), ctx = c.getContext('2d');
  const n = 4, s = size / n;
  for (let y = 0; y < n; y++) {
    for (let x = 0; x < n; x++) {
      const light = (x + y) % 2 === 0;
      const v = (light ? 176 : 138) * (0.9 + rng() * 0.18);
      ctx.fillStyle = `rgb(${v | 0},${(v * 0.99) | 0},${(v * 0.92) | 0})`;
      ctx.fillRect(x * s, y * s, s - 2, s - 2);
    }
  }
  ctx.fillStyle = 'rgba(60,56,48,0.55)';
  for (let i = 0; i <= n; i++) {
    ctx.fillRect(i * s - 2, 0, 3, size);
    ctx.fillRect(0, i * s - 2, size, 3);
  }
  stains(ctx, size, 12, 'rgba(50,46,30,ALPHA)', rng, 0.12);
  grain(ctx, size, 16, rng);
  return c;
}

function fabric(size, rng, base = [92, 72, 60]) {
  const c = canvasOf(size), ctx = c.getContext('2d');
  ctx.fillStyle = `rgb(${base[0]},${base[1]},${base[2]})`;
  ctx.fillRect(0, 0, size, size);
  // Trama: linhas cruzadas finas.
  for (let i = 0; i < size; i += 3) {
    ctx.fillStyle = `rgba(255,255,255,${0.02 + rng() * 0.03})`;
    ctx.fillRect(i, 0, 1, size);
    ctx.fillStyle = `rgba(0,0,0,${0.03 + rng() * 0.04})`;
    ctx.fillRect(0, i, size, 1);
  }
  stains(ctx, size, 9, 'rgba(30,20,14,ALPHA)', rng, 0.2);
  grain(ctx, size, 14, rng);
  return c;
}

function paper(size, rng) {
  const c = canvasOf(size), ctx = c.getContext('2d');
  ctx.fillStyle = '#cfc4a6';
  ctx.fillRect(0, 0, size, size);
  stains(ctx, size, 16, 'rgba(120,92,48,ALPHA)', rng, 0.18);
  // Linhas de texto sugeridas — ilegíveis de perto, convincentes de longe.
  ctx.fillStyle = 'rgba(50,42,34,0.55)';
  for (let y = 26; y < size - 20; y += 13) {
    const w = size * (0.45 + rng() * 0.4);
    ctx.fillRect(24, y, w, 1.6);
  }
  grain(ctx, size, 14, rng);
  return c;
}

function grass(size, rng) {
  const c = canvasOf(size), ctx = c.getContext('2d');
  ctx.fillStyle = '#26301f';
  ctx.fillRect(0, 0, size, size);
  for (let i = 0; i < 2600; i++) {
    const x = rng() * size, y = rng() * size;
    const g = 26 + rng() * 40;
    ctx.strokeStyle = `rgba(${(g * 0.55) | 0},${g | 0},${(g * 0.45) | 0},${0.3 + rng() * 0.5})`;
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + (rng() - 0.5) * 3, y - 2 - rng() * 5);
    ctx.stroke();
  }
  stains(ctx, size, 10, 'rgba(10,14,8,ALPHA)', rng, 0.3);
  return c;
}

function concrete(size, rng) {
  const c = canvasOf(size), ctx = c.getContext('2d');
  ctx.fillStyle = '#575450';
  ctx.fillRect(0, 0, size, size);
  stains(ctx, size, 26, 'rgba(30,30,28,ALPHA)', rng, 0.28);
  stains(ctx, size, 8, 'rgba(120,116,105,ALPHA)', rng, 0.2);
  grain(ctx, size, 30, rng);
  return c;
}

function brick(size, rng) {
  const c = canvasOf(size), ctx = c.getContext('2d');
  ctx.fillStyle = '#5a5049';
  ctx.fillRect(0, 0, size, size);
  const rows = 8, bh = size / rows;
  for (let r = 0; r < rows; r++) {
    const offset = (r % 2) * (size / 8);
    for (let b = -1; b < 4; b++) {
      const x = offset + b * (size / 4);
      const v = 0.75 + rng() * 0.45;
      ctx.fillStyle = `rgb(${(96 * v) | 0},${(66 * v) | 0},${(52 * v) | 0})`;
      ctx.fillRect(x + 2, r * bh + 2, size / 4 - 4, bh - 4);
    }
  }
  stains(ctx, size, 14, 'rgba(24,20,16,ALPHA)', rng, 0.25);
  grain(ctx, size, 20, rng);
  return c;
}

function metal(size, rng) {
  const c = canvasOf(size), ctx = c.getContext('2d');
  ctx.fillStyle = '#6b6b70';
  ctx.fillRect(0, 0, size, size);
  for (let i = 0; i < 400; i++) {
    ctx.fillStyle = `rgba(${140 + rng() * 60},${140 + rng() * 60},${145 + rng() * 60},${rng() * 0.14})`;
    ctx.fillRect(0, rng() * size, size, 0.7);
  }
  stains(ctx, size, 12, 'rgba(92,48,20,ALPHA)', rng, 0.14); // ferrugem
  grain(ctx, size, 16, rng);
  return c;
}

function glassPane(size, rng) {
  const c = canvasOf(size), ctx = c.getContext('2d');
  ctx.fillStyle = '#20262e';
  ctx.fillRect(0, 0, size, size);
  const g = ctx.createLinearGradient(0, 0, size, size);
  g.addColorStop(0, 'rgba(150,175,200,0.30)');
  g.addColorStop(0.5, 'rgba(90,110,135,0.12)');
  g.addColorStop(1, 'rgba(160,180,205,0.24)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  stains(ctx, size, 18, 'rgba(40,44,40,ALPHA)', rng, 0.2); // sujeira
  return c;
}

function solid(size, r, g, b) {
  const c = canvasOf(size), ctx = c.getContext('2d');
  ctx.fillStyle = `rgb(${r},${g},${b})`;
  ctx.fillRect(0, 0, size, size);
  return c;
}

/* ----------------------------- a fotografia ------------------------------ */
/**
 * A fotografia é o objeto narrativo central do jogo, então é desenhada por
 * código e não carregada de um arquivo: uma variante nova é só um parâmetro.
 *
 * variant 0 — Helena sozinha na frente da casa.
 * variant 1 — Helena e uma segunda figura, parcialmente atrás dela.
 * variant 2 — a segunda figura está nítida; Helena está apagada.
 *
 * As figuras são propositalmente indistintas. Nada aqui deve *provar* nada:
 * o jogador precisa poder dizer "é grão da foto" com a mesma convicção com que
 * diz "é ela".
 */
export function drawPhotograph(canvas, variant = 0, seed = 1998) {
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  const rng = makeRNG(seed);

  // Base sépia.
  ctx.fillStyle = '#b9a487';
  ctx.fillRect(0, 0, W, H);
  const sky = ctx.createLinearGradient(0, 0, 0, H * 0.55);
  sky.addColorStop(0, '#d8c9ad');
  sky.addColorStop(1, '#b0a087');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, W, H * 0.6);

  // A casa ao fundo (a mesma silhueta da casa que o jogador está explorando).
  ctx.fillStyle = '#6d5f4c';
  ctx.fillRect(W * 0.12, H * 0.22, W * 0.76, H * 0.42);
  ctx.beginPath();
  ctx.moveTo(W * 0.06, H * 0.24);
  ctx.lineTo(W * 0.5, H * 0.06);
  ctx.lineTo(W * 0.94, H * 0.24);
  ctx.closePath();
  ctx.fillStyle = '#57493a';
  ctx.fill();
  // Janelas — uma delas mais escura que as outras, sem explicação.
  for (let i = 0; i < 3; i++) {
    ctx.fillStyle = i === 2 ? '#221c16' : '#8d7f68';
    ctx.fillRect(W * (0.2 + i * 0.24), H * 0.3, W * 0.13, H * 0.13);
  }
  // Chão.
  ctx.fillStyle = '#8f7f66';
  ctx.fillRect(0, H * 0.6, W, H * 0.4);

  // Figura humana esquemática e desfocada.
  const figure = (cx, scale, tone, blur, faceTone) => {
    ctx.save();
    ctx.filter = `blur(${blur}px)`;
    ctx.fillStyle = tone;
    const baseY = H * 0.92;
    const bodyH = H * 0.42 * scale;
    // Corpo (vestido/casaco longo).
    ctx.beginPath();
    ctx.moveTo(cx - W * 0.055 * scale, baseY);
    ctx.lineTo(cx - W * 0.032 * scale, baseY - bodyH * 0.78);
    ctx.lineTo(cx + W * 0.032 * scale, baseY - bodyH * 0.78);
    ctx.lineTo(cx + W * 0.055 * scale, baseY);
    ctx.closePath();
    ctx.fill();
    // Cabeça.
    ctx.beginPath();
    ctx.arc(cx, baseY - bodyH * 0.9, W * 0.035 * scale, 0, Math.PI * 2);
    ctx.fillStyle = faceTone;
    ctx.fill();
    // Cabelo.
    ctx.beginPath();
    ctx.arc(cx, baseY - bodyH * 0.95, W * 0.037 * scale, Math.PI * 0.85, Math.PI * 2.15);
    ctx.fillStyle = tone;
    ctx.fill();
    ctx.restore();
  };

  if (variant === 0) {
    figure(W * 0.5, 1.0, '#4a3f33', 1.2, '#a08d74');
  } else if (variant === 1) {
    figure(W * 0.42, 1.0, '#4a3f33', 1.2, '#a08d74');
    // A segunda figura, meio passo atrás e desfocada — como quem se moveu
    // durante a exposição, ou como quem não deveria estar ali.
    figure(W * 0.60, 0.94, '#453b31', 2.6, '#97846d');
  } else {
    // A troca: agora a que está nítida é a segunda.
    figure(W * 0.42, 1.0, '#5a4f43', 3.4, '#9b8a72');
    figure(W * 0.60, 0.96, '#42382e', 0.9, '#a58f76');
  }

  // Envelhecimento do papel: vinheta, arranhões, emulsão perdida nas bordas.
  const vig = ctx.createRadialGradient(W / 2, H / 2, H * 0.25, W / 2, H / 2, H * 0.8);
  vig.addColorStop(0, 'rgba(0,0,0,0)');
  vig.addColorStop(1, 'rgba(48,34,18,0.55)');
  ctx.fillStyle = vig;
  ctx.fillRect(0, 0, W, H);
  for (let i = 0; i < 40; i++) {
    ctx.strokeStyle = `rgba(255,248,225,${rng() * 0.14})`;
    ctx.lineWidth = rng() * 1.1;
    ctx.beginPath();
    const x = rng() * W, y = rng() * H;
    ctx.moveTo(x, y);
    ctx.lineTo(x + (rng() - 0.5) * 60, y + (rng() - 0.5) * 22);
    ctx.stroke();
  }
  const img = ctx.getImageData(0, 0, W, H);
  const d = img.data;
  for (let i = 0; i < d.length; i += 4) {
    const n = (rng() - 0.5) * 34;
    // Deriva para sépia.
    const lum = d[i] * 0.35 + d[i + 1] * 0.5 + d[i + 2] * 0.15;
    d[i] = Math.min(255, lum * 1.12 + n);
    d[i + 1] = Math.min(255, lum * 0.97 + n);
    d[i + 2] = Math.min(255, lum * 0.76 + n);
  }
  ctx.putImageData(img, 0, 0);

  // Borda branca de fotografia impressa.
  ctx.strokeStyle = '#e8dfc8';
  ctx.lineWidth = Math.max(6, W * 0.03);
  ctx.strokeRect(0, 0, W, H);
  return canvas;
}

/* --------------------------------- registro ------------------------------ */

export function loadAllTextures(renderer) {
  const S = 256;
  const mk = (seed) => makeRNG(seed);
  const defs = {
    white: () => solid(4, 255, 255, 255),
    floorWood: () => woodFloor(S, mk(11)),
    floorTile: () => tile(S, mk(12)),
    floorConcrete: () => concrete(S, mk(13)),
    wallpaper: () => wallpaper(S, mk(21)),
    wallpaperGreen: () => { const c = wallpaper(S, mk(22)); tintCanvas(c, 0.82, 0.95, 0.8); return c; },
    plaster: () => plaster(S, mk(23)),
    brick: () => brick(S, mk(24)),
    wood: () => woodDark(S, mk(31)),
    woodLight: () => { const c = woodDark(S, mk(32)); tintCanvas(c, 1.35, 1.25, 1.1); return c; },
    fabric: () => fabric(S, mk(41)),
    fabricRed: () => fabric(S, mk(42), [88, 44, 40]),
    paper: () => paper(S, mk(51)),
    metal: () => metal(S, mk(61)),
    glass: () => glassPane(S, mk(71)),
    grass: () => grass(S, mk(81)),
    dirt: () => { const c = concrete(S, mk(82)); tintCanvas(c, 0.85, 0.72, 0.55); return c; },
    black: () => solid(4, 8, 8, 10),
    lampGlow: () => solid(4, 255, 226, 170),
  };

  for (const [name, fn] of Object.entries(defs)) {
    renderer.createTexture(name, fn(), { repeat: true, mipmap: true });
  }

  // Fotografias: sem repetição, e regeneráveis quando a realidade muda.
  for (let v = 0; v <= 2; v++) {
    const c = canvasOf(256);
    c.width = 320; c.height = 240;
    drawPhotograph(c, v);
    renderer.createTexture(`photo${v}`, c, { repeat: false, mipmap: true });
  }
}

function tintCanvas(canvas, r, g, b) {
  const ctx = canvas.getContext('2d');
  const img = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const d = img.data;
  for (let i = 0; i < d.length; i += 4) {
    d[i] = Math.min(255, d[i] * r);
    d[i + 1] = Math.min(255, d[i + 1] * g);
    d[i + 2] = Math.min(255, d[i + 2] * b);
  }
  ctx.putImageData(img, 0, 0);
  return canvas;
}
