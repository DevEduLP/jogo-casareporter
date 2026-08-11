// scripts.js — eventos roteirizados e eventos ambientes.
//
// Os roteirizados respondem a uma ação do jogador. Os ambientes acontecem
// sozinhos, com frequência ditada pelo nível de realidade — e são calibrados
// para ficarem SEMPRE no limite do negável. Se o jogador puder afirmar com
// certeza que ouviu algo, o efeito já falhou.

import { EVENTS } from '../core/bus.js';
import { makeRNG } from '../core/math.js';

export function runScript(game, id, source) {
  const { world, narrative, journal, audio, reality, inventory } = game;

  switch (id) {

    /* ----------------------------- energia ----------------------------- */
    case 'energia': {
      if (narrative.hasFlag('energia')) {
        narrative.interrupt('A chave geral está erguida. O que tinha para ligar, ligou.');
        return;
      }
      narrative.setFlag('energia');
      audio.click(0.6, 0.35);
      // Um surto: tudo acende de uma vez e a maioria queima em seguida. Só
      // sobram algumas lâmpadas, e é isso que dá à casa sua topografia de medo.
      const all = ['luz_entrada', 'luz_sala', 'luz_cozinha', 'luz_corredor_1',
        'luz_corredor_2', 'luz_quarto', 'luz_banheiro', 'luz_escritorio', 'luz_arquivo'];
      for (const l of all) world.setLight(l, true);
      audio.static_(0.8, 0.1);
      setTimeout(() => {
        for (const l of ['luz_corredor_2', 'luz_quarto', 'luz_banheiro', 'luz_arquivo', 'luz_escritorio']) {
          world.setLight(l, false);
        }
        audio.click(0.4, 0.25);
        narrative.say([
          'A casa inteira acendeu de uma vez e metade das lâmpadas estourou no mesmo segundo.',
          'Sobrou a entrada, a sala, a cozinha e a primeira lâmpada do corredor. O resto é comigo e com a lanterna.',
        ]);
      }, 900);
      journal.addClue('conta_paga');
      reality.spike(0.5, 2);
      return;
    }

    /* ------------------------------ rádio ------------------------------ */
    case 'radio': {
      if (!narrative.hasFlag('energia')) {
        narrative.interrupt('Aperto o botão. O rádio não faz nada. Claro que não faz.');
        return;
      }
      if (game._radioHandle) {
        game._radioHandle.stop();
        game._radioHandle = null;
        audio.click(1.0, 0.2);
        narrative.interrupt('Desligo.');
        return;
      }
      audio.click(1.0, 0.2);
      game._radioHandle = audio.static_(0, 0.14);
      narrative.say([
        'Estática. Giro o dial devagar, do começo ao fim da faixa.',
        'Estática, estática, estática. Nenhuma emissora. Estamos longe de tudo.',
      ]);
      // Depois de um tempo com o rádio ligado, a estática "organiza-se" por um
      // instante. Nunca em palavras. Só em ritmo.
      setTimeout(() => {
        if (!game._radioHandle) return;
        audio.whisper(2.5, 6);
        reality.spike(0.6, 3);
        narrative.interrupt('...isso teve cadência. Estática não tem cadência.');
        journal.addClue('duas_xicaras');
      }, 14000);
      return;
    }

    /* ---------------------------- relógios ----------------------------- */
    case 'relogio': {
      narrative.say([
        'Parado às três e quarenta e sete.',
        'O do corredor também. Fui conferir e voltei, e os dois marcam a mesma coisa.',
        'Relógio de corda para quando acaba a corda. Dois relógios não param na mesma hora por acaso — param quando alguém dá corda nos dois no mesmo dia e nunca mais volta.',
      ]);
      journal.addClue('relogio_parado');
      return;
    }

    /* ------------------------------- pia ------------------------------- */
    case 'pia': {
      narrative.say([
        'Abro a torneira por reflexo. Ela tosse ar por três segundos e cospe água marrom.',
        'Depois clareia.',
        'Tem água encanada nesta casa. Alguém manteve a bomba funcionando.',
      ]);
      journal.addClue('conta_paga');
      return;
    }

    /* ---------------------------- galeria ------------------------------ */
    case 'galeria': {
      const level = reality.level;
      if (level < 3) {
        narrative.say([
          'Cinco retratos, todos da mesma casa, tirados de ângulos ligeiramente diferentes.',
          'Nenhuma pessoa em nenhum deles. Cinco fotografias de uma casa vazia, emolduradas e penduradas na altura dos olhos.',
          'Quem fotografa a própria casa cinco vezes e pendura o resultado no corredor?',
        ]);
      } else {
        narrative.say([
          'Cinco retratos da mesma casa.',
          'Em três deles, agora, há alguém na varanda.',
          'Eu passei por este corredor sete vezes hoje.',
        ]);
        reality.spike(0.8, 5);
      }
      return;
    }

    /* ---------------------------- espelhos ----------------------------- */
    case 'espelho_entrada': {
      narrative.say([
        'Uma mulher de trinta e oito anos com cara de quem dirigiu quatro horas.',
        'Poeira suficiente no vidro para eu ver o meu próprio contorno e não os detalhes. Melhor assim.',
      ]);
      return;
    }

    case 'espelho_banheiro': {
      if (reality.level >= 3) {
        narrative.interrupt('Eu não vou olhar no espelho agora.');
        reality.spike(0.7, 4);
        audio.tinnitus(3.5, 0.04);
        return;
      }
      narrative.say([
        'O espelho do banheiro está limpo.',
        'Todo o resto desta casa tem vinte e sete anos de poeira, e este espelho está limpo, com um risco de flanela no canto inferior direito.',
        'Alguém se olhou aqui. Recentemente.',
      ]);
      journal.addClue('cadeado_novo');
      return;
    }

    /* -------------------------- guarda-roupa --------------------------- */
    case 'guarda_roupa': {
      game.openDocument('guarda_roupa', 'casaco');
      return;
    }

    /* --------------------------- caixa de música ----------------------- */
    case 'caixa_musica': {
      if (narrative.hasFlag('caixa_aberta')) {
        narrative.interrupt('A caixa está vazia. A música continua funcionando.');
        audio.musicBox();
        return;
      }
      narrative.setFlag('caixa_aberta');
      audio.click(0.8, 0.2);
      audio.musicBox();
      inventory.add('chave_escritorio');
      narrative.say([
        'A tampa abre e o mecanismo começa sozinho. Uma valsa curta, desafinada nas últimas três notas.',
        'Debaixo do cilindro, encaixada de lado para não travar a engrenagem, uma chave.',
        '"No lugar onde a gente esconde chave quando quer que seja encontrada." Ela disse isso na fita. Ela disse isso na fita e eu vim direto para cá.',
      ]);
      reality.spike(0.4, 3);
      return;
    }

    /* ------------------------ máquina de escrever ---------------------- */
    case 'maquina': {
      game.openDocument('bilhete_maquina', 'mesma_maquina');
      return;
    }

    case 'gaveta_escritorio': {
      game.openDocument('gaveta_escritorio');
      return;
    }

    default:
      console.warn('Script desconhecido:', id);
  }
}

