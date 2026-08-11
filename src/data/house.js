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

// Escada do porão: 12 degraus a partir de z = -9.4, descendo até PORAO_Y.
const STEPS = 12, RUN = 0.32, RISE = 0.24;
const STAIR_TOP_Z = -9.4;
const PORAO_Y = 0.28 - STEPS * RISE;              // -2.6
const STAIR_END_Z = STAIR_TOP_Z - STEPS * RUN;    // -13.24

// Origem do sótão, deslocada para longe da casa (ver comentário em `rooms`).
const SOTAO_X = 120;

/** Segmento de parede alinhado aos eixos. */
function wall(x1, z1, x2, z2, tex = 'plaster', thick = TI, h = WH, baseY) {
  return { x1, z1, x2, z2, tex, thick, h, baseY };
}

export function buildHouse() {
  const walls = [];
  const props = [];
  const interactables = [];

  /* ------------------------------ estrutura ----------------------------- */

  // Fachada sul, com o vão da porta de entrada (x de -0.65 a 0.65).
  walls.push(wall(-8, 9, -0.65, 9, 'plaster', TE));
  walls.push(wall(0.65, 9, 8, 9, 'plaster', TE));
  // Fundos, com o vão da porta do porão (x de -0.6 a 0.6). Oeste inteiriça.
  walls.push(wall(-8, -9, -0.6, -9, 'plaster', TE));
  walls.push(wall(0.6, -9, 8, -9, 'plaster', TE));
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

  /* ------------------- caixa da escada e porão -------------------------- */
  // A escada desce por um anexo colado aos fundos da casa. O anexo nunca é
  // visto de fora (a sebe fecha o quintal antes dele), então só precisa vedar
  // a visão de quem está descendo.
  const ANEXO_TOPO = 2.6;
  walls.push(wall(-1.4, -9.16, -1.4, -13.4, 'brick', TI, ANEXO_TOPO - PORAO_Y, PORAO_Y));
  walls.push(wall(1.4, -9.16, 1.4, -13.4, 'brick', TI, ANEXO_TOPO - PORAO_Y, PORAO_Y));
  // Testeiras que emendam o anexo na parede dos fundos, ladeando a porta.
  walls.push(wall(-1.4, -9.16, -0.6, -9.16, 'brick', TI, ANEXO_TOPO - 0.28, 0.28));
  walls.push(wall(0.6, -9.16, 1.4, -9.16, 'brick', TI, ANEXO_TOPO - 0.28, 0.28));
  // Fundo do anexo: fecha só a parte acima do teto do porão, deixando a
  // passagem livre embaixo.
  walls.push(wall(-1.4, -13.4, 1.4, -13.4, 'brick', TI, ANEXO_TOPO + 0.3, -0.3));

  /* ----------------------------- sótão ---------------------------------- */
  const SH = 2.1;
  walls.push(wall(SOTAO_X - 3, -4, SOTAO_X + 3, -4, 'wood', TI, SH, 0));
  walls.push(wall(SOTAO_X - 3, 4, SOTAO_X + 3, 4, 'wood', TI, SH, 0));
  walls.push(wall(SOTAO_X - 3, -4, SOTAO_X - 3, 4, 'wood', TI, SH, 0));
  walls.push(wall(SOTAO_X + 3, -4, SOTAO_X + 3, 4, 'wood', TI, SH, 0));

  // Paredes do porão (baseY explícito: aqui embaixo o piso é outro).
  const PH = 2.3;
  walls.push(wall(-6.5, -20.5, 6.5, -20.5, 'brick', TE, PH, PORAO_Y));
  walls.push(wall(-6.5, -20.5, -6.5, -13.24, 'brick', TE, PH, PORAO_Y));
  walls.push(wall(6.5, -20.5, 6.5, -13.24, 'brick', TE, PH, PORAO_Y));
  // Parede da frente do porão, com o vão por onde a escada chega.
  walls.push(wall(-6.5, -13.24, -1.4, -13.24, 'brick', TE, PH, PORAO_Y));
  walls.push(wall(1.4, -13.24, 6.5, -13.24, 'brick', TE, PH, PORAO_Y));

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
    // A escada não ganha piso automático: quem define a altura são os degraus.
    { id: 'escada', name: 'Escada do porão', min: [-1.3, -13.3], max: [1.3, -9.4], surface: 'wood', noFloor: true, ceiling: false },
    // O porão fica ao norte da casa, não literalmente sob ela. O jogador nunca
    // vê os dois espaços ao mesmo tempo, e no nível 4 de realidade uma planta
    // que não fecha é tema, não defeito. Pé-direito baixo (2.3) para que o teto
    // fique abaixo do gramado externo.
    { id: 'porao', name: 'Porão', min: [-6.5, -20.5], max: [6.5, -13.3], floor: 'floorConcrete', surface: 'concrete', baseY: PORAO_Y, height: 2.3, ceilingTex: 'wood' },
    // O sótão fica longe de tudo em espaço de mundo e é alcançado por
    // transição com fade, não por geometria contínua. É exatamente como o
    // SceneFlow do Godot vai tratá-lo: um cômodo é uma cena, não um andar.
    // Isso evita furar o teto do corredor e uma escada de gato impossível de
    // subir sem física vertical de verdade.
    { id: 'sotao', name: 'Sótão', min: [SOTAO_X - 3, -4], max: [SOTAO_X + 3, 4], floor: 'wood', surface: 'wood', height: 2.1, ceilingTex: 'wood' },
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
      // Abre para dentro do vão da escada (openDelta positivo leva a porta
      // para -z), para não travar quem está no corredor.
      id: 'porta_porao', hinge: [-0.6, -9], width: 1.2, closedRot: 0, openDelta: H,
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

  /* ------------------ anexo da escada, escada e porão ------------------- */

  // Cobertura do anexo: veda o vão da escada por cima.
  outside.push(P.box_(0, -11.3, 0, 3.4, 0.24, 4.5, 'wood',
    { collide: false, y: 2.6, uvScale: [1.4, 1.4], tint: [0.5, 0.45, 0.4] }));
  // Degraus (visuais: a altura de quem desce vem das plataformas).
  outside.push(P.staircase(0, STAIR_TOP_Z, STEPS, RUN, RISE, 2.6));
  // Corrimão de um lado só, encostado na parede.
  for (let i = 0; i < STEPS; i += 2) {
    outside.push(P.box_(1.28, STAIR_TOP_Z - i * RUN - RUN, 0, 0.06, 0.9, 0.06, 'wood',
      { collide: false, y: 0.28 - (i + 1) * RISE, tint: [0.45, 0.4, 0.34] }));
  }

  // Sebe que fecha o quintal: sem ela o jogador contorna a casa e cai dentro
  // do volume do porão, que fica sob o gramado dos fundos.
  const sebe = (x1, z1, x2, z2) => P.box_((x1 + x2) / 2, (z1 + z2) / 2, 0,
    Math.max(Math.abs(x2 - x1), 0.5), 2.0, Math.max(Math.abs(z2 - z1), 0.5), 'grass',
    { collide: true, uvScale: [1.6, 1.6], tint: [0.34, 0.4, 0.3] });
  outside.push(sebe(-9.5, -9.5, -9.5, 20.5));
  outside.push(sebe(9.5, -9.5, 9.5, 20.5));
  outside.push(sebe(-9.5, -9.5, -1.4, -9.5));
  outside.push(sebe(1.4, -9.5, 9.5, -9.5));

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
    // A segunda cadeira da cozinha vive em `mutaveis`: ela muda de cômodo.
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
    // A correspondência ocupa só a metade direita do aparador: a esquerda fica
    // livre para a chave que aparece no capítulo 6, senão uma cobre a mira da
    // outra e o item vira inalcançável.
    P.paperStack(-1.62, 8.2, 0, 6, 0.8),
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
    // A caixa de música vive em `mutaveis`: ela muda de cômodo no capítulo 6.
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
    // A mesa fica recuada contra a parede dos fundos: encostada no vão da
    // porta (x -2.5, z -7.2 a -6.1) ela estrangulava a entrada do cômodo.
    P.table(-4.4, -8.0, 0, 1.6, 0.9),
    P.crate(-3.2, -5.2, 0.3, 0.6),
    P.ceilingLamp(-5.2, -6.8, 'luz_arquivo', false),
    P.paperStack(-4.4, -8.0, 0.1, 11, 0.76),
  );

  /* --------------------------------- PORÃO ------------------------------ */
  // Frio e quase vazio — o peso vem do que está arrumado demais para um porão
  // abandonado. Props de porão nascem em PORAO_Y, não em zero.
  // Rebaixa um prop para o nível do porão. Precisa mover as luzes junto —
  // uma luminária cujo corpo desce e cuja luz fica no nível do térreo
  // iluminaria o gramado a partir de dentro da terra.
  const py = (p) => {
    for (const part of p.parts) part.position[1] += PORAO_Y;
    for (const light of p.lights) light.position[1] += PORAO_Y;
    for (const col of p.colliders) col.baseY = (col.baseY || 0) + PORAO_Y;
    return p;
  };

  const porao = P.combine(
    py(P.bookshelf(-6.2, -16.0, H, 1.4, 1.8)),
    py(P.fileCabinet(-6.1, -18.6, 0, 3)),
    py(P.crate(-4.6, -19.4, 0.2, 0.6)),
    py(P.crate(-3.9, -19.6, -0.3, 0.5)),
    py(P.crate(5.4, -19.2, 0.4, 0.55)),
    py(P.table(4.6, -15.4, -H, 1.6, 0.8)),
    py(P.paperStack(4.6, -15.4, 0.1, 8, 0.76)),
    py(P.ceilingLamp(0, -16.5, 'luz_porao', false, 2.05)),
    // O quadro que fecha o capítulo: um colchão no chão, uma cadeira virada
    // para a parede do fundo e um lampião. Alguém ficou aqui. Não em 1998.
    py(P.box_(0.4, -18.8, 0.1, 1.9, 0.16, 0.9, 'fabric',
      { collide: false, uvScale: [1.2, 1.2], tint: [0.55, 0.5, 0.44] })),
    py(P.box_(-0.5, -18.6, 0.1, 0.5, 0.12, 0.3, 'fabric',
      { collide: false, tint: [0.72, 0.68, 0.6] })),
    py(P.chair(1.2, -16.6, Math.PI)),
    py(P.box_(-1.6, -17.4, 0, 0.2, 0.3, 0.2, 'metal',
      { collide: false, tint: [0.5, 0.46, 0.4] })),
    // O poço — prometido lá atrás no índice de Helena, em "C — casa
    // (reformas, contas, o poço)". A laje está de lado: alguém já a moveu.
    py(P.well(-3.2, -17.0)),
    py(P.tag(P.wellSlab(-3.2, -17.0), 'laje_poco', true)),
    py(P.tag(P.wellSlab(-4.3, -17.4, 0.4), 'laje_deslocada', false)),
  );

  /* --------------------------------- SÓTÃO ------------------------------ */
  // Duas cadeiras, frente a frente. Uma tem vinte e sete anos de poeira; a
  // outra tem o assento gasto de uso. Todo o capítulo 9 sai dessa diferença.
  const sx = SOTAO_X;
  const sotao = P.combine(
    P.chair(sx - 0.9, 0, H),          // a de Helena — voltada para +x
    P.chair(sx + 0.9, 0, -H),         // a da visitante — voltada para -x
    // Camada de poeira sobre o assento da cadeira intocada.
    P.box_(sx + 0.9, 0, 0, 0.42, 0.012, 0.42, 'white',
      { collide: false, y: 0.5, tint: [0.62, 0.60, 0.55] }),
    // A mesinha fica encostada na empena oeste: no meio do sótão ela fechava
    // o único corredor entre a escada e o relógio.
    P.table(sx - 2.1, 0.6, 0, 0.7, 0.5, 0.55),
    P.tapeRecorder(sx - 2.1, 0.55, 0.6, H),
    P.wallClock(sx, 1.5, -3.85, 0),
    P.crate(sx - 2.2, -2.8, 0.3, 0.55),
    P.crate(sx + 2.1, -3.0, -0.2, 0.5),
    P.crate(sx + 2.2, 3.0, 0.4, 0.6),
    P.paperStack(sx - 2.2, -2.8, 0.2, 6, 0.44),
    P.box_(sx - 2.4, 2.6, 0, 0.5, 0.06, 0.36, 'paper',
      { collide: false, y: 0.02, uvScale: [1, 1] }),   // a folha, no chão
    // Vigas do telhado, à altura da cabeça: o sótão tem que apertar.
    P.box_(sx, -2.0, 0, 6.0, 0.14, 0.16, 'wood', { collide: false, y: 1.86 }),
    P.box_(sx, 0.0, 0, 6.0, 0.14, 0.16, 'wood', { collide: false, y: 1.86 }),
    P.box_(sx, 2.0, 0, 6.0, 0.14, 0.16, 'wood', { collide: false, y: 1.86 }),
    // Óculo na empena: a única luz daqui.
    P.window_(sx, 1.1, -4.1, Math.PI, 0.7, 0.7, 0.5),
  );

  /* ---------------------- objetos que trocam de lugar ------------------- */
  // Cada objeto móvel existe em duas cópias, uma por destino. O Sistema de
  // Realidade apaga uma e acende a outra enquanto o jogador está em outro
  // cômodo. Nunca há transformação em runtime — só um estado que já mudou.
  const mutaveis = P.combine(
    P.tag(P.chair(5.4, 4.3, 0), 'cadeira_cozinha', true),
    // Virada para a porta do porão, mas recuada: a poucos passos dela ela
    // fecharia o único caminho até a porta.
    P.tag(P.chair(0, -6.6, Math.PI), 'cadeira_corredor', false),

    P.tag(P.box_(-3.55, 0.6, -H, 0.22, 0.14, 0.16, 'woodLight',
      { collide: false, y: 0.78, uvScale: [2, 2] }), 'caixa_musica_quarto', true),
    P.tag(P.box_(-1.55, 8.2, 0.3, 0.22, 0.14, 0.16, 'woodLight',
      { collide: false, y: 0.8, uvScale: [2, 2] }), 'caixa_musica_entrada', false),

    // A chave do arquivo, sobre o aparador da entrada. Não estava ali antes.
    P.tag(P.box_(-2.14, 8.15, 0.5, 0.08, 0.012, 0.03, 'metal',
      { collide: false, y: 0.81, tint: [0.8, 0.76, 0.62], gloss: 0.4 }),
    'chave_arquivo_visivel', false),
  );

  const roomProps = P.combine(sala, cozinha, entrada, corredor, banheiro, quarto,
    escritorio, arquivo, porao, sotao, mutaveis);
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
      // Vira a saída do jogo (Final D) quando a realidade passa do nível 4.
      // Até lá, é só um carro.
      id: 'carro', pos: [-0.2, 0.9, 24.5], size: [4.4, 1.6, 2.0],
      label: 'O carro', verb: 'Examinar',
      action: { type: 'script', id: 'partir' },
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
      id: 'correspondencia', pos: [-1.62, 0.92, 8.2], size: [0.46, 0.3, 0.36],
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

    /* ---------- capítulo 6: o que aparece ---------- */
    {
      // Sobre o aparador da entrada, onde Laura já vasculhou a correspondência.
      id: 'chave_arquivo_aparece', pos: [-2.14, 0.87, 8.15], size: [0.22, 0.18, 0.24],
      label: 'Chave sobre o aparador', verb: 'Pegar', hidden: true,
      action: { type: 'pickup', item: 'chave_arquivo', clue: 'chave_aparecida' },
    },
    {
      id: 'caixa_musica_entrada', pos: [-1.55, 0.87, 8.2], size: [0.3, 0.24, 0.26],
      label: 'Caixa de música', verb: 'Examinar', hidden: true,
      action: { type: 'script', id: 'caixa_musica_mudou' },
    },
    {
      id: 'cadeira_corredor', pos: [0, 0.75, -6.6], size: [0.7, 1.1, 0.7],
      label: 'Cadeira no corredor', verb: 'Examinar', hidden: true,
      action: { type: 'script', id: 'cadeira_corredor' },
    },

    /* ---------- arquivo ---------- */
    {
      id: 'arquivo_gavetas', pos: [-6.9, 0.98, -8.4], size: [2.3, 1.5, 0.75],
      label: 'Arquivos de aço', verb: 'Abrir as gavetas',
      action: { type: 'script', id: 'arquivo_gavetas' },
    },
    {
      id: 'arquivo_mesa', pos: [-4.4, 0.9, -8.0], size: [1.7, 0.4, 1.0],
      label: 'Caixas sobre a mesa', verb: 'Examinar',
      action: { type: 'read', doc: 'material_devolvido' },
    },
    {
      id: 'arquivo_estante', pos: [-7.6, 1.2, -6.0], size: [0.55, 2.0, 1.7],
      label: 'Estante do arquivo', verb: 'Examinar',
      action: { type: 'read', doc: 'indice_helena' },
    },
    {
      id: 'interruptor_arquivo', pos: [-2.62, 1.3, -5.4], size: [0.16, 0.24, 0.2],
      label: 'Interruptor', verb: 'Acionar',
      action: { type: 'switch', light: 'luz_arquivo' },
    },

    /* ---------- porão ---------- */
    {
      id: 'interruptor_porao', pos: [2.0, PORAO_Y + 1.2, -13.45], size: [0.16, 0.24, 0.2],
      label: 'Interruptor', verb: 'Acionar',
      action: { type: 'switch', light: 'luz_porao' },
    },
    {
      id: 'porao_colchao', pos: [0.4, PORAO_Y + 0.2, -18.8], size: [2.0, 0.6, 1.1],
      label: 'Colchão no chão', verb: 'Examinar',
      action: { type: 'script', id: 'porao_colchao' },
    },
    {
      id: 'porao_cadeira', pos: [1.2, PORAO_Y + 0.5, -16.6], size: [0.7, 1.1, 0.7],
      label: 'Cadeira', verb: 'Examinar',
      action: { type: 'script', id: 'porao_cadeira' },
    },
    {
      id: 'porao_lampiao', pos: [-1.6, PORAO_Y + 0.2, -17.4], size: [0.34, 0.44, 0.34],
      label: 'Lampião', verb: 'Examinar',
      action: { type: 'script', id: 'porao_lampiao' },
    },
    {
      id: 'porao_mesa', pos: [4.6, PORAO_Y + 0.85, -15.4], size: [1.7, 0.4, 0.9],
      label: 'Papéis sobre a mesa', verb: 'Examinar',
      // Duas pistas do mesmo papel: o que está escrito e a letra com que foi
      // escrito. A segunda é a que importa.
      action: { type: 'read', doc: 'caderno_porao', clue: 'letra_diferente' },
    },
    {
      id: 'porao_parede', pos: [1.2, PORAO_Y + 1.1, -20.32], size: [3.6, 1.8, 0.3],
      label: 'A parede do fundo', verb: 'Olhar',
      action: { type: 'script', id: 'porao_parede' },
    },

    /* ---------- capítulo 7: o destino de Helena ---------- */
    {
      id: 'porao_arquivo_c', pos: [-6.1, PORAO_Y + 0.55, -18.6], size: [0.7, 1.2, 0.8],
      label: 'Arquivo de aço', verb: 'Abrir',
      action: { type: 'read', doc: 'pasta_c_poco', clue: 'poco_lacrado' },
    },
    {
      id: 'porao_estante', pos: [-6.2, PORAO_Y + 1.0, -16.0], size: [0.6, 1.8, 1.5],
      label: 'Estante', verb: 'Examinar',
      action: { type: 'tape', tape: 'fita_02' },
    },
    {
      id: 'porao_poco', pos: [-3.2, PORAO_Y + 0.4, -17.0], size: [1.5, 0.9, 1.5],
      label: 'Tampa de concreto no chão', verb: 'Examinar',
      action: { type: 'script', id: 'poco' },
    },
    {
      // Só aparece depois que o poço é aberto.
      id: 'porao_caixa_g', pos: [-3.2, PORAO_Y + 0.45, -17.0], size: [1.0, 0.7, 1.0],
      label: 'Caixa dentro do poço', verb: 'Retirar', hidden: true,
      action: { type: 'read', doc: 'pasta_g', clue: 'pasta_g_existe' },
    },

    /* ---------- capítulo 8: a investigação vira sobre Laura ---------- */
    {
      // A pasta F estava no arquivo o tempo todo. Laura só volta a procurar
      // depois de descobrir que Helena catalogava a si mesma.
      id: 'arquivo_pasta_f', pos: [-3.2, 0.45, -5.2], size: [0.8, 0.9, 0.8],
      label: 'Caixa de papelão', verb: 'Abrir', hidden: true,
      action: { type: 'read', doc: 'pasta_f_sonhos' },
    },

    /* ---------- capítulo 9: o sótão ---------- */
    {
      // No teto do corredor. Só é notado quando Laura passa a procurar por si.
      id: 'alcapao', pos: [0, 2.86, -3.0], size: [1.1, 0.4, 1.1],
      label: 'Alçapão no teto', verb: 'Abrir', hidden: true,
      action: { type: 'script', id: 'subir_sotao' },
    },
    {
      id: 'sotao_descer', pos: [SOTAO_X, 0.4, 3.4], size: [1.2, 0.9, 1.0],
      label: 'A escada', verb: 'Descer',
      action: { type: 'script', id: 'descer_sotao' },
    },
    {
      id: 'sotao_cadeira_helena', pos: [SOTAO_X - 0.9, 0.55, 0], size: [0.75, 1.1, 0.75],
      label: 'A cadeira gasta', verb: 'Sentar',
      action: { type: 'script', id: 'sentar_helena' },
    },
    {
      id: 'sotao_cadeira_visitante', pos: [SOTAO_X + 0.9, 0.55, 0], size: [0.75, 1.1, 0.75],
      label: 'A cadeira com poeira', verb: 'Sentar',
      action: { type: 'script', id: 'sentar_visitante' },
    },
    {
      id: 'sotao_gravador', pos: [SOTAO_X - 2.1, 0.62, 0.6], size: [0.4, 0.24, 0.4],
      label: 'Gravador', verb: 'Ouvir a fita',
      action: { type: 'tape', tape: 'fita_03' },
    },
    {
      id: 'sotao_folha', pos: [SOTAO_X - 2.4, 0.12, 2.6], size: [0.6, 0.3, 0.5],
      label: 'Folha no chão', verb: 'Pegar',
      action: { type: 'read', doc: 'folha_12' },
    },
    {
      id: 'sotao_relogio', pos: [SOTAO_X, 1.55, -3.7], size: [0.4, 0.45, 0.4],
      label: 'Relógio', verb: 'Examinar',
      action: { type: 'script', id: 'relogio_sotao' },
    },
  );

  // Plataformas: a casa assenta sobre um alicerce e a varanda tem um degrau.
  // O jogador sobe por interpolação suave, sem física vertical de verdade.
  const platforms = [
    { min: [-8.4, -9.4], max: [8.4, 9.4], y: 0.28 },     // interior
    { min: [-3.2, 9], max: [3.2, 11.1], y: 0.28 },       // varanda
    { min: [-1.7, 11.1], max: [1.7, 11.7], y: 0.14 },    // degrau da varanda
  ];
  // Um patamar por degrau da escada do porão: sem física vertical de verdade,
  // é a interpolação de floorHeightAt que faz a descida parecer descida.
  for (let i = 0; i < STEPS; i++) {
    platforms.push({
      min: [-1.4, STAIR_TOP_Z - (i + 1) * RUN],
      max: [1.4, STAIR_TOP_Z - i * RUN],
      y: 0.28 - (i + 1) * RISE,
    });
  }
  platforms.push({ min: [-6.6, -20.6], max: [6.6, STAIR_END_Z], y: PORAO_Y });

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
