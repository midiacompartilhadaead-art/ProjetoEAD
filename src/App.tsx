import React, { useState, useEffect } from 'react';
import { PageView, SubmissaoComprovante } from './types';
import { Header } from './components/Header';
import { HomePage } from './components/HomePage';
import { TrainingPage } from './components/TrainingPage';
import { UploadPage } from './components/UploadPage';
import { AdminDashboard } from './components/AdminDashboard';
import { FloatingChat } from './components/FloatingChat';
import { UnimarLogo } from './components/UnimarLogo';
import { auth } from './firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { isEmailAdmin } from './lib/permissions';

export default function App() {
  const [currentView, setCurrentView] = useState<PageView>(() => {
    const path = window.location.pathname.toLowerCase();
    const hash = window.location.hash.toLowerCase();
    if (path === '/admin' || hash === '#admin' || hash === '#/admin') {
      return 'admin';
    }
    return 'home';
  });
  const [submissoes, setSubmissoes] = useState<SubmissaoComprovante[]>([]);
  const [authUser, setAuthUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setAuthUser(user);
    });
    return () => unsubscribe();
  }, []);

  // Escutar alterações na URL hash (ex: #admin)
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname.toLowerCase();
      const hash = window.location.hash.toLowerCase();
      if (path === '/admin' || hash === '#admin' || hash === '#/admin') {
        setCurrentView('admin');
      }
    };
    window.addEventListener('popstate', handlePopState);
    window.addEventListener('hashchange', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('hashchange', handlePopState);
    };
  }, []);

  const isAdmin = isEmailAdmin(authUser?.email);

  const handleNavigate = (view: PageView) => {
    setCurrentView(view);
    if (view === 'admin') {
      window.location.hash = 'admin';
    } else {
      if (window.location.hash === '#admin') {
        window.history.pushState('', document.title, window.location.pathname + window.location.search);
      }
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNovaSubmissao = (submissao: SubmissaoComprovante) => {
    setSubmissoes(prev => [submissao, ...prev]);
  };

  return (
    <div className="min-h-screen bg-[#f4f7fb] text-slate-900 font-sans relative overflow-x-hidden flex flex-col justify-between">
      {/* Background ambient lighting effects */}
      <div className="fixed -top-40 -right-40 w-[600px] h-[600px] bg-blue-100/40 rounded-full blur-[120px] pointer-events-none z-0" />
      <div className="fixed -bottom-40 -left-40 w-[500px] h-[500px] bg-sky-100/40 rounded-full blur-[120px] pointer-events-none z-0" />

      {/* Persistent Navigation Header */}
      <Header 
        currentView={currentView} 
        onNavigate={handleNavigate} 
        authUser={authUser}
        isAdmin={isAdmin}
      />

      {/* SPA View Switcher */}
      <main className="relative z-10 flex-grow">
        {currentView === 'home' && (
          <HomePage onNavigate={handleNavigate} />
        )}

        {currentView === 'training' && (
          <TrainingPage onNavigate={handleNavigate} />
        )}

        {currentView === 'upload' && (
          <UploadPage
            onNavigate={handleNavigate}
            submissoesAnteriores={submissoes}
            onNovaSubmissao={handleNovaSubmissao}
          />
        )}

        {currentView === 'admin' && (
          <AdminDashboard
            onNavigate={handleNavigate}
            authUser={authUser}
            isAdmin={isAdmin}
          />
        )}
      </main>

      {/* Unimar Official Footer */}
      <footer className="relative z-10 bg-[#003b70] text-white py-10 px-6 border-t-4 border-[#00a9e8] text-xs">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <UnimarLogo colorMode="white" height={32} className="shrink-0" />
            <span className="text-sky-200 text-xs font-bold border-l border-white/20 pl-3">
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
              Treinamento
            </button>
            <span className="text-white/20">•</span>
            <button 
              onClick={() => handleNavigate('upload')} 
              className={`hover:text-[#5bd5ff] transition-colors cursor-pointer ${currentView === 'upload' ? 'text-[#5bd5ff] underline' : ''}`}
            >
              Envio de Documentos
            </button>
            {isAdmin && (
              <>
                <span className="text-white/20">•</span>
                <button 
                  onClick={() => handleNavigate('admin')} 
                  className={`hover:text-[#5bd5ff] transition-colors cursor-pointer ${currentView === 'admin' ? 'text-[#5bd5ff] underline' : ''}`}
                >
                  Área Admin
                </button>
              </>
            )}
          </div>

          <span className="text-sky-300/70 text-[11px]">
            © {new Date().getFullYear()} Universidade de Marília. Todos os direitos reservados.
          </span>
        </div>
      </footer>

      {/* Floating AI Chat Assistant for Managers */}
      <FloatingChat />
    </div>
  );
}
