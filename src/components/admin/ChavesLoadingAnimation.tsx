import React from 'react';
import { Sparkles, FileSearch } from 'lucide-react';

export const UnimarzinhoLoadingAnimation: React.FC = () => {
  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-2xs p-8 min-h-[420px] flex flex-col items-center justify-center text-center space-y-6 relative overflow-hidden select-none">
      
      {/* Elementos decorativos sutis de fundo */}
      <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#003366] via-sky-500 to-[#0055A5] animate-pulse" />
      <div className="absolute -top-12 -right-12 w-36 h-36 bg-sky-100/50 rounded-full blur-xl pointer-events-none" />
      <div className="absolute -bottom-12 -left-12 w-36 h-36 bg-blue-100/50 rounded-full blur-xl pointer-events-none" />

      {/* Container do Mascote Unimarzinho Animado */}
      <div className="relative flex items-center justify-center py-2">
        
        {/* Raio de Leitura Laser / Scan Effect Pulsante */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-56 h-56 rounded-full border-2 border-[#0055A5]/30 animate-ping opacity-40" />
        </div>

        {/* Container Circular Estilizado com Brilho Sutil */}
        <div className="relative z-10 w-48 h-48 sm:w-52 sm:h-52 rounded-full bg-gradient-to-b from-sky-50 via-sky-100/70 to-blue-100/80 border-2 border-sky-200/90 shadow-[0_0_25px_rgba(0,85,165,0.2)] flex items-center justify-center overflow-hidden animate-pulse">
          
          {/* Anel de Brilho Interno */}
          <div className="absolute inset-1.5 rounded-full border border-white/80 pointer-events-none" />

          {/* Ilustração SVG do Unimarzinho Avatar (Mascote Corporativo com Cabelo Castanho Escuro com Franja e Camisa Polo Azul Unimar) */}
          <svg 
            width="150" 
            height="170" 
            viewBox="0 0 150 170" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
            className="drop-shadow-md z-10 transform translate-y-2"
          >
            {/* Sombra Suave no Chão do Círculo */}
            <ellipse cx="75" cy="162" rx="42" ry="6" fill="#002B54" fillOpacity="0.18" />

            {/* Corpo do Mascote Unimarzinho Avatar */}
            <g id="unimarzinho-avatar-body">
              
              {/* Braço Esquerdo com a Prancheta de Auditoria */}
              <g id="prancheta" transform="translate(12, 80) rotate(-8)">
                {/* Prancheta de Madeira Corporativa */}
                <rect x="0" y="0" width="28" height="36" rx="3.5" fill="#B45309" stroke="#78350F" strokeWidth="1.5" />
                {/* Clipe metálico superior */}
                <rect x="9" y="-3" width="10" height="5" rx="1" fill="#94A3B8" stroke="#334155" strokeWidth="1" />
                {/* Papel da Nota Fiscal/Auditoria */}
                <rect x="3" y="4" width="22" height="28" rx="1.5" fill="#FFFFFF" />
                {/* Linhas de texto simuladas */}
                <line x1="6" y1="9" x2="20" y2="9" stroke="#0055A5" strokeWidth="1.5" strokeLinecap="round" />
                <line x1="6" y1="13" x2="18" y2="13" stroke="#64748B" strokeWidth="1" strokeLinecap="round" />
                <line x1="6" y1="16" x2="15" y2="16" stroke="#64748B" strokeWidth="1" strokeLinecap="round" />
                {/* Checkmark verde de validação */}
                <circle cx="16" cy="23" r="5.5" fill="#16A34A" />
                <path d="M 13.5 23 L 15.5 25 L 18.5 21" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </g>

              {/* Mão Esquerda Segurando a Prancheta */}
              <circle cx="34" cy="98" r="5" fill="#FCE7D6" stroke="#FDBA74" strokeWidth="0.8" />

              {/* Tronco / Camisa Polo Azul Escuro Corporativa da Unimar */}
              {/* Corpo da Camisa Polo Azul Escuro (#002B54 / #003366) */}
              <path d="M 42 78 Q 75 73 108 78 L 112 136 Q 75 140 38 136 Z" fill="#002B54" />
              {/* Sombra Lateral da Camisa */}
              <path d="M 42 78 Q 50 105 38 136 L 46 136 Q 56 105 48 78 Z" fill="#001830" fillOpacity="0.35" />

              {/* Gola Polo Azul com Detalhe de Borda Branca */}
              <path d="M 56 76 L 75 90 L 94 76 L 88 72 L 75 80 L 62 72 Z" fill="#003366" stroke="#0055A5" strokeWidth="1" />
              <path d="M 58 76 L 75 88 L 92 76" stroke="#FFFFFF" strokeWidth="1.2" fill="none" strokeLinecap="round" />

              {/* Abertura da Gola Polo com Botões */}
              <path d="M 72 86 L 78 86 L 77 101 L 73 101 Z" fill="#001830" />
              <circle cx="75" cy="90" r="1.2" fill="#FFFFFF" />
              <circle cx="75" cy="96" r="1.2" fill="#FFFFFF" />

              {/* Mangas Curtas da Camisa Polo */}
              <path d="M 42 80 L 28 94 L 36 100 L 46 86 Z" fill="#002B54" />
              <path d="M 28 94 L 36 100" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" />

              <path d="M 108 80 L 122 92 L 114 98 L 104 86 Z" fill="#002B54" />
              <path d="M 122 92 L 114 98" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" />

              {/* Logotipo UNIMAR Estampado em Destaque em BRANCO no Peito Esquerdo */}
              <g id="logo-unimar-destaque" transform="translate(76, 96)">
                {/* Texto UNIMAR em Branco Brilhante e Legível */}
                <text x="12" y="7" textAnchor="middle" fill="#FFFFFF" fontSize="7" fontWeight="900" fontFamily="sans-serif" letterSpacing="0.8">UNIMAR</text>
                <text x="12" y="11.5" textAnchor="middle" fill="#38BDF8" fontSize="4" fontWeight="800" fontFamily="sans-serif" letterSpacing="0.6">EAD AUDITORIA</text>
              </g>

              {/* Braço Direito Segurando Lupa Minimalista */}
              <circle cx="118" cy="96" r="5" fill="#FCE7D6" stroke="#FDBA74" strokeWidth="0.8" />

              {/* Lupa Minimalista */}
              <g id="lupa-minimalista" transform="translate(112, 70) rotate(12)">
                <circle cx="14" cy="14" r="12" stroke="#003366" strokeWidth="2.8" fill="#E0F2FE" fillOpacity="0.8" />
                <path d="M 22 22 L 32 32" stroke="#003366" strokeWidth="4" strokeLinecap="round" />
                <path d="M 22 22 L 32 32" stroke="#0284C7" strokeWidth="1.8" strokeLinecap="round" />
                {/* Reflexo no Vidro */}
                <path d="M 8 10 Q 14 7 20 10" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
              </g>

              {/* Pescoço */}
              <rect x="67" y="64" width="16" height="15" rx="3" fill="#FCE7D6" />

              {/* Cabeça e Rosto do Avatar Baseado na Foto */}
              <ellipse cx="75" cy="46" rx="22" ry="21" fill="#FCE7D6" />
              
              {/* Orelhas */}
              <ellipse cx="52" cy="47" rx="3.2" ry="5" fill="#FCE7D6" stroke="#E2B195" strokeWidth="0.6" />
              <ellipse cx="98" cy="47" rx="3.2" ry="5" fill="#FCE7D6" stroke="#E2B195" strokeWidth="0.6" />

              {/* Olhos Castanhos Amigáveis e Expressivos */}
              <ellipse cx="64" cy="45" rx="3.8" ry="4.5" fill="#29180E" />
              <circle cx="62.5" cy="43.5" r="1.3" fill="#FFFFFF" />
              <circle cx="65" cy="47" r="0.6" fill="#FFFFFF" />

              <ellipse cx="86" cy="45" rx="3.8" ry="4.5" fill="#29180E" />
              <circle cx="84.5" cy="43.5" r="1.3" fill="#FFFFFF" />
              <circle cx="87" cy="47" r="0.6" fill="#FFFFFF" />

              {/* Sobrancelhas Marcantes em Castanho Escuro */}
              <path d="M 58 37 Q 64 35 70 38" stroke="#3D2612" strokeWidth="2" strokeLinecap="round" fill="none" />
              <path d="M 80 38 Q 86 35 92 37" stroke="#3D2612" strokeWidth="2" strokeLinecap="round" fill="none" />

              {/* Nariz Discreto */}
              <path d="M 74 47 Q 75 50 73 51" stroke="#E2B195" strokeWidth="1.6" strokeLinecap="round" fill="none" />

              {/* Sorriso Calmo e Amigável */}
              <path d="M 66 54 Q 75 60 84 54" stroke="#881337" strokeWidth="2" strokeLinecap="round" fill="none" />

              {/* Cabelo Castanho Escuro Estilizado com Franja Reta (Inspirado na Foto de Referência) */}
              {/* Base Traseira do Cabelo Castanho Escuro */}
              <path d="M 50 44 C 47 28, 58 14, 75 14 C 92 14, 103 28, 100 44 C 98 30, 75 20, 50 44 Z" fill="#2E1B0D" />
              
              {/* Topo e Cabelo Castanho Escuro Encorpado */}
              <path d="M 51 40 Q 52 17 75 16 Q 98 17 99 40 C 99 26, 88 18, 75 18 C 62 18, 51 26, 51 40 Z" fill="#3D2612" />
              
              {/* Franja Reta com Textura Suave caindo sobre a Testa (Característica Principal da Foto) */}
              <path d="M 50 42 Q 54 36 60 36 T 70 35 T 80 36 T 90 36 T 100 42 Q 92 35 84 35 T 75 34 T 66 35 T 50 42 Z" fill="#4A2E16" />
              <path d="M 51 39 C 56 34, 62 36, 68 35 C 74 34, 80 35, 86 35 C 92 35, 97 38, 99 39 C 94 32, 85 30, 75 30 C 65 30, 56 32, 51 39 Z" fill="#5C3A1D" />

              {/* Mechas sutis de brilho no Cabelo Castanho */}
              <path d="M 56 31 Q 65 24 75 25" stroke="#784B26" strokeWidth="1.5" strokeLinecap="round" fill="none" />
              <path d="M 78 25 Q 86 26 94 32" stroke="#784B26" strokeWidth="1.5" strokeLinecap="round" fill="none" />

            </g>
          </svg>

        </div>

        {/* Badge de Status 'AUDITANDO NF' com Animação de Pulse e Brilho */}
        <div className="absolute -bottom-3 z-20 flex items-center justify-center">
          <div className="flex items-center gap-1.5 px-3.5 py-1 bg-[#0055A5] text-white font-extrabold text-[11px] tracking-wider uppercase rounded-full shadow-md border-2 border-white animate-pulse">
            <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-spin" style={{ animationDuration: '3s' }} />
            <span>AUDITANDO NF</span>
            <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-spin" style={{ animationDuration: '3s' }} />
          </div>
        </div>

      </div>

      {/* Frase de Aguarde com Indicador Visual */}
      <div className="space-y-2 max-w-md mx-auto relative z-10 pt-2">
        <h3 className="text-sm font-bold text-slate-800 flex items-center justify-center gap-2">
          <FileSearch className="w-4 h-4 text-[#0055A5] animate-pulse" />
          <span>Análise Inteligente de Documento em Andamento</span>
        </h3>

        <p className="text-xs text-slate-600 font-medium leading-relaxed bg-slate-50 border border-slate-200 p-3.5 rounded-lg shadow-2xs">
          O <strong>Unimarzinho</strong> está analisando seu comprovante e conferindo o CNPJ com a base oficial de polos da Unimar... Por favor, aguarde.
        </p>

        {/* Barra de Progresso Animada */}
        <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden border border-slate-200 mt-2">
          <div className="bg-gradient-to-r from-[#003366] via-sky-500 to-[#0055A5] h-full rounded-full w-full animate-pulse" />
        </div>
        
        <p className="text-[11px] text-slate-400 font-mono pt-1">
          Utilizando Gemini 2.0 Flash Visão para OCR e Auditoria de Alta Precisão
        </p>
      </div>

    </div>
  );
};

// Exportação mantida para retrocompatibilidade
export const ChavesLoadingAnimation = UnimarzinhoLoadingAnimation;
