// game.js — orquestra todos os sistemas e conduz o loop.
// É o único módulo que conhece todos os outros; qualquer sistema individual
// pode ser lido e portado isoladamente.

import { Renderer } from '../core/gl/renderer.js';
import { loadAllTextures } from '../core/gl/textures.js';
import { Input } from '../core/input.js';
import { AudioEngine } from '../core/audio.js';
import { EventBus, EVENTS } from '../core/bus.js';
import { SaveSystem } from '../core/save.js';
import { damp, v3 } from '../core/math.js';

import { buildHouse } from '../data/house.js';
import { DOCUMENTS } from '../data/documents.js';
import { ENDINGS } from '../data/chapters.js';

import { World } from './world.js';
import { Player } from './player.js';
import { Interaction } from './interaction.js';
import { Inventory } from './inventory.js';
import { Journal } from './journal.js';
import { RealitySystem } from './reality.js';
import { Narrative } from './narrative.js';
import { runScript, wireStoryEvents, AmbientEvents } from './scripts.js';

export class Game {
  constructor(canvas, ui) {
    this.canvas = canvas;
    this.ui = ui;
    ui.game = this;

    this.bus = new EventBus();
    ui.attachBus(this.bus);
    this.renderer = new Renderer(canvas);
    loadAllTextures(this.renderer);

    this.input = new Input(canvas);
    this.audio = new AudioEngine();

    this.houseData = buildHouse();
    this.world = new World(this.renderer, this.bus, this.houseData);
    this.player = new Player(this.world, this.input, this.bus, this.audio);
    this.inventory = new Inventory(this.bus);
    this.journal = new Journal(this.bus);
    this.reality = new RealitySystem(this.bus, this.world, this.renderer, this.audio, this.player);
    this.narrative = new Narrative(this.bus, this.journal, this.reality);
    this.interaction = new Interaction(this);
    this.ambient = new AmbientEvents(this);

    this.paused = true;
    this.running = false;
    this.started = false;
    this.lastTime = 0;
    this._intentionalUnlock = false;
    this._pendingClue = null;
    this._radioHandle = null;
    this._tapeHandle = null;

    // Estado atmosférico interpolado (interior x exterior).
    this.atmo = {
      ambient: new Float32Array([0.030, 0.036, 0.055]),
      moon: new Float32Array([0.16, 0.19, 0.30]),
      fogDensity: 0.030,
    };
    this.scene = {
      meshes: this.world.meshes,
      lights: this.world.lights,
      ambient: this.atmo.ambient,
      moonDir: new Float32Array([0.34, 0.78, 0.52]),
      moonColor: this.atmo.moon,
      fogColor: new Float32Array([0.016, 0.019, 0.030]),
      fogDensity: 0.030,
      flashlight: this.player.flashlight,
    };
    v3.normalize(this.scene.moonDir, this.scene.moonDir);

    wireStoryEvents(this);
    this._wireInternal();
    this._loop = this._loop.bind(this);
    window.addEventListener('resize', () => this.renderer.resize());
  }

  /* -------------------------------- ligações ---------------------------- */

  _wireInternal() {
    this.input.onLockChange = (locked) => {
      if (locked) return;
      // Perder o cursor sem ser por abrir um painel = o jogador apertou Esc.
      if (this._intentionalUnlock) { this._intentionalUnlock = false; return; }
      if (!this.ui.isOpen && this.started && !this.paused) this.pause();
    };

    this.bus.on(EVENTS.CHAPTER_START, ({ chapter }) => {
      // A vertical slice termina onde o conteúdo termina — e mostra ao jogador
      // para onde a apuração dele estava indo.
      if (chapter.stub) setTimeout(() => this.showSliceEnd(), 3200);
    });

    this.bus.on(EVENTS.DOOR_TOGGLE, ({ open, position }) => {
      if (!position) return;
      const d = Math.hypot(position[0] - this.player.position[0], position[1] - this.player.position[2]);
      if (d > 3) this.audio.door(open, false, d);
    });
  }

  /* ------------------------------ ciclo de vida ------------------------- */

