import React, { useState } from 'react';
import { PageView } from '../types';
import { REEMBOLSO_TABELA } from '../data/mockData';
import { 
  Target, 
  Users, 
  CheckCircle2, 
  XCircle, 
  Copy, 
  Check, 
  AlertTriangle,
  Send,
  Building2,
  FileCheck,
  Megaphone,
  Sparkles
} from 'lucide-react';

interface TrainingPageProps {
  onNavigate: (view: PageView) => void;
}

export const TrainingPage: React.FC<TrainingPageProps> = ({ onNavigate }) => {
  // Calculadora State
  const [meta, setMeta] = useState<number>(100);
  const CAC = 90;
  const verbaTotal = meta * CAC;
  const verbaUnimar = verbaTotal / 2;
  const verbaPolo = verbaTotal / 2;

  // Copy Feedback State
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const formatBRL = (val: number) => {
    return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-12">
      
      {/* Top Header Title Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <span className="text-xs font-black text-[#00a9e8] uppercase tracking-widest block mb-1">
            Módulo de Treinamento e Diretrizes
          </span>
          <h1 className="text-2xl sm:text-4xl font-black text-[#003b70] tracking-tight">
            Manual de Mídia Compartilhada
          </h1>
        </div>
        
        <button
          onClick={() => onNavigate('upload')}
          className="flex items-center gap-2 bg-[#00a9e8] hover:bg-[#0092c8] text-white font-extrabold text-xs sm:text-sm px-5 py-3 rounded-2xl shadow-md transition-all active:scale-95 cursor-pointer"
        >
          <Send className="w-4 h-4" />
          <span>Enviar Comprovantes de Mídia</span>
        </button>
      </div>

      {/* Section 01: Objetivos */}
      <section className="space-y-6">
        <div className="max-w-3xl">
          <span className="text-xs font-extrabold text-[#0074b8] tracking-wider uppercase">
            01 — Objetivos e Abrangência
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1 mb-2">
            Por que existe a Mídia Compartilhada?
          </h2>
          <p className="text-slate-700 text-sm sm:text-base leading-relaxed font-medium">
            Estabelecer normas e orientações para utilização da verba, assegurando transparência, conformidade e eficácia na aplicação dos recursos destinados à captação de alunos para a Unimar.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-[#edf4fa] hover:bg-white border border-[#b2d5f0] hover:border-[#0074b8] p-6 rounded-3xl shadow-xs hover:shadow-xl transition-all duration-300 hover:-translate-y-1.5 group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-[#00a9e8]/10 rounded-bl-full pointer-events-none group-hover:bg-[#00a9e8]/20 transition-colors" />
            <div className="w-12 h-12 rounded-2xl bg-[#0074b8]/10 text-[#0074b8] flex items-center justify-center font-bold mb-4 group-hover:bg-[#0074b8] group-hover:text-white transition-all duration-300">
              <Megaphone className="w-6 h-6" />
            </div>
            <h3 className="font-black text-[#002b54] text-base mb-1.5 group-hover:text-[#003b70] transition-colors">Maior Visibilidade</h3>
            <p className="text-xs sm:text-sm text-slate-700 font-medium leading-relaxed">Fortalecer a presença da instituição e ampliar sua divulgação local e regional.</p>
          </div>

          <div className="bg-[#edf4fa] hover:bg-white border border-[#b2d5f0] hover:border-[#0074b8] p-6 rounded-3xl shadow-xs hover:shadow-xl transition-all duration-300 hover:-translate-y-1.5 group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-[#00a9e8]/10 rounded-bl-full pointer-events-none group-hover:bg-[#00a9e8]/20 transition-colors" />
            <div className="w-12 h-12 rounded-2xl bg-[#0074b8]/10 text-[#0074b8] flex items-center justify-center font-bold mb-4 group-hover:bg-[#0074b8] group-hover:text-white transition-all duration-300">
              <Target className="w-6 h-6" />
            </div>
            <h3 className="font-black text-[#002b54] text-base mb-1.5 group-hover:text-[#003b70] transition-colors">Marketing Estruturado</h3>
            <p className="text-xs sm:text-sm text-slate-700 font-medium leading-relaxed">Fornecer suporte estratégico e financeiro aos polos parceiros para suas campanhas.</p>
          </div>

          <div className="bg-[#edf4fa] hover:bg-white border border-[#b2d5f0] hover:border-[#0074b8] p-6 rounded-3xl shadow-xs hover:shadow-xl transition-all duration-300 hover:-translate-y-1.5 group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-[#00a9e8]/10 rounded-bl-full pointer-events-none group-hover:bg-[#00a9e8]/20 transition-colors" />
            <div className="w-12 h-12 rounded-2xl bg-[#0074b8]/10 text-[#0074b8] flex items-center justify-center font-bold mb-4 group-hover:bg-[#0074b8] group-hover:text-white transition-all duration-300">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="font-black text-[#002b54] text-base mb-1.5 group-hover:text-[#003b70] transition-colors">Mais Matrículas</h3>
            <p className="text-xs sm:text-sm text-slate-700 font-medium leading-relaxed">Contribuir ativamente para o aumento da quantidade de alunos matriculados a cada módulo.</p>
          </div>

          <div className="bg-[#edf4fa] hover:bg-white border border-[#b2d5f0] hover:border-[#0074b8] p-6 rounded-3xl shadow-xs hover:shadow-xl transition-all duration-300 hover:-translate-y-1.5 group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-[#00a9e8]/10 rounded-bl-full pointer-events-none group-hover:bg-[#00a9e8]/20 transition-colors" />
            <div className="w-12 h-12 rounded-2xl bg-[#0074b8]/10 text-[#0074b8] flex items-center justify-center font-bold mb-4 group-hover:bg-[#0074b8] group-hover:text-white transition-all duration-300">
              <Building2 className="w-6 h-6" />
            </div>
            <h3 className="font-black text-[#002b54] text-base mb-1.5 group-hover:text-[#003b70] transition-colors">Crescimento EAD</h3>
            <p className="text-xs sm:text-sm text-slate-700 font-medium leading-relaxed">Consolidar a rede de polos credenciados da Unimar em todo o território nacional.</p>
          </div>
        </div>
      </section>

      {/* Section 02: Responsabilidades */}
      <section className="bg-[#edf4fa] border border-[#b2d5f0] rounded-3xl p-8 sm:p-10 shadow-xs space-y-6">
        <div>
          <span className="text-xs font-extrabold text-[#0074b8] tracking-wider uppercase">
            02 — Responsabilidades
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#002b54] mt-1 mb-2">
            Papéis e Atribuições
          </h2>
          <p className="text-slate-700 font-medium text-sm">
            O sucesso da gestão de mídia depende da colaboração alinhada entre as partes envolvidas.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-[#b2d5f0] hover:border-[#0074b8] shadow-xs hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group">
            <h3 className="text-base font-black text-[#002b54] mb-3 flex items-center gap-2 group-hover:text-[#003b70] transition-colors">
              <span className="w-2.5 h-2.5 rounded-full bg-[#0074b8]" />
              Gestor do Polo
            </h3>
            <ul className="space-y-2 text-xs sm:text-sm text-slate-800 font-medium list-disc list-inside">
              <li>Aplicar corretamente a verba aprovada</li>
              <li>Formalizar contratações no CNPJ do polo</li>
              <li>Efetuar pagamentos via conta PJ do polo</li>
              <li>Enviar comprovantes dentro do prazo</li>
            </ul>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-[#b2d5f0] hover:border-[#00a9e8] shadow-xs hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group">
            <h3 className="text-base font-black text-[#002b54] mb-3 flex items-center gap-2 group-hover:text-[#003b70] transition-colors">
              <span className="w-2.5 h-2.5 rounded-full bg-[#00a9e8]" />
              Unimar
            </h3>
            <ul className="space-y-2 text-xs sm:text-sm text-slate-800 font-medium list-disc list-inside">
              <li>Analisar e aprovar as prestações de conta</li>
              <li>Realizar os reembolsos no prazo determinado</li>
              <li>Oferecer orientações estratégicas de mídia</li>
              <li>Monitorar indicadores de captação</li>
            </ul>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-[#b2d5f0] hover:border-emerald-500 shadow-xs hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group">
            <h3 className="text-base font-black text-[#002b54] mb-3 flex items-center gap-2 group-hover:text-emerald-800 transition-colors">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              Auditoria de Mídia
            </h3>
            <ul className="space-y-2 text-xs sm:text-sm text-slate-800 font-medium list-disc list-inside">
              <li>Conferir a autenticidade das NFs e relatórios</li>
              <li>Validar comprovantes bancários do CNPJ</li>
              <li>Identificar glosas ou divergências</li>
              <li>Manter o arquivo digital de auditoria</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Section 03: Verba & Calculadora */}
      <section className="space-y-6">
        <div>
          <span className="text-xs font-extrabold text-[#0074b8] tracking-wider uppercase">
            03 — Cálculo da Verba & Calculadora
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1 mb-2">
            Como a verba é dividida?
          </h2>
          <p className="text-slate-700 font-medium text-sm leading-relaxed">
            A verba de mídia é calculada multiplicando a meta de alunos pelo CAC (R$ 90,00) com compartilhamento de <strong>50% Unimar / 50% Polo</strong>.
          </p>
        </div>

        {/* Sleek Calculator Box */}
        <div className="bg-[#001c37] rounded-3xl p-8 sm:p-10 text-white shadow-xl space-y-8 border border-slate-800 hover:border-[#00a9e8]/40 transition-all duration-300">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border-b border-slate-800 pb-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#5bd5ff] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#5bd5ff]" />
                Simulador Interativo
              </span>
              <h3 className="text-2xl font-bold mt-1">
                Simule a verba do seu Polo
              </h3>
            </div>
            <div className="bg-slate-800/90 px-4 py-2 rounded-2xl border border-slate-700/80 text-center">
              <span className="text-xs font-medium text-slate-400 block uppercase">CAC Fixo por Aluno</span>
              <strong className="text-xl font-bold text-white">R$ 90,00</strong>
            </div>
          </div>

          {/* Calculator Controls */}
          <div className="grid md:grid-cols-3 gap-6 items-center">
            {/* Meta Input */}
            <div className="bg-slate-800/80 border border-slate-700 p-5 rounded-2xl space-y-2 hover:border-[#00a9e8]/50 transition-colors">
              <label className="text-xs uppercase font-extrabold tracking-wider text-slate-400 block">
                Meta de Captação (Alunos)
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setMeta(prev => Math.max(0, prev - 10))}
                  className="w-10 h-10 rounded-xl bg-slate-700 hover:bg-slate-600 active:scale-95 text-white font-bold text-lg flex items-center justify-center transition-all cursor-pointer"
                  title="Diminuir 10"
                >
                  −
                </button>
                <input
                  type="number"
                  value={meta}
                  onChange={(e) => setMeta(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full bg-transparent text-center font-extrabold text-3xl text-white outline-none border-b-2 border-slate-600 focus:border-[#00a9e8]"
                  min="0"
                />
                <button
                  type="button"
                  onClick={() => setMeta(prev => prev + 10)}
                  className="w-10 h-10 rounded-xl bg-slate-700 hover:bg-slate-600 active:scale-95 text-white font-bold text-lg flex items-center justify-center transition-all cursor-pointer"
                  title="Aumentar 10"
                >
                  +
                </button>
              </div>
            </div>

            {/* Multiply symbol */}
            <div className="text-center font-extrabold text-2xl text-[#5bd5ff]">
              × R$ 90,00
            </div>

            {/* Total Verba */}
            <div className="bg-slate-800/80 border border-slate-700 p-5 rounded-2xl text-center space-y-1 hover:border-[#00a9e8]/50 transition-colors">
              <span className="text-xs uppercase font-extrabold tracking-wider text-slate-400 block">
                Verba Total de Mídia
              </span>
              <strong className="text-3xl font-extrabold text-white">
                {formatBRL(verbaTotal)}
              </strong>
            </div>
          </div>

          {/* 50 / 50 Breakdown */}
          <div className="grid sm:grid-cols-2 gap-4 pt-4 border-t border-slate-800">
            <div className="bg-slate-800/60 border border-slate-700/80 p-4 rounded-2xl text-center hover:border-[#00a9e8]/50 transition-colors">
              <span className="text-xs uppercase font-bold tracking-wider text-[#5bd5ff] block">
                Investimento Unimar (50%)
              </span>
              <strong className="text-2xl font-extrabold text-[#5bd5ff]">
                {formatBRL(verbaUnimar)}
              </strong>
              <span className="text-[11px] text-slate-400 block mt-1">Valor Reembolsável mediante comprovação</span>
            </div>

            <div className="bg-slate-800/60 border border-slate-700/80 p-4 rounded-2xl text-center hover:border-slate-500 transition-colors">
              <span className="text-xs uppercase font-bold tracking-wider text-slate-400 block">
                Contrapartida Polo (50%)
              </span>
              <strong className="text-2xl font-extrabold text-white">
                {formatBRL(verbaPolo)}
              </strong>
              <span className="text-[11px] text-slate-400 block mt-1">Investimento direto pelo Polo</span>
            </div>
          </div>

          <div className="bg-slate-800/40 border border-slate-700/60 p-4 rounded-xl text-xs text-slate-300 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
            <p>
              <strong>Atenção:</strong> Caso o polo não atinja ao menos 50% da meta de captação estipulada para o módulo, haverá ajuste proporcional na restituição do valor investido pela Unimar nos repasses futuros.
            </p>
          </div>
        </div>
      </section>

      {/* Section 04: Prestação de Contas e Documentos */}
      <section className="space-y-6">
        <div>
          <span className="text-xs font-extrabold text-[#0074b8] tracking-wider uppercase">
            04 — Prestação de Contas
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1 mb-2">
            O que deve ser enviado?
          </h2>
          <p className="text-slate-700 font-medium text-sm">
            Confira a documentação obrigatória para cada tipo de comprovante enviado.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-6">
          <div className="bg-[#edf4fa] hover:bg-white border border-[#b2d5f0] hover:border-[#0074b8] p-6 rounded-3xl shadow-xs hover:shadow-xl transition-all duration-300 hover:-translate-y-1.5 space-y-3 group">
            <div className="flex items-center gap-2 text-[#002b54] font-black text-base group-hover:text-[#003b70] transition-colors">
              <FileCheck className="w-5 h-5 text-[#0074b8]" />
              <span>Tráfego Pago (Facebook / Google Ads)</span>
            </div>
            <ul className="text-xs sm:text-sm text-slate-800 font-medium space-y-1.5 list-disc list-inside">
              <li>Boleto ou Pix gerado no CNPJ do polo</li>
              <li>Comprovante de pagamento bancário do CNPJ</li>
              <li>Nota Fiscal da Meta/Google em nome do CNPJ</li>
              <li>Relatório oficial de consumo em PDF do mês</li>
            </ul>
          </div>

          <div className="bg-[#edf4fa] hover:bg-white border border-[#b2d5f0] hover:border-[#0074b8] p-6 rounded-3xl shadow-xs hover:shadow-xl transition-all duration-300 hover:-translate-y-1.5 space-y-3 group">
            <div className="flex items-center gap-2 text-[#002b54] font-black text-base group-hover:text-[#003b70] transition-colors">
              <FileCheck className="w-5 h-5 text-[#0074b8]" />
              <span>Agências & Prestadores de Serviço</span>
            </div>
            <ul className="text-xs sm:text-sm text-slate-800 font-medium space-y-1.5 list-disc list-inside">
              <li>Nota Fiscal com descrição detalhada dos serviços</li>
              <li>Contrato de prestação de serviço vigente</li>
              <li>Comprovante bancário de transferência/Pix da PJ</li>
            </ul>
          </div>

          <div className="bg-[#edf4fa] hover:bg-white border border-[#b2d5f0] hover:border-[#0074b8] p-6 rounded-3xl shadow-xs hover:shadow-xl transition-all duration-300 hover:-translate-y-1.5 space-y-3 group">
            <div className="flex items-center gap-2 text-[#002b54] font-black text-base group-hover:text-[#003b70] transition-colors">
              <FileCheck className="w-5 h-5 text-[#0074b8]" />
              <span>Materiais Promocionais e Gráfica</span>
            </div>
            <ul className="text-xs sm:text-sm text-slate-800 font-medium space-y-1.5 list-disc list-inside">
              <li>Nota Fiscal emitida no CNPJ do polo</li>
              <li>Comprovante de pagamento</li>
              <li>Fotos legíveis dos materiais produzidos</li>
              <li>Aprovação prévia por e-mail (quando exigida)</li>
            </ul>
          </div>

          <div className="bg-[#edf4fa] hover:bg-white border border-[#b2d5f0] hover:border-[#0074b8] p-6 rounded-3xl shadow-xs hover:shadow-xl transition-all duration-300 hover:-translate-y-1.5 space-y-3 group">
            <div className="flex items-center gap-2 text-[#002b54] font-black text-base group-hover:text-[#003b70] transition-colors">
              <FileCheck className="w-5 h-5 text-[#0074b8]" />
              <span>Mídia Tradicional (Rádio, TV, Outdoor)</span>
            </div>
            <ul className="text-xs sm:text-sm text-slate-800 font-medium space-y-1.5 list-disc list-inside">
              <li>Nota Fiscal no CNPJ do polo</li>
              <li>Comprovante de veiculação (piquetes ou fotos)</li>
              <li>Contrato de mídia assinado</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Section 05: Canais & Prazos */}
      <section className="bg-[#edf4fa] border border-[#b2d5f0] p-8 sm:p-10 rounded-3xl space-y-6 shadow-xs">
        <div>
          <span className="text-xs font-extrabold text-[#0074b8] tracking-wider uppercase">
            05 — Canais de Contato e Prazos
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#002b54] mt-1 mb-2">
            Prazos e Suporte da Mídia
          </h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Email */}
          <div className="bg-white p-5 rounded-2xl border border-[#b2d5f0] hover:border-[#0074b8] shadow-xs hover:shadow-lg transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between group">
            <div>
              <span className="text-xs font-bold text-slate-700 uppercase block mb-1">E-mail Oficial</span>
              <strong className="text-xs sm:text-sm text-[#002b54] block break-all font-black mb-3 group-hover:text-[#003b70] transition-colors">
                midiacompartilhada.ead@unimar.br
              </strong>
            </div>
            <button
              onClick={() => handleCopy('midiacompartilhada.ead@unimar.br')}
              className="flex items-center justify-center gap-2 text-xs font-bold py-2 px-3 rounded-xl bg-slate-50 hover:bg-[#003b70] hover:text-white transition-all text-slate-800 cursor-pointer border border-slate-200 shadow-2xs"
            >
              {copiedText === 'midiacompartilhada.ead@unimar.br' ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copiar E-mail</span>
                </>
              )}
            </button>
          </div>

          {/* Whatsapp */}
          <div className="bg-white p-5 rounded-2xl border border-[#b2d5f0] hover:border-[#0074b8] shadow-xs hover:shadow-lg transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between group">
            <div>
              <span className="text-xs font-bold text-slate-700 uppercase block mb-1">WhatsApp Atendimento</span>
              <strong className="text-sm text-[#002b54] block font-black mb-3 group-hover:text-[#003b70] transition-colors">
                (14) 99812-4403
              </strong>
            </div>
            <button
              onClick={() => handleCopy('14998124403')}
              className="flex items-center justify-center gap-2 text-xs font-bold py-2 px-3 rounded-xl bg-slate-50 hover:bg-[#003b70] hover:text-white transition-all text-slate-800 cursor-pointer border border-slate-200 shadow-2xs"
            >
              {copiedText === '14998124403' ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copiar WhatsApp</span>
                </>
              )}
            </button>
          </div>

          {/* Envio */}
          <div className="bg-white p-5 rounded-2xl border border-[#b2d5f0] hover:border-[#0074b8] shadow-xs hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group">
            <span className="text-xs font-bold text-slate-700 uppercase block mb-1">Envio de Comprovantes</span>
            <strong className="text-sm sm:text-base text-[#002b54] font-black block mb-1 group-hover:text-[#003b70] transition-colors">
              Até o último dia do mês
            </strong>
            <span className="text-xs text-slate-700 font-medium">Mês de referência das campanhas</span>
          </div>

          {/* Reembolso */}
          <div className="bg-white p-5 rounded-2xl border border-[#b2d5f0] hover:border-emerald-500 shadow-xs hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group">
            <span className="text-xs font-bold text-slate-700 uppercase block mb-1">Data de Reembolso</span>
            <strong className="text-sm sm:text-base text-emerald-700 font-black block mb-1 group-hover:text-emerald-800 transition-colors">
              Dia 16 do mês seguinte
            </strong>
            <span className="text-xs text-slate-700 font-medium">Conforme aprovação da auditoria</span>
          </div>
        </div>
      </section>

      {/* Section 06: Tabela Reembolso */}
      <section className="space-y-6">
        <div>
          <span className="text-xs font-extrabold text-[#0074b8] tracking-wider uppercase">
            06 — Tabela de Elegibilidade
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1 mb-2">
            Regras de Reembolso
          </h2>
          <p className="text-slate-700 font-medium text-sm">
            Consulte a lista detalhada de serviços e itens autorizados.
          </p>
        </div>

        <div className="bg-[#edf4fa] border border-[#b2d5f0] rounded-3xl overflow-hidden shadow-xs hover:shadow-md transition-all duration-300 overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-[#001c37] text-white text-xs uppercase font-bold tracking-wider">
                <th className="p-4">Item / Serviço</th>
                <th className="p-4">Categoria</th>
                <th className="p-4 text-center">Status Reembolso</th>
                <th className="p-4">Observações e Exigências</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/80 bg-white/80">
              {REEMBOLSO_TABELA.map((row, idx) => (
                <tr key={idx} className="hover:bg-white transition-colors">
                  <td className="p-4 font-black text-[#002b54]">{row.item}</td>
                  <td className="p-4 text-xs font-bold text-slate-700">{row.categoria}</td>
                  <td className="p-4 text-center">
                    {row.reembolsavel ? (
                      <span className="inline-flex items-center gap-1 text-xs font-extrabold text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-full border border-emerald-300">
                        <CheckCircle2 className="w-3.5 h-3.5" /> SIM
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-extrabold text-rose-800 bg-rose-100 px-2.5 py-1 rounded-full border border-rose-300">
                        <XCircle className="w-3.5 h-3.5" /> NÃO
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-xs text-slate-800 font-medium leading-relaxed">{row.observacoes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Bottom Action CTA */}
      <div className="bg-[#001c37] rounded-3xl p-8 text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl border border-slate-800 hover:border-[#00a9e8]/50 transition-all duration-300">
        <div>
          <h3 className="text-xl sm:text-2xl font-bold">Pronto para enviar seus comprovantes?</h3>
          <p className="text-xs sm:text-sm text-slate-300">Acesse o formulário de envio e anexe as NFs para auditoria.</p>
        </div>

        <button
          onClick={() => onNavigate('upload')}
          className="flex items-center gap-2 bg-[#00a9e8] hover:bg-[#0092c8] text-white font-extrabold text-sm px-6 py-3.5 rounded-2xl shadow-md transition-all active:scale-95 cursor-pointer whitespace-nowrap"
        >
          <Send className="w-4 h-4" />
          <span>Ir para Formulário de Envio</span>
        </button>
      </div>

    </div>
  );
};
