// house.js — a planta da casa de Helena, declarativa.
//
// PLANTA (x cresce para leste, z cresce para o sul; a fachada é ao sul, z=+9)
//
//        ARQUIVO   |  corredor |   ESCRITÓRIO          z = -9
//        (-8..-2.5)|(-2.5..2.5)|   (2.5..8)
//        ----------|           |------------  z = -4.5 / -1.5
//        QUARTO    |           |   BANHEIRO
//        HELENA    |           |------------  z = +1.5 / +2.5
//        ----------|-----------|   COZINHA
//        SALA      |  ENTRADA  |
//                  |  [porta]  |              z = +9
//
// Tudo aqui é dado puro: nenhuma chamada de engine. Este arquivo é o que se
// transformaria numa cena .tscn do Godot.

import * as P from './props.js';

const WH = 2.8;      // altura do pé-direito
const TE = 0.32;     // espessura de parede externa
const TI = 0.16;     // espessura de parede interna

/** Segmento de parede alinhado aos eixos. */
function wall(x1, z1, x2, z2, tex = 'plaster', thick = TI, h = WH) {
  return { x1, z1, x2, z2, tex, thick, h };
}

export function buildHouse() {
  const walls = [];
  const props = [];
  const interactables = [];

  /* ------------------------------ estrutura ----------------------------- */

  // Fachada sul, com o vão da porta de entrada (x de -0.65 a 0.65).
  walls.push(wall(-8, 9, -0.65, 9, 'plaster', TE));
  walls.push(wall(0.65, 9, 8, 9, 'plaster', TE));
  // Fundos, oeste.
  walls.push(wall(-8, -9, 8, -9, 'plaster', TE));
  walls.push(wall(-8, -9, -8, 9, 'plaster', TE));
  // Leste, com o vão da porta dos fundos (z de 4.3 a 5.7).
  walls.push(wall(8, -9, 8, 4.3, 'plaster', TE));
  walls.push(wall(8, 5.7, 8, 9, 'plaster', TE));

  // Divisória oeste (x = -2.5): vãos para sala, quarto e arquivo.
  walls.push(wall(-2.5, -9, -2.5, -7.2, 'wallpaper'));
  walls.push(wall(-2.5, -6.1, -2.5, -2.2, 'wallpaper'));
  walls.push(wall(-2.5, -1.1, -2.5, 6.0, 'wallpaper'));
  walls.push(wall(-2.5, 7.1, -2.5, 9, 'wallpaper'));

  // Divisória leste (x = 2.5): vãos para cozinha, banheiro e escritório.
  walls.push(wall(2.5, -9, 2.5, -4.6, 'wallpaper'));
  walls.push(wall(2.5, -3.5, 2.5, 0.2, 'wallpaper'));
  walls.push(wall(2.5, 1.3, 2.5, 6.0, 'wallpaper'));
  walls.push(wall(2.5, 7.1, 2.5, 9, 'wallpaper'));

  // Arco entre entrada e corredor (vão central de 2.6 m).
  walls.push(wall(-2.5, 4.5, -1.3, 4.5, 'wallpaper'));
  walls.push(wall(1.3, 4.5, 2.5, 4.5, 'wallpaper'));
  // Verga do arco: fecha o vão por cima e enquadra a boca do corredor.
  const lintel = P.box_(0, 4.5, 0, 2.6, 0.55, TI, 'wallpaper', { collide: false, y: 2.25 });

  // Divisórias internas restantes.
  walls.push(wall(-8, 1.5, -2.5, 1.5, 'wallpaper'));    // sala | quarto
  walls.push(wall(-8, -4.5, -2.5, -4.5, 'wallpaper'));  // quarto | arquivo
  walls.push(wall(2.5, 2.5, 8, 2.5, 'plaster'));        // cozinha | banheiro
  walls.push(wall(2.5, -1.5, 8, -1.5, 'plaster'));      // banheiro | escritório

  /* -------------------------------- cômodos ----------------------------- */

  const rooms = [
    { id: 'entrada', name: 'Entrada', min: [-2.5, 4.5], max: [2.5, 9], floor: 'floorWood', surface: 'wood' },
    { id: 'sala', name: 'Sala', min: [-8, 1.5], max: [-2.5, 9], floor: 'floorWood', surface: 'wood' },
    { id: 'cozinha', name: 'Cozinha', min: [2.5, 2.5], max: [8, 9], floor: 'floorTile', surface: 'tile' },
    { id: 'corredor', name: 'Corredor', min: [-2.5, -9], max: [2.5, 4.5], floor: 'floorWood', surface: 'wood' },
    { id: 'banheiro', name: 'Banheiro', min: [2.5, -1.5], max: [8, 2.5], floor: 'floorTile', surface: 'tile' },
    { id: 'escritorio', name: 'Escritório', min: [2.5, -9], max: [8, -1.5], floor: 'floorWood', surface: 'wood' },
    { id: 'quarto', name: 'Quarto de Helena', min: [-8, -4.5], max: [-2.5, 1.5], floor: 'floorWood', surface: 'wood' },
    { id: 'arquivo', name: 'Arquivo', min: [-8, -9], max: [-2.5, -4.5], floor: 'floorConcrete', surface: 'concrete' },
    { id: 'varanda', name: 'Varanda', min: [-3.2, 9], max: [3.2, 11], floor: 'wood', surface: 'wood', ceiling: false, outdoor: true },
  ];

  /* --------------------------------- portas ----------------------------- */

  const H = Math.PI / 2;
  const doors = [
    {
      id: 'porta_frente', hinge: [-0.65, 9], width: 1.3, closedRot: 0, openDelta: H,
      open: false, locked: true, key: 'chave_casa', label: 'Porta da frente',
      lockedText: 'Trancada. O trinco não cede — e a fechadura não parece nova.',
    },
    {
      id: 'porta_sala', hinge: [-2.5, 6.0], width: 1.1, closedRot: -H, openDelta: H,
      open: true, label: 'Porta da sala',
    },
    {
      id: 'porta_cozinha', hinge: [2.5, 7.1], width: 1.1, closedRot: H, openDelta: -H,
      open: true, label: 'Porta da cozinha',
    },
    {
      id: 'porta_banheiro', hinge: [2.5, 0.2], width: 1.1, closedRot: -H, openDelta: H,
      open: false, label: 'Porta do banheiro',
    },
    {
      id: 'porta_quarto', hinge: [-2.5, -2.2], width: 1.1, closedRot: -H, openDelta: H,
      open: false, label: 'Porta do quarto',
    },
    {
      id: 'porta_escritorio', hinge: [2.5, -4.6], width: 1.1, closedRot: -H, openDelta: H,
      open: false, locked: true, key: 'chave_escritorio', label: 'Porta do escritório',
      lockedText: 'Trancada por dentro da fechadura, com chave. Alguém quis fechar esta sala.',
    },
    {
      id: 'porta_arquivo', hinge: [-2.5, -7.2], width: 1.1, closedRot: -H, openDelta: H,
      open: false, locked: true, key: 'chave_arquivo', label: 'Porta do arquivo',
      lockedText: 'Trancada. Há uma etiqueta colada acima da maçaneta, ilegível de tão desbotada.',
    },
    {
      id: 'porta_fundos', hinge: [8, 4.3], width: 1.4, closedRot: -H, openDelta: -H,
      open: false, locked: true, key: null, label: 'Porta dos fundos',
      lockedText: 'Emperrada. A madeira inchou com a umidade e não se move um milímetro.',
    },
    {
      id: 'porta_porao', hinge: [-0.55, -8.84], width: 1.1, closedRot: 0, openDelta: H,
      open: false, locked: true, key: 'chave_porao', label: 'Porta do porão',
      lockedText: 'Um cadeado. Enferrujado por fora, limpo na parte de baixo — foi aberto há pouco tempo.',
    },
  ];

  /* -------------------------------- exterior ---------------------------- */

  const outside = [lintel];

  // Terreno e caminho de terra até a varanda.
  outside.push(P.ground(0, 0, 0, 90, 90, 'grass', [9, 9]));
  outside.push(P.ground(0, 0.02, 16, 2.2, 16, 'dirt', [1, 5]));   // caminho até a porta

  // Varanda de madeira.
  outside.push(P.box_(0, 10, 0, 6.4, 0.28, 2.0, 'wood', { uvScale: [1.6, 0.8], collide: false }));
  // Telhado da varanda + colunas.
  outside.push(P.box_(0, 10.1, 0, 6.8, 0.2, 2.4, 'wood', { uvScale: [1.6, 0.8], collide: false, y: 2.7 }));
  for (const cx of [-2.9, -1.0, 1.0, 2.9]) {
    outside.push(P.box_(cx, 10.9, 0, 0.16, 2.6, 0.16, 'wood', { collide: false }));
  }
  outside.push(P.flowerpot(2.2, 10.3));
  outside.push(P.flowerpot(-2.4, 10.3));

  // Telhado da casa (duas águas simplificadas em degraus — lido só de fora).
  for (let i = 0; i < 7; i++) {
    const inset = i * 0.62;
    outside.push(P.box_(0, 0, 0, 17.2 - inset * 1.6, 0.36, 19.2 - inset * 1.6, 'wood',
      { uvScale: [2, 2], collide: false, y: WH + 0.2 + i * 0.34, tint: [0.55, 0.5, 0.45] }));
  }

  // Cerca frontal, com o portão aberto.
  for (let x = -14; x <= 14; x += 1.6) {
    if (Math.abs(x) < 1.7) continue;
    outside.push(P.box_(x, 21, 0, 0.1, 1.15, 0.1, 'wood', { collide: false, tint: [0.5, 0.45, 0.4] }));
  }
  outside.push(P.box_(-8, 21, 0, 12.4, 0.08, 0.06, 'wood', { collide: false, y: 0.95, tint: [0.5, 0.45, 0.4] }));
  outside.push(P.box_(8, 21, 0, 12.4, 0.08, 0.06, 'wood', { collide: false, y: 0.95, tint: [0.5, 0.45, 0.4] }));

  // Árvores: cilindro + massa de copa. Vistas contra a névoa, bastam.
  const treeSpots = [[-13, 14], [12, 16], [-16, 4], [15, 2], [-11, -13], [13, -11], [-18, 20], [17, 19]];
  for (const [tx, tz] of treeSpots) {
    outside.push(P.box_(tx, tz, 0, 0.42, 4.6, 0.42, 'wood', { collide: true, tint: [0.5, 0.44, 0.36] }));
    outside.push(P.box_(tx, tz, 0.6, 3.2, 2.4, 3.2, 'grass',
      { collide: false, y: 4.2, tint: [0.42, 0.5, 0.36], uvScale: [1.4, 1.4] }));
  }

  // O carro de Laura, estacionado onde o caminho encontra o portão.
  outside.push(car(-0.2, 24.5, 0.06));

  // Janelas. Como as paredes são caixas opacas, cada abertura precisa de dois
  // conjuntos — um em cada face — senão a janela existe só de um dos lados.
  // `outward` é a direção do lado de fora naquela parede.
  const windowPair = (x, y, z, outward, w, h, moonlight) => {
    const half = TE / 2 + 0.02;
    const rotOut = Math.atan2(outward[0], outward[1]);
    const ox = x + outward[0] * half, oz = z + outward[1] * half;
    const ix = x - outward[0] * half, iz = z - outward[1] * half;
    // A face externa não carrega luz; quem ilumina o cômodo é a interna.
    outside.push(P.window_(ox, y, oz, rotOut, w, h, 0));
    outside.push(P.window_(ix, y, iz, rotOut + Math.PI, w, h, moonlight));
  };

  const SOUTH = [0, 1], NORTH = [0, -1], WEST = [-1, 0], EAST = [1, 0];
  windowPair(-5.2, 1.0, 9, SOUTH, 1.2, 1.35, 0.30);   // sala (fachada)
  windowPair(5.0, 1.0, 9, SOUTH, 1.2, 1.35, 0.30);    // cozinha (fachada)
  windowPair(-8, 1.0, 5.0, WEST, 1.2, 1.35, 0.34);    // sala
  windowPair(-8, 1.0, -1.6, WEST, 1.2, 1.35, 0.42);   // quarto de Helena
  windowPair(8, 1.0, 7.0, EAST, 1.2, 1.35, 0.34);     // cozinha
  windowPair(8, 1.2, -5.5, EAST, 1.0, 1.15, 0.40);    // escritório
  windowPair(0, 1.2, -9, NORTH, 1.0, 1.0, 0.22);      // fundo do corredor

  const outsideCombined = P.combine(...outside);
  props.push(...outsideCombined.parts);

  /* --------------------------------- SALA ------------------------------- */

  const sala = P.combine(
    P.rug(-5.2, 5.4, 0, 2.8, 2.0),
    P.sofa(-5.2, 3.4, Math.PI),
    P.armchair(-6.8, 6.2, -0.7),
    P.table(-5.2, 5.6, 0, 1.0, 0.6, 0.46),
    P.bookshelf(-7.5, 7.2, H, 1.4, 2.0),
    P.bookshelf(-7.5, 2.9, H, 1.0, 1.5),
    P.cabinet(-3.2, 8.4, Math.PI, 1.0, 0.9),
    P.radio(-3.2, 0.9, 8.4, Math.PI),
    P.floorLamp(-7.0, 4.2, 'luz_sala_pe', false),
    P.ceilingLamp(-5.2, 5.2, 'luz_sala', false),
    // Objetos de parede ficam na FACE interna e olham para dentro do cômodo:
    // a parede divisória ocupa x de -2.58 a -2.42, e a sala está à esquerda.
    P.wallClock(-2.68, 1.9, 4.0, -H),
    P.picture(-2.62, 1.5, 5.5, -H, 0.34, 0.44, 'paper', [0.8, 0.75, 0.62]),
    P.curtain(-7.78, 1.05, 5.0, H, 1.5, 1.6),
    P.paperStack(-5.2, 5.6, 0.3, 4, 0.46),
  );

  /* ------------------------------- COZINHA ------------------------------ */

  const cozinha = P.combine(
    P.counter(6.2, 8.6, Math.PI, 3.0),
    P.sink(4.2, 8.6, Math.PI),
    P.stove(7.4, 6.2, -H),
    P.fridge(3.2, 8.4, 0),
    P.table(5.4, 5.4, 0, 1.3, 0.85),
    P.chair(5.4, 6.5, Math.PI),
    P.chair(5.4, 4.3, 0),
    P.cabinet(7.5, 8.0, -H, 0.9, 0.8),
    P.ceilingLamp(5.4, 6.0, 'luz_cozinha', false),
    // Quadro de energia: o objetivo elétrico do capítulo 2. Fica num trecho de
    // parede livre — nada de móvel entre ele e a jogadora.
    P.box_(2.62, 4.5, -H, 0.34, 0.44, 0.12, 'metal', { collide: false, y: 1.5, tint: [0.6, 0.6, 0.55] }),
    P.curtain(7.78, 1.05, 7.0, -H, 1.4, 1.5, [0.5, 0.46, 0.4]),
  );

  /* ------------------------------- ENTRADA ------------------------------ */

  const entrada = P.combine(
    P.table(-1.8, 8.2, 0, 0.9, 0.4, 0.8),
    P.mirror(-2.40, 1.35, 8.2, H, 0.5, 0.7),
    P.rug(0, 7.6, 0, 1.6, 1.0, [0.4, 0.34, 0.3]),
    P.ceilingLamp(0, 7.0, 'luz_entrada', false),
    P.picture(2.40, 1.5, 7.9, -H, 0.3, 0.38, 'paper', [0.75, 0.7, 0.6]),
    P.paperStack(-1.8, 8.2, 0, 6, 0.8),   // correspondência acumulada de anos
  );

  /* ------------------------------- CORREDOR ----------------------------- */

  const corredorProps = [
    P.ceilingLamp(0, 1.5, 'luz_corredor_1', false),
    P.ceilingLamp(0, -5.5, 'luz_corredor_2', false),
    P.cabinet(-2.2, 3.0, H, 0.8, 0.85),
    P.wallClock(2.34, 1.95, -2.0, -H),
  ];
  // Galeria de retratos no corredor — a mesma parede que muda depois.
  // Ficam na face leste da divisória (x = -2.42) olhando para o corredor.
  const galleryY = 1.55;
  const galleryZ = [3.2, 2.2, 1.2, 0.2, -0.8];
  galleryZ.forEach((gz, i) => {
    const pic = P.picture(-2.40, galleryY + (i % 2) * 0.12, gz, H, 0.26, 0.32, 'photo0',
      [0.85, 0.82, 0.75]);
    pic.parts[1].galleryPhoto = true;   // o Sistema de Realidade repinta o conjunto
    corredorProps.push(pic);
  });
  const corredor = P.combine(...corredorProps);

  /* ------------------------------- BANHEIRO ----------------------------- */

  const banheiro = P.combine(
    P.toilet(7.4, 1.9, Math.PI),
    P.bathtub(6.6, -0.6, 0),
    P.sink(3.5, 2.1, Math.PI),
    P.mirror(3.5, 1.35, 2.42, Math.PI, 0.55, 0.7),
    P.ceilingLamp(5.4, 0.6, 'luz_banheiro', false),
    P.cabinet(3.2, -1.1, 0, 0.6, 0.7),
  );

  /* ---------------------------- QUARTO DE HELENA ------------------------ */

  const quarto = P.combine(
    P.bed(-6.4, -1.2, H),
    P.nightstand(-6.4, 0.4, 0),
    P.nightstand(-6.4, -2.8, 0),
    P.wardrobe(-3.3, -3.6, -H),
    P.bookshelf(-7.6, -3.4, H, 1.0, 1.6),
    P.rug(-4.6, -1.2, 0, 2.0, 1.6, [0.45, 0.36, 0.34]),
    P.desk(-3.4, 0.6, -H),
    P.chair(-4.3, 0.6, H),
    P.ceilingLamp(-5.2, -1.5, 'luz_quarto', false),
    P.picture(-7.80, 1.6, -0.2, H, 0.3, 0.4, 'photo0', [0.85, 0.8, 0.72]),
    P.curtain(-7.78, 1.05, -1.6, H, 1.4, 1.6, [0.46, 0.42, 0.4]),
    // A caixa de música, sobre a escrivaninha.
    P.box_(-3.55, 0.6, -H, 0.22, 0.14, 0.16, 'woodLight', { collide: false, y: 0.78, uvScale: [2, 2] }),
    P.paperStack(-3.30, 1.15, 0.2, 7, 0.78),
  );

  /* ------------------------------ ESCRITÓRIO ---------------------------- */

  const escritorio = P.combine(
    P.desk(6.0, -6.4, Math.PI),
    P.chair(6.0, -5.4, 0),
    // Disposição do tampo (x de 5.2 a 6.8, z de -6.78 a -6.02): os quatro
    // objetos ficam lado a lado, sem um cobrir a linha de mira do outro.
    P.typewriter(6.05, 0.78, -6.42, Math.PI + 0.1),
    P.tapeRecorder(5.42, 0.78, -6.62, Math.PI - 0.3),
    P.fileCabinet(3.1, -8.3, 0, 4),
    P.fileCabinet(3.9, -8.3, 0, 4),
    P.bookshelf(7.6, -3.6, -H, 1.6, 2.1),
    P.bookshelf(7.6, -7.0, -H, 1.2, 2.1),
    P.ceilingLamp(5.4, -5.2, 'luz_escritorio', false),
    P.floorLamp(3.3, -2.6, 'luz_escritorio_pe', false),
    P.crate(3.2, -5.0, 0.4, 0.55),
    P.crate(3.3, -5.6, -0.2, 0.45),
    P.paperStack(3.9, -4.4, 0.4, 9),
    // A FOTOGRAFIA: no canto direito do tampo, isolada dos outros objetos.
    // O prop recebe um id porque o Sistema de Realidade troca sua textura.
    photoFrame(6.62, 0.78, -6.62, Math.PI + 0.25, 'foto_escrivaninha'),
  );

  /* -------------------------------- ARQUIVO ----------------------------- */

  // Arquivo: entulhado de propósito, mas com um corredor de circulação no
  // meio — tudo encostado nas paredes.
  const arquivo = P.combine(
    P.fileCabinet(-7.6, -8.4, 0, 4),
    P.fileCabinet(-6.9, -8.4, 0, 4),
    P.fileCabinet(-6.2, -8.4, 0, 4),
    P.bookshelf(-7.6, -6.0, H, 1.6, 2.1),
    P.table(-3.4, -7.4, H, 1.6, 0.9),
    P.crate(-3.2, -5.2, 0.3, 0.6),
    P.ceilingLamp(-5.2, -6.8, 'luz_arquivo', false),
    P.paperStack(-3.4, -7.4, 0.1, 11, 0.76),
  );

  const roomProps = P.combine(sala, cozinha, entrada, corredor, banheiro, quarto, escritorio, arquivo);
  props.push(...roomProps.parts);

  const colliders = [
    ...outsideCombined.colliders,
    ...roomProps.colliders,
  ];
  const lights = [
    ...outsideCombined.lights,
    ...roomProps.lights,
  ];

  /* ----------------------------- interativos ---------------------------- */
  // `action` é sempre um objeto serializável; a lógica vive no Interaction.

  interactables.push(
    /* ---------- exterior ---------- */
    {
      id: 'carro', pos: [-0.2, 0.9, 24.5], size: [4.4, 1.6, 2.0],
      label: 'O carro', verb: 'Examinar',
      action: { type: 'examine', text: 'Deixei o motor esfriar. As chaves estão no meu bolso. Não sei por que confiro isso três vezes.' },
    },
    {
      id: 'caixa_correio', pos: [1.9, 1.05, 20.6], size: [0.4, 0.35, 0.3],
      label: 'Caixa de correio', verb: 'Abrir',
      action: { type: 'examine', text: 'Vazia. Mas não tem uma folha sequer de mato crescendo no poste — alguém andou por aqui.' },
    },
    {
      id: 'carta_mao', pos: [0, 1.2, 18.5], size: [0.01, 0.01, 0.01],
      label: 'A carta', verb: 'Ler', hidden: true,
      action: { type: 'read', doc: 'carta_convite' },
    },
    {
      id: 'vaso_varanda', pos: [2.2, 0.2, 10.3], size: [0.45, 0.5, 0.45],
      label: 'Vaso de planta', verb: 'Olhar embaixo',
      action: { type: 'pickup', item: 'chave_casa', clue: 'chave_no_lugar' },
    },
    {
      id: 'vaso_varanda2', pos: [-2.4, 0.2, 10.3], size: [0.45, 0.5, 0.45],
      label: 'Vaso de planta', verb: 'Olhar embaixo',
      action: { type: 'examine', text: 'Terra seca e um caramujo vazio. Nada mais.' },
    },
    {
      id: 'placa_varanda', pos: [-1.0, 1.9, 9.2], size: [0.5, 0.3, 0.1],
      label: 'Placa na parede', verb: 'Ler',
      action: { type: 'examine', text: '"VASQUES". Esmaltada, torta, presa com um prego só. Ninguém tira a placa de uma casa que ainda espera alguém.' },
    },

    /* ---------- entrada ---------- */
    {
      id: 'interruptor_entrada', pos: [2.38, 1.3, 8.3], size: [0.16, 0.24, 0.2],
      label: 'Interruptor', verb: 'Acionar',
      action: { type: 'switch', light: 'luz_entrada' },
    },
    {
      id: 'correspondencia', pos: [-1.8, 0.9, 8.2], size: [0.7, 0.3, 0.4],
      label: 'Correspondência', verb: 'Examinar',
      action: { type: 'read', doc: 'conta_luz' },
    },
    {
      id: 'espelho_entrada', pos: [-2.42, 1.7, 8.2], size: [0.12, 0.8, 0.6],
      label: 'Espelho', verb: 'Olhar',
      action: { type: 'script', id: 'espelho_entrada' },
    },

    /* ---------- sala ---------- */
    {
      id: 'interruptor_sala', pos: [-2.62, 1.3, 5.0], size: [0.16, 0.24, 0.2],
      label: 'Interruptor', verb: 'Acionar',
      action: { type: 'switch', light: 'luz_sala' },
    },
    {
      id: 'radio_sala', pos: [-3.2, 1.0, 8.4], size: [0.4, 0.3, 0.3],
      label: 'Rádio', verb: 'Ligar',
      action: { type: 'script', id: 'radio' },
    },
    {
      id: 'estante_sala', pos: [-7.5, 1.2, 7.2], size: [0.5, 2.0, 1.5],
      label: 'Estante', verb: 'Examinar',
      action: { type: 'read', doc: 'recorte_jornal' },
    },
    {
      id: 'mesa_sala', pos: [-5.2, 0.5, 5.6], size: [1.1, 0.4, 0.7],
      label: 'Papéis sobre a mesa', verb: 'Examinar',
      action: { type: 'read', doc: 'ficha_policial' },
    },
    {
      id: 'sofa_sala', pos: [-5.2, 0.5, 3.4], size: [2.0, 1.0, 0.9],
      label: 'Sofá', verb: 'Examinar',
      action: { type: 'examine', text: 'A poeira está uniforme no encosto, mas o assento da esquerda tem uma depressão limpa. Alguém sentou aqui. Não há vinte e sete anos.' },
    },
    {
      id: 'relogio_sala', pos: [-2.66, 1.9, 4.0], size: [0.3, 0.4, 0.4],
      label: 'Relógio de parede', verb: 'Examinar',
      action: { type: 'script', id: 'relogio' },
    },

    /* ---------- cozinha ---------- */
    {
      id: 'quadro_luz', pos: [2.66, 1.5, 4.5], size: [0.24, 0.55, 0.45],
      label: 'Quadro de energia', verb: 'Abrir',
      action: { type: 'script', id: 'energia' },
    },
    {
      id: 'geladeira', pos: [3.2, 1.3, 8.4], size: [0.85, 1.7, 0.8],
      label: 'Geladeira', verb: 'Examinar',
      action: { type: 'read', doc: 'bilhete_geladeira', clue: 'bilhete_geladeira' },
    },
    {
      id: 'pia_cozinha', pos: [4.2, 0.95, 8.6], size: [0.8, 0.4, 0.7],
      label: 'Pia', verb: 'Examinar',
      action: { type: 'script', id: 'pia' },
    },
    {
      id: 'mesa_cozinha', pos: [5.4, 0.8, 5.4], size: [1.4, 0.3, 0.9],
      label: 'Mesa da cozinha', verb: 'Examinar',
      action: { type: 'examine', text: 'Duas xícaras. Uma virada para baixo, escorrida há muito tempo. A outra em pé, com um anel escuro seco no fundo. Duas.' },
    },
    {
      id: 'interruptor_cozinha', pos: [2.66, 1.3, 5.6], size: [0.16, 0.24, 0.2],
      label: 'Interruptor', verb: 'Acionar',
      action: { type: 'switch', light: 'luz_cozinha' },
    },

    /* ---------- corredor ---------- */
    {
      id: 'galeria_corredor', pos: [-2.42, 1.7, 1.2], size: [0.15, 1.2, 4.6],
      label: 'Retratos no corredor', verb: 'Examinar',
      action: { type: 'script', id: 'galeria' },
    },
    {
      id: 'interruptor_corredor', pos: [2.38, 1.3, 3.8], size: [0.16, 0.24, 0.2],
      label: 'Interruptor', verb: 'Acionar',
      action: { type: 'switch', light: 'luz_corredor_1' },
    },
    {
      id: 'armario_corredor', pos: [-2.2, 0.5, 3.0], size: [0.5, 0.9, 0.9],
      label: 'Armário do corredor', verb: 'Abrir',
      action: { type: 'read', doc: 'lista_helena' },
    },

    /* ---------- banheiro ---------- */
    {
      id: 'espelho_banheiro', pos: [3.5, 1.7, 2.42], size: [0.6, 0.8, 0.15],
      label: 'Espelho do banheiro', verb: 'Olhar',
      action: { type: 'script', id: 'espelho_banheiro' },
    },
    {
      id: 'banheira', pos: [6.6, 0.4, -0.6], size: [0.9, 0.8, 1.8],
      label: 'Banheira', verb: 'Examinar',
      action: { type: 'examine', text: 'Seca. Uma marca de nível a meia altura, escura, perfeitamente reta. Ficou cheia por muito tempo antes de alguém puxar a válvula.' },
    },
    {
      id: 'armario_banheiro', pos: [3.2, 0.5, -1.1], size: [0.65, 0.8, 0.5],
      label: 'Armário', verb: 'Abrir',
      action: { type: 'read', doc: 'receita_medica', clue: 'remedios' },
    },

    /* ---------- quarto de Helena ---------- */
    {
      id: 'interruptor_quarto', pos: [-2.62, 1.3, -2.6], size: [0.16, 0.24, 0.2],
      label: 'Interruptor', verb: 'Acionar',
      action: { type: 'switch', light: 'luz_quarto' },
    },
    {
      id: 'criado_mudo', pos: [-6.4, 0.4, 0.4], size: [0.55, 0.7, 0.5],
      label: 'Criado-mudo', verb: 'Abrir a gaveta',
      action: { type: 'read', doc: 'diario_helena_1' },
    },
    {
      id: 'cama_helena', pos: [-6.4, 0.4, -1.2], size: [2.2, 0.8, 1.6],
      label: 'A cama', verb: 'Olhar embaixo do colchão',
      action: { type: 'pickup', item: 'chave_pequena' },
    },
    {
      id: 'guarda_roupa', pos: [-3.3, 1.0, -3.6], size: [0.7, 2.0, 1.3],
      label: 'Guarda-roupa', verb: 'Abrir',
      action: { type: 'script', id: 'guarda_roupa' },
    },
    {
      id: 'caixa_musica', pos: [-3.55, 0.85, 0.6], size: [0.3, 0.3, 0.3],
      label: 'Caixa de música', verb: 'Abrir',
      requires: { item: 'chave_pequena' },
      lockedText: 'Tem uma fechadura minúscula. Precisa de uma chave do tamanho de uma unha.',
      action: { type: 'script', id: 'caixa_musica' },
    },
    {
      id: 'escrivaninha_quarto', pos: [-3.4, 0.4, 0.6], size: [0.9, 0.5, 1.7],
      label: 'Escrivaninha', verb: 'Examinar',
      action: { type: 'read', doc: 'diario_helena_2' },
    },
    {
      id: 'retrato_quarto', pos: [-7.78, 1.8, -0.2], size: [0.18, 0.5, 0.4],
      label: 'Retrato na parede', verb: 'Examinar',
      action: { type: 'photo', photo: 'retrato_quarto', doc: 'foto_parede' },
    },

    /* ---------- escritório ---------- */
    {
      id: 'interruptor_escritorio', pos: [2.66, 1.3, -3.2], size: [0.16, 0.24, 0.2],
      label: 'Interruptor', verb: 'Acionar',
      action: { type: 'switch', light: 'luz_escritorio' },
    },
    {
      id: 'carta_escrivaninha', pos: [5.45, 0.84, -6.22], size: [0.42, 0.16, 0.34],
      label: 'Carta sobre a escrivaninha', verb: 'Ler',
      action: { type: 'read', doc: 'carta_1998', clue: 'carta_impossivel' },
    },
    {
      // AABB colado na malha: um volume folgado aqui roubaria a mira da
      // fotografia, que fica no mesmo tampo.
      id: 'maquina_escrever', pos: [6.05, 0.92, -6.42], size: [0.38, 0.3, 0.32],
      label: 'Máquina de escrever', verb: 'Examinar',
      action: { type: 'script', id: 'maquina' },
    },
    {
      id: 'gravador', pos: [5.42, 0.84, -6.62], size: [0.32, 0.16, 0.26],
      label: 'Gravador', verb: 'Ouvir a fita',
      action: { type: 'tape', tape: 'fita_01' },
    },
    {
      id: 'fotografia', pos: [6.62, 0.93, -6.62], size: [0.32, 0.3, 0.28],
      label: 'Fotografia', verb: 'Pegar',
      action: { type: 'photo', photo: 'foto_escrivaninha', doc: 'foto_escrivaninha' },
    },
    {
      id: 'arquivo_aco_1', pos: [3.1, 0.7, -8.3], size: [0.6, 1.5, 0.7],
      label: 'Arquivo de aço', verb: 'Abrir',
      action: { type: 'read', doc: 'pasta_visitante' },
    },
    {
      id: 'gaveta_escrivaninha', pos: [6.5, 0.4, -6.4], size: [0.6, 0.66, 0.8],
      label: 'Gaveta da escrivaninha', verb: 'Abrir',
      action: { type: 'script', id: 'gaveta_escritorio' },
    },
  );

  // Plataformas: a casa assenta sobre um alicerce e a varanda tem um degrau.
  // O jogador sobe por interpolação suave, sem física vertical de verdade.
  const platforms = [
    { min: [-8.4, -9.4], max: [8.4, 9.4], y: 0.28 },     // interior
    { min: [-3.2, 9], max: [3.2, 11.1], y: 0.28 },       // varanda
    { min: [-1.7, 11.1], max: [1.7, 11.7], y: 0.14 },    // degrau
  ];

  return {
    wallHeight: WH,
    spawn: { position: [0, 1.68, 26], yaw: 0 },
    rooms, walls, doors, props, colliders, lights, interactables, platforms,
  };
}

