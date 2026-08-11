# A CASA DA REPÓRTER — Cânone e Sistemas

**Versão 1.1** · Substitui as Seções 2, 3, 4, 5, 6, 9 e 11.4 do GDD v1.0 (PDF).

---

## Como ler este documento

O GDD v1.0 continua válido e é a referência para **produção**: roadmap, MVP de
30 dias, plano de demo Steam, lista de assets, cronograma de 6 meses, riscos e
as regras de escopo da Seção 23. Nada disso muda.

O que muda é o **cânone** — datas, idades, quem existe — e os **sistemas
narrativos**, porque o protótipo web colocou a história para rodar e algumas
coisas mudaram no contato com a realidade. Onde este documento diverge do PDF,
este documento manda.

### O que mudou em relação ao v1.0, e por quê

| Ponto | v1.0 | v1.1 | Motivo |
|---|---|---|---|
| Idade de Helena em 1998 | 34 | **38** | Ver abaixo — é a espinha da leitura psicológica |
| Helena se muda para a casa | Mar/1997 | **1991** | Sete anos de reclusão pesam mais que um |
| Última data em documento | 14/Abr/1998 | **3/Set/1998** | Abre espaço para o inquérito de outubro |
| Desaparecimento | (implícito Abr) | **2/Out/1998** | O caso policial é uma fonte de pistas |
| Irmã de Helena | existe | **cortada** | Colide com "familiares não foram localizados" |
| Peso da tese | ao ler documento | **ao cruzar pistas** | Ver "A tese vem da conexão" |
| Progressão do terror | — | **Sistema de Realidade** | Sistema novo, não existia no v1.0 |

**Sobre a idade.** Helena com 38 anos, a mesma idade de Laura hoje, não é um
detalhe: é o argumento central da leitura psicológica. Duas mulheres de trinta
e oito anos, sozinhas, insones, medicadas com a mesma substância, escrevendo
obsessivamente sobre uma mulher que conhecem em detalhe e nunca encontraram.
Com 34, esse espelho não fecha e a leitura psicológica perde seu melhor
argumento — o que desequilibra as três interpretações.

**Sobre a irmã.** Cortá-la torna "familiares não foram localizados" literal, e
isso é o que faz o documento de restituição do porão funcionar: *"veio uma
mulher. disse que era da família. eu deixei."* — de uma mulher que não tinha
família. Uma irmã real transformaria o melhor mistério do jogo em burocracia.

---

## 1. Cânone

### Helena Vasques

38 anos em 1998. Professora substituta, arquivista compulsiva. Mudou-se sozinha
para a casa da Estrada do Cedro em **1991**, depois do fim de um relacionamento.
Sem família localizável. Pouco contato com a comunidade — "educada, mas não era
de conversa", nas palavras do dono do armazém, Nelson Braga.

Não é uma reclusa pitoresca: é uma pessoa metódica. Quando começou a perceber
uma presença, não surtou — **montou um protocolo de verificação**. Índice de A a
G, vinte e duas afirmações testáveis, resultado anotado a lápis ao lado de cada
uma. Dezenove confirmadas.

O jogador precisa terminar o jogo com pena dela e com respeito por ela.

### Laura Martins

38 anos, jornalista investigativa. Separada há ~4 meses, insone (acorda às
**3h47**), lapsos de memória que ela não contou a nenhum médico, quatro meses de
lorazepam. Tem um irmão com quem não fala desde o enterro do pai — fato que não
está em lugar nenhum público, e que aparece na pasta de Helena.

Voz seca, profissional, que vai rachando. Ela nunca grita. Quando algo
impossível acontece, ela tenta **anotar**, e é isso que a torna trágica: é
exatamente o que Helena fez.

### A Visitante

Nunca aparece como criatura. Existe em frases na segunda pessoa, em fitas, em
riscos de contagem numa parede. Pode ser o futuro chamando o passado, uma psique
partida, ou uma pessoa com um molho de chaves.

---

## 2. Linha do tempo (autoritativa)

Um erro de data aqui quebra o jogo. Esta tabela é a fonte da verdade; qualquer
documento novo confere contra ela antes de ser escrito.

### Helena — 1991 a 1998

