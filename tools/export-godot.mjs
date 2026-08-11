// export-godot.mjs — converte os dados do protótipo web para o formato que o
// GDD especifica para o projeto Godot (Seções 10, 13 e 14).
//
//     node tools/export-godot.mjs [pasta-de-saida]
//
// O protótipo web é a sala de escrita: é onde o mistério é testado e
// balanceado. Este script leva o resultado para a engine sem digitação manual
// — que é justamente onde erros de data e de id nasceriam, e o GDD avisa que
// "um erro de data quebra o terror".
//
// NOTA DE PROJETO — a tese não vem do documento, vem da conexão.
// O GDD se contradiz em dois pontos: a Seção 11.4 diz que "a tese com mais
// conexões fortes no clímax define o final", mas o esqueleto de
// clue_manager.gd (Seção 14.2) soma tese em open_document(), ou seja, no
// simples ato de LER. Isso faria o final ser decidido por quanto o jogador
// explorou, não por como ele interpretou — e dois jogadores completistas
// teriam sempre o mesmo final.
// Este exportador segue a Seção 11.4: as pistas saem com tese "neutra" e todo
// o peso vive nas conexões, que exigem um ato deliberado de leitura.

import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const SRC = resolve(HERE, '..', 'src');
const OUT = resolve(process.argv[2] || join(HERE, '..', 'godot-export'));

const imp = (rel) => import(pathToFileURL(join(SRC, rel)).href);

const { DOCUMENTS } = await imp('data/documents.js');
const { CLUES, CONNECTIONS, ITEMS } = await imp('data/clues.js');
const { CHAPTERS, ENDINGS } = await imp('data/chapters.js');
const { buildHouse } = await imp('data/house.js');

// Mapeamento das interpretações para as teses do GDD (Seção 9).
const TESE = { sobrenatural: 'A', psicologica: 'B', conspiracao: 'C' };

const write = (name, data) => {
  const path = join(OUT, name);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, JSON.stringify(data, null, 2) + '\n', 'utf8');
  const kb = (Buffer.byteLength(JSON.stringify(data)) / 1024).toFixed(1);
  console.log(`  ${name.padEnd(28)} ${kb.padStart(7)} kB`);
};

console.log(`Exportando para ${OUT}\n`);

/* ------------------------------- documentos ------------------------------ */
// Um arquivo por documento, como o GDD prevê em /data/documents/. Manter cada
// texto num arquivo separado permite editar prosa sem tocar num JSON gigante.

const documentos = {};
for (const [id, doc] of Object.entries(DOCUMENTS)) {
  const entry = {
    id,
    tipo: doc.type,
    titulo: doc.title,
    procedencia: doc.meta || '',
    paginas: doc.pages,
    // `corpo` é o texto corrido, para quem preferir ler o documento inteiro
    // de uma vez em vez de paginado.
    corpo: doc.pages.join('\n\n'),
    nota_laura: doc.lauraNote || '',
    pista: doc.clue || '',
  };
  // Versões alternativas por nível de realidade: reler o mesmo papel mais
  // tarde traz outro texto. O jogo nunca comenta isso.
  if (doc.alt) {
    entry.variantes = {};
    for (const [nivel, pages] of Object.entries(doc.alt)) {
      entry.variantes[nivel] = { paginas: pages, corpo: pages.join('\n\n') };
    }
  }
  if (doc.photoId) entry.foto_id = doc.photoId;
  documentos[id] = entry;
  write(join('documents', `${id}.json`), entry);
}
write('documents.json', documentos);

/* --------------------------------- pistas -------------------------------- */

const conexoesPorPista = {};
for (const c of CONNECTIONS) {
  (conexoesPorPista[c.a] ||= []).push(c.b);
  (conexoesPorPista[c.b] ||= []).push(c.a);
}

const pistas = {};
for (const [id, clue] of Object.entries(CLUES)) {
  pistas[id] = {
    id,
    numero: clue.n,
    titulo: clue.title,
    corpo: clue.text,
    tags: clue.tags || [],
    // Ver a nota de projeto no topo: o peso da tese vive na conexão.
    tese: 'neutra',
    conexoes_possiveis: conexoesPorPista[id] || [],
    textura: 'res://assets/ui/card_papel.png',
  };
}
write('clues.json', pistas);

/* -------------------------------- conexões ------------------------------- */

const conexoes = CONNECTIONS.map((c) => {
  const teses = {};
  for (const [k, v] of Object.entries(c.lean || {})) teses[TESE[k]] = v;
  return { a: c.a, b: c.b, titulo: c.title, corpo: c.text, teses };
});
write('connections.json', conexoes);

/* ------------------------- capítulos, finais, itens ---------------------- */

write('chapters.json', CHAPTERS.map((ch) => ({
  numero: ch.n,
  id: ch.id,
  titulo: ch.title,
  epigrafe: ch.epigraph || '',
  objetivo: ch.objective,
  nivel_realidade: ch.reality,
  monologo_inicial: (ch.onStart && ch.onStart.monologue) || [],
  avanca_quando: ch.advance || {},
  implementado: !ch.stub,
})));

