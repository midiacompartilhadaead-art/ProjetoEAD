/**
 * Identificadores das páginas da aplicação (Navegação SPA)
 */
export type PageView = 'home' | 'training' | 'upload' | 'admin';

/**
 * Interface para controle de metas de captação por polo
 */
export interface MetaPolo {
  id: string;
  polo: string;
  metaModulo: number;
  realizado: number;
}

/**
 * Mapeamento de metas organizadas por período de referência
 */
export type MetasPorPeriodo = Record<string, MetaPolo[]>;

/**
 * Opção de polo cadastrado na instituição
 */
export interface PoloOption {
  id: string;
  nome: string;
  uf?: string;
}

/**
 * Regra de reembolso de itens de mídia compartilhada
 */
export interface ReembolsoItem {
  item: string;
  categoria: string;
  reembolsavel: boolean;
  observacoes: string;
}

/**
 * Estrutura individual de um item de despesa adicionado ao lote
 */
export interface ItemDespesa {
  id: string;
  categoria: string;
  descricao: string;
  valor: number;
  arquivosNomes: string[];
  arquivosCount: number;
}

/**
 * Status possíveis do processo de auditoria do comprovante
 */
export type StatusAuditoria = 'Aprovado / Feito' | 'Aguardando / Em Análise' | 'Errado / Com Pendência' | 'Pendente Auditoria';

/**
 * Estrutura completa de uma submissão de prestação de contas enviada pelo polo
 */
export interface SubmissaoComprovante {
  id: string;
  protocolo: string;
  polo: string;
  categoria: string;
  modulo: string;
  dataEnvio: string;
  arquivosCount: number;
  arquivosNomes: string[];
  observacoes?: string;
  observacaoInterna?: string;
  valorTotal?: number;
  itensDespesa?: ItemDespesa[];
  status: StatusAuditoria;
}

/**
 * Estrutura para controle de arquivos no armazenamento em nuvem (OneDrive/SharePoint)
 */
export interface StorageFile {
  id: string;
  name: string;
  fullPath: string;
  size: number;
  timeCreated: string;
  status: 'Enviado' | 'Em progresso' | 'Erro';
  progress: number;
  downloadUrl?: string;
  error?: string;
}

