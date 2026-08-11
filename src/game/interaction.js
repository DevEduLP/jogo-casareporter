// interaction.js — mira por raycast, prompt contextual e despacho de ações.
//
// Toda ação é um objeto de dados ({type:'read', doc:'...'}). Isso mantém o
// nível serializável e faz com que adicionar conteúdo novo nunca exija tocar
// no código de interação.

import { forwardFromAngles, rayAABB } from '../core/math.js';
import { EVENTS } from '../core/bus.js';
import { ITEMS } from '../data/clues.js';

const REACH = 2.6;

export class Interaction {
  constructor(game) {
    this.game = game;
    this.world = game.world;
    this.bus = game.bus;
    this.target = null;
    this._ray = new Float32Array(3);
    this._origin = new Float32Array(3);

    // Interativos vindos dos dados, indexados por id.
    this.items = new Map();
    for (const it of this.world.data.interactables) {
      this.items.set(it.id, { ...it, used: 0 });
    }
  }

  get(id) { return this.items.get(id); }

  setHidden(id, hidden) {
    const it = this.items.get(id);
    if (it) it.hidden = hidden;
  }

  /** Substitui a ação de um interativo (usado pelo Sistema de Realidade). */
  setAction(id, action) {
    const it = this.items.get(id);
    if (it) it.action = action;
  }

  update(dt, player) {
    this._origin[0] = player.position[0];
    this._origin[1] = player.position[1];
    this._origin[2] = player.position[2];
    forwardFromAngles(this._ray, player.yaw, player.pitch);

    let best = null;
    let bestDist = REACH;

    // Objetos do cenário.
    for (const it of this.items.values()) {
      if (it.hidden) continue;
      const half = [it.size[0] / 2, it.size[1] / 2, it.size[2] / 2];
      const min = [it.pos[0] - half[0], it.pos[1] - half[1], it.pos[2] - half[2]];
      const max = [it.pos[0] + half[0], it.pos[1] + half[1], it.pos[2] + half[2]];
      const t = rayAABB(this._origin, this._ray, min, max, bestDist);
      if (t >= 0 && t < bestDist) { bestDist = t; best = { kind: 'item', ref: it }; }
    }

    // Portas.
    for (const [id, state] of this.world.doors) {
      const c = this.world.doorCollider(state);
      const min = [c.min[0], state.baseY, c.min[1]];
      const max = [c.max[0], state.baseY + 2.05, c.max[1]];
      const t = rayAABB(this._origin, this._ray, min, max, bestDist);
      if (t >= 0 && t < bestDist) { bestDist = t; best = { kind: 'door', ref: state, id }; }
    }

    this.target = best;
    this._emitPrompt();
  }

  _emitPrompt() {
    if (!this.target) {
      this.bus.emit('prompt', null);
      return;
    }
    if (this.target.kind === 'door') {
      const s = this.target.ref;
      const label = s.def.label;
      if (s.locked) {
        this.bus.emit('prompt', { verb: 'Trancada', label, locked: true });
      } else {
        this.bus.emit('prompt', { verb: s.open ? 'Fechar' : 'Abrir', label });
      }
      return;
    }
    const it = this.target.ref;
    const blocked = it.requires && !this.game.inventory.has(it.requires.item);
    this.bus.emit('prompt', {
      verb: blocked ? 'Trancada' : (it.verb || 'Examinar'),
      label: it.label,
      locked: blocked,
    });
  }

  /** Chamado quando o jogador aperta a tecla de interação. */
  activate() {
    if (!this.target) return;
    if (this.target.kind === 'door') return this._useDoor(this.target.id, this.target.ref);
    return this._useItem(this.target.ref);
  }

  _useDoor(id, state) {
    const game = this.game;
    if (state.locked) {
      const key = state.def.key;
      if (key && game.inventory.has(key)) {
        this.world.setDoorLocked(id, false);
        game.audio.click(0.7, 0.3);
        game.narrative.say('A fechadura cede.');
        this.world.toggleDoor(id, true);
        game.audio.door(true, false, 1.5);
        game.bus.emit(EVENTS.SCRIPT, { id: 'porta_destrancada', door: id });
        return;
      }
      game.audio.click(0.5, 0.12);
      game.bus.emit(EVENTS.DOOR_LOCKED, { id });
      if (state.def.lockedText) game.narrative.interrupt(state.def.lockedText);
      return;
    }
    const opening = !state.open;
    this.world.toggleDoor(id);
    game.audio.door(opening, false, 1.4);
  }

  _useItem(it) {
    const game = this.game;

    if (it.requires && !game.inventory.has(it.requires.item)) {
      game.audio.click(0.5, 0.12);
      if (it.lockedText) game.narrative.interrupt(it.lockedText);
      return;
    }

    const action = it.action || {};
    it.used++;

    switch (action.type) {
      case 'examine':
        game.audio.paper();
        game.narrative.interrupt(action.text);
        break;

      case 'read':
        game.openDocument(action.doc, action.clue);
        break;

      case 'photo':
        game.openDocument(action.doc, action.clue, { photo: action.photo });
        break;

      case 'tape':
        game.playTape(action.tape);
        break;

      case 'pickup': {
        const def = ITEMS[action.item];
        game.inventory.add(action.item);
        game.audio.click(1.1, 0.2);
        if (action.clue) game.journal.addClue(action.clue);
        // Um item pego não pode ser pego de novo.
        it.hidden = true;
        if (def) game.narrative.interrupt(def.desc);
        break;
      }

      case 'switch': {
        if (!game.narrative.hasFlag('energia')) {
          game.audio.click(0.9, 0.14);
          game.narrative.interrupt('O interruptor faz o clique. Nada acontece. A casa está sem energia.');
          break;
        }
        const on = !this.world.isLightOn(action.light);
        this.world.setLight(action.light, on);
        game.audio.click(0.9, 0.2);
        break;
      }

      case 'script':
        game.runScript(action.id, it);
        break;

      default:
        game.narrative.interrupt('Nada aqui.');
    }
  }
}