| Data | Evento | Onde aparece |
|---|---|---|
| 1991 | Muda-se sozinha para a casa | `indice_helena` ("correspondência 1991–") |
| Mar/1998 | Fotografia na frente da casa | `foto_escrivaninha` ("casa. março.") |
| 19/Mar/1998 | Primeira entrada do caderno | `diario_helena_1` |
| 27/Mar/1998 | Escreve "a visitante" pela primeira vez | `diario_helena_1` |
| 02/Abr/1998 | Nelson pergunta se ela está dormindo | `diario_helena_1` |
| 14/Jun/1998 | As duas hipóteses — doente ou não | `diario_helena_2` |
| 21/Jul/1998 | **Escreve a carta lacrada** | `carta_1998` |
| 12/Ago/1998 | Receituário — lorazepam, "lucidez" | `receita_medica` |
| 30/Ago/1998 | Grava a Fita 01 | `fita_01` |
| 03/Set/1998 | Última entrada: "medo de não estar aqui" | `diario_helena_2` |
| **02/Out/1998** | **Desaparece.** Mesa posta para dois | `recorte_jornal`, `ficha_policial` |
| 05/Out/1998 | Vistoria: portas destrancadas, comida de 72h | `ficha_policial` |
| 11/Out/1998 | Polícia recolhe o material manuscrito | `ficha_policial` |
| 14/Out/1998 | Notícia na Gazeta do Vale | `recorte_jornal` |
| 22/Out/1998 | Arquivado como desaparecimento voluntário | `ficha_policial` |
| **03/Nov/1998** | **Uma mulher retira o material dizendo ser da família** | `material_devolvido` |

### Laura — presente (2025)

| Momento | Evento |
|---|---|
| ~4 meses atrás | Separação. Começam insônia e lapsos. Lorazepam. |
| 2019 | Escreveu duas páginas sobre o caso; o jornal cortou para seis parágrafos |
| Há 11 dias | Recebe a carta anônima, postada em Vale das Pedras |
| Hoje | Chega à casa. Todo o jogo é uma noite. |

**A distância é 27 anos.** Esse número aparece seis vezes nas pistas e uma vez
no bilhete do porão — *"eu esperei vinte e sete anos"*. É a mesma distância que
o final incerto projeta para frente.

---

## 3. As três leituras

Regra de ouro, herdada do v1.0 e mantida: **nenhuma pista prova só uma leitura.**

| Leitura | Tese | Evidência mais forte no build |
|---|---|---|
| Sobrenatural | A | Seção D: 19 de 22 afirmações confirmadas, incluindo uma cidade que só existiria a partir de 2004 |
| Psicológica | B | Duas mulheres de 38 anos, insones, com o mesmo remédio, escrevendo sobre uma mulher que conhecem sem ter conhecido |
| Conspiração | C | A conta de luz paga no mês passado, o cadeado lubrificado por baixo, e a carta datilografada numa máquina trancada por dentro |

**Balanceamento atual (peso total nas conexões): A=44, B=45, C=45.**
Desvio máximo de 2,2%. Era 20,7% no fim do capítulo 6 — a leitura psicológica
estava significativamente mais difícil de alcançar, o que não é ambiguidade e
sim viés. Corrigido no capítulo 7 com conexões novas, não com ajuste de números.

Este número é conferido a cada exportação e deve ficar abaixo de ~10%. É a
tarefa de balanceamento que o v1.0 prevê para o Mês 5, feita continuamente.

---

## 4. Capítulos — dois eixos, não um

O v1.0 divide o jogo em prólogo + 5 capítulos. Esses são **atos espaciais**:
cada um abre uma parte da casa. O build usa 10 capítulos, que são **batidas
narrativas**. Os dois eixos são compatíveis e ambos úteis.

| Ato espacial (v1.0) | Batidas narrativas (build) | Estado |
|---|---|---|
| Prólogo — A Carta | 1. A CARTA | ✅ jogável |
| Cap. 1 — Andar térreo | 2. A CASA · 3. HELENA | ✅ jogável |
| Cap. 2 — O Escritório | 4. IMPOSSÍVEL · 5. A FOTOGRAFIA | ✅ jogável |
| Cap. 3 — Quartos/banheiro | (integrado ao térreo) | ✅ jogável |
| Cap. 4 — O Porão | 6. A PRESENÇA · 7. HELENA | ✅ jogável |
| Cap. 5 — O Sótão e o Relógio | 8. LAURA · 9. A VISITANTE · 10. A CASA | declarados |