  start(fromSave = false) {
    this.audio.init();
    this.audio.resume();
    this.started = true;

    if (fromSave && this.loadSave()) {
      this.ui.showHUD(true);
      this.resume();
      return;
    }

    this.player.teleport(this.houseData.spawn.position[0], this.houseData.spawn.position[2],
      this.houseData.spawn.yaw);
    this.inventory.add('lanterna', true);
    this.inventory.add('carta_convite', true);
    this.journal.addClue('carta_recebida');
    this.audio.startAmbient('outside');

    this.ui.showHUD(true);
    this.narrative.startChapter(0);
    // A carta abre sozinha: é o gancho, e o jogador precisa dela para saber
    // que a chave está embaixo do vaso. Espera o cartão do capítulo sair.
    setTimeout(() => {
      if (this.started) this.openDocument('carta_convite');
    }, 5600);

    this.resume();   // resume() também inicia o loop, se ainda não estiver rodando
  }

  pause() {
    if (this.paused) return;
    this.paused = true;
    this.player.canMove = false;
    this._intentionalUnlock = true;
    this.input.releaseLock();
    this.ui.openPause(this);
  }

  resume() {
    this.ui.closeTopPanel();
    this.paused = false;
    this.player.canMove = true;
    this.input.requestLock();
    this.audio.resume();
    if (!this.running) {
      this.running = true;
      this.lastTime = performance.now();
      requestAnimationFrame(this._loop);
    }
  }

  returnToTitle() {
    this.paused = true;
    this.started = false;
    this.player.canMove = false;
    this.ui.closeTopPanel();
    this.ui.showHUD(false);
    this.audio.stopAmbient(1.2);
    this._intentionalUnlock = true;
    this.input.releaseLock();
    this.ui.el.title.classList.remove('hidden');
    this.ui.el.btnContinue.classList.toggle('hidden', !SaveSystem.hasSave());
  }

  get uiOpen() { return this.ui.isOpen; }

  /* ---------------------------------- loop ------------------------------ */

  _loop(now) {
    if (!this.running) return;
    requestAnimationFrame(this._loop);

    // Clamp do delta: uma aba em segundo plano produziria um salto enorme e o
    // jogador atravessaria paredes ao voltar.
    let dt = (now - this.lastTime) / 1000;
    this.lastTime = now;
    if (dt > 0.1) dt = 0.1;

    this._handleGlobalKeys();

    // Aviso de "clique para retomar": o cooldown do pointer lock após um Esc
    // faz requestLock falhar em silêncio, e sem isto o jogo parece travado.
    const needsClick = this.started && !this.paused && !this.ui.isOpen && !this.input.locked;
    if (needsClick !== this._needsClick) {
      this._needsClick = needsClick;
      this.ui.setClickHint(needsClick);
    }

    if (!this.paused && !this.ui.isOpen) {
      this.player.update(dt);
      this.world.update(dt, this.player.position);
      this.interaction.update(dt, this.player);
      if (this.input.justPressed('interact')) this.interaction.activate();
      this.ambient.update(dt);
    } else {
      this.input.consumeLook();   // descarta o movimento acumulado
    }

    // O monólogo congela enquanto um documento está aberto: as legendas ficam
    // atrás do overlay, e deixá-las correr faria Laura falar para ninguém.
    this.narrative.update(this.ui.isOpen ? 0 : dt);
    this.reality.update(dt);
    this._updateAtmosphere(dt);

    this.renderer.render(this.scene, {
      position: this.player.position,
      yaw: this.player.yaw,
      pitch: this.player.pitch,
      fov: 68,
    }, now / 1000);

    this.input.endFrame();
  }

