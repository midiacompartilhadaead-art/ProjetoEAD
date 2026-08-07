import React, { useState, useEffect, useRef } from 'react';
import { useMsal } from '@azure/msal-react';
import { loginRequest } from '../msalConfig';
import { PageView } from '../types';
import { ArrowLeft, BookOpen, Send, User, ChevronDown, ShieldCheck, CheckCircle2, LogOut } from 'lucide-react';
import { UnimarLogo } from './UnimarLogo';
import { isUserAdmin } from '../config/permissions';

/**
 * Propriedades do componente Header
 */
interface HeaderProps {
  currentView: PageView;
  onNavigate: (view: PageView) => void;
  authenticatedEmail?: string | null;
}

/**
 * Função utilitária para extrair as iniciais do nome do usuário para o avatar
 */
function getInitials(name: string): string {
  if (!name) return 'GU';
  const cleanName = name.replace(/[^a-zA-ZÀ-ÿ\s]/g, '').trim();
  if (!cleanName) return 'GU';
  const parts = cleanName.split(/\s+/);
  if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * Função utilitária para formatar o nome de exibição do usuário a partir do e-mail/nome retornado pelo AD/Microsoft 365
 */
function formatDisplayName(rawName: string | undefined, email: string | null | undefined): string {
  if (rawName && rawName.trim() && !rawName.includes('@')) {
    return rawName.trim();
  }
  const emailToUse = email || rawName;
  if (!emailToUse) return 'Gestor Unimar';
  const localPart = emailToUse.split('@')[0];
  if (localPart === 'midiacompartilhada.ead') return 'Gestor Mídia Compartilhada';
  
  return localPart
    .replace(/[._]/g, ' ')
    .split(' ')
    .map(p => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase())
    .join(' ');
}

/**
 * Componente principal do Cabeçalho (Header) do Portal do Gestor de Polo Unimar
 */
export const Header: React.FC<HeaderProps> = ({ 
  currentView, 
  onNavigate,
  authenticatedEmail
}) => {
  // Hook de autenticação do Microsoft MSAL
  const { instance, accounts } = useMsal();
  const activeAccount = accounts.length > 0 ? accounts[0] : null;

  // Resolução dos dados de usuário e permissões
  const userEmail = activeAccount?.username || authenticatedEmail || 'midiacompartilhada.ead@unimar.br';
  const rawName = activeAccount?.name || activeAccount?.username;
  const displayName = formatDisplayName(rawName, userEmail);
  const initials = getInitials(displayName);

  // Estados locais do componente
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Validação de permissões de administrador
  const isAuthorizedAdmin = isUserAdmin(userEmail);

  // Click outside listener para fechar o popover do perfil automaticamente
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  // Função para realizar o encerramento de sessão (Logout)
  const handleLogout = async () => {
    setIsDropdownOpen(false);
    if (activeAccount) {
      try {
        await instance.logoutRedirect({
          account: activeAccount,
          postLogoutRedirectUri: window.location.origin,
        });
      } catch (e) {
        console.warn("logoutRedirect failed, trying logoutPopup...", e);
        try {
          await instance.logoutPopup({
            account: activeAccount,
            postLogoutRedirectUri: window.location.origin,
          });
          window.location.reload();
        } catch (popupErr) {
          console.error("logoutPopup failed, reloading page...", popupErr);
          window.location.reload();
        }
      }
    } else {
      window.location.reload();
    }
  };

  // Effect para buscar foto de perfil do usuário via Microsoft Graph API
  useEffect(() => {
    let isMounted = true;
    if (activeAccount) {
      instance.acquireTokenSilent({
        ...loginRequest,
        account: activeAccount
      }).then(async (response) => {
        if (!response?.accessToken) return;
        try {
          const photoResponse = await fetch('https://graph.microsoft.com/v1.0/me/photo/$value', {
            headers: {
              Authorization: `Bearer ${response.accessToken}`
            }
          });
          if (photoResponse.ok) {
            const blob = await photoResponse.blob();
            const url = URL.createObjectURL(blob);
            if (isMounted) setPhotoUrl(url);
          }
        } catch (err) {
          // Graceful fallback to initials avatar
        }
      }).catch(() => {
        // Fallback if token silent request is unfulfilled
      });
    }
    return () => {
      isMounted = false;
    };
  }, [instance, activeAccount]);

  return (
    <header className="fixed top-0 left-0 right-0 h-[96px] min-h-[96px] bg-[#003b70] z-50 flex items-center justify-between px-4 sm:px-8 border-b-2 border-[#00a9e8] shadow-xl relative overflow-visible">
      {/* LADO ESQUERDO: Botões de Navegação e Ações Rápidas (Exibidos APENAS fora da Home) */}
      <div className="flex items-center gap-2 sm:gap-3 z-10 min-w-0">
        {currentView !== 'home' && (
          <>
            <button
              onClick={() => onNavigate('home')}
              className="flex items-center gap-1.5 text-white/80 hover:text-white hover:bg-white/5 font-semibold text-xs sm:text-sm px-2.5 py-1.5 rounded-lg transition-all active:scale-95 cursor-pointer shrink-0"
              title="Voltar ao menu inicial"
            >
              <ArrowLeft className="w-4 h-4 text-[#5bd5ff]" />
              <span className="hidden sm:inline">Menu Inicial</span>
            </button>

            <nav className="flex items-center gap-1 sm:gap-2">
              <button
                onClick={() => onNavigate('training')}
                className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  currentView === 'training'
                    ? 'bg-sky-500/20 text-white font-extrabold'
                    : 'text-white/75 hover:text-white hover:bg-white/5 font-semibold'
                }`}
                title="Ir para Guia de Mídia"
              >
                <BookOpen className="w-3.5 h-3.5 text-[#5bd5ff]" />
                <span className="hidden md:inline">Guia de Mídia</span>
              </button>

              <button
                onClick={() => onNavigate('upload')}
                className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  currentView === 'upload'
                    ? 'bg-sky-500/20 text-white font-extrabold'
                    : 'text-white/75 hover:text-white hover:bg-white/5 font-semibold'
                }`}
                title="Ir para Enviar Documentos"
              >
                <Send className="w-3.5 h-3.5 text-[#5bd5ff]" />
                <span className="hidden md:inline">Enviar Documentos</span>
              </button>

              {isAuthorizedAdmin && (
                <button
                  onClick={() => onNavigate('admin')}
                  className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    currentView === 'admin'
                      ? 'bg-sky-500/20 text-white font-extrabold'
                      : 'text-white/75 hover:text-white hover:bg-white/5 font-semibold'
                  }`}
                  title="Acessar Painel Administrativo de Auditoria"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-[#5bd5ff]" />
                  <span className="hidden md:inline">Painel Admin</span>
                </button>
              )}
            </nav>
          </>
        )}
      </div>

      {/* CENTRO EXATO: Logotipo Monocromático da Unimar */}
      <div 
        className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center cursor-pointer group transition-transform hover:scale-105 z-10 hidden sm:flex overflow-visible w-auto shrink-0"
        style={{ width: 'fit-content', overflow: 'visible' }}
        onClick={() => onNavigate('home')}
        title="Universidade de Marília - Ir para o início"
      >
        <UnimarLogo colorMode="white" />
      </div>

      {/* LADO DIREITO: Identificação do Portal + Widget de Perfil do Usuário */}
      <div className="flex items-center gap-3 sm:gap-4 z-10">
        {/* Identificação do Portal no Lado Direito */}
        <div 
          className="hidden lg:flex flex-col text-right cursor-pointer group pr-2 border-r border-white/15"
          onClick={() => onNavigate('home')}
        >
          <span className="text-white font-black text-xs tracking-wider uppercase">
            Mídia Compartilhada
          </span>
          <span className="text-[#5bd5ff] text-[9px] uppercase font-black tracking-widest">
            Portal do Gestor de Polo
          </span>
        </div>

        {/* Microsoft Profile & User Avatar Widget */}
        <div className="relative" ref={dropdownRef}>
          <button 
            type="button"
            onClick={() => setIsDropdownOpen(prev => !prev)}
            className="flex items-center gap-2.5 bg-white/10 hover:bg-white/20 border border-white/15 hover:border-white/30 px-3 py-1.5 rounded-full text-white shadow-2xs transition-all cursor-pointer active:scale-95"
            aria-label="Perfil do Usuário Autenticado"
            aria-expanded={isDropdownOpen}
          >
            {photoUrl ? (
              <img 
                src={photoUrl} 
                alt={displayName} 
                className="w-7 h-7 rounded-full object-cover border border-white/30 shrink-0 shadow-xs" 
              />
            ) : (
              <div className="w-7 h-7 rounded-full bg-[#002244] border border-white/25 flex items-center justify-center text-white font-black text-[11px] shrink-0 shadow-inner">
                {initials}
              </div>
            )}
            
            <span className="text-xs font-semibold text-white tracking-tight max-w-[110px] sm:max-w-[160px] truncate">
              {displayName}
            </span>

            <ChevronDown className={`w-3.5 h-3.5 text-sky-200 transition-transform duration-200 ml-0.5 ${isDropdownOpen ? 'rotate-180 text-white' : 'opacity-80'}`} />
          </button>

          {/* Popover / Dropdown com informações da conta */}
          {isDropdownOpen && (
            <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-2xl border border-slate-200/90 p-3.5 text-slate-800 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              {/* Topo do Card - Avatar, Nome, E-mail e Nível de Acesso */}
              <div className="flex items-start gap-3 border-b border-slate-100 pb-3">
                {photoUrl ? (
                  <img src={photoUrl} alt={displayName} className="w-10 h-10 rounded-full object-cover border border-slate-200 shrink-0 shadow-xs" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-[#003366] text-white flex items-center justify-center font-black text-xs shrink-0 border border-[#002244] shadow-xs">
                    {initials}
                  </div>
                )}
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-bold text-slate-900 truncate">{displayName}</span>
                  <span className="text-[11px] text-slate-500 font-normal truncate" title={userEmail}>
                    {userEmail}
                  </span>
                  <div className="mt-1.5 flex items-center">
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#0055A5] bg-sky-50 px-2 py-0.5 rounded-md border border-sky-100/80">
                      {isAuthorizedAdmin && <ShieldCheck className="w-3 h-3 text-[#0055A5] shrink-0" />}
                      <span>{isAuthorizedAdmin ? 'Gestor Auditor' : 'Gestor de Polo'}</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Botão Sair da Conta (Item de lista limpo e minimalista) */}
              <div className="pt-1.5">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 py-2 px-2.5 rounded-lg text-xs font-semibold text-slate-700 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer group"
                >
                  <LogOut className="w-4 h-4 text-slate-400 group-hover:text-red-600 transition-colors" />
                  <span>Sair da Conta</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};


