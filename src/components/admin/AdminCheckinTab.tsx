import React, { useState, useMemo } from 'react';
import { MetaPolo, SubmissaoComprovante, StatusAuditoria } from '../../types';
import { UnimarSymbolIcon } from '../UnimarSymbolIcon';
import { 
  ClipboardCheck, 
  Search, 
  Filter, 
  Building2, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  FileText, 
  Paperclip, 
  ChevronRight, 
  Eye, 
  DollarSign, 
  Target, 
  X,
  AlertCircle,
  SlidersHorizontal,
  Check,
  Calendar,
  Save
} from 'lucide-react';

interface AdminCheckinTabProps {
  metas: MetaPolo[];
  submissoes: SubmissaoComprovante[];
  onUpdateSubmissaoStatus: (id: string, newStatus: StatusAuditoria, obsInterna?: string) => void;
  onShowToast?: (msg: string) => void;
}

export type StatusCheckinFiltro = 'todos' | 'aprovado' | 'pendente' | 'nao_enviado';

// Geração dinâmica de anos (ano atual + 4 anos subsequentes)
const currentYear = new Date().getFullYear();
const YEAR_OPTIONS = Array.from({ length: 5 }, (_, i) => currentYear + i);
const MODULE_NUMBERS = [1, 2, 3, 4];

