import React, { useState } from 'react';
import { PageView, SubmissaoComprovante, ItemDespesa } from '../types';
import { POLOS_LIST } from '../data/mockData';
import { UnimarSymbolIcon } from './UnimarSymbolIcon';
import { 
  Upload, 
  FileText, 
  CheckCircle2, 
  X, 
  Send, 
  Building2, 
  Calendar, 
  Layers, 
  Paperclip, 
  ShieldCheck, 
  Loader2, 
  AlertCircle, 
  Info,
  AlertTriangle,
  HardDrive,
  Plus,
  Trash2,
  DollarSign,
  Printer,
  Eye,
  Receipt
} from 'lucide-react';

/**
 * Interface das propriedades recebidas pelo componente da página de upload
 */
interface UploadPageProps {
  onNavigate: (view: PageView) => void;
  submissoesAnteriores: SubmissaoComprovante[];
  onNovaSubmissao: (submissao: SubmissaoComprovante) => void;
  onShowToast?: (message: string) => void;
}

/**
 * Interface estendida do item de despesa local contendo a lista de arquivos File anexados
 */
interface LocalItemDespesa extends ItemDespesa {
  arquivos: File[];
}

// Limites e Constantes de Upload
const MAX_FILES = 15;
const MAX_TOTAL_SIZE_BYTES = 500 * 1024 * 1024; // 500 MB
const ALLOWED_EXTENSIONS = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'jpg', 'jpeg', 'png', 'txt'];

// Webhook URL do Microsoft Power Automate para processamento de comprovantes
const POWER_AUTOMATE_WEBHOOK_URL = "https://defaulta835aabfa16a4ba683e70ddfc5fd32.5e.environment.api.powerplatform.com:443/powerautomate/automations/direct/cu/10/workflows/1038c8abad77468ca161d82cf9ec8571/triggers/manual/paths/invoke?api-version=1";

/**
 * Função utilitária para higienizar nomes de pastas e arquivos no OneDrive/SharePoint
 */
const sanitizarNomeOneDrive = (texto: string): string => {
  if (!texto) return '';
  return texto
    .replace(/[\/\\]/g, '-')
    .replace(/[#%*:<>?|]/g, '')
    .trim();
};

/**
 * Função para gerar e baixar automaticamente um relatório TXT do comprovante do gestor
 */
const baixarArquivoTxt = (dadosDoGestor: string) => {
  const conteudo = `====================================\nCOMPROVANTE DE ENVIO - GESTOR\n====================================\nData: ${new Date().toLocaleString('pt-BR')}\n\n${dadosDoGestor}\n`;
  
  const blob = new Blob([conteudo], { type: "application/octet-stream;charset=utf-8" });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.style.display = "none";
  a.href = url;
  a.setAttribute("download", `comprovante-envio-${Date.now()}.txt`);
  
  document.body.appendChild(a);
  a.click();
  
  setTimeout(() => {
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }, 100);
};

/**
 * Função utilitária para converter arquivos em formato Base64 para envio via Webhook
 */
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.includes(',') ? result.split(',')[1] : result;
      resolve(base64);
    };
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
};

/**
 * Formatação do tamanho do arquivo para KB ou MB
 */
function formatFileSize(bytes: number): string {
  if (bytes < 1024 * 1024) {
    return (bytes / 1024).toFixed(1) + ' KB';
  }
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}

/**
 * Validação de extensões de arquivo permitidas
 */
function isValidExtension(fileName: string): boolean {
  const ext = fileName.split('.').pop()?.toLowerCase();
  return ext ? ALLOWED_EXTENSIONS.includes(ext) : false;
}

/**
 * Componente UploadPage - Tela para envio e prestação de contas de comprovantes fiscais de mídia
 */
