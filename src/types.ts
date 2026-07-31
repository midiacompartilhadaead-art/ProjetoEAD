export type PageView = 'home' | 'training' | 'upload' | 'admin';

export interface AdminDocument {
  id: string;
  userEmail: string;
  name: string;
  fullPath: string;
  size: number;
  timeCreated: string;
  contentType?: string;
  downloadUrl?: string;
}

export interface PoloOption {
  id: string;
  nome: string;
  uf?: string;
}

export interface ReembolsoItem {
  item: string;
  categoria: string;
  reembolsavel: boolean;
  observacoes: string;
}

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
  status: 'Pendente Auditoria' | 'Aprovado' | 'Em Análise';
}

export interface FirebaseStorageFile {
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
