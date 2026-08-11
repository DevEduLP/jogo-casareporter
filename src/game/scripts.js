// scripts.js — eventos roteirizados e eventos ambientes.
//
// Os roteirizados respondem a uma ação do jogador. Os ambientes acontecem
// sozinhos, com frequência ditada pelo nível de realidade — e são calibrados
// para ficarem SEMPRE no limite do negável. Se o jogador puder afirmar com
// certeza que ouviu algo, o efeito já falhou.

import { EVENTS } from '../core/bus.js';
import { makeRNG } from '../core/math.js';

export function runScript(game, id, source) {
  const { world, narrative, journal, audio, reality, inventory, interaction } = game;

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

    /* ==================== capítulo 6 — A PRESENÇA ====================== */

    case 'cadeira_corredor': {
      narrative.say([
        'É a cadeira da cozinha. A mesma: tem o mesmo respingo de tinta branca no pé direito.',
        'Está no meio do corredor, virada para a porta do porão. A uns dois metros dela.',
        'Alguém sentou aqui para olhar aquela porta. Por tempo suficiente para precisar de uma cadeira.',
      ]);
      journal.addClue('casa_mexeu');
      reality.spike(0.7, 5);
      return;
    }

    case 'caixa_musica_mudou': {
      audio.musicBox();
      narrative.say([
        'A caixa de música está na entrada. Sobre o aparador.',
        'Eu abri essa caixa no quarto de Helena e deixei ela lá, com a tampa levantada, porque eu tirei uma chave de dentro e não me dei o trabalho de fechar.',
        'A tampa está fechada.',
      ]);
      journal.addClue('casa_mexeu');
      reality.spike(0.6, 4);
      return;
    }

    case 'arquivo_gavetas': {
      if (narrative.hasFlag('achou_chave_porao')) {
        narrative.interrupt('Pastas de A a F. A gaveta G continua vazia.');
        return;
      }
      narrative.setFlag('achou_chave_porao');
      audio.click(0.7, 0.2);
      inventory.add('chave_porao');
      narrative.say([
        'Seis pastas, etiquetadas à máquina, ordenadas. A sétima gaveta está vazia.',
        'Não completamente vazia. No fundo, no canto, uma chave pesada com o dente polido de uso.',
        'A gaveta que ela decidiu não escrever é a única em que ela guardou alguma coisa.',
      ]);
      journal.addClue('gaveta_g');
      reality.spike(0.5, 4);
      return;
    }

    /* --------------------------- o porão ------------------------------- */

    case 'porao_colchao': {
      narrative.say([
        'Um colchão de solteiro, direto no chão, com um cobertor dobrado no pé. Dobrado, não jogado.',
        'A poeira em cima é fina e uniforme. Meses, talvez. Não vinte e sete anos — vinte e sete anos de porão úmido teriam comido isso até o enchimento.',
        'Alguém dormiu aqui, e não faz tanto tempo assim, e arrumou a cama antes de ir embora.',
      ]);
      journal.addClue('caderno_porao');
      reality.spike(0.6, 5);
      return;
    }

    case 'porao_cadeira': {
      narrative.say([
        'Uma cadeira, no meio do porão, virada para a parede do fundo.',
        'Não para a escada. Não para a mesa. Para a parede.',
        'O verniz do encosto está gasto nos dois pontos onde encostam os ombros de quem senta muito tempo sem se mexer.',
      ]);
      reality.spike(0.7, 6);
      audio.tinnitus(4, 0.04);
      return;
    }

    case 'porao_lampiao': {
      game.openDocument('bilhete_lampiao');
      return;
    }

    case 'porao_parede': {
      // Segunda passada: ela volta e conta direito. É o capítulo 7 cobrando
      // a promessa que o capítulo 6 deixou no ar.
      if (narrative.hasFlag('viu_parede_porao')) {
        if (narrative.hasFlag('contou_riscos')) {
          narrative.interrupt('Onze. Continuam onze.');
          return;
        }
        narrative.setFlag('contou_riscos');
        narrative.say([
          'Certo. Devagar. Da camada de cima para baixo.',
          'A camada mais recente está mais à direita e mais alta que as outras, e a tinta do lápis ainda tem brilho.',
          'Onze riscos. Dois grupos de cinco e um sozinho.',
          'Eu fiquei onze dias com aquela carta antes de decidir vir. Onze. Eu contei porque eu conto tudo.',
          'Alguém aqui embaixo estava contando a minha demora enquanto eu ainda estava a quatrocentos quilômetros daqui.',
        ]);
        journal.addClue('onze_dias');
        reality.spike(1, 9);
        audio.whisper(3, 5);
        return;
      }
      narrative.setFlag('viu_parede_porao');
      narrative.say([
        'A parede que a cadeira encara está cheia de riscos.',
        'Grupos de cinco, o quinto atravessado, do jeito que todo mundo conta dias.',
        'Começam na altura do peito de quem está sentado e descem até o chão, e depois voltam a subir mais à direita, e depois de novo.',
        'Eu comecei a contar e parei no terceiro bloco, porque percebi uma coisa: os riscos mais recentes estão por cima dos antigos, e os antigos estão desbotados de um jeito que leva décadas.',
        'Alguém contou dias nesta parede muitas vezes. Em épocas diferentes. Com anos de intervalo.',
      ]);
      journal.addClue('bilhete_lampiao');
      reality.spike(1, 10);
      audio.stinger(43, 0.14, 12);
      return;
    }

    /* ==================== capítulo 9 — A VISITANTE ===================== */

    case 'subir_sotao': {
      audio.creak(1.2, 1.5);
      audio.door(true, false, 1.5);
      narrative.interrupt('A escada desce sozinha quando eu puxo. As dobradiças estão azeitadas.');
      game.transitionTo(120, 3.0, 0, () => {
        audio.startAmbient('inside');
        if (!narrative.hasFlag('subiu_sotao')) {
          narrative.setFlag('subiu_sotao');
          journal.addClue('duas_cadeiras');
          narrative.say([
            'Duas cadeiras. Frente a frente, no meio do sótão, a um metro e meio uma da outra.',
            'Vinte e sete anos de poeira em cima de uma. Nenhuma em cima da outra.',
          ], 1.2);
          narrative.setObjective('Entender de quem é cada cadeira.');
          reality.spike(0.9, 10);
        }
      });
      return;
    }

    case 'descer_sotao': {
      audio.creak(1.0, 1.0);
      game.transitionTo(0, -2.2, Math.PI, () => audio.startAmbient('inside'));
      return;
    }

    case 'relogio_sotao': {
      narrative.say([
        'Um relógio de parede, igual aos dois lá embaixo. Três e quarenta e sete.',
        'Este aqui não é de corda. É a pêndulo, e o pêndulo está preso com um pedaço de barbante amarrado com nó de laçada.',
        'Alguém parou este relógio de propósito, com as mãos, e amarrou para ele não voltar a andar.',
        'O barbante está novo.',
      ]);
      journal.addClue('relogio_sotao');
      reality.spike(0.6, 6);
      return;
    }

    /* ------------------------- a escolha ------------------------------- */
    // Duas cadeiras, nenhuma resposta certa. Sentar em qualquer uma fecha o
    // capítulo; qual delas apenas inclina a leitura, como qualquer dedução.

    case 'sentar_helena': {
      if (narrative.hasFlag('encarou_visitante')) {
        narrative.interrupt('Já sentei. Não muda nada sentar de novo.');
        return;
      }
      narrative.setFlag('encarou_visitante');
      narrative.setFlag('sentou_helena');
      journal.addClue('sentou_na_cadeira');
      journal.lean.sobrenatural += 2;
      journal.lean.psicologica += 2;
      audio.creak(0.8, 0.9);
      audio.stinger(32, 0.14, 18);
      narrative.say([
        'Eu sento na cadeira dela.',
        'O assento está gasto exatamente onde o meu peso cai. Isso não quer dizer nada — assento de cadeira gasta no meio, todo assento de cadeira gasta no meio.',
        'Daqui eu vejo a outra cadeira. A poeira em cima do assento está lisa, sem marca nenhuma, do jeito que fica poeira em que ninguém nunca encostou.',
        'Foi isto que ela fez. Todas as noites, provavelmente. Sentar aqui e olhar aquela cadeira vazia e esperar.',
        'E se alguém subisse agora, ia me encontrar exatamente nesta posição, e ia escrever no caderno que a casa tem uma mulher sentada no sótão olhando uma cadeira vazia.',
      ]);
      reality.spike(1, 20);
      return;
    }

    case 'sentar_visitante': {
      if (narrative.hasFlag('encarou_visitante')) {
        narrative.interrupt('Já sentei. Não muda nada sentar de novo.');
        return;
      }
      narrative.setFlag('encarou_visitante');
      narrative.setFlag('sentou_visitante');
      journal.addClue('sentou_na_cadeira');
      journal.lean.conspiracao += 2;
      journal.lean.psicologica += 2;
      audio.creak(0.8, 0.9);
      audio.stinger(32, 0.14, 18);
      narrative.say([
        'A folha diz que eu vou sentar na dela.',
        'Eu sento na outra.',
        'A poeira cede com um som muito baixo e eu sinto ela no fundo da calça, e é uma sensação tão específica e tão banal que por um segundo eu quase rio.',
        'Vinte e sete anos e eu sou a primeira pessoa a sentar aqui.',
        'Daqui eu vejo a cadeira gasta. E ela está vazia, e continua vazia, e eu fico olhando para ela pelo tempo que for preciso para ter certeza de que vai continuar.',
        'Eu não fiz o que estava escrito. Anota aí, quem quer que esteja anotando: eu não fiz o que estava escrito.',
      ]);
      reality.spike(1, 20);
      return;
    }

    /* ====================== capítulo 8 — LAURA ========================= */
    // Memórias disparadas por objetos banais. Duas delas não podem ser
    // verdadeiras ao mesmo tempo, e o jogo nunca aponta isso — quem cruzar
    // as pistas depois é que descobre.

    case 'memoria_cozinha': {
      narrative.setFlag('memoria_cozinha');
      narrative.say([
        'Duas xícaras. Eu já olhei para estas xícaras hoje e anotei "duas" no caderno como quem anota um fato.',
        'E agora eu estou vendo uma cozinha de azulejo verde até a metade da parede.',
        'Eu em cima de uma cadeira. A jarra escorrega. Eu vejo ela escorregar e decido não gritar.',
        'E aí tem alguém. Alguém grita o meu nome e me tira da cadeira e segura a minha mão embaixo da torneira, e eu lembro da água fria e do jeito que ela disse o meu nome, com raiva por cima do susto.',
        'Isso é uma memória. Isso tem textura de memória. Eu tenho trinta e oito anos e essa é a primeira vez na vida que eu me lembro de alguém ter gritado o meu nome naquela cozinha.',
      ]);
      journal.addClue('memoria_cozinha');
      reality.spike(0.8, 7);
      return;
    }

    case 'memoria_banheira': {
      narrative.setFlag('memoria_banheira');
      narrative.say([
        'A marca de nível na banheira, reta, escura.',
        'Eu tomava banho de banheira até tarde na infância. Minha mãe achava perigoso e eu tomava assim mesmo, porque não tinha quem me impedisse.',
        'A casa era grande e vazia e eu passava as tardes inteiras nela sozinha. Isso é a coisa que eu mais lembro da minha infância: o tamanho do silêncio.',
        'Nunca teve ninguém naquela casa comigo. Eu ficava sozinha desde as duas da tarde.',
      ]);
      journal.addClue('memoria_banheira');
      reality.spike(0.7, 6);
      return;
    }

    case 'memoria_sofa': {
      narrative.say([
        'A depressão limpa no assento da esquerda. Eu reparei nisso hoje de manhã, o que já parece outra vida.',
        'Eu sento na direita. Sempre sentei na direita, em qualquer sofá, em qualquer casa.',
        'Não tem nada de errado nisso. É só que eu nunca me perguntei por quê, e agora eu me perguntei, e não tem resposta.',
      ]);
      return;
    }

    case 'espelho_riscado': {
      if (narrative.hasFlag('viu_espelho_riscado')) {
        narrative.interrupt('Continuo sem tocar no vidro.');
        return;
      }
      narrative.setFlag('viu_espelho_riscado');
      narrative.say([
        'Certo. Eu vou olhar no espelho.',
        'E é o meu rosto. É exatamente o meu rosto, cansado do jeito que eu esperava, e eu fico decepcionada, e a decepção é a coisa mais assustadora que eu sinto hoje.',
        'No canto inferior direito do vidro, do lado de dentro, tem riscos.',
        'Grupos de cinco, o quinto atravessado. Do lado de dentro. Entre o vidro e o fundo do espelho.',
        'São os mesmos riscos da parede do porão. A mesma inclinação, a mesma mão.',
        'Alguém contou dias aqui também. De pé, neste banheiro, na frente deste espelho, olhando para o próprio reflexo enquanto riscava.',
      ]);
      journal.addClue('espelho_riscos');
      reality.spike(1, 10);
      audio.tinnitus(6, 0.05);
      audio.stinger(40, 0.12, 12);
      return;
    }

    /* ================ capítulo 7 — O DESTINO DE HELENA ================= */

    case 'poco': {
      if (narrative.hasFlag('poco_aberto')) {
        narrative.interrupt('Nove metros de nada. Continuo sem conseguir ficar de costas.');
        return;
      }
      narrative.setFlag('poco_aberto');
      // A laje sai de cima e vai para o lado — a mesma técnica de "objeto que
      // muda de lugar" usada no capítulo 6.
      world.moveObject('laje_poco', 'laje_deslocada');
      // A boca do poço e a caixa lá dentro ocupam o mesmo volume: com as duas
      // ativas, a mira sempre pega o poço e a caixa fica inalcançável. Enquanto
      // a caixa está lá, ela é o que se vê ao olhar para baixo.
      interaction.setHidden('porao_poco', true);
      interaction.setHidden('porao_caixa_g', false);
      audio.creak(1.5, 1.4);
      audio.door(false, false, 2);

      const sabeDoPoco = journal.hasClue('poco_lacrado');
      narrative.say(sabeDoPoco ? [
        'A laje. Reassentada em novembro de 1998 e movida outra vez desde então — a marca de arrasto no concreto tem duas direções.',
        'Sai com o ombro. Pesa menos do que devia, e isso me diz que já saiu muitas vezes.',
        'Um buraco de alvenaria. Seco. Degraus de ferro descendo pela parede.',
        'A dois metros da boca, apoiada num degrau, uma caixa de metal. Seca também.',
      ] : [
        'Uma laje de concreto redonda, no chão do porão, do tamanho de uma tampa de bueiro.',
        'Tem marca de arrasto no cimento em volta. Duas direções: ela já saiu e voltou.',
        'Sai com o ombro. Embaixo tem um poço — alvenaria antiga, seco, com degraus de ferro descendo pela parede.',
        'E, a dois metros da boca, apoiada num degrau, uma caixa de metal que alguém colocou ali para ser achada por quem levantasse a laje.',
      ]);
      reality.spike(0.9, 8);
      audio.tinnitus(5, 0.045);
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

  /* ==================== capítulo 6 — A PRESENÇA ======================== */

  bus.on(EVENTS.CHAPTER_START, ({ chapter }) => {
    if (chapter.id !== 'a_presenca') return;

    // Cada alteração é gatilhada pelo cômodo onde ela acontece, nunca por um
    // temporizador global: assim nenhuma delas pode ocorrer sob o olhar.
    reality.mutate('porta_frente_abre', 'entrada', () => {
      world.setDoorSilent('porta_frente', true);
      world.setGroupVisible('chave_arquivo_visivel', true);
      interaction.setHidden('chave_arquivo_aparece', false);
    });

    reality.mutate('cadeira_some', 'cozinha', () => {
      world.setGroupVisible('cadeira_cozinha', false);
    });
    reality.mutate('cadeira_aparece', 'corredor', () => {
      world.setGroupVisible('cadeira_corredor', true);
      interaction.setHidden('cadeira_corredor', false);
    });

    reality.mutate('caixa_some', 'quarto', () => {
      world.setGroupVisible('caixa_musica_quarto', false);
      interaction.setHidden('caixa_musica', true);
    });
    reality.mutate('caixa_aparece', 'entrada', () => {
      world.setGroupVisible('caixa_musica_entrada', true);
      interaction.setHidden('caixa_musica_entrada', false);
    });

    // Terceiro estado da fotografia: a segunda figura nítida, Helena apagada.
    reality.mutate('foto_nivel4', 'escritorio', () => {
      world.setPhoto('foto_escrivaninha', 'photo2');
    });
    reality.mutate('galeria_nivel4', 'corredor', () => {
      world.setGalleryPhoto('photo2');
    });

    // Um empurrão para a frente da casa: Laura ouve a porta, não a vê abrir.
    setTimeout(() => {
      if (!narrative.hasFlag('viu_porta_aberta')) {
        audio.door(true, false, 12);
        audio.creak(11, 0.8);
        narrative.interrupt('Isso veio da frente da casa.');
        reality.spike(0.8, 6);
      }
    }, 9000);
  });

  // Chegar à entrada depois disso: a porta que ela trancou está aberta.
  bus.on(EVENTS.ROOM_ENTER, ({ id }) => {
    if (id === 'entrada' && reality.level >= 4 && !narrative.hasFlag('viu_porta_aberta')) {
      narrative.setFlag('viu_porta_aberta');
      journal.addClue('porta_aberta');
      narrative.say([
        'A porta da frente está aberta.',
        'Eu tranquei. Eu lembro de trancar, porque eu pensei em não trancar — pensei "não tem ninguém a quilômetros daqui" — e tranquei mesmo assim.',
        'Lá fora não tem nada. O carro está onde eu deixei.',
      ], 0.6);
      reality.spike(0.9, 7);
    }

    // Descer: fim do capítulo 6.
    if (id === 'escada' && !narrative.hasFlag('desceu_escada')) {
      narrative.setFlag('desceu_escada');
      audio.creak(2, 1.3);
      narrative.say(['A escada é de madeira e cada degrau reclama. Não dá para descer isto em silêncio. Nunca deu.'], 0.4);
    }
    if (id === 'porao' && !narrative.hasFlag('desceu_porao')) {
      narrative.setFlag('desceu_porao');
      audio.stinger(38, 0.12, 14);
      reality.spike(1, 12);
      narrative.say([
        'Frio. Cheiro de terra e de pavio queimado.',
        'Tem uma cadeira no meio do porão, virada para a parede do fundo.',
      ], 0.8);
      // O objetivo muda dentro do capítulo: a cena tem um alvo próprio.
      narrative.setObjective('Olhar para onde a cadeira está olhando.');
    }
  });

  // Destrancar o porão fecha o puzzle do capítulo (mas não o capítulo).
  bus.on(EVENTS.SCRIPT, ({ id, door }) => {
    if (id === 'porta_destrancada' && door === 'porta_porao') {
      narrative.setFlag('porao_aberto');
      narrative.say(['O cadeado abre no primeiro giro. Está lubrificado.']);
    }
  });

  /* ================ capítulo 7 — O DESTINO DE HELENA ================== */

  bus.on(EVENTS.DOC_READ, ({ id }) => {
    // A pasta G é o fim do capítulo 7. Não responde o que houve com Helena:
    // oferece três respostas que não se excluem, que é a promessa do jogo.
    if (id === 'pasta_g' && !narrative.hasFlag('destino_helena')) {
      narrative.setFlag('destino_helena');
      journal.addClue('helena_cicatriz');
      // Ela tira a caixa do poço: o buraco volta a ser só um buraco.
      interaction.setHidden('porao_caixa_g', true);
      interaction.setHidden('porao_poco', false);
      reality.spike(1, 14);
      audio.stinger(36, 0.15, 16);
      narrative.say([
        'Eu tenho três hipóteses e nenhuma delas exclui as outras duas.',
        'É a primeira vez na minha vida profissional que eu escrevo essa frase sem sentir que falhei.',
      ], 3.0);
    }

    // A Fita 02 rende a pista mesmo se a estante for revisitada.
    if (id === 'fita_02' && !journal.hasClue('fita_02')) {
      journal.addClue('fita_02');
    }
  });

  // A pasta G é achada dentro do poço: sem abrir, não existe.
  bus.on(EVENTS.CHAPTER_START, ({ chapter }) => {
    if (chapter.id !== 'o_destino_de_helena') return;
    narrative.setObjective('Vasculhar o porão. Helena escondeu alguma coisa aqui.');
    // Nível 5: a lanterna passa a hesitar de vez.
    setTimeout(() => {
      if (narrative.hasFlag('destino_helena')) return;
      audio.whisper(2.5, 6);
      reality.spike(0.7, 5);
    }, 20000);
  });

  /* ====================== capítulo 8 — LAURA ========================== */

  bus.on(EVENTS.CHAPTER_START, ({ chapter }) => {
    if (chapter.id !== 'laura') return;

    // A casa deixa de responder e passa a devolver. Objetos que Laura já
    // examinou como repórter voltam a ela como memória — e é o mesmo objeto,
    // no mesmo lugar, com a mesma aparência. Só o significado mudou.
    interaction.setAction('mesa_cozinha', { type: 'script', id: 'memoria_cozinha' });
    interaction.setAction('banheira', { type: 'script', id: 'memoria_banheira' });
    interaction.setAction('sofa_sala', { type: 'script', id: 'memoria_sofa' });
    interaction.setAction('espelho_banheiro', { type: 'script', id: 'espelho_riscado' });

    // As gavetas do arquivo já entregaram a chave do porão; agora entregam a
    // pasta B. E a pasta F estava numa caixa que ela nunca teve motivo de abrir.
    interaction.setAction('arquivo_gavetas', { type: 'read', doc: 'pasta_b_escola' });
    interaction.setHidden('arquivo_pasta_f', false);
  });

  bus.on(EVENTS.DOC_READ, ({ id }) => {
    // A lista de presença fecha o capítulo 8. Não confirma que era Laura:
    // confirma que ela não consegue mais afirmar que não era.
    if (id === 'pasta_b_escola' && !narrative.hasFlag('infancia')) {
      narrative.setFlag('infancia');
      reality.spike(1, 14);
      audio.stinger(34, 0.15, 16);
      narrative.say([
        'Eu nunca estive em São Brás.',
        'Eu tenho certeza absoluta disso — do mesmo jeito que eu tinha certeza absoluta de que ninguém contava números no corredor da minha casa.',
      ], 3.0);
    }

    if (id === 'pasta_f_sonhos') {
      narrative.setFlag('leu_sonhos');
      reality.spike(0.8, 8);
    }
  });

  /* ==================== capítulo 9 — A VISITANTE ====================== */

  bus.on(EVENTS.CHAPTER_START, ({ chapter }) => {
    if (chapter.id !== 'a_visitante') return;
    // O alçapão sempre esteve no teto. Laura só passa a vê-lo agora — que é
    // a piada amarga do capítulo, e ela mesma comenta.
    interaction.setHidden('alcapao', false);
  });

  bus.on(EVENTS.DOC_READ, ({ id }) => {
    if (id === 'folha_12' && !narrative.hasFlag('leu_folha_12')) {
      narrative.setFlag('leu_folha_12');
      reality.spike(0.9, 9);
      audio.whisper(2, 6);
    }
    if (id === 'fita_03' && !narrative.hasFlag('ouviu_fita_03')) {
      narrative.setFlag('ouviu_fita_03');
      reality.spike(1, 12);
      audio.tinnitus(7, 0.05);
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
