// bus.js — barramento de eventos. Os sistemas nunca se referenciam
// diretamente; conversam por sinais. Equivale a signals do Godot e é o que
// mantém narrativa, áudio, UI e mundo desacoplados.

export class EventBus {
  constructor() {
    this.handlers = new Map();
    this.debug = false;
  }

  on(event, fn) {
    if (!this.handlers.has(event)) this.handlers.set(event, new Set());
    this.handlers.get(event).add(fn);
    return () => this.off(event, fn);
  }

  once(event, fn) {
    const off = this.on(event, (...args) => { off(); fn(...args); });
    return off;
  }

  off(event, fn) {
    const set = this.handlers.get(event);
    if (set) set.delete(fn);
  }

  emit(event, payload) {
    if (this.debug) console.log('[bus]', event, payload);
    const set = this.handlers.get(event);
    if (!set) return;
    // Cópia: um handler pode se desinscrever (ou inscrever outro) durante o emit.
    for (const fn of Array.from(set)) {
      try {
        fn(payload);
      } catch (err) {
        console.error(`Erro no handler de "${event}":`, err);
      }
    }
  }
}

export const EVENTS = {
  CHAPTER_START: 'chapter:start',
  OBJECTIVE_SET: 'objective:set',
  FLAG_SET: 'flag:set',
  ITEM_ADDED: 'item:added',
  ITEM_USED: 'item:used',
  CLUE_FOUND: 'clue:found',
  DOC_READ: 'doc:read',
  DOC_OPEN: 'doc:open',
  DOC_CLOSE: 'doc:close',
  DOOR_TOGGLE: 'door:toggle',
  DOOR_LOCKED: 'door:locked',
  ROOM_ENTER: 'room:enter',
  ROOM_EXIT: 'room:exit',
  REALITY_CHANGE: 'reality:change',
  MONOLOGUE: 'monologue',
  SUBTITLE: 'subtitle',
  NOTIFY: 'notify',
  SCRIPT: 'script',
  ENDING: 'ending',
  SAVE: 'save',
  LOAD: 'load',
};
