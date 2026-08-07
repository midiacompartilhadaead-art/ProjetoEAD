import React from 'react';

/**
 * Propriedades para estilização do ícone do símbolo Unimar ('U')
 */
interface UnimarSymbolIconProps {
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Componente SVG customizado do Símbolo Estilizado 'U' da Unimar
 */
export const UnimarSymbolIcon: React.FC<UnimarSymbolIconProps> = ({ 
  className = "w-5 h-5 inline-block text-blue-600",
  style
}) => {
  return (
    <svg 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg" 
      className={className}
      style={style}
    >
      {/* Base da letra 'U' com curvas e proporções originais da Unimar */}
      <path 
        d="M20 20 H40 V60 C40 70 50 70 50 70 C50 70 60 70 60 60 V20 H80 V60 C80 80 65 90 50 90 C35 90 20 80 20 60 Z" 
        fill="currentColor" 
      />
      {/* Faixas transversais e linhas de gradiente estilizadas do vetor */}
      <path d="M10 80 L35 55 H45 L20 80 Z" fill="currentColor" opacity="0.8" />
      <path d="M55 45 L80 20 H90 L65 45 Z" fill="currentColor" opacity="0.8" />
    </svg>
  );
};

