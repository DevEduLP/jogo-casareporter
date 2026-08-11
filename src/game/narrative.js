// narrative.js — flags, capítulos, objetivos e a voz interna de Laura.

import { CHAPTERS } from '../data/chapters.js';
import { EVENTS } from '../core/bus.js';

export class Narrative {
  constructor(bus, journal, reality) {
    this.bus = bus;
    this.journal = journal;
    this.reality = reality;
    this.flags = new Set();
    this.chapterIndex = -1;
    this.objective = '';

    // Fila de monólogo: Laura não fala por cima de si mesma, e uma linha nova
    // nunca atropela a anterior.
    this.queue = [];
    this.currentLine = null;
    this.lineTimer = 0;

    this.bus.on(EVENTS.CLUE_FOUND, () => this._checkAdvance());
    this.bus.on(EVENTS.FLAG_SET, () => this._checkAdvance());
  }

  get chapter() { return CHAPTERS[this.chapterIndex] || null; }

  setFlag(flag, value = true) {
    if (value) {
      if (this.flags.has(flag)) return false;
      this.flags.add(flag);
    } else {
      this.flags.delete(flag);
    }
    this.bus.emit(EVENTS.FLAG_SET, { flag, value });
    return true;
  }

  hasFlag(flag) { return this.flags.has(flag); }

  startChapter(index) {
    if (index < 0 || index >= CHAPTERS.length) return;
    this.chapterIndex = index;
    const ch = CHAPTERS[index];
    this.objective = ch.objective;
    if (ch.reality !== undefined) this.reality.raiseTo(ch.reality);
    this.bus.emit(EVENTS.CHAPTER_START, { chapter: ch });
    this.bus.emit(EVENTS.OBJECTIVE_SET, { text: ch.objective });
    if (ch.onStart && ch.onStart.monologue) {
      // Espera o cartão do capítulo sair da tela antes de Laura começar.
      this.say(ch.onStart.monologue, 3.2);
    }
    // A condição do capítulo novo pode já estar satisfeita (o jogador vasculhou
    // demais antes da hora). Sem esta checagem, a progressão ficaria travada
    // esperando um evento que nunca mais vem.
    this._checkAdvance();
  }

  advance() {
    if (this.chapterIndex + 1 < CHAPTERS.length) this.startChapter(this.chapterIndex + 1);
  }

  _checkAdvance() {
    const ch = this.chapter;
    if (!ch || !ch.advance) return;
    const cond = ch.advance;
    let ok = true;
    if (cond.flag && !this.flags.has(cond.flag)) ok = false;
    if (cond.clues && this.journal.clues.size < cond.clues) ok = false;
    if (cond.doc && !this.journal.hasRead(cond.doc)) ok = false;
    if (ok) {
      // Um tick de folga: o jogador precisa ver o efeito da própria ação antes
      // de o capítulo virar por cima dela.
      setTimeout(() => {
        if (this.chapter === ch) this.advance();
      }, 1400);
    }
  }

  /**
   * Enfileira falas internas de Laura. `delay` atrasa apenas a PRIMEIRA linha
   * — as seguintes emendam, senão cada pausa se somaria e o monólogo se
   * arrastaria por meio minuto.
   */
  say(lines, delay = 0) {
    const arr = Array.isArray(lines) ? lines : [lines];
    arr.forEach((text, i) => this.queue.push({ text, delay: i === 0 ? delay : 0 }));
  }

  /** Fala imediata, descartando o que estiver na fila (para reações fortes). */
  interrupt(line) {
    this.queue.length = 0;
    this.currentLine = null;
    this.lineTimer = 0;
    this.queue.push({ text: line, delay: 0 });
  }

  update(dt) {
    if (this.currentLine) {
      this.lineTimer -= dt;
      if (this.lineTimer <= 0) {
        this.currentLine = null;
        this.bus.emit(EVENTS.SUBTITLE, { text: null });
      }
      return;
    }
    if (!this.queue.length) return;

    const next = this.queue[0];
    if (next.delay > 0) {
      next.delay -= dt;
      return;
    }
    this.queue.shift();
    this.currentLine = next;
    // Tempo de leitura proporcional ao texto, com um piso confortável.
    this.lineTimer = Math.max(2.6, next.text.length * 0.048);
    this.bus.emit(EVENTS.SUBTITLE, { text: next.text });
  }

  serialize() {
    return {
      flags: Array.from(this.flags),
      chapterIndex: this.chapterIndex,
      objective: this.objective,
    };
  }

  deserialize(data) {
    if (!data) return;
    this.flags = new Set(data.flags || []);
    this.chapterIndex = data.chapterIndex === undefined ? 0 : data.chapterIndex;
    this.objective = data.objective || '';
    const ch = this.chapter;
    if (ch) {
      this.bus.emit(EVENTS.OBJECTIVE_SET, { text: this.objective });
    }
  }
}
