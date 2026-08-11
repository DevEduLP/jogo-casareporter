// world.js — transforma a descrição declarativa da casa numa cena renderizável
// e mantém o estado mutável do mundo: portas, luzes, cômodo atual, alterações
// do Sistema de Realidade.

import { GeometryCache } from '../core/gl/geometry.js';
import { EVENTS } from '../core/bus.js';
import { damp, makeRNG } from '../core/math.js';

export class World {
  constructor(renderer, bus, data) {
    this.renderer = renderer;
    this.bus = bus;
    this.data = data;
    this.geo = new GeometryCache(renderer);
    this.rng = makeRNG(4711);

    this.meshes = [];
    this.lights = [];
    this.lightsById = new Map();
    this.bulbsById = new Map();
    this.photosById = new Map();
    this.partsById = new Map();
    this.galleryPhotos = [];
    // Grupos: conjuntos de peças + colisores que acendem e apagam juntos.
    this.groups = new Map();
    this.doors = new Map();
    this.colliders = [];       // AABBs estáticos {min:[x,z], max:[x,z], height}
    this.platforms = data.platforms || [];
    this.currentRoom = null;
    this.time = 0;

    this._buildRooms();
    this._buildWalls();
    this._buildProps();
    this._buildDoors();
    this.colliders.push(...(data.colliders || []));

    for (const L of data.lights || []) this._registerLight(L);
  }

  /* -------------------------------- geometria --------------------------- */

  _addMesh(geoSpec, position, rotationY, material, extra = {}) {
    const [kind, ...args] = geoSpec;
    let mesh;
    if (kind === 'box') mesh = this.geo.box(args[0], args[1], args[2]);
    else if (kind === 'floor') mesh = this.geo.floor(args[0], args[1], args[2]);
    else if (kind === 'panel') mesh = this.geo.panel(args[0], args[1]);
    else if (kind === 'cylinder') mesh = this.geo.cylinder(args[0], args[1], args[2]);
    else throw new Error('Geometria desconhecida: ' + kind);

    // Raio aproximado da peça, usado pelo culling do renderer. Calculado uma
    // vez aqui porque a geometria nunca muda de tamanho depois de criada.
    let radius = 1;
    if (kind === 'box') radius = Math.hypot(args[0], args[1], args[2]) / 2;
    else if (kind === 'floor') radius = Math.hypot(args[0], args[1]) / 2;
    else if (kind === 'panel') radius = Math.hypot(args[0], args[1]) / 2;
    else if (kind === 'cylinder') radius = Math.hypot(args[0] * 2, args[1]) / 2;

    const obj = {
      mesh, position, rotationY: rotationY || 0, radius,
      material: {
        texture: material.texture || 'white',
        tint: material.tint || [1, 1, 1],
        uvScale: material.uvScale || [1, 1],
        emissive: material.emissive || 0,
        gloss: material.gloss || 0,
      },
      visible: true,
      ...extra,
    };
    this.meshes.push(obj);
    return obj;
  }

  _buildRooms() {
    for (const room of this.data.rooms) {
      // `outdoor` já tem assoalho próprio; `noFloor` é para vãos de escada,
      // onde o piso é inclinado e vem dos degraus.
      if (room.outdoor || room.noFloor) continue;
      const w = room.max[0] - room.min[0];
      const d = room.max[1] - room.min[1];
      const cx = (room.min[0] + room.max[0]) / 2;
      const cz = (room.min[1] + room.max[1]) / 2;
      const y = room.baseY !== undefined ? room.baseY : this.floorHeightAt(cx, cz);
      const h = room.height || this.data.wallHeight;
      this._addMesh(['floor', w, d, false], [cx, y + 0.001, cz], 0,
        { texture: room.floor, uvScale: [0.35, 0.35] });
      if (room.ceiling !== false) {
        this._addMesh(['floor', w, d, true], [cx, y + h, cz], 0,
          { texture: room.ceilingTex || 'plaster', uvScale: [0.3, 0.3], tint: [0.62, 0.6, 0.56] });
      }
    }
  }

