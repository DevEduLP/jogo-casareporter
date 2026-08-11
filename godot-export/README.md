# Dados exportados — A Casa da Repórter

Gerado por `tools/export-godot.mjs` a partir do protótipo web.
**Não edite estes arquivos à mão**: edite `src/data/` e exporte de novo.

Copie o conteúdo desta pasta para `/data/` no projeto Godot.

| Arquivo | Conteúdo | Consumido por |
|---|---|---|
| `clues.json` | 44 pistas | `ClueManager` |
| `connections.json` | 44 conexões válidas e seus pesos de tese | `InvestigationBoard` |
| `documents.json` + `documents/*.json` | 28 documentos | `DocumentViewer` |
| `chapters.json` | 10 capítulos | `GameState` |
| `endings.json` | 4 finais | `EndingManager` |
| `items.json` | 9 itens | inventário |
| `level.json` | planta, portas, interativos, luzes | montagem das cenas |

## A tese vem da conexão, não do documento

O GDD se contradiz: a Seção 11.4 diz que a tese é definida pelas conexões
feitas no quadro, mas o `clue_manager.gd` da Seção 14.2 soma tese dentro de
`open_document()` — ou seja, no ato de simplesmente ler.

Somar no ato de ler faz o final ser decidido por **quanto o jogador explorou**,
não por **como ele interpretou**: dois jogadores completistas teriam sempre o
mesmo final, e o quadro de investigação viraria decoração.

Por isso as pistas saem daqui com `tese: "neutra"` e todo o peso vive em
`connections.json`. O `ClueManager` deve apenas coletar; quem soma tese é o
`InvestigationBoard`, quando o jogador cruza duas pistas deliberadamente.

## O que NÃO é exportado

A geometria dos props. No web ela é composta de primitivas porque não há
modelos; no Godot vira `.glb` e `GridMap`. O que atravessa é o que custaria
caro redigitar: a planta, as portas com sua cadeia de chaves, e a posição de
cada interativo.
