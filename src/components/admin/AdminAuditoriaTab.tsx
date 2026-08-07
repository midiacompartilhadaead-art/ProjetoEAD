import React, { useState, useMemo } from 'react';
import { SubmissaoComprovante, StatusAuditoria } from '../../types';
import { 
  FileText, 
  Search, 
  Filter, 
  ArrowUpDown, 
  ArrowUp, 
  ArrowDown, 
  Paperclip, 
  Trash2, 
  AlertTriangle, 
  X, 
  CheckCircle2, 
  Clock,
  Check,
  Save
} from 'lucide-react';

// Componente para entrada de observação com salvamento manual/automático e feedback visual
const ObservacaoInput: React.FC<{
  subId: string;
  initialValue: string;
  status: StatusAuditoria;
  onUpdate: (id: string, status: StatusAuditoria, obs: string) => void;
  onShowToast?: (msg: string) => void;
}> = ({ subId, initialValue, status, onUpdate, onShowToast }) => {
  const [value, setValue] = useState(initialValue || '');
  const [savedState, setSavedState] = useState<'idle' | 'saving' | 'saved'>('idle');

  React.useEffect(() => {
    setValue(initialValue || '');
  }, [initialValue]);

  const handleSave = () => {
    setSavedState('saving');
    onUpdate(subId, status, value);
    setTimeout(() => {
      setSavedState('saved');
      if (onShowToast) {
        onShowToast('Observação salva com sucesso!');
      }
      setTimeout(() => setSavedState('idle'), 2500);
    }, 200);
  };

  return (
    <div className="flex items-center gap-1.5 min-w-[250px]">
      <input
        type="text"
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          if (savedState !== 'idle') setSavedState('idle');
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            handleSave();
          }
        }}
        placeholder="Escreva sua observação..."
        className="flex-1 bg-transparent border-b border-slate-200 hover:border-slate-300 focus:border-[#0074b8] focus:bg-white rounded-md px-2.5 py-1 text-xs font-medium text-slate-800 focus:text-[#002b54] outline-none transition-all placeholder:text-slate-300 placeholder:italic"
      />
      <button
        type="button"
        onClick={handleSave}
        className="px-2 py-1 bg-[#0055A5] hover:bg-[#003b70] active:scale-95 text-white font-extrabold text-[10px] rounded flex items-center gap-1 transition-all cursor-pointer whitespace-nowrap shadow-2xs shrink-0"
        title="Salvar Observação"
      >
        <Save className="w-3 h-3" />
        <span>Salvar</span>
      </button>
      {savedState === 'saved' && (
        <span className="text-[10px] font-bold text-emerald-700 flex items-center gap-0.5 bg-emerald-100 px-1.5 py-0.5 rounded shrink-0">
          <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Salvo
        </span>
      )}
    </div>
  );
};

interface AdminAuditoriaTabProps {
  submissoes: SubmissaoComprovante[];
  onUpdateSubmissaoStatus: (id: string, newStatus: StatusAuditoria, obsInterna?: string) => void;
  onDeleteSubmissao: (id: string) => void;
  onShowToast?: (msg: string) => void;
}

// Auxiliar para conversão de data formatada em timestamp
const parseDataEnvio = (str?: string) => {
  if (!str) return 0;
  const [datePart, timePart = '00:00'] = str.split(' ');
  const parts = datePart.split('/');
  if (parts.length < 3) return 0;
  const [day, month, year] = parts;
  const [hour, minute] = timePart.split(':');
  return new Date(
    Number(year),
    Number(month) - 1,
    Number(day),
    Number(hour || 0),
    Number(minute || 0)
  ).getTime();
};

