import React, { useState } from 'react';
import { PageView, SubmissaoComprovante } from '../types';
import { POLOS_LIST } from '../data/mockData';
import { storage } from '../firebase';
import { 
  ref, 
  uploadBytesResumable 
} from 'firebase/storage';
import { 
  Upload, 
  FileText, 
  CheckCircle2, 
  X, 
  Clock, 
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
  HardDrive
} from 'lucide-react';

interface UploadPageProps {
  onNavigate: (view: PageView) => void;
  submissoesAnteriores: SubmissaoComprovante[];
  onNovaSubmissao: (submissao: SubmissaoComprovante) => void;
}

// Limits and Constants
const MAX_FILES = 15;
const MAX_TOTAL_SIZE_BYTES = 500 * 1024 * 1024; // 500 MB
const ALLOWED_EXTENSIONS = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'jpg', 'jpeg', 'png'];

function formatFileSize(bytes: number): string {
  if (bytes < 1024 * 1024) {
    return (bytes / 1024).toFixed(1) + ' KB';
  }
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}

function isValidExtension(fileName: string): boolean {
  const ext = fileName.split('.').pop()?.toLowerCase();
  return ext ? ALLOWED_EXTENSIONS.includes(ext) : false;
}

export const UploadPage: React.FC<UploadPageProps> = ({ 
  onNavigate, 
  submissoesAnteriores, 
  onNovaSubmissao 
}) => {
  // Form State
  const [polo, setPolo] = useState<string>('');
  const [categoria, setCategoria] = useState<string>('');
  const [modulo, setModulo] = useState<string>('');
  const [observacoes, setObservacoes] = useState<string>('');
  const [files, setFiles] = useState<File[]>([]);
  
  // Storage Upload State
  const [uploadProgressMap, setUploadProgressMap] = useState<Record<string, { progress: number; status: 'uploading' | 'completed' | 'error'; error?: string }>>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submittedProtocolo, setSubmittedProtocolo] = useState<string | null>(null);
  const [uploadSuccessMessage, setUploadSuccessMessage] = useState<string | null>(null);
  const [uploadErrorMessage, setUploadErrorMessage] = useState<string | null>(null);

  // File Handling & Validations
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadErrorMessage(null);
    if (e.target.files) {
      const selectedFiles: File[] = Array.from(e.target.files);
      
      // Filter out files with invalid extensions
      const invalidFiles = selectedFiles.filter(f => !isValidExtension(f.name));
      if (invalidFiles.length > 0) {
        setUploadErrorMessage('Apenas arquivos nos formatos PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, JPG, JPEG e PNG são permitidos.');
      }

      const validSelected = selectedFiles.filter(f => isValidExtension(f.name));
      const updatedFiles = [...files, ...validSelected];

      // Check max file count (15)
      if (updatedFiles.length > MAX_FILES) {
        setUploadErrorMessage("Você pode enviar no máximo 15 arquivos por vez.");
      }

      // Check total size limit (500 MB)
      const updatedTotalSize = updatedFiles.reduce((acc, f) => acc + f.size, 0);
      if (updatedTotalSize > MAX_TOTAL_SIZE_BYTES) {
        setUploadErrorMessage("O tamanho total dos arquivos excede o limite permitido de 500 MB por envio.");
      }

      setFiles(updatedFiles);
    }
  };

  const removeFile = (index: number) => {
    setUploadErrorMessage(null);
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Calculations for File Limits
  const totalSizeBytes = files.reduce((acc, f) => acc + f.size, 0);
  const totalSizeMB = (totalSizeBytes / (1024 * 1024)).toFixed(2);
  const totalSizePct = Math.min(100, Math.round((totalSizeBytes / MAX_TOTAL_SIZE_BYTES) * 100));

  const isCountExceeded = files.length > MAX_FILES;
  const isSizeExceeded = totalSizeBytes > MAX_TOTAL_SIZE_BYTES;
  const isFormBlocked = files.length === 0 || isCountExceeded || isSizeExceeded || isSubmitting;

  // Upload Submission to Firebase Storage (documentos_recebidos/)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploadErrorMessage(null);
    setUploadSuccessMessage(null);

    if (!polo || !categoria || !modulo || files.length === 0) {
      setUploadErrorMessage('Por favor, preencha todos os campos obrigatórios e selecione ao menos 1 arquivo.');
      return;
    }

    // 1. Validate file count limit (Max 15)
    if (files.length > MAX_FILES) {
      setUploadErrorMessage("Você pode enviar no máximo 15 arquivos por vez.");
      return;
    }

    // 2. Validate total size limit (Max 500 MB)
    if (totalSizeBytes > MAX_TOTAL_SIZE_BYTES) {
      setUploadErrorMessage("O tamanho total dos arquivos excede o limite permitido de 500 MB por envio.");
      return;
    }

    // 3. Validate extensions
    const invalidFiles = files.filter(f => !isValidExtension(f.name));
    if (invalidFiles.length > 0) {
      setUploadErrorMessage('Apenas arquivos nos formatos PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, JPG, JPEG e PNG são permitidos.');
      return;
    }

    setIsSubmitting(true);
    const progressState: Record<string, { progress: number; status: 'uploading' | 'completed' | 'error'; error?: string }> = {};

    files.forEach(f => {
      progressState[f.name] = { progress: 0, status: 'uploading' };
    });
    setUploadProgressMap(progressState);

    let hasErrors = false;
    const uploadedFileNames: string[] = [];

    // Folder structure in Firebase Storage: `documentos_recebidos/{polo_folder}/{nome-do-arquivo}`
    const poloFolder = polo.replace(/[^a-zA-Z0-9áàâãéèêíïóôõöúçñÁÀÂÃÉÈÊÍÏÓÔÕÖÚÇÑ\s_-]/g, '').trim().replace(/\s+/g, '_');

    // Upload each file to Firebase Storage
    for (const file of files) {
      const storagePath = `documentos_recebidos/${poloFolder}/${file.name}`;
      const fileRef = ref(storage, storagePath);
      const uploadTask = uploadBytesResumable(fileRef, file);

      await new Promise<void>((resolve) => {
        uploadTask.on(
          'state_changed',
          (snapshot) => {
            const pct = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
            setUploadProgressMap(prev => ({
              ...prev,
              [file.name]: { progress: pct, status: 'uploading' }
            }));
          },
          (error) => {
            console.error('Erro no upload:', error);
            hasErrors = true;
            setUploadProgressMap(prev => ({
              ...prev,
              [file.name]: { progress: 0, status: 'error', error: error.message }
            }));
            resolve();
          },
          () => {
            setUploadProgressMap(prev => ({
              ...prev,
              [file.name]: { progress: 100, status: 'completed' }
            }));
            uploadedFileNames.push(file.name);
            resolve();
          }
        );
      });
    }

    setIsSubmitting(false);

    if (hasErrors) {
      setUploadErrorMessage('Ocorreu um erro no envio de alguns arquivos para o Firebase Storage. Tente novamente.');
    } else {
      const novoProtocolo = 'AUD-' + Math.floor(100000 + Math.random() * 900000);
      const dataHoje = new Date().toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });

      const novaSub: SubmissaoComprovante = {
        id: Date.now().toString(),
        protocolo: novoProtocolo,
        polo,
        categoria,
        modulo,
        dataEnvio: dataHoje,
        arquivosCount: files.length,
        arquivosNomes: uploadedFileNames,
        observacoes,
        status: 'Pendente Auditoria'
      };

      onNovaSubmissao(novaSub);
      setSubmittedProtocolo(novoProtocolo);
      setUploadSuccessMessage(`Todos os ${files.length} arquivo(s) foram enviados com sucesso!`);

      // Reset Form
      setPolo('');
      setCategoria('');
      setModulo('');
      setObservacoes('');
      setFiles([]);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-10">
      
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <span className="text-xs font-black text-[#00a9e8] uppercase tracking-widest block mb-1">
            Auditoria de Mídia Compartilhada • Prestação de Contas
          </span>
          <h1 className="text-2xl sm:text-4xl font-black text-[#003b70] tracking-tight">
            Envio de Comprovantes Fiscais
          </h1>
        </div>

        <div className="flex items-center gap-2 bg-[#edf4fa] border border-[#b2d5f0] px-4 py-2.5 rounded-2xl text-xs font-black text-[#0074b8] shadow-2xs">
          <ShieldCheck className="w-4 h-4 text-[#00a9e8]" />
          <span>Firebase Storage • Acesso Público para Envio</span>
        </div>
      </div>

      {/* Success Protocol Notification */}
      {submittedProtocolo && (
        <div className="bg-[#edf4fa] border border-emerald-300 rounded-3xl p-6 sm:p-8 space-y-4 shadow-sm animate-fade-in">
          <div className="flex items-center gap-3 text-emerald-950">
            <CheckCircle2 className="w-8 h-8 text-emerald-600 flex-shrink-0" />
            <div>
              <h3 className="text-xl font-black text-emerald-950">Comprovantes Salvos no Firebase Storage!</h3>
              <p className="text-xs sm:text-sm text-emerald-800 font-medium">
                Os arquivos foram armazenados com sucesso na pasta de auditoria do Firebase Storage.
              </p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-emerald-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-2xs">
            <div>
              <span className="text-xs uppercase font-extrabold text-slate-700 block">Número de Protocolo</span>
              <strong className="text-2xl font-black text-[#0074b8] font-mono">{submittedProtocolo}</strong>
            </div>

            <button
              onClick={() => {
                setSubmittedProtocolo(null);
                setUploadSuccessMessage(null);
              }}
              className="text-xs font-black bg-[#002b54] hover:bg-[#003b70] text-white px-5 py-3 rounded-xl transition-all cursor-pointer shadow-xs active:scale-95"
            >
              Realizar Novo Envio
            </button>
          </div>
        </div>
      )}

      {/* Main Form Box */}
      <div className="bg-[#edf4fa] border border-[#b2d5f0] rounded-3xl p-6 sm:p-10 shadow-xs space-y-8">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-white border border-[#b2d5f0] text-[#0074b8] flex items-center justify-center mx-auto mb-2 shadow-2xs">
            <Upload className="w-7 h-7 text-[#0074b8]" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#002b54]">
            Preencha os Dados do Envio
          </h2>
          <p className="text-xs sm:text-sm text-slate-700 font-medium leading-relaxed">
            Anexe as Notas Fiscais, comprovantes e relatórios nos formatos permitidos para armazenar no Firebase Storage.
          </p>
        </div>

        {uploadErrorMessage && (
          <div className="p-4 bg-rose-50 border border-rose-300 text-rose-900 rounded-2xl text-xs font-bold flex items-center gap-3 animate-shake">
            <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
            <span>{uploadErrorMessage}</span>
          </div>
        )}

        {uploadSuccessMessage && (
          <div className="p-4 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-2xl text-xs font-bold flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <span>{uploadSuccessMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Row 1: Polo & Categoria */}
          <div className="grid sm:grid-cols-2 gap-6">
            {/* Polo Selection */}
            <div className="space-y-2">
              <label htmlFor="polo-select" className="block text-xs font-black uppercase tracking-wider text-[#002b54]">
                Selecione o Polo Unimar <span className="text-rose-600">*</span>
              </label>
              <div className="relative">
                <select
                  id="polo-select"
                  value={polo}
                  onChange={(e) => setPolo(e.target.value)}
                  className="w-full bg-white border border-[#b2d5f0] rounded-2xl px-4 py-3.5 text-sm font-bold text-[#002b54] focus:border-[#0074b8] focus:bg-white outline-none transition-all appearance-none cursor-pointer shadow-xs"
                  required
                >
                  <option value="" disabled>Escolha a cidade do polo...</option>
                  {POLOS_LIST.map((p, idx) => (
                    <option key={idx} value={p}>{p}</option>
                  ))}
                </select>
                <Building2 className="w-5 h-5 text-[#0074b8] absolute right-4 top-3.5 pointer-events-none" />
              </div>
            </div>

            {/* Categoria */}
            <div className="space-y-2">
              <label htmlFor="categoria-select" className="block text-xs font-black uppercase tracking-wider text-[#002b54]">
                Categoria de Reembolso <span className="text-rose-600">*</span>
              </label>
              <div className="relative">
                <select
                  id="categoria-select"
                  value={categoria}
                  onChange={(e) => setCategoria(e.target.value)}
                  className="w-full bg-white border border-[#b2d5f0] rounded-2xl px-4 py-3.5 text-sm font-bold text-[#002b54] focus:border-[#0074b8] focus:bg-white outline-none transition-all appearance-none cursor-pointer shadow-xs"
                  required
                >
                  <option value="" disabled>Selecione a categoria de investimento...</option>
                  <option value="Tráfego Pago (Facebook/Google Ads)">Tráfego Pago (Facebook/Google Ads)</option>
                  <option value="Agência / Prestador de Serviço">Agência / Prestador de Serviço</option>
                  <option value="Mídia Tradicional (Rádio/TV/Outdoor)">Mídia Tradicional (Rádio/TV/Outdoor)</option>
                  <option value="Materiais Promocionais">Materiais Promocionais</option>
                  <option value="Outros">Outros (Especifique nas observações)</option>
                </select>
                <Layers className="w-5 h-5 text-[#0074b8] absolute right-4 top-3.5 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Row 2: Módulo Referência */}
          <div className="space-y-2">
            <label htmlFor="modulo-select" className="block text-xs font-black uppercase tracking-wider text-[#002b54]">
              Módulo de Referência <span className="text-rose-600">*</span>
            </label>
            <div className="relative">
              <select
                id="modulo-select"
                value={modulo}
                onChange={(e) => setModulo(e.target.value)}
                className="w-full bg-white border border-[#b2d5f0] rounded-2xl px-4 py-3.5 text-sm font-bold text-[#002b54] focus:border-[#0074b8] focus:bg-white outline-none transition-all appearance-none cursor-pointer shadow-xs"
                required
              >
                <option value="" disabled>Escolha o módulo relativo ao comprovante...</option>
                <option value="Módulo 1">Módulo 1 (M1)</option>
                <option value="Módulo 2">Módulo 2 (M2)</option>
                <option value="Módulo 3">Módulo 3 (M3)</option>
                <option value="Módulo 4">Módulo 4 (M4)</option>
              </select>
              <Calendar className="w-5 h-5 text-[#0074b8] absolute right-4 top-3.5 pointer-events-none" />
            </div>
          </div>

          {/* File Drag and Drop Box */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-black uppercase tracking-wider text-[#002b54]">
                Anexar Arquivos (Até 15 arquivos • Máx. 500 MB no total) <span className="text-rose-600">*</span>
              </label>
              <span className={`text-xs font-black px-2.5 py-0.5 rounded-md ${
                isCountExceeded ? 'bg-rose-100 text-rose-800 border border-rose-300' : 'bg-blue-100 text-[#003b70] border border-blue-200'
              }`}>
                {files.length} / 15 arquivos
              </span>
            </div>

            <div className={`relative border-2 border-dashed ${
              isCountExceeded || isSizeExceeded 
                ? 'border-rose-400 bg-rose-50/50' 
                : 'border-[#b2d5f0] hover:border-[#0074b8] bg-white hover:bg-white'
            } transition-all duration-300 rounded-3xl p-8 text-center cursor-pointer group shadow-2xs hover:shadow-md hover:-translate-y-0.5`}>
              <input
                type="file"
                multiple
                accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png,image/png,image/jpeg,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              <div className="flex flex-col items-center justify-center space-y-2 pointer-events-none">
                <div className="w-12 h-12 rounded-2xl bg-[#edf4fa] border border-[#b2d5f0] text-[#0074b8] flex items-center justify-center shadow-2xs group-hover:scale-105 group-hover:bg-[#0074b8] group-hover:text-white transition-all duration-300">
                  <Paperclip className="w-6 h-6" />
                </div>
                <span className="font-black text-sm text-[#002b54] group-hover:text-[#003b70] transition-colors">
                  Clique aqui ou arraste seus arquivos
                </span>
                <span className="text-xs text-slate-700 font-medium">
                  Formatos permitidos: <strong>PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, JPG, JPEG, PNG</strong>
                </span>
              </div>
            </div>

            {/* Selected Files List & Total Size Meter */}
            {files.length > 0 && (
              <div className="bg-white border border-[#b2d5f0] p-5 rounded-3xl space-y-4 shadow-2xs">
                
                {/* Accumulated Total Size Bar */}
                <div className="space-y-2 pb-3 border-b border-[#b2d5f0]/60">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                    <span className="font-black text-[#002b54] flex items-center gap-1.5">
                      <HardDrive className="w-4 h-4 text-[#0074b8]" />
                      <span>Tamanho Total Acumulado:</span>
                    </span>
                    <div className="flex items-center gap-2">
                      <span className={`font-mono font-black ${isSizeExceeded ? 'text-rose-700' : 'text-[#0074b8]'}`}>
                        {totalSizeMB} MB / 500 MB
                      </span>
                      <span className="text-[10px] text-slate-600 font-bold">({totalSizePct}%)</span>
                    </div>
                  </div>

                  <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden border border-slate-200">
                    <div 
                      className={`h-full transition-all duration-300 ${
                        isSizeExceeded ? 'bg-rose-600' : totalSizePct > 80 ? 'bg-amber-500' : 'bg-[#00a9e8]'
                      }`}
                      style={{ width: `${totalSizePct}%` }}
                    />
                  </div>

                  {/* Limit Validation Badges */}
                  {isCountExceeded && (
                    <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-bold flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 flex-shrink-0 text-rose-600" />
                      <span>Você pode enviar no máximo 15 arquivos por vez.</span>
                    </div>
                  )}

                  {isSizeExceeded && (
                    <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-bold flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 flex-shrink-0 text-rose-600" />
                      <span>O tamanho total dos arquivos excede o limite permitido de 500 MB por envio.</span>
                    </div>
                  )}
                </div>

                {/* Individual File List with Name and Size */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between text-xs font-black text-[#002b54]">
                    <span>Arquivos selecionados ({files.length}):</span>
                    <button
                      type="button"
                      onClick={() => setFiles([])}
                      className="text-[11px] text-rose-700 hover:underline font-bold cursor-pointer"
                    >
                      Remover todos
                    </button>
                  </div>

                  <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
                    {files.map((f, i) => {
                      const progressInfo = uploadProgressMap[f.name];
                      const isFileValid = isValidExtension(f.name);

                      return (
                        <div 
                          key={i} 
                          className="bg-[#edf4fa] border border-[#b2d5f0] p-3 rounded-2xl text-xs text-[#002b54] space-y-2"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2 truncate">
                              <FileText className="w-4 h-4 text-[#0074b8] flex-shrink-0" />
                              <span className="font-bold truncate">{f.name}</span>
                              <span className="text-[11px] text-slate-700 font-mono font-bold">
                                ({formatFileSize(f.size)})
                              </span>
                              {!isFileValid && (
                                <span className="text-[10px] bg-rose-100 text-rose-800 font-black px-2 py-0.5 rounded">
                                  Formato não permitido
                                </span>
                              )}
                            </div>

                            {!isSubmitting && (
                              <button
                                type="button"
                                onClick={() => removeFile(i)}
                                className="p-1 hover:bg-rose-100 text-slate-500 hover:text-rose-700 rounded-lg transition-colors cursor-pointer"
                                title="Remover este arquivo"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            )}
                          </div>

                          {/* Individual Progress Bar during Upload */}
                          {progressInfo && (
                            <div className="space-y-1 pt-1">
                              <div className="flex items-center justify-between text-[11px] font-bold">
                                <span className={
                                  progressInfo.status === 'completed' ? 'text-emerald-700' :
                                  progressInfo.status === 'error' ? 'text-rose-700' : 'text-[#0074b8]'
                                }>
                                  {progressInfo.status === 'completed' ? 'Enviado com sucesso (100%)' :
                                   progressInfo.status === 'error' ? `Falha: ${progressInfo.error || 'Erro'}` :
                                   `Enviando... ${progressInfo.progress}%`}
                                </span>
                                <span>{progressInfo.progress}%</span>
                              </div>

                              <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                                <div 
                                  className={`h-full transition-all duration-300 ${
                                    progressInfo.status === 'completed' ? 'bg-emerald-500' :
                                    progressInfo.status === 'error' ? 'bg-rose-500' : 'bg-[#00a9e8]'
                                  }`}
                                  style={{ width: `${progressInfo.progress}%` }}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>
            )}
          </div>

          {/* Observações */}
          <div className="space-y-2">
            <label htmlFor="observacoes-input" className="block text-xs font-black uppercase tracking-wider text-[#002b54]">
              Observações Adicionais (Opcional)
            </label>
            <textarea
              id="observacoes-input"
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              placeholder="Adicione detalhes relevantes para os auditores de mídia..."
              rows={3}
              className="w-full bg-white border border-[#b2d5f0] rounded-2xl px-4 py-3.5 text-sm font-bold text-[#002b54] focus:border-[#0074b8] focus:bg-white outline-none transition-all resize-y shadow-xs"
            />
          </div>

          {/* Upload Requirements Notice */}
          <div className="p-3.5 bg-[#edf4fa] border border-[#b2d5f0] rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-[#003b70] font-bold shadow-2xs">
            <div className="flex items-center gap-2.5">
              <Info className="w-4 h-4 text-[#0074b8] flex-shrink-0" />
              <span>Envie até 15 arquivos por vez. Limite total do envio: 500 MB.</span>
            </div>
            <div className="text-[11px] font-mono text-slate-700 flex items-center gap-2">
              <span className={files.length > 15 ? 'text-rose-700 font-black' : 'font-bold'}>
                {files.length}/15 arquivos
              </span>
              <span>•</span>
              <span className={totalSizeBytes > MAX_TOTAL_SIZE_BYTES ? 'text-rose-700 font-black' : 'font-bold'}>
                {totalSizeMB}/500 MB
              </span>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isFormBlocked}
            className="w-full py-4 bg-[#003b70] hover:bg-[#0074b8] text-white font-extrabold text-base rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 active:scale-[0.99] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Enviando para o Firebase Storage...</span>
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                <span>Enviar para Auditoria da Mídia</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* History of Recent Submissions (Protocol & Metadata in Current Session) */}
      {submissoesAnteriores.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-black text-[#002b54] flex items-center gap-2">
              <Clock className="w-5 h-5 text-[#0074b8]" />
              <span>Histórico de Envios Recentes</span>
            </h3>
            <span className="text-xs text-slate-700 font-extrabold bg-[#edf4fa] border border-[#b2d5f0] px-3.5 py-1.5 rounded-full shadow-2xs">
              {submissoesAnteriores.length} registro(s) nesta sessão
            </span>
          </div>

          <div className="space-y-3">
            {submissoesAnteriores.map((s) => (
              <div 
                key={s.id} 
                className="bg-[#edf4fa] hover:bg-white border border-[#b2d5f0] hover:border-[#0074b8] p-5 sm:p-6 rounded-3xl shadow-xs hover:shadow-lg transition-all duration-300 space-y-3 group"
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-[#b2d5f0]/70 pb-3">
                  <div className="flex items-center gap-2">
                    <strong className="text-[#0074b8] font-mono font-black text-sm sm:text-base">{s.protocolo}</strong>
                    <span className="text-xs bg-white text-[#002b54] font-black px-3 py-1 rounded-xl border border-[#b2d5f0] shadow-2xs">
                      {s.polo}
                    </span>
                  </div>
                  <span className="text-xs font-black text-amber-800 bg-amber-100 border border-amber-300 px-3 py-1 rounded-full">
                    {s.status}
                  </span>
                </div>

                <div className="grid sm:grid-cols-3 gap-2 text-xs text-slate-700 font-medium pt-1">
                  <div><strong>Categoria:</strong> {s.categoria}</div>
                  <div><strong>Módulo:</strong> {s.modulo}</div>
                  <div><strong>Data:</strong> {s.dataEnvio}</div>
                </div>

                {s.arquivosNomes.length > 0 && (
                  <div className="pt-2 border-t border-[#b2d5f0]/50 text-xs text-[#002b54]">
                    <span className="font-bold block mb-1">Arquivos enviados ({s.arquivosCount}):</span>
                    <ul className="list-disc list-inside space-y-0.5 font-mono text-[11px] text-slate-700">
                      {s.arquivosNomes.map((nome, idx) => (
                        <li key={idx} className="truncate">{nome}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
