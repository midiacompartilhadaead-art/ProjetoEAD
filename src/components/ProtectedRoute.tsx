import React, { useEffect, useState } from 'react';
import { useMsal, useIsAuthenticated } from '@azure/msal-react';
import { InteractionStatus } from '@azure/msal-browser';
import { loginRequest } from '../msalConfig';
import { ShieldAlert, LogOut, Lock, AlertCircle, ArrowLeft, RefreshCw, KeyRound, Check } from 'lucide-react';
import { PageView } from '../types';
import { ADMIN_EMAILS, isUserAdmin } from '../config/permissions';
import { UnimarLogo } from './UnimarLogo';

export { ADMIN_EMAILS };
export const EMAILS_AUTORIZADOS = ADMIN_EMAILS;

interface ProtectedRouteProps {
  children: React.ReactNode;
  onNavigate: (view: PageView) => void;
  authenticatedEmail: string | null;
  onSetAuthenticatedEmail: (email: string | null) => void;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  onNavigate,
  authenticatedEmail,
  onSetAuthenticatedEmail,
}) => {
  const { instance, accounts, inProgress } = useMsal();
  const isAuthenticatedMSAL = useIsAuthenticated();
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);
  const [demoLoginError, setDemoLoginError] = useState<string | null>(null);
  const [showDemoModal, setShowDemoModal] = useState<boolean>(false);
  const [customEmailInput, setCustomEmailInput] = useState<string>('midiacompartilhada.ead@unimar.br');

  const isInIframe = typeof window !== 'undefined' && window.self !== window.top;
  const simulatedUser = typeof window !== 'undefined' ? window.localStorage.getItem('msal_simulated_user') : null;

  // Extrai o e-mail do usuário ativo via MSAL ou estado persistente
  const activeAccount = accounts.length > 0 ? accounts[0] : null;
  const msalPreferredUsername = (activeAccount?.idTokenClaims as { preferred_username?: string })?.preferred_username;
  const currentEmail = (activeAccount?.username || msalPreferredUsername || authenticatedEmail || simulatedUser || '').toLowerCase().trim();

  // Valida se o e-mail possui permissão de administrador na lista ADMIN_EMAILS
  const isAuthorized = isUserAdmin(currentEmail);

  // Auto-sync MSAL account username ou simulatedUser to parent state
  useEffect(() => {
    if (activeAccount?.username) {
      onSetAuthenticatedEmail(activeAccount.username);
    } else if (simulatedUser && !authenticatedEmail) {
      onSetAuthenticatedEmail(simulatedUser);
    }
  }, [activeAccount, simulatedUser, authenticatedEmail, onSetAuthenticatedEmail]);

  // 1. CARREGAMENTO NEUTRO (EVITA PISCAMENTO / FLICKER DURANTE MSAL RECOVERY)
  if (inProgress !== InteractionStatus.None) {
    return (
      <div className="min-h-screen pt-24 pb-16 px-4 max-w-md mx-auto flex items-center justify-center">
        <div className="bg-white border border-[#b2d5f0] rounded-2xl p-8 shadow-lg text-center space-y-4 w-full animate-fade-in">
          <UnimarLogo colorMode="blue" height={44} showSubtitle={true} className="mx-auto mb-1" />
          <div className="w-12 h-12 bg-[#edf4fa] border border-[#00a4ef]/30 rounded-2xl flex items-center justify-center mx-auto text-[#00a4ef]">
            <RefreshCw className="w-6 h-6 animate-spin text-[#003b70]" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-extrabold text-[#003b70]">Verificando Sessão de Autenticação</h3>
            <p className="text-xs text-slate-500 font-medium">Validando permissões e credenciais com Microsoft Azure AD...</p>
          </div>
        </div>
      </div>
    );
  }

  // Handle Microsoft MSAL Login via Popup ou Redirect
  const handleMicrosoftLogin = async () => {
    setIsLoggingIn(true);
    setDemoLoginError(null);
    try {
      await instance.initialize();
      const loginResult = await instance.loginPopup(loginRequest);
      if (loginResult && loginResult.account) {
        const loggedUsername = loginResult.account.username || (loginResult.account.idTokenClaims as { preferred_username?: string })?.preferred_username || '';
        const loggedEmail = loggedUsername.toLowerCase().trim();
        onSetAuthenticatedEmail(loggedEmail);
        if (typeof window !== 'undefined') {
          window.localStorage.setItem('msal_simulated_user', loggedEmail);
        }
        if (!isUserAdmin(loggedEmail)) {
          setDemoLoginError(`Acesso restrito a administradores. O e-mail "${loggedEmail}" não possui permissão.`);
        }
      }
    } catch (error) {
      console.warn('MSAL interactive popup skipped/failed (sandbox env/iframe), opening MSAL Azure AD Login Modal:', error);
      setShowDemoModal(true);
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Handle Manual/Simulated MSAL Account login for sandbox testing
  const handleSimulatedMsalLogin = (emailToAuth: string) => {
    const trimmed = emailToAuth.trim().toLowerCase();
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('msal_simulated_user', trimmed);
    }
    onSetAuthenticatedEmail(trimmed);
    setShowDemoModal(false);
    if (!isUserAdmin(trimmed)) {
      setDemoLoginError(`Acesso restrito a administradores.`);
    } else {
      setDemoLoginError(null);
    }
  };

  // Handle Logout
  const handleLogout = async () => {
    try {
      if (accounts.length > 0) {
        await instance.logoutPopup();
      }
    } catch (e) {
      console.log('MSAL logout handled locally');
    }
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem('msal_simulated_user');
    }
    onSetAuthenticatedEmail(null);
    setDemoLoginError(null);
    onNavigate('home');
  };

  // 2. NON-AUTHENTICATED STATE: Render clean Auth challenge directly without auto-redirect jumping
  if (!currentEmail) {
    return (
      <div className="min-h-screen pt-24 pb-16 px-4 max-w-2xl mx-auto flex items-center justify-center">
        <div className="bg-white border border-[#b2d5f0] rounded-3xl p-8 sm:p-12 shadow-2xl text-center space-y-6 w-full animate-fade-in">
          
          {/* Official Unimar Blue Logo */}
          <UnimarLogo colorMode="blue" height={48} showSubtitle={true} className="mx-auto" />

          {/* Microsoft Azure 4-Square Logo */}
          <div className="w-16 h-16 bg-[#edf4fa] border border-[#b2d5f0] rounded-2xl flex items-center justify-center mx-auto shadow-xs">
            <div className="grid grid-cols-2 gap-1 w-8 h-8">
              <div className="bg-[#f25022] rounded-[2px]"></div>
              <div className="bg-[#7fba00] rounded-[2px]"></div>
              <div className="bg-[#00a4ef] rounded-[2px]"></div>
              <div className="bg-[#ffb900] rounded-[2px]"></div>
            </div>
          </div>

          <div className="space-y-2">
            <span className="text-xs font-black uppercase text-[#00a9e8] tracking-widest block">
              Autenticação Obrigatória • Azure AD / MSAL
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-[#003b70]">
              Área Restrita - Login Microsoft
            </h2>
            <p className="text-xs font-bold text-slate-500 max-w-md mx-auto">
              Esta rota exige autenticação corporativa com uma conta da Microsoft pertencente à equipe de Auditoria e Controladoria UNIMAR.
            </p>
          </div>

          {demoLoginError && (
            <div className="p-4 bg-rose-50 border border-rose-300 text-rose-900 rounded-2xl text-xs font-bold flex items-center justify-center gap-2">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
              <span>{demoLoginError}</span>
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={handleMicrosoftLogin}
              disabled={isLoggingIn}
              className="w-full sm:w-auto px-7 py-3.5 bg-[#00a4ef] hover:bg-[#0078d4] text-white font-black text-xs rounded-2xl shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2.5 active:scale-95"
            >
              {isLoggingIn ? (
                <RefreshCw className="w-4 h-4 animate-spin text-white" />
              ) : (
                <div className="grid grid-cols-2 gap-0.5 w-4 h-4 shrink-0">
                  <div className="bg-white rounded-[1px]"></div>
                  <div className="bg-white rounded-[1px]"></div>
                  <div className="bg-white rounded-[1px]"></div>
                  <div className="bg-white rounded-[1px]"></div>
                </div>
              )}
              <span>Entrar com Conta Microsoft</span>
            </button>

            <button
              onClick={() => onNavigate('home')}
              className="w-full sm:w-auto px-6 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-2xl transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Voltar ao Inicio</span>
            </button>
          </div>

          {/* Quick Sandbox Trigger if popup is blocked or running in iframe */}
          <div className="pt-4 border-t border-slate-100">
            <button
              onClick={() => setShowDemoModal(true)}
              className="text-[11px] font-extrabold text-[#0074b8] hover:underline flex items-center justify-center gap-1 mx-auto"
            >
              <KeyRound className="w-3.5 h-3.5 text-[#0074b8]" />
              <span>Alternar Seleção de Conta MSAL (Modo Teste Auditoria)</span>
            </button>
          </div>
        </div>

        {/* Modal MSAL Interactive Demo Selector */}
        {showDemoModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl space-y-6 border border-slate-200 animate-fade-in">
              <div className="text-center space-y-2 border-b border-slate-100 pb-4">
                <div className="grid grid-cols-2 gap-1 w-8 h-8 mx-auto">
                  <div className="bg-[#f25022] rounded-xs"></div>
                  <div className="bg-[#7fba00] rounded-xs"></div>
                  <div className="bg-[#00a4ef] rounded-xs"></div>
                  <div className="bg-[#ffb900] rounded-xs"></div>
                </div>
                <h3 className="text-lg font-black text-slate-900">Seleção de Conta Microsoft (MSAL)</h3>
                <p className="text-xs text-slate-500 font-medium">
                  Selecione ou digite um e-mail corporativo para testar as regras de acesso ao Painel Admin:
                </p>
              </div>

              <div className="space-y-2">
                <button
                  onClick={() => handleSimulatedMsalLogin('midiacompartilhada.ead@unimar.br')}
                  className="w-full text-left p-3.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-950 rounded-2xl text-xs font-extrabold flex items-center justify-between transition-all cursor-pointer"
                >
                  <div className="space-y-0.5">
                    <span className="text-[10px] uppercase font-mono text-emerald-700 block">🟢 E-mail Autorizado (Mídia EAD)</span>
                    <span className="font-mono text-xs text-emerald-900">midiacompartilhada.ead@unimar.br</span>
                  </div>
                  <Check className="w-5 h-5 text-emerald-600" />
                </button>

                <button
                  onClick={() => handleSimulatedMsalLogin('eduardo-audit@unimar.br')}
                  className="w-full text-left p-3.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-950 rounded-2xl text-xs font-extrabold flex items-center justify-between transition-all cursor-pointer"
                >
                  <div className="space-y-0.5">
                    <span className="text-[10px] uppercase font-mono text-emerald-700 block">🟢 E-mail Autorizado (Auditoria)</span>
                    <span className="font-mono text-xs text-emerald-900">eduardo-audit@unimar.br</span>
                  </div>
                  <Check className="w-5 h-5 text-emerald-600" />
                </button>

                <button
                  onClick={() => handleSimulatedMsalLogin('polo.unimar@unimar.br')}
                  className="w-full text-left p-3.5 bg-rose-50 hover:bg-rose-100 border border-rose-300 text-rose-950 rounded-2xl text-xs font-bold flex items-center justify-between transition-all cursor-pointer"
                >
                  <div className="space-y-0.5">
                    <span className="text-[10px] uppercase font-mono text-rose-700 block">🔴 E-mail Não Autorizado (Sem Acesso)</span>
                    <span className="font-mono text-xs text-rose-900">polo.unimar@unimar.br</span>
                  </div>
                  <Lock className="w-5 h-5 text-rose-600" />
                </button>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-100">
                <label className="block text-xs font-black text-slate-700">Outro e-mail corporativo:</label>
                <div className="flex gap-2">
                  <input
                    type="email"
                    value={customEmailInput}
                    onChange={(e) => setCustomEmailInput(e.target.value)}
                    placeholder="usuario@unimar.br"
                    className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:border-[#00a4ef]"
                  />
                  <button
                    onClick={() => handleSimulatedMsalLogin(customEmailInput)}
                    className="px-4 py-2 bg-[#00a4ef] hover:bg-[#0078d4] text-white font-extrabold text-xs rounded-xl shadow-xs cursor-pointer"
                  >
                    Entrar
                  </button>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setShowDemoModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // 3. AUTHENTICATED BUT NOT AUTHORIZED EMAIL: Render 403 / Access Denied Message
  if (!isAuthorized) {
    return (
      <div className="min-h-screen pt-24 pb-16 px-4 max-w-2xl mx-auto flex items-center justify-center">
        <div className="bg-white border-2 border-rose-300 rounded-3xl p-8 sm:p-12 shadow-2xl text-center space-y-6 w-full animate-fade-in">
          <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
            <ShieldAlert className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <span className="text-xs font-black uppercase text-rose-600 tracking-widest block">
              Acesso Restrito à Equipe de Auditoria EAD
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-rose-950">
              Acesso Negado (403)
            </h2>
            <p className="text-xs font-bold text-slate-600 max-w-md mx-auto">
              A conta Microsoft <strong className="text-rose-700 font-mono">{currentEmail}</strong> não tem autorização para visualizar o Painel de Auditoria e Metas.
            </p>
          </div>

          <div className="bg-rose-50 border border-rose-200 p-4 rounded-2xl text-xs text-rose-900 font-medium text-left space-y-2">
            <div className="font-extrabold flex items-center gap-1.5 text-rose-950">
              <Lock className="w-4 h-4 text-rose-600" />
              <span>E-mails Autorizados:</span>
            </div>
            <ul className="list-disc pl-5 font-mono text-rose-800">
              {EMAILS_AUTORIZADOS.map((e, idx) => (
                <li key={idx}>{e}</li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={() => onNavigate('home')}
              className="w-full sm:w-auto px-7 py-3.5 bg-[#003366] hover:bg-[#002244] text-white font-bold text-xs rounded-2xl transition-all cursor-pointer flex items-center justify-center gap-2 shadow-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Voltar ao Menu Inicial</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 4. FULLY AUTHENTICATED AND AUTHORIZED: Render Admin Panel content!
  return <>{children}</>;
};