  _buildWalls() {
    for (const w of this.data.walls) {
      const horizontal = Math.abs(w.x2 - w.x1) > Math.abs(w.z2 - w.z1);
      const len = horizontal ? Math.abs(w.x2 - w.x1) : Math.abs(w.z2 - w.z1);
      if (len < 0.01) continue;
      const cx = (w.x1 + w.x2) / 2;
      const cz = (w.z1 + w.z2) / 2;
      const bw = horizontal ? len : w.thick;
      const bd = horizontal ? w.thick : len;
      // baseY explícito é necessário no porão e na caixa da escada, onde o
      // piso sob a parede não é o mesmo do resto da casa.
      const y = w.baseY !== undefined ? w.baseY : this.floorHeightAt(cx, cz);
      this._addMesh(['box', bw, w.h, bd], [cx, y, cz], 0,
        { texture: w.tex, uvScale: [0.32, 0.32] });
      this.colliders.push({
        min: [cx - bw / 2, cz - bd / 2],
        max: [cx + bw / 2, cz + bd / 2],
        baseY: y,
        height: w.h,
      });
    }
  }

  _buildProps() {
    for (const part of this.data.props) {
      const obj = this._addMesh(part.geo, part.position, part.rotationY, part.material);
      if (part.visible === false) obj.visible = false;
      // Índices para que sistemas narrativos alterem peças específicas depois.
      if (part.bulbOf) this.bulbsById.set(part.bulbOf, obj);
      if (part.photoOf) this.photosById.set(part.photoOf, obj);
      if (part.galleryPhoto) this.galleryPhotos.push(obj);
      if (part.id) this.partsById.set(part.id, obj);
      if (part.group) {
        const g = this._group(part.group);
        g.parts.push(obj);
        // O estado do grupo vem das peças, não do padrão: um grupo que nasce
        // oculto precisa se reportar oculto, senão isGroupVisible mente e o
        // save grava o contrário do que está na tela.
        if (part.visible === false) g.visible = false;
      }
    }
    // Colisores marcados com grupo entram no mesmo índice, para que um objeto
    // invisível também deixe de bloquear a passagem.
    for (const col of this.data.colliders || []) {
      if (col.group) this._group(col.group).colliders.push(col);
    }
  }

  _group(id) {
    let g = this.groups.get(id);
    if (!g) { g = { parts: [], colliders: [], visible: true }; this.groups.set(id, g); }
    return g;
  }

  _buildDoors() {
    const WH = this.data.wallHeight;
    const doorH = 2.05;
    for (const d of this.data.doors) {
      const y = this.floorHeightAt(d.hinge[0], d.hinge[1]);
      const mesh = this._addMesh(['box', d.width, doorH, 0.06],
        [d.hinge[0], y, d.hinge[1]], d.closedRot,
        { texture: 'wood', uvScale: [0.6, 0.4] });
      // Batente/verga acima da porta, para o vão não ficar aberto até o teto.
      const horizontal = Math.abs(Math.cos(d.closedRot)) > 0.5;
      const cx = d.hinge[0] + Math.cos(d.closedRot) * d.width / 2;
      const cz = d.hinge[1] - Math.sin(d.closedRot) * d.width / 2;
      this._addMesh(['box', horizontal ? d.width : 0.17, WH - doorH, horizontal ? 0.17 : d.width],
        [cx, y + doorH, cz], 0, { texture: 'wallpaper', uvScale: [0.4, 0.4] });

      const state = {
        def: d,
        mesh,
        open: !!d.open,
        locked: !!d.locked,
        rot: d.open ? d.closedRot + d.openDelta : d.closedRot,
        targetRot: d.open ? d.closedRot + d.openDelta : d.closedRot,
        baseY: y,
      };
      this.doors.set(d.id, state);
      this._applyDoorTransform(state);
    }
  }

  _registerLight(L) {
    const light = {
      id: L.id,
      position: L.position,
      color: L.color,
      range: L.range,
      intensity: L.intensity,
      baseIntensity: L.intensity,
      flicker: L.flicker || 0,
      enabled: L.enabled !== false,
    };
    this.lights.push(light);
    if (L.id) this.lightsById.set(L.id, light);
    return light;
  }

