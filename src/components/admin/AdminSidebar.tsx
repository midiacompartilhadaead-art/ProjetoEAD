import React from 'react';
import { 
  BarChart3, 
  FileCheck2, 
  ClipboardCheck, 
  ChevronLeft, 
  ChevronRight, 
  Sparkles,
  ArrowLeft
} from 'lucide-react';
import { UnimarSymbolIcon } from '../UnimarSymbolIcon';
import { PageView } from '../../types';

export type AdminTab = 'metas' | 'auditoria' | 'auditoria-ia' | 'checkin';

interface AdminSidebarProps {
  activeTab: AdminTab;
  onTabChange: (tab: AdminTab) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  pendingCount: number;
  onNavigate?: (view: PageView) => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  activeTab,
  onTabChange,
  collapsed,
  onToggleCollapse,
  pendingCount,
  onNavigate,
}) => {
  const navItems = [
    {
      id: 'metas' as AdminTab,
      label: 'Visão Geral e Metas',
      shortLabel: 'Metas',
      icon: BarChart3,
      badge: null,
      badgeColor: '',
      description: 'Acompanhamento diário e teto CAC'
    },
    {
      id: 'auditoria-ia' as AdminTab,
      label: 'Auditoria IA (Visão NFs)',
      shortLabel: 'Auditoria IA',
      icon: Sparkles,
      badge: null,
      badgeColor: '',
      description: 'Leitura de NFs & CNPJ por IA'
    },
    {
      id: 'auditoria' as AdminTab,
      label: 'Auditoria de Mídias',
      shortLabel: 'Auditoria',
      icon: FileCheck2,
      badge: pendingCount > 0 ? pendingCount : null,
      badgeColor: 'bg-[#D97706] text-white',
      description: 'Conciliação de NFs e comprovantes'
    },
    {
      id: 'checkin' as AdminTab,
      label: 'Check-in Geral por Módulo',
      shortLabel: 'Check-in',
      icon: ClipboardCheck,
      badge: null,
      badgeColor: '',
      description: 'Painel de conferência por módulo'
    },
  ];

  return (
    <aside 
      className={`bg-[#003366] text-white flex flex-col transition-all duration-300 ease-in-out shrink-0 relative z-20 border-r border-[#002244] ${
        collapsed ? 'w-16' : 'w-70 sm:w-72'
      }`}
    >
      {/* Botão Flutuante de Alternar Expansão/Recolhimento acoplado na borda lateral */}
      <button
        type="button"
        onClick={onToggleCollapse}
        className="hidden md:flex absolute -right-3 top-4 z-30 w-7 h-7 rounded-full bg-white text-slate-700 border border-slate-200 shadow-md items-center justify-center transition-all duration-200 active:scale-95 cursor-pointer hover:bg-slate-50 hover:text-slate-900 hover:shadow-lg"
        title={collapsed ? "Expandir Menu" : "Recolher Menu"}
      >
        {collapsed ? <ChevronRight className="w-4 h-4 text-slate-600" /> : <ChevronLeft className="w-4 h-4 text-slate-600" />}
      </button>

      {/* Topo: Botão Voltar ao Menu Inicial (Apenas no estado expandido) */}
      <div className={`h-14 flex items-center border-b border-white/10 bg-[#00264d] ${collapsed ? 'justify-center px-0' : 'justify-start px-4'}`}>
        {!collapsed && onNavigate && (
          <button
            type="button"
            onClick={() => onNavigate('home')}
            className="flex items-center gap-1.5 rounded-lg text-xs font-medium text-sky-200 hover:text-white bg-transparent hover:bg-sky-900/50 border border-white/10 px-3 py-1.5 justify-start transition-all cursor-pointer active:scale-95 w-auto"
            title="Voltar ao menu inicial"
          >
            <ArrowLeft className="w-4 h-4 text-[#5bd5ff] shrink-0" />
            <span>Voltar</span>
          </button>
        )}
      </div>

      {/* Centro: Itens de Navegação Agrupados */}
      <nav className={`p-3 space-y-2 flex-grow overflow-y-auto overflow-x-hidden custom-scrollbar ${collapsed ? 'flex flex-col items-center px-1.5' : ''}`}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          if (collapsed) {
            return (
              <div key={item.id} className="relative group w-full flex justify-center">
                <button
                  type="button"
                  onClick={() => onTabChange(item.id)}
                  className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all cursor-pointer relative ${
                    isActive
                      ? 'bg-white/20 text-white border border-white/30 shadow-xs'
                      : 'text-sky-100/80 hover:bg-white/10 hover:text-white border border-transparent'
                  }`}
                >
                  <Icon className="w-5 h-5 shrink-0" />

                  {item.badge !== null && (
                    <span 
                      className={`absolute -top-1 -right-1 px-1.5 py-0.2 rounded-full text-[9px] font-bold shadow-xs ${item.badgeColor || 'bg-[#D97706] text-white'}`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>

                {/* Tooltip Lateral */}
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none absolute left-full ml-3 px-3 py-1.5 bg-slate-900/95 text-white text-xs font-semibold rounded-lg shadow-xl whitespace-nowrap z-50 flex items-center gap-2 border border-slate-700/50">
                  <span>{item.label}</span>
                  {item.badge !== null && (
                    <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${item.badgeColor || 'bg-[#D97706] text-white'}`}>
                      {item.badge}
                    </span>
                  )}
                </div>
              </div>
            );
          }

          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-start gap-3 p-3 rounded-xl transition-all cursor-pointer relative group text-left ${
                isActive
                  ? 'bg-white/15 text-white border border-white/20 shadow-xs'
                  : 'text-sky-100/80 hover:bg-white/5 hover:text-white border border-transparent'
              }`}
            >
              <div className={`p-1.5 rounded-lg shrink-0 mt-0.5 ${isActive ? 'bg-sky-400/20 text-white' : 'bg-white/5 text-sky-200 group-hover:text-white group-hover:bg-white/10'}`}>
                <Icon className="w-4 h-4" />
              </div>
              
              <div className="flex-grow min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <span className="text-xs font-semibold text-white leading-tight">{item.label}</span>
                  {item.badge !== null && (
                    <span 
                      className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold shrink-0 ${item.badgeColor || 'bg-[#D97706] text-white'}`}
                    >
                      {item.badge}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-300 font-normal leading-tight mt-1">
                  {item.description}
                </p>
              </div>
            </button>
          );
        })}
      </nav>

      {/* Parte Inferior: Rodapé Corporativo Compacto */}
      <div className={`mt-auto border-t border-white/10 bg-[#00264d]/80 ${collapsed ? 'p-2.5 flex justify-center' : 'p-4'}`}>
        {!collapsed ? (
          <div className="flex items-start gap-2.5">
            <UnimarSymbolIcon className="w-5 h-5 text-white shrink-0 mt-0.5 inline-block" />
            <div className="flex flex-col">
              <span className="text-sm font-bold text-white leading-tight">
                Unimar EAD • Gestão Mídia
              </span>
              <span className="text-xs text-slate-300 opacity-75 leading-tight mt-0.5">
                Sistema de Auditoria e Conciliação
              </span>
            </div>
          </div>
        ) : (
          <div className="relative group flex justify-center max-w-full">
            <div className="w-9 h-9 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center text-white shrink-0 hover:bg-white/20 transition-all cursor-default mx-auto">
              <UnimarSymbolIcon className="w-4.5 h-4.5 text-white shrink-0 inline-block" />
            </div>

            {/* Tooltip do Rodapé */}
            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none absolute left-full ml-3 px-3 py-1.5 bg-slate-900/95 text-white text-xs font-semibold rounded-lg shadow-xl whitespace-nowrap z-50 border border-slate-700/50">
              Unimar EAD • Gestão Mídia
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
