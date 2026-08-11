// main.js — ponto de entrada. Monta a UI, cria o jogo e liga a tela de título.

import { UI } from './ui/ui.js';
import { Game } from './game/game.js';
import { SaveSystem } from './core/save.js';

function fatal(message, err) {
  console.error(message, err);
  const box = document.getElementById('load-error');
  if (box) {
    box.classList.remove('hidden');
    box.textContent = message + (err ? ` (${err.message})` : '');
  }
  const btn = document.getElementById('btn-start');
  if (btn) btn.disabled = true;
}

function boot() {
  const canvas = document.getElementById('scene');
  let ui, game;

  try {
    ui = new UI();
    game = new Game(canvas, ui);
    game.loadSettings();
  } catch (err) {
    fatal('Não foi possível iniciar o jogo.', err);
    return;
  }

  const title = document.getElementById('screen-title');
  const btnStart = document.getElementById('btn-start');
  const btnContinue = document.getElementById('btn-continue');

  if (SaveSystem.hasSave()) btnContinue.classList.remove('hidden');

  const begin = (fromSave) => {
    title.classList.add('hidden');
    // O contexto de áudio só pode nascer dentro de um gesto do usuário.
    game.audio.init();
    game.start(fromSave);
  };

  btnStart.addEventListener('click', () => {
    if (SaveSystem.hasSave()) SaveSystem.clear();
    begin(false);
  });
  btnContinue.addEventListener('click', () => begin(true));

  document.getElementById('btn-ending-close').addEventListener('click', () => {
    document.getElementById('screen-ending').classList.add('hidden');
    game.returnToTitle();
  });

  // Reengatar o pointer lock com um clique é o gesto que todo jogador já
  // espera; sem isto, sair do lock deixa a câmera morta sem explicação.
  canvas.addEventListener('click', () => {
    if (game.started && !game.paused && !ui.isOpen) game.input.requestLock();
  });

  window.game = game;   // conveniência para depuração no console
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}
