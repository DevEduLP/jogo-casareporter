// inventory.js — itens carregados por Laura.

import { ITEMS } from '../data/clues.js';
import { EVENTS } from '../core/bus.js';

export class Inventory {
  constructor(bus) {
    this.bus = bus;
    this.items = new Map();   // id -> { count }
  }

  add(id, silent = false) {
    const def = ITEMS[id];
    if (!def) { console.warn('Item desconhecido:', id); return false; }
    if (this.items.has(id)) {
      this.items.get(id).count++;
    } else {
      this.items.set(id, { count: 1 });
    }
    if (!silent) this.bus.emit(EVENTS.ITEM_ADDED, { id, def });
    return true;
  }

  has(id) { return this.items.has(id); }

  remove(id) {
    if (!this.items.has(id)) return false;
    const entry = this.items.get(id);
    entry.count--;
    if (entry.count <= 0) this.items.delete(id);
    return true;
  }

  list() {
    return Array.from(this.items.keys()).map((id) => ({ id, ...ITEMS[id], count: this.items.get(id).count }));
  }

  serialize() { return Array.from(this.items.entries()).map(([id, e]) => [id, e.count]); }

  deserialize(data) {
    this.items.clear();
    for (const [id, count] of data || []) this.items.set(id, { count });
  }
}
