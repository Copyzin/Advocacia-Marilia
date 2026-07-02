// Gerador estatico do blog da Advocacia Marilia (precedente: Gomes & Caputo).
// Fonte unica: o array ARTICLES abaixo. Rode `node tools/build-blog.mjs` na raiz
// do projeto para (re)gerar /blog/index.html e /blog/<slug>/index.html.
// Para adicionar um artigo: acrescente um item em ARTICLES e rode de novo.

import { mkdirSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const CSS_V = 27;
const JS_V = 11;
const WA = 'https://wa.me/551434138384';

// Ponto focal do rosto por foto (object-position/zoom do thumbnail do autor).
// Enquadramento fechado (referencia do cliente): rosto + pescoco + colo, margem
// minima acima da cabeca, sem o logo do fundo. Derivado da geometria do corte
// (janela visivel = 1/fs da largura; topo = fy * (0.667*(1-1/fs) + 0.333) da altura)
// a partir do topo-de-cabeca/centro/altura do rosto lidos em cada retrato,
// com crop_h ~= 2.25x a altura do rosto; conferido visualmente em pagina de teste.
const FACE_FOCUS = {
    'francisco.webp':     { fx: '50%', fy: '24%', fs: '1.98' },
    'rogerioortega.webp': { fx: '58%', fy: '30%', fs: '2.05' },
    'rogeriomacedo.webp': { fx: '53%', fy: '38%', fs: '1.58' },
    'cleomara.webp':      { fx: '63%', fy: '35%', fs: '1.88' },
    'patricia.webp':      { fx: '63%', fy: '52%', fs: '1.84' },
    'simone.webp':        { fx: '85%', fy: '47%', fs: '2.18' },
    'carina.webp':        { fx: '53%', fy: '35%', fs: '1.78' },
    'joseaugusto.webp':   { fx: '59%', fy: '33%', fs: '1.68' },
    'alessandra.webp':    { fx: '62%', fy: '39%', fs: '2.65' },
};

const CATEGORIES = [
    { id: 'previdenciario', name: 'Direito Previdenciário', sub: 'Aposentadorias, benefícios e planejamento junto ao INSS.' },
    { id: 'familia-sucessoes', name: 'Família e Sucessões', sub: 'Inventários, partilhas, divórcios e planejamento sucessório.' },
    { id: 'imobiliario', name: 'Direito Imobiliário', sub: 'Compra e venda, locações e regularização de imóveis.' },
    { id: 'trabalhista', name: 'Direito do Trabalho', sub: 'Relações de emprego, verbas e prevenção de litígios.' },
    { id: 'penal', name: 'Direito Penal e Execução Penal', sub: 'Defesa criminal, flagrantes e direitos na execução da pena.' },
    { id: 'civil-consumidor', name: 'Civil e Consumidor', sub: 'Contratos, cobranças e relações de consumo.' },
];

const ARTICLES = [
    {
        slug: 'planejamento-previdenciario',
        cat: 'previdenciario',
        title: 'Planejamento previdenciário: como garantir uma aposentadoria segura',
        date: '15 de Junho, 2026',
        dateISO: '2026-06-15',
        excerpt: 'Entenda a importância de planejar a aposentadoria com antecedência, analisando as regras de transição e o melhor momento para o requerimento.',
        author: { name: 'Dra. Carina Alves', oab: 'OAB/SP 266.124', photo: 'carina.webp', bio: 'Mais de 15 anos de prática especializada no Direito Previdenciário, com atuação em planejamento previdenciário, aposentadorias especiais, benefícios de incapacidade e revisões.' },
        body: `
<p>A aposentadoria é uma das decisões financeiras mais importantes da vida, embora seja uma das menos planejadas. Desde a Reforma da Previdência de 2019, conviver com regras de transição, idades mínimas progressivas e diferentes formas de cálculo tornou o requerimento no momento errado um risco real: a diferença entre duas datas próximas pode significar valores de benefício bastante distintos.</p>
<h2>O que é o planejamento previdenciário</h2>
<p>O planejamento previdenciário é um estudo técnico da vida contributiva do segurado. Ele levanta todo o histórico de contribuições no CNIS, identifica períodos que podem estar faltando (como trabalho rural, atividade especial ou vínculos não registrados) e projeta os cenários possíveis de aposentadoria, comparando valor, data e requisitos de cada um.</p>
<h2>Por que vale a pena planejar antes de requerer</h2>
<ul>
<li>Identificar a regra de transição mais vantajosa para o seu caso concreto;</li>
<li>Corrigir o CNIS antes do requerimento, evitando indeferimentos e atrasos;</li>
<li>Reconhecer tempo especial (insalubridade ou periculosidade) que aumenta o tempo computado;</li>
<li>Decidir se vale a pena contribuir por mais alguns meses para melhorar o valor;</li>
<li>Evitar o chamado requerimento precoce, que pode reduzir o benefício de forma definitiva.</li>
</ul>
<h2>Documentos que ajudam no estudo</h2>
<p>Para um diagnóstico completo, costumam ser úteis o extrato CNIS, a carteira de trabalho (física ou digital), carnês de contribuição, PPP e LTCAT para quem trabalhou em atividade especial, e documentos de atividade rural quando houver. Quanto mais completo o histórico, mais preciso o resultado.</p>
<h2>Quando começar</h2>
<p>O ideal é iniciar o planejamento alguns anos antes da data estimada da aposentadoria. Esse intervalo permite corrigir pendências com calma, reunir provas de períodos controversos e, se for o caso, ajustar a estratégia de contribuição. Mesmo quem já cumpriu os requisitos se beneficia do estudo antes de protocolar o pedido.</p>`,
    },
    {
        slug: 'bpc-loas-quem-tem-direito',
        cat: 'previdenciario',
        title: 'BPC/LOAS: quem tem direito ao benefício assistencial',
        date: '08 de Maio, 2026',
        dateISO: '2026-05-08',
        excerpt: 'O Benefício de Prestação Continuada garante um salário mínimo mensal a idosos e pessoas com deficiência em situação de vulnerabilidade. Veja os requisitos.',
        author: { name: 'Dra. Cleomara Siqueira', oab: 'OAB/SP 162.383', photo: 'cleomara.webp', bio: 'Especialista pós-graduada em Direito Previdenciário pelo IBMEC-SP e em Direito Processual Civil pela UNIVEM. Mestranda em Direito pela UNIMAR.' },
        body: `
<p>O Benefício de Prestação Continuada (BPC), previsto na Lei Orgânica da Assistência Social (LOAS), assegura um salário mínimo por mês a quem se enquadra em situações específicas de vulnerabilidade. Diferentemente da aposentadoria, ele não exige contribuições ao INSS, mas os requisitos são rigorosos e a análise costuma gerar dúvidas.</p>
<h2>Quem pode receber</h2>
<ul>
<li>Pessoas com 65 anos ou mais que comprovem baixa renda familiar;</li>
<li>Pessoas com deficiência de qualquer idade, com impedimento de longo prazo que dificulte a participação plena na sociedade.</li>
</ul>
<h2>O critério de renda</h2>
<p>Como regra geral, a renda por pessoa do grupo familiar deve ser inferior a 1/4 do salário mínimo. A composição do grupo familiar segue critérios legais próprios e nem todas as rendas entram no cálculo. Algumas decisões judiciais e alterações legislativas flexibilizaram o limite quando há gastos elevados com saúde, medicamentos ou cuidadores. Por isso, um indeferimento pelo critério de renda nem sempre é definitivo.</p>
<h2>O que significa impedimento de longo prazo</h2>
<p>Para a pessoa com deficiência, a lei exige impedimento físico, mental, intelectual ou sensorial com efeitos por pelo menos dois anos. A avaliação é feita em duas etapas: perícia médica e avaliação social. Laudos, receitas, exames e relatórios escolares ou terapêuticos são fundamentais para demonstrar como a condição limita a vida cotidiana.</p>
<h2>Pontos de atenção</h2>
<p>O BPC não paga 13º salário e não deixa pensão por morte. Ele também exige inscrição atualizada no CadÚnico. Em caso de negativa, é possível apresentar recurso administrativo ou buscar a via judicial, conforme o caso. Cada situação familiar tem particularidades que merecem análise individual.</p>`,
    },
    {
        slug: 'inventario-extrajudicial',
        cat: 'familia-sucessoes',
        title: 'Inventário extrajudicial: o caminho mais rápido para a partilha de bens',
        date: '02 de Junho, 2026',
        dateISO: '2026-06-02',
        excerpt: 'Saiba como realizar a partilha de bens de forma ágil em cartório, economizando tempo e evitando o desgaste de um processo judicial demorado.',
        author: { name: 'Dra. Patrícia Sausanavicius', oab: 'OAB/SP 263.193', photo: 'patricia.webp', bio: 'Mais de 19 anos de experiência em planejamento sucessório, inventários judiciais e extrajudiciais, divórcios e Direito Imobiliário.' },
        body: `
<p>Perder alguém já é difícil. Enfrentar anos de processo judicial para regularizar os bens da família torna tudo ainda mais desgastante. Desde 2007, a lei permite que muitos inventários sejam feitos diretamente em cartório, por escritura pública: o chamado inventário extrajudicial, que costuma ser concluído em semanas, e não em anos.</p>
<h2>Quando o inventário pode ser feito em cartório</h2>
<ul>
<li>Todos os herdeiros são maiores, capazes e estão de acordo com a partilha;</li>
<li>Há assistência de advogado, exigida por lei para a lavratura da escritura;</li>
<li>Não há testamento (ou, conforme entendimentos mais recentes, o testamento já foi devidamente processado ou autorizado judicialmente).</li>
</ul>
<h2>Vantagens em relação ao inventário judicial</h2>
<p>A via extrajudicial reduz drasticamente o tempo de tramitação, tende a custar menos (emolumentos de cartório em vez de anos de custas e honorários processuais) e preserva a privacidade da família. A escritura tem a mesma força jurídica de uma decisão judicial para transferir os bens aos herdeiros.</p>
<h2>Documentos e etapas principais</h2>
<p>O processo envolve reunir certidões (óbito, casamento, nascimento), documentos dos bens (matrículas de imóveis, extratos, documentos de veículos), certidões negativas fiscais e o recolhimento do ITCMD: o imposto estadual sobre heranças. Com a documentação completa e o imposto pago, a escritura é lavrada e os bens podem ser registrados em nome dos herdeiros.</p>
<h2>E o prazo?</h2>
<p>Vale lembrar que a abertura do inventário deve ocorrer em até 60 dias do falecimento para evitar multa sobre o ITCMD em São Paulo. Mesmo famílias em consenso se beneficiam de orientação desde o início, para escolher a via adequada e não perder prazos fiscais.</p>`,
    },
    {
        slug: 'contratos-imobiliarios-compra-segura',
        cat: 'imobiliario',
        title: 'Contratos imobiliários: cuidados essenciais antes de assinar a compra',
        date: '24 de Maio, 2026',
        dateISO: '2026-05-24',
        excerpt: 'As principais cláusulas e verificações que devem ser feitas antes de assinar a compra de um imóvel, para prevenir fraudes e dores de cabeça futuras.',
        author: { name: 'Dr. Mauri Ortega', oab: 'OAB/SP 130.638', photo: 'joseaugusto.webp', bio: 'Advogado desde 1994, com atuação especializada em Direito Civil e Imobiliário, contratos rurais, partilhas e planejamento sucessório imobiliário.' },
        body: `
<p>A compra de um imóvel costuma ser a maior transação financeira da vida de uma família. Ainda assim, é comum que o contrato seja assinado sem uma análise jurídica prévia. Problemas que custariam pouco para prevenir acabam custando caro para remediar.</p>
<h2>Antes do contrato: a diligência</h2>
<p>A segurança da compra começa antes da minuta. É a chamada due diligence imobiliária: verificar a matrícula atualizada do imóvel no Cartório de Registro de Imóveis, conferir se há hipotecas, penhoras ou outras restrições, e levantar certidões do vendedor: cíveis, fiscais, trabalhistas e de protesto. Dívidas do vendedor podem, em certas situações, alcançar o imóvel vendido.</p>
<h2>Cláusulas que merecem atenção especial</h2>
<ul>
<li>Descrição exata do imóvel e correspondência com a matrícula;</li>
<li>Preço, forma de pagamento e índice de correção das parcelas;</li>
<li>Prazo e condições para a entrega das chaves e para a outorga da escritura;</li>
<li>Multas e consequências em caso de desistência ou inadimplemento de cada parte;</li>
<li>Responsabilidade por débitos anteriores (IPTU, condomínio) e pelas despesas de transferência.</li>
</ul>
<h2>Sinal, promessa e escritura</h2>
<p>O pagamento de sinal (arras) tem efeitos jurídicos próprios: quem desiste pode perdê-lo ou ter de devolvê-lo em dobro. O compromisso de compra e venda deve prever com clareza o caminho até a escritura definitiva e o registro, porque, no Direito brasileiro, só o registro na matrícula transfere efetivamente a propriedade.</p>
<h2>Imóveis na planta e situações especiais</h2>
<p>Compras na planta, imóveis rurais, imóveis de herança ou adquiridos de pessoa jurídica têm camadas adicionais de verificação. Nesses casos, a revisão do contrato por um advogado de confiança antes da assinatura é um investimento pequeno diante do patrimônio envolvido.</p>`,
    },
    {
        slug: 'locacao-de-imoveis-direitos-e-deveres',
        cat: 'imobiliario',
        title: 'Locação de imóveis: direitos e deveres de locador e locatário',
        date: '19 de Maio, 2026',
        dateISO: '2026-05-19',
        excerpt: 'Garantias, reajustes, benfeitorias e retomada do imóvel: o que a Lei do Inquilinato estabelece para cada parte na locação urbana.',
        author: { name: 'Dr. Francisco Rodrigues', oab: 'OAB/SP 70.088', photo: 'francisco.webp', bio: 'Advogado desde 1982, especializado em Direito Civil, do Trabalho e Imobiliário voltado a locações. Vice-Presidente da 31ª Subseção da OAB Marília (2025/2027).' },
        body: `
<p>A locação urbana é regida pela Lei do Inquilinato (Lei 8.245/91), que equilibra direitos e deveres entre quem aluga e quem ocupa o imóvel. Conhecer as regras básicas evita a maior parte dos conflitos e ajuda a resolver com rapidez os que surgirem.</p>
<h2>Garantias da locação</h2>
<p>A lei admite caução (até três aluguéis), fiança, seguro-fiança e cessão fiduciária de quotas de fundo de investimento. Um ponto importante: é vedado exigir mais de uma garantia no mesmo contrato. A escolha impacta tanto a segurança do locador quanto o bolso do locatário, e deve constar expressamente do contrato.</p>
<h2>Reajuste e revisão do aluguel</h2>
<p>O reajuste segue o índice e a periodicidade previstos em contrato, normalmente anual. Coisa diferente é a ação revisional: após três anos de vigência sem acordo, qualquer das partes pode pedir judicialmente a adequação do aluguel ao valor de mercado.</p>
<h2>Deveres de cada parte</h2>
<ul>
<li>Locador: entregar o imóvel em condições de uso, arcar com as despesas extraordinárias de condomínio (obras estruturais, fundo de reserva) e fornecer recibos;</li>
<li>Locatário: pagar pontualmente aluguel e encargos, conservar o imóvel, comunicar danos e restituí-lo no estado em que o recebeu, salvo desgaste natural;</li>
<li>Benfeitorias necessárias feitas pelo locatário são, em regra, indenizáveis, mas o contrato pode dispor de forma diversa, e essa cláusula merece leitura atenta.</li>
</ul>
<h2>Retomada do imóvel e ação de despejo</h2>
<p>Nos contratos de 30 meses ou mais, findo o prazo, o locador pode retomar o imóvel sem justificativa (a chamada denúncia vazia). Em contratos mais curtos prorrogados, a retomada depende das hipóteses legais: uso próprio, venda, reformas, entre outras. Já o despejo por falta de pagamento admite liminar em situações específicas e pode ser evitado pela purgação da mora, quando o locatário quita o débito no prazo legal.</p>`,
    },
    {
        slug: 'verbas-rescisorias-o-que-conferir',
        cat: 'trabalhista',
        title: 'Verbas rescisórias: o que conferir quando o contrato de trabalho termina',
        date: '27 de Maio, 2026',
        dateISO: '2026-05-27',
        excerpt: 'Demissão sem justa causa, pedido de demissão ou acordo: cada modalidade gera direitos diferentes. Saiba o que deve constar no seu acerto.',
        author: { name: 'Dr. Rogério Ortega', oab: 'OAB/SP 389.761', photo: 'rogerioortega.webp', bio: 'Pós-graduado em Direito e Processo do Trabalho, Direito Previdenciário e Processual Civil. Atua na advocacia trabalhista contenciosa e preventiva.' },
        body: `
<p>O fim do contrato de trabalho (qualquer que seja o motivo) gera o direito às chamadas verbas rescisórias. O valor e a composição do acerto mudam conforme a modalidade da saída, e é justamente aí que surgem os erros mais comuns, tanto por desconhecimento quanto por cálculo incorreto.</p>
<h2>O que muda conforme o tipo de desligamento</h2>
<ul>
<li>Dispensa sem justa causa: saldo de salário, aviso prévio (trabalhado ou indenizado), férias vencidas e proporcionais com 1/3, 13º proporcional, multa de 40% do FGTS, saque do FGTS e guias do seguro-desemprego;</li>
<li>Pedido de demissão: saldo de salário, férias vencidas e proporcionais com 1/3 e 13º proporcional, sem multa do FGTS e sem seguro-desemprego;</li>
<li>Acordo legal (art. 484-A da CLT): aviso prévio indenizado pela metade, multa de 20% do FGTS e saque de 80% do saldo, sem seguro-desemprego;</li>
<li>Justa causa: apenas saldo de salário e férias vencidas com 1/3, quando existentes.</li>
</ul>
<h2>Prazo de pagamento e multa por atraso</h2>
<p>O acerto deve ser pago em até 10 dias corridos do término do contrato. O atraso gera multa equivalente a um salário em favor do trabalhador (art. 477 da CLT), além de eventuais reflexos judiciais.</p>
<h2>Erros frequentes no cálculo</h2>
<p>Horas extras habituais, adicionais (noturno, insalubridade, periculosidade) e comissões integram a base de cálculo das demais verbas. Quando ficam de fora, o acerto sai menor do que o devido. Também merecem conferência o aviso prévio proporcional (3 dias a mais por ano de casa, até 90 dias) e a projeção dele nas férias e no 13º.</p>
<h2>Assinou a rescisão: perdeu o direito?</h2>
<p>Não. A assinatura do termo comprova o recebimento dos valores ali listados, mas não impede a cobrança de diferenças e verbas não pagas dentro do prazo prescricional de dois anos após o fim do contrato. Guardar holerites, controles de ponto e o termo de rescisão facilita muito essa conferência.</p>`,
    },
    {
        slug: 'prisao-em-flagrante-primeiras-providencias',
        cat: 'penal',
        title: 'Prisão em flagrante: primeiras providências e o papel da audiência de custódia',
        date: '11 de Junho, 2026',
        dateISO: '2026-06-11',
        excerpt: 'O que a família deve fazer nas primeiras horas após uma prisão em flagrante e o que pode acontecer na audiência de custódia.',
        author: { name: 'Dr. Rogério Macedo', oab: 'OAB/SP 409.390', photo: 'rogeriomacedo.webp', bio: 'Especializado em Direito Penal e Execução Penal: defesas em flagrante, Tribunal do Júri, recursos e Habeas Corpus de urgência.' },
        body: `
<p>Uma prisão em flagrante desorganiza qualquer família. As primeiras horas são de medo e desinformação e, ao mesmo tempo, são o período em que as providências corretas fazem mais diferença para a defesa.</p>
<h2>Direitos de quem é preso</h2>
<ul>
<li>Permanecer em silêncio, sem que isso seja interpretado em seu prejuízo;</li>
<li>Ser assistido por advogado ou pela Defensoria Pública desde a delegacia;</li>
<li>Ter a família ou pessoa indicada comunicada imediatamente da prisão;</li>
<li>Não sofrer qualquer forma de violência ou constrangimento ilegal;</li>
<li>Receber a nota de culpa, com o motivo da prisão e os nomes dos responsáveis.</li>
</ul>
<h2>O que a família pode fazer de imediato</h2>
<p>Identificar em qual delegacia a pessoa se encontra, providenciar documentos pessoais, comprovante de residência e de trabalho, e acionar um advogado de confiança o quanto antes. Esses documentos são usados para demonstrar vínculos com a comunidade: um dos fatores avaliados na análise da liberdade provisória.</p>
<h2>A audiência de custódia</h2>
<p>Em até 24 horas após a prisão, a pessoa deve ser apresentada a um juiz. Nessa audiência, o magistrado verifica a legalidade da prisão e a ocorrência de eventuais abusos, e decide entre relaxar a prisão (quando ilegal), conceder liberdade provisória (com ou sem medidas cautelares, como comparecimento periódico em juízo) ou converter o flagrante em prisão preventiva, se presentes os requisitos legais.</p>
<h2>Por que a atuação técnica importa desde o início</h2>
<p>Cada caso tem circunstâncias próprias: a natureza da acusação, os antecedentes, os vínculos do acusado e a forma como a prisão ocorreu influenciam diretamente a decisão judicial. A presença de defesa técnica desde a delegacia assegura que os direitos sejam respeitados e que a versão do acusado seja documentada corretamente.</p>`,
    },
    {
        slug: 'progressao-de-regime-execucao-penal',
        cat: 'penal',
        title: 'Progressão de regime na execução penal: requisitos e como funciona',
        date: '30 de Maio, 2026',
        dateISO: '2026-05-30',
        excerpt: 'Do fechado ao semiaberto, do semiaberto ao aberto: os requisitos objetivos e subjetivos para progredir de regime no cumprimento da pena.',
        author: { name: 'Dra. Simone Tinetti', oab: 'OAB/SP 376.602', photo: 'simone.webp', bio: 'Pós-graduada em Direito Penal e Processual Penal, com atuação especializada no contencioso criminal e na execução penal de urgência.' },
        body: `
<p>A execução penal brasileira é progressiva: a pena privativa de liberdade foi desenhada para ser cumprida em etapas, do regime mais rigoroso ao mais brando, conforme o condenado demonstra condições de retornar gradualmente ao convívio social. A progressão de regime é o instrumento central desse sistema.</p>
<h2>Requisito objetivo: o tempo de pena</h2>
<p>Desde o Pacote Anticrime (Lei 13.964/2019), os percentuais de cumprimento exigidos variam conforme a natureza do crime e a condição do apenado, como regra geral: 16% para condenado primário por crime sem violência; 20% para reincidente em crime sem violência; 25% e 30% para crimes com violência ou grave ameaça (primário e reincidente, respectivamente); e percentuais de 40% a 70% para crimes hediondos ou equiparados, conforme o caso.</p>
<h2>Requisito subjetivo: o comportamento</h2>
<p>Além do tempo, exige-se boa conduta carcerária, atestada pelo diretor do estabelecimento. Faltas graves (como posse de celular ou participação em motim) podem interromper a contagem e adiar o benefício. Trabalho e estudo, além de abaterem pena pela remição, pesam positivamente na análise.</p>
<h2>Como o pedido é analisado</h2>
<ul>
<li>O cálculo da pena e as datas-base constam do atestado de penas, que deve ser conferido com atenção;</li>
<li>O pedido é dirigido ao Juízo da Execução Penal, com manifestação do Ministério Público;</li>
<li>Em alguns casos, o juiz pode determinar exame criminológico para avaliar o requisito subjetivo;</li>
<li>Decisões que negam a progressão podem ser questionadas por agravo em execução.</li>
</ul>
<h2>Um acompanhamento que não termina na sentença</h2>
<p>Erros de cálculo e demoras cartorárias são mais comuns do que se imagina, e cada dia conta para quem cumpre pena. O acompanhamento técnico da execução garante que remições sejam computadas, que as datas-base estejam corretas e que os benefícios sejam requeridos assim que os requisitos forem preenchidos.</p>`,
    },
    {
        slug: 'cobranca-indevida-e-negativacao',
        cat: 'civil-consumidor',
        title: 'Cobrança indevida e negativação: os direitos do consumidor',
        date: '05 de Junho, 2026',
        dateISO: '2026-06-05',
        excerpt: 'Nome negativado por dívida que não existe ou já foi paga? Veja o que o Código de Defesa do Consumidor garante e como agir.',
        author: { name: 'Dra. Alessandra', oab: 'OAB/SP', photo: 'alessandra.webp', bio: 'Atuação destacada na advocacia cível e consumerista, com foco em assessoria contratual, prevenção de riscos e contencioso cível.' },
        body: `
<p>Descobrir o próprio nome nos cadastros de inadimplentes por uma dívida desconhecida (ou já quitada) é uma situação mais comum do que deveria. O Código de Defesa do Consumidor oferece instrumentos concretos para corrigir o problema e, em muitos casos, reparar os danos causados.</p>
<h2>O que caracteriza cobrança indevida</h2>
<ul>
<li>Dívida inexistente, já paga ou prescrita;</li>
<li>Valores superiores ao contratado ou com encargos não previstos;</li>
<li>Serviços não solicitados, como assinaturas e seguros embutidos sem autorização;</li>
<li>Cobranças decorrentes de fraude, como contratos abertos por terceiros com seus documentos.</li>
</ul>
<h2>Repetição do indébito: devolução em dobro</h2>
<p>Quem paga uma cobrança indevida tem direito à devolução em dobro do valor, acrescido de correção e juros (art. 42, parágrafo único, do CDC), salvo hipótese de engano justificável do fornecedor. Guardar comprovantes de pagamento e protocolos de atendimento é essencial para exercer esse direito.</p>
<h2>Negativação indevida e dano moral</h2>
<p>A inscrição irregular nos cadastros de proteção ao crédito (SPC, Serasa) atinge diretamente a honra e o crédito do consumidor. A jurisprudência consolidada reconhece que a negativação indevida gera dano moral presumido, isto é, sem necessidade de provar prejuízo concreto. Além da indenização, é possível obter liminar para a retirada imediata do apontamento.</p>
<h2>Como agir passo a passo</h2>
<p>Primeiro, solicite ao credor o detalhamento da dívida e registre protocolos. Em paralelo, consulte seus cadastros nos birôs de crédito e conteste o apontamento. Se a cobrança persistir, formalize reclamação nos canais oficiais e procure orientação jurídica. A via judicial permite discutir a dívida, cessar as cobranças e reparar os danos em uma única ação.</p>`,
    },
];

function chrome(depth, { title, description, bodyClass, content, ogType }) {
    const p = '../'.repeat(depth);
    return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="${description}">
    <meta name="theme-color" content="#222222">
    <meta property="og:type" content="${ogType}">
    <meta property="og:title" content="${title}">
    <meta property="og:description" content="${description}">
    <meta property="og:locale" content="pt_BR">
    <link rel="icon" type="image/png" sizes="32x32" href="${p}favicon-32x32.png">
    <link rel="icon" type="image/png" sizes="16x16" href="${p}favicon-16x16.png">
    <link rel="apple-touch-icon" href="${p}apple-touch-icon.png">
    <title>${title}</title>

    <link rel="preload" href="${p}fonts/WorkSans-SemiBold.woff2" as="font" type="font/woff2" crossorigin>

    <link rel="stylesheet" href="${p}style.css?v=${CSS_V}">
</head>
<body class="${bodyClass}">

    <nav class="navbar scrolled" id="navbar">
        <div class="nav-container">
            <a href="${p}index.html" class="nav-logo" aria-label="Advocacia Marília - Voltar ao início">
                <img src="${p}logo.png" alt="Logo Advocacia Marília" class="logo-img">
            </a>

            <button class="menu-toggle" id="menuToggle" aria-label="Abrir menu de navegação" aria-expanded="false" aria-controls="navLinks">
                <span class="bar"></span>
                <span class="bar"></span>
                <span class="bar"></span>
            </button>

            <ul class="nav-links" id="navLinks">
                <li><a href="${p}index.html" class="nav-item">Início</a></li>
                <li><a href="${p}index.html#equipe" class="nav-item">Equipe</a></li>
                <li><a href="${p}index.html#atuacao" class="nav-item">Especialidades</a></li>
                <li><a href="${p}index.html#metodologia" class="nav-item">Metodologia</a></li>
                <li><a href="${p}blog/" class="nav-item" data-dropdown="blog">Blog</a></li>
                <li><a href="${p}index.html#faq" class="nav-item">Dúvidas</a></li>
            </ul>

            <a href="${WA}" target="_blank" rel="noopener noreferrer" class="nav-whatsapp cta-anim" aria-label="Fale conosco no WhatsApp">
                <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor" class="nav-whatsapp-icon" aria-hidden="true">
                    <path d="M.057 24l1.687-6.163a11.867 11.867 0 0 1-1.587-5.946C.16 5.335 5.495 0 12.05 0a11.817 11.817 0 0 1 8.413 3.488 11.824 11.824 0 0 1 3.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 0 1-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884a9.86 9.86 0 0 0 1.51 5.26l-.999 3.648 3.748-.984zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01a1.1 1.1 0 0 0-.792.372c-.272.297-1.04 1.016-1.04 2.479s1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                </svg>
                <span class="cta-label"><span class="cta-label-inner">Fale Conosco</span><span class="cta-label-inner" aria-hidden="true">Fale Conosco</span></span>
            </a>
        </div>
    </nav>

${content}

    <footer class="footer">
        <div class="footer-container">
            <div class="footer-top">
                <a href="${p}index.html" class="footer-logo" aria-label="Advocacia Marília - Voltar ao início">
                    <img src="${p}logo.png" alt="Logo Advocacia Marília" class="logo-img-footer">
                </a>
                <ul class="footer-nav">
                    <li><a href="${p}index.html">Início</a></li>
                    <li><a href="${p}index.html#sobre">O Escritório</a></li>
                    <li><a href="${p}index.html#atuacao">Especialidades</a></li>
                    <li><a href="${p}index.html#equipe">Equipe</a></li>
                    <li><a href="${p}blog/">Blog</a></li>
                    <li><a href="${p}index.html#contato">Contato</a></li>
                </ul>
            </div>

            <div class="footer-bottom">
                <p class="footer-copy">&copy; 2026 Advocacia Marília. Todos os direitos reservados. Serviços jurídicos prestados por advogados independentes.</p>
                <p class="footer-credit">Site desenvolvido por <a href="https://almeidaescaladigital.com" target="_blank" rel="noopener noreferrer" class="credit-link">Almeida Escala Digital</a>.</p>
            </div>
        </div>
    </footer>

    <div class="wa-widget" id="waWidget">
        <div class="wa-tooltip" id="waTooltip" aria-live="polite">
            <span>Olá, como posso ajudar?</span>
            <button class="wa-tooltip-close" id="waTooltipClose" aria-label="Fechar balão de ajuda">&times;</button>
        </div>

        <a class="wa-btn" id="waBtn" href="${WA}" target="_blank" rel="noopener noreferrer" aria-label="Fale conosco no WhatsApp">
            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor" class="wa-icon" aria-hidden="true">
                <path d="M.057 24l1.687-6.163a11.867 11.867 0 0 1-1.587-5.946C.16 5.335 5.495 0 12.05 0a11.817 11.817 0 0 1 8.413 3.488 11.824 11.824 0 0 1 3.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 0 1-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884a9.86 9.86 0 0 0 1.51 5.26l-.999 3.648 3.748-.984zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01a1.1 1.1 0 0 0-.792.372c-.272.297-1.04 1.016-1.04 2.479s1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
            </svg>
        </a>

        <div class="wa-panel" id="waPanel" role="dialog" aria-label="Atendimento Advocacia Marília">
            <header class="wa-panel-header">
                <span class="wa-avatar" aria-hidden="true"></span>
                <div class="wa-brand">
                    <span class="wa-brand-name">Advocacia Marília</span>
                    <span class="wa-brand-status"><span class="wa-status-dot" aria-hidden="true"></span>Atendimento Digital</span>
                </div>
            </header>

            <div class="wa-panel-body" id="waPanelBody">
                <div class="wa-chat-area" id="waChatArea">
                    <div class="wa-message wa-msg-received">
                        <p>Olá! Selecione uma das perguntas abaixo ou fale direto com nossa equipe:</p>
                    </div>
                </div>

                <div class="wa-faq-list" id="waFaqList">
                    <button class="wa-faq-btn" data-id="1">Como funciona o atendimento de advogados autônomos?</button>
                    <button class="wa-faq-btn" data-id="2">Como posso agendar uma consulta jurídica?</button>
                    <button class="wa-faq-btn" data-id="3">Quais documentos levar para a primeira consulta?</button>
                    <button class="wa-faq-btn" data-id="4">Onde fica localizado o escritório?</button>
                </div>
            </div>

            <footer class="wa-panel-footer">
                <a href="${WA}" target="_blank" rel="noopener noreferrer" class="wa-direct-link">
                    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor" aria-hidden="true"><path d="M.057 24l1.687-6.163a11.867 11.867 0 0 1-1.587-5.946C.16 5.335 5.495 0 12.05 0a11.817 11.817 0 0 1 8.413 3.488 11.824 11.824 0 0 1 3.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 0 1-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884a9.86 9.86 0 0 0 1.51 5.26l-.999 3.648 3.748-.984zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01a1.1 1.1 0 0 0-.792.372c-.272.297-1.04 1.016-1.04 2.479s1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>
                    Falar no WhatsApp
                </a>
            </footer>
        </div>
    </div>

    <script src="${p}lenis.min.js" defer></script>
    <script src="${p}script.js?v=${JS_V}" defer></script>
</body>
</html>
`;
}

function hubContent() {
    const sections = CATEGORIES.map(cat => {
        const arts = ARTICLES.filter(a => a.cat === cat.id);
        if (arts.length === 0) return '';
        const cards = arts.map(a => `                    <article class="blog-card">
                        <span class="blog-date">${a.date}</span>
                        <h3 class="blog-card-title">${a.title}</h3>
                        <p class="blog-card-author">Por ${a.author.name} · ${a.author.oab}</p>
                        <p class="blog-card-excerpt">${a.excerpt}</p>
                        <a href="${a.slug}/" class="blog-read-more" aria-label="Ler o artigo: ${a.title}">Ler artigo completo</a>
                    </article>`).join('\n');
        return `        <section class="blog-cat" id="${cat.id}">
            <div class="section-container">
                <h2 class="blog-cat-title">${cat.name}</h2>
                <p class="blog-cat-sub">${cat.sub}</p>
                <div class="blog-grid">
${cards}
                </div>
            </div>
        </section>`;
    }).join('\n');

    return `    <header class="blog-hero">
        <div class="section-container">
            <span class="section-kicker light">Informativo Jurídico</span>
            <h1 class="blog-hero-title">Artigos e análises da nossa equipe.</h1>
            <p class="blog-hero-sub">Conteúdo informativo produzido pelos advogados do espaço, organizado pelas áreas em que cada um atua. Nenhum artigo substitui a análise do seu caso concreto.</p>
        </div>
    </header>

    <main>
${sections}
    </main>`;
}

function articleContent(a) {
    const cat = CATEGORIES.find(c => c.id === a.cat);
    return `    <main class="article">
        <div class="article-container">
            <div class="article-kicker">
                <a href="../">Blog</a>
                <span aria-hidden="true">/</span>
                <a href="../#${cat.id}">${cat.name}</a>
            </div>
            <h1 class="article-title">${a.title}</h1>
            <div class="article-meta">
                <span>Por <strong>${a.author.name}</strong> · ${a.author.oab}</span>
                <time datetime="${a.dateISO}">${a.date}</time>
            </div>

            <div class="article-body">
${a.body.trim()}
                <p class="article-disclaimer">Este conteúdo tem caráter exclusivamente informativo e não substitui a consulta a um advogado sobre o seu caso concreto. Cada situação possui particularidades que exigem análise individual.</p>
            </div>

            <div class="article-author">
                <span class="article-author-frame">
                    <span class="article-author-crop">
                        <img src="../../curriculoseadvogados/${a.author.photo}" alt="${a.author.name}" class="article-author-photo" loading="lazy" style="--fx:${(FACE_FOCUS[a.author.photo] || {}).fx || '50%'};--fy:${(FACE_FOCUS[a.author.photo] || {}).fy || '20%'};--fs:${(FACE_FOCUS[a.author.photo] || {}).fs || '1.7'}">
                    </span>
                </span>
                <div>
                    <span class="article-author-name">${a.author.name}</span>
                    <span class="article-author-oab">${a.author.oab}</span>
                    <p class="article-author-bio">${a.author.bio}</p>
                </div>
            </div>

            <div class="article-cta">
                <a href="${WA}" target="_blank" rel="noopener noreferrer" class="btn btn-primary cta-anim"><span class="cta-label"><span class="cta-label-inner">Falar com um Advogado</span><span class="cta-label-inner" aria-hidden="true">Falar com um Advogado</span></span></a>
                <a href="../" class="article-back">&larr; Voltar para o blog</a>
            </div>
        </div>
    </main>`;
}

// Hub
mkdirSync(join(ROOT, 'blog'), { recursive: true });
writeFileSync(join(ROOT, 'blog', 'index.html'), chrome(1, {
    title: 'Blog | Advocacia Marília | Informativo Jurídico',
    description: 'Artigos e análises dos advogados da Advocacia Marília: Previdenciário, Família e Sucessões, Imobiliário, Trabalhista, Penal e Consumidor.',
    bodyClass: 'page-blog',
    ogType: 'website',
    content: hubContent(),
}));

// Artigos
for (const a of ARTICLES) {
    const dir = join(ROOT, 'blog', a.slug);
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, 'index.html'), chrome(2, {
        title: `${a.title} | Advocacia Marília`,
        description: a.excerpt,
        bodyClass: 'page-blog',
        ogType: 'article',
        content: articleContent(a),
    }));
}

console.log(`OK: blog/index.html + ${ARTICLES.length} artigos gerados.`);
