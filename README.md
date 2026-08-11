# A Casa da Repórter

Terror psicológico investigativo em primeira pessoa, rodando direto no navegador.
**Sem dependências externas, sem build, sem backend, sem arquivos de asset.**

Jogável: **capítulos 1 a 7** — a carta, a chegada, a casa, a descoberta
impossível, a fotografia, a presença e o destino de Helena.

---

## Como jogar

Módulos ES não carregam via `file://` (política de CORS do navegador), então o
projeto precisa de um servidor local. Qualquer um serve:

```bash
python -m http.server 8000
# ou:  npx serve .
# ou:  php -S localhost:8000
```

Depois abra `http://localhost:8000`.

No Windows há atalhos prontos: **`serve.bat`** (duplo clique) ou `./serve.sh`.

### Controles

| Tecla | Ação |
|---|---|
| `WASD` | Mover |
| Mouse | Olhar |
| `Shift` | Correr |
| `Ctrl` / `C` | Agachar |
| `E` / `Espaço` | Interagir |
| `F` | Lanterna |
| `J` / `Tab` | Diário (pistas e deduções) |
| `I` | Itens |
| `M` | Reexibir o objetivo |
| `Esc` | Menu / fechar |
| `←` `→` | Virar página de um documento |

Use fones. O áudio carrega metade do jogo.

---

## Arquitetura

Módulos ES nativos, sem transpilação. A separação foi desenhada pensando na
portagem futura para **Godot**: cada sistema é independente, comunica-se por
sinais, e todo o conteúdo é dado declarativo e serializável.

```
index.html
styles/            main.css (base, título, final) · ui.css (HUD, leitor, diário)
src/
  main.js          ponto de entrada, tela de título
  core/
    math.js        vec3/mat4 column-major, raio-AABB, PRNG determinístico
    bus.js         EventBus  → vira signals no Godot
    input.js       teclado + pointer lock, mapeado por AÇÃO (não por tecla)
    audio.js       WebAudio 100% sintetizado: vento, madeira, passos, sussurros
    save.js        localStorage versionado
    gl/
      shaders.js   GLSL ES 1.00 (roda em WebGL1 e WebGL2)
      geometry.js  construtores de malha + cache por dimensão
      textures.js  texturas procedurais em Canvas 2D + A FOTOGRAFIA
      renderer.js  forward renderer + passe de pós-processamento
  game/
    world.js       dados → cena; portas, luzes, cômodos, mutações
    player.js      locomoção, colisão círculo-AABB, lanterna
    interaction.js raycast, prompt contextual, despacho de ações
    inventory.js · journal.js · narrative.js · reality.js
    scripts.js     eventos roteirizados + eventos ambientes
    game.js        orquestrador e loop
  ui/ui.js         HUD, leitor de documentos, diário, pausa, finais
  data/
    house.js       a planta da casa (paredes, portas, móveis, interativos)
    props.js       biblioteca de móveis  → viria a ser cenas .tscn
    documents.js   todo o texto do jogo
    clues.js       pistas, conexões válidas e itens
    chapters.js    capítulos 1–10 e os finais
```

### Por que engine própria em vez de Three.js

Uma engine mínima custou ~700 linhas e comprou três coisas que importam aqui:
zero dependências (roda offline, sem CDN), controle total do pós-processamento
— que é onde vive a atmosfera do jogo — e um grafo de cena declarativo que
mapeia quase 1:1 em nós do Godot. Three.js resolveria mais rápido e deixaria
uma camada a mais para desfazer na portagem.

---

## Os sistemas que sustentam o terror

### Sistema de Realidade (`reality.js`)

Um número de 0 a 5 governa o quanto a casa deixou de ser confiável. Ele modula
distorção de imagem, paleta, grão, o drone do áudio, a estabilidade da lanterna
e **o conteúdo dos documentos** (`alt` em `documents.js`: reler uma carta mais
tarde traz outro texto, e o jogo nunca comenta isso).

A regra de ouro das mutações:

> **Nada muda enquanto o jogador está olhando.**