**Divergência de planta:** o v1.0 prevê dois andares. O build é térreo + porão,
com quarto e banheiro no térreo. O sótão ainda precisa existir — é o clímax — e
o sistema vertical construído para o porão já suporta.

---

## 5. Sistemas novos (não existem no v1.0)

### 5.1 Sistema de Realidade

Um número de 0 a 5 governa o quanto a casa deixou de ser confiável. Ele modula
distorção de imagem, paleta, grão, o drone do áudio, a estabilidade da lanterna
e **o conteúdo dos documentos**.

| Nível | Estado | Capítulo |
|---|---|---|
| 0 | A casa é uma casa | 1–2 |
| 1 | Primeiras alterações, sons | 3 |
| 2 | Objetos e portas mudam de estado | 4 |
| 3 | Imagens e textos se alteram | 5 |
| 4 | O espaço discorda de si mesmo | 6 |
| 5 | A casa deixa de fingir | 7–10 |

O terror do v1.0 é estático — a casa é a mesma na primeira e na última hora.
Este sistema é o que dá progressão sem custo de assets.

### 5.2 A regra da mutação

> **Nada muda enquanto o jogador está olhando.**

Toda alteração é enfileirada por cômodo e só executa quando o jogador sai dali.
Uma porta que se fecha na cara do jogador é um efeito. Uma porta que estava
aberta e está fechada quando ele volta é uma dúvida — e só a dúvida interessa.

Objetos que mudam de lugar nunca são transformados em runtime: existem duas
cópias, uma por destino, e o sistema apaga uma e acende a outra. No Godot isso é
`visible = false`, sem lógica nenhuma a reescrever.

### 5.3 Documentos que mudam ao serem relidos

Cada documento pode ter versões alternativas por nível de realidade. Reler a
mesma carta mais tarde traz outro texto, e o jogo **nunca comenta isso**. Quem
não reler, nunca fica sabendo.

O caso mais forte: a **carta que Laura recebeu** está no inventário dela desde o
primeiro minuto e pode ser reaberta a qualquer momento. No nível 4 ela diz outra
coisa. É o único objeto do jogo que muda sem nunca ter saído das mãos dela.

### 5.4 A tese vem da conexão, não do documento

O v1.0 se contradiz: a Seção 11.4 diz que a tese é definida pelas conexões no
quadro, mas o `clue_manager.gd` da Seção 14.2 soma tese dentro de
`open_document()` — no simples ato de ler.

Somar ao ler faz o final ser decidido por **quanto o jogador explorou**, não por
**como ele interpretou**. Dois jogadores completistas teriam sempre o mesmo
final, e o quadro de investigação viraria decoração.

**Decisão:** pistas são `tese: "neutra"`. Todo o peso vive nas conexões, que
exigem um ato deliberado. O `ClueManager` só coleta; quem soma é o
`InvestigationBoard`.

**Corolário:** quando nenhuma tese abre 3 pontos de vantagem, o final é o
**incerto** — o jogador genuinamente dividido recebe um final que honra isso, em
vez de um veredito que ele não emitiu.

---

## 6. Finais

Mantidos do v1.0, com uma adoção e uma adição.

| Final | Tese | Farpa que o contradiz |
|---|---|---|
| A — Helena | Sobrenatural | O laudo conclui que a fotografia tem manipulação química compatível com técnicas de 1998 |
| B — Laura | Psicológica | A caixa que ela leva tem 19 folhas; três semanas depois, sobre a mesa, são 22 |
| C — A Verdade | Conspiração | Na última página do caderno, numa folha que ela jura ter fotografado em branco: *"deixa ela achar a empresa. é mais fácil do que a outra coisa."* |
| Incerto — A Visitante | — | 27 anos é a distância entre 1998 e hoje. É também a distância entre hoje e o dia em que outra pessoa vai encontrar esta casa. |

**A adotar do v1.0: Final D — "Partir".** Voltar à porta da frente após o Cap. 2
e sair sem terminar. É a melhor ideia do documento original e é barata. Ainda
não implementado.

---

## 7. Fonte da verdade do conteúdo

Documentos, pistas, conexões, capítulos, finais e a planta vivem em
`src/data/` e são exportados para o formato Godot por:

```
node tools/export-godot.mjs
```

A saída (`godot-export/`) é copiada para `/data/` no projeto Godot. **Não edite
o JSON exportado à mão** — edite a fonte e exporte de novo. A timeline dupla é
frágil, e digitação manual é exatamente onde erros de data nascem.