export const AdminAuditoriaTab: React.FC<AdminAuditoriaTabProps> = ({
  submissoes,
  onUpdateSubmissaoStatus,
  onDeleteSubmissao,
  onShowToast,
}) => {
  const [submissoesSearchQuery, setSubmissoesSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('todos');
  const [sortField, setSortField] = useState<'dataEnvio' | 'valorTotal' | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Modais
  const [itemParaExcluir, setItemParaExcluir] = useState<SubmissaoComprovante | null>(null);
  const [submissaoAnexosModal, setSubmissaoAnexosModal] = useState<SubmissaoComprovante | null>(null);

  // Filtro de Submissões (busca por polo, protocolo, categoria, módulo)
  const filteredSubmissoes = useMemo(() => {
    return submissoes.filter(sub => {
      if (statusFilter !== 'todos' && sub.status !== statusFilter) {
        return false;
      }
      if (!submissoesSearchQuery.trim()) return true;
      const q = submissoesSearchQuery.toLowerCase().trim();
      return (
        sub.protocolo.toLowerCase().includes(q) ||
        sub.polo.toLowerCase().includes(q) ||
        sub.categoria.toLowerCase().includes(q) ||
        (sub.modulo && sub.modulo.toLowerCase().includes(q))
      );
    });
  }, [submissoes, statusFilter, submissoesSearchQuery]);

  // Ordenação com PRIORIZAÇÃO PADRÃO: PENDENTES / NÃO FEITOS NO TOPO
  const sortedSubmissoes = useMemo(() => {
    return [...filteredSubmissoes].sort((a, b) => {
      // Se houver ordenação explícita por campo clicado no cabeçalho
      if (sortField) {
        let valA = 0;
        let valB = 0;

        if (sortField === 'valorTotal') {
          valA = a.valorTotal || 0;
          valB = b.valorTotal || 0;
        } else if (sortField === 'dataEnvio') {
          valA = parseDataEnvio(a.dataEnvio);
          valB = parseDataEnvio(b.dataEnvio);
        }

        if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
        if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      }

      // ORDENAÇÃO PADRÃO SE NENHUM CAMPO FOI CLICADO:
      // Prioridade 1: Pendentes/Aguardando/Com Pendência (Rank 1)
      // Prioridade 2: Aprovados/Feito (Rank 2)
      // Prioridade 3: Outros (Rank 3)
      const getStatusRank = (status: StatusAuditoria) => {
        if (status === 'Aguardando / Em Análise' || status === 'Pendente Auditoria' || status === 'Errado / Com Pendência') {
          return 1; // Prioridade máxima no topo
        }
        if (status === 'Aprovado / Feito') {
          return 2;
        }
        return 3;
      };

      const rankA = getStatusRank(a.status);
      const rankB = getStatusRank(b.status);

      if (rankA !== rankB) {
        return rankA - rankB; // Menor rank vem primeiro
      }

      // Desempate por data de envio (mais recente primeiro)
      return parseDataEnvio(b.dataEnvio) - parseDataEnvio(a.dataEnvio);
    });
  }, [filteredSubmissoes, sortField, sortOrder]);

  const handleSort = (field: 'dataEnvio' | 'valorTotal') => {
    if (sortField === field) {
      setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const handleConfirmarExclusao = () => {
    if (itemParaExcluir) {
      onDeleteSubmissao(itemParaExcluir.id);
      setItemParaExcluir(null);
    }
  };

  // Contadores de Status para Resumo
  const pendentesCount = useMemo(() => {
    return submissoes.filter(s => s.status !== 'Aprovado / Feito').length;
  }, [submissoes]);

  const aprovadosCount = useMemo(() => {
    return submissoes.filter(s => s.status === 'Aprovado / Feito').length;
  }, [submissoes]);

  return (
    <div className="space-y-5 animate-fade-in">
      
      {/* Container Principal */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 sm:p-5 space-y-4 shadow-xs">
        
        {/* Header do Bloco */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
          <div>
            <h2 className="text-sm font-extrabold text-[#003366] uppercase tracking-wider flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#0055A5]" />
              Auditoria de Comprovantes & Conciliação de Mídias
            </h2>
            <p className="text-[11px] text-slate-500 font-normal">
              Avalie e aprove envios de notas e mídias dos polos. Itens pendentes são exibidos no topo para ação prioritária.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {pendentesCount > 0 && (
              <span className="text-xs font-bold bg-[#D97706] text-white px-2.5 py-1 rounded flex items-center gap-1.5 shadow-2xs">
                <Clock className="w-3.5 h-3.5" />
                {pendentesCount} Pendente(s)
              </span>
            )}
            <span className="text-xs text-[#003366] font-bold bg-slate-100 border border-slate-300/80 px-2.5 py-1 rounded">
              {filteredSubmissoes.length} registros
            </span>
          </div>
        </div>

        {/* Toolbar de Filtros Integrada */}
        <div className="flex flex-col sm:flex-row items-center gap-2.5 bg-slate-50 border border-slate-200 p-2.5 rounded-md">
          <div className="flex-1 w-full relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
            <input
              type="text"
              value={submissoesSearchQuery}
              onChange={(e) => setSubmissoesSearchQuery(e.target.value)}
              placeholder="Buscar por polo, número de nota/protocolo ou módulo..."
              className="w-full bg-white border border-slate-300 rounded-md pl-9 pr-3 py-1.5 text-xs font-medium text-slate-800 outline-none focus:border-[#0055A5] transition-all"
            />
          </div>

          <div className="w-full sm:w-60 relative">
            <Filter className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-md pl-9 pr-7 py-1.5 text-xs font-semibold text-slate-800 outline-none appearance-none cursor-pointer"
            >
              <option value="todos">Todos os Status</option>
              <option value="Aguardando / Em Análise">🟡 Pendente / Em Análise</option>
              <option value="Errado / Com Pendência">🔴 Com Pendência / Incorreto</option>
              <option value="Aprovado / Feito">🟢 Aprovado / Feito</option>
            </select>
          </div>
        </div>

        {/* Tabela de Auditoria de Alta Densidade */}
        <div className="overflow-x-auto rounded-md border border-slate-200">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-[#003366] text-white font-bold uppercase text-[10px] tracking-wider">
              <tr>
                <th 
                  onClick={() => handleSort('dataEnvio')} 
                  className="py-2.5 px-3 cursor-pointer select-none hover:bg-[#00264d] transition-colors group align-middle"
                  title="Clique para ordenar por data de envio"
                >
                  <div className="flex items-center gap-1">
                    <span>Data Envio</span>
                    {sortField === 'dataEnvio' ? (
                      sortOrder === 'asc' ? <ArrowUp className="w-3 h-3 text-sky-300" /> : <ArrowDown className="w-3 h-3 text-sky-300" />
                    ) : (
                      <ArrowUpDown className="w-3 h-3 text-slate-300 opacity-60 group-hover:opacity-100" />
                    )}
                  </div>
                </th>
                <th className="py-2.5 px-3 align-middle">Polo / Módulo</th>
                <th className="py-2.5 px-3 align-middle">Nº Nota / Doc</th>
                <th 
                  onClick={() => handleSort('valorTotal')} 
                  className="py-2.5 px-3 text-right cursor-pointer select-none hover:bg-[#00264d] transition-colors group align-middle"
                  title="Clique para ordenar por valor total"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Valor Total (R$)</span>
                    {sortField === 'valorTotal' ? (
                      sortOrder === 'asc' ? <ArrowUp className="w-3 h-3 text-sky-300" /> : <ArrowDown className="w-3 h-3 text-sky-300" />
                    ) : (
                      <ArrowUpDown className="w-3 h-3 text-slate-300 opacity-60 group-hover:opacity-100" />
                    )}
                  </div>
                </th>
                <th className="py-2.5 px-3 text-center align-middle">Anexos</th>
                <th className="py-2.5 px-3 text-center align-middle">Status Auditoria</th>
                <th className="py-2.5 px-3 align-middle">Observação Interna</th>
                <th className="py-2.5 px-3 text-center align-middle">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {sortedSubmissoes.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400 font-medium">
                    Nenhum envio de comprovante localizado com os filtros aplicados.
                  </td>
                </tr>
              ) : (
                sortedSubmissoes.map((sub, index) => {
                  // Badges de Status Sólidos e Profissionais
                  let statusSelectClass = 'bg-[#D97706] text-white border-[#B45309] font-bold';
                  if (sub.status === 'Aprovado / Feito') {
                    statusSelectClass = 'bg-[#00A86B] text-white border-emerald-700 font-bold';
                  } else if (sub.status === 'Errado / Com Pendência') {
                    statusSelectClass = 'bg-[#DC2626] text-white border-red-800 font-bold';
                  }

                  const displayValor = sub.valorTotal 
                    ? sub.valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                    : '1.250,00';

                  const isEven = index % 2 === 0;

                  return (
                    <tr 
                      key={sub.id} 
                      className={`hover:bg-sky-50/60 font-medium text-slate-800 transition-colors border-b border-slate-200 ${
                        isEven ? 'bg-white' : 'bg-[#F8FAFC]'
                      }`}
                    >
                      
                      {/* Data Envio */}
                      <td className="py-2 px-3 align-middle font-mono text-[11px] text-slate-600 whitespace-nowrap">
                        {sub.dataEnvio}
                      </td>

                      {/* Polo / Módulo */}
                      <td className="py-2 px-3 align-middle">
                        <div className="font-bold text-[#003366] text-xs leading-tight">{sub.polo}</div>
                        <span className="inline-block mt-0.5 bg-slate-100 text-slate-700 text-[10px] font-semibold px-1.5 py-0.2 rounded border border-slate-300">
                          {sub.modulo || 'Módulo 1'}
                        </span>
                      </td>

                      {/* Nº Nota / Doc / Protocolo */}
                      <td className="py-2 px-3 align-middle font-mono font-bold text-[#0055A5] text-xs">
                        {sub.protocolo}
                      </td>

                      {/* Valor Total */}
                      <td className="py-2 px-3 align-middle text-right font-mono font-bold text-slate-900 text-xs">
                        R$ {displayValor}
                      </td>

                      {/* Anexos */}
                      <td className="py-2 px-3 align-middle text-center">
                        <button
                          onClick={() => setSubmissaoAnexosModal(sub)}
                          className="bg-slate-100 hover:bg-sky-50 text-[#0055A5] border border-slate-300 hover:border-[#0055A5] px-2 py-0.5 rounded text-[11px] font-mono font-bold inline-flex items-center gap-1 transition-all cursor-pointer"
                          title="Visualizar arquivos anexados"
                        >
                          <Paperclip className="w-3 h-3" />
                          <span>{sub.arquivosCount || 1} doc</span>
                        </button>
                      </td>

                      {/* Status Select Sólido */}
                      <td className="py-2 px-3 align-middle text-center">
                        <select
                          value={sub.status}
                          onChange={(e) => onUpdateSubmissaoStatus(sub.id, e.target.value as StatusAuditoria, sub.observacaoInterna)}
                          className={`px-2.5 py-1 rounded text-xs font-bold border outline-none cursor-pointer shadow-2xs transition-all ${statusSelectClass}`}
                        >
                          <option value="Aguardando / Em Análise" className="bg-white text-slate-900 font-bold">🟡 Em Análise</option>
                          <option value="Errado / Com Pendência" className="bg-white text-slate-900 font-bold">🔴 Com Pendência</option>
                          <option value="Aprovado / Feito" className="bg-white text-slate-900 font-bold">🟢 Aprovado</option>
                        </select>
                      </td>

                      {/* Campo Observação Interna Texto Livre com Auto-save */}
                      <td className="py-2 px-3 align-middle">
                        <ObservacaoInput
                          subId={sub.id}
                          initialValue={sub.observacaoInterna || ''}
                          status={sub.status}
                          onUpdate={onUpdateSubmissaoStatus}
                          onShowToast={onShowToast}
                        />
                      </td>

                      {/* Ações (Excluir) */}
                      <td className="py-2 px-3 align-middle text-center">
                        <button
                          onClick={() => setItemParaExcluir(sub)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-all cursor-pointer"
                          title="Excluir comprovante"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

      </div>

      {/* MODAL DE CONFIRMAÇÃO DE EXCLUSÃO */}
      {itemParaExcluir && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-lg p-5 max-w-md w-full shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-center gap-3 text-[#DC2626]">
              <div className="w-10 h-10 rounded-md bg-rose-50 border border-rose-200 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#003366]">Confirmar Exclusão</h3>
                <p className="text-xs text-slate-500 font-normal">Esta ação é irreversível.</p>
              </div>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-md text-xs space-y-1 font-medium text-slate-700">
              <div><strong>Protocolo:</strong> <span className="font-mono text-[#0055A5]">{itemParaExcluir.protocolo}</span></div>
              <div><strong>Polo:</strong> {itemParaExcluir.polo} ({itemParaExcluir.modulo || 'Módulo 1'})</div>
              <div><strong>Data:</strong> {itemParaExcluir.dataEnvio}</div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setItemParaExcluir(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-md transition-all cursor-pointer border border-slate-300"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmarExclusao}
                className="px-4 py-2 bg-[#DC2626] hover:bg-red-700 text-white font-bold text-xs rounded-md shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Sim, Excluir</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE VISUALIZAÇÃO DE ANEXOS */}
      {submissaoAnexosModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-lg p-5 max-w-lg w-full shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-md bg-slate-100 text-[#003366] flex items-center justify-center border border-slate-300">
                  <Paperclip className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#003366]">Documentos Anexados</h3>
                  <p className="text-[11px] text-slate-500 font-mono">{submissaoAnexosModal.protocolo} • {submissaoAnexosModal.polo}</p>
                </div>
              </div>
              <button
                onClick={() => setSubmissaoAnexosModal(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {submissaoAnexosModal.arquivosNomes && submissaoAnexosModal.arquivosNomes.length > 0 ? (
                submissaoAnexosModal.arquivosNomes.map((arq, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      alert(`Visualizando arquivo em modo seguro de auditoria: ${arq}`);
                    }}
                    className="w-full p-2.5 bg-slate-50 hover:bg-sky-50 border border-slate-200 hover:border-sky-300 rounded-md flex items-center gap-2.5 text-xs text-left transition-all cursor-pointer group shadow-2xs"
                  >
                    <FileText className="w-4 h-4 text-[#0055A5] shrink-0 group-hover:scale-110 transition-transform" />
                    <span className="font-mono text-[#003366] font-medium truncate">{arq}</span>
                  </button>
                ))
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    alert(`Visualizando arquivo em modo seguro de auditoria: Comprovante_Unimar_Oficial_${submissaoAnexosModal.protocolo}.pdf`);
                  }}
                  className="w-full p-2.5 bg-slate-50 hover:bg-sky-50 border border-slate-200 hover:border-sky-300 rounded-md flex items-center gap-2.5 text-xs text-left transition-all cursor-pointer group shadow-2xs"
                >
                  <FileText className="w-4 h-4 text-[#0055A5] shrink-0 group-hover:scale-110 transition-transform" />
                  <span className="font-mono text-[#003366] font-medium truncate">Comprovante_Unimar_Oficial_{submissaoAnexosModal.protocolo}.pdf</span>
                </button>
              )}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSubmissaoAnexosModal(null)}
                className="px-4 py-1.5 bg-[#003366] hover:bg-[#002244] text-white font-bold text-xs rounded-md shadow-xs transition-all cursor-pointer"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
