import React, { useState, useId } from 'react';
import { UnimarSymbolIcon } from '../UnimarSymbolIcon';
import { 
  Upload, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  FileText, 
  Search, 
  ShieldCheck, 
  RefreshCw, 
  Trash2,
  FileCheck,
  Info
} from 'lucide-react';
import { POLOS_CNPJ_DATA, PoloCnpjItem, cleanCnpjDigits, findPoloByCnpj } from '../../data/polosCnpjData';
import { UnimarzinhoLoadingAnimation } from './ChavesLoadingAnimation';

interface AuditResultData {
  cnpjTomador: string;
  razaoSocialTomador: string;
  cnpjPrestador: string;
  razaoSocialPrestador: string;
  numeroNota: string;
  dataEmissao: string;
  valorTotal: number;
  descricaoServico: string;
  categoriaMidia: string;
  reembolsavel: boolean;
  isCpf?: boolean;
  observacoesIa: string;
}

type ValidationStatus = 'MATCH' | 'DIVERGENT' | 'MISSING_CNPJ' | 'WARNING_CPF' | 'UNREADABLE';

export const isCnpjMissing = (cnpj: string | undefined | null): boolean => {
  if (!cnpj) return true;
  const normalized = cnpj.trim().toLowerCase();
  if (
    normalized === '' ||
    normalized === 'não informado' ||
    normalized === 'nao informado' ||
    normalized === 'não localizado' ||
    normalized === 'nao localizado' ||
    normalized === 'não identificado' ||
    normalized === 'nao identificado' ||
    normalized === 'não encontrado' ||
    normalized === 'nao encontrado' ||
    normalized === 'n/i' ||
    normalized === 'n/a' ||
    normalized === 'null' ||
    normalized === 'undefined'
  ) {
    return true;
  }
  return cleanCnpjDigits(cnpj).length === 0;
};

