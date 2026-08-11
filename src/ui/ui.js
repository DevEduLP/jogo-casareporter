// ui.js — toda a interface em DOM/CSS sobre o canvas.
//
// Documentos e diário são texto: renderizá-los em HTML dá tipografia real,
// seleção, rolagem e acessibilidade de graça — coisas que custariam caro no
// canvas e não acrescentariam nada à experiência.

import { EVENTS } from '../core/bus.js';
import { DOCUMENTS, getDocumentPages } from '../data/documents.js';
import { CLUES } from '../data/clues.js';
import { drawPhotograph } from '../core/gl/textures.js';

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

export class UI {
  constructor() {
    // O barramento chega depois, via attachBus: a UI é construída antes do
    // Game (que é quem cria o bus) para poder relatar falhas de inicialização.
    this.bus = null;
    this.game = null;

    this.el = {
      hud: $('#hud'),
      prompt: $('#prompt'),
      promptVerb: $('#prompt .verb'),
      promptLabel: $('#prompt .label'),
      objective: $('#objective'),
      objectiveText: $('#objective .objective-text'),
      subtitle: $('#subtitle'),
      notifications: $('#notifications'),
      hints: $('#hud-hints'),
      clickHint: $('#click-hint'),

      card: $('#chapter-card'),
      cardN: $('#chapter-card .chapter-n'),
      cardTitle: $('#chapter-card .chapter-title'),
      cardEpigraph: $('#chapter-card .chapter-epigraph'),

      doc: $('#overlay-doc'),
      docTitle: $('.doc-title'),
      docMeta: $('.doc-meta'),
      docBody: $('.doc-body'),
      docPhoto: $('.doc-photo'),
      docPhotoCanvas: $('.doc-photo canvas'),
      docLaura: $('.doc-laura'),
      docLauraText: $('.laura-text'),
      docPrev: $('.doc-prev'),
      docNext: $('.doc-next'),
      docPages: $('.doc-pages'),

      journal: $('#overlay-journal'),
      clueList: $('.clue-list'),
      deductionList: $('.deduction-list'),
      itemList: $('.item-list'),
      slots: $$('.slot'),
      connectBtn: $('.connect-btn'),
      connectResult: $('.connect-result'),

      pause: $('#overlay-pause'),
      pauseChapter: $('.pause-chapter'),
      pauseNote: $('.pause-note'),

      title: $('#screen-title'),
      btnStart: $('#btn-start'),
      btnContinue: $('#btn-continue'),

      ending: $('#screen-ending'),
      endingTitle: $('.ending-title'),
      endingText: $('.ending-text'),
      endingSplinter: $('.ending-splinter'),
      endingStats: $('.ending-stats'),
      btnEndingClose: $('#btn-ending-close'),
    };

    this.docState = null;
    this.selection = [];
    this.openPanel = null;   // 'doc' | 'journal' | 'pause' | null
    this._notifId = 0;
    this._hintTimer = null;

    this._bindEvents();
  }

  get isOpen() { return this.openPanel !== null; }

  /* ------------------------------- ligações ----------------------------- */

  attachBus(bus) {
    this.bus = bus;

    bus.on('prompt', (p) => this.setPrompt(p));
    bus.on(EVENTS.SUBTITLE, ({ text }) => this.setSubtitle(text));
    bus.on(EVENTS.OBJECTIVE_SET, ({ text }) => this.setObjective(text));
    bus.on(EVENTS.CHAPTER_START, ({ chapter }) => this.showChapterCard(chapter));

    bus.on(EVENTS.NOTIFY, ({ text, quiet }) => this.notify(text, quiet));
    bus.on(EVENTS.ITEM_ADDED, ({ def }) => this.notify(`<b>Item</b> ${def.name}`));
    bus.on(EVENTS.CLUE_FOUND, ({ id, clue, deduction }) => {
      if (deduction) this.notify(`<b>Dedução</b> ${deduction.title}`);
      else if (clue) this.notify(`<b>Pista #${String(clue.n).padStart(2, '0')}</b> ${clue.title}`);
    });
  }