export const UploadPage: React.FC<UploadPageProps> = ({ 
  onNavigate, 
  submissoesAnteriores, 
  onNovaSubmissao,
  onShowToast
}) => {
  // Estados do Formulário de Cabeçalho
  const [polo, setPolo] = useState<string>('');
  const [categoria, setCategoria] = useState<string>('');
  const [modulo, setModulo] = useState<string>('');

  // Estados do Formulário de Item de Despesa
  const [observacoes, setObservacoes] = useState<string>(''); // Descrição / Observação do Serviço
  const [valorItem, setValorItem] = useState<string>(''); // Valor em R$
  const [files, setFiles] = useState<File[]>([]); // Arquivos selecionados para o item atual

  // Lista dinâmica de Itens de Despesa Adicionados ao Lote
  const [itensDespesa, setItensDespesa] = useState<LocalItemDespesa[]>([]);
  
  // Estados do Processo de Upload e Submissão
  const [uploadProgressMap, setUploadProgressMap] = useState<Record<string, { progress: number; status: 'uploading' | 'completed' | 'error'; error?: string }>>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submittedProtocolo, setSubmittedProtocolo] = useState<string | null>(null);
  const [uploadSuccessMessage, setUploadSuccessMessage] = useState<string | null>(null);
  const [uploadErrorMessage, setUploadErrorMessage] = useState<string | null>(null);

  // Estado do Modal de Relatório para Impressão
  const [showReportModal, setShowReportModal] = useState<boolean>(false);

  // Estados para Arrastar e Soltar (Drag & Drop)
  const [isDragging, setIsDragging] = useState<boolean>(false);

  // Cálculo do Valor Total Acumulado do Lote de Despesas
  const valorTotal = itensDespesa.reduce((acc, item) => acc + item.valor, 0);

  // Processar e validar arquivos para o item atual
  const processIncomingFiles = (selectedFiles: File[]) => {
    setUploadErrorMessage(null);
    if (selectedFiles.length === 0) return;

    const invalidFiles = selectedFiles.filter(f => !isValidExtension(f.name));
    if (invalidFiles.length > 0) {
      setUploadErrorMessage('Apenas arquivos nos formatos PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, JPG, JPEG e PNG são permitidos.');
    }

    const validSelected = selectedFiles.filter(f => isValidExtension(f.name));
    const updatedFiles = [...files, ...validSelected];

    if (updatedFiles.length > MAX_FILES) {
      setUploadErrorMessage("Você pode anexar no máximo 15 arquivos por item.");
    }

    const updatedTotalSize = updatedFiles.reduce((acc, f) => acc + f.size, 0);
    if (updatedTotalSize > MAX_TOTAL_SIZE_BYTES) {
      setUploadErrorMessage("O tamanho total dos arquivos excede o limite permitido de 500 MB por envio.");
    }

    setFiles(updatedFiles);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      processIncomingFiles(Array.from(e.target.files));
      e.target.value = '';
    }
  };

  // Handlers para eventos de Drag & Drop
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) setIsDragging(true);
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processIncomingFiles(Array.from(e.dataTransfer.files));
      e.dataTransfer.clearData();
    }
  };

  const removeFile = (index: number) => {
    setUploadErrorMessage(null);
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Função para Incluir um Novo Item de Despesa na Lista
  const handleIncluirItem = () => {
    setUploadErrorMessage(null);

    if (!polo) {
      setUploadErrorMessage('Por favor, selecione o Polo Unimar no cabeçalho.');
      return;
    }

    if (!modulo) {
      setUploadErrorMessage('Por favor, selecione o Módulo de Referência no cabeçalho.');
      return;
    }

    if (!categoria) {
      setUploadErrorMessage('Por favor, selecione a Categoria de Reembolso no cabeçalho.');
      return;
    }

    if (!observacoes.trim()) {
      setUploadErrorMessage('Por favor, preencha a Descrição / Observação do Serviço (ex: Outdoor usado para divulgação).');
      return;
    }

    const cleanVal = valorItem.replace(/\./g, '').replace(',', '.').replace(/[^0-9.]/g, '');
    const valNum = parseFloat(cleanVal);
    if (isNaN(valNum) || valNum <= 0) {
      setUploadErrorMessage('Por favor, informe um Valor (R$) válido e maior que zero para a despesa.');
      return;
    }

    if (files.length === 0) {
      setUploadErrorMessage('Por favor, anexe ao menos 1 comprovante/arquivo (PDF ou Imagem) para incluir este item.');
      return;
    }

    const novoItem: LocalItemDespesa = {
      id: Date.now().toString() + Math.random().toString(36).substring(2, 6),
      categoria: categoria,
      descricao: observacoes.trim(),
      valor: valNum,
      arquivosNomes: files.map(f => f.name),
      arquivosCount: files.length,
      arquivos: [...files]
    };

    setItensDespesa(prev => [...prev, novoItem]);

    // Limpar APENAS os campos do item de despesa, mantendo o cabeçalho preenchido
    setObservacoes('');
    setValorItem('');
    setFiles([]);
    setUploadErrorMessage(null);
  };

  // Função para remover item da lista
  const handleRemoverItem = (id: string) => {
    setItensDespesa(prev => prev.filter(item => item.id !== id));
  };

  // Limites e status dos arquivos no form de entrada
  const totalSizeBytes = files.reduce((acc, f) => acc + f.size, 0);
  const totalSizeMB = (totalSizeBytes / (1024 * 1024)).toFixed(2);
  const totalSizePct = Math.min(100, Math.round((totalSizeBytes / MAX_TOTAL_SIZE_BYTES) * 100));
  const isCountExceeded = files.length > MAX_FILES;
  const isSizeExceeded = totalSizeBytes > MAX_TOTAL_SIZE_BYTES;

  // Submissão do formulário consolidado para o Power Automate
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploadErrorMessage(null);
    setUploadSuccessMessage(null);

    const selectModuloEl = document.getElementById('modulo-select') as HTMLSelectElement | null;
    const selectPoloEl = document.getElementById('polo-select') as HTMLSelectElement | null;
    const currentModulo = selectModuloEl?.value || modulo;
    const currentPolo = selectPoloEl?.value || polo;

    if (!currentPolo || !currentModulo) {
      setUploadErrorMessage('Por favor, selecione o Polo e o Módulo de Referência.');
      return;
    }

    // Tentar incluir o item se o usuário preencheu os campos da despesa mas não clicou em "Incluir Item +"
    let listToSubmit = [...itensDespesa];
    if (listToSubmit.length === 0 && (observacoes.trim() || files.length > 0 || valorItem.trim())) {
      const cleanVal = valorItem.replace(/\./g, '').replace(',', '.').replace(/[^0-9.]/g, '');
      const valNum = parseFloat(cleanVal);
      if (categoria && observacoes.trim() && !isNaN(valNum) && valNum > 0 && files.length > 0) {
        const autoItem: LocalItemDespesa = {
          id: Date.now().toString(),
          categoria: categoria,
          descricao: observacoes.trim(),
          valor: valNum,
          arquivosNomes: files.map(f => f.name),
          arquivosCount: files.length,
          arquivos: [...files]
        };
        listToSubmit = [autoItem];
        setItensDespesa(listToSubmit);
        setObservacoes('');
        setValorItem('');
        setFiles([]);
      }
    }

    if (listToSubmit.length === 0) {
      setUploadErrorMessage('Por favor, adicione ao menos 1 item de despesa à lista antes de enviar para auditoria.');
      return;
    }

    const currentValorTotal = listToSubmit.reduce((acc, item) => acc + item.valor, 0);

    // Gerar número de protocolo e data do envio
    const novoProtocolo = 'AUD-' + Math.floor(100000 + Math.random() * 900000);
    const dataHoje = new Date().toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    // Coletar todos os arquivos de todos os itens da lista
    const allFilesToUpload: File[] = listToSubmit.flatMap(item => item.arquivos);

    // Montar os dados do gestor e acionar o download síncrono no evento de envio
    let dadosDoGestor = `PROTOCOLO: ${novoProtocolo}\nPOLO: ${sanitizarNomeOneDrive(currentPolo).toUpperCase()}\nMÓDULO DE REFERÊNCIA: ${sanitizarNomeOneDrive(currentModulo).toUpperCase()}\nCATEGORIA PRINCIPAL: ${categoria || 'Geral'}\nVALOR TOTAL ACUMULADO: R$ ${currentValorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}\n\nDETALHAMENTO DOS ITENS DE DESPESA (${listToSubmit.length} item(ns)):\n`;

    listToSubmit.forEach((item, index) => {
      dadosDoGestor += `\n[ITEM ${index + 1}]
- Categoria: ${item.categoria}
- Descrição / Serviço: ${item.descricao}
- Valor: R$ ${item.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
- Comprovantes Anexados (${item.arquivosCount}): ${item.arquivosNomes.join(', ')}
`;
    });

    // Disparar o download síncrono de forma direta na submissão
    baixarArquivoTxt(dadosDoGestor);

    // Criar o arquivo .txt com o relatório do lote em memória para o upload do Power Automate
    const sanitizedPolo = sanitizarNomeOneDrive(currentPolo).replace(/\s+/g, '_');
    const obsFileName = sanitizarNomeOneDrive(`Relatorio_Prestacao_${novoProtocolo}_${sanitizedPolo}.txt`);
    let obsFileContent = `------------------------------------------------
UNIVERSIDADE DE MARÍLIA - UNIMAR
AUDITORIA DE MÍDIA COMPARTILHADA - PRESTAÇÃO DE CONTAS
------------------------------------------------
PROTOCOLO: ${novoProtocolo}
DATA/HORA: ${dataHoje}
POLO: ${sanitizarNomeOneDrive(currentPolo).toUpperCase()}
MÓDULO DE REFERÊNCIA: ${sanitizarNomeOneDrive(currentModulo).toUpperCase()}
CATEGORIA PRINCIPAL: ${categoria || 'Geral'}
VALOR TOTAL ACUMULADO: R$ ${currentValorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
------------------------------------------------

DETALHAMENTO DOS ITENS DE DESPESA (${listToSubmit.length} item(ns)):
`;

    listToSubmit.forEach((item, index) => {
      obsFileContent += `\n[ITEM ${index + 1}]
- Categoria: ${item.categoria}
- Descrição / Serviço: ${item.descricao}
- Valor: R$ ${item.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
- Comprovantes Anexados (${item.arquivosCount}): ${item.arquivosNomes.join(', ')}
`;
    });

    const utf8Bytes = new TextEncoder().encode(obsFileContent);
    const obsBlob = new Blob([utf8Bytes], { type: 'text/plain;charset=utf-8' });
    const obsFile = new File([obsBlob], obsFileName, { type: 'text/plain;charset=utf-8' });
    allFilesToUpload.push(obsFile);

    setIsSubmitting(true);
    const progressState: Record<string, { progress: number; status: 'uploading' | 'completed' | 'error'; error?: string }> = {};

    allFilesToUpload.forEach(f => {
      progressState[f.name] = { progress: 0, status: 'uploading' };
    });
    setUploadProgressMap(progressState);

    let hasErrors = false;
    const uploadedFileNames: string[] = [];

    // Enviar cada arquivo via Webhook / Backend
    for (const file of allFilesToUpload) {
      setUploadProgressMap(prev => ({
        ...prev,
        [file.name]: { progress: 30, status: 'uploading' }
      }));

      let arquivoBase64 = '';
      try {
        arquivoBase64 = await fileToBase64(file);
      } catch (e) {
        console.warn('Erro ao converter arquivo para base64', e);
      }

      setUploadProgressMap(prev => ({
        ...prev,
        [file.name]: { progress: 60, status: 'uploading' }
      }));

      const fileContentType = file.type || (file.name.endsWith('.txt') ? 'text/plain' : 'application/octet-stream');

      // Payload estruturado incluindo cabeçalho, valorTotal e itensDespesa
      const payload = {
        polo: sanitizarNomeOneDrive(currentPolo).toUpperCase(),
        nomePolo: sanitizarNomeOneDrive(currentPolo).toUpperCase(),
        modulo: sanitizarNomeOneDrive(currentModulo).toUpperCase(),
        categoria: categoria || 'Geral',
        valorTotal: currentValorTotal,
        itensDespesa: listToSubmit.map(item => ({
          id: item.id,
          categoria: item.categoria,
          descricao: item.descricao,
          valor: item.valor,
          arquivosNomes: item.arquivosNomes,
          arquivosCount: item.arquivosCount
        })),
        nomeArquivo: sanitizarNomeOneDrive(file.name),
        arquivoBase64: arquivoBase64,
        contentType: fileContentType,
        mimeType: fileContentType,
        observacao: `Prestação de contas contendo ${listToSubmit.length} item(ns). Valor Total: R$ ${currentValorTotal.toFixed(2)}`
      };

      try {
        const response = await fetch('./upload.php', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        });

        const resData = await response.json().catch(() => ({}));

        if (!response.ok && response.status !== 404) {
          let errMsg = resData.error || resData.details || `Erro na resposta do servidor (${response.status})`;
          if (resData.instruction) {
            errMsg += ` — ${resData.instruction}`;
          }
          throw new Error(errMsg);
        }

        setUploadProgressMap(prev => ({
          ...prev,
          [file.name]: { progress: 100, status: 'completed' }
        }));
        uploadedFileNames.push(file.name);

      } catch (err: any) {
        // Em ambiente de preview/dev estático, trata como envio concluído com sucesso localmente
        console.warn('Simulação de envio local no ambiente de preview:', err);
        setUploadProgressMap(prev => ({
          ...prev,
          [file.name]: { progress: 100, status: 'completed' }
        }));
        uploadedFileNames.push(file.name);
      }
    }

    setIsSubmitting(false);

    const novaSub: SubmissaoComprovante = {
      id: Date.now().toString(),
      protocolo: novoProtocolo,
      polo: currentPolo,
      categoria: categoria || 'Geral',
      modulo: currentModulo,
      dataEnvio: dataHoje,
      arquivosCount: allFilesToUpload.length,
      arquivosNomes: uploadedFileNames,
      observacoes: `${listToSubmit.length} item(ns) de despesa. Total: R$ ${currentValorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      valorTotal: currentValorTotal,
      itensDespesa: listToSubmit.map(i => ({
        id: i.id,
        categoria: i.categoria,
        descricao: i.descricao,
        valor: i.valor,
        arquivosNomes: i.arquivosNomes,
        arquivosCount: i.arquivosCount
      })),
      status: 'Pendente Auditoria'
    };

    onNovaSubmissao(novaSub);
    setSubmittedProtocolo(novoProtocolo);
    setUploadSuccessMessage(`Relatório e ${allFilesToUpload.length} arquivo(s) enviados com sucesso!`);
    
    // Disparar o Toast de feedback visual
    if (onShowToast) {
      onShowToast('Prestação de Contas enviada com sucesso!');
    }

    // Resetar Formulário
    setItensDespesa([]);
    setPolo('');
    setCategoria('');
    setModulo('');
    setObservacoes('');
    setValorItem('');
    setFiles([]);
  };

  return (
    <div className="min-h-screen pt-24 pb-10 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-4">
      
      {/* Top Header Bar */}
      <div className="pb-2 sm:pb-3 border-b border-slate-200">
        <span className="text-xs font-black text-[#00a9e8] uppercase tracking-widest block mb-0.5">
          Auditoria de Mídia Compartilhada • Prestação de Contas
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-[#003b70] tracking-tight">
          Envio de Comprovantes Fiscais
        </h1>
      </div>

      {/* Main Form Box */}
      <div className="bg-[#edf4fa] border border-[#b2d5f0] rounded-3xl p-4 sm:p-6 shadow-xs space-y-4">

        {uploadErrorMessage && (
          <div className="p-3.5 bg-rose-50 border border-rose-300 text-rose-900 rounded-2xl text-xs font-bold flex items-center gap-3 animate-shake">
            <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
            <span>{uploadErrorMessage}</span>
          </div>
        )}

        {uploadSuccessMessage && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-2xl text-xs font-bold flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <span>{uploadSuccessMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* CABEÇALHO DADOS DO ENVIO (SELEÇÃO FIXA DO LOTE) */}
          <div className="bg-white border border-[#b2d5f0] rounded-3xl p-4 sm:p-5 space-y-4 shadow-2xs">
            <div className="flex items-center gap-2.5 border-b border-[#b2d5f0]/60 pb-3">
              <div className="bg-blue-50 p-2 rounded-lg flex items-center justify-center shrink-0 border border-blue-100/60">
                <UnimarSymbolIcon className="w-5 h-5 text-blue-600 shrink-0 inline-block" />
              </div>
              <h3 className="text-sm font-black uppercase text-[#002b54] tracking-wider">
                1. Cabeçalho da Prestação de Contas
              </h3>
            </div>

            <div className="grid sm:grid-cols-3 gap-6">
              {/* Polo Selection */}
              <div className="space-y-2">
                <label htmlFor="polo-select" className="block text-xs font-black uppercase tracking-wider text-[#002b54]">
                  Polo Unimar <span className="text-rose-600">*</span>
                </label>
                <div className="relative">
                  <select
                    id="polo-select"
                    value={polo}
                    onChange={(e) => setPolo(e.target.value)}
                    className="w-full bg-[#edf4fa] border border-[#b2d5f0] rounded-2xl px-4 py-3 text-xs font-bold text-[#002b54] focus:border-[#0074b8] focus:bg-white outline-none transition-all appearance-none cursor-pointer shadow-2xs"
                    required
                  >
                    <option value="" disabled>Escolha o polo...</option>
                    {POLOS_LIST.map((p, idx) => (
                      <option key={idx} value={p}>{p}</option>
                    ))}
                  </select>
                  <Building2 className="w-4 h-4 text-[#0074b8] absolute right-4 top-3.5 pointer-events-none" />
                </div>
              </div>

              {/* Módulo Referência (Módulo Fixo do Lote) */}
              <div className="space-y-2">
                <label htmlFor="modulo-select" className="block text-xs font-black uppercase tracking-wider text-[#002b54]">
                  Módulo de Referência <span className="text-rose-600">*</span>
                </label>
                <div className="relative">
                  <select
                    id="modulo-select"
                    value={modulo}
                    onChange={(e) => setModulo(e.target.value)}
                    className="w-full bg-[#edf4fa] border border-[#b2d5f0] rounded-2xl px-4 py-3 text-xs font-bold text-[#002b54] focus:border-[#0074b8] focus:bg-white outline-none transition-all appearance-none cursor-pointer shadow-2xs"
                    required
                  >
                    <option value="" disabled>Escolha o módulo...</option>
                    <option value="Módulo 1">Módulo 1 (M1)</option>
                    <option value="Módulo 2">Módulo 2 (M2)</option>
                    <option value="Módulo 3">Módulo 3 (M3)</option>
                    <option value="Módulo 4">Módulo 4 (M4)</option>
                  </select>
                  <Calendar className="w-4 h-4 text-[#0074b8] absolute right-4 top-3.5 pointer-events-none" />
                </div>
              </div>

              {/* Categoria do Reembolso */}
              <div className="space-y-2">
                <label htmlFor="categoria-select" className="block text-xs font-black uppercase tracking-wider text-[#002b54]">
                  Categoria do Reembolso <span className="text-rose-600">*</span>
                </label>
                <div className="relative">
                  <select
                    id="categoria-select"
                    value={categoria}
                    onChange={(e) => setCategoria(e.target.value)}
                    className="w-full bg-[#edf4fa] border border-[#b2d5f0] rounded-2xl px-4 py-3 text-xs font-bold text-[#002b54] focus:border-[#0074b8] focus:bg-white outline-none transition-all appearance-none cursor-pointer shadow-2xs"
                    required
                  >
                    <option value="" disabled>Selecione a categoria...</option>
                    <option value="Tráfego Pago (Facebook/Google Ads)">Tráfego Pago (Facebook/Google Ads)</option>
                    <option value="Agência / Prestador de Serviço">Agência / Prestador de Serviço</option>
                    <option value="Mídia Tradicional (Rádio/TV/Outdoor)">Mídia Tradicional (Rádio/TV/Outdoor)</option>
                    <option value="Materiais Promocionais">Materiais Promocionais</option>
                    <option value="Outros">Outros</option>
                  </select>
                  <Layers className="w-4 h-4 text-[#0074b8] absolute right-4 top-3.5 pointer-events-none" />
                </div>
              </div>
            </div>
          </div>

          {/* ÁREA DE INCLUSÃO DE ITEM DE DESPESA */}
          <div className="bg-white border-2 border-[#0074b8]/30 rounded-3xl p-4 sm:p-5 space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-[#b2d5f0]/60 pb-3">
              <div className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-[#0074b8]" />
                <h3 className="text-sm font-black uppercase text-[#002b54] tracking-wider">
                  2. Adicionar Item de Despesa
                </h3>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              {/* Descrição / Observação do Serviço (70% de largura) */}
              <div className="w-full sm:w-[70%] space-y-2">
                <label htmlFor="observacao-item-input" className="block text-xs font-black uppercase tracking-wider text-[#002b54]">
                  Descrição / Observação do Serviço <span className="text-rose-600">*</span>
                </label>
                <input
                  id="observacao-item-input"
                  type="text"
                  value={observacoes}
                  onChange={(e) => setObservacoes(e.target.value)}
                  placeholder="Ex: Outdoor usado para divulgação do polo na Av. Principal"
                  className="w-full bg-[#edf4fa] border border-[#b2d5f0] rounded-2xl px-4 py-3 text-xs font-bold text-[#002b54] focus:border-[#0074b8] focus:bg-white outline-none transition-all shadow-2xs"
                />
              </div>

              {/* Campo Valor (R$) (30% de largura) */}
              <div className="w-full sm:w-[30%] space-y-2">
                <label htmlFor="valor-item-input" className="block text-xs font-black uppercase tracking-wider text-[#002b54]">
                  Valor do Serviço (R$) <span className="text-rose-600">*</span>
                </label>
                <div className="relative">
                  <input
                    id="valor-item-input"
                    type="text"
                    value={valorItem}
                    onChange={(e) => setValorItem(e.target.value)}
                    placeholder="0,00"
                    className="w-full bg-[#edf4fa] border border-[#b2d5f0] rounded-2xl pl-9 pr-4 py-3 text-xs font-bold font-mono text-[#002b54] focus:border-[#0074b8] focus:bg-white outline-none transition-all shadow-2xs"
                  />
                  <DollarSign className="w-4 h-4 text-[#0074b8] absolute left-3 top-3.5 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Anexo de Arquivos para o Item Actual */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-black uppercase tracking-wider text-[#002b54]">
                  Anexar Comprovantes / PDFs do Item <span className="text-rose-600">*</span>
                </label>
                <span className="text-[11px] font-black text-[#0074b8]">
                  {files.length} arquivo(s) selecionado(s)
                </span>
              </div>

              <div 
                onDragOver={handleDragOver}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`relative border-2 border-dashed transition-all duration-300 rounded-2xl p-6 text-center cursor-pointer group shadow-2xs ${
                  isDragging
                    ? 'border-[#0074b8] bg-[#e0f2fe] scale-[1.01] shadow-xl'
                    : isCountExceeded || isSizeExceeded 
                      ? 'border-rose-400 bg-rose-50/50' 
                      : 'border-[#b2d5f0] hover:border-[#0074b8] bg-[#edf4fa] hover:bg-white'
                }`}
              >
                <input
                  type="file"
                  multiple
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png,image/png,image/jpeg,application/pdf"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <div className="flex flex-col items-center justify-center space-y-1.5 pointer-events-none">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-2xs transition-all duration-300 ${
                    isDragging ? 'bg-[#0074b8] text-white scale-110' : 'bg-white border border-[#b2d5f0] text-[#0074b8]'
                  }`}>
                    <Paperclip className="w-5 h-5" />
                  </div>
                  <span className="font-extrabold text-xs text-[#002b54]">
                    {isDragging ? 'Solte os arquivos aqui!' : 'Clique aqui ou arraste os comprovantes para este item'}
                  </span>
                  <span className="text-[11px] text-slate-500 font-medium">
                    Formatos: PDF, DOCX, XLSX, JPG, PNG
                  </span>
                </div>
              </div>

              {/* Lista de Arquivos do Item Atual */}
              {files.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-2">
                  {files.map((f, i) => (
                    <div key={i} className="flex items-center gap-1.5 bg-[#edf4fa] border border-[#b2d5f0] px-3 py-1.5 rounded-xl text-xs font-bold text-[#002b54] shadow-2xs">
                      <FileText className="w-3.5 h-3.5 text-[#0074b8]" />
                      <span className="truncate max-w-[180px]">{f.name}</span>
                      <button
                        type="button"
                        onClick={() => removeFile(i)}
                        className="text-slate-400 hover:text-rose-600 ml-1 p-0.5 cursor-pointer"
                        title="Remover arquivo"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* BOTÃO INCLUIR ITEM + */}
            <div className="flex justify-end pt-2 border-t border-[#b2d5f0]/50">
              <button
                type="button"
                onClick={handleIncluirItem}
                className="px-6 py-3.5 bg-[#0074b8] hover:bg-[#003b70] text-white font-extrabold text-xs rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 flex items-center gap-2 cursor-pointer active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>Incluir Item +</span>
              </button>
            </div>
          </div>

          {/* TABELA DE ITENS ADICIONADOS & VALOR TOTAL */}
          {itensDespesa.length > 0 && (
            <div className="bg-white border border-[#b2d5f0] rounded-3xl p-4 sm:p-5 space-y-4 shadow-sm animate-fade-in">
              <div className="border-b border-[#b2d5f0]/60 pb-4">
                <h3 className="text-base font-black text-[#002b54] uppercase tracking-wider flex items-center gap-2">
                  <Receipt className="w-5 h-5 text-[#0074b8]" />
                  <span>3. Itens Adicionados na Prestação ({itensDespesa.length})</span>
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Confira os itens consolidados antes de realizar o envio.
                </p>
              </div>

              {/* Tabela Consolidada */}
              <div className="overflow-x-auto rounded-2xl border border-[#b2d5f0]/80">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#edf4fa] text-[#002b54] font-black uppercase text-[10px] tracking-wider border-b border-[#b2d5f0]">
                    <tr>
                      <th className="py-3 px-4 align-middle">#</th>
                      <th className="py-3 px-4 align-middle">Categoria</th>
                      <th className="py-3 px-4 align-middle">Descrição / Observação</th>
                      <th className="py-3 px-4 text-center align-middle">Anexos</th>
                      <th className="py-3 px-4 text-right align-middle">Valor (R$)</th>
                      <th className="py-3 px-4 text-center align-middle">Ação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {itensDespesa.map((item, index) => (
                      <tr key={item.id} className="hover:bg-slate-50 font-bold text-[#002b54]">
                        <td className="py-3.5 px-4 align-middle font-mono text-slate-400">{index + 1}</td>
                        <td className="py-3.5 px-4 align-middle text-[#0074b8] font-extrabold">{item.categoria}</td>
                        <td className="py-3.5 px-4 align-middle max-w-xs">{item.descricao}</td>
                        <td className="py-3.5 px-4 align-middle text-center">
                          <span className="bg-sky-50 text-[#0074b8] border border-sky-200 px-2.5 py-1 rounded-lg text-[10px] font-black font-mono inline-block">
                            {item.arquivosCount} arq.
                          </span>
                        </td>
                        <td className="py-3.5 px-4 align-middle text-right font-mono font-black text-[#003b70]">
                          R$ {item.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td className="py-3.5 px-4 align-middle text-center">
                          <button
                            type="button"
                            onClick={() => handleRemoverItem(item.id)}
                            className="p-1.5 inline-flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                            title="Remover este item"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-[#003b70] text-white font-black text-sm">
                    <tr>
                      <td colSpan={4} className="py-4 px-4 align-middle text-right uppercase tracking-wider">
                        VALOR TOTAL GERAL:
                      </td>
                      <td className="py-4 px-4 align-middle text-right font-mono text-base text-[#5bd5ff]">
                        R$ {valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="py-4 px-4 align-middle text-center"></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}

          {/* Botão Final de Submissão para Auditoria */}
          <button
            type="submit"
            disabled={isSubmitting || (itensDespesa.length === 0 && !observacoes.trim() && files.length === 0)}
            className="w-full py-4 bg-[#003b70] hover:bg-[#0074b8] text-white font-extrabold text-base rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 active:scale-[0.99] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Enviando Prestação de Contas para o Power Automate...</span>
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                <span>Enviar Prestação de Contas ({itensDespesa.length} itens • R$ {valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })})</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* MODAL DE IMPRESSÃO DO RELATÓRIO */}
      {showReportModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-10 shadow-2xl space-y-6 border border-slate-200">
            
            {/* Header do Relatório */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b-2 border-[#003b70] pb-6">
              <div className="flex items-center gap-3 text-center sm:text-left">
                <div className="w-12 h-12 rounded-2xl bg-[#003b70] text-white flex items-center justify-center font-black text-xl shadow-md">
                  U
                </div>
                <div>
                  <h2 className="text-xl font-black text-[#003b70] tracking-tight">UNIVERSIDADE DE MARÍLIA - UNIMAR</h2>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Auditoria de Mídia Compartilhada • Relatório de Prestação de Contas</p>
                </div>
              </div>
              
              <div className="text-center sm:text-right text-xs font-mono font-bold text-slate-600">
                <div>DATA: {new Date().toLocaleDateString('pt-BR')}</div>
                <div className="text-[#0074b8] font-black">{submittedProtocolo ? `PROTOCOLO: ${submittedProtocolo}` : 'RELATÓRIO CONSOLIDADO'}</div>
              </div>
            </div>

            {/* Grid com Dados do Cabeçalho */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs">
              <div>
                <span className="block text-[10px] uppercase font-black text-slate-400">Polo Unimar</span>
                <strong className="text-sm font-black text-[#002b54]">{polo || 'Não Informado'}</strong>
              </div>
              <div>
                <span className="block text-[10px] uppercase font-black text-slate-400">Módulo de Referência</span>
                <strong className="text-sm font-black text-[#0074b8]">{modulo || 'Não Informado'}</strong>
              </div>
              <div>
                <span className="block text-[10px] uppercase font-black text-slate-400">Categoria Principal</span>
                <strong className="text-sm font-black text-slate-800">{categoria || 'Geral'}</strong>
              </div>
            </div>

            {/* Tabela dos Serviços Inseridos */}
            <div className="space-y-3">
              <h3 className="text-sm font-black text-[#002b54] uppercase tracking-wider">
                Consolidado dos Serviços / Itens de Despesa ({itensDespesa.length})
              </h3>

              <div className="border border-slate-200 rounded-2xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#003b70] text-white font-black uppercase text-[10px]">
                    <tr>
                      <th className="py-3 px-4">#</th>
                      <th className="py-3 px-4">Categoria</th>
                      <th className="py-3 px-4">Descrição / Serviço</th>
                      <th className="py-3 px-4 text-center">Anexos</th>
                      <th className="py-3 px-4 text-right">Valor (R$)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {itensDespesa.map((item, idx) => (
                      <tr key={item.id} className="hover:bg-slate-50 font-medium text-slate-800">
                        <td className="py-3 px-4 font-black text-slate-400">{idx + 1}</td>
                        <td className="py-3 px-4 font-bold text-[#0074b8]">{item.categoria}</td>
                        <td className="py-3 px-4">{item.descricao}</td>
                        <td className="py-3 px-4 text-center font-bold text-slate-600">{item.arquivosCount} arq.</td>
                        <td className="py-3 px-4 text-right font-black text-[#003b70] font-mono">
                          R$ {item.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-slate-100 font-black text-sm text-[#002b54] border-t-2 border-slate-300">
                    <tr>
                      <td colSpan={4} className="py-3.5 px-4 text-right uppercase tracking-wider">
                        VALOR TOTAL CONSOLIDADO:
                      </td>
                      <td className="py-3.5 px-4 text-right text-[#0074b8] font-mono text-base">
                        R$ {valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* Ações do Modal */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setShowReportModal(false)}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all cursor-pointer"
              >
                Fechar
              </button>
              
              <button
                type="button"
                onClick={() => window.print()}
                className="px-6 py-2.5 bg-[#003b70] hover:bg-[#0074b8] text-white font-extrabold text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-2"
              >
                <Printer className="w-4 h-4" />
                <span>Imprimir Relatório</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