export const AdminIaAuditoriaTab: React.FC = () => {
  const poloSelectId = useId();
  const searchPoloId = useId();
  const fileInputId = useId();

  const [selectedPolo, setSelectedPolo] = useState<PoloCnpjItem>(POLOS_CNPJ_DATA[22]); // Marília como padrão
  const [searchTerm, setSearchTerm] = useState<string>('');
  
  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [fileMime, setFileMime] = useState<string>('image/png');

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [auditResult, setAuditResult] = useState<AuditResultData | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Filtra lista de polos
  const filteredPolos = POLOS_CNPJ_DATA.filter(p => 
    p.polo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.cnpj.includes(searchTerm)
  );

  // Manipulador de upload de arquivo real
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setFileName(selectedFile.name);
    setFileMime(selectedFile.type || 'image/png');
    setErrorMsg(null);
    setAuditResult(null);

    const reader = new FileReader();
    reader.onload = () => {
      setFilePreview(reader.result as string);
    };
    reader.readAsDataURL(selectedFile);
  };

  // Botão para remover a imagem/arquivo caso tenha sido fixado errado
  const handleRemoveFile = () => {
    setFile(null);
    setFilePreview(null);
    setFileName('');
    setFileMime('image/png');
    setAuditResult(null);
    setErrorMsg(null);
    // Reset input
    const inputEl = document.getElementById(fileInputId) as HTMLInputElement;
    if (inputEl) inputEl.value = '';
  };

  // Dispara a validação do documento
  const handleValidateDocument = async () => {
    if (!filePreview && !file) {
      setErrorMsg("Por favor, selecione ou envie um arquivo (Nota Fiscal ou Comprovante) para validação.");
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    try {
      const response = await fetch('/api/auditoria-ia', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          arquivoBase64: filePreview,
          mimeType: fileMime,
          poloSelecionado: selectedPolo.polo,
          cnpjPoloOficial: selectedPolo.cnpj,
        })
      });

      if (!response.ok) {
        throw new Error(`Erro no servidor HTTP ${response.status}`);
      }

      const resData = await response.json();
      if (resData.success && resData.data) {
        setAuditResult(resData.data);
      } else {
        throw new Error(resData.error || "Falha na resposta do servidor.");
      }
    } catch (err: any) {
      console.error("Erro na validação do documento:", err);
      setErrorMsg("Não foi possível processar a validação do documento no momento.");
    } finally {
      setIsLoading(false);
    }
  };

  // Avaliação do status
  const evaluateStatus = (result: AuditResultData, polo: PoloCnpjItem): ValidationStatus => {
    if (isCnpjMissing(result.cnpjTomador) || isCnpjMissing(polo.cnpj)) {
      return 'MISSING_CNPJ';
    }

    if (result.isCpf || cleanCnpjDigits(result.cnpjTomador).length === 11) {
      return 'WARNING_CPF';
    }

    const cleanExtracted = cleanCnpjDigits(result.cnpjTomador);
    const cleanOfficial = cleanCnpjDigits(polo.cnpj);

    if (!cleanExtracted) return 'MISSING_CNPJ';

    if (cleanExtracted === cleanOfficial) {
      return 'MATCH';
    } else {
      return 'DIVERGENT';
    }
  };

  const currentStatus: ValidationStatus | null = auditResult ? evaluateStatus(auditResult, selectedPolo) : null;
  const foundOtherPolo = auditResult ? findPoloByCnpj(auditResult.cnpjTomador) : undefined;

  return (
    <div className="space-y-6">
      
      {/* Header Institucional Corporativo */}
      <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-2xs">
        <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-[#003366]" />
          <span>IA de Validação de Documentos Fiscais</span>
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Módulo inteligente corporativo alimentado pela IA Unimar para conferência automática de notas fiscais, boletos e comprovantes dos polos Unimar EAD.
        </p>
      </div>

      {/* Grid Principal (2 Colunas) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Coluna 1: Entrada de Dados (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          
          {/* Box de Seleção do Polo */}
          <div className="bg-white rounded-lg border border-slate-200 shadow-2xs p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-150 pb-3">
              <label htmlFor={poloSelectId} className="flex items-center gap-2 font-bold text-slate-800 text-xs uppercase tracking-wider">
                <UnimarSymbolIcon className="w-4 h-4 text-[#0055A5] shrink-0" />
                <span>1. Seleção do Polo</span>
              </label>
            </div>

            {/* Campo de Busca Rápida de Polo */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                id={searchPoloId}
                type="text"
                placeholder="Buscar polo ou CNPJ..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded focus:outline-none focus:border-[#0055A5] focus:ring-1 focus:ring-[#0055A5]"
              />
            </div>

            {/* Selector de Polos */}
            <div>
              <select
                id={poloSelectId}
                value={selectedPolo.polo}
                onChange={(e) => {
                  const found = POLOS_CNPJ_DATA.find(p => p.polo === e.target.value);
                  if (found) setSelectedPolo(found);
                }}
                className="w-full p-2.5 text-xs font-bold text-slate-800 bg-white border border-slate-300 rounded focus:outline-none focus:border-[#0055A5] cursor-pointer"
              >
                {filteredPolos.map((item) => (
                  <option key={item.polo} value={item.polo}>
                    {item.polo}
                  </option>
                ))}
              </select>
            </div>

            {/* Texto discreto com CNPJ do Polo */}
            <div className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded border border-slate-200 flex items-center justify-between">
              <span className="text-slate-500 font-medium">CNPJ Cadastrado:</span>
              <span className="font-mono font-bold text-slate-800">{selectedPolo.cnpj}</span>
            </div>
          </div>

          {/* Box de Upload do Documento */}
          <div className="bg-white rounded-lg border border-slate-200 shadow-2xs p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-150 pb-3">
              <label htmlFor={fileInputId} className="flex items-center gap-2 font-bold text-slate-800 text-xs uppercase tracking-wider">
                <FileText className="w-4 h-4 text-[#0055A5]" />
                <span>2. Upload do Comprovante</span>
              </label>
              <span className="text-[11px] text-slate-400">PDF, PNG ou JPG</span>
            </div>

            {/* Dropzone */}
            <div className="relative border border-dashed border-slate-300 hover:border-[#0055A5] bg-slate-50/70 rounded-lg p-5 text-center transition-all">
              <input
                id={fileInputId}
                type="file"
                accept="image/*,application/pdf"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />

              {filePreview ? (
                <div className="space-y-3 relative z-20">
                  <div className="relative max-h-40 mx-auto overflow-hidden rounded border border-slate-200 bg-white p-2 flex items-center justify-center">
                    {fileMime.includes('pdf') ? (
                      <div className="p-4 text-center">
                        <FileText className="w-10 h-10 text-[#0055A5] mx-auto mb-1" />
                        <span className="font-bold text-xs text-slate-700 block truncate max-w-xs">{fileName}</span>
                      </div>
                    ) : (
                      <img src={filePreview} alt="Comprovante" className="max-h-36 object-contain" />
                    )}
                  </div>

                  <div className="flex items-center justify-center bg-slate-100 p-2 rounded text-xs">
                    <span className="font-bold text-slate-700 truncate">{fileName}</span>
                  </div>
                </div>
              ) : (
                <div className="space-y-2 py-3">
                  <Upload className="w-8 h-8 text-slate-400 mx-auto" />
                  <div className="text-xs font-bold text-slate-700">
                    Clique ou arraste a Nota Fiscal / Comprovante
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Suporta arquivos digitalizados de NFe, NFSe e boletos
                  </p>
                </div>
              )}
            </div>

            {/* Botão de remoção explícito se houver arquivo */}
            {filePreview && (
              <div className="text-right">
                <button
                  type="button"
                  onClick={handleRemoveFile}
                  className="text-xs text-rose-600 hover:text-rose-800 font-bold flex items-center gap-1 ml-auto cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Remover ou trocar arquivo</span>
                </button>
              </div>
            )}

            {/* Botão Principal Validar Documento */}
            <button
              onClick={handleValidateDocument}
              disabled={isLoading || (!filePreview && !file)}
              className={`w-full py-2.5 px-4 rounded font-bold text-xs uppercase tracking-wider text-white flex items-center justify-center gap-2 transition-all cursor-pointer ${
                isLoading || (!filePreview && !file)
                  ? 'bg-slate-300 cursor-not-allowed'
                  : 'bg-[#003366] hover:bg-[#002244] shadow-2xs active:scale-98'
              }`}
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-slate-200" />
                  <span>Validando documento...</span>
                </>
              ) : (
                <>
                  <FileCheck className="w-4 h-4" />
                  <span>Validar Documento</span>
                </>
              )}
            </button>

            {errorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded text-xs font-medium flex items-start gap-2">
                <Info className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}
          </div>

        </div>

        {/* Coluna 2: Resultado da Validação (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          
          {isLoading ? (
            <UnimarzinhoLoadingAnimation />
          ) : auditResult && currentStatus ? (
            <div className="bg-white rounded-lg border border-slate-200 shadow-2xs p-5 space-y-5">
              
              {/* Banner/Alerta Informativo Institucional */}
              {currentStatus === 'MATCH' && (
                <div className="p-4 bg-emerald-50 border-l-4 border-emerald-600 text-emerald-950 rounded-r space-y-1">
                  <div className="font-bold text-sm text-emerald-900 flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    <span>CNPJ VÁLIDO</span>
                  </div>
                  <p className="text-xs text-emerald-800 leading-relaxed">
                    O CNPJ do Tomador encontrado na nota (<strong>{auditResult.cnpjTomador}</strong>) confere perfeitamente com o CNPJ do Polo Selecionado (<strong>{selectedPolo.cnpj}</strong> - {selectedPolo.polo}).
                  </p>
                </div>
              )}

              {(currentStatus === 'MISSING_CNPJ' || currentStatus === 'UNREADABLE') && (
                <div className="p-4 bg-red-50 border-l-4 border-red-600 text-red-950 rounded-r space-y-1 border border-red-200">
                  <div className="font-bold text-sm text-red-900 flex items-center gap-2">
                    <XCircle className="w-5 h-5 text-red-600 shrink-0" />
                    <span>DIVERGÊNCIA DE CNPJ — CNPJ NÃO LOCALIZADO</span>
                  </div>
                  <p className="text-xs text-red-800 leading-relaxed">
                    Atenção: Nenhum CNPJ do Tomador foi localizado ou identificado no documento. As regras institucionais exigem Nota Fiscal/comprovante emitido com a identificação do CNPJ do Polo. Documento marcado com pendência de validação.
                  </p>
                </div>
              )}

              {currentStatus === 'DIVERGENT' && (
                <div className="p-4 bg-red-50 border-l-4 border-red-600 text-red-950 rounded-r space-y-1 border border-red-200">
                  <div className="font-bold text-sm text-red-900 flex items-center gap-2">
                    <XCircle className="w-5 h-5 text-red-600 shrink-0" />
                    <span>DIVERGÊNCIA DE CNPJ</span>
                  </div>
                  <p className="text-xs text-red-800 leading-relaxed">
                    Atenção: O CNPJ do Tomador encontrado na nota (<strong>{auditResult.cnpjTomador}</strong>) não confere com o CNPJ do Polo Selecionado (<strong>{selectedPolo.cnpj}</strong>).
                  </p>
                  {foundOtherPolo && (
                    <p className="text-xs text-red-900 font-semibold mt-1">
                      Nota: Este CNPJ pertence ao <strong>{foundOtherPolo.polo}</strong>.
                    </p>
                  )}
                </div>
              )}

              {currentStatus === 'WARNING_CPF' && (
                <div className="p-4 bg-amber-50 border-l-4 border-amber-600 text-amber-950 rounded-r space-y-1">
                  <div className="font-bold text-sm text-amber-900 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                    <span>DOCUMENTO EM CPF (PESSOA FÍSICA)</span>
                  </div>
                  <p className="text-xs text-amber-800 leading-relaxed">
                    Atenção: O documento foi emitido para o CPF (Pessoa Física) <strong>{auditResult.cnpjTomador}</strong>. As regras institucionais exigem Nota Fiscal emitida em CNPJ de Polo.
                  </p>
                </div>
              )}

              {/* Tabela/Lista Limpa Corporativa de Dados Extraídos */}
              <div className="space-y-3">
                <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2 border-b border-slate-150 pb-2">
                  <FileText className="w-4 h-4 text-[#003366]" />
                  <span>Dados Extraídos do Comprovante</span>
                </h2>

                <div className="border border-slate-200 rounded overflow-hidden">
                  <table className="w-full text-xs text-left text-slate-700">
                    <tbody className="divide-y divide-slate-200 bg-white">
                      <tr className="hover:bg-slate-50">
                        <td className="px-4 py-2.5 font-bold text-slate-500 bg-slate-50/80 w-1/3">
                          CNPJ do Tomador (Lido)
                        </td>
                        <td className="px-4 py-2.5">
                          {isCnpjMissing(auditResult.cnpjTomador) ? (
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded border border-red-200 bg-red-50 text-red-600 font-sans font-bold text-xs shadow-2xs">
                              <AlertTriangle className="w-3.5 h-3.5 text-red-600 shrink-0" />
                              <span>Nenhum CNPJ localizado no documento</span>
                            </div>
                          ) : currentStatus === 'DIVERGENT' ? (
                            <div className="space-y-1">
                              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded border border-red-200 bg-red-50 text-red-600 font-sans font-bold text-xs shadow-2xs">
                                <XCircle className="w-3.5 h-3.5 text-red-600 shrink-0" />
                                <span className="font-mono">{auditResult.cnpjTomador}</span>
                                <span className="font-sans font-medium text-[11px]">(Divergente)</span>
                              </div>
                              {auditResult.razaoSocialTomador && (
                                <span className="block font-sans font-normal text-[11px] text-slate-500 pl-1">
                                  {auditResult.razaoSocialTomador}
                                </span>
                              )}
                            </div>
                          ) : (
                            <div>
                              <span className="font-mono font-bold text-slate-900">
                                {auditResult.cnpjTomador}
                              </span>
                              {auditResult.razaoSocialTomador && (
                                <span className="block font-sans font-normal text-[11px] text-slate-500">
                                  {auditResult.razaoSocialTomador}
                                </span>
                              )}
                            </div>
                          )}
                        </td>
                      </tr>

                      <tr className="hover:bg-slate-50">
                        <td className="px-4 py-2.5 font-bold text-slate-500 bg-slate-50/80">
                          CNPJ do Polo (Cadastrado)
                        </td>
                        <td className="px-4 py-2.5">
                          {isCnpjMissing(selectedPolo.cnpj) ? (
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded border border-red-200 bg-red-50 text-red-600 font-sans font-bold text-xs shadow-2xs">
                              <AlertTriangle className="w-3.5 h-3.5 text-red-600 shrink-0" />
                              <span>Não informado</span>
                            </div>
                          ) : (
                            <div>
                              <span className="font-mono font-bold text-[#003366]">
                                {selectedPolo.cnpj}
                              </span>
                              <span className="block font-sans font-normal text-[11px] text-slate-500">
                                {selectedPolo.polo}
                              </span>
                            </div>
                          )}
                        </td>
                      </tr>

                      <tr className="hover:bg-slate-50">
                        <td className="px-4 py-2.5 font-bold text-slate-500 bg-slate-50/80">
                          CNPJ Prestador / Emissor
                        </td>
                        <td className="px-4 py-2.5 font-mono text-slate-800">
                          {isCnpjMissing(auditResult.cnpjPrestador) ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded border border-slate-200 bg-slate-50 text-slate-500 text-xs font-medium italic">
                              Não informado
                            </span>
                          ) : (
                            <div>
                              <span>{auditResult.cnpjPrestador}</span>
                              {auditResult.razaoSocialPrestador && (
                                <span className="block font-sans font-normal text-[11px] text-slate-500">
                                  {auditResult.razaoSocialPrestador}
                                </span>
                              )}
                            </div>
                          )}
                        </td>
                      </tr>

                      <tr className="hover:bg-slate-50">
                        <td className="px-4 py-2.5 font-bold text-slate-500 bg-slate-50/80">
                          Número do Comprovante
                        </td>
                        <td className="px-4 py-2.5 font-bold text-slate-800">
                          {auditResult.numeroNota || 'S/N'}
                        </td>
                      </tr>

                      <tr className="hover:bg-slate-50">
                        <td className="px-4 py-2.5 font-bold text-slate-500 bg-slate-50/80">
                          Data de Emissão
                        </td>
                        <td className="px-4 py-2.5 text-slate-800">
                          {auditResult.dataEmissao || 'N/I'}
                        </td>
                      </tr>

                      <tr className="hover:bg-slate-50">
                        <td className="px-4 py-2.5 font-bold text-slate-500 bg-slate-50/80">
                          Valor Total
                        </td>
                        <td className="px-4 py-2.5 font-bold text-[#003366] text-sm">
                          R$ {auditResult.valorTotal ? auditResult.valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : '0,00'}
                        </td>
                      </tr>

                      {auditResult.categoriaMidia && (
                        <tr className="hover:bg-slate-50">
                          <td className="px-4 py-2.5 font-bold text-slate-500 bg-slate-50/80">
                            Categoria da Mídia
                          </td>
                          <td className="px-4 py-2.5 text-slate-700">
                            {auditResult.categoriaMidia}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          ) : (
            <div className="bg-white rounded-lg border border-slate-200 shadow-2xs p-10 text-center space-y-3">
              <FileCheck className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="font-bold text-slate-800 text-sm">Painel de Resultado da Validação</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                Selecione o Polo, envie o documento fiscal e clique em <strong>"Validar Documento"</strong> para realizar a conferência dos dados.
              </p>
            </div>
          )}

        </div>

      </div>

    </div>
  );
};
