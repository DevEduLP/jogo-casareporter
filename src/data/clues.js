// clues.js — pistas, conexões e itens.
//
// O jogador não apenas coleta pistas: pode CRUZAR duas pistas no diário. Se o
// par for significativo, nasce uma dedução. Cada dedução pende para uma das
// três interpretações — e é a soma dessas inclinações que decide qual final
// fica disponível. O jogo nunca diz ao jogador que está escolhendo um final.

export const CLUES = {
  carta_recebida: {
    n: 1, title: 'A carta sem remetente',
    text: 'Alguém sabe do meu divórcio, da minha insônia e do horário exato em que eu acordo. Postada em Vale das Pedras.',
    tags: ['carta'],
  },
  chave_no_lugar: {
    n: 2, title: 'A chave embaixo do vaso',
    text: 'Exatamente onde a carta disse que estaria. O vaso da direita. Eu nem cheguei a tentar o da esquerda.',
    tags: ['casa', 'previsao'],
  },
  conta_paga: {
    n: 3, title: 'A conta de luz está paga',
    text: 'Consumo de 41 kWh no mês passado, numa casa vazia há vinte e sete anos. Alguém mantém esta casa viva.',
    tags: ['presenca', 'recente'],
  },
  mesa_para_dois: {
    n: 4, title: 'A mesa posta para duas pessoas',
    text: 'Inquérito de 1998: comida para dois, decomposição de 72 horas. A segunda pessoa nunca foi identificada.',
    tags: ['1998', 'segunda_pessoa'],
  },
  mesma_idade: {
    n: 5, title: 'Trinta e oito anos',
    text: 'A idade de Helena quando desapareceu. A minha idade agora.',
    tags: ['helena', 'eu'],
  },
  bilhete_geladeira: {
    n: 6, title: '"não deixar o corredor no escuro"',
    text: 'Última linha de uma lista de compras banal. Eu tenho a mesma regra. Sempre tive.',
    tags: ['helena', 'eu'],
  },
  visitante_existe: {
    n: 7, title: 'A visitante que ainda viria',
    text: 'Desde março de 1998, Helena escreve sobre uma mulher que ainda vai chegar. Casaco escuro, comprido demais para o calor.',
    tags: ['visitante', 'casaco'],
  },
  lista_sobre_mim: {
    n: 8, title: 'A lista de onze itens',
    text: 'Helena listou o que sabia sobre a visitante. Sete acertos sobre mim, incluindo a cicatriz na mão esquerda, que eu nunca contei a ninguém.',
    tags: ['visitante', 'eu', 'previsao'],
  },
  mesmo_remedio: {
    n: 9, title: 'Lorazepam',
    text: 'Receitado a Helena em agosto de 1998 para paralisia do sono. Eu tomei o mesmo por quatro meses este ano.',
    tags: ['helena', 'eu', 'clinico'],
  },
  remedios: {
    n: 10, title: '"lucidez"',
    text: 'A palavra escrita no campo de diagnóstico presumido do encaminhamento que nunca foi entregue.',
    tags: ['clinico'],
  },
  medo_de_helena: {
    n: 11, title: 'O medo de Helena',
    text: '"Não tenho medo dela. Tenho medo de que ela chegue e eu não esteja mais aqui para explicar."',
    tags: ['helena', 'visitante'],
  },
  fita_helena: {
    n: 12, title: 'A gravação de 30 de agosto',
    text: 'Helena antecipa as duas versões oficiais — fuga e suicídio — e nega as duas. "Eu não sei o que é a terceira coisa."',
    tags: ['helena', '1998', 'desaparecimento'],
  },
  carta_impossivel: {
    n: 13, title: 'A carta de 21 de julho de 1998',
    text: 'Descreve a minha chegada de hoje: o carro parado antes da porteira, o vaso, a lanterna acesa antes de precisar. Termina com "Ela ainda não sabe que está aqui."',
    tags: ['impossivel', 'previsao', 'eu'],
  },
  secao_d: {
    n: 14, title: 'Seção D — as verificações',
    text: 'Helena testou a própria alucinação com vinte e duas afirmações verificáveis. Dezenove se confirmaram, incluindo uma cidade que só existiria a partir de 2004.',
    tags: ['impossivel', 'metodo', 'previsao'],
  },
  mesma_maquina: {
    n: 15, title: 'A mesma máquina de escrever',
    text: 'O "a" com o vinco e o "s" alto. A carta que me trouxe até aqui foi datilografada na máquina do escritório de Helena.',
    tags: ['carta', 'presenca', 'recente'],
  },
  casaco: {
    n: 16, title: 'O casaco no guarda-roupa',
    text: 'Lã grossa, escuro, comprido, errado para o clima daqui. Igual ao que eu estou usando.',
    tags: ['visitante', 'casaco', 'eu'],
  },
  fotografia: {
    n: 17, title: 'A fotografia',
    text: 'Helena na frente desta casa, em março. Quando eu voltei à sala, havia uma segunda pessoa no enquadramento.',
    tags: ['impossivel', 'segunda_pessoa', 'fotografia'],
  },
  cadeado_novo: {
    n: 18, title: 'O cadeado do porão',
    text: 'Enferrujado por cima, limpo por baixo. Foi aberto recentemente, e mais de uma vez.',
    tags: ['presenca', 'recente'],
  },
  duas_xicaras: {
    n: 19, title: 'Duas xícaras',
    text: 'Uma escorrida há muito tempo. A outra com um anel de café seco no fundo. Duas.',
    tags: ['segunda_pessoa', 'presenca'],
  },
  relogio_parado: {
    n: 20, title: 'Os relógios',
    text: 'O relógio da sala e o do corredor marcam 3h47. Os dois. É a hora em que eu acordo todas as noites.',
    tags: ['eu', 'impossivel'],
  },
};

