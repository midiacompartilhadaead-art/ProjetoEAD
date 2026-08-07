import React, { useState, useMemo } from 'react';
import { MetaPolo, SubmissaoComprovante } from '../../types';
import { DynamicYearSelect } from '../common/DynamicYearSelect';
import { UnimarSymbolIcon } from '../UnimarSymbolIcon';
import { 
  Building2, 
  Save, 
  Search, 
  X, 
  CheckCircle2, 
  Target,
  TrendingUp,
  Coins,
  Layers,
  Filter,
  RotateCcw,
  AlertTriangle
} from 'lucide-react';

interface AdminMetasTabProps {
  selectedAno: string;
  onAnoChange: (ano: string) => void;
  selectedModulo: string;
  onModuloChange: (modulo: string) => void;
  metas: MetaPolo[];
  onMetaChange: (id: string, value: string) => void;
  onRealizadoChange: (id: string, value: string) => void;
  onSaveMetas: () => void;
  onZerarMetas: () => void;
  submissoes?: SubmissaoComprovante[];
  metasSavedMessage: boolean;
}

export const AdminMetasTab: React.FC<AdminMetasTabProps> = ({
  selectedAno,
  onAnoChange,
  selectedModulo,
  onModuloChange,
  metas,
  onMetaChange,
  onRealizadoChange,
  onSaveMetas,
  onZerarMetas,
  metasSavedMessage,
}) => {
  const [poloSearchQuery, setPoloSearchQuery] = useState<string>('');
  const [showZerarModal, setShowZerarModal] = useState<boolean>(false);
  const [activeRowId, setActiveRowId] = useState<string | null>(null);

  // Totais Globais
  const totalMetaGlobal = useMemo(() => metas.reduce((acc, m) => acc + m.metaModulo, 0), [metas]);
  const totalRealizadoGlobal = useMemo(() => metas.reduce((acc, m) => acc + m.realizado, 0), [metas]);
  const pctGlobal = totalMetaGlobal > 0 ? Math.round((totalRealizadoGlobal / totalMetaGlobal) * 100) : 0;
  
  // Valor Pactuado Total = R$ 90,00 * Meta Global
  const totalValorPactuadoGlobal = useMemo(() => totalMetaGlobal * 90, [totalMetaGlobal]);

  // Filtro de Polos na Tabela
  const filteredMetas = useMemo(() => {
    if (!poloSearchQuery.trim()) return metas;
    return metas.filter(m => 
      m.polo.toLowerCase().includes(poloSearchQuery.toLowerCase().trim())
    );
  }, [metas, poloSearchQuery]);

  return (
    <div className="space-y-5 animate-fade-in">
      
      {/* 0. SELEÇÃO TEMPORAL DE PERÍODO (ANO & MÓDULO) */}
      <div className="bg-white border border-[#003366]/20 border-l-4 border-l-[#003366] rounded-sm p-4 shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#003366]/10 text-[#003366] rounded-sm flex items-center justify-center shrink-0">
            <Filter className="w-5 h-5 text-[#003366]" />
          </div>
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-[#003366]">
              Filtro Temporal de Metas
            </h3>
            <p className="text-[11px] text-slate-500 font-medium">
              Selecione o Ano Letivo e o Módulo para visualizar ou registrar as metas correspondentes.
            </p>
          </div>
        </div>

        {/* Seletores de Ano e Módulo */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Seletor de Ano Dinâmico (Anos de 2026 até 2030) */}
          <DynamicYearSelect
            value={selectedAno}
            onChange={onAnoChange}
            startYear={2026}
          />

          {/* Seletor de Módulo */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-300 rounded-sm px-2.5 py-1.5 focus-within:border-[#0055A5] focus-within:bg-white transition-all shadow-2xs">
            <Layers className="w-3.5 h-3.5 text-[#0055A5]" />
            <label htmlFor="select-modulo" className="text-[10px] uppercase font-bold text-slate-500 mr-1">Módulo:</label>
            <select
              id="select-modulo"
              value={selectedModulo}
              onChange={(e) => onModuloChange(e.target.value)}
              className="bg-transparent text-xs font-black font-mono text-[#0055A5] outline-none cursor-pointer pr-1"
            >
              <option value="1">Módulo 1</option>
              <option value="2">Módulo 2</option>
              <option value="3">Módulo 3</option>
              <option value="4">Módulo 4</option>
            </select>
          </div>
        </div>
      </div>

      {/* 1. 3 CARDS DE KPIS INSTITUCIONAIS UNIMAR COMPACTOS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        
        {/* Card 1: Matrículas Realizadas */}
        <div className="bg-white border border-[#003366]/30 border-l-4 border-l-[#003366] rounded-sm p-4 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase text-[#003366] tracking-wider flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-[#003366]" />
              Matrículas Realizadas ({selectedAno}/M{selectedModulo})
            </span>
          </div>
          <div className="mt-2.5 flex items-baseline justify-between border-t border-slate-100 pt-2">
            <div className="text-2xl font-black text-slate-900 tracking-tight font-mono">
              {totalRealizadoGlobal.toLocaleString('pt-BR')}
            </div>
            <span className="text-xs text-slate-600 font-bold">
              Meta: <span className="font-mono text-[#003366]">{totalMetaGlobal.toLocaleString('pt-BR')}</span>
            </span>
          </div>
        </div>

        {/* Card 2: % Meta Global */}
        <div className="bg-white border border-[#003366]/30 border-l-4 border-l-[#0055A5] rounded-sm p-4 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase text-[#003366] tracking-wider flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-[#0055A5]" />
              % Meta Atingida ({selectedAno}/M{selectedModulo})
            </span>
          </div>
          <div className="mt-2.5 flex items-baseline justify-between border-t border-slate-100 pt-2">
            <div className="text-2xl font-black text-[#003366] tracking-tight font-mono">
              {pctGlobal}%
            </div>
            <span className="text-xs text-slate-600 font-semibold">
              {totalRealizadoGlobal} de {totalMetaGlobal} matrículas
            </span>
          </div>
        </div>

        {/* Card 3: Valor Pactuado Total (R$) */}
        <div className="bg-white border border-[#003366]/30 border-l-4 border-l-[#003366] rounded-sm p-4 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase text-[#003366] tracking-wider flex items-center gap-1.5">
              <Coins className="w-3.5 h-3.5 text-[#003366]" />
              Valor Pactuado Total ({selectedAno}/M{selectedModulo})
            </span>
          </div>
          <div className="mt-2.5 flex items-baseline justify-between border-t border-slate-100 pt-2">
            <div className="text-xl font-black text-[#003366] tracking-tight font-mono">
              R$ {totalValorPactuadoGlobal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <span className="text-[11px] text-slate-500 font-medium">Meta × R$ 90,00</span>
          </div>
        </div>

      </div>

      {/* 2. TABELA DE ACOMPANHAMENTO DIÁRIO DE METAS POR POLO */}
      <div className="bg-white border border-slate-300 rounded-sm p-4 sm:p-5 space-y-4 shadow-2xs">
        
        {/* Table Header Controls */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 border-b border-slate-200 pb-3">
          <div>
            <h2 className="text-sm font-extrabold text-[#003366] uppercase tracking-wider flex items-center gap-2">
              <UnimarSymbolIcon className="w-5 h-5 inline-block text-blue-600 shrink-0" />
              Acompanhamento de Metas — {selectedAno} / Módulo {selectedModulo} ({metas.length} Polos)
            </h2>
            <p className="text-[11px] text-slate-500 font-normal mt-0.5">
              Ajuste as metas e valores realizados para o período <span className="font-bold text-[#003366] font-mono">{selectedAno} / Módulo {selectedModulo}</span>. O Valor Pactuado por Polo é calculado automaticamente (Meta × R$ 90,00).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {/* Botão Secundário Zerar Metas */}
            <button
              onClick={() => setShowZerarModal(true)}
              className="px-3.5 py-2 bg-white border border-slate-300 hover:bg-rose-50 hover:border-rose-300 text-slate-600 hover:text-rose-700 font-bold text-xs rounded-sm shadow-2xs transition-all cursor-pointer flex items-center gap-1.5 active:scale-95"
              title="Redefinir todas as metas e realizados deste período para 0"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-500 hover:text-rose-600" />
              <span>Zerar Metas</span>
            </button>

            {/* Botão Principal Salvar Alterações */}
            <button
              onClick={onSaveMetas}
              className="px-4 py-2 bg-[#003366] hover:bg-[#002244] text-white font-bold text-xs rounded-sm shadow-2xs transition-all cursor-pointer flex items-center gap-2 active:scale-95"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Salvar Alterações</span>
            </button>
          </div>
        </div>

        {/* Modal / Dialog de Confirmação de Segurança de Zeragem */}
        {showZerarModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
            <div className="bg-white rounded-sm border border-slate-300 shadow-xl max-w-md w-full overflow-hidden animate-scale-up">
              {/* Modal Header */}
              <div className="bg-rose-50 border-b border-rose-200 px-5 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-rose-100 text-rose-700 rounded-sm flex items-center justify-center shrink-0">
                    <AlertTriangle className="w-5 h-5 text-rose-600" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-rose-950">
                      Zerar metas do período selecionado?
                    </h3>
                    <p className="text-[11px] font-bold text-rose-700 font-mono mt-0.5">
                      Período: {selectedAno} / Módulo {selectedModulo}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowZerarModal(false)}
                  className="text-slate-400 hover:text-slate-600 p-1 rounded-sm cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-5 space-y-3">
                <p className="text-xs text-slate-700 leading-relaxed font-medium">
                  Tem certeza que deseja redefinir todas as metas e realizados deste módulo para <strong className="font-black text-slate-900">0</strong>? Esta ação pode ser descartada se você não salvar as alterações.
                </p>

                <div className="bg-slate-50 border border-slate-200 rounded-sm p-3 text-[11px] text-slate-600 space-y-1 font-medium">
                  <div className="flex justify-between">
                    <span>Ano / Módulo:</span>
                    <span className="font-bold text-[#003366] font-mono">{selectedAno} / Módulo {selectedModulo}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total de Polos:</span>
                    <span className="font-bold text-slate-800 font-mono">{metas.length} Polos</span>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="bg-slate-100 border-t border-slate-200 px-5 py-3 flex items-center justify-end gap-2">
                <button
                  onClick={() => setShowZerarModal(false)}
                  className="px-4 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-sm shadow-2xs transition-all cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => {
                    onZerarMetas();
                    setShowZerarModal(false);
                  }}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-sm shadow-2xs transition-all cursor-pointer flex items-center gap-1.5 active:scale-95"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Confirmar e Zerar</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Saved Toast Message */}
        {metasSavedMessage && (
          <div className="p-2.5 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-sm text-xs font-bold flex items-center gap-2 animate-fade-in shadow-2xs">
            <CheckCircle2 className="w-4 h-4 text-[#00A86B] shrink-0" />
            <span>Metas e valores realizados do período {selectedAno} / Módulo {selectedModulo} atualizados com sucesso no sistema!</span>
          </div>
        )}

        {/* Live Filter Search */}
        <div className="relative max-w-sm">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
          <input
            type="text"
            value={poloSearchQuery}
            onChange={(e) => setPoloSearchQuery(e.target.value)}
            placeholder="Filtrar polo pelo nome..."
            className="w-full bg-slate-50 border border-slate-300 rounded-sm pl-9 pr-8 py-1.5 text-xs font-bold text-slate-800 outline-none focus:border-[#0055A5] focus:bg-white transition-all"
          />
          {poloSearchQuery && (
            <button 
              onClick={() => setPoloSearchQuery('')}
              className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Table Content (Design System Unimar: Cabeçalho #003366, Texto Branco, Alta Densidade) */}
        <div className="overflow-x-auto rounded-sm border border-slate-300 max-h-[520px] overflow-y-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-[#003366] text-white font-bold uppercase text-[10px] tracking-wider sticky top-0 z-10 shadow-2xs">
              <tr>
                <th className="py-2.5 px-3 border-r border-[#002244]">POLO UNIMAR ({filteredMetas.length})</th>
                <th className="py-2.5 px-3 text-center border-r border-[#002244]">META</th>
                <th className="py-2.5 px-3 text-center border-r border-[#002244]">REALIZADO</th>
                <th className="py-2.5 px-3 text-center border-r border-[#002244]">% ATINGIDO</th>
                <th className="py-2.5 px-3 text-right">VALOR PACTUADO (R$)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredMetas.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-slate-400 font-medium">
                    Nenhum polo localizado com "{poloSearchQuery}".
                  </td>
                </tr>
              ) : (
                filteredMetas.map((item, index) => {
                  const pct = item.metaModulo > 0 ? Math.round((item.realizado / item.metaModulo) * 100) : 0;
                  
                  // Cálculo do Valor Pactuado por Polo = META DO MÓDULO * 90
                  const valorPactuadoPolo = item.metaModulo * 90;

                  // Cores com contraste funcional suave para os Badges e Progress Bar Mini
                  let pctBadge = 'bg-rose-50 text-rose-700 border-rose-300/80';
                  let pctBarColor = 'bg-rose-500';

                  if (pct >= 80) {
                    pctBadge = 'bg-emerald-50 text-emerald-700 border-emerald-300/80';
                    pctBarColor = 'bg-emerald-500';
                  } else if (pct >= 50) {
                    pctBadge = 'bg-amber-50 text-amber-700 border-amber-300/80';
                    pctBarColor = 'bg-amber-500';
                  }

                  const isEven = index % 2 === 0;
                  const isSelected = activeRowId === item.id;

                  return (
                    <tr 
                      key={item.id} 
                      onClick={() => setActiveRowId(item.id)}
                      className={`font-medium text-slate-800 transition-colors duration-150 border-b border-slate-200 cursor-pointer ${
                        isSelected
                          ? 'bg-sky-50/90 border-l-4 border-l-[#003366] shadow-2xs'
                          : isEven 
                            ? 'bg-white hover:bg-slate-50/90' 
                            : 'bg-[#F8FAFC] hover:bg-slate-100/80'
                      }`}
                    >
                      {/* 1. POLO UNIMAR */}
                      <td className="py-2.5 px-3 align-middle font-bold text-[#003366] text-xs">
                        {item.polo}
                      </td>
                      
                      {/* 2. META (EDITÁVEL com estilo de input sutil) */}
                      <td className="py-2 px-3 align-middle text-center">
                        <div className="relative inline-block group">
                          <input
                            type="number"
                            min={0}
                            value={item.metaModulo}
                            onChange={(e) => onMetaChange(item.id, e.target.value)}
                            onFocus={() => setActiveRowId(item.id)}
                            className="w-20 text-center bg-white border border-slate-200 group-hover:border-[#0055A5]/60 focus:border-[#0055A5] focus:ring-2 focus:ring-[#0055A5]/20 focus:bg-white rounded-sm px-2 py-1 font-mono font-black text-[#003366] text-xs outline-none transition-all shadow-2xs group-hover:shadow-xs"
                            title="Clique para editar a meta deste polo"
                          />
                        </div>
                      </td>

                      {/* 3. REALIZADO (EDITÁVEL com estilo de input sutil) */}
                      <td className="py-2 px-3 align-middle text-center">
                        <div className="relative inline-block group">
                          <input
                            type="number"
                            min={0}
                            value={item.realizado}
                            onChange={(e) => onRealizadoChange(item.id, e.target.value)}
                            onFocus={() => setActiveRowId(item.id)}
                            className="w-20 text-center bg-white border border-slate-200 group-hover:border-[#0055A5]/60 focus:border-[#0055A5] focus:ring-2 focus:ring-[#0055A5]/20 focus:bg-white rounded-sm px-2 py-1 font-mono font-black text-[#0055A5] text-xs outline-none transition-all shadow-2xs group-hover:shadow-xs"
                            title="Clique para editar o realizado deste polo"
                          />
                        </div>
                      </td>

                      {/* 4. % ATINGIDO (Pílula Colorida + Progress Bar Mini) */}
                      <td className="py-2 px-3 align-middle text-center">
                        <div className="flex flex-col items-center justify-center gap-1.5 min-w-[100px] max-w-[120px] mx-auto">
                          <span className={`inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-[11px] font-extrabold font-mono border shadow-2xs ${pctBadge}`}>
                            {pct}%
                          </span>
                          {/* Progress Bar Mini */}
                          <div className="w-full bg-slate-100 border border-slate-200 rounded-full h-1.5 overflow-hidden shadow-2xs" title={`Desempenho: ${pct}%`}>
                            <div 
                              className={`h-full rounded-full transition-all duration-300 ${pctBarColor}`} 
                              style={{ width: `${Math.min(pct, 100)}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* 5. VALOR PACTUADO (R$) Alinhado à direita para padrão contábil */}
                      <td className="py-2.5 px-4 align-middle text-right font-mono font-extrabold text-[#003366] text-xs whitespace-nowrap">
                        R$ {valorPactuadoPolo.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

      </div>

    </div>
  );
};
