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

  /* ---------------------- capítulo 6 — A PRESENÇA ---------------------- */

  chave_aparecida: {
    n: 21, title: 'A chave que apareceu',
    text: 'Etiqueta "ARQ", sobre o aparador da entrada. Eu revirei aquela pilha de correspondência no meu primeiro quarto de hora nesta casa.',
    tags: ['presenca', 'impossivel', 'recente'],
  },
  casa_mexeu: {
    n: 22, title: 'As coisas mudaram de lugar',
    text: 'A cadeira da cozinha está no corredor, virada para a porta do porão. A caixa de música saiu do quarto e está na entrada. Nada disso é discutível: eu fotografei os dois cômodos.',
    tags: ['presenca', 'impossivel'],
  },
  porta_aberta: {
    n: 23, title: 'A porta da frente',
    text: 'Eu tranquei. Tenho certeza de que tranquei, porque pensei em não trancar e decidi trancar. Estava aberta.',
    tags: ['presenca', 'recente', 'eu'],
  },
  mulher_da_familia: {
    n: 24, title: '"veio uma mulher. disse que era da família."',
    text: 'Em 3 de novembro de 1998, alguém retirou o material apreendido de Helena alegando parentesco — de uma mulher sem parentes — e o devolveu à casa, organizado por ano.',
    tags: ['conspiracao', 'presenca', '1998'],
  },
  gaveta_g: {
    n: 25, title: 'A gaveta G',
    text: 'O índice de Helena vai de A a G. A pasta G nunca foi escrita. A gaveta existe, está vazia, e o fundo não tem poeira.',
    tags: ['helena', 'metodo'],
  },
  caderno_porao: {
    n: 26, title: 'Vinte e três dias no porão',
    text: 'Alguém morou aqui embaixo sabendo que havia outra pessoa na casa, e nunca subiu. "a porta abre pelo lado de dentro. eu conferi todos os dias."',
    tags: ['porao', 'segunda_pessoa', 'helena'],
  },
  bilhete_lampiao: {
    n: 27, title: '"eu esperei vinte e sete anos"',
    text: 'Bilhete sob o lampião do porão, com a dobra gasta de tanto ser aberta e fechada. Vinte e sete anos é exatamente a distância entre 1998 e hoje.',
    tags: ['porao', 'impossivel', 'previsao'],
  },
  letra_diferente: {
    n: 28, title: 'A letra quase igual',
    text: 'O caderno do porão tem a inclinação de Helena e o "t" alto de Helena. Mas o "g" desce reto, e o dela tem uma volta.',
    tags: ['helena', 'segunda_pessoa', 'eu'],
  },

  /* --------------------- capítulo 7 — HELENA --------------------------- */

  poco_lacrado: {
    n: 29, title: 'O poço reassentado',
    text: 'A casa foi construída sobre um poço. Seco desde 1993, tampado com laje. Alguém pagou pelo "reassentamento" da laje em 12 de novembro de 1998 — quarenta e um dias depois de Helena desaparecer.',
    tags: ['poco', 'recente', 'conspiracao', '1998'],
  },
  fita_02: {
    n: 30, title: 'A pedra que caiu de dois jeitos',
    text: 'Helena jogou uma pedra no poço duas vezes e contou tempos diferentes. "A mesma pedra não pode cair de dois jeitos. Eu sou uma mulher adulta e eu sei disso."',
    tags: ['poco', 'impossivel', 'helena', 'clinico'],
  },
  pasta_g_existe: {
    n: 31, title: 'A pasta G existe',
    text: 'Ela escreveu no índice que tinha decidido não escrever a G. A pasta G tem cento e poucas folhas e é a mais grossa de todas. E é sobre ela mesma.',
    tags: ['helena', 'metodo', 'contradicao'],
  },
  helena_depois: {
    n: 32, title: '"conferido. tudo bate. 3 de novembro"',
    text: 'A última folha da pasta G foi escrita com outra caneta, e a data não tem ano. Em 3 de novembro de 1998, uma mulher retirou o material de Helena na delegacia dizendo ser da família.',
    tags: ['helena', 'depois', 'segunda_pessoa'],
  },
  onze_dias: {
    n: 33, title: 'A última camada tem onze riscos',
    text: 'Os riscos na parede do porão vão em camadas de décadas. A camada de cima, a mais recente, tem onze. Eu fiquei onze dias com aquela carta antes de vir.',
    tags: ['porao', 'previsao', 'recente', 'eu'],
  },
  helena_cicatriz: {
    n: 34, title: 'A cicatriz na descrição dela',
    text: 'Seção B da pasta G, descrição física de Helena: "cicatriz fina no dorso da mão esquerda, de vidro, da infância". Eu tenho essa cicatriz. Ela estava descrevendo a si mesma.',
    tags: ['eu', 'helena', 'espelho'],
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

  /* ---------------------- capítulo 6 — A PRESENÇA ---------------------- */

  {
    a: 'porta_aberta', b: 'chave_aparecida',
    title: 'Alguém entrou enquanto eu estava aqui dentro',
    text: 'A porta que eu tranquei estava aberta, e sobre o aparador havia uma chave que não estava lá. As duas coisas juntas não são um fenômeno: são uma pessoa com um molho de chaves e a paciência de esperar eu ir para os fundos.',
    lean: { conspiracao: 4 },
  },
  {
    a: 'casa_mexeu', b: 'relogio_parado',
    title: 'Ou a casa se mexe, ou eu me mexo',
    text: 'Uma cadeira mudou de cômodo, uma caixa de música mudou de cômodo, e eu tenho quatro meses de insônia e um histórico de lapsos que eu nunca contei ao médico. Se eu estivesse apurando o caso de outra pessoa, já sabia qual das duas hipóteses eu escreveria primeiro.',
    lean: { psicologica: 4 },
  },
  {
    a: 'mulher_da_familia', b: 'mesma_maquina',
    title: 'A mesma pessoa, desde 1998',
    text: 'Uma mulher retirou o material da polícia em novembro de 1998 alegando um parentesco inexistente. Alguém digitou a minha carta na máquina desta casa em algum momento dos últimos meses. Se for a mesma pessoa, ela vem mantendo isto de pé por vinte e sete anos — e eu sou a primeira coisa que ela decidiu trazer para dentro.',
    lean: { conspiracao: 4, sobrenatural: 1 },
  },
  {
    a: 'caderno_porao', b: 'letra_diferente',
    title: 'A pessoa do porão',
    text: 'Alguém morou aqui embaixo por semanas, escrevendo com uma letra que é quase a de Helena. Ou Helena desceu e passou a escrever diferente, ou havia uma segunda mulher nesta casa desde sempre — e foi ela quem sentou à segunda cadeira da mesa posta.',
    lean: { conspiracao: 2, psicologica: 2, sobrenatural: 1 },
  },
  {
    a: 'bilhete_lampiao', b: 'carta_impossivel',
    title: 'Vinte e sete anos de espera',
    text: '"eu esperei vinte e sete anos, você pode esperar dez minutos." A carta de julho de 1998 já descrevia a minha chegada. Alguém, em algum lugar deste intervalo, sabia a data de hoje.',
    lean: { sobrenatural: 4 },
  },
  {
    a: 'caderno_porao', b: 'mesa_para_dois',
    title: 'A segunda pessoa morava embaixo',
    text: 'A polícia não conseguiu identificar quem sentou à segunda cadeira em outubro de 1998. Havia uma pessoa morando no porão, contando os dias, ouvindo Helena andar por cima. Isso explica a mesa posta e não explica mais nada — porque essa pessoa também sumiu.',
    lean: { conspiracao: 3, psicologica: 1 },
  },
  {
    a: 'gaveta_g', b: 'secao_d',
    title: 'O que Helena não quis fixar',
    text: 'Ela catalogou tudo, testou tudo, verificou vinte e duas afirmações. E deixou uma pasta sem nome, vazia, com o fundo limpo. "escrever fixa, e enquanto não estiver escrito ainda dá para ser outra coisa."',
    lean: { sobrenatural: 2, psicologica: 2 },
  },
  {
    a: 'chave_aparecida', b: 'lista_sobre_mim',
    title: 'Item 3',
    text: '"Não vai bater na porta. Vai olhar embaixo do vaso primeiro." Helena sabia onde eu procuraria uma chave. E hoje uma chave apareceu exatamente no lugar onde eu já tinha procurado, e não estava.',
    lean: { sobrenatural: 3, conspiracao: 2 },
  },

  /* --------------------- capítulo 7 — HELENA ---------------------------
   * As conexões deste capítulo pendem deliberadamente para a leitura
   * psicológica: até o capítulo 6 ela acumulava 23 pontos contra 29 das
   * outras duas, e uma interpretação mais difícil de alcançar que as demais
   * não é ambiguidade, é viés.
   * ------------------------------------------------------------------- */

  {
    a: 'helena_cicatriz', b: 'lista_sobre_mim',
    title: 'Ela descreveu a mim ou a si mesma?',
    text: 'A cicatriz de vidro na mão esquerda está na lista sobre a visitante E na descrição física que Helena fez de si mesma. Os dois documentos descrevem a mesma mão. Um deles está errado sobre de quem ela é — e não há nada no papel que diga qual.',
    lean: { psicologica: 3, sobrenatural: 2 },
  },
  {
    a: 'fita_02', b: 'secao_d',
    title: 'A pedra e o método',
    text: 'Ela mediu a queda de uma pedra duas vezes e obteve tempos diferentes, e a resposta dela a isso foi a mesma que deu à visitante: conferir. Vinte e duas afirmações, dezenove confirmadas. Quem inventa uma anomalia não a cronometra duas vezes esperando que ela suma.',
    lean: { sobrenatural: 4, psicologica: 1 },
  },
  {
    a: 'poco_lacrado', b: 'bilhete_lampiao',
    title: 'Quarenta e um dias, vinte e sete anos',
    text: 'A laje foi reassentada quarenta e um dias depois de Helena sumir, e o bilhete sob o lampião diz "eu esperei vinte e sete anos". Alguém fechou este poço sabendo exatamente quanto tempo ia levar até alguém abri-lo de novo.',
    lean: { sobrenatural: 3, conspiracao: 2 },
  },
  {
    a: 'pasta_g_existe', b: 'gaveta_g',
    title: 'Ela escreveu a pasta que jurou não escrever',
    text: '"Decidi hoje que não vou escrever a G." E a G tem cento e poucas folhas, e é a mais grossa de todas, e estava no fundo de um poço. Ou ela mentiu no índice, ou escreveu depois de escrever o índice — ou não foi ela quem escreveu.',
    lean: { psicologica: 3, conspiracao: 2 },
  },
  {
    a: 'helena_depois', b: 'mulher_da_familia',
    title: 'A mulher da delegacia',
    text: 'A última folha da pasta G diz "3 de novembro" sem ano. Em 3 de novembro de 1998, uma mulher retirou o material de Helena alegando parentesco. Se for a mesma data, Helena estava viva um mês depois de desaparecer — ou alguém estava escrevendo no lugar dela com a mão firme.',
    lean: { conspiracao: 3, psicologica: 2 },
  },
  {
    a: 'helena_depois', b: 'letra_diferente',
    title: 'A caneta azul',
    text: 'A última anotação da pasta G foi feita com a caneta cujo "g" desce reto — a mesma do caderno de quem contou vinte e três dias no porão. Quem terminou o arquivo de Helena foi quem morou embaixo da casa dela.',
    lean: { psicologica: 3, conspiracao: 2 },
  },
  {
    a: 'fita_02', b: 'mesmo_remedio',
    title: '"Eu sou uma mulher adulta e eu sei disso"',
    text: 'Ela jogou a mesma pedra duas vezes e contou tempos diferentes, e a frase seguinte foi uma pessoa se agarrando à própria sanidade em voz alta. Paralisia do sono, cinco meses de insônia, lorazepam. Eu escreveria esse laudo de olhos fechados se fosse sobre outra pessoa.',
    lean: { psicologica: 4 },
  },
  {
    a: 'poco_lacrado', b: 'conta_paga',
    title: 'Alguém paga as contas desta casa desde 1998',
    text: 'Uma laje reassentada quarenta e um dias depois do desaparecimento, e energia paga no mês passado. Não é uma casa esquecida: é uma casa administrada, sem interrupção, por vinte e sete anos.',
    lean: { conspiracao: 4 },
  },
  {
    a: 'onze_dias', b: 'carta_recebida',
    title: 'Onze riscos',
    text: 'A camada mais recente de riscos na parede do porão tem onze. Eu fiquei onze dias com a carta antes de vir. Alguém aqui embaixo contou a minha hesitação, dia por dia, enquanto eu ainda estava a quatrocentos quilômetros daqui.',
    lean: { sobrenatural: 3, conspiracao: 2 },
  },
  {
    a: 'onze_dias', b: 'relogio_parado',
    title: 'Os números que são meus',
    text: 'Onze dias. Três e quarenta e sete. Trinta e oito anos. Esta casa está cheia dos meus números, e eu sou a única pessoa aqui que poderia tê-los trazido.',
    lean: { psicologica: 4, sobrenatural: 1 },
  },
  {
    a: 'fita_02', b: 'caderno_porao',
    title: 'O único lugar onde ela não escutava',
    text: 'Helena descia ao porão porque era o único lugar silencioso da casa. Alguém morou nesse silêncio por vinte e três dias, ouvindo os passos dela por cima. As duas estavam procurando a mesma coisa em andares diferentes.',
    lean: { psicologica: 2, sobrenatural: 2, conspiracao: 1 },
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
