import React from 'react';
import { PageView } from '../../types';
import { UnimarLogo } from '../UnimarLogo';

interface AdminHeaderProps {
  authenticatedEmail?: string | null;
  onNavigate?: (view: PageView) => void;
  onResetData?: () => void;
}

export const AdminHeader: React.FC<AdminHeaderProps> = () => {
  return (
    <header className="h-[96px] min-h-[96px] bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-start shrink-0 z-10 shadow-xs overflow-visible">
      {/* Logotipo Unimar + Título & Subtítulo */}
      <div className="flex items-center gap-4 overflow-visible w-auto shrink-0" style={{ width: 'fit-content', overflow: 'visible' }}>
        <UnimarLogo colorMode="blue" height={44} />
        <div className="border-l border-slate-200 pl-4 flex flex-col justify-center">
          <h1 className="text-sm sm:text-base font-bold text-[#003366] leading-tight tracking-tight">
            Painel Executivo de Auditoria & Conciliação
          </h1>
          <p className="text-[11px] text-slate-500 font-medium hidden sm:block">
            Gestão Integrada de Verbas, Metas e Comprovantes de Mídia
          </p>
        </div>
      </div>
    </header>
  );
};