  /* ---------------------------------- portas ---------------------------- */

  _applyDoorTransform(state) {
    const d = state.def;
    // A porta gira em torno da dobradiça: o centro do painel fica a meia
    // largura ao longo do eixo local X, girado pelo ângulo atual.
    const c = Math.cos(state.rot), s = Math.sin(state.rot);
    state.mesh.position[0] = d.hinge[0] + c * d.width / 2;
    state.mesh.position[1] = state.baseY;
    state.mesh.position[2] = d.hinge[1] - s * d.width / 2;
    state.mesh.rotationY = state.rot;
  }

  /** Colisor da porta quando fechada (gerado a cada consulta: são poucas). */
  doorCollider(state) {
    const d = state.def;
    const c = Math.cos(state.rot), s = Math.sin(state.rot);
    const x1 = d.hinge[0], z1 = d.hinge[1];
    const x2 = d.hinge[0] + c * d.width, z2 = d.hinge[1] - s * d.width;
    return {
      min: [Math.min(x1, x2) - 0.06, Math.min(z1, z2) - 0.06],
      max: [Math.max(x1, x2) + 0.06, Math.max(z1, z2) + 0.06],
      baseY: state.baseY,
      height: 2.05,
    };
  }

  toggleDoor(id, force) {
    const state = this.doors.get(id);
    if (!state) return false;
    const willOpen = force === undefined ? !state.open : force;
    if (willOpen === state.open) return false;
    state.open = willOpen;
    state.targetRot = state.def.closedRot + (willOpen ? state.def.openDelta : 0);
    this.bus.emit(EVENTS.DOOR_TOGGLE, { id, open: willOpen, position: state.def.hinge });
    return true;
  }

  /** Fecha/abre uma porta instantaneamente, sem som nem animação: é assim que
   *  a casa muda quando o jogador não está olhando. */
  setDoorSilent(id, open) {
    const state = this.doors.get(id);
    if (!state) return;
    state.open = open;
    state.rot = state.targetRot = state.def.closedRot + (open ? state.def.openDelta : 0);
    this._applyDoorTransform(state);
  }

  setDoorLocked(id, locked) {
    const state = this.doors.get(id);
    if (state) state.locked = locked;
  }

  /* ---------------------------------- luzes ----------------------------- */

  setLight(id, enabled) {
    const light = this.lightsById.get(id);
    if (!light) return false;
    light.enabled = enabled;
    const bulb = this.bulbsById.get(id);
    if (bulb) {
      bulb.material.emissive = enabled ? 0.85 : 0.05;
      bulb.material.tint = enabled ? [1, 0.92, 0.75] : [0.35, 0.33, 0.28];
    }
    return true;
  }

  isLightOn(id) {
    const light = this.lightsById.get(id);
    return light ? light.enabled : false;
  }

  /* ------------------------- alterações da realidade -------------------- */

  /** Troca a textura de uma fotografia (o coração do terror deste jogo). */
  setPhoto(id, textureName) {
    const obj = this.photosById.get(id);
    if (obj) obj.material.texture = textureName;
  }

  /** Repinta toda a galeria do corredor de uma vez. */
  setGalleryPhoto(textureName) {
    for (const obj of this.galleryPhotos) obj.material.texture = textureName;
  }

  setPartVisible(id, visible) {
    const obj = this.partsById.get(id);
    if (obj) obj.visible = visible;
  }

  /** Acende/apaga um objeto inteiro (malha + colisão). */
  setGroupVisible(id, visible) {
    const g = this.groups.get(id);
    if (!g) return false;
    g.visible = visible;
    for (const part of g.parts) part.visible = visible;
    for (const col of g.colliders) col.enabled = visible;
    return true;
  }

  isGroupVisible(id) {
    const g = this.groups.get(id);
    return g ? g.visible : false;
  }

  /**
   * "Move" um objeto: apaga a cópia de origem e acende a de destino. Duas
   * cópias estáticas custam menos que transformar geometria em runtime, e o
   * jogador só vê o resultado — que é exatamente o ponto.
   */
  moveObject(fromGroup, toGroup) {
    this.setGroupVisible(fromGroup, false);
    this.setGroupVisible(toGroup, true);
  }