  _bindEvents() {
    this.el.docPrev.addEventListener('click', () => this.turnPage(-1));
    this.el.docNext.addEventListener('click', () => this.turnPage(1));

    $$('.journal-tabs .tab').forEach((tab) => {
      tab.addEventListener('click', () => this.showJournalTab(tab.dataset.tab));
    });

    this.el.connectBtn.addEventListener('click', () => this.tryConnect());

    $$('.pause-buttons button').forEach((btn) => {
      btn.addEventListener('click', () => this._pauseAction(btn.dataset.act));
    });

    $$('.settings [data-set]').forEach((input) => {
      input.addEventListener('input', () => this._applySetting(input));
    });

    // Com um documento aberto o jogador não se move, então as setas ficam
    // livres para virar página — o gesto que qualquer pessoa tenta primeiro.
    window.addEventListener('keydown', (e) => {
      if (this.openPanel !== 'doc') return;
      if (e.code === 'ArrowLeft') { e.preventDefault(); this.turnPage(-1); }
      if (e.code === 'ArrowRight') { e.preventDefault(); this.turnPage(1); }
    });

    // Fechar clicando fora da folha.
    for (const [overlay, closer] of [
      [this.el.doc, () => this.closeDocument()],
      [this.el.journal, () => this.closeJournal()],
    ]) {
      overlay.addEventListener('mousedown', (e) => { if (e.target === overlay) closer(); });
    }
  }

  /* --------------------------------- HUD -------------------------------- */

  setPrompt(p) {
    const el = this.el.prompt;
    if (!p || this.isOpen) {
      el.classList.add('hidden');
      this.el.hud.classList.remove('targeting', 'locked-target');
      return;
    }
    el.classList.remove('hidden');
    el.classList.toggle('locked', !!p.locked);
    this.el.hud.classList.add('targeting');
    this.el.hud.classList.toggle('locked-target', !!p.locked);
    this.el.promptVerb.textContent = p.verb;
    this.el.promptLabel.textContent = p.label || '';
  }

  setSubtitle(text) {
    const el = this.el.subtitle;
    if (!text) { el.classList.remove('show'); return; }
    el.textContent = text;
    el.classList.add('show');
  }

  setObjective(text) {
    this.el.objectiveText.textContent = text;
    this.el.objective.classList.add('show');
    clearTimeout(this._objTimer);
    // O objetivo aparece, é lido, e sai de cena. Uma HUD permanente mataria a
    // sensação de estar sozinha numa casa.
    this._objTimer = setTimeout(() => this.el.objective.classList.remove('show'), 9000);
  }

  peekObjective() {
    this.el.objective.classList.add('show');
    clearTimeout(this._objTimer);
    this._objTimer = setTimeout(() => this.el.objective.classList.remove('show'), 6000);
  }

  notify(html, quiet = false) {
    const div = document.createElement('div');
    div.className = 'notif' + (quiet ? ' quiet' : '');
    div.innerHTML = html;
    this.el.notifications.appendChild(div);
    setTimeout(() => {
      div.classList.add('out');
      setTimeout(() => div.remove(), 800);
    }, quiet ? 1800 : 4200);
  }

  setClickHint(show) {
    this.el.clickHint.classList.toggle('hidden', !show);
  }

  showHUD(show) {
    if (!show) this.setClickHint(false);
    this.el.hud.classList.toggle('hidden', !show);
    if (show) {
      this.el.hints.classList.remove('fade');
      clearTimeout(this._hintTimer);
      // As dicas de controle somem sozinhas depois do primeiro minuto.
      this._hintTimer = setTimeout(() => this.el.hints.classList.add('fade'), 42000);
    }
  }

  /* ---------------------------- cartão de capítulo ---------------------- */

  showChapterCard(chapter) {
    const el = this.el.card;
    this.el.cardN.textContent = `Capítulo ${chapter.n}`;
    this.el.cardTitle.textContent = chapter.title;
    this.el.cardEpigraph.textContent = chapter.epigraph || '';
    el.classList.remove('hidden', 'fading');
    // Reinicia a animação de saída.
    void el.offsetWidth;
    setTimeout(() => {
      el.classList.add('fading');
      setTimeout(() => el.classList.add('hidden'), 2200);
    }, 2600);
  }

  /* ------------------------------ documentos ---------------------------- */

  openDocument(docId, realityLevel, opts = {}) {
    const doc = DOCUMENTS[docId];
    if (!doc) { console.warn('Documento inexistente:', docId); return false; }

    const pages = getDocumentPages(doc, realityLevel);
    this.docState = { doc, pages, page: 0, photoVariant: opts.photoVariant || 0 };

    this.el.docTitle.textContent = doc.title;
    this.el.docMeta.textContent = doc.meta || '';

    if (doc.type === 'photo') {
      this.el.docPhoto.classList.remove('hidden');
      drawPhotograph(this.el.docPhotoCanvas, this.docState.photoVariant, 1998);
    } else {
      this.el.docPhoto.classList.add('hidden');
    }

    this._renderPage();
    this.el.doc.classList.remove('hidden');
    this.openPanel = 'doc';
    this.setPrompt(null);
    return true;
  }

