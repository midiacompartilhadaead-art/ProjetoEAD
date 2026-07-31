import React, { useState, useEffect } from 'react';
import { PageView, AdminDocument } from '../types';
import { storage } from '../firebase';
import { adminEmails, checkIsAdmin } from '../lib/permissions';
import { User } from 'firebase/auth';
import { 
  ref, 
  listAll, 
  getMetadata, 
  getDownloadURL, 
  deleteObject 
} from 'firebase/storage';
import { 
  ShieldCheck, 
  Lock, 
  Download, 
  Trash2, 
  Search, 
  RefreshCw, 
  FileText, 
  Loader2, 
  AlertCircle, 
  CheckCircle2, 
  Users, 
  HardDrive, 
  ArrowLeft,
  Filter,
  FileCheck2,
  FileImage,
  Database,
  Calendar,
  FileType,
  HardDriveDownload,
  Info
} from 'lucide-react';

interface AdminDashboardProps {
  onNavigate: (view: PageView) => void;
  authUser: User | null;
  isAdmin: boolean;
}

// Subcomponente reutilizável: StatCard
const StatCard: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string | number;
  subtext?: string;
}> = ({ icon, label, value, subtext }) => (
  <div className="bg-[#edf4fa] border border-[#b2d5f0] p-5 rounded-3xl shadow-xs flex items-center gap-4 transition-all hover:border-[#0074b8]">
    <div className="w-12 h-12 rounded-2xl bg-white border border-[#b2d5f0] text-[#0074b8] flex items-center justify-center font-bold shadow-2xs shrink-0">
      {icon}
    </div>
    <div>
      <span className="text-[10px] uppercase font-black tracking-widest text-slate-700 block">{label}</span>
      <strong className="text-2xl font-black text-[#002b54] font-mono">{value}</strong>
      {subtext && <span className="text-[10px] text-slate-700 block font-medium">{subtext}</span>}
    </div>
  </div>
);

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ 
  onNavigate, 
  authUser, 
  isAdmin 
}) => {
  const [documents, setDocuments] = useState<AdminDocument[]>([]);
  const [loadingDocs, setLoadingDocs] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Filtros e busca
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedFolderFilter, setSelectedFolderFilter] = useState<string>('all');
  const [deletingFileId, setDeletingFileId] = useState<string | null>(null);
  const [confirmDeleteDoc, setConfirmDeleteDoc] = useState<AdminDocument | null>(null);

  // Verificação de permissão dinâmica (preparada para migração futura no Firestore)
  const [firestoreAdminVerified, setFirestoreAdminVerified] = useState<boolean>(isAdmin);

  useEffect(() => {
    async function verifyPermissions() {
      if (authUser) {
        const verified = await checkIsAdmin(authUser);
        setFirestoreAdminVerified(verified);
      } else {
        setFirestoreAdminVerified(false);
      }
    }
    verifyPermissions();
  }, [authUser, isAdmin]);

  // Carregar todos os documentos do Firebase Storage
  useEffect(() => {
    if ((isAdmin || firestoreAdminVerified) && authUser) {
      fetchStorageDocuments();
    }
  }, [isAdmin, firestoreAdminVerified, authUser]);

  const fetchStorageDocuments = async () => {
    setLoadingDocs(true);
    setErrorMsg(null);
    try {
      const allDocs: AdminDocument[] = [];
      const foldersToScan = ['documentos_recebidos', 'documentos'];

      for (const rootFolderName of foldersToScan) {
        try {
          const rootDocsRef = ref(storage, rootFolderName);
          const rootRes = await listAll(rootDocsRef);

          // 1. Escanear subpastas (agrupamento por usuário/polo)
          for (const folderRef of rootRes.prefixes) {
            const folderName = folderRef.name;
            const userFilesRes = await listAll(folderRef);

            for (const itemRef of userFilesRes.items) {
              try {
                const metadata = await getMetadata(itemRef);
                const downloadUrl = await getDownloadURL(itemRef).catch(() => undefined);
                
                const formattedDate = metadata.timeCreated
                  ? new Date(metadata.timeCreated).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })
                  : 'Recente';

                allDocs.push({
                  id: itemRef.fullPath,
                  userEmail: folderName,
                  name: itemRef.name,
                  fullPath: itemRef.fullPath,
                  size: metadata.size || 0,
                  timeCreated: formattedDate,
                  contentType: metadata.contentType || getFriendlyFileType(itemRef.name),
                  downloadUrl: downloadUrl
                });
              } catch (err) {
                console.error(`Erro ao ler metadados do arquivo ${itemRef.fullPath}:`, err);
              }
            }
          }

          // 2. Escanear arquivos diretos na raiz da pasta
          for (const itemRef of rootRes.items) {
            try {
              const metadata = await getMetadata(itemRef);
              const downloadUrl = await getDownloadURL(itemRef).catch(() => undefined);
              
              const formattedDate = metadata.timeCreated
                ? new Date(metadata.timeCreated).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })
                : 'Recente';

              allDocs.push({
                id: itemRef.fullPath,
                userEmail: 'Envio Direto',
                name: itemRef.name,
                fullPath: itemRef.fullPath,
                size: metadata.size || 0,
                timeCreated: formattedDate,
                contentType: metadata.contentType || getFriendlyFileType(itemRef.name),
                downloadUrl: downloadUrl
              });
            } catch (err) {
              console.error(`Erro ao ler metadados do arquivo ${itemRef.fullPath}:`, err);
            }
          }
        } catch (folderErr) {
          // Pasta pode ainda não ter sido criada
        }
      }

      // Ordenar mais recentes primeiro
      allDocs.sort((a, b) => b.fullPath.localeCompare(a.fullPath));
      setDocuments(allDocs);
    } catch (err: any) {
      console.error('Erro ao listar documentos no Firebase Storage:', err);
      setErrorMsg('Falha ao conectar e listar arquivos no Firebase Storage: ' + (err.message || 'Verifique sua conexão e permissões.'));
    } finally {
      setLoadingDocs(false);
    }
  };

  // Helper para tipo legível
  function getFriendlyFileType(fileName: string): string {
    const ext = fileName.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'pdf': return 'Documento PDF';
      case 'png': return 'Imagem PNG';
      case 'jpg':
      case 'jpeg': return 'Imagem JPEG';
      case 'webp': return 'Imagem WebP';
      case 'doc':
      case 'docx': return 'Documento Word';
      case 'xls':
      case 'xlsx': return 'Planilha Excel';
      case 'zip':
      case 'rar': return 'Arquivo Compactado';
      default: return `Arquivo .${ext || 'desconhecido'}`;
    }
  }

  // Ação de download seguro
  const handleDownload = (doc: AdminDocument) => {
    if (doc.downloadUrl) {
      const link = document.createElement('a');
      link.href = doc.downloadUrl;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.download = doc.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      setErrorMsg(`Link de download indisponível para o arquivo ${doc.name}.`);
    }
  };

  // Ação de exclusão (Estrutura de gerenciamento pronta)
  const handleDeleteDocument = async (docToDelete: AdminDocument) => {
    setDeletingFileId(docToDelete.id);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const fileRef = ref(storage, docToDelete.fullPath);
      await deleteObject(fileRef);
      
      setDocuments(prev => prev.filter(d => d.id !== docToDelete.id));
      setSuccessMsg(`Documento "${docToDelete.name}" foi removido do Firebase Storage.`);
      setConfirmDeleteDoc(null);
    } catch (err: any) {
      console.error('Erro ao excluir documento:', err);
      setErrorMsg('Não foi possível excluir o arquivo: ' + (err.message || 'Erro de permissão no Firebase Storage.'));
    } finally {
      setDeletingFileId(null);
    }
  };

  // Ícones por extensão
  const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(ext || '')) {
      return <FileImage className="w-5 h-5 text-sky-600 shrink-0" />;
    }
    if (['pdf'].includes(ext || '')) {
      return <FileText className="w-5 h-5 text-rose-600 shrink-0" />;
    }
    return <FileCheck2 className="w-5 h-5 text-[#0074b8] shrink-0" />;
  };

  // Obter lista única de origens/usuários para filtro
  const userFolderList = Array.from(new Set(documents.map(d => d.userEmail)));

  // Documentos filtrados
  const filteredDocs = documents.filter(doc => {
    const matchesSearch = 
      doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (doc.contentType && doc.contentType.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesFolder = selectedFolderFilter === 'all' || doc.userEmail === selectedFolderFilter;

    return matchesSearch && matchesFolder;
  });

  // Estatísticas agregadas
  const totalFiles = documents.length;
  const totalFolders = userFolderList.length;
  const totalSizeBytes = documents.reduce((acc, curr) => acc + curr.size, 0);
  const totalSizeMB = (totalSizeBytes / (1024 * 1024)).toFixed(2);

  // 1. TELA DE BLOQUEIO PARA USUÁRIOS NÃO ADMINISTRADORES
  if (!isAdmin && !firestoreAdminVerified) {
    return (
      <div className="min-h-screen pt-28 pb-16 px-4 max-w-3xl mx-auto space-y-6">
        <div className="bg-[#edf4fa] border-2 border-rose-200 rounded-3xl p-8 sm:p-12 text-center space-y-6 shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center mx-auto shadow-2xs">
            <Lock className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <span className="text-xs font-black uppercase tracking-widest text-rose-700 block">
              Controle de Acesso • Rota Restrita
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-[#002b54]">
              Acesso Negado ao Painel Administrativo
            </h1>
            <p className="text-xs sm:text-sm text-slate-700 font-medium leading-relaxed max-w-lg mx-auto">
              Seu e-mail atual <strong className="font-mono text-[#002b54]">{authUser?.email || 'Visitante (não autenticado)'}</strong> não possui privilégios de administrador no portal.
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-[#b2d5f0] text-left text-xs text-slate-700 space-y-2 shadow-2xs max-w-md mx-auto">
            <span className="font-black text-[#002b54] flex items-center gap-1.5">
              <Info className="w-4 h-4 text-[#0074b8]" />
              Instruções para Autenticação Administrativa
            </span>
            <p className="leading-relaxed">
              Para acessar esta área, você deve estar conectado com um dos e-mails autorizados:
            </p>
            <ul className="list-disc list-inside font-mono text-slate-800 font-bold space-y-1 bg-slate-50 p-2 rounded-lg border border-slate-200">
              {adminEmails.map((email, idx) => (
                <li key={idx}>{email}</li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={() => onNavigate('upload')}
              className="w-full sm:w-auto px-6 py-3 bg-[#003b70] hover:bg-[#0074b8] text-white font-extrabold text-xs rounded-xl transition-all shadow-xs cursor-pointer flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Voltar para Envio de Documentos</span>
            </button>
            <button
              onClick={() => onNavigate('home')}
              className="w-full sm:w-auto px-6 py-3 bg-white hover:bg-slate-50 text-[#002b54] border border-[#b2d5f0] font-extrabold text-xs rounded-xl transition-all cursor-pointer"
            >
              Menu Inicial
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 2. PAINEL ADMINISTRATIVO AUTORIZADO
  return (
    <div className="min-h-screen pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-8">
      
      {/* Cabeçalho do Painel */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-black text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-300 uppercase tracking-wider flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
              Painel Administrativo
            </span>
            <span className="text-xs text-slate-700 font-bold">• Mídia Compartilhada</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-[#003b70] tracking-tight">
            Gestão de Documentos Recebidos
          </h1>
          <p className="text-xs text-slate-700 font-medium mt-1">
            Visualização, download e controle de arquivos armazenados no Firebase Storage.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchStorageDocuments}
            disabled={loadingDocs}
            className="flex items-center gap-2 bg-[#edf4fa] hover:bg-white border border-[#b2d5f0] text-[#0074b8] px-4 py-2.5 rounded-2xl text-xs font-black shadow-2xs transition-all cursor-pointer active:scale-95 disabled:opacity-50"
            title="Atualizar lista de arquivos"
          >
            <RefreshCw className={`w-4 h-4 ${loadingDocs ? 'animate-spin' : ''}`} />
            <span>Sincronizar Storage</span>
          </button>
          <button
            onClick={() => onNavigate('upload')}
            className="flex items-center gap-2 bg-[#003b70] hover:bg-[#0074b8] text-white px-4 py-2.5 rounded-2xl text-xs font-black shadow-xs transition-all cursor-pointer active:scale-95"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar ao Envio</span>
          </button>
        </div>
      </div>

      {/* Cards de Métricas */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <StatCard
          icon={<FileText className="w-6 h-6" />}
          label="Total de Documentos"
          value={totalFiles}
          subtext="Arquivos no Firebase Storage"
        />
        <StatCard
          icon={<Users className="w-6 h-6" />}
          label="Origens / Polos"
          value={totalFolders}
          subtext="Pastas e envios mapeados"
        />
        <StatCard
          icon={<HardDrive className="w-6 h-6" />}
          label="Espaço Utilizado"
          value={`${totalSizeMB} MB`}
          subtext="Volume total armazenado"
        />
      </div>

      {/* Notificações de Erro e Sucesso */}
      {errorMsg && (
        <div className="p-4 bg-rose-50 border border-rose-300 text-rose-900 rounded-2xl text-xs font-bold flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <button onClick={() => setErrorMsg(null)} className="text-xs underline font-bold cursor-pointer">
            Fechar
          </button>
        </div>
      )}

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-2xl text-xs font-bold flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg(null)} className="text-xs underline font-bold cursor-pointer">
            Fechar
          </button>
        </div>
      )}

      {/* Barra de Busca e Filtros */}
      <div className="bg-[#edf4fa] border border-[#b2d5f0] p-5 rounded-3xl space-y-4 shadow-2xs">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          
          {/* Campo de Busca */}
          <div className="relative w-full sm:w-1/2">
            <Search className="w-4 h-4 text-[#0074b8] absolute left-3.5 top-3.5 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por nome, tipo de arquivo ou pasta..."
              className="w-full bg-white border border-[#b2d5f0] rounded-2xl pl-10 pr-4 py-2.5 text-xs font-bold text-[#002b54] outline-none focus:border-[#0074b8] shadow-2xs"
            />
          </div>

          {/* Filtro por Origem/Pasta */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="w-4 h-4 text-[#0074b8] shrink-0" />
            <select
              value={selectedFolderFilter}
              onChange={(e) => setSelectedFolderFilter(e.target.value)}
              className="w-full sm:w-auto bg-white border border-[#b2d5f0] rounded-2xl px-3.5 py-2.5 text-xs font-bold text-[#002b54] outline-none focus:border-[#0074b8] cursor-pointer shadow-2xs"
            >
              <option value="all">Todas as origens ({userFolderList.length})</option>
              {userFolderList.map((folder, i) => (
                <option key={i} value={folder}>{folder}</option>
              ))}
            </select>
          </div>

        </div>
      </div>

      {/* Tabela/Lista Principal de Documentos */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-black text-[#002b54] flex items-center gap-2">
            <Database className="w-5 h-5 text-[#0074b8]" />
            <span>Repositório Oficial de Documentos</span>
          </h2>
          <span className="text-xs text-slate-700 font-extrabold bg-[#edf4fa] border border-[#b2d5f0] px-3.5 py-1.5 rounded-full shadow-2xs">
            Exibindo {filteredDocs.length} de {documents.length} documento(s)
          </span>
        </div>

        {loadingDocs ? (
          <div className="bg-[#edf4fa] border border-[#b2d5f0] p-12 rounded-3xl text-center space-y-3 shadow-2xs">
            <Loader2 className="w-8 h-8 animate-spin text-[#0074b8] mx-auto" />
            <span className="text-sm font-bold text-[#002b54] block">Consultando arquivos armazenados no Firebase Storage...</span>
          </div>
        ) : filteredDocs.length === 0 ? (
          <div className="bg-[#edf4fa] border border-[#b2d5f0] p-12 rounded-3xl text-center space-y-2 shadow-2xs">
            <FileText className="w-10 h-10 text-slate-400 mx-auto" />
            <span className="text-base font-black text-[#002b54] block">Nenhum documento localizado.</span>
            <p className="text-xs text-slate-700 font-medium">
              {searchTerm || selectedFolderFilter !== 'all' 
                ? 'Nenhum resultado corresponde aos filtros pesquisados.' 
                : 'Ainda não há arquivos cadastrados no repositório de mídia compartilhada.'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredDocs.map((doc) => {
              const formattedSize = doc.size > 1024 * 1024 
                ? `${(doc.size / (1024 * 1024)).toFixed(2)} MB`
                : `${(doc.size / 1024).toFixed(1)} KB`;

              return (
                <div
                  key={doc.id}
                  className="bg-[#edf4fa] hover:bg-white border border-[#b2d5f0] hover:border-[#0074b8] p-5 sm:p-6 rounded-3xl shadow-xs hover:shadow-lg transition-all duration-300 space-y-4 group"
                >
                  {/* Linha Principal: Nome e Metadados Chave */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-[#b2d5f0]/70 pb-3">
                    <div className="flex items-center gap-3 truncate max-w-full">
                      {getFileIcon(doc.name)}
                      <div className="truncate">
                        <strong className="text-[#002b54] font-black text-sm sm:text-base block truncate" title={doc.name}>
                          {doc.name}
                        </strong>
                        <span className="text-[11px] font-mono font-bold text-[#0074b8] block truncate">
                          Caminho: {doc.fullPath}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs font-black text-[#003b70] bg-white border border-[#b2d5f0] px-3 py-1 rounded-xl shadow-2xs">
                        {formattedSize}
                      </span>
                    </div>
                  </div>

                  {/* Grade de Detalhes Exigidos pelo Requisito */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-700 font-medium pt-1 bg-white/60 p-3.5 rounded-2xl border border-[#b2d5f0]/60">
                    <div className="flex items-center gap-2">
                      <FileType className="w-4 h-4 text-[#0074b8] shrink-0" />
                      <div>
                        <span className="text-[10px] text-slate-700 font-bold block uppercase">Tipo de Arquivo</span>
                        <strong className="text-[#002b54] font-bold">{doc.contentType || 'Documento'}</strong>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-[#0074b8] shrink-0" />
                      <div>
                        <span className="text-[10px] text-slate-700 font-bold block uppercase">Data de Envio</span>
                        <strong className="text-[#002b54] font-bold">{doc.timeCreated}</strong>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-[#0074b8] shrink-0" />
                      <div>
                        <span className="text-[10px] text-slate-700 font-bold block uppercase">Origem / Pasta</span>
                        <strong className="text-[#002b54] font-bold truncate block max-w-[180px]">{doc.userEmail}</strong>
                      </div>
                    </div>
                  </div>

                  {/* Ações do Painel */}
                  <div className="flex items-center justify-between gap-3 pt-1">
                    <span className="text-[11px] text-emerald-800 font-bold flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-700" />
                      Acesso Restrito a Administradores
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleDownload(doc)}
                        className="flex items-center gap-1.5 px-4 py-2 bg-[#0074b8] hover:bg-[#003b70] text-white rounded-xl font-bold text-xs transition-all shadow-2xs cursor-pointer active:scale-95"
                      >
                        <HardDriveDownload className="w-4 h-4" />
                        <span>Baixar Documento</span>
                      </button>

                      {/* Botão de Exclusão (Estrutura de gerenciamento pronta e funcional) */}
                      <button
                        onClick={() => setConfirmDeleteDoc(doc)}
                        className="p-2 text-rose-700 hover:text-rose-900 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-all cursor-pointer shadow-2xs"
                        title="Excluir documento do Storage"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Estrutura Preparada para Gestão de Administradores no Firestore */}
      <div className="bg-[#edf4fa] border border-[#b2d5f0] p-6 rounded-3xl space-y-3 shadow-2xs">
        <div className="flex items-center gap-2 text-[#002b54]">
          <Database className="w-5 h-5 text-[#0074b8]" />
          <h3 className="font-black text-sm uppercase tracking-wide">
            Estrutura Preparada para Migração Firestore
          </h3>
        </div>
        <p className="text-xs text-slate-700 leading-relaxed font-medium">
          A autenticação atual valida a lista inicial contida em <code className="bg-white px-1.5 py-0.5 rounded border border-[#b2d5f0] font-mono text-[#003b70] font-bold">adminEmails</code>. A arquitetura da função <code className="bg-white px-1.5 py-0.5 rounded border border-[#b2d5f0] font-mono text-[#003b70] font-bold">checkIsAdmin()</code> em <code className="bg-white px-1.5 py-0.5 rounded border border-[#b2d5f0] font-mono text-[#003b70] font-bold">src/lib/permissions.ts</code> está totalmente modularizada para migração direta da coleção de administradores para o Firestore quando desejado.
        </p>
      </div>

      {/* Modal de Confirmação para Exclusão de Arquivo */}
      {confirmDeleteDoc && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border-2 border-rose-300 rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-5 shadow-2xl animate-fade-in">
            <div className="flex items-center gap-3 text-rose-700">
              <div className="w-10 h-10 rounded-2xl bg-rose-100 flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-rose-700" />
              </div>
              <h3 className="text-lg font-black text-[#002b54]">Excluir Documento do Storage?</h3>
            </div>

            <p className="text-xs text-slate-700 font-medium leading-relaxed">
              Você está prestes a excluir o arquivo <strong className="text-slate-900 font-mono">{confirmDeleteDoc.name}</strong> da pasta <strong className="text-slate-900 font-mono">{confirmDeleteDoc.userEmail}</strong> no Firebase Storage. Esta ação é definitiva.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setConfirmDeleteDoc(null)}
                disabled={deletingFileId !== null}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition-all cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleDeleteDocument(confirmDeleteDoc)}
                disabled={deletingFileId !== null}
                className="px-5 py-2.5 bg-rose-700 hover:bg-rose-800 text-white font-black text-xs rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-2"
              >
                {deletingFileId ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Excluindo...</span>
                  </>
                ) : (
                  <span>Confirmar Exclusão</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