/* ------------------------------- auxiliares ------------------------------ */

/** O carro de Laura. Vago o bastante para ser "um sedã velho qualquer". */
function car(x, z, rot = 0) {
  const p = P.box_(x, z, rot, 1.82, 0.62, 4.3, 'metal',
    { collide: true, y: 0.32, tint: [0.34, 0.36, 0.40], uvScale: [1, 1] });
  p.box(1.68, 0.56, 2.0, 0, 0.94, -0.2, 'glass', { tint: [0.24, 0.28, 0.34], gloss: 0.5 });
  p.box(1.86, 0.30, 4.34, 0, 0.18, 0, 'metal', { tint: [0.2, 0.2, 0.22] });
  for (const [wx, wz] of [[-0.86, 1.42], [0.86, 1.42], [-0.86, -1.42], [0.86, -1.42]]) {
    p.cyl(0.33, 0.22, wx, 0.0, wz, 'black', { tint: [0.28, 0.28, 0.3], segments: 12 });
  }
  // Faróis apagados: um detalhe que o jogador confere sem perceber que confere.
  p.box(0.34, 0.16, 0.06, -0.6, 0.62, 2.13, 'glass', { tint: [0.6, 0.6, 0.55], emissive: 0.15 });
  p.box(0.34, 0.16, 0.06, 0.6, 0.62, 2.13, 'glass', { tint: [0.6, 0.6, 0.55], emissive: 0.15 });
  return p;
}

/** Porta-retrato apoiado: moldura + a fotografia (textura trocável). */
function photoFrame(x, y, z, rot, id) {
  const p = P.picture(x, y, z, rot, 0.26, 0.2, 'photo0', [1, 1, 1]);
  // A peça do painel é a segunda; marcá-la permite ao Sistema de Realidade
  // trocar a textura sem reconstruir nada.
  p.parts[1].photoOf = id;
  p.box(0.06, 0.16, 0.03, 0, 0, -0.04, 'wood');   // pé de apoio
  return p;
}