  /* --------------------------------- espaço ----------------------------- */

  /**
   * Altura do piso: a casa fica sobre um alicerce, a varanda tem degraus e o
   * porão fica abaixo do nível do terreno. Sem plataforma correspondente, o
   * chão é o terreno externo (y = 0) — e é por isso que a busca começa em
   * `null` e não em zero: uma plataforma negativa precisa poder vencer.
   */
  floorHeightAt(x, z) {
    let best = null;
    for (const p of this.platforms) {
      if (x >= p.min[0] && x <= p.max[0] && z >= p.min[1] && z <= p.max[1]) {
        if (best === null || p.y > best) best = p.y;
      }
    }
    return best === null ? 0 : best;
  }

  roomAt(x, z) {
    for (const room of this.data.rooms) {
      if (x >= room.min[0] && x <= room.max[0] && z >= room.min[1] && z <= room.max[1]) {
        return room;
      }
    }
    return null;
  }

  surfaceAt(x, z) {
    const room = this.roomAt(x, z);
    return room ? room.surface : 'grass';
  }

  /** Todos os colisores válidos neste instante (estáticos + portas fechadas). */
  activeColliders() {
    const list = this.colliders.filter((c) => c.enabled !== false);
    for (const state of this.doors.values()) {
      if (!state.open) list.push(this.doorCollider(state));
    }
    return list;
  }

  /* ---------------------------------- update ---------------------------- */

  update(dt, playerPos) {
    this.time += dt;

    // Animação das portas.
    for (const state of this.doors.values()) {
      if (Math.abs(state.rot - state.targetRot) > 0.001) {
        state.rot = damp(state.rot, state.targetRot, 6, dt);
        if (Math.abs(state.rot - state.targetRot) <= 0.001) state.rot = state.targetRot;
        this._applyDoorTransform(state);
      }
    }

    // Cintilação: lâmpadas velhas de uma casa que passou décadas sem uso.
    for (const light of this.lights) {
      if (!light.enabled || light.flicker <= 0) continue;
      const t = this.time * 7.3 + light.position[0] * 3.1 + light.position[2] * 1.7;
      const n = Math.sin(t) * Math.sin(t * 2.13) * Math.sin(t * 0.41);
      light.intensity = light.baseIntensity * (1 - light.flicker * (0.5 + n * 0.5));
    }

    // Troca de cômodo: sinal usado por narrativa, áudio e eventos.
    if (playerPos) {
      const room = this.roomAt(playerPos[0], playerPos[2]);
      const id = room ? room.id : null;
      const prevId = this.currentRoom ? this.currentRoom.id : null;
      if (id !== prevId) {
        if (prevId) this.bus.emit(EVENTS.ROOM_EXIT, { id: prevId });
        this.currentRoom = room;
        if (id) this.bus.emit(EVENTS.ROOM_ENTER, { id, room });
      }
    }
  }

  /* -------------------------------- persistência ------------------------ */

  serialize() {
    const doors = {};
    for (const [id, s] of this.doors) doors[id] = { open: s.open, locked: s.locked };
    const lights = {};
    for (const [id, l] of this.lightsById) lights[id] = l.enabled;
    const photos = {};
    for (const [id, obj] of this.photosById) photos[id] = obj.material.texture;
    const groups = {};
    for (const [id, g] of this.groups) groups[id] = g.visible;
    return { doors, lights, photos, groups };
  }

  deserialize(state) {
    if (!state) return;
    for (const [id, s] of Object.entries(state.doors || {})) {
      this.setDoorSilent(id, s.open);
      this.setDoorLocked(id, s.locked);
    }
    for (const [id, on] of Object.entries(state.lights || {})) this.setLight(id, on);
    for (const [id, tex] of Object.entries(state.photos || {})) this.setPhoto(id, tex);
    for (const [id, vis] of Object.entries(state.groups || {})) this.setGroupVisible(id, vis);
  }
}
