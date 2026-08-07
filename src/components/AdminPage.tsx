import React, { useState, useEffect, useMemo } from 'react';
import { PageView, SubmissaoComprovante, MetaPolo, StatusAuditoria, MetasPorPeriodo } from '../types';
import { POLOS_LIST } from '../data/mockData';
import { AdminSidebar, AdminTab } from './admin/AdminSidebar';
import { AdminMetasTab } from './admin/AdminMetasTab';
import { AdminAuditoriaTab } from './admin/AdminAuditoriaTab';
import { AdminIaAuditoriaTab } from './admin/AdminIaAuditoriaTab';
import { AdminCheckinTab } from './admin/AdminCheckinTab';
import { CheckCircle2 } from 'lucide-react';

interface AdminPageProps {
  onNavigate: (view: PageView) => void;
  submissoes: SubmissaoComprovante[];
  onUpdateSubmissaoStatus: (id: string, newStatus: StatusAuditoria, obsInterna?: string) => void;
  onDeleteSubmissao: (id: string) => void;
  authenticatedEmail: string | null;
  onResetDefaultData?: () => void;
  onShowToast?: (msg: string) => void;
}

// Preset de metas realistas para os primeiros polos no período principal (2026/Módulo 1)
const PRESET_METAS: Record<string, { metaModulo: number; realizado: number }> = {
  'Marília': { metaModulo: 150, realizado: 125 },
  'Bauru': { metaModulo: 90, realizado: 74 },
  'Campinas': { metaModulo: 110, realizado: 92 },
  'Araçatuba': { metaModulo: 65, realizado: 48 },
  'Presidente Prudente': { metaModulo: 75, realizado: 61 },
  'São Paulo': { metaModulo: 180, realizado: 160 },
  'Ribeirão Preto': { metaModulo: 95, realizado: 78 },
  'Sorocaba': { metaModulo: 70, realizado: 52 },
  'Curitiba': { metaModulo: 85, realizado: 65 },
  'Belo Horizonte': { metaModulo: 80, realizado: 59 },
  'São José dos Campos': { metaModulo: 75, realizado: 55 },
  'Cuiabá': { metaModulo: 55, realizado: 38 },
  'João Pessoa': { metaModulo: 45, realizado: 32 },
  'Assis': { metaModulo: 50, realizado: 36 },
  'Ourinhos': { metaModulo: 55, realizado: 42 },
  'Tupã': { metaModulo: 60, realizado: 44 },
  'Dracena': { metaModulo: 50, realizado: 38 },
  'Lucélia': { metaModulo: 45, realizado: 30 },
};

const NON_PRESET_REALIZADO = [
  26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 
  26, 26, 26, 26, 26, 26, 26, 26, 25, 25
];

const generatePolosMetasForPeriod = (ano: string, modulo: string): MetaPolo[] => {
  if (ano === '2026' && modulo === '1') {
    let nonPresetCounter = 0;
    return POLOS_LIST.map((poloName, idx) => {
      const preset = PRESET_METAS[poloName];
      let realizadoVal = 26;
      if (preset) {
        realizadoVal = preset.realizado;
      } else {
        realizadoVal = NON_PRESET_REALIZADO[nonPresetCounter % NON_PRESET_REALIZADO.length];
        nonPresetCounter++;
      }
      return {
        id: `polo-${idx + 1}`,
        polo: poloName,
        metaModulo: preset ? preset.metaModulo : 45,
        realizado: realizadoVal,
      };
    });
  }

  const modNum = parseInt(modulo, 10) || 1;
  const factor = modNum === 2 ? 0.9 : modNum === 3 ? 1.1 : modNum === 4 ? 1.25 : 1.0;
  return POLOS_LIST.map((poloName, idx) => {
    const preset = PRESET_METAS[poloName];
    const baseMeta = preset ? preset.metaModulo : 40;
    const calculatedMeta = Math.round(baseMeta * factor);
    const calculatedRealizado = Math.round(calculatedMeta * 0.7);
    return {
      id: `polo-${idx + 1}`,
      polo: poloName,
      metaModulo: calculatedMeta,
      realizado: calculatedRealizado,
    };
  });
};

const getPeriodKey = (ano: string, modulo: string) => `${ano}_MODULO_${modulo}`;