  _renderPage() {
    const s = this.docState;
    if (!s) return;
    this.el.docBody.textContent = s.pages[s.page];
    this.el.docPages.textContent = s.pages.length > 1
      ? `${s.page + 1} / ${s.pages.length}` : '';
    this.el.docPrev.disabled = s.page === 0;
    this.el.docNext.disabled = s.page >= s.pages.length - 1;

    // A nota de Laura só aparece na última página: é a reação dela ao todo.
    const last = s.page === s.pages.length - 1;
    if (last && s.doc.lauraNote) {
      this.el.docLaura.classList.remove('hidden');
      this.el.docLauraText.textContent = s.doc.lauraNote;
    } else {
      this.el.docLaura.classList.add('hidden');
    }
    this.el.docBody.parentElement.scrollTop = 0;
  }

  turnPage(delta) {
    const s = this.docState;
    if (!s) return;
    const next = s.page + delta;
    if (next < 0 || next >= s.pages.length) return;
    s.page = next;
    this._renderPage();
    if (this.game) this.game.audio.paper();
  }

  closeDocument() {
    if (this.openPanel !== 'doc') return;
    this.el.doc.classList.add('hidden');
    const doc = this.docState ? this.docState.doc : null;
    this.docState = null;
    this.openPanel = null;
    if (doc && this.game) this.game.onDocumentClosed(doc.id);
  }

  /* -------------------------------- diário ------------------------------ */

  openJournal(game) {
    this.selection = [];
    this._renderClues(game);
    this._renderDeductions(game);
    this._renderItems(game);
    this._renderSlots();
    this.el.connectResult.textContent = '';
    this.el.connectResult.className = 'connect-result';
    this.el.journal.classList.remove('hidden');
    this.openPanel = 'journal';
    this.setPrompt(null);
  }

  closeJournal() {
    if (this.openPanel !== 'journal') return;
    this.el.journal.classList.add('hidden');
    this.openPanel = null;
    if (this.game) this.game.onOverlayClosed();
  }

  showJournalTab(name) {
    $$('.journal-tabs .tab').forEach((t) => t.classList.toggle('active', t.dataset.tab === name));
    $$('.journal-panel').forEach((p) => p.classList.toggle('hidden', p.dataset.panel !== name));
  }

  _renderClues(game) {
    const clues = game.journal.list();
    const list = this.el.clueList;
    list.innerHTML = '';
    if (!clues.length) {
      list.innerHTML = '<div class="empty-note">Nenhuma pista ainda. Examine tudo.</div>';
      return;
    }
    for (const clue of clues) {
      const div = document.createElement('div');
      div.className = 'clue';
      div.dataset.id = clue.id;
      div.innerHTML =
        `<div class="clue-n">Pista #${String(clue.n).padStart(2, '0')}</div>` +
        `<div class="clue-title"></div><div class="clue-text"></div>`;
      $('.clue-title', div).textContent = clue.title;
      $('.clue-text', div).textContent = clue.text;
      div.addEventListener('click', () => this._toggleClue(clue.id, game));
      list.appendChild(div);
    }
  }

  _toggleClue(id, game) {
    const i = this.selection.indexOf(id);
    if (i >= 0) this.selection.splice(i, 1);
    else {
      if (this.selection.length >= 2) this.selection.shift();
      this.selection.push(id);
    }
    $$('.clue', this.el.clueList).forEach((el) => {
      el.classList.toggle('selected', this.selection.includes(el.dataset.id));
    });
    this._renderSlots();
    this.el.connectResult.textContent = '';
    this.el.connectResult.className = 'connect-result';
  }

  _renderSlots() {
    this.el.slots.forEach((slot, i) => {
      const id = this.selection[i];
      slot.textContent = id ? CLUES[id].title : '—';
      slot.classList.toggle('filled', !!id);
    });
    this.el.connectBtn.disabled = this.selection.length !== 2;
  }

  tryConnect() {
    const game = this.game;
    if (!game || this.selection.length !== 2) return;
    const [a, b] = this.selection;
    const res = game.journal.connect(a, b);
    const out = this.el.connectResult;

    if (res.ok) {
      out.className = 'connect-result ok';
      out.textContent = `${res.deduction.title} — anotado nas deduções.`;
      game.audio.click(1.3, 0.22);
      this.selection = [];
      this._renderClues(game);
      this._renderSlots();
      this._renderDeductions(game);
      game.onDeduction(res.deduction);
    } else {
      out.className = 'connect-result fail';
      // A recusa nunca diz "errado": diz que Laura não conseguiu ver a ligação.
      // O jogador continua livre para achar que existe uma.
      out.textContent = {
        already: 'Você já cruzou essas duas.',
        missing: 'Você não tem as duas pistas em mãos.',
        same: 'É a mesma pista.',
        none: 'Você olha as duas por um tempo. Não sai nada. Talvez não haja nada.',
      }[res.reason] || 'Nada.';
      game.audio.click(0.6, 0.1);
    }
  }

