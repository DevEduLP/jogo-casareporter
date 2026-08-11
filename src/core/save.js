// save.js — persistência em localStorage. O estado salvo é um objeto simples
// e versionado; nada de referências a objetos de engine, para que o mesmo
// formato possa ser lido por uma futura versão em Godot.

const KEY = 'casa-da-reporter:save';
const SETTINGS_KEY = 'casa-da-reporter:settings';
const VERSION = 1;

export const SaveSystem = {
  available() {
    try {
      const k = '__probe__';
      localStorage.setItem(k, '1');
      localStorage.removeItem(k);
      return true;
    } catch (e) {
      return false; // modo privado / storage bloqueado
    }
  },

  save(state) {
    if (!this.available()) return false;
    try {
      const payload = {
        version: VERSION,
        savedAt: new Date().toISOString(),
        state,
      };
      localStorage.setItem(KEY, JSON.stringify(payload));
      return true;
    } catch (e) {
      console.warn('Falha ao salvar:', e);
      return false;
    }
  },

  load() {
    if (!this.available()) return null;
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return null;
      const payload = JSON.parse(raw);
      // Saves de versões futuras/antigas incompatíveis são descartados em vez
      // de causarem um crash silencioso no meio do jogo.
      if (payload.version !== VERSION) return null;
      return payload;
    } catch (e) {
      console.warn('Save corrompido, ignorando:', e);
      return null;
    }
  },

  hasSave() { return this.load() !== null; },

  clear() {
    if (!this.available()) return;
    localStorage.removeItem(KEY);
  },

  loadSettings() {
    if (!this.available()) return null;
    try {
      const raw = localStorage.getItem(SETTINGS_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  },

  saveSettings(settings) {
    if (!this.available()) return;
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch (e) { /* sem persistência de opções; não é fatal */ }
  },
};