export const AdminPage: React.FC<AdminPageProps> = ({
  onNavigate,
  submissoes,
  onUpdateSubmissaoStatus,
  onDeleteSubmissao,
  authenticatedEmail,
  onResetDefaultData,
  onShowToast,
}) => {
  const [activeTab, setActiveTab] = useState<AdminTab>(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname;
      const hash = window.location.hash;
      if (path.includes('auditoria-ia') || hash.includes('auditoria-ia')) {
        return 'auditoria-ia';
      }
    }
    return 'auditoria-ia'; // Padrão com destaque para a nova tela de Auditoria IA
  });
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);

  // Filtro temporal (Ano e Módulo)
  const [selectedAno, setSelectedAno] = useState<string>(() => new Date().getFullYear().toString());
  const [selectedModulo, setSelectedModulo] = useState<string>('1');

  // Chave do período ativo (ex: "2026_MODULO_1")
  const activePeriodKey = getPeriodKey(selectedAno, selectedModulo);

  // Estado persistente de Metas por Periodo via localStorage
  const [metasPorPeriodo, setMetasPorPeriodo] = useState<MetasPorPeriodo>(() => {
    if (typeof window !== 'undefined') {
      const savedMetas = localStorage.getItem('unimar_admin_metas');
      if (savedMetas) {
        try {
          const parsed = JSON.parse(savedMetas);
          // Se for um objeto com chaves de período
          if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
            return parsed as MetasPorPeriodo;
          }
          // Retrocompatibilidade se era um array legado
          if (Array.isArray(parsed) && parsed.length > 0) {
            return {
              "2026_MODULO_1": parsed
            };
          }
        } catch (e) {
          console.error("Erro ao carregar unimar_admin_metas do localStorage:", e);
        }
      }
      
      const defaultState: MetasPorPeriodo = {
        "2026_MODULO_1": generatePolosMetasForPeriod('2026', '1')
      };
      localStorage.setItem('unimar_admin_metas', JSON.stringify(defaultState));
      return defaultState;
    }

    return {
      "2026_MODULO_1": generatePolosMetasForPeriod('2026', '1')
    };
  });

  const [metasSavedMessage, setMetasSavedMessage] = useState<boolean>(false);
  const [resetToastMessage, setResetToastMessage] = useState<boolean>(false);

  // Garante que o período selecionado sempre tenha dados válidos no estado e localStorage
  useEffect(() => {
    if (!metasPorPeriodo[activePeriodKey]) {
      const newPeriodMetas = generatePolosMetasForPeriod(selectedAno, selectedModulo);
      setMetasPorPeriodo(prev => {
        const updated = {
          ...prev,
          [activePeriodKey]: newPeriodMetas
        };
        if (typeof window !== 'undefined') {
          localStorage.setItem('unimar_admin_metas', JSON.stringify(updated));
        }
        return updated;
      });
    }
  }, [selectedAno, selectedModulo, activePeriodKey, metasPorPeriodo]);

  // Metas do período ativo
  const metasAtuais: MetaPolo[] = useMemo(() => {
    return metasPorPeriodo[activePeriodKey] || generatePolosMetasForPeriod(selectedAno, selectedModulo);
  }, [metasPorPeriodo, activePeriodKey, selectedAno, selectedModulo]);

  // Sincronização em tempo real do objeto no localStorage
  const saveMetasMapToLocalStorage = (updatedMap: MetasPorPeriodo) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('unimar_admin_metas', JSON.stringify(updatedMap));
    }
  };

  // Alteração de Meta para o período ativo
  const handleMetaChange = (id: string, valueStr: string) => {
    const val = parseInt(valueStr, 10);
    const newMetaVal = isNaN(val) ? 0 : val;
    setMetasPorPeriodo(prev => {
      const currentList = prev[activePeriodKey] || generatePolosMetasForPeriod(selectedAno, selectedModulo);
      const updatedList = currentList.map(m => m.id === id ? { ...m, metaModulo: newMetaVal } : m);
      const updatedMap = {
        ...prev,
        [activePeriodKey]: updatedList
      };
      saveMetasMapToLocalStorage(updatedMap);
      return updatedMap;
    });
  };

  // Alteração de Realizado para o período ativo
  const handleRealizadoChange = (id: string, valueStr: string) => {
    const val = parseInt(valueStr, 10);
    const newRealizadoVal = isNaN(val) ? 0 : val;
    setMetasPorPeriodo(prev => {
      const currentList = prev[activePeriodKey] || generatePolosMetasForPeriod(selectedAno, selectedModulo);
      const updatedList = currentList.map(m => m.id === id ? { ...m, realizado: newRealizadoVal } : m);
      const updatedMap = {
        ...prev,
        [activePeriodKey]: updatedList
      };
      saveMetasMapToLocalStorage(updatedMap);
      return updatedMap;
    });
  };

  // Zerar Metas e Realizados do período ativo (para 0)
  const handleZerarMetasPeriodoActive = () => {
    setMetasPorPeriodo(prev => {
      const currentList = prev[activePeriodKey] || generatePolosMetasForPeriod(selectedAno, selectedModulo);
      const zeroedList = currentList.map(m => ({ ...m, metaModulo: 0, realizado: 0 }));
      const updatedMap = {
        ...prev,
        [activePeriodKey]: zeroedList
      };
      saveMetasMapToLocalStorage(updatedMap);
      return updatedMap;
    });
  };

  const handleSaveMetas = () => {
    saveMetasMapToLocalStorage(metasPorPeriodo);
    setMetasSavedMessage(true);
    setTimeout(() => setMetasSavedMessage(false), 3000);
  };

  const handleResetData = () => {
    if (window.confirm("Deseja restaurar todos os dados do painel (Metas por Período, Auditoria e Check-in) para os valores padrão de fábrica?")) {
      const defaultMap: MetasPorPeriodo = {
        "2026_MODULO_1": generatePolosMetasForPeriod('2026', '1')
      };
      if (typeof window !== 'undefined') {
        localStorage.removeItem('unimar_admin_data');
        localStorage.removeItem('unimar_admin_metas');
        localStorage.setItem('unimar_admin_metas', JSON.stringify(defaultMap));
      }
      setMetasPorPeriodo(defaultMap);
      setSelectedAno('2026');
      setSelectedModulo('1');

      if (onResetDefaultData) {
        onResetDefaultData();
      }
      setResetToastMessage(true);
      setTimeout(() => setResetToastMessage(false), 3500);
    }
  };

  // Número de submissões pendentes
  const pendingCount = submissoes.filter(s => s.status !== 'Aprovado / Feito').length;

  return (
    <div className="notranslate min-h-screen bg-slate-100/70 flex flex-col md:flex-row overflow-x-hidden font-sans">
      
      {/* Sidebar Lateral */}
      <AdminSidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        pendingCount={pendingCount}
        onNavigate={onNavigate}
      />

      {/* Conteúdo Principal (Tab Content) */}
      <div className="flex-grow flex flex-col min-w-0">
        
        {/* Área Útil da Aba */}
        <main className="pt-4 px-4 pb-8 sm:pt-5 sm:px-6 lg:px-8 flex-grow">
          {resetToastMessage && (
            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-300 text-emerald-950 rounded-sm text-xs font-bold flex items-center gap-2 animate-fade-in shadow-2xs">
              <CheckCircle2 className="w-4 h-4 text-[#00A86B] shrink-0" />
              <span>Dados originais de fábrica restaurados no localStorage com sucesso!</span>
            </div>
          )}

          {activeTab === 'metas' && (
            <AdminMetasTab
              selectedAno={selectedAno}
              onAnoChange={setSelectedAno}
              selectedModulo={selectedModulo}
              onModuloChange={setSelectedModulo}
              metas={metasAtuais}
              onMetaChange={handleMetaChange}
              onRealizadoChange={handleRealizadoChange}
              onSaveMetas={handleSaveMetas}
              onZerarMetas={handleZerarMetasPeriodoActive}
              submissoes={submissoes}
              metasSavedMessage={metasSavedMessage}
            />
          )}

          {activeTab === 'auditoria-ia' && (
            <AdminIaAuditoriaTab />
          )}

          {activeTab === 'auditoria' && (
            <AdminAuditoriaTab
              submissoes={submissoes}
              onUpdateSubmissaoStatus={onUpdateSubmissaoStatus}
              onDeleteSubmissao={onDeleteSubmissao}
              onShowToast={onShowToast}
            />
          )}

          {activeTab === 'checkin' && (
            <AdminCheckinTab
              metas={metasAtuais}
              submissoes={submissoes}
              onUpdateSubmissaoStatus={onUpdateSubmissaoStatus}
              onShowToast={onShowToast}
            />
          )}
        </main>

      </div>

    </div>
  );
};