  _renderDeductions(game) {
    const list = this.el.deductionList;
    list.innerHTML = '';
    if (!game.journal.deductions.length) {
      list.innerHTML = '<div class="empty-note">Nenhuma dedução. Cruze pistas na primeira aba.</div>';
      return;
    }
    for (const d of game.journal.deductions) {
      const div = document.createElement('div');
      div.className = 'deduction';
      div.innerHTML = '<h4></h4><p></p>';
      $('h4', div).textContent = d.title;
      $('p', div).textContent = d.text;
      list.appendChild(div);
    }
  }

  _renderItems(game) {
    const list = this.el.itemList;
    list.innerHTML = '';
    const items = game.inventory.list();
    if (!items.length) {
      list.innerHTML = '<div class="empty-note">Bolsos vazios.</div>';
      return;
    }
    for (const item of items) {
      const div = document.createElement('div');
      div.className = 'inv-item';
      div.innerHTML = `<div class="inv-icon"></div><div><div class="inv-name"></div><div class="inv-desc"></div></div>`;
      $('.inv-icon', div).textContent = item.icon || '•';
      $('.inv-name', div).textContent = item.name + (item.count > 1 ? ` ×${item.count}` : '');
      $('.inv-desc', div).textContent = item.desc || '';
      if (item.readable) {
        div.style.cursor = 'pointer';
        div.title = 'Ler';
        div.addEventListener('click', () => {
          this.closeJournal();
          game.openDocument(item.readable);
        });
      }
      list.appendChild(div);
    }
  }

  /* --------------------------------- pausa ------------------------------ */

  openPause(game) {
    const ch = game.narrative.chapter;
    this.el.pauseChapter.textContent = ch ? `Capítulo ${ch.n} — ${ch.title}` : '';
    this._syncSettings(game);
    this.el.pause.classList.remove('hidden');
    this.openPanel = 'pause';
    this.setPrompt(null);
  }

  closePause() {
    if (this.openPanel !== 'pause') return;
    this.el.pause.classList.add('hidden');
    this.el.pauseNote.textContent = '';
    this.openPanel = null;
    if (this.game) this.game.onOverlayClosed();
  }

  _syncSettings(game) {
    const set = (name, value) => {
      const el = $(`.settings [data-set="${name}"]`);
      if (!el) return;
      if (el.type === 'checkbox') el.checked = !!value;
      else el.value = value;
    };
    set('master', game.audio.volumes.master);
    set('ambient', game.audio.volumes.ambient);
    set('sens', game.input.sensitivity * 1000);
    set('grain', game.renderer.post.grain);
    set('invert', game.input.invertY);
  }

  _applySetting(input) {
    const game = this.game;
    if (!game) return;
    const name = input.dataset.set;
    const value = input.type === 'checkbox' ? input.checked : parseFloat(input.value);
    switch (name) {
      case 'master': game.audio.setVolume('master', value); break;
      case 'ambient': game.audio.setVolume('ambient', value); break;
      case 'sens': game.input.sensitivity = value / 1000; break;
      case 'grain': game.renderer.post.grain = value; break;
      case 'invert': game.input.invertY = value; break;
    }
    game.saveSettings();
  }

  _pauseAction(act) {
    const game = this.game;
    if (!game) return;
    switch (act) {
      case 'resume': game.resume(); break;
      case 'save':
        this.el.pauseNote.textContent = game.save() ? 'Progresso salvo.' : 'Não foi possível salvar.';
        break;
      case 'load':
        if (game.loadSave()) { this.closePause(); game.resume(); }
        else this.el.pauseNote.textContent = 'Nenhum save encontrado.';
        break;
      case 'quit': game.returnToTitle(); break;
    }
  }

  /* --------------------------------- final ------------------------------ */

  showEnding(ending, stats) {
    this.el.endingTitle.textContent = ending.title;
    this.el.endingText.innerHTML = '';
    for (const para of ending.text) {
      const p = document.createElement('p');
      p.textContent = para;
      this.el.endingText.appendChild(p);
    }
    this.el.endingSplinter.textContent = ending.splinter;
    this.el.endingStats.innerHTML = stats;
    this.el.ending.classList.remove('hidden');
    this.showHUD(false);
  }

  /* ------------------------------- utilitário --------------------------- */

  closeTopPanel() {
    if (this.openPanel === 'doc') { this.closeDocument(); return true; }
    if (this.openPanel === 'journal') { this.closeJournal(); return true; }
    if (this.openPanel === 'pause') { this.closePause(); return true; }
    return false;
  }
}
