import React from 'react';
import { PageView } from '../types';
import { BookOpen, Upload, Calculator, ArrowRight, ShieldCheck } from 'lucide-react';
import { UnimarLogo } from './UnimarLogo';

interface HomePageProps {
  onNavigate: (view: PageView) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
  return (
    <div className="min-h-screen pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto flex flex-col justify-between space-y-10">
      
      {/* Hero Welcome Banner with Real Unimar Campus Aerial Overlay */}
      <div className="relative rounded-3xl bg-gradient-to-r from-[#001c37] via-[#003b70] to-[#0074b8] text-white p-8 sm:p-12 shadow-2xl overflow-hidden border border-white/10">
        {/* Real Aerial Campus Image Overlay */}
        <div 
          className="absolute inset-0 z-0 opacity-35 bg-cover bg-center pointer-events-none mix-blend-luminosity" 
          style={{ backgroundImage: `url('https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=1600&q=80')` }} 
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#001c37]/90 via-[#003b70]/80 to-[#0074b8]/70" />
        
        {/* Decorative Cyan Glow Blobs */}
        <div className="absolute -top-24 -right-24 w-80 h-80 bg-[#00a9e8]/30 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-[#0074b8]/40 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-5">
          <div className="flex items-center gap-3">
            <UnimarLogo colorMode="white" height={40} className="shrink-0" />
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
            Bem-vindo(a), Gestor de Polo!
          </h1>

          <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-5 text-sky-100 space-y-2 shadow-inner">
            <h2 className="text-xs sm:text-sm font-extrabold text-[#5bd5ff] uppercase tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#00a9e8] animate-pulse" />
              Resumo Operacional da Mídia Compartilhada
            </h2>
            <p className="text-xs sm:text-sm leading-relaxed text-slate-100 font-medium">
              Esta é a sua central oficial para gestão de campanhas locais e prestação de contas na rede Unimar. No portal, você consulta o manual de normas e vedações de mídia, simula o cálculo de verbas operacionais com base na sua meta de matriculados e envia as Notas Fiscais e comprovantes de pagamento do CNPJ diretamente para a auditoria central.
            </p>
          </div>
        </div>
      </div>

      {/* Primary Action Cards with Motion and Unimar Styling */}
      <div className="grid md:grid-cols-2 gap-8 max-w-5xl w-full mx-auto">
        
        {/* Module 1: Treinamento */}
        <div 
          onClick={() => onNavigate('training')}
          className="group bg-white rounded-3xl border-2 border-[#dce5ee] hover:border-[#0074b8] shadow-lg hover:shadow-2xl flex flex-col transition-all duration-300 cursor-pointer overflow-hidden transform hover:-translate-y-2 hover:scale-[1.01]"
        >
          {/* Card Top Image */}
          <div className="relative h-52 w-full overflow-hidden bg-[#003b70]">
            <img 
              src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=80" 
              alt="Unimar Treinamento" 
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out opacity-85"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#003b70] via-[#003b70]/40 to-transparent" />
            
            <div className="absolute bottom-4 left-6 right-6 flex items-center justify-between">
              <div className="w-12 h-12 bg-white/95 backdrop-blur-md text-[#003b70] rounded-2xl flex items-center justify-center shadow-lg group-hover:bg-[#00a9e8] group-hover:text-white transition-colors">
                <BookOpen className="w-6 h-6" />
              </div>
              <span className="text-[11px] font-black uppercase tracking-wider bg-[#0074b8] text-white px-3 py-1 rounded-full shadow-sm">
                Módulo Normativo
              </span>
            </div>
          </div>

          {/* Card Content */}
          <div className="p-7 flex-1 flex flex-col justify-between space-y-6">
            <div className="space-y-3">
              <h3 className="text-2xl font-extrabold text-[#003b70] group-hover:text-[#0074b8] transition-colors flex items-center justify-between">
                <span>Módulo de Treinamento</span>
                <ArrowRight className="w-5 h-5 text-[#0074b8] group-hover:translate-x-2 transition-transform" />
              </h3>
              <p className="text-xs sm:text-sm text-[#68788c] leading-relaxed">
                Acesse o manual completo com regras de verbas 50/50, limite de CAC R$ 90,00 por aluno, simulador de metas e tabela de itens permitidos/vedados.
              </p>

              <div className="space-y-2 pt-2 text-xs font-bold text-slate-700">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#00a9e8]" />
                  <span>Simulador interativo de cálculo de verba x matriculados</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#00a9e8]" />
                  <span>Tabela de itens elegíveis para reembolso e vedações</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#00a9e8]" />
                  <span>Canais e prazos de prestação de contas do módulo</span>
                </div>
              </div>
            </div>

            <div className="w-full py-3.5 bg-[#003b70] group-hover:bg-[#0074b8] text-white font-extrabold text-sm rounded-2xl shadow-md transition-all flex items-center justify-center gap-2">
              <span>Acessar Treinamento Normativo</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
            </div>
          </div>
        </div>

        {/* Module 2: Envio de Documentos */}
        <div 
          onClick={() => onNavigate('upload')}
          className="group bg-white rounded-3xl border-2 border-[#dce5ee] hover:border-emerald-500 shadow-lg hover:shadow-2xl flex flex-col transition-all duration-300 cursor-pointer overflow-hidden transform hover:-translate-y-2 hover:scale-[1.01]"
        >
          {/* Card Top Image */}
          <div className="relative h-52 w-full overflow-hidden bg-slate-900">
            <img 
              src="https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=800&q=80" 
              alt="Notas Fiscais e Comprovantes Unimar" 
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out opacity-85"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />
            
            <div className="absolute bottom-4 left-6 right-6 flex items-center justify-between">
              <div className="w-12 h-12 bg-white/95 backdrop-blur-md text-emerald-800 rounded-2xl flex items-center justify-center shadow-lg group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                <Upload className="w-6 h-6" />
              </div>
              <span className="text-[11px] font-black uppercase tracking-wider bg-emerald-600 text-white px-3 py-1 rounded-full shadow-sm">
                Prestação de Contas
              </span>
            </div>
          </div>

          {/* Card Content */}
          <div className="p-7 flex-1 flex flex-col justify-between space-y-6">
            <div className="space-y-3">
              <h3 className="text-2xl font-extrabold text-[#003b70] group-hover:text-emerald-700 transition-colors flex items-center justify-between">
                <span>Envio de Documentos</span>
                <ArrowRight className="w-5 h-5 text-emerald-600 group-hover:translate-x-2 transition-transform" />
              </h3>
              <p className="text-xs sm:text-sm text-[#68788c] leading-relaxed">
                Anexe suas Notas Fiscais (Meta, Google, Agência), comprovantes de pagamento bancário do CNPJ do polo e relatórios de consumo para auditoria.
              </p>

              <div className="space-y-2 pt-2 text-xs font-bold text-slate-700">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>Envio com emissão automática de número de protocolo</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>Validação direta do departamento fiscal da Unimar</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>Registro histórico de envios nesta sessão</span>
                </div>
              </div>
            </div>

            <div className="w-full py-3.5 bg-slate-900 group-hover:bg-emerald-600 text-white font-extrabold text-sm rounded-2xl shadow-md transition-all flex items-center justify-center gap-2">
              <span>Enviar Comprovantes Fiscais</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
            </div>
          </div>
        </div>

      </div>

      {/* Clean Status Bar (No redundant links as requested) */}
      <div className="bg-[#eef6fb] border border-[#dce5ee] rounded-2xl p-5 flex flex-col sm:flex-row items-center gap-4 shadow-sm">
        <div className="p-3 bg-white text-[#0074b8] rounded-xl shadow-xs flex-shrink-0">
          <Calculator className="w-6 h-6" />
        </div>
        <div className="text-center sm:text-left space-y-0.5">
          <strong className="text-[#003b70] text-sm font-extrabold block">Orientação sobre Investimento e Prestação de Contas</strong>
          <p className="text-xs text-[#68788c]">
            Utilize os módulos acima para realizar o treinamento normativo ou efetuar a prestação de contas com comprovantes fiscais.
          </p>
        </div>
      </div>

    </div>
  );
};