/* ==================== eventos disparados por estado ====================== */

/**
 * Liga os beats obrigatórios da narrativa. Tudo aqui é reação a sinais — é o
 * ponto onde história e simulação se encontram, e o único lugar do projeto
 * onde os dois se conhecem.
 */
export function wireStoryEvents(game) {
  const { bus, world, narrative, journal, reality, audio, interaction } = game;

  // Entrar na casa pela primeira vez.
  bus.on(EVENTS.ROOM_ENTER, ({ id }) => {
    if (id === 'entrada' && !narrative.hasFlag('entrou_casa')) {
      narrative.setFlag('entrou_casa');
      audio.stopAmbient(2.5);
      setTimeout(() => audio.startAmbient('inside'), 1200);
    }

    // A primeira vez no corredor: a casa se apresenta.
    if (id === 'corredor' && !narrative.hasFlag('viu_corredor')) {
      narrative.setFlag('viu_corredor');
      narrative.say([
        'O corredor é longo demais para uma casa deste tamanho. Não é: eu sei que não é. É o pé-direito que engana.',
        'Cinco portas. Duas abertas.',
      ], 1.0);
    }
  });

  // Ler a carta de 1998 — o eixo do jogo.
  bus.on(EVENTS.DOC_READ, ({ id }) => {
    if (id === 'carta_1998' && !narrative.hasFlag('leu_carta_1998')) {
      narrative.setFlag('leu_carta_1998');
      reality.raiseTo(3);
      reality.spike(1, 8);
      audio.stinger(52, 0.13, 9);

      // O momento em que a casa muda de comportamento. Nada acontece agora:
      // tudo fica agendado para quando ela sair desta sala.
      reality.mutate('foto_muda', 'escritorio', () => {
        world.setPhoto('foto_escrivaninha', 'photo1');
        world.setGalleryPhoto('photo1');
      });
      reality.mutate('porta_escritorio_fecha', 'escritorio', () => {
        world.setDoorSilent('porta_escritorio', false);
      });
      reality.mutate('porta_quarto_abre', 'quarto', () => {
        world.setDoorSilent('porta_quarto', true);
      });
    }

    if (id === 'foto_escrivaninha') {
      // Segunda leitura, já com a fotografia alterada: fecha o capítulo 5.
      if (reality.level >= 3 && narrative.hasFlag('leu_carta_1998')
        && !narrative.hasFlag('viu_foto_alterada')) {
        narrative.setFlag('viu_foto_alterada');
        journal.addClue('fotografia');
        reality.spike(1, 10);
        audio.stinger(46, 0.15, 12);
      }
    }
  });

  // Sair do escritório depois da carta: a casa "respira" às costas dela.
  bus.on(EVENTS.ROOM_EXIT, ({ id }) => {
    if (id === 'escritorio' && narrative.hasFlag('leu_carta_1998')
      && !narrative.hasFlag('primeiro_estranhamento')) {
      narrative.setFlag('primeiro_estranhamento');
      setTimeout(() => {
        audio.door(false, true, 7);
        audio.creak(6, 1.2);
        narrative.interrupt('Uma porta. Atrás de mim.');
        reality.spike(0.9, 6);
      }, 2600);
    }
  });

  // Destrancar o escritório.
  bus.on(EVENTS.SCRIPT, ({ id, door }) => {
    if (id === 'porta_destrancada' && door === 'porta_escritorio') {
      narrative.setFlag('escritorio_aberto');
    }
  });

  // A chave da frente: entrar é o objetivo do capítulo 1.
  bus.on(EVENTS.ITEM_ADDED, ({ id }) => {
    if (id === 'chave_casa') {
      narrative.say([
        'Estava embaixo do vaso da direita. Não tentei o da esquerda. Nem me passou pela cabeça tentar o da esquerda.',
      ]);
    }
  });

  // Reagir a portas trancadas com falas específicas de Laura.
  bus.on(EVENTS.DOOR_LOCKED, ({ id }) => {
    if (id === 'porta_porao' && !journal.hasClue('cadeado_novo')) {
      journal.addClue('cadeado_novo');
    }
  });
}

