// chapters.js — a espinha dorsal narrativa.
//
// `advance` é uma condição declarativa avaliada pelo Narrative a cada mudança
// de estado. Manter isto como dado (e não como código espalhado) é o que
// permite reordenar capítulos sem caçar `if`s pelo projeto inteiro.

export const CHAPTERS = [
  {
    n: 1,
    id: 'a_carta',
    title: 'A CARTA',
    epigraph: '"A chave está onde ela sempre deixou."',
    objective: 'Entrar na casa de Helena Vasques.',
    reality: 0,
    onStart: {
      monologue: [
        'Estrada do Cedro. Terceira porteira. Onze dias para eu decidir vir, e quatro horas de estrada para eu decidir que foi burrice.',
        'A casa está exatamente onde a carta disse que estaria. Isso não deveria me surpreender e me surpreende assim mesmo.',
      ],
    },
    advance: { flag: 'entrou_casa' },
  },

  {
    n: 2,
    id: 'a_casa',
    title: 'A CASA',
    epigraph: 'Vinte e sete anos de portas fechadas, e nenhuma teia na maçaneta.',
    objective: 'Explorar a casa. Encontrar os registros de Helena.',
    reality: 0,
    onStart: {
      monologue: [
        'Cheiro de casa fechada, mas não de casa morta. Casa morta cheira a mofo e a bicho. Esta cheira a poeira parada e a alguma coisa que alguém cozinhou. Faz tempo. Não faz tanto tempo.',
        'Vou fazer isso do jeito certo. Cômodo por cômodo. Anotar tudo. É só um trabalho.',
      ],
    },
    // Avança quando Laura tiver reunido contexto suficiente sobre a casa.
    // Seis pistas exigem varrer sala, cozinha, corredor e banheiro — o
    // capítulo 2 é onde o jogador aprende a olhar.
    advance: { clues: 6 },
  },

  {
    n: 3,
    id: 'helena',
    title: 'HELENA',
    epigraph: '"Comecei a escrever tudo porque comecei a esquecer tudo."',
    objective: 'Reconstruir a vida de Helena. Encontrar a chave do escritório.',
    reality: 1,
    onStart: {
      monologue: [
        'Ela escrevia. Meu Deus, como ela escrevia. Isso não é o caderno de uma mulher perdendo o juízo — é o arquivo de alguém tentando desesperadamente não perder.',
        'Eu conheço esse impulso. Eu ganho a vida com esse impulso.',
      ],
    },
    advance: { flag: 'escritorio_aberto' },
  },

  {
    n: 4,
    id: 'impossivel',
    title: 'IMPOSSÍVEL',
    epigraph: '"Você chegou hoje."',
    objective: 'Ler o que Helena guardou no escritório.',
    reality: 2,
    onStart: {
      monologue: [
        'Trancada por dentro. Com chave. E a chave escondida onde alguém quer que seja achada.',
        'Isso é arrumação. Alguém arrumou esta sala para uma visita.',
      ],
    },
    advance: { flag: 'leu_carta_1998' },
  },

  {
    n: 5,
    id: 'a_fotografia',
    title: 'A FOTOGRAFIA',
    epigraph: '"casa. março."',
    objective: 'Sair do escritório. Depois voltar e olhar a fotografia outra vez.',
    reality: 3,
    onStart: {
      monologue: [
        'Certo. Certo. Respira.',
        'Uma carta datilografada numa máquina que está nesta casa, descrevendo coisas que qualquer pessoa que me seguisse desde o posto teria visto. Isso tem explicação e a explicação tem nome, endereço e motivo.',
        'É isso que eu vou fazer. Vou achar o nome.',
      ],
    },
    advance: { flag: 'viu_foto_alterada' },
  },

  /* ------------------------------------------------------------------ *
   * Os capítulos 6 a 10 estão declarados com sua estrutura narrativa.  *
   * A vertical slice termina no 5; a expansão consiste em preencher os *
   * documentos e as mutações de cada um, sem tocar em nenhum sistema.  *
   * ------------------------------------------------------------------ */

  {
    n: 6,
    id: 'a_presenca',
    title: 'A PRESENÇA',
    epigraph: 'A casa começa a discordar de si mesma.',
    objective: 'Descobrir o que há embaixo da casa.',
    reality: 4,
    onStart: {
      monologue: [
        'Certo. Vou fazer o que eu sei fazer. Vou parar de tentar explicar e vou registrar.',
        'Registrar é o que sobra quando explicar não dá mais. Foi exatamente isso que a Helena fez, e eu passei o dia inteiro achando que era sintoma.',
      ],
    },
    // Abrir a porta é a resolução do puzzle; descer é a chegada. O capítulo só
    // fecha quando Laura olha para onde a cadeira está olhando — que é a cena.
    advance: { flag: 'viu_parede_porao' },
  },
  {
    n: 7,
    id: 'o_destino_de_helena',
    title: 'HELENA',
    epigraph: '"poço seco não é buraco, é ouvido."',
    objective: 'Descobrir o que aconteceu com Helena Vasques.',
    reality: 5,
    onStart: {
      monologue: [
        'Alguém morou aqui embaixo. Contando os dias, sabendo que tinha gente em cima, e nunca subiu.',
        'Vinte e sete anos de gente entrando e saindo desta casa que a polícia deu por vazia.',
        'Certo, Helena. Onde é que você foi parar.',
      ],
    },
    advance: { flag: 'destino_helena' },
  },
  {
    n: 8,
    id: 'laura',
    title: 'LAURA',
    epigraph: '"Acordei antes, e não consegui ouvir o nome."',
    objective: 'Subir. Reler o arquivo de Helena procurando por você.',
    reality: 5,
    onStart: {
      monologue: [
        'Ela catalogou a si mesma e a descrição bateu comigo.',
        'Eu vim para cá apurar um desaparecimento de 1998 e nas últimas horas eu parei de tomar nota sobre a Helena.',
        'Então é isso. A partir de agora eu sou a pauta.',
      ],
    },
    advance: { flag: 'infancia' },
  },
  {
    n: 9,
    id: 'a_visitante',
    title: 'A VISITANTE',
    epigraph: '"não sei se é uma previsão ou um pedido."',
    objective: 'Subir ao sótão.',
    reality: 5,
    onStart: {
      monologue: [
        'Tem um alçapão no teto do corredor. Eu passei por baixo dele umas quinze vezes hoje.',
        'Eu reparo em tudo. É literalmente o meu trabalho reparar em tudo.',
      ],
    },
    advance: { flag: 'encarou_visitante' },
  },
  {
    n: 10,
    id: 'a_casa_final',
    title: 'A CASA',
    epigraph: '"o que é que você vai fazer com o resto da sua vida?"',
    objective: 'Fechar o caso na máquina do escritório — ou voltar para o carro.',
    reality: 5,
    onStart: {
      monologue: [
        'Não tem mais nada para achar nesta casa. Eu sei disso do jeito que a gente sabe que uma apuração acabou: as fontes começam a se repetir.',
        'O que sobrou é o que eu faço com isso.',
        'Tem uma máquina de escrever no escritório com uma frase pela metade. E tem um carro do lado de fora da porteira com o tanque cheio.',
      ],
    },
    advance: { flag: 'final_escolhido' },
  },
];

