import React from 'react';
import { PageView } from '../types';
import { ArrowLeft, BookOpen, Send, User, ShieldCheck } from 'lucide-react';
import { UnimarLogo } from './UnimarLogo';
import { User as FirebaseUser } from 'firebase/auth';

interface HeaderProps {
  currentView: PageView;
  onNavigate: (view: PageView) => void;
  authUser?: FirebaseUser | null;
  isAdmin?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ 
  currentView, 
  onNavigate, 
  authUser, 
  isAdmin 
}) => {
  return (
    <header className="fixed top-0 left-0 right-0 h-[72px] bg-[#003b70] z-50 flex items-center justify-between px-4 sm:px-8 border-b-2 border-[#00a9e8] shadow-xl">
      {/* Brand & Official Unimar Logo */}
      <div 
        className="flex items-center gap-3 cursor-pointer group"
        onClick={() => onNavigate('home')}
      >
        <UnimarLogo colorMode="white" height={36} className="group-hover:scale-105 transition-transform shrink-0" />
        <div className="hidden sm:flex flex-col border-l border-white/20 pl-3">
          <span className="text-white font-black text-xs tracking-wider flex items-center gap-1.5 uppercase">
            Mídia Compartilhada
          </span>
          <span className="text-[#5bd5ff] text-[9px] uppercase font-black tracking-widest">
            Portal do Gestor de Polo
          </span>
        </div>
      </div>

      {/* Navigation & Profile */}
      <div className="flex items-center gap-2 sm:gap-4">
        {isAdmin && (
          <button
            onClick={() => onNavigate('admin')}
            className={`flex items-center gap-1.5 text-xs font-black px-3 py-1.5 rounded-xl transition-all shadow-xs cursor-pointer border ${
              currentView === 'admin'
                ? 'bg-amber-400 text-slate-950 border-amber-300'
                : 'bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border-amber-400/40'
            }`}
            title="Área Administrativa"
          >
            <ShieldCheck className="w-4 h-4 text-amber-300" />
            <span className="hidden sm:inline">Painel Administrativo</span>
          </button>
        )}

        {currentView !== 'home' ? (
          <button
            onClick={() => onNavigate('home')}
            className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm px-3.5 py-2 rounded-xl transition-all border border-white/20 hover:border-white/40 shadow-sm active:scale-95 cursor-pointer"
            title="Voltar ao menu inicial"
          >
            <ArrowLeft className="w-4 h-4 text-[#5bd5ff]" />
            <span className="hidden sm:inline">Voltar ao Menu Inicial</span>
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigate('training')}
              className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-white/90 hover:text-[#8fe0ff] px-3 py-1.5 rounded-lg hover:bg-white/5 transition-all cursor-pointer"
            >
              <BookOpen className="w-4 h-4 text-[#00a9e8]" />
              <span className="hidden md:inline">Treinamento</span>
            </button>
            <button
              onClick={() => onNavigate('upload')}
              className="flex items-center gap-1.5 text-xs sm:text-sm font-bold bg-[#00a9e8] hover:bg-[#0092c8] text-white px-3.5 py-1.5 rounded-xl transition-all shadow-md active:scale-95 cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>Enviar Documentos</span>
            </button>
          </div>
        )}

        {/* User Profile Badge */}
        <div className="hidden lg:flex items-center gap-2.5 pl-3 border-l border-white/15">
          <div className="text-right">
            <p className="text-xs font-bold text-white leading-none">
              {isAdmin ? 'Administrador' : 'Gestor de Polo'}
            </p>
            <p className="text-[10px] text-[#5bd5ff] font-medium mt-0.5 truncate max-w-[140px]">
              {authUser?.email || 'Universidade de Marília'}
            </p>
          </div>
          <div className="w-8 h-8 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white font-bold text-xs shadow-inner">
            <User className="w-4 h-4 text-[#5bd5ff]" />
          </div>
        </div>
      </div>
    </header>
  );
};