/* ========================= eventos ambientes ============================= */

export class AmbientEvents {
  constructor(game) {
    this.game = game;
    this.rng = makeRNG(90210);
    this.timer = this._nextInterval();
    this.lastRoom = null;
  }

  _nextInterval() {
    const level = this.game.reality.level;
    // Nível 0: raro e absolutamente banal. Nível 5: constante.
    const base = 46 - level * 7;
    return base + this.rng() * base * 0.8;
  }

  update(dt) {
    const game = this.game;
    if (game.paused || game.uiOpen) return;
    this.timer -= dt;
    if (this.timer > 0) return;
    this.timer = this._nextInterval();
    this._fire();
  }

  _fire() {
    const { audio, reality, narrative, world } = this.game;
    const level = reality.level;
    const r = this.rng();
    const inside = world.currentRoom && !world.currentRoom.outdoor;

    // Nível 0-1: apenas a casa sendo uma casa velha. Nenhuma ambiguidade.
    if (level <= 1) {
      if (r < 0.6) audio.creak(4 + this.rng() * 6, 0.7);
      else if (inside) audio.creak(8 + this.rng() * 5, 0.5);
      else audio.creak(10, 0.4);
      return;
    }

    // Nível 2-3: sons que ainda podem ser a casa, mas já vêm de longe demais.
    if (level <= 3) {
      if (r < 0.3) {
        audio.creak(3 + this.rng() * 4, 1.0);
      } else if (r < 0.5) {
        audio.door(false, false, 9);
      } else if (r < 0.7) {
        audio.footstep(this.rng() < 0.5 ? 'wood' : 'concrete', false);
        setTimeout(() => audio.footstep('wood', false), 420);
      } else if (r < 0.88) {
        audio.whisper(9, 3);
      } else {
        audio.tinnitus(4, 0.03);
        reality.spike(0.3, 2);
      }
      return;
    }

    // Nível 4-5: a casa já não se dá ao trabalho de parecer plausível.
    if (r < 0.2) {
      audio.knock(3, 8);
      narrative.interrupt('Três batidas. A terceira demorou.');
      reality.spike(0.8, 5);
    } else if (r < 0.4) {
      audio.whisper(4, 7);
      reality.spike(0.5, 3);
    } else if (r < 0.6) {
      // Passos que se aproximam e param.
      let n = 0;
      const step = () => {
        audio.footstep('wood', false);
        if (++n < 6) setTimeout(step, 480 - n * 30);
        else reality.spike(0.7, 4);
      };
      step();
    } else if (r < 0.8) {
      audio.door(true, true, 5);
      reality.spike(0.6, 4);
    } else {
      audio.tinnitus(6, 0.05);
      audio.stinger(41, 0.08, 7);
      reality.spike(0.9, 6);
    }
  }
}