write('endings.json', Object.fromEntries(Object.entries(ENDINGS).map(([id, e]) => [id, {
  id,
  titulo: e.title,
  tese: e.lean ? TESE[e.lean] : 'neutra',
  paragrafos: e.text,
  // A farpa: cada final contradiz a leitura que ele mesmo acabou de oferecer.
  farpa: e.splinter,
}])));

write('items.json', Object.fromEntries(Object.entries(ITEMS).map(([id, it]) => [id, {
  id, nome: it.name, descricao: it.desc, legivel: it.readable || '',
}])));

/* ---------------------------------- nível -------------------------------- */
// Geometria de props NÃO é exportada de propósito: no Godot ela vira modelos
// reais e um GridMap. O que atravessa é o que custa caro para redigitar —
// a planta, as portas com suas chaves e a colocação dos interativos.

const house = buildHouse();
write('level.json', {
  altura_pe_direito: house.wallHeight,
  spawn: house.spawn,
  comodos: house.rooms.map((r) => ({
    id: r.id, nome: r.name, min: r.min, max: r.max,
    piso: r.floor || null, superficie: r.surface,
    base_y: r.baseY !== undefined ? r.baseY : null,
    altura: r.height || null,
    externo: !!r.outdoor,
  })),
  paredes: house.walls,
  plataformas: house.platforms,
  portas: house.doors.map((d) => ({
    id: d.id, dobradica: d.hinge, largura: d.width,
    rot_fechada: d.closedRot, delta_abertura: d.openDelta,
    aberta: !!d.open, trancada: !!d.locked, chave: d.key || null,
    rotulo: d.label, texto_trancada: d.lockedText || '',
  })),
  interativos: house.interactables.map((it) => ({
    id: it.id, posicao: it.pos, tamanho: it.size,
    rotulo: it.label, verbo: it.verb || 'Examinar',
    oculto: !!it.hidden,
    exige: it.requires || null,
    texto_bloqueado: it.lockedText || '',
    acao: it.action,
  })),
  luzes: house.lights.filter((l) => l.id).map((l) => ({
    id: l.id, posicao: l.position, cor: l.color,
    alcance: l.range, intensidade: l.intensity, acesa: l.enabled !== false,
  })),
});

/* --------------------------------- resumo -------------------------------- */

const readme = `# Dados exportados — A Casa da Repórter

Gerado por \`tools/export-godot.mjs\` a partir do protótipo web.
**Não edite estes arquivos à mão**: edite \`src/data/\` e exporte de novo.

Copie o conteúdo desta pasta para \`/data/\` no projeto Godot.

| Arquivo | Conteúdo | Consumido por |
|---|---|---|
| \`clues.json\` | ${Object.keys(pistas).length} pistas | \`ClueManager\` |
| \`connections.json\` | ${conexoes.length} conexões válidas e seus pesos de tese | \`InvestigationBoard\` |
| \`documents.json\` + \`documents/*.json\` | ${Object.keys(documentos).length} documentos | \`DocumentViewer\` |
| \`chapters.json\` | ${CHAPTERS.length} capítulos | \`GameState\` |
| \`endings.json\` | ${Object.keys(ENDINGS).length} finais | \`EndingManager\` |
| \`items.json\` | ${Object.keys(ITEMS).length} itens | inventário |
| \`level.json\` | planta, portas, interativos, luzes | montagem das cenas |

## A tese vem da conexão, não do documento

O GDD se contradiz: a Seção 11.4 diz que a tese é definida pelas conexões
feitas no quadro, mas o \`clue_manager.gd\` da Seção 14.2 soma tese dentro de
\`open_document()\` — ou seja, no ato de simplesmente ler.

Somar no ato de ler faz o final ser decidido por **quanto o jogador explorou**,
não por **como ele interpretou**: dois jogadores completistas teriam sempre o
mesmo final, e o quadro de investigação viraria decoração.

Por isso as pistas saem daqui com \`tese: "neutra"\` e todo o peso vive em
\`connections.json\`. O \`ClueManager\` deve apenas coletar; quem soma tese é o
\`InvestigationBoard\`, quando o jogador cruza duas pistas deliberadamente.

## O que NÃO é exportado

A geometria dos props. No web ela é composta de primitivas porque não há
modelos; no Godot vira \`.glb\` e \`GridMap\`. O que atravessa é o que custaria
caro redigitar: a planta, as portas com sua cadeia de chaves, e a posição de
cada interativo.
`;
writeFileSync(join(OUT, 'README.md'), readme, 'utf8');
console.log(`  ${'README.md'.padEnd(28)}`);

console.log(`\n${Object.keys(documentos).length} documentos, ${Object.keys(pistas).length} pistas, `
  + `${conexoes.length} conexões, ${house.interactables.length} interativos exportados.`);
