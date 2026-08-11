// reality.js — o Sistema de Realidade.
//
// Um único número (0 a 5) governa o quanto a casa deixou de ser confiável.
// Ele modula pós-processamento, áudio, lanterna e o conteúdo dos documentos.
//
// A regra de ouro das mutações: NADA muda enquanto o jogador está olhando.
// Uma porta que se fecha na cara do jogador é um efeito. Uma porta que estava
// aberta e está fechada quando ele volta é uma dúvida. Só a segunda interessa.

import { EVENTS } from '../core/bus.js';
import { clamp, damp } from '../core/math.js';

export const REALITY = {
  NORMAL: 0,        // a casa é uma casa
  PRIMEIRAS: 1,     // pequenos deslocamentos, sons
  OBJETOS: 2,       // objetos trocam de lugar, portas mudam de estado
  FOTOGRAFIAS: 3,   // imagens e textos se alteram
  ARQUITETURA: 4,   // o espaço começa a discordar de si mesmo
  DISSOLUCAO: 5,    // a casa deixa de fingir
};

export class RealitySystem {
  constructor(bus, world, renderer, audio, player) {
    this.bus = bus;
    this.world = world;
    this.renderer = renderer;
    this.audio = audio;
    this.player = player;

    this.level = 0;
    this.targetDistort = 0;
    this.currentDistort = 0;
    this.pulse = 0;

    // Mutações agendadas, esperando o jogador virar as costas.
    this.pending = [];
    this.applied = new Set();

    this.bus.on(EVENTS.ROOM_EXIT, ({ id }) => this._flush(id));
  }

  setLevel(level, silent = false) {
    const next = clamp(Math.round(level), 0, 5);
    if (next === this.level) return;
    const prev = this.level;
    this.level = next;

    // A degradação é assimétrica de propósito: os primeiros níveis quase não
    // se veem, os últimos são inegáveis.
    const distortByLevel = [0, 0.06, 0.14, 0.28, 0.52, 1.0];
    this.targetDistort = distortByLevel[next];

    this.audio.setRealityLevel(next);
    this.player.flashlight.health = next >= 3 ? 1 - (next - 2) * 0.22 : 1;

    // A paleta esfria e perde saturação conforme a casa se desfaz.
    const k = next / 5;
    this.renderer.post.grade = [1.0 - k * 0.10, 0.99 - k * 0.05, 1.02 + k * 0.06];
    this.renderer.post.vignette = 0.85 + k * 0.12;
    this.renderer.post.grain = 0.075 + k * 0.055;

    if (!silent) this.bus.emit(EVENTS.REALITY_CHANGE, { level: next, previous: prev });
  }

  raiseTo(level) {
    if (level > this.level) this.setLevel(level);
  }

  /**
   * Agenda uma alteração no mundo. Só é aplicada quando o jogador estiver
   * fora de `room` — ou imediatamente, se ele já estiver fora.
   *
   * @param {string} id     identificador único (evita repetição)
   * @param {string} room   cômodo que precisa estar vazio ('*' = qualquer hora)
   * @param {Function} fn   a alteração em si
   */
  mutate(id, room, fn) {
    if (this.applied.has(id)) return;
    const current = this.world.currentRoom ? this.world.currentRoom.id : null;
    if (room === '*' || current !== room) {
      this.applied.add(id);
      fn();
      return;
    }
    if (!this.pending.some((p) => p.id === id)) {
      this.pending.push({ id, room, fn });
    }
  }

  _flush(roomId) {
    const ready = this.pending.filter((p) => p.room === roomId);
    if (!ready.length) return;
    this.pending = this.pending.filter((p) => p.room !== roomId);
    for (const p of ready) {
      this.applied.add(p.id);
      p.fn();
    }
  }

  /** Tensão momentânea: aperta a imagem e o áudio por alguns segundos. */
  spike(amount = 1, duration = 4) {
    this.pulse = Math.max(this.pulse, amount);
    this._spikeUntil = performance.now() + duration * 1000;
  }

  update(dt) {
    this.currentDistort = damp(this.currentDistort, this.targetDistort, 1.2, dt);
    this.renderer.post.distort = this.currentDistort;

    // O pulso decai sozinho; o batimento acompanha.
    if (this._spikeUntil && performance.now() > this._spikeUntil) this._spikeUntil = 0;
    const wantPulse = this._spikeUntil ? 1 : 0;
    this.pulse = damp(this.pulse, wantPulse, 1.5, dt);
    this.renderer.post.pulse = this.pulse * (0.5 + 0.5 * Math.sin(performance.now() * 0.006));
    this.player.tension = damp(this.player.tension, this.pulse * 0.7 + this.level * 0.12, 1, dt);

    this._beatTimer = (this._beatTimer || 0) - dt;
    if (this.pulse > 0.35 && this._beatTimer <= 0) {
      this.audio.heartbeat(this.pulse * 0.8);
      this._beatTimer = 1.35 - this.pulse * 0.45;
    }
  }

  serialize() {
    return { level: this.level, applied: Array.from(this.applied) };
  }

  deserialize(data) {
    if (!data) return;
    this.applied = new Set(data.applied || []);
    this.setLevel(data.level || 0, true);
    this.currentDistort = this.targetDistort;
  }
}
