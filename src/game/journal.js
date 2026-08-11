// journal.js — pistas descobertas, conexões feitas pelo jogador e o peso
// acumulado de cada interpretação.
//
// O peso NUNCA aparece na interface. O jogador acha que está apenas
// organizando evidências; na prática está construindo a leitura dela sobre o
// caso — e é essa leitura que decide qual final o jogo oferece.

import { CLUES, CONNECTIONS } from '../data/clues.js';
import { EVENTS } from '../core/bus.js';

export class Journal {
  constructor(bus) {
    this.bus = bus;
    this.clues = new Map();          // id -> { foundAt }
    this.deductions = [];            // conexões já realizadas
    this.lean = { sobrenatural: 0, psicologica: 0, conspiracao: 0 };
    this.readDocuments = new Set();
  }

  addClue(id) {
    if (!CLUES[id] || this.clues.has(id)) return false;
    this.clues.set(id, { foundAt: Date.now() });
    this.bus.emit(EVENTS.CLUE_FOUND, { id, clue: CLUES[id] });
    return true;
  }

  hasClue(id) { return this.clues.has(id); }

  markRead(docId) { this.readDocuments.add(docId); }
  hasRead(docId) { return this.readDocuments.has(docId); }

  list() {
    return Array.from(this.clues.keys())
      .map((id) => ({ id, ...CLUES[id] }))
      .sort((a, b) => a.n - b.n);
  }

  /** Conexão já feita entre estas duas pistas? */
  isConnected(a, b) {
    return this.deductions.some((d) => (d.a === a && d.b === b) || (d.a === b && d.b === a));
  }

  /** Procura uma conexão válida entre duas pistas. Não revela nada se falhar. */
  findConnection(a, b) {
    return CONNECTIONS.find((c) => (c.a === a && c.b === b) || (c.a === b && c.b === a));
  }

  /**
   * Tenta cruzar duas pistas.
   * @returns {{ok:boolean, deduction?:object, reason?:string}}
   */
  connect(a, b) {
    if (a === b) return { ok: false, reason: 'same' };
    if (!this.clues.has(a) || !this.clues.has(b)) return { ok: false, reason: 'missing' };
    if (this.isConnected(a, b)) return { ok: false, reason: 'already' };

    const conn = this.findConnection(a, b);
    if (!conn) return { ok: false, reason: 'none' };

    const deduction = { a: conn.a, b: conn.b, title: conn.title, text: conn.text };
    this.deductions.push(deduction);
    for (const [k, v] of Object.entries(conn.lean || {})) {
      this.lean[k] = (this.lean[k] || 0) + v;
    }
    this.bus.emit(EVENTS.CLUE_FOUND, { id: null, deduction });
    return { ok: true, deduction };
  }

  /** Quantas conexões ainda são possíveis com as pistas em mãos. */
  availableConnections() {
    let n = 0;
    for (const c of CONNECTIONS) {
      if (this.clues.has(c.a) && this.clues.has(c.b) && !this.isConnected(c.a, c.b)) n++;
    }
    return n;
  }

  /**
   * Interpretação dominante — e se ela é dominante de verdade.
   *
   * Um final só é entregue quando o jogador demonstrou uma LEITURA, não um
   * acidente. São duas exigências:
   *
   *  - engajamento: pelo menos 5 deduções. Uma conexão isolada com peso alto
   *    não pode decidir o desfecho de uma investigação inteira.
   *  - concentração: a margem precisa ser relevante em relação ao próprio
   *    placar, não só maior que um número fixo. Quem cruza tudo acumula
   *    muito em todas as teses e continua, corretamente, dividido.
   *
   * Sem os dois, sai o final incerto — que honra a divisão em vez de fingir
   * um veredito que o jogador não emitiu.
   */
  dominantInterpretation() {
    const entries = Object.entries(this.lean).sort((x, y) => y[1] - x[1]);
    const [top, topScore] = entries[0];
    const [, secondScore] = entries[1];
    const margem = topScore - secondScore;
    return {
      key: topScore === 0 ? null : top,
      score: topScore,
      margin: margem,
      decisive: this.deductions.length >= 5
        && margem >= Math.max(3, topScore * 0.25),
    };
  }

  serialize() {
    return {
      clues: Array.from(this.clues.keys()),
      deductions: this.deductions,
      lean: this.lean,
      read: Array.from(this.readDocuments),
    };
  }

  deserialize(data) {
    if (!data) return;
    this.clues.clear();
    for (const id of data.clues || []) this.clues.set(id, { foundAt: 0 });
    this.deductions = data.deductions || [];
    this.lean = data.lean || { sobrenatural: 0, psicologica: 0, conspiracao: 0 };
    this.readDocuments = new Set(data.read || []);
  }
}