/**
 * Conexões válidas. `a` e `b` são ids de pistas; a ordem não importa.
 * `lean` distribui peso entre as três interpretações.
 */
export const CONNECTIONS = [
  {
    a: 'carta_recebida', b: 'mesma_maquina',
    title: 'Alguém esteve nesta casa',
    text: 'A carta que me trouxe aqui saiu da máquina do escritório — uma sala que estava trancada por dentro. Ou alguém tem a chave e entra quando quer, ou eu preciso rever o que significa "trancada por dentro".',
    lean: { conspiracao: 3, sobrenatural: 1 },
  },
  {
    a: 'conta_paga', b: 'cadeado_novo',
    title: 'A casa tem um zelador',
    text: 'Energia paga, cadeado lubrificado, poste sem mato. Isto não é uma casa abandonada. É uma casa mantida. Manutenção custa dinheiro e exige uma pessoa com um nome.',
    lean: { conspiracao: 3 },
  },
  {
    a: 'mesa_para_dois', b: 'duas_xicaras',
    title: 'Helena não estava sozinha',
    text: 'Em 1998 a polícia achou a mesa posta para dois e não conseguiu identificar o segundo. As duas xícaras continuam na cozinha. Uma delas foi usada depois da outra — muito depois.',
    lean: { conspiracao: 2, sobrenatural: 1 },
  },
  {
    a: 'lista_sobre_mim', b: 'secao_d',
    title: 'Helena verificou',
    text: 'Ela não se contentou em ver: testou. Dezenove de vinte e duas afirmações confirmadas, e uma delas dependia de um município que só foi emancipado em 2004. Ou ela teve acesso a informação que não existia, ou alguém escreveu essas folhas muito depois de 1998.',
    lean: { sobrenatural: 3, conspiracao: 2 },
  },
  {
    a: 'carta_impossivel', b: 'chave_no_lugar',
    title: 'Ela descreveu a minha chegada',
    text: 'A carta previu o vaso da direita, a lanterna acesa cedo demais, o carro parado antes da porteira. Cada item, sozinho, é o que qualquer visitante faria. Todos juntos, na ordem, são outra coisa.',
    lean: { sobrenatural: 3, psicologica: 1 },
  },
  {
    a: 'mesma_idade', b: 'mesmo_remedio',
    title: 'A mesma mulher, com vinte e sete anos de atraso',
    text: 'Trinta e oito anos, sozinha, insone, medicada com a mesma substância, escrevendo obsessivamente sobre uma mulher que ela conhece em detalhe e nunca encontrou. Uma de nós é o espelho da outra. Não sei de que lado do vidro eu estou.',
    lean: { psicologica: 3, sobrenatural: 1 },
  },
  {
    a: 'bilhete_geladeira', b: 'relogio_parado',
    title: 'As minhas manias, na letra dela',
    text: 'Não deixar o corredor no escuro. Três e quarenta e sete. Coisas que eu nunca disse em voz alta porque não são assunto — e que estão nesta casa desde antes de eu saber que ela existia.',
    lean: { psicologica: 2, sobrenatural: 2 },
  },
  {
    a: 'visitante_existe', b: 'casaco',
    title: 'O casaco',
    text: 'Ela descreveu a peça de roupa que eu escolhi esta manhã, num armário, em março de 1998. Ou eu me vesti para caber na descrição sem saber que a conhecia.',
    lean: { sobrenatural: 2, psicologica: 2 },
  },
  {
    a: 'fotografia', b: 'mesa_para_dois',
    title: 'A segunda pessoa',
    text: 'Há uma segunda pessoa na mesa de 1998, uma segunda xícara na cozinha e uma segunda figura na fotografia. Nenhuma delas tem nome. Todas têm o mesmo casaco.',
    lean: { sobrenatural: 2, conspiracao: 2 },
  },
  {
    a: 'medo_de_helena', b: 'fita_helena',
    title: 'Ela sabia que ia acabar',
    text: 'Helena não temia a visitante: temia não estar aqui quando ela chegasse. E gravou uma fita antecipando as duas explicações que dariam para o seu sumiço. Quem prevê a própria versão oficial já sabe que vai haver uma.',
    lean: { conspiracao: 2, sobrenatural: 1, psicologica: 1 },
  },
  {
    a: 'remedios', b: 'secao_d',
    title: 'Lucidez',
    text: 'O médico — ou ela — escreveu "lucidez" no campo do diagnóstico. E depois ela montou um protocolo de verificação melhor do que o de metade das redações em que eu trabalhei. Loucos não fazem controle de qualidade da própria loucura.',
    lean: { sobrenatural: 2, psicologica: 2 },
  },
  {
    a: 'fotografia', b: 'relogio_parado',
    title: 'O que eu vi',
    text: 'Uma fotografia mudou e dois relógios marcam a minha hora. Eu não dormi direito em quatro meses. Sei exatamente o que um bom repórter escreveria sobre uma testemunha nas minhas condições.',
    lean: { psicologica: 3 },
  },
];

