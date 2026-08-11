// documents.js — todo o texto lido no jogo.
//
// REGRA DE ESCRITA deste arquivo: nenhum documento pode confirmar uma das três
// interpretações sozinho. Cada peça precisa servir a pelo menos duas leituras
// diferentes. Onde um texto parece provar algo, outro texto precisa arranhá-lo.
//
// `alt` guarda versões alternativas por nível de realidade: ao reler um
// documento mais tarde, o jogador encontra outra coisa. Nunca é comentado pelo
// jogo — cabe ao jogador lembrar (ou duvidar) do que leu antes.

export const DOCUMENTS = {

  /* ======================= CAPÍTULO 1 — A CARTA ========================== */

  carta_convite: {
    id: 'carta_convite',
    type: 'letter',
    title: 'A carta',
    meta: 'Sem remetente. Postada em Vale das Pedras, há onze dias.',
    pages: [
`Laura,

Você vai desculpar a falta de apresentação. Nomes atrapalham no começo.

Sei que você parou de dormir. Não do jeito que todo mundo diz que parou de dormir — sei que você acorda às 3h47 e fica olhando o teto até clarear, e que já são quatro meses assim. Sei que você não desfez as caixas do apartamento novo. Sei que ainda existe uma escova de dentes que não é sua no copo do banheiro e que você não teve coragem de jogar fora.

Não escrevo para assustar você. Escrevo porque você é a única pessoa que ainda faz perguntas sobre Helena Vasques.`,

`O caso foi arquivado em outubro de 1998 como desaparecimento voluntário. Você sabe disso. Você escreveu duas páginas sobre isso em 2019 e o jornal cortou para seis parágrafos.

O que você não sabe é que a casa continua lá. Inteira. Ninguém vendeu, ninguém demoliu, ninguém entrou.

Estrada do Cedro, depois do posto desativado. A terceira porteira.

A chave está onde ela sempre deixou.`,

`Uma última coisa, e depois eu paro.

Helena escreveu sobre uma visitante. Escreveu durante meses, quase todos os dias, sobre uma mulher que ainda viria. Descreveu o cabelo, o casaco, o jeito de segurar o cigarro sem fumar.

Todo mundo achou que ela estava doente.

Eu acho que ela estava certa.

Vá ver.`,
    ],
    lauraNote: 'Onze dias. Li essa carta trinta vezes em onze dias e continuo sem saber o que me irrita mais: o que ela sabe, ou o fato de eu ter vindo mesmo assim.',
    clue: 'carta_recebida',
    // Laura carrega esta carta no bolso o jogo inteiro e pode reabri-la pelo
    // inventário a qualquer momento. No nível 4, ela não diz mais a mesma
    // coisa. É a única mutação do jogo que acontece num objeto que nunca saiu
    // das mãos dela.
    alt: {
      4: [
`Laura,

Você vai desculpar a falta de apresentação. Nomes atrapalham no começo.

Sei que você parou de dormir. Sei que você acorda às 3h47 e fica olhando o teto até clarear.

Sei que você já leu esta carta trinta e uma vezes.`,

`O caso foi arquivado em outubro de 1998 como desaparecimento voluntário.

A casa continua lá. Inteira.

Estrada do Cedro, depois do posto desativado. A terceira porteira.

A chave está onde ela sempre deixou. A do porão está no arquivo, e a do arquivo você já achou, ou vai achar em alguns minutos, dependendo de quando você estiver lendo isto.`,

`Helena escreveu sobre uma visitante. Todo mundo achou que ela estava doente.

Eu acho que ela estava certa.

Desce.`,
      ],
    },
  },

  /* ===================== CAPÍTULO 2 — A CASA ============================= */

  conta_luz: {
    id: 'conta_luz',
    type: 'note',
    title: 'Correspondência acumulada',
    meta: 'Entrada, sobre o aparador.',
    pages: [
`Anos de papel. Propaganda de supermercado que fechou, três avisos de recadastramento, um catálogo de sementes de 2003.

E, em cima de tudo, aberta, uma conta de energia.

VASQUES, H. — Estrada do Cedro s/n.
Consumo: 41 kWh.
Vencimento: mês passado.
Situação: PAGA.`,

`Alguém está pagando a luz de uma casa vazia há vinte e sete anos.

Ou alguém pagou este mês.

Isso não é assombração. Isso é um débito automático, um envelope, uma pessoa com um nome e um CPF. É a coisa mais tranquilizadora que eu vi hoje.

Então por que meu peito está assim.`,
    ],
    clue: 'conta_paga',
  },

  bilhete_geladeira: {
    id: 'bilhete_geladeira',
    type: 'note',
    title: 'Bilhete na porta da geladeira',
    meta: 'Papel quadriculado, preso com um ímã de propaganda de farmácia.',
    pages: [
`café
sal grosso
pilhas (as pequenas)
fita para o gravador — 3, se tiver
lâmpada da varanda

perguntar ao Nelson sobre o cachorro

não deixar o corredor no escuro`,

`A letra é firme, inclinada para a direita, com o "t" cortado bem alto. Letra de quem escreve muito e rápido.

As quatro primeiras linhas são de uma mulher fazendo compras.

A última não é.`,
    ],
    lauraNote: 'Também não deixo o corredor no escuro. Nunca deixei. Isso não quer dizer nada. Metade do mundo não deixa.',
  },

  recorte_jornal: {
    id: 'recorte_jornal',
    type: 'clipping',
    title: 'Recorte de jornal',
    meta: 'Gazeta do Vale, 14 de outubro de 1998. Guardado entre dois livros.',
    pages: [
`PROFESSORA DESAPARECE NA ZONA RURAL

Helena Vasques, 38 anos, professora substituta da rede municipal, não é vista desde a noite de 2 de outubro. A Polícia Civil informou que não há sinais de arrombamento ou luta na residência da desaparecida, na Estrada do Cedro.

Segundo vizinhos, Vasques vivia sozinha havia sete anos e mantinha pouco contato com a comunidade. "Ela era educada, mas não era de conversa", disse o proprietário do armazém local, Nelson Braga, 61.

A residência foi encontrada com as portas destrancadas e a mesa posta. Nenhum documento pessoal, roupa ou valor foi levado.`,

`O delegado responsável, Aírton Sequeira, declarou que "tudo indica um afastamento voluntário" e que o caso seguirá aberto por prazo regulamentar.

Familiares não foram localizados.`,
    ],
    lauraNote: 'Trinta e oito anos. Eu tenho trinta e oito anos. Já reparei nisso em 2019, escrevi no meu caderno, achei uma coincidência elegante e usei na abertura da matéria. O editor cortou.',
    clue: 'mesma_idade',
  },

  ficha_policial: {
    id: 'ficha_policial',
    type: 'report',
    title: 'Cópia de inquérito',
    meta: 'Fotocópia de terceira geração, quase ilegível nas bordas. Sobre a mesa da sala.',
    pages: [
`INQUÉRITO 1.184/98 — DESAPARECIMENTO
Vítima: VASQUES, Helena. 38a. Solteira.

DILIGÊNCIA DE 05/10/1998:
Residência vistoriada. Portas destrancadas. Ausência de sinais de violência. Encontrados na sala: mesa posta para duas pessoas, alimentos em estado de decomposição compatível com 72h.

OBS.: Não foi possível identificar a segunda pessoa. A desaparecida não recebia visitas segundo os vizinhos ouvidos.`,

`DILIGÊNCIA DE 11/10/1998:
Recolhido do escritório material manuscrito em grande volume (cadernos, folhas avulsas, fitas magnéticas). Conteúdo de natureza pessoal, parcialmente incoerente.

Verificada menção reiterada a pessoa não identificada, referida apenas como "a visitante".

Solicitada avaliação psiquiátrica póstuma do material. INDEFERIDA por ausência de corpo.`,

`DESPACHO FINAL — 22/10/1998:
Ausentes indícios de crime. Arquive-se.

a) Aírton Sequeira, Delegado.

—

No rodapé, a lápis, com outra letra:

"o material devolvido à residência em 03/11. por ordem de quem?"`,
    ],
    clue: 'mesa_para_dois',
  },

  lista_helena: {
    id: 'lista_helena',
    type: 'note',
    title: 'Folha presa no armário do corredor',
    meta: 'Escrita à mão. A mesma letra do bilhete da geladeira.',
    pages: [
`COISAS QUE EU SEI SOBRE ELA

1. Vai chegar de carro. Sozinha.
2. Vai chegar à noite, e vai reclamar de ter chegado à noite.
3. Não vai bater na porta. Vai olhar embaixo do vaso primeiro.
4. Trabalha com perguntas. Não sei o nome do trabalho.
5. Acabou de perder alguém, mas não morreu ninguém.
6. Fuma, mas não acende.
7. Vai achar que sou eu quem está confusa.`,

`8. Tem uma cicatriz fina no dorso da mão esquerda. Vidro. Foi criança.
9. Não vai gostar do corredor.
10. Vai voltar mais de uma vez ao mesmo cômodo achando que esqueceu alguma coisa lá.

11. Eu gosto dela. Não sei explicar isso e não vou tentar.`,
    ],
    lauraNote: 'Eu não fumo. Eu larguei em março. Eu carrego o maço.\n\nA cicatriz é de uma jarra que caiu da pia quando eu tinha nove anos. Nunca contei isso para ninguém. Não porque seja segredo. Porque não é assunto.',
    clue: 'lista_sobre_mim',
  },

  receita_medica: {
    id: 'receita_medica',
    type: 'report',
    title: 'Receituário',
    meta: 'Armário do banheiro, atrás de um vidro de água oxigenada.',
    pages: [
`CLÍNICA SÃO BRÁS — RECEITUÁRIO DE CONTROLE ESPECIAL

Paciente: H. VASQUES
Data: 12/08/1998

- Lorazepam 2mg — 1 comprimido ao deitar
- (ilegível) 25mg — se necessário

Observação do médico, à caneta:
"Paciente relata paralisia do sono e alucinações hipnagógicas há 5 meses. Nega uso de álcool. Insiste que os episódios são 'informação, não sintoma'. Encaminhada."`,

`Debaixo da receita, dobrado em quatro, um segundo papel. Não é receita. É a folha de encaminhamento, nunca entregue.

O campo do diagnóstico presumido está preenchido com uma única palavra, escrita devagar, com a caneta apoiada duas vezes:

"lucidez"

Não sei se foi o médico que escreveu.`,
    ],
    lauraNote: 'Lorazepam. Eu tomei lorazepam por quatro meses este ano. Isso é comum. Isso é a coisa mais comum do mundo. Metade da minha redação toma.',
    clue: 'mesmo_remedio',
  },

  /* ==================== CAPÍTULO 3 — HELENA ============================== */

  diario_helena_1: {
    id: 'diario_helena_1',
    type: 'diary',
    title: 'Caderno de Helena — I',
    meta: 'Gaveta do criado-mudo. Capa dura, elástico arrebentado.',
    pages: [
`19 de março de 1998

Comecei a escrever tudo porque comecei a esquecer tudo, e depois percebi que não era esquecimento. Era o contrário. Era coisa demais chegando de uma vez.

Vou tentar ser exata, porque exatidão é a única coisa que me sobrou.

Não há ninguém na casa além de mim. Isso é verdade e continua verdade mesmo depois do que eu vou escrever agora.

Há uma mulher que ainda vai chegar aqui. Não sei quando. Sei que vai.`,

`27 de março

Hoje escrevi "a visitante" pela primeira vez e me senti idiota. Escrever uma coisa dá a ela um corpo. Antes de escrever, era uma sensação. Agora é uma personagem.

Mas não inventei. Faço questão de registrar isso enquanto ainda consigo distinguir: eu não inventei.

Ela usa um casaco escuro, comprido demais para o calor. Fica na porta da sala e não entra. Olha o corredor como quem mede.`,

`2 de abril

Nelson perguntou se eu estava dormindo bem. Respondi que sim. Menti sem pensar, o que é pior do que mentir pensando.

A verdade é que durmo bem. Durmo profundamente. É acordada que as coisas acontecem.`,
    ],
    clue: 'visitante_existe',
  },

  diario_helena_2: {
    id: 'diario_helena_2',
    type: 'diary',
    title: 'Caderno de Helena — II',
    meta: 'Sobre a escrivaninha do quarto, aberto.',
    pages: [
`14 de junho

Duas hipóteses, e eu preciso ser honesta com as duas:

PRIMEIRA — estou doente. É o que o Dr. Bianchi acha, e ele tem razão em achar, porque é a explicação econômica. Insônia crônica produz vultos. Solidão produz interlocutores. Uma mulher de trinta e oito anos que mora sozinha há sete e conversa em voz alta com a própria casa é um caso clínico e não um mistério.

Eu aceitaria isso. Juro que aceitaria. Seria um alívio.`,

`SEGUNDA — não estou.

O que me impede de aceitar a primeira é uma coisa só, e é uma coisa pequena, e vou escrever aqui para conferir depois:

Eu sei coisas sobre ela que eu não teria como inventar porque não me interessam. Ninguém inventa o que não lhe interessa.

Eu não me importo com jornalismo. Nunca li um jornal inteiro na vida. E sei que ela trabalha com perguntas, e sei o cansaço específico do rosto dela, o cansaço de quem passou o dia ouvindo gente mentir e anotando com educação.`,

`21 de julho

Escrevi para ela hoje. Uma carta. Fechei, endereçei, e depois fiquei meia hora olhando o envelope sem ter para onde mandar.

É a coisa mais ridícula que eu já fiz.

Guardei no escritório. Se um dia ela vier, vai estar lá.

E se ninguém vier, alguém vai achar isso depois e vai ter pena de mim. Tudo bem. Já tive pena de gente por menos.`,

`3 de setembro

Estou com medo, e é um medo novo, e preciso nomear direito porque nomear é a única coisa que eu sei fazer.

Não tenho medo dela.

Tenho medo de que ela chegue e eu não esteja mais aqui para explicar.`,
    ],
    clue: 'medo_de_helena',
  },

  fita_01: {
    id: 'fita_01',
    type: 'tape',
    title: 'Fita 01 — "casa (quarto/corredor)"',
    meta: 'Etiqueta escrita à mão. O gravador ainda tinha pilha.',
    pages: [
`[chiado. cadeira arrastando. respiração.]

— ...testando. Um, dois. Dia trinta de agosto, são... onze e vinte da noite.

[pausa longa. quinze segundos de chiado.]

— Se alguém estiver ouvindo isso, e eu sei como essa frase soa, então eu já não estou aqui, ou eu estou aqui e você não me vê, e eu não sei qual das duas é pior.`,

`— Eu vou dizer as coisas na ordem.

— Um: eu não fui embora. Se disserem que eu fui embora, é mentira, e é uma mentira conveniente, e eu quero que fique gravado que eu previ a conveniência.

— Dois: eu não me matei. Isso também vão dizer. Também é mentira.

— Três: eu não sei o que é a terceira coisa. É por isso que estou gravando.

[silêncio. quase quarenta segundos. um estalo distante, madeira.]

— ...ouviu isso?`,

`— A casa faz isso desde março. Não é a casa.

[pausa.]

— Se for você ouvindo, e eu acho que é: eu deixei tudo arrumado. O escritório está trancado porque eu tranquei, não porque alguém trancou. A chave está no lugar onde a gente esconde chave quando quer que seja encontrada, não quando quer esconder.

— E, olha... desculpa. Por tudo isso. Eu tentei fazer isso de um jeito gentil e não existe jeito gentil.

[clique. fim da gravação.]`,
    ],
    clue: 'fita_helena',
  },

  /* =================== CAPÍTULO 4 — IMPOSSÍVEL =========================== */

  carta_1998: {
    id: 'carta_1998',
    type: 'letter',
    title: 'Carta lacrada, endereçada a ninguém',
    meta: 'Escritório. Envelope amarelado, sem destinatário. Datada de 21 de julho de 1998.',
    pages: [
`21 de julho de 1998

Você chegou hoje.

Sei que é estranho ler isso numa carta escrita antes, e sei exatamente o gesto que você fez agora — você olhou a data outra vez para conferir. Não conferiu direito na primeira. Você nunca confere direito na primeira, porque acredita que já leu.

Está tudo bem. Eu também sou assim.`,

`Hoje alguém bateu à porta.

Foi de manhã, e eu estava na cozinha, e as batidas foram três, com uma pausa maior antes da terceira, como quem desiste no meio e continua por educação.

Eu não abri.

Não abri porque ninguém bateu.

Estou tentando escrever a verdade e a verdade é essa: eu ouvi três batidas numa casa onde não havia ninguém, e eu soube, do jeito que a gente sabe as coisas do próprio corpo, que aquilo tinha acontecido em outro dia que não era aquele.`,

`Você parou o carro antes da porteira e ficou sentada com o motor desligado. Não sei quanto tempo. O suficiente para reparar que não tem mato no poste da caixa de correio.

Depois você desceu, andou até a varanda, e olhou embaixo do vaso da direita.

Você acendeu a lanterna antes de precisar dela.

Você reclamou do cheiro na entrada e não disse nada em voz alta, porque não tem ninguém para dizer, mas você fez aquela cara.`,

`Não é bruxaria. Não sei o que é. Passei sete meses tentando descobrir o que é e a coisa mais honesta que consegui escrever foi isto:

às vezes o tempo não passa em fila.

Às vezes ele se dobra e encosta numa parte de si mesmo, e quem estiver exatamente naquele lugar, naquele instante, com atenção suficiente, escuta o outro lado.

Eu estive nesse lugar. A casa é esse lugar. Ou eu sou.`,

`Você vai querer procurar quem escreveu isto. É o seu ofício e é a sua defesa.

Vá procurar. Faz bem procurar.

Mas antes de procurar, faz uma coisa por mim: repara na sua própria mão segurando esta folha. Repara na cicatriz.

Eu descrevi essa cicatriz em março, num caderno que está na gaveta do criado-mudo, e você já leu, e você já disse a si mesma que aquilo não queria dizer nada.

Ela ainda não sabe que está aqui.`,
    ],
    lauraNote: 'Isso não faz sentido.\n\nEu disse isso em voz alta, sozinha, num escritório vazio, e a minha voz saiu errada.',
    clue: 'carta_impossivel',
    // Ao reler depois do nível 3 de realidade, a última página é outra. O jogo
    // não avisa. Se o jogador não reler, nunca fica sabendo.
    alt: {
      3: [
`21 de julho de 1998

Você chegou hoje.

Você já leu esta carta uma vez.

Reparou que ela está mais curta?`,

`Não estou tentando assustar você. Estou tentando ser econômica, porque eu tenho cada vez menos espaço.

Você leu a parte da cicatriz. Você leu a parte do tempo dobrado. Eu escrevi aquilo com muita convicção e agora não tenho tanta.

Aqui vai uma possibilidade que eu não escrevi da primeira vez porque tive vergonha:`,

`E se não houver duas pessoas nesta história.

Pensa com calma. Uma mulher de trinta e oito anos, sozinha, insone, medicada, que escreve sobre uma visitante que conhece em detalhe.

E, vinte e sete anos depois, uma mulher de trinta e oito anos, sozinha, insone, medicada, que atravessa o país para investigar uma desconhecida cuja vida ela conhece em detalhe.

Uma de nós inventou a outra. Eu passei sete meses achando que sabia qual.

Ela ainda não sabe que está aqui.`,
      ],
    },
  },

  pasta_visitante: {
    id: 'pasta_visitante',
    type: 'report',
    title: 'Pasta — "A VISITANTE"',
    meta: 'Primeira gaveta do arquivo de aço. A etiqueta foi datilografada.',
    pages: [
`A pasta é grossa. Não é um delírio rabiscado num guardanapo: é um trabalho. Índice, subdivisões, referência cruzada entre folhas numeradas.

Helena catalogou a própria alucinação com o rigor de quem prepara uma tese.

SEÇÃO A — Aparições (datas, duração, condições de luz)
SEÇÃO B — Descrição física (revisada 4x)
SEÇÃO C — Falas ouvidas
SEÇÃO D — Verificações`,

`A SEÇÃO D é a que me interrompe.

Helena não acreditou em si mesma. Ela testou.

"Se é produção da minha cabeça, então não pode conter informação que eu não possua. Método: registrar afirmações verificáveis e conferir depois."

Vinte e duas afirmações. Vinte e duas.

Ao lado de cada uma, a lápis, uma marca posterior: ✓ ou ✗ ou ?`,

`Dezenove receberam ✓.

Entre elas:

"Fala em 'apuração' quando quer dizer 'pesquisa'." ✓
"Diz o nome de uma cidade que não existe no mapa de 1998." ✓ — nota: "consultei o atlas na escola. não existe. anotar de novo em 5 anos."
"Tem um irmão de quem não fala." ✓

Duas receberam ✗:

"Está grávida." ✗
"Chegou de manhã." ✗

E uma recebeu ?:

"Diz que se chama Helena."`,
    ],
    lauraNote: 'Eu tenho um irmão. Nós não nos falamos desde o enterro do meu pai. Isso não está em lugar nenhum. Isso não está no meu Instagram, não está numa matéria, não está numa ficha de RH.\n\nE a cidade. Existe. Foi emancipada em 2004.',
    clue: 'secao_d',
  },

  /* ===================== CAPÍTULO 5 — A FOTOGRAFIA ======================= */

  foto_escrivaninha: {
    id: 'foto_escrivaninha',
    type: 'photo',
    photoId: 'foto_escrivaninha',
    title: 'Fotografia emoldurada',
    meta: 'Escritório, sobre a escrivaninha. Papel fosco, cantos gastos de manuseio.',
    pages: [
`Helena, na frente desta casa. Meia-idade, casaco escuro, mãos cruzadas na frente do corpo. O sol está alto e ela está apertando os olhos.

É a primeira vez que vejo o rosto dela fora de uma fotocópia de jornal.

Ela parece cansada e parece bem. As duas coisas ao mesmo tempo, do jeito que só acontece com gente de verdade.

No verso, a lápis: "casa. março."`,
    ],
    alt: {
      2: [
`Helena, na frente desta casa.

E, meio passo atrás dela, à direita, uma segunda pessoa.

Está desfocada — moveu-se durante a exposição, ou a lente não a pegou. Dá para ver o casaco escuro. Dá para ver o comprimento do cabelo. Dá para ver o jeito de segurar a mão direita, um pouco fechada, como quem tem alguma coisa entre os dedos e não vai acender.

No verso, a lápis, a mesma letra: "casa. março."

Só isso. Nada sobre a segunda pessoa.`,

`Eu coloquei esta fotografia de volta na mesa há dez minutos.

Havia uma pessoa nela.

Existem explicações. Eu sei que existem, eu ganho a vida com elas: eu vi errado da primeira vez, a luz estava pior, eu estava com a lanterna na mão e olhei rápido. A memória preenche. A memória é uma mentirosa profissional e eu sou a última pessoa do mundo que deveria confiar nela hoje.

Existem explicações.

Eu só não estou conseguindo escolher uma.`,
    ],
      4: [
`A segunda pessoa está nítida.

Helena é que está desfocada agora, apagada, como se a emulsão tivesse cedido só naquele ponto do papel.

Eu não vou escrever aqui de quem é o rosto.

Eu vou colocar a fotografia com a face para baixo, e vou sair desta sala, e vou continuar trabalhando, porque é isso que eu faço.`,
    ],
    },
    // Sem `clue` aqui de propósito: a pista da fotografia só nasce quando
    // Laura vê a imagem ALTERADA, e quem decide isso é scripts.js.
  },

  foto_parede: {
    id: 'foto_parede',
    type: 'photo',
    photoId: 'retrato_quarto',
    title: 'Retrato na parede do quarto',
    meta: 'Moldura de madeira, vidro rachado no canto inferior.',
    pages: [
`Duas mulheres na frente de uma casa. A mesma casa.

O retrato está no quarto dela, à altura dos olhos de quem está deitado. Foi pendurado para ser a última coisa vista antes de dormir.

O vidro está rachado no canto, e a rachadura passa exatamente entre as duas figuras.

Isso não quer dizer nada. Vidro racha.`,
    ],
  },

  /* ==================== CAPÍTULO 6 — A PRESENÇA ========================== */

  material_devolvido: {
    id: 'material_devolvido',
    type: 'report',
    title: 'Caixas de restituição — Polícia Civil',
    meta: 'Arquivo. Três caixas de papelão, lacre rompido, empilhadas com cuidado.',
    pages: [
`As caixas que a polícia levou em 11 de outubro de 1998 e devolveu em 3 de novembro. Estão aqui. Alguém as trouxe de volta para dentro da casa, cortou o lacre e organizou o conteúdo por ano.

Não é assim que a polícia devolve coisa. Polícia entrega no balcão para um parente e pede assinatura.

Não havia parente. O jornal diz isso: "familiares não foram localizados".

Então quem assinou.`,

`No fundo da terceira caixa, o formulário de restituição. Preenchido a máquina, campo por campo.

RECEBEDOR: (em branco)
GRAU DE PARENTESCO: (em branco)
DOCUMENTO: (em branco)
ASSINATURA: uma linha de tinta contínua, sem nenhuma letra. Alguém encostou a caneta e arrastou.

Data: 03/11/1998.

E, no canto inferior, a lápis, com a letra do rodapé do inquérito — a mesma que perguntava "por ordem de quem?":

"veio uma mulher. disse que era da família. eu deixei."`,
    ],
    lauraNote: 'Uma mulher disse que era da família de uma mulher que não tinha família, e levou embora tudo o que sobrou dela, e trouxe de volta para a casa vazia, e organizou por ano.\n\nEssa é a primeira coisa hoje que eu consigo escrever no caderno sem tremer. É uma pessoa. Pessoas deixam rastro.',
    clue: 'mulher_da_familia',
  },

  indice_helena: {
    id: 'indice_helena',
    type: 'note',
    title: 'Índice geral',
    meta: 'Arquivo. Preso na lateral da estante com fita crepe ressecada.',
    pages: [
`Helena indexou a própria casa.

A — correspondência (1991–)
B — escola / substituições
C — casa (reformas, contas, o poço)
D — a visitante
E — verificações
F — sonhos
G — ————

A letra G não tem nome. Tem um traço, longo, feito com a régua.

As pastas A a F estão nas gavetas. A gaveta G existe. Está vazia, e o fundo está limpo — não tem aquela poeira fina que junta em gaveta que nunca abriu.`,

`Embaixo do índice, numa folha separada, uma anotação que não é índice de nada:

"decidi hoje que não vou escrever a G.

não porque não saiba. porque escrever fixa, e enquanto não estiver escrito ainda dá para ser outra coisa.

se alguém achar esta folha e quiser saber o que era a G: sinto muito. eu também queria."`,
    ],
    clue: 'gaveta_g',
  },

  caderno_porao: {
    id: 'caderno_porao',
    type: 'diary',
    title: 'Caderno sem capa',
    meta: 'Porão. Sobre a mesa, aberto, com uma pedra segurando a página.',
    pages: [
`Não é a letra de Helena.

É parecida. A inclinação é a mesma, o "t" cortado alto é o mesmo. Mas o "g" desce reto, e o de Helena tem uma volta.

Duas pessoas com letra parecida, ou uma pessoa em dois momentos muito distantes da vida.`,

`"dia 4 — ela ainda está lá em cima. ouvi a porta da cozinha.

dia 6 — desceu até a metade da escada e voltou. não sei se me viu. acho que não. acho que se tivesse visto teria dito alguma coisa, ela sempre diz alguma coisa.

dia 9 — hoje não ouvi nada o dia inteiro. isso é pior.

dia 11 — não estou presa aqui. quero deixar isso registrado porque um dia alguém vai ler e vai achar que eu estava presa. a porta abre pelo lado de dentro. eu conferi todos os dias e nunca subi."`,

`"dia 14 — comecei a contar os dias errado de propósito, para ver se eu percebia. percebi no terceiro. anotar isso é a coisa mais tranquilizadora que eu fiz esta semana.

dia 19 — a mulher lá de cima é boa pessoa. eu queria que ela soubesse disso.

dia 23 —"

Acaba aí. Não é o fim do caderno: tem trinta páginas em branco depois.`,
    ],
    lauraNote: 'Dia 23. Alguém morou neste porão por pelo menos vinte e três dias, sabendo que havia outra pessoa na casa, sem subir.\n\nE a coisa que eu não consigo tirar da cabeça não é essa. É "a mulher lá de cima é boa pessoa". Quem escreveu isso gostava dela.',
    clue: 'caderno_porao',
  },

  bilhete_lampiao: {
    id: 'bilhete_lampiao',
    type: 'note',
    title: 'Bilhete sob o lampião',
    meta: 'Porão. Dobrado em quatro, usado de calço para o pé do lampião.',
    pages: [
`"se for você lendo isto, acende e senta.

não precisa ter pressa. eu esperei vinte e sete anos, você pode esperar dez minutos."`,
    ],
    lauraNote: 'A dobra do papel está gasta de tanto abrir e fechar. Não é um bilhete que alguém deixou. É um bilhete que alguém leu muitas vezes.',
    clue: 'bilhete_lampiao',
  },

  /* ================== CAPÍTULO 7 — O DESTINO DE HELENA =================== */

  pasta_c_poco: {
    id: 'pasta_c_poco',
    type: 'report',
    title: 'Pasta C — casa',
    meta: 'Porão. Arquivo de aço, gaveta única. Etiqueta datilografada.',
    pages: [
`Contas de água até 1994, quando a rede chegou à estrada. Um orçamento de telhado de 1996 que ela não aceitou. Recibo de dedetização. A vida administrativa de uma casa, guardada com a mesma disciplina com que ela guardou o resto.

E, no fim, uma subpasta fina: POÇO.

"O poço fica no porão porque a casa foi construída em cima dele. Isso não é comum e me disseram que é perigoso. Não é. A água acabou em 1993 e desde então é só um buraco seco de nove metros com uma tampa de concreto."`,

`"Mandei tampar em 93. Custou mais caro do que refazer o telhado, o que me diz alguma coisa sobre este país.

O homem que fez o serviço disse uma frase que eu anotei porque me pareceu bonita e agora me parece outra coisa: 'poço seco não é buraco, é ouvido'."`,

`Debaixo de tudo, grampeado, um segundo recibo.

SERVIÇO: reassentamento de laje — poço interno
LOCAL: Estrada do Cedro s/n
VALOR: pago à vista
DATA: 12/11/1998

Helena desapareceu em 2 de outubro de 1998.

Alguém pagou para fechar este poço quarenta e um dias depois.`,
    ],
    lauraNote: 'Reassentamento. Não "fechamento": reassentamento. Você só reassenta uma laje que foi levantada.',
    clue: 'poco_lacrado',
  },

  fita_02: {
    id: 'fita_02',
    type: 'tape',
    title: 'Fita 02 — sem etiqueta',
    meta: 'Porão. Estava dentro de um livro oco, na estante.',
    pages: [
`[chiado. mais longo que o da outra fita. quase um minuto antes de qualquer coisa.]

— ...não sei mais se estou gravando para você ou para mim. Acho que parou de fazer diferença faz umas semanas.

[pausa.]

— Eu desci aqui porque aqui é o único lugar da casa onde eu não escuto.

— Isso soa mal. Deixa eu dizer melhor. A casa inteira faz barulho o tempo todo, madeira, cano, vento. Aqui embaixo não tem nada. E é no silêncio que eu consigo ouvir se tem alguém.`,

`— Hoje eu tirei a laje.

[som de arrasto, longo, pesado. dois minutos de respiração.]

— Nove metros. Seco. Joguei uma pedra e contei. Um, dois, e o barulho.

— Depois joguei outra e contei de novo, porque eu preciso conferir as coisas duas vezes, e da segunda vez foram três segundos.

[silêncio.]

— A mesma pedra não pode cair de dois jeitos. Eu sei disso. Eu sou uma mulher adulta e eu sei disso.`,

`— Vou dizer uma coisa e depois vou desligar, porque se eu continuar eu apago.

— Não tem nada lá embaixo. Eu olhei com a lanterna, eu desci três degraus de ferro, eu cheirei. Não tem nada. Não é um lugar assustador. É um buraco seco na terra e é a coisa mais banal desta casa.

— E eu não consigo ficar de costas para ele.

[clique.]`,
    ],
    lauraNote: 'A voz dela é firme até "três segundos". Depois ela fala mais devagar, e mais alto, do jeito que a gente fala quando quer que a própria voz ocupe o espaço.',
    clue: 'fita_02',
  },

  pasta_g: {
    id: 'pasta_g',
    type: 'report',
    title: 'Pasta G',
    meta: 'Dentro do poço, numa caixa de metal apoiada num degrau, a dois metros da boca. Seca.',
    pages: [
`A pasta G existe.

Ela escreveu, na folha do índice, que tinha decidido não escrever a G. Eu li aquilo há três horas. Eu me lembro da frase inteira: "escrever fixa, e enquanto não estiver escrito ainda dá para ser outra coisa."

A pasta G tem cento e poucas folhas. É a mais grossa de todas.

E não é sobre a visitante.

Na capa, datilografado, com a fita já gasta:

G — VASQUES, HELENA`,

`Ela se catalogou.

O mesmo método que usou com a visitante, virado para dentro. Aparições, descrição física revisada quatro vezes, falas ouvidas, verificações.

Ler isso é ver uma pessoa tentando provar que ela mesma existe, com o rigor de quem prepara uma tese, e concluir que os dados são insuficientes.

SEÇÃO B — descrição física:
"1,64. Cabelo escuro, na altura do ombro. Cicatriz fina no dorso da mão esquerda, de vidro, da infância."

Eu tenho uma cicatriz fina no dorso da mão esquerda. De vidro. Da infância.

Eu já sabia disso. Está no caderno de março. Eu já tinha lido e já tinha decidido que não queria dizer nada.`,

`SEÇÃO D — verificações (sobre mim mesma)

Vinte e duas afirmações, outra vez. As mesmas vinte e duas.

Mas a coluna da direita está preenchida com outra caneta. Azul, mais fina, apoiada com mais força.

Dezenove ✓. Duas ✗. Uma ?.

Idênticas às da outra pasta. Item por item. Inclusive a que dizia "está grávida" ✗ e a que dizia "chegou de manhã" ✗.

E a que recebeu ?:

"Diz que se chama Helena."`,

`A última folha é uma anotação de rodapé, sem cabeçalho, com a mesma caneta azul:

"conferido. tudo bate.
não sei o que isso resolve.

3 de novembro"

Sem ano.

Em 3 de novembro de 1998, uma mulher entrou na delegacia de Vale das Pedras, disse que era da família de Helena Vasques, e retirou todo o material apreendido.`,

`Existem três coisas que isso pode significar e eu vou escrever as três agora, aqui, com a mão firme, antes que eu escolha uma sem perceber que escolhi.

Um: Helena estava viva em novembro. Não desapareceu — saiu. E voltou.

Dois: outra pessoa continuou o arquivo dela. Alguém que sabia o método, que tinha a chave, e que conferiu vinte e duas afirmações sobre uma mulher desaparecida com uma caneta azul.

Três: a data não tem ano porque não é 1998.

Eu prefiro a dois. Quero deixar registrado que eu prefiro a dois, e que preferir não é apurar.`,
    ],
    lauraNote: 'O "g" desta caneta azul desce reto. Sem volta.\n\nÉ a letra do caderno do porão. É a letra de quem contou vinte e três dias aqui embaixo.',
    clue: 'helena_depois',
  },

  /* ======================= CAPÍTULO 8 — LAURA ============================ */

  pasta_f_sonhos: {
    id: 'pasta_f_sonhos',
    type: 'diary',
    title: 'Pasta F — sonhos',
    meta: 'Arquivo. Folhas soltas, numeradas a lápis, sem ordem de data.',
    pages: [
`Helena anotava os sonhos com a mesma frieza com que anotava as contas de água. Hora de dormir, hora de acordar, duração estimada, e o texto em terceira pessoa — como se ela estivesse relatando o sonho de outra pessoa.

Depois entendi por quê. Ela não estava sonhando com ela mesma.

"F-04 — 22/09/1997. Deitei 23h10, acordei 4h20.

A menina tem uns nove anos. Está numa cozinha que não é esta. O azulejo vai só até a metade da parede e é verde. Ela está em cima de uma cadeira porque não alcança a pia."`,

`"F-07 — 11/11/1997.

A mesma cozinha. A menina derruba uma jarra de vidro. Não é acidente exatamente — ela estava se equilibrando e sabia que ia cair e escolheu não gritar por ajuda.

Corta a mão esquerda, no dorso. Muito sangue para um corte tão fino.

Ela não chora. Fica olhando a mão como quem confere uma conta."`,

`"F-11 — 03/02/1998.

A mesma menina, mais velha. Está deitada no escuro e há uma mulher no corredor, fora do quarto, contando.

Não contando para dormir. Contando alguma coisa. Números na casa dos vinte, e depois recomeçando do um.

A menina está acordada e finge que não. Isso eu sei porque a respiração dela no sonho é a respiração falsa de criança acordada, e é uma coisa que eu não teria como inventar porque nunca fui criança acordada no escuro. Eu dormia bem."`,

`"F-14 — 26/03/1998.

Alguém chama a menina pelo nome.

Não consegui ouvir. Acordei antes, e fiquei quinze minutos sentada na cama tentando puxar o som de volta, e não veio.

Anotar que a frustração foi desproporcional. Chorei. Não choro há anos. Chorei por não ter ouvido o nome de uma criança que eu inventei."`,
    ],
    lauraNote: 'Azulejo verde até a metade da parede. Uma cadeira na frente da pia porque eu não alcançava.\n\nA jarra caiu quando eu tinha nove anos e eu não gritei. Nunca contei isso a ninguém — nem o não ter gritado, que é a parte de que eu tenho vergonha.\n\nO resto eu não reconheço. Ninguém contava nada no corredor da minha casa. Disso eu tenho certeza, e é a única coisa desta pasta de que eu tenho certeza, e eu já reparei no que isso significa.',
    clue: 'sonhos_infancia',
  },

  pasta_b_escola: {
    id: 'pasta_b_escola',
    type: 'report',
    title: 'Pasta B — escola / substituições',
    meta: 'Arquivo. A pasta mais burocrática e mais grossa depois da G.',
    pages: [
`Sete anos de substituições, organizadas por ano e por escola. Helena rodava a região inteira: Vale das Pedras, Cedro, São Brás, três distritos que eu tive que procurar no mapa.

Comprovantes de pagamento, planos de aula datilografados, listas de presença. É a parte mais chata do arquivo dela e é a única que prova que ela existia fora desta casa.`,

`1997. Escola Municipal Rui Barbosa, distrito de São Brás. Substituição de dois meses, agosto e setembro.

Lista de presença, 5ª série B, trinta e um nomes em ordem alfabética, datilografados.

Na margem, ao lado de alguns, anotações a lápis de Helena. "atenta". "não enxerga o quadro". "faltou 6x, ver com a coordenação".

E, na letra M:

MARTINS, L. — "transferida em setembro"`,

`Eu estava na quinta série em 1997.

Martins é o nome do meu pai. Eu usei o da minha mãe até os doze anos, quando ela pediu que eu trocasse, e eu troquei, e nunca perguntei por quê.

Então em 1997 eu não me chamava Martins.

Eu deveria estar aliviada.`,

`Existem duzentos mil Martins neste país. Um número não trivial deles tem L. Uma menina transferida em setembro de 1997 de uma escola municipal de distrito é a coisa mais comum que já aconteceu.

Eu sei disso. Eu escreveria isso numa matéria e eu estaria certa.

O que eu não consigo escrever é por que a minha mão está tremendo, se a data está errada e o nome está errado e nada aqui é sobre mim.

Eu nunca estive em São Brás. Eu tenho certeza absoluta disso do mesmo jeito que eu tinha certeza absoluta de que ninguém contava números no corredor.`,
    ],
    clue: 'lista_classe',
  },

  /* ==================== CAPÍTULO 9 — A VISITANTE ========================= */

  fita_03: {
    id: 'fita_03',
    type: 'tape',
    title: 'Fita 03 — "a entrevista"',
    meta: 'Sótão. Dentro do gravador, rebobinada até o começo.',
    pages: [
`[chiado curto. a fita já estava no início — alguém rebobinou depois de ouvir.]

— Vinte e dois de setembro. Vou fazer isto de uma vez e depois vou parar de me envergonhar.

— Eu não sei entrevistar. Nunca entrevistei ninguém. Mas ela sabe, e talvez o formato ajude, então eu vou fazer as perguntas e vou deixar o espaço.

[pausa de cerca de dez segundos.]

— Primeira. Por que você veio?`,

`[pausa longa. quinze, vinte segundos. o gravador pega a casa: um cano, o vento.]

— ...porque alguém tinha que vir.

[a voz da resposta é a de Helena. É a mesma voz. Mas ela responde mais rápido do que pergunta, e come o fim das palavras, e usa "apuração" onde perguntou "pesquisa".]

— Segunda. Você sabe o que aconteceu comigo?

[pausa.]

— Sei o que vão dizer que aconteceu. Não é a mesma coisa e eu vou passar a vida sabendo que não é a mesma coisa.`,

`— Terceira. Você acha que eu estou doente?

[pausa muito longa. quase quarenta segundos.]

— Acho que essa não é a pergunta certa e acho que você sabe disso. A pergunta é se estar doente e estar certa são coisas que não podem acontecer juntas. E podem. Eu já escrevi sobre gente assim.

[silêncio. depois, mais baixo, quase fora do alcance do microfone:]

— ...eu não escrevi sobre gente assim. Eu não escrevo. Eu dou aula.`,

`— Quarta.

[a voz volta ao registro normal — o de perguntar.]

— Eu estou fazendo as duas vozes. Eu sei que estou fazendo as duas vozes. Quero deixar isso na fita porque se eu não deixar, alguém vai achar que eu não percebi, e eu percebi, e perceber não fez a menor diferença.

— As respostas continuam vindo com coisas que eu não sei.

[pausa.]

— Última pergunta. E essa eu não vou responder, porque essa não é minha.`,

`— Quando você chegar aqui em cima, e ouvir isto, e entender de quem é cada cadeira:

— o que é que você vai fazer com o resto da sua vida?

[silêncio.]

[o gravador continua rodando. quatro minutos e onze segundos de chiado e de casa, sem nenhuma voz, até a fita acabar sozinha.]`,
    ],
    lauraNote: 'Ela deixou quatro minutos de espaço para a resposta.\n\nEu estou de pé no meio desse espaço, vinte e sete anos depois, e o gravador ainda está aqui, e a fita ainda tem lugar.',
    clue: 'fita_03',
  },

  folha_12: {
    id: 'folha_12',
    type: 'note',
    title: 'Folha solta — item 12',
    meta: 'Sótão. No chão, encostada na parede, com a dobra virada para cima.',
    pages: [
`A lista tinha onze itens. Eu li os onze no armário do corredor, hoje de manhã, quando isto ainda era uma pauta.

Este é o décimo segundo, na mesma letra, escrito com mais espaço entre as linhas — do jeito que a gente escreve quando não tem pressa e quer que fique legível.

"12. Ela vai subir aqui.

Vai reparar nas duas cadeiras. Vai levar uns segundos e vai entender antes de mim qual é qual, porque ela é rápida nisso, é o trabalho dela.

E vai sentar na minha."`,

`Embaixo, um espaço de quatro linhas em branco. E depois:

"eu escrevi isso e fiquei olhando a frase durante muito tempo.

não sei se é uma previsão ou um pedido.

não sei se existe diferença, para quem escreve."`,
    ],
    lauraNote: 'A cadeira dela é a que tem o assento gasto. Vinte e sete anos de poeira em cima da outra e nenhuma em cima daquela.\n\nAlguém subiu aqui e sentou na cadeira da Helena. Muitas vezes. Durante anos.\n\nE não foi a Helena, porque a Helena não está.',
    clue: 'folha_12',
  },

  /* ===================== notas curtas de ambiente ======================== */

  bilhete_maquina: {
    id: 'bilhete_maquina',
    type: 'note',
    title: 'Folha na máquina de escrever',
    meta: 'Ainda presa ao rolo, meio datilografada.',
    pages: [
`A folha tem quatro linhas e para no meio de uma palavra.

"quando ela ler isto eu quero que ela saiba que eu não estava com me"

O "e" final está marcado com força. O carro da máquina ficou preso à direita.

Ela levantou no meio da frase e não voltou.`,

`Comparei o tipo com a carta que eu recebi em São Paulo.

O "a" tem a mesma falha, um vinco na perna direita da letra. O "s" salta meio milímetro acima da linha, sempre.

É esta máquina. A carta que me trouxe até aqui foi escrita nesta máquina.

Uma máquina numa sala trancada por dentro, numa casa onde ninguém entra há vinte e sete anos.

Alguém digitou. Uma pessoa, com dedos.`,
    ],
    clue: 'mesma_maquina',
  },

  gaveta_escritorio: {
    id: 'gaveta_escritorio',
    type: 'note',
    title: 'Gaveta da escrivaninha',
    meta: 'Emperrada. Cede no terceiro puxão.',
    pages: [
`Um maço de cigarros, marca que não se fabrica mais, lacrado.
Uma caixa de fósforos vazia.
Três pilhas pequenas, ainda no plástico.
Um caderno escolar sem nada escrito.

E um bilhete, dobrado uma vez só:

"não é pra você abrir hoje"

Eu abri hoje.`,
    ],
  },

  guarda_roupa: {
    id: 'guarda_roupa',
    type: 'note',
    title: 'Guarda-roupa',
    meta: 'As dobradiças gritam.',
    pages: [
`Roupas de mulher, dobradas com cuidado, cheirando a naftalina e a tempo.

Vestidos, duas saias, uma pilha de blusas de manga comprida. Tudo de uma pessoa que se vestia para não ser notada.

No fundo, no cabide da ponta, um casaco escuro. Comprido. Lã grossa, errada para o calor daqui.

Eu estou usando um casaco escuro comprido. Eu estou usando um casaco escuro comprido e sinto uma vontade enorme de tirar, e não vou tirar, porque tirar seria admitir alguma coisa.`,
    ],
    clue: 'casaco',
  },
};

/** Devolve as páginas corretas para o nível de realidade atual. */
export function getDocumentPages(doc, realityLevel) {
  if (!doc.alt) return doc.pages;
  let best = null;
  let bestKey = -1;
  for (const key of Object.keys(doc.alt)) {
    const k = Number(key);
    if (k <= realityLevel && k > bestKey) { bestKey = k; best = doc.alt[key]; }
  }
  return best || doc.pages;
}