  _handleGlobalKeys() {
    const input = this.input;

    if (input.justPressed('cancel')) {
      if (this.ui.closeTopPanel()) {
        if (this.started && !this.paused) { this._intentionalUnlock = false; this.input.requestLock(); }
        return;
      }
      if (this.started) this.paused ? this.resume() : this.pause();
      return;
    }

    if (!this.started) return;

    if (input.justPressed('journal')) {
      if (this.ui.openPanel === 'journal') { this.closeOverlay(); }
      else if (!this.ui.isOpen) { this.openOverlay(() => this.ui.openJournal(this)); }
      return;
    }

    if (input.justPressed('inventory')) {
      if (this.ui.openPanel === 'journal') { this.closeOverlay(); }
      else if (!this.ui.isOpen) {
        this.openOverlay(() => { this.ui.openJournal(this); this.ui.showJournalTab('itens'); });
      }
      return;
    }

    if (input.justPressed('map')) this.ui.peekObjective();
  }

  /** Interior e exterior têm atmosferas diferentes; a transição é contínua. */
  _updateAtmosphere(dt) {
    const room = this.world.currentRoom;
    const inside = room && !room.outdoor;

    const targetAmb = inside ? [0.016, 0.018, 0.026] : [0.030, 0.036, 0.055];
    const targetMoon = inside ? [0.045, 0.055, 0.088] : [0.16, 0.19, 0.30];
    const targetFog = inside ? 0.052 : 0.030;

    for (let i = 0; i < 3; i++) {
      this.atmo.ambient[i] = damp(this.atmo.ambient[i], targetAmb[i], 1.6, dt);
      this.atmo.moon[i] = damp(this.atmo.moon[i], targetMoon[i], 1.6, dt);
    }
    this.scene.fogDensity = damp(this.scene.fogDensity, targetFog, 1.6, dt);
  }

  /* ------------------------------- conteúdo ----------------------------- */

  openDocument(docId, clueId, opts = {}) {
    const doc = DOCUMENTS[docId];
    if (!doc) return;

    let photoVariant = 0;
    if (doc.type === 'photo') {
      const worldId = opts.photo || doc.photoId;
      const obj = this.world.photosById.get(worldId);
      const tex = obj ? obj.material.texture : 'photo0';
      photoVariant = parseInt(tex.replace('photo', ''), 10) || 0;
    }

    this._pendingClue = clueId || doc.clue || null;
    this._intentionalUnlock = true;
    this.input.releaseLock();
    this.audio.paper();
    this.ui.openDocument(docId, this.reality.level, { photoVariant });
  }

  playTape(tapeId) {
    if (this._tapeHandle) { this._tapeHandle.stop(); this._tapeHandle = null; }
    this._tapeHandle = this.audio.tapeHiss(0.07);
    this.audio.click(0.8, 0.22);
    this.openDocument(tapeId);
  }

  /** Fecha um documento: é aqui que a pista é registrada, não na abertura. */
  onDocumentClosed(docId) {
    if (this._tapeHandle) { this._tapeHandle.stop(); this._tapeHandle = null; }
    this.journal.markRead(docId);
    // Duas fontes de pista: a que o objeto do cenário declara e a que o próprio
    // documento carrega. Um mesmo papel pode render as duas (addClue deduplica).
    if (this._pendingClue) this.journal.addClue(this._pendingClue);
    const doc = DOCUMENTS[docId];
    if (doc && doc.clue) this.journal.addClue(doc.clue);
    this._pendingClue = null;
    this.bus.emit(EVENTS.DOC_READ, { id: docId });
    this.onOverlayClosed();
  }

  openOverlay(fn) {
    this._intentionalUnlock = true;
    this.input.releaseLock();
    fn();
  }

  closeOverlay() {
    this.ui.closeTopPanel();
  }

  onOverlayClosed() {
    if (this.started && !this.paused) {
      this._intentionalUnlock = false;
      this.input.requestLock();
    }
  }