/* ------------------------------- os finais ------------------------------- */
// Nenhum prova nada. Cada um deixa uma farpa que contradiz a leitura que ele
// mesmo acabou de oferecer — é isso que sustenta a discussão depois do jogo.

export const ENDINGS = {
  helena: {
    id: 'helena',
    title: 'FINAL A — HELENA',
    lean: 'sobrenatural',
    text: [
      'Laura fecha a porta da frente por fora e devolve a chave para debaixo do vaso da direita, porque é ali que ela fica.',
      'Ela dirige até o posto desativado antes de perceber que não conferiu a hora nenhuma vez na estrada.',
      'Na caixa de correio da casa, dois dias depois, o carteiro deposita um envelope sem remetente, endereçado com uma letra firme, inclinada para a direita, com o "t" cortado bem alto.',
    ],
    splinter: 'O laudo do Instituto de Criminalística, anexado ao processo seis meses depois, conclui que a fotografia apresenta sinais de manipulação química compatíveis com técnicas de laboratório disponíveis em 1998.',
  },
  laura: {
    id: 'laura',
    title: 'FINAL B — LAURA',
    lean: 'psicologica',
    text: [
      'Laura senta no degrau da varanda até o céu clarear, porque dirigir naquele estado seria irresponsável, e ser irresponsável é a única coisa que ela ainda consegue evitar.',
      'Ela liga para o irmão. Ele atende no quinto toque, e a primeira coisa que ele diz é o nome dela, e a segunda é: "de novo?".',
      'Ela não pergunta o que ele quis dizer com "de novo". Fica com a pergunta na garganta por toda a viagem de volta e por todos os anos seguintes.',
    ],
    splinter: 'A caixa de papelão que Laura leva embora contém dezenove folhas manuscritas. Quando ela as espalha sobre a mesa do apartamento, três semanas depois, são vinte e duas.',
  },
  verdade: {
    id: 'verdade',
    title: 'FINAL C — A VERDADE',
    lean: 'conspiracao',
    text: [
      'O nome no débito automático é de uma empresa aberta em 1999, encerrada em 2016 e reaberta em 2021 no mesmo CNPJ.',
      'Laura leva quatro meses para chegar ao endereço, e quando chega, é uma sala comercial com uma secretária que sorri, oferece café e diz que o titular está viajando.',
      'A matéria sai em fevereiro. Onze mil palavras, nome, CNPJ, datas. É o melhor texto que ela já escreveu. Ninguém é preso.',
    ],
    splinter: 'Na última página do caderno de Helena, numa folha que Laura jura ter fotografado em branco, está escrito: "ela vai achar a empresa. deixa ela achar. é mais fácil do que a outra coisa."',
  },
  // Final de recusa: não depende da leitura acumulada, e sim de Laura sair.
  // É o único que o jogador escolhe sabendo que escolheu.
  partir: {
    id: 'partir',
    title: 'FINAL D — PARTIR',
    lean: null,
    text: [
      'Laura fecha a porta do carro e fica com a mão na chave por mais tempo do que precisaria.',
      'A casa some no retrovisor em três curvas. Não some de uma vez: aparece de novo na segunda curva, menor, e depois não aparece mais.',
      'Ela não escreve a matéria. Não porque tenha medo do que aconteceria — porque toda versão que ela ensaia em voz alta na estrada começa com "eu não consigo provar, mas".',
      'Em algum momento perto do amanhecer ela percebe que está dirigindo devagar demais, e acelera, e não volta a pensar nisso.',
    ],
    splinter: 'Três semanas depois, arrumando o porta-luvas, ela encontra uma chave que não é dela, embrulhada num plástico dobrado com cuidado. O plástico não tem vinte e sete anos.',
  },

  incerto: {
    id: 'incerto',
    title: 'FINAL — A VISITANTE',
    lean: null,
    text: [
      'Laura não escolhe.',
      'Ela guarda os cadernos, as fitas e a fotografia numa caixa, e a caixa num armário, e não conta a ninguém — nem por medo, nem por vergonha, mas porque toda versão que ela ensaia em voz alta soa como a versão de uma pessoa que precisa de ajuda.',
      'Ela volta à casa em outubro. Depois em março. Depois sem contar.',
      'Em algum momento ela para de trancar a porta ao sair.',
    ],
    splinter: 'Vinte e sete anos é exatamente a distância entre 1998 e hoje. É também, se alguém estiver contando, a distância entre hoje e o dia em que outra pessoa vai encontrar esta casa.',
  },
};