`reality.mutate(id, cômodo, fn)` enfileira a alteração e só a executa quando o
jogador sai daquele cômodo. Uma porta que se fecha na cara do jogador é um
efeito. Uma porta que estava aberta e está fechada quando ele volta é uma
dúvida — e só a dúvida interessa.

Objetos que "mudam de lugar" nunca são transformados em runtime: existem duas
cópias estáticas, uma por destino, e o sistema apaga uma e acende a outra
(`world.moveObject`). Malha e colisão acendem juntas, então um objeto invisível
também deixa de bloquear.

### A fotografia

É desenhada por código (`drawPhotograph`), não carregada de um arquivo. Trocar
a variante é trocar um parâmetro: Helena sozinha → Helena e uma segunda figura
desfocada → a segunda figura nítida e Helena apagada. As figuras são
deliberadamente indistintas: o jogador precisa poder dizer "é grão do papel"
com a mesma convicção com que diz "é ela".

### Pistas que se cruzam (`journal.js` + `clues.js`)

O jogador seleciona **duas pistas** no diário e tenta cruzá-las. Pares
significativos geram uma dedução; os demais devolvem *"você olha as duas por um
tempo. Não sai nada. Talvez não haja nada."* — nunca "errado".

Cada dedução carrega um peso oculto para **sobrenatural**, **psicológica** ou
**conspiração**. A soma decide qual final o jogo oferece. O jogador nunca vê
esses números e nunca escolhe um final explicitamente: ele constrói uma leitura
do caso, e o jogo devolve a leitura dele.

Se nenhuma interpretação abre vantagem de 3 pontos, o final é o **incerto** —
que é, provavelmente, o final verdadeiro.

### As três interpretações

Nenhum documento confirma uma leitura sozinho; cada peça serve a pelo menos
duas. Alguns exemplos do que está plantado:

- **Sobrenatural** — a Seção D: Helena testou a própria alucinação com 22
  afirmações verificáveis; 19 se confirmaram, incluindo uma cidade que só
  existiria a partir de 2004.
- **Psicológica** — Helena tinha 38 anos, insônia, lorazepam e escrevia sobre
  uma mulher que conhecia em detalhe e nunca encontrou. Laura tem 38 anos,
  insônia, tomou lorazepam e atravessou o país atrás de uma desconhecida cuja
  vida ela conhece em detalhe.
- **Conspiração** — a conta de luz paga no mês passado, o cadeado lubrificado
  por baixo, o espelho limpo, e a carta que trouxe Laura até ali datilografada
  na máquina de uma sala trancada por dentro.

Cada final termina com uma farpa que contradiz a própria leitura que acabou de
oferecer.

---

## Testes

Os sistemas de jogo não dependem de DOM nem de WebGL em tempo de import, o que
permite testá-los no Node com stubs. Há três suítes usadas no desenvolvimento
(integridade de dados, jogada simulada e auditoria de geometria) — a última
pegou uma inversão de winding que teria feito toda peça cilíndrica desaparecer.

---

## Estado atual e próximos passos

**Pronto:** engine, áudio, casa completa (11 cômodos + exterior + porão com
poço), 9 portas com cadeia de chaves, 24 documentos (~3.800 palavras), 34
pistas, 31 conexões, inventário, diário, save/load, Sistema de Realidade até o
nível 5, eventos ambientes, 4 finais.

As três interpretações estão equilibradas em 44/45/45 pontos — desvio de 2,2%.
O número é reconferido a cada `node tools/export-godot.mjs`.

**Capítulos 8–10** estão declarados em `chapters.js` com título, epígrafe,
objetivo, nível de realidade e condição de avanço. Expandi-los é preencher
`documents.js`, `clues.js` e as mutações em `scripts.js` — nenhum sistema
precisa mudar. O sótão ainda não existe como espaço.

## Ponte para o Godot

`node tools/export-godot.mjs` converte `src/data/` para o formato que o GDD
especifica em `/data/`. O cânone e os sistemas estão em [docs/GDD.md](docs/GDD.md).
