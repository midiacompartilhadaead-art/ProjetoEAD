import React, { useState, useEffect } from 'react';
import { MsalAuthenticationTemplate, useMsal } from '@azure/msal-react';
import { InteractionType, InteractionStatus } from '@azure/msal-browser';
import { loginRequest } from './msalConfig';
import { PageView, SubmissaoComprovante, StatusAuditoria } from './types';
import { Header } from './components/Header';
import { HomePage } from './components/HomePage';
import { TrainingPage } from './components/TrainingPage';
import { UploadPage } from './components/UploadPage';
import { AdminPage } from './components/AdminPage';
import { ProtectedRoute } from './components/ProtectedRoute';
import { FloatingChat } from './components/FloatingChat';
import { WhatsAppButton } from './components/WhatsAppButton';
import { UnimarLogo } from './components/UnimarLogo';
import { Toast } from './components/common/Toast';
import { RefreshCw, KeyRound, AlertCircle } from 'lucide-react';

/**
 * Base de dados inicial mockada de submissões de comprovantes fiscais
 */
const INITIAL_SUBMISSOES: SubmissaoComprovante[] = [
  {
    id: 'sub-1',
    protocolo: 'AUD-772351',
    polo: 'Marília',
    categoria: 'Tráfego Pago (Facebook/Google Ads)',
    modulo: 'Módulo 1',
    dataEnvio: '02/08/2026 14:30',
    arquivosCount: 2,
    arquivosNomes: ['NotaFiscal_Meta_Ads_Julho.pdf', 'Relatorio_Campanha_Marilia.pdf'],
    observacoes: 'Comprovantes relativos aos anúncios da campanha de Módulo 1.',
    valorTotal: 3450.00,
    status: 'Aprovado / Feito',
    observacaoInterna: 'Auditoria concluída e Nota Fiscal validada.'
  },
  {
    id: 'sub-2',
    protocolo: 'AUD-884120',
    polo: 'Bauru',
    categoria: 'Mídia Tradicional (Rádio/TV/Outdoor)',
    modulo: 'Módulo 2',
    dataEnvio: '01/08/2026 10:15',
    arquivosCount: 1,
    arquivosNomes: ['NF_Outdoor_Av_Getulio_Vargas.pdf'],
    observacoes: 'Veiculação em outdoors no Módulo 2.',
    valorTotal: 1800.00,
    status: 'Aguardando / Em Análise',
    observacaoInterna: 'Aguardando envio do relatório fotográfico dos outdoors.'
  },
  {
    id: 'sub-3',
    protocolo: 'AUD-653902',
    polo: 'Campinas',
    categoria: 'Agência / Prestador de Serviço',
    modulo: 'Módulo 1',
    dataEnvio: '28/07/2026 16:45',
    arquivosCount: 3,
    arquivosNomes: ['Fatura_Agencia_Criacao.pdf', 'Relatorio_Clipping_Campinas.pdf', 'Comprovante_PIX_Pagamento.pdf'],
    observacoes: 'Serviços de criação de artes e gestão de mídias.',
    valorTotal: 2900.00,
    status: 'Errado / Com Pendência',
    observacaoInterna: 'Faltou o comprovante de pagamento da NF emitida.'
  }
];

/**
 * Componente Handler para gerenciamento de redirecionamento e login manual em cenários não autenticados
 */
