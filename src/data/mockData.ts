import { ReembolsoItem } from '../types';

export const POLOS_LIST = [
  "Apodi",
  "Araçatuba",
  "Assis",
  "Bauru",
  "Belo Horizonte",
  "Botucatu",
  "Buritirama",
  "Campinas",
  "Canela",
  "Cariacica",
  "Cuiabá",
  "Curitiba",
  "Dracena",
  "Garça",
  "Gravataí",
  "Indaiatuba",
  "Itaboraí",
  "Itanhaém",
  "João Pessoa",
  "Juiz de Fora",
  "Lins",
  "Lucélia",
  "Marília",
  "Medianeira",
  "Ourinhos",
  "Paraguaçu Paulista",
  "Peruíbe",
  "Presidente Prudente",
  "Quatá",
  "Ribeirão Cascalheira",
  "Ribeirão Preto",
  "São José",
  "São José dos Campos",
  "São Paulo",
  "Serra",
  "Sorocaba",
  "Tupã",
  "Uberlândia"
];

export const REEMBOLSO_TABELA: ReembolsoItem[] = [
  {
    item: 'Facebook Ads',
    categoria: 'Tráfego Pago',
    reembolsavel: true,
    observacoes: 'Campanhas de alcance e conversão, pagamento via CNPJ do polo. Obrigatório enviar nota fiscal da Meta e relatório de consumo.'
  },
  {
    item: 'Google Ads',
    categoria: 'Tráfego Pago',
    reembolsavel: true,
    observacoes: 'Apenas anúncios vinculados à captação de alunos. Necessário relatório de consumo e nota fiscal emitida no CNPJ do polo.'
  },
  {
    item: 'Instagram Ads',
    categoria: 'Tráfego Pago',
    reembolsavel: true,
    observacoes: 'Permitido quando vinculado à conta comercial do polo e integrado ao Business Manager do CNPJ do polo.'
  },
  {
    item: 'Rádio',
    categoria: 'Mídia Tradicional',
    reembolsavel: true,
    observacoes: 'Spots e chamadas voltadas para captação de alunos. Requer nota fiscal e contrato/recibo de veiculação.'
  },
  {
    item: 'TV',
    categoria: 'Mídia Tradicional',
    reembolsavel: true,
    observacoes: 'Comerciais locais ou regionais para captação. Exige nota fiscal emitida no polo.'
  },
  {
    item: 'Outdoor / Frontlight / Painel',
    categoria: 'Mídia Tradicional',
    reembolsavel: true,
    observacoes: 'Permitido desde que haja autorização prévia e nota fiscal em nome do polo.'
  },
  {
    item: 'Jornais / Revistas Locais',
    categoria: 'Mídia Tradicional',
    reembolsavel: true,
    observacoes: 'Anúncios institucionais ou de campanhas de captação. Exige nota fiscal.'
  },
  {
    item: 'Banners e Faixas',
    categoria: 'Materiais Promocionais',
    reembolsavel: true,
    observacoes: 'Apenas para eventos ou campanhas previamente autorizadas. Nota fiscal obrigatória.'
  },
  {
    item: 'Brindes institucionais',
    categoria: 'Materiais Promocionais',
    reembolsavel: true,
    observacoes: 'Somente se usados em eventos de captação e com aprovação prévia. Necessário fotos.'
  },
  {
    item: 'Camisetas personalizadas',
    categoria: 'Restrito',
    reembolsavel: false,
    observacoes: 'Item de uso restrito e baixo alcance.'
  },
  {
    item: 'Premiações individuais',
    categoria: 'Restrito',
    reembolsavel: false,
    observacoes: 'Não se enquadram como mídia de massa.'
  },
  {
    item: 'Uniformes de equipe',
    categoria: 'Restrito',
    reembolsavel: false,
    observacoes: 'Uso interno, sem impacto direto na captação.'
  },
  {
    item: 'Materiais de decoração interna',
    categoria: 'Restrito',
    reembolsavel: false,
    observacoes: 'Não caracterizam mídia externa.'
  },
  {
    item: 'Eventos fechados',
    categoria: 'Restrito',
    reembolsavel: false,
    observacoes: 'Exceto se houver ampla cobertura de mídia e autorização prévia.'
  },
  {
    item: 'Despesas gerais',
    categoria: 'Restrito',
    reembolsavel: false,
    observacoes: 'Alimentação, transporte, hospedagem e presentes não configuram investimento em mídia.'
  }
];