/* ---------------------------------- itens -------------------------------- */

export const ITEMS = {
  lanterna: {
    name: 'Lanterna', icon: '▮',
    desc: 'Comprada num posto na estrada. Pilhas novas. Foi a única decisão prática que eu tomei hoje.',
  },
  carta_convite: {
    name: 'A carta', icon: '✉',
    desc: 'Papel comum, datilografado. Onze dias comigo.',
    readable: 'carta_convite',
  },
  chave_casa: {
    name: 'Chave da casa', icon: '⚷',
    desc: 'Estava embaixo do vaso da direita, embrulhada num plástico dobrado com cuidado. O plástico não tem vinte e sete anos.',
  },
  chave_pequena: {
    name: 'Chave miúda', icon: '⚿',
    desc: 'Do tamanho de uma unha. Estava entre o colchão e o estrado, do lado direito da cama.',
  },
  chave_escritorio: {
    name: 'Chave do escritório', icon: '🗝',
    desc: 'Estava dentro da caixa de música, sob o mecanismo. "No lugar onde a gente esconde chave quando quer que seja encontrada."',
  },
  chave_arquivo: {
    name: 'Chave do arquivo', icon: '🗝',
    desc: 'Etiqueta de papel presa com barbante: "ARQ".',
  },
  chave_porao: {
    name: 'Chave do cadeado', icon: '🗝',
    desc: 'Pesada. O dente está polido de uso recente.',
  },
  fita_01: {
    name: 'Fita 01', icon: '▤',
    desc: '"casa (quarto/corredor)". Escrito à mão na etiqueta.',
  },
  fotografia: {
    name: 'Fotografia', icon: '▣',
    desc: 'Helena na frente desta casa. Março.',
    readable: 'foto_escrivaninha',
  },
};
