import React from 'react';

interface UnimarLogoProps {
  colorMode?: 'blue' | 'white' | 'black' | string;
  className?: string;
  height?: number | string;
  showSubtitle?: boolean;
}

export const UnimarLogo: React.FC<UnimarLogoProps> = ({
  colorMode = 'blue',
  className = '',
  height = 42,
}) => {
  const logoHeight = typeof height === 'number' ? `${height}px` : (height || '42px');

  // Determina filtro de cor para o SVG oficial
  let filterStyle = '';
  if (colorMode === 'white') {
    filterStyle = 'brightness-0 invert';
  } else if (colorMode === 'black') {
    filterStyle = 'brightness-0';
  }

  return (
    <div 
      className={`inline-flex items-center justify-center select-none shrink-0 ${className}`} 
      style={{ height: logoHeight, width: 'auto', display: 'inline-flex', alignItems: 'center' }}
    >
      <img
        src="https://oficial.unimar.br/wp-content/themes/re-universo-unimar/images/logo.svg"
        alt="Unimar - Universidade de Marília"
        referrerPolicy="no-referrer"
        className={`h-full w-auto object-contain block transition-all ${filterStyle}`}
        style={{ height: logoHeight, width: 'auto' }}
      />
    </div>
  );
};