  /**
   * Leva Laura a outro ponto do mundo com um fade. Cômodos alcançados assim
   * (o sótão) são espaços separados em coordenadas distantes, não andares
   * contíguos — que é exatamente como o SceneFlow do Godot vai tratá-los:
   * um cômodo é uma cena, não um pedaço de geometria vertical.
   */
  transitionTo(x, z, yaw, onArrive) {
    if (this._transitioning) return;
    this._transitioning = true;
    this.player.canMove = false;

    const fadeOut = 0.9, hold = 0.5, fadeIn = 1.4;
    const t0 = performance.now();
    const step = () => {
      const t = (performance.now() - t0) / 1000;
      if (t < fadeOut) {
        this.renderer.post.fade = 1 - t / fadeOut;
      } else if (t < fadeOut + hold) {
        this.renderer.post.fade = 0;
        if (!this._arrived) {
          this._arrived = true;
          this.player.teleport(x, z, yaw);
          this.world.update(0.016, this.player.position);
          if (onArrive) onArrive();
        }
      } else if (t < fadeOut + hold + fadeIn) {
        this.renderer.post.fade = (t - fadeOut - hold) / fadeIn;
      } else {
        this.renderer.post.fade = 1;
        this._transitioning = false;
        this._arrived = false;
        if (this.started && !this.paused) this.player.canMove = true;
        return;
      }
      requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  onDeduction(deduction) {
    this.reality.spike(0.25, 2);
    this.narrative.say(deduction.title + '.');
  }

  runScript(id, source) {
    runScript(this, id, source);
  }

  /* --------------------------------- final ------------------------------ */

  showSliceEnd() {
    const dom = this.journal.dominantInterpretation();
    const ending = dom.key && dom.decisive
      ? ENDINGS[{ sobrenatural: 'helena', psicologica: 'laura', conspiracao: 'verdade' }[dom.key]]
      : ENDINGS.incerto;

    const stats = [
      `Pistas encontradas: ${this.journal.clues.size}`,
      `Deduções: ${this.journal.deductions.length}`,
      `Documentos lidos: ${this.journal.readDocuments.size}`,
      `Nível de realidade: ${this.reality.level}`,
      '',
      'Fim do conteúdo atual — capítulos 1 a 6.',
      'Os capítulos 7 a 10 estão estruturados em src/data/chapters.js.',
    ].join('<br>');

    this.paused = true;
    this.player.canMove = false;
    this._intentionalUnlock = true;
    this.input.releaseLock();
    this.audio.stopAmbient(3);
    this.audio.stinger(44, 0.1, 14);
    this.bus.emit(EVENTS.ENDING, { ending });
    this.ui.showEnding(ending, stats);
  }

  /* ------------------------------ persistência -------------------------- */

  save() {
    return SaveSystem.save({
      player: this.player.serialize(),
      world: this.world.serialize(),
      inventory: this.inventory.serialize(),
      journal: this.journal.serialize(),
      narrative: this.narrative.serialize(),
      reality: this.reality.serialize(),
    });
  }

  loadSave() {
    const payload = SaveSystem.load();
    if (!payload) return false;
    const s = payload.state;
    this.world.deserialize(s.world);
    this.player.deserialize(s.player);
    this.inventory.deserialize(s.inventory);
    this.journal.deserialize(s.journal);
    this.reality.deserialize(s.reality);
    this.narrative.deserialize(s.narrative);

    // Interativos de itens já pegos não devem reaparecer.
    for (const [id, it] of this.interaction.items) {
      if (it.action && it.action.type === 'pickup' && this.inventory.has(it.action.item)) {
        it.hidden = true;
      }
    }
    this.audio.startAmbient(this.world.roomAt(this.player.position[0], this.player.position[2]) ? 'inside' : 'outside');
    this.started = true;
    this.ui.el.title.classList.add('hidden');
    this.ui.showHUD(true);
    return true;
  }

  saveSettings() {
    SaveSystem.saveSettings({
      master: this.audio.volumes.master,
      ambientVol: this.audio.volumes.ambient,
      sensitivity: this.input.sensitivity,
      grain: this.renderer.post.grain,
      invertY: this.input.invertY,
    });
  }

  loadSettings() {
    const s = SaveSystem.loadSettings();
    if (!s) return;
    this.audio.volumes.master = s.master !== undefined ? s.master : 0.85;
    this.audio.volumes.ambient = s.ambientVol !== undefined ? s.ambientVol : 0.9;
    this.input.sensitivity = s.sensitivity || 0.0022;
    this.renderer.post.grain = s.grain !== undefined ? s.grain : 0.075;
    this.input.invertY = !!s.invertY;
  }
}