export const AdminCheckinTab: React.FC<AdminCheckinTabProps> = ({
  metas,
  submissoes,
  onUpdateSubmissaoStatus,
  onShowToast
}) => {
  const [selectedAno, setSelectedAno] = useState<number>(currentYear);
  const [selectedModuloNum, setSelectedModuloNum] = useState<number>(1);
  const [poloSearch, setPoloSearch] = useState<string>('');
  const [statusFiltro, setStatusFiltro] = useState<StatusCheckinFiltro>('todos');

  // String dinâmica do módulo selecionado (ex: "Módulo 01/2026")
  const selectedModulo = `Módulo 0${selectedModuloNum}/${selectedAno}`;
  const selectedModuloShort = `${selectedAno}/M${selectedModuloNum}`;
  
  // Modal de Detalhes / Validação do Polo
  const [selectedPoloDetail, setSelectedPoloDetail] = useState<{
    poloName: string;
    metaPolo?: MetaPolo;
  } | null>(null);

  // Normalização de string do módulo para comparação flexível (ex: "Módulo 01/2026" com "Módulo 1")
  const isSameModulo = (subModulo: string | undefined, selectedMod: string) => {
    if (!subModulo) return true; // Se não especificado, relaciona ao módulo padrão
    const subClean = subModulo.toLowerCase().replace(/\s+/g, '');
    const selClean = selectedMod.toLowerCase().replace(/\s+/g, '');
    if (subClean === selClean) return true;
    if (selClean.includes('01') && (subClean.includes('modulo1') || subClean === 'módulo1')) return true;
    if (selClean.includes('02') && (subClean.includes('modulo2') || subClean === 'módulo2')) return true;
    if (selClean.includes('03') && (subClean.includes('modulo3') || subClean === 'módulo3')) return true;
    if (selClean.includes('04') && (subClean.includes('modulo4') || subClean === 'módulo4')) return true;
    return subClean.includes(selClean) || selClean.includes(subClean);
  };

  // Mapeamento dos polos com suas métricas para o módulo selecionado
  const polosCheckinData = useMemo(() => {
    return metas.map((m) => {
      const poloNameLower = m.polo.trim().toLowerCase();

      // Submissões deste polo para o módulo selecionado
      const poloSubmissoes = submissoes.filter((s) => {
        const matchesPolo = s.polo.trim().toLowerCase() === poloNameLower;
        const matchesModulo = isSameModulo(s.modulo, selectedModulo);
        return matchesPolo && matchesModulo;
      });

      // Cálculo de comprovantes / NFs
      const totalArquivos = poloSubmissoes.reduce((acc, s) => acc + (s.arquivosCount || 1), 0);
      const totalSubmissoes = poloSubmissoes.length;

      // Soma de valor total aprovado
      const valorAprovado = poloSubmissoes
        .filter((s) => s.status === 'Aprovado / Feito')
        .reduce((acc, s) => acc + (s.valorTotal || 0), 0);

      // Soma de valor total enviado (todas as submissões)
      const valorEnviado = poloSubmissoes.reduce((acc, s) => acc + (s.valorTotal || 0), 0);

      // Determinar Status do Check-in:
      // 'aprovado' (🟢 OK / APROVADO): Se tem ao menos 1 submissão e todas aprovadas ou tem aprovada
      // 'pendente' (🟡 EM ANÁLISE): Se tem submissões mas alguma pendente / em análise ou com pendência
      // 'nao_enviado' (🔴 PENDENTE / NÃO ENVIADO): Se 0 submissões
      let statusCheckin: 'aprovado' | 'pendente' | 'nao_enviado' = 'nao_enviado';
      let statusLabel = 'NÃO ENVIADO';

      if (totalSubmissoes > 0) {
        const temAprovada = poloSubmissoes.some((s) => s.status === 'Aprovado / Feito');
        const temPendente = poloSubmissoes.some(
          (s) => s.status === 'Aguardando / Em Análise' || s.status === 'Errado / Com Pendência'
        );

        if (temPendente) {
          statusCheckin = 'pendente';
          statusLabel = 'EM ANÁLISE';
        } else if (temAprovada) {
          statusCheckin = 'aprovado';
          statusLabel = 'OK / APROVADO';
        } else {
          statusCheckin = 'pendente';
          statusLabel = 'EM ANÁLISE';
        }
      }

      return {
        id: m.id,
        polo: m.polo,
        metaPolo: m,
        metaModulo: m.metaModulo,
        realizado: m.realizado,
        submissoes: poloSubmissoes,
        totalSubmissoes,
        totalArquivos,
        valorAprovado,
        valorEnviado,
        statusCheckin,
        statusLabel,
      };
    });
  }, [metas, submissoes, selectedModulo]);

  // Resumo Operacional do Módulo
  const resumoOperacional = useMemo(() => {
    const totalMapeados = polosCheckinData.length;
    const totalAprovados = polosCheckinData.filter((p) => p.statusCheckin === 'aprovado').length;
    const totalPendentes = polosCheckinData.filter((p) => p.statusCheckin === 'pendente').length;
    const totalNaoEnviados = polosCheckinData.filter((p) => p.statusCheckin === 'nao_enviado').length;

    // Verba Total Liberada no Módulo (Soma dos valores aprovados das submissões do módulo)
    const verbaLiberada = polosCheckinData.reduce((acc, p) => acc + p.valorAprovado, 0);

    return {
      totalMapeados,
      totalAprovados,
      totalPendentes,
      totalNaoEnviados,
      verbaLiberada,
    };
  }, [polosCheckinData]);

  const pctAprovados = Math.round((resumoOperacional.totalAprovados / (resumoOperacional.totalMapeados || 1)) * 100);

  // Filtro por Busca de Polo e Filtro de Status
  const filteredPolos = useMemo(() => {
    return polosCheckinData.filter((p) => {
      // Filtro de texto por nome do polo
      const matchesSearch = p.polo.toLowerCase().includes(poloSearch.toLowerCase().trim());
      
      // Filtro de botão de status
      let matchesStatus = true;
      if (statusFiltro === 'aprovado') matchesStatus = p.statusCheckin === 'aprovado';
      if (statusFiltro === 'pendente') matchesStatus = p.statusCheckin === 'pendente' || p.statusCheckin === 'nao_enviado';
      if (statusFiltro === 'nao_enviado') matchesStatus = p.statusCheckin === 'nao_enviado';

      return matchesSearch && matchesStatus;
    });
  }, [polosCheckinData, poloSearch, statusFiltro]);

  // Submissões do Polo selecionado no Modal de Detalhes
  const selectedPoloSubmissoes = useMemo(() => {
    if (!selectedPoloDetail) return [];
    const poloNameLower = selectedPoloDetail.poloName.trim().toLowerCase();
    return submissoes.filter(
      (s) => s.polo.trim().toLowerCase() === poloNameLower && isSameModulo(s.modulo, selectedModulo)
    );
  }, [selectedPoloDetail, submissoes, selectedModulo]);

  return (
    <div className="space-y-5 animate-fade-in pb-8">
      
      {/* 1. SELETOR DINÂMICO DE ANO/MÓDULO E CONTROLES */}
      <div className="bg-white border border-slate-200 rounded-md p-4 sm:p-5 shadow-2xs">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-md bg-[#003366] text-white flex items-center justify-center shrink-0 border border-[#002244]">
              <ClipboardCheck className="w-5 h-5 text-sky-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold text-[#003366] uppercase tracking-wider">
                  Check-in Geral por Módulo
                </h2>
                <span className="text-[10px] font-bold uppercase bg-sky-100 text-[#0055A5] px-2 py-0.5 rounded border border-sky-200 font-mono">
                  {selectedModuloShort}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-normal mt-0.5">
                Acompanhe o status das entregas de comprovantes, notas fiscais e teto orçamentário polo a polo por módulo.
              </p>
            </div>
          </div>

          {/* Filtros Dinâmicos de Ano e Módulo */}
          <div className="w-full lg:w-auto flex flex-wrap items-center gap-2 bg-slate-50 border border-slate-300 p-2 rounded-md shadow-2xs">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-[#0055A5]" />
              <label className="text-xs font-bold text-[#003366] uppercase tracking-wider">Ano:</label>
              <select
                value={selectedAno}
                onChange={(e) => setSelectedAno(Number(e.target.value))}
                className="bg-white border border-slate-300 rounded text-xs font-bold text-[#003366] px-2.5 py-1.5 outline-none focus:border-[#0055A5] focus:ring-1 focus:ring-[#0055A5] cursor-pointer shadow-2xs"
              >
                {YEAR_OPTIONS.map((ano) => (
                  <option key={ano} value={ano}>
                    {ano}
                  </option>
                ))}
              </select>
            </div>

            <div className="h-4 w-[1px] bg-slate-300 mx-1 hidden sm:block" />

            <div className="flex items-center gap-1.5">
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#0055A5]" />
              <label className="text-xs font-bold text-[#003366] uppercase tracking-wider">Módulo:</label>
              <select
                value={selectedModuloNum}
                onChange={(e) => setSelectedModuloNum(Number(e.target.value))}
                className="bg-white border border-slate-300 rounded text-xs font-bold text-[#003366] px-2.5 py-1.5 outline-none focus:border-[#0055A5] focus:ring-1 focus:ring-[#0055A5] cursor-pointer shadow-2xs"
              >
                {MODULE_NUMBERS.map((num) => (
                  <option key={num} value={num}>
                    Módulo 0{num}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* 2. CARDS DE RESUMO OPERACIONAL (FILTROS INTERATIVOS CLICÁVEIS E PROGRESS BAR) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        
        {/* Card 1: Total Polos Mapeados */}
        <button
          type="button"
          onClick={() => setStatusFiltro('todos')}
          className={`text-left border border-l-4 border-l-[#003366] rounded-md p-3.5 shadow-2xs flex flex-col justify-between transition-all cursor-pointer ${
            statusFiltro === 'todos'
              ? 'bg-sky-50/90 border-[#003366] ring-2 ring-[#003366]/20'
              : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/60'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase text-slate-500 tracking-wider">
              Polos Mapeados
            </span>
            <UnimarSymbolIcon className="w-4 h-4 text-slate-400 shrink-0" />
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <div className="text-xl font-bold text-slate-900 font-mono">
              {resumoOperacional.totalMapeados}
            </div>
            <span className={`text-[11px] font-semibold px-2 py-0.5 rounded ${
              statusFiltro === 'todos' ? 'bg-[#003366] text-white' : 'text-slate-500 bg-slate-100'
            }`}>
              Todos ({selectedModuloShort})
            </span>
          </div>
        </button>

        {/* Card 2: Polos OK / Aprovados com Mini Progresso */}
        <button
          type="button"
          onClick={() => setStatusFiltro('aprovado')}
          className={`text-left border border-l-4 border-l-[#00A86B] rounded-md p-3.5 shadow-2xs flex flex-col justify-between transition-all cursor-pointer ${
            statusFiltro === 'aprovado'
              ? 'bg-emerald-50/90 border-emerald-600 ring-2 ring-emerald-500/20'
              : 'bg-white border-slate-200 hover:border-emerald-200 hover:bg-emerald-50/30'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase text-emerald-800 tracking-wider">
              Polos OK / Aprovados
            </span>
            <CheckCircle2 className="w-4 h-4 text-[#00A86B]" />
          </div>
          <div className="mt-2 space-y-1.5 pb-1">
            <div className="flex items-baseline justify-between">
              <div className="text-xl font-bold text-[#00A86B] font-mono">
                {resumoOperacional.totalAprovados}
              </div>
              <span className={`text-[11px] font-semibold px-2 py-0.5 rounded ${
                statusFiltro === 'aprovado' ? 'bg-[#00A86B] text-white' : 'text-emerald-700 bg-emerald-50'
              }`}>
                {pctAprovados}% concl.
              </span>
            </div>
            {/* Barra de Progresso Visual */}
            <div className="w-full bg-emerald-100 rounded-full h-1.5 overflow-hidden mb-2">
              <div 
                className="bg-[#00A86B] h-1.5 rounded-full transition-all duration-500" 
                style={{ width: `${pctAprovados}%` }}
              />
            </div>
          </div>
        </button>

        {/* Card 3: Pendentes */}
        <button
          type="button"
          onClick={() => setStatusFiltro('pendente')}
          className={`text-left border border-l-4 border-l-[#D97706] rounded-md p-3.5 shadow-2xs flex flex-col justify-between transition-all cursor-pointer ${
            statusFiltro === 'pendente'
              ? 'bg-amber-50/90 border-amber-500 ring-2 ring-amber-500/20'
              : 'bg-white border-slate-200 hover:border-amber-200 hover:bg-amber-50/30'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase text-amber-800 tracking-wider">
              Pendentes
            </span>
            <Clock className="w-4 h-4 text-[#D97706]" />
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <div className="text-xl font-bold text-[#D97706] font-mono">
              {resumoOperacional.totalPendentes + resumoOperacional.totalNaoEnviados}
            </div>
            <span className={`text-[11px] font-semibold px-2 py-0.5 rounded ${
              statusFiltro === 'pendente' ? 'bg-[#D97706] text-white' : 'text-amber-700 bg-amber-50'
            }`}>
              {resumoOperacional.totalPendentes} análise / {resumoOperacional.totalNaoEnviados} s/ envio
            </span>
          </div>
        </button>

        {/* Card 4: Verba Liberada Módulo */}
        <button
          type="button"
          onClick={() => setStatusFiltro('aprovado')}
          className={`text-left border border-l-4 border-l-[#0055A5] rounded-md p-3.5 shadow-2xs flex flex-col justify-between transition-all cursor-pointer ${
            statusFiltro === 'aprovado'
              ? 'bg-blue-50/90 border-[#0055A5] ring-2 ring-[#0055A5]/20'
              : 'bg-white border-slate-200 hover:border-blue-200 hover:bg-slate-50/60'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase text-[#0055A5] tracking-wider">
              Verba Liberada
            </span>
            <DollarSign className="w-4 h-4 text-[#0055A5]" />
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <div className="text-lg font-extrabold text-[#003366] font-mono">
              R$ {resumoOperacional.verbaLiberada.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <span className="text-[10px] text-slate-500 font-medium bg-slate-100 px-1.5 py-0.5 rounded">Aprovado</span>
          </div>
        </button>

      </div>

      {/* 3. TABELA DE CHECK-IN DOS POLOS */}
      <div className="bg-white border border-slate-200 rounded-md p-4 sm:p-5 shadow-2xs space-y-3">
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-[#003366] uppercase tracking-wide">
              Lista de Polos e Status do Check-in ({filteredPolos.length})
            </h3>
            {statusFiltro !== 'todos' && (
              <button
                onClick={() => setStatusFiltro('todos')}
                className="text-[11px] text-[#0055A5] hover:underline font-semibold flex items-center gap-1 cursor-pointer"
              >
                (Limpar filtro)
              </button>
            )}
          </div>

          {/* Busca por Nome de Polo */}
          <div className="w-full sm:w-64 relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
            <input
              type="text"
              value={poloSearch}
              onChange={(e) => setPoloSearch(e.target.value)}
              placeholder="Buscar polo..."
              className="w-full bg-slate-50 border border-slate-300 rounded-md pl-9 pr-7 py-1.5 text-xs font-medium text-slate-800 outline-none focus:bg-white focus:border-[#0055A5] transition-all"
            />
            {poloSearch && (
              <button 
                onClick={() => setPoloSearch('')}
                className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        <div className="overflow-x-auto rounded border border-slate-200">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-[#003366] text-white font-bold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-2.5 px-3.5 align-middle">Polo</th>
                <th className="py-2.5 px-3 text-right align-middle">Meta Módulo</th>
                <th className="py-2.5 px-3 text-right align-middle">Realizado</th>
                <th className="py-2.5 px-3 text-center align-middle">Comprovantes / NFs</th>
                <th className="py-2.5 px-3 text-center align-middle">Status do Check-in</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-medium">
              {filteredPolos.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400 font-medium">
                    Nenhum polo encontrado com os filtros selecionados.
                  </td>
                </tr>
              ) : (
                filteredPolos.map((polo) => {
                  const temArquivos = polo.totalArquivos > 0 || polo.totalSubmissoes > 0;

                  return (
                    <tr 
                      key={polo.id}
                      className="hover:bg-slate-50/80 transition-colors"
                    >
                      {/* Polo */}
                      <td className="py-2.5 px-3.5 align-middle font-bold text-[#003366] text-xs">
                        {polo.polo}
                      </td>

                      {/* Meta do Módulo */}
                      <td className="py-2.5 px-3 align-middle text-right font-mono font-bold text-slate-800">
                        {polo.metaModulo} <span className="text-xs text-slate-400 font-normal">matr.</span>
                      </td>

                      {/* Realizado */}
                      <td className="py-2.5 px-3 align-middle text-right font-mono font-extrabold text-[#003366]">
                        {polo.realizado} <span className="text-xs text-slate-400 font-normal">matr.</span>
                      </td>

                      {/* Comprovantes / NFs */}
                      <td className="py-2.5 px-3 align-middle text-center">
                        {temArquivos ? (
                          <span className="inline-flex items-center gap-1.5 bg-sky-50 text-[#0055A5] border border-sky-200/80 px-2.5 py-0.5 rounded text-xs font-semibold font-mono">
                            <Paperclip className="w-3.5 h-3.5 text-[#0055A5]" />
                            <span>{polo.totalArquivos} {polo.totalArquivos === 1 ? 'arquivo' : 'arquivos'}</span>
                          </span>
                        ) : (
                          <span className="text-xs text-slate-400 font-normal">
                            Sem envios
                          </span>
                        )}
                      </td>

                      {/* Status do Check-in */}
                      <td className="py-2.5 px-3 align-middle text-center">
                        {polo.statusCheckin === 'aprovado' && (
                          <span className="inline-flex items-center justify-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                            <span>OK / Aprovado</span>
                          </span>
                        )}
                        {polo.statusCheckin === 'pendente' && (
                          <span className="inline-flex items-center justify-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200/80">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                            <span>Em Análise</span>
                          </span>
                        )}
                        {polo.statusCheckin === 'nao_enviado' && (
                          <span className="inline-flex items-center justify-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200/80">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                            <span>Pendente</span>
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

      </div>

      {/* 4. MODAL DE DETALHES E VALIDAÇÃO DO POLO */}
      {selectedPoloDetail && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-lg p-5 max-w-2xl w-full shadow-xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            
            {/* Header Modal */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded bg-[#003366] text-white flex items-center justify-center font-bold">
                  <Building2 className="w-5 h-5 text-sky-200" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-[#003366]">
                    Detalhamento do Polo: {selectedPoloDetail.poloName}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Conferência e validação no {selectedModulo}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedPoloDetail(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Metas vs CAC do Polo */}
            {selectedPoloDetail.metaPolo && (
              <div className="grid grid-cols-3 gap-2 bg-slate-50 border border-slate-200 p-3 rounded-md text-xs font-medium">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Meta Módulo:</span>
                  <span className="font-bold text-slate-900">{selectedPoloDetail.metaPolo.metaModulo} matrículas</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Realizado:</span>
                  <span className="font-bold text-[#003366]">{selectedPoloDetail.metaPolo.realizado} matrículas</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Teto CAC Max (R$ 90,00):</span>
                  <span className="font-bold text-emerald-700">
                    R$ {(selectedPoloDetail.metaPolo.realizado * 90).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            )}

            {/* Lista de Envios / Submissões do Polo no Módulo */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase text-[#003366] tracking-wider flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-[#0055A5]" />
                Envios de Comprovante Cadastrados ({selectedPoloSubmissoes.length})
              </h4>

              {selectedPoloSubmissoes.length === 0 ? (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded text-xs text-amber-900 font-medium flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Este polo ainda não realizou nenhum envio de nota fiscal/comprovante para o {selectedModulo}.</span>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {selectedPoloSubmissoes.map((sub) => {
                    let statusSelectClass = 'bg-[#D97706] text-white border-amber-700 font-bold';
                    if (sub.status === 'Aprovado / Feito') {
                      statusSelectClass = 'bg-[#00A86B] text-white border-emerald-700 font-bold';
                    } else if (sub.status === 'Errado / Com Pendência') {
                      statusSelectClass = 'bg-[#DC2626] text-white border-red-800 font-bold';
                    }

                    return (
                      <div 
                        key={sub.id} 
                        className="p-3 bg-slate-50 border border-slate-200 rounded-md space-y-2 text-xs"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-2">
                          <div>
                            <span className="font-mono font-bold text-[#0055A5] text-xs">
                              Protocolo / Doc: {sub.protocolo}
                            </span>
                            <span className="text-slate-400 text-[11px] ml-2">
                              Envio: {sub.dataEnvio}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-slate-900">
                              R$ {(sub.valorTotal || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </span>

                            {/* Alteração rápida do status */}
                            <select
                              value={sub.status}
                              onChange={(e) => onUpdateSubmissaoStatus(sub.id, e.target.value as StatusAuditoria, sub.observacaoInterna)}
                              className={`px-2 py-0.5 rounded text-xs font-bold border outline-none cursor-pointer ${statusSelectClass}`}
                            >
                              <option value="Aguardando / Em Análise" className="bg-white text-slate-900 font-bold">🟡 Em Análise</option>
                              <option value="Errado / Com Pendência" className="bg-white text-slate-900 font-bold">🔴 Com Pendência</option>
                              <option value="Aprovado / Feito" className="bg-white text-slate-900 font-bold">🟢 Aprovado</option>
                            </select>
                          </div>
                        </div>

                        {/* Arquivos do Envio */}
                        <div className="flex items-center justify-between text-slate-600">
                          <div className="flex items-center gap-1.5 font-mono text-[11px]">
                            <Paperclip className="w-3.5 h-3.5 text-slate-400" />
                            <span>{sub.arquivosCount || 1} arquivo(s) anexado(s)</span>
                          </div>

                          {sub.arquivosNomes && sub.arquivosNomes.length > 0 && (
                            <span className="text-[10px] text-slate-500 font-mono truncate max-w-xs">
                              {sub.arquivosNomes.join(', ')}
                            </span>
                          )}
                        </div>

                        {/* Observações Internas / Campo de Edição com Botão Salvar Observação */}
                        <div className="p-2.5 bg-slate-50 border border-slate-200/80 rounded-lg space-y-1.5">
                          <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
                            Observação Interna da Auditoria
                          </label>
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              defaultValue={sub.observacaoInterna || ''}
                              id={`obs-modal-input-${sub.id}`}
                              placeholder="Escreva uma observação..."
                              className="flex-1 bg-white border border-slate-200 rounded px-2.5 py-1 text-xs text-slate-800 focus:outline-none focus:border-[#0055A5]"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const inputEl = document.getElementById(`obs-modal-input-${sub.id}`) as HTMLInputElement | null;
                                const val = inputEl?.value || '';
                                onUpdateSubmissaoStatus(sub.id, sub.status, val);
                                if (onShowToast) {
                                  onShowToast('Observação salva com sucesso!');
                                }
                              }}
                              className="px-2.5 py-1 bg-[#0055A5] hover:bg-[#003366] active:scale-95 text-white text-xs font-bold rounded flex items-center gap-1 cursor-pointer transition-colors shadow-2xs shrink-0"
                            >
                              <Save className="w-3.5 h-3.5" />
                              <span>Salvar Observação</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer Modal */}
            <div className="pt-3 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setSelectedPoloDetail(null)}
                className="px-4 py-1.5 bg-[#003366] hover:bg-[#002244] text-white font-bold text-xs rounded transition-all cursor-pointer"
              >
                Concluído
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
