import React from 'react';
import { PageView } from '../types';
import { BookOpen, Upload, ArrowRight, ShieldCheck } from 'lucide-react';
import { useMsal } from '@azure/msal-react';
import { isUserAdmin } from '../config/permissions';

interface HomePageProps {
  onNavigate: (view: PageView) => void;
  authenticatedEmail?: string | null;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate, authenticatedEmail }) => {
  const { accounts } = useMsal();
  const activeAccount = accounts.length > 0 ? accounts[0] : null;
  const userEmail = activeAccount?.username || authenticatedEmail;
  const isAuthorizedAdmin = isUserAdmin(userEmail);

  return (
    <div className="py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6">
      
      {/* Hero Welcome Banner with Real Unimar Campus Aerial Overlay */}
      <div className="relative rounded-3xl bg-gradient-to-r from-[#001c37] via-[#003b70] to-[#0074b8] text-white p-4 sm:p-5 md:p-6 shadow-xl overflow-hidden border border-white/10">
        {/* Real Aerial Campus Image Overlay */}
        <div 
          className="absolute inset-0 z-0 opacity-30 bg-cover bg-center pointer-events-none mix-blend-luminosity" 
          style={{ backgroundImage: `url('https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=1600&q=80')` }} 
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#001c37]/90 via-[#003b70]/80 to-[#0074b8]/70" />
        
        {/* Decorative Cyan Glow Blobs */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#00a9e8]/30 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-[#0074b8]/40 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-4xl space-y-3">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 px-3 py-1 rounded-full">
            <span className="w-2 h-2 rounded-full bg-[#5bd5ff] animate-pulse" />
            <span className="text-xs font-black uppercase tracking-widest text-[#5bd5ff]">
              Portal de Mídia Compartilhada • Unimar
            </span>
          </div>

          <h1 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight text-white leading-tight drop-shadow-sm">
            Bem-vindo(a), Gestor de Polo!
          </h1>

          <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-3 sm:p-4 text-sky-100 space-y-1.5 shadow-inner">
            <h2 className="text-xs sm:text-xs font-extrabold text-[#5bd5ff] uppercase tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#00a9e8]" />
              Resumo Operacional da Mídia Compartilhada
            </h2>
            <p className="text-xs leading-relaxed text-slate-100 font-medium">
              Central oficial para gestão de campanhas locais e prestação de contas na rede Unimar. Consulte o manual de normas, simule o cálculo de verbas operacionais com base na sua meta de matriculados e envie Notas Fiscais e comprovantes do CNPJ do polo.
            </p>
          </div>
        </div>
      </div>

      {/* Primary Action Cards */}
      <div className={`grid grid-cols-1 ${isAuthorizedAdmin ? 'md:grid-cols-3' : 'md:grid-cols-2 max-w-4xl mx-auto'} gap-6 lg:gap-8 w-full my-4`}>
        
        {/* Module 1: Guia de Mídia */}
        <div 
          onClick={() => onNavigate('training')}
          className="group bg-white rounded-2xl border-2 border-[#dce5ee] hover:border-[#0074b8] shadow-md hover:shadow-xl flex flex-col transition-all duration-300 cursor-pointer overflow-hidden transform hover:-translate-y-1"
        >
          {/* Card Top Image */}
          <div className="relative h-44 w-full overflow-hidden bg-[#003b70]">
            <img 
              src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=80" 
              alt="Unimar Guia de Mídia" 
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out opacity-85"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#003b70] via-[#003b70]/40 to-transparent" />
            
            <div className="absolute bottom-4 left-6 right-6 flex items-center justify-between">
              <div className="w-12 h-12 bg-white/95 backdrop-blur-md text-[#003b70] rounded-2xl flex items-center justify-center shadow-lg group-hover:bg-[#00a9e8] group-hover:text-white transition-colors">
                <BookOpen className="w-6 h-6" />
              </div>
              <span className="text-xs font-black uppercase tracking-wider bg-[#0074b8] text-white px-3 py-1 rounded-full shadow-sm">
                Guia Orientativo
              </span>
            </div>
          </div>

          {/* Card Content */}
          <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <h3 className="text-xl font-extrabold text-[#003b70] group-hover:text-[#0074b8] transition-colors flex items-center justify-between">
                <span>Guia de Mídia</span>
                <ArrowRight className="w-5 h-5 text-[#0074b8] group-hover:translate-x-1.5 transition-transform shrink-0" />
              </h3>
              <p className="text-xs text-slate-700 font-medium leading-relaxed">
                Consulte orientações e regras de verbas 50/50, limite de CAC R$ 90,00 por aluno, simulador de metas e tabela de itens permitidos e vedados.
              </p>

              <div className="space-y-2 pt-2 text-xs font-bold text-slate-700">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#00a9e8] shrink-0" />
                  <span>Regras e funcionamento das mídias</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#00a9e8] shrink-0" />
                  <span>Simulador interativo de verba x matriculados</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#00a9e8] shrink-0" />
                  <span>Tabela de itens elegíveis e vedações</span>
                </div>
              </div>
            </div>

            <div className="w-full py-3 bg-[#003b70] group-hover:bg-[#0074b8] text-white font-extrabold text-sm rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 mt-4">
              <span>Acessar Guia de Mídia</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>

        {/* Module 2: Envio de Documentos */}
        <div 
          onClick={() => onNavigate('upload')}
          className="group bg-white rounded-2xl border-2 border-[#dce5ee] hover:border-emerald-500 shadow-md hover:shadow-xl flex flex-col transition-all duration-300 cursor-pointer overflow-hidden transform hover:-translate-y-1"
        >
          {/* Card Top Image */}
          <div className="relative h-44 w-full overflow-hidden bg-slate-900">
            <img 
              src="https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=800&q=80" 
              alt="Notas Fiscais e Comprovantes Unimar" 
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out opacity-85"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />
            
            <div className="absolute bottom-4 left-6 right-6 flex items-center justify-between">
              <div className="w-12 h-12 bg-white/95 backdrop-blur-md text-emerald-800 rounded-2xl flex items-center justify-center shadow-lg group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                <Upload className="w-6 h-6" />
              </div>
              <span className="text-xs font-black uppercase tracking-wider bg-emerald-600 text-white px-3 py-1 rounded-full shadow-sm">
                Prestação de Contas
              </span>
            </div>
          </div>

          {/* Card Content */}
          <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <h3 className="text-xl font-extrabold text-[#003b70] group-hover:text-emerald-700 transition-colors flex items-center justify-between">
                <span>Envio de Documentos</span>
                <ArrowRight className="w-5 h-5 text-emerald-600 group-hover:translate-x-1.5 transition-transform shrink-0" />
              </h3>
              <p className="text-xs text-slate-700 font-medium leading-relaxed">
                Anexe suas Notas Fiscais (Meta, Google, Agência), comprovantes de pagamento do CNPJ do polo e relatórios para auditoria.
              </p>

              <div className="space-y-2 pt-2 text-xs font-bold text-slate-700">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                  <span>Emissão automática de protocolo</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                  <span>Validação direta pelo setor fiscal</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                  <span>Registro de envios e comprovação</span>
                </div>
              </div>
            </div>

            <div className="w-full py-3 bg-slate-900 group-hover:bg-emerald-600 text-white font-extrabold text-sm rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 mt-4">
              <span>Enviar Comprovantes Fiscais</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>

        {/* Module 3: Painel Administrativo de Mídia (Apenas visível para administradores autorizados) */}
        {isAuthorizedAdmin && (
          <div 
            onClick={() => onNavigate('admin')}
            className="group bg-white rounded-2xl border-2 border-[#dce5ee] hover:border-[#003b70] shadow-md hover:shadow-xl flex flex-col transition-all duration-300 cursor-pointer overflow-hidden transform hover:-translate-y-1"
          >
            {/* Card Top Image */}
            <div className="relative h-44 w-full overflow-hidden bg-[#001c37]">
              <img 
                src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80" 
                alt="Painel Administrativo de Mídia" 
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out opacity-85"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#001c37] via-[#001c37]/40 to-transparent" />
              
              <div className="absolute bottom-4 left-6 right-6 flex items-center justify-between">
                <div className="w-12 h-12 bg-white/95 backdrop-blur-md text-[#003b70] rounded-2xl flex items-center justify-center shadow-lg group-hover:bg-[#003b70] group-hover:text-white transition-colors">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <span className="text-xs font-black uppercase tracking-wider bg-[#003b70] text-white px-3 py-1 rounded-full shadow-sm">
                  AUDITORIA & GESTÃO
                </span>
              </div>
            </div>

            {/* Card Content */}
            <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <h3 className="text-xl font-extrabold text-[#003b70] group-hover:text-[#0074b8] transition-colors flex items-center justify-between">
                  <span>Painel Administrativo</span>
                  <ArrowRight className="w-5 h-5 text-[#003b70] group-hover:translate-x-1.5 transition-transform shrink-0" />
                </h3>
                <p className="text-xs text-slate-700 font-medium leading-relaxed">
                  Central de controle para gestão de metas por polo, auditoria de notas fiscais e conciliação financeira.
                </p>

                <div className="space-y-2 pt-2 text-xs font-bold text-slate-700">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#003b70] shrink-0" />
                    <span>Acompanhamento diário de metas</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#003b70] shrink-0" />
                    <span>Auditoria e validação de documentos</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#003b70] shrink-0" />
                    <span>Manipulador de planilhas de mídia</span>
                  </div>
                </div>
              </div>

              <div className="w-full py-3 bg-[#001c37] group-hover:bg-[#003b70] text-white font-extrabold text-sm rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 mt-4">
                <span>Acessar Painel Admin</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>
        )}

      </div>

    </div>
  );
};