function UnauthenticatedRedirectHandler({ errorMessage, isInIframe: propsIsInIframe }: { errorMessage?: string; isInIframe?: boolean }) {
  const { instance, accounts, inProgress } = useMsal();
  const [redirectError, setRedirectError] = useState<string | null>(errorMessage || null);
  const isInIframe = propsIsInIframe ?? (typeof window !== 'undefined' && window.self !== window.top);

  // Efeito para tentar loginRedirect automático fora de iFrames
  useEffect(() => {
    // Apenas fora de iFrame tenta acionar loginRedirect de forma automática sem poluir a tela com erros precipitados
    if (!isInIframe && accounts.length === 0 && inProgress === InteractionStatus.None) {
      instance.initialize().then(() => {
        instance.loginRedirect(loginRequest).catch((err) => {
          console.warn("MSAL redirect inicializado / ambiente restrito:", err);
          setRedirectError("Redirecionamento do Azure AD bloqueado pelo navegador ou ambiente de desenvolvimento.");
        });
      }).catch((err) => {
        console.warn("MSAL initialization error:", err);
      });
    }
  }, [instance, accounts, inProgress, isInIframe]);

  // Handler de login acionado pelo botão manual
  const handleManualLogin = async () => {
    try {
      await instance.initialize();
      if (isInIframe) {
        await instance.loginPopup(loginRequest);
      } else {
        await instance.loginRedirect(loginRequest);
      }
    } catch (e: any) {
      console.warn("Manual login error:", e);
      setRedirectError(e?.errorMessage || e?.message || "Erro ao realizar autenticação com a Microsoft.");
    }
  };

  const handleOpenNewTab = () => {
    window.open(window.location.href, '_blank');
  };

  const handleSimulateLocalUser = () => {
    window.localStorage.setItem('msal_simulated_user', 'midiacompartilhada.ead@unimar.br');
    window.location.reload();
  };

  if (inProgress !== InteractionStatus.None) {
    return <MsalLoadingComponent />;
  }

  return (
    <div className="notranslate min-h-screen bg-[#003b70] text-white flex flex-col items-center justify-center p-6 text-center space-y-6 animate-fade-in">
      {/* Unimar White Logo on Dark Blue Background */}
      <UnimarLogo colorMode="white" height={52} showSubtitle={true} className="shrink-0 mb-1 drop-shadow-md" />

      <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center border border-white/20 shadow-2xl backdrop-blur-md">
        <div className="grid grid-cols-2 gap-1.5 w-8 h-8">
          <div className="bg-[#f25022] rounded-xs"></div>
          <div className="bg-[#7fba00] rounded-xs"></div>
          <div className="bg-[#00a4ef] rounded-xs"></div>
          <div className="bg-[#ffb900] rounded-xs"></div>
        </div>
      </div>

      <div className="space-y-2 max-w-lg">
        <span className="text-xs font-black uppercase text-[#5bd5ff] tracking-widest block">
          Autenticação Corporativa • Microsoft Azure AD
        </span>
        <h1 className="text-2xl sm:text-3xl font-black">
          {isInIframe ? 'Acesso Restrito - Login Microsoft' : 'Redirecionando para Login da Microsoft...'}
        </h1>
        <p className="text-xs sm:text-sm text-sky-100 font-medium leading-relaxed">
          {isInIframe 
            ? 'Para acessar o sistema dentro do visualizador ou ambiente seguro, selecione uma opção abaixo:'
            : 'O acesso exige autenticação corporativa válida no login.microsoftonline.com.'}
        </p>
      </div>

      {redirectError && (
        <div className="p-4 bg-rose-500/20 border border-rose-400/40 text-rose-200 rounded-2xl text-xs font-bold max-w-md flex items-center gap-2 text-left">
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
          <span>{redirectError}</span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        <button
          onClick={handleManualLogin}
          className="px-6 py-3.5 bg-[#00a4ef] hover:bg-[#0078d4] text-white font-black text-xs rounded-2xl shadow-xl transition-all cursor-pointer flex items-center justify-center gap-2.5 active:scale-95"
        >
          <RefreshCw className="w-4 h-4 text-white" />
          <span>Entrar com Conta Microsoft ({isInIframe ? 'Pop-up' : 'Redirecionamento'})</span>
        </button>

        {isInIframe && (
          <button
            onClick={handleOpenNewTab}
            className="px-6 py-3.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-black text-xs rounded-2xl shadow-xl transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-95"
          >
            <span>Abrir em Nova Aba</span>
          </button>
        )}
      </div>

      <div className="pt-6 border-t border-white/10 max-w-md w-full space-y-3">
        <p className="text-[11px] text-sky-200/80">
          Modo Teste / Sandbox para Auditoria UNIMAR:
        </p>
        <button
          onClick={handleSimulateLocalUser}
          className="w-full py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer"
        >
          <KeyRound className="w-4 h-4 text-[#5bd5ff]" />
          <span>Simular Sessão Microsoft (E-mail Auditoria UNIMAR)</span>
        </button>
      </div>
    </div>
  );
}

// Componente Principal da Aplicação Autenticada
function AuthenticatedMainApp() {
  const { accounts } = useMsal();
  const [currentView, setCurrentView] = useState<PageView>(() => {
    if (typeof window !== 'undefined' && window.history.state?.view) {
      return window.history.state.view;
    }
    return 'home';
  });
  const [submissoes, setSubmissoes] = useState<SubmissaoComprovante[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('unimar_admin_data');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) return parsed;
          if (parsed && Array.isArray(parsed.submissoes)) return parsed.submissoes;
        } catch (e) {
          console.error("Erro ao carregar unimar_admin_data do localStorage:", e);
        }
      }
      // Se a chave não existir no localStorage, inicializa com o array padrão imediatamente
      localStorage.setItem('unimar_admin_data', JSON.stringify(INITIAL_SUBMISSOES));
    }
    return INITIAL_SUBMISSOES;
  });

  // Atualização em tempo real no localStorage a cada alteração em submissoes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('unimar_admin_data', JSON.stringify(submissoes));
    }
  }, [submissoes]);

  const handleResetDefaultData = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('unimar_admin_data');
      localStorage.removeItem('unimar_admin_metas');
      localStorage.setItem('unimar_admin_data', JSON.stringify(INITIAL_SUBMISSOES));
    }
    setSubmissoes(INITIAL_SUBMISSOES);
  };
  
  // E-mail retornado pelo MSAL ou fallback mantido persistente
  const activeAccount = accounts.length > 0 ? accounts[0] : null;
  const simulatedUser = typeof window !== 'undefined' ? window.localStorage.getItem('msal_simulated_user') : null;
  const [authenticatedEmail, setAuthenticatedEmail] = useState<string | null>(
    activeAccount?.username || simulatedUser || 'midiacompartilhada.ead@unimar.br'
  );

  useEffect(() => {
    if (activeAccount?.username) {
      setAuthenticatedEmail(activeAccount.username);
    }
  }, [activeAccount]);

  // Sincronização com o histórico do navegador para suporte nativo ao botão "Voltar"
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Garante substituição do callback no histórico no primeiro render
      if (window.location.hash || window.location.search.includes("code=") || window.location.search.includes("state=")) {
        window.history.replaceState({ view: currentView }, document.title, window.location.pathname);
      } else if (!window.history.state?.view) {
        window.history.replaceState({ view: currentView }, document.title, window.location.pathname);
      }
    }

    const handlePopState = (event: PopStateEvent) => {
      if (event.state && event.state.view) {
        setCurrentView(event.state.view);
      } else {
        setCurrentView('home');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [currentView]);

  const handleNavigate = (view: PageView, replace: boolean = false) => {
    setCurrentView(view);
    if (typeof window !== 'undefined') {
      if (replace) {
        window.history.replaceState({ view }, document.title, window.location.pathname);
      } else {
        window.history.pushState({ view }, document.title, window.location.pathname);
      }
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Estado de Toast global
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleShowToast = (msg: string) => {
    setToastMessage(null);
    setTimeout(() => {
      setToastMessage(msg);
    }, 50);
  };

  const handleNovaSubmissao = (submissao: SubmissaoComprovante) => {
    setSubmissoes(prev => [submissao, ...prev]);
  };

  const handleUpdateSubmissaoStatus = (id: string, newStatus: StatusAuditoria, obsInterna?: string) => {
    setSubmissoes(prev => prev.map(sub => {
      if (sub.id === id) {
        return {
          ...sub,
          status: newStatus,
          observacaoInterna: obsInterna !== undefined ? obsInterna : sub.observacaoInterna
        };
      }
      return sub;
    }));
  };

  const handleDeleteSubmissao = (id: string) => {
    setSubmissoes(prev => prev.filter(sub => sub.id !== id));
  };

  const isAdminRoute = currentView === 'admin' || (typeof window !== 'undefined' && window.location.pathname.startsWith('/admin'));

  return (
    <div className="notranslate min-h-screen bg-[#f4f7fb] text-slate-900 font-sans relative overflow-x-hidden flex flex-col justify-between">
      {/* Background ambient lighting effects */}
      <div className="fixed -top-40 -right-40 w-[600px] h-[600px] bg-blue-100/40 rounded-full blur-[120px] pointer-events-none z-0" />
      <div className="fixed -bottom-40 -left-40 w-[500px] h-[500px] bg-sky-100/40 rounded-full blur-[120px] pointer-events-none z-0" />

      {/* Persistent Navigation Header (Oculto em /admin) */}
      {currentView !== 'admin' && (
        <Header 
          currentView={currentView} 
          onNavigate={(v) => handleNavigate(v)} 
          authenticatedEmail={authenticatedEmail}
        />
      )}

      {/* SPA View Switcher */}
      <main className="relative z-10 flex-grow">
        {currentView === 'home' && (
          <HomePage 
            onNavigate={(v) => handleNavigate(v)} 
            authenticatedEmail={authenticatedEmail}
          />
        )}

        {currentView === 'training' && (
          <TrainingPage onNavigate={(v) => handleNavigate(v)} />
        )}

        {currentView === 'upload' && (
          <UploadPage
            onNavigate={(v) => handleNavigate(v)}
            submissoesAnteriores={submissoes}
            onNovaSubmissao={handleNovaSubmissao}
            onShowToast={handleShowToast}
          />
        )}

        {currentView === 'admin' && (
          <ProtectedRoute
            onNavigate={(v) => handleNavigate(v)}
            authenticatedEmail={authenticatedEmail}
            onSetAuthenticatedEmail={setAuthenticatedEmail}
          >
            <AdminPage
              onNavigate={(v) => handleNavigate(v)}
              submissoes={submissoes}
              onUpdateSubmissaoStatus={handleUpdateSubmissaoStatus}
              onDeleteSubmissao={handleDeleteSubmissao}
              authenticatedEmail={authenticatedEmail}
              onResetDefaultData={handleResetDefaultData}
              onShowToast={handleShowToast}
            />
          </ProtectedRoute>
        )}
      </main>

      {/* Unimar Official Footer (Exibido nas páginas públicas/não-admin) */}
      {currentView !== 'admin' && (
        <footer className="relative z-10 bg-[#003b70] text-white py-10 px-6 border-t-4 border-[#00a9e8] text-xs">
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3 -ml-7 sm:-ml-12">
              <UnimarLogo colorMode="white" height={49} showSubtitle={false} className="shrink-0" />
              <span className="text-sky-200 text-xs font-bold border-l border-white/20 pl-3.5">
                Mídia Compartilhada • Procedimento Operacional
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-sky-100 font-bold">
              <button 
                onClick={() => handleNavigate('home')} 
                className={`hover:text-[#5bd5ff] transition-colors cursor-pointer ${currentView === 'home' ? 'text-[#5bd5ff] underline' : ''}`}
              >
                Menu Inicial
              </button>
              <span className="text-white/20">•</span>
              <button 
                onClick={() => handleNavigate('training')} 
                className={`hover:text-[#5bd5ff] transition-colors cursor-pointer ${currentView === 'training' ? 'text-[#5bd5ff] underline' : ''}`}
              >
                Guia de Mídia
              </button>
              <span className="text-white/20">•</span>
              <button 
                onClick={() => handleNavigate('upload')} 
                className={`hover:text-[#5bd5ff] transition-colors cursor-pointer ${currentView === 'upload' ? 'text-[#5bd5ff] underline' : ''}`}
              >
                Envio de Documentos
              </button>
            </div>

            <span className="text-sky-300/70 text-[11px]">
              © {new Date().getFullYear()} Universidade de Marília. Todos os direitos reservados.
            </span>
          </div>
        </footer>
      )}

      {/* Floating AI Chat Assistant & WhatsApp Support (Apenas em páginas públicas / de gestor) */}
      {!isAdminRoute && <FloatingChat />}
      {!isAdminRoute && <WhatsAppButton />}

      {/* Toast Feedback Notification Global */}
      <Toast message={toastMessage} onClose={() => setToastMessage(null)} />
    </div>
  );
}

function MsalErrorComponent({ error }: { error?: any }) {
  return <UnauthenticatedRedirectHandler errorMessage={error?.errorMessage || error?.message || "Erro de autenticação MSAL"} />;
}

function MsalLoadingComponent() {
  return (
    <div className="notranslate min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center space-y-4 animate-fade-in">
      <UnimarLogo colorMode="blue" height={48} showSubtitle={true} className="shrink-0 mb-1" />
      <div className="w-12 h-12 bg-[#003366]/10 text-[#003366] rounded-2xl flex items-center justify-center border border-[#003366]/20 shadow-xs">
        <RefreshCw className="w-6 h-6 animate-spin text-[#003366]" />
      </div>
      <div className="space-y-1">
        <p className="text-xs text-slate-500 font-medium">Verificando sessão e credenciais corporativas...</p>
      </div>
    </div>
  );
}

// Bloqueio de Raiz com suporte suave a MSAL, iFrame e Sessão Persistida
export default function App() {
  const { accounts, inProgress } = useMsal();
  const isInIframe = typeof window !== 'undefined' && window.self !== window.top;
  const simulatedUser = typeof window !== 'undefined' ? window.localStorage.getItem('msal_simulated_user') : null;

  // 1. Estado neutro de carregamento (evita o piscamento/flicker da tela de login azul durante a verificação do MSAL)
  if (inProgress !== InteractionStatus.None) {
    return <MsalLoadingComponent />;
  }

  // 2. Se o usuário já estiver autenticado no MSAL ou possuir sessão no localStorage, carrega a aplicação imediatamente
  if (accounts.length > 0 || simulatedUser) {
    return <AuthenticatedMainApp />;
  }

  // 3. Caso contrário, exibe o MsalAuthenticationTemplate com o manipulador suave de iFrame
  return (
    <MsalAuthenticationTemplate 
      interactionType={isInIframe ? InteractionType.Popup : InteractionType.Redirect}
      authenticationRequest={loginRequest}
      unauthenticatedTemplate={<UnauthenticatedRedirectHandler isInIframe={isInIframe} />}
      loadingComponent={MsalLoadingComponent}
      errorComponent={MsalErrorComponent}
    >
      <AuthenticatedMainApp />
    </MsalAuthenticationTemplate>
  );
}

