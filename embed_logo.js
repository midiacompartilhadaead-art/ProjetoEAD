const fs = require('fs');
const path = require('path');

const logoPath = path.join(process.cwd(), 'src/assets/logo-unimar-oficial.png');
const b64 = fs.readFileSync(logoPath).toString('base64');
const dataUri = `data:image/png;base64,${b64}`;

const code = `import React from 'react';

interface UnimarLogoProps {
  colorMode?: 'blue' | 'white' | string;
  className?: string;
  height?: number | string;
  showSubtitle?: boolean;
}

const LOGO_BASE64 = "${dataUri}";

export const UnimarLogo: React.FC<UnimarLogoProps> = ({
  className = '',
  height = '42px',
}) => {
  const logoHeight = typeof height === 'number' ? \`\${height}px\` : height;

  return (
    <div 
      className={\`flex items-center justify-center w-auto shrink-0 overflow-visible \${className}\`}
      style={{ width: 'fit-content', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'visible' }}
    >
      <img 
        src={LOGO_BASE64} 
        alt="Logo Unimar" 
        className="h-10 w-auto object-contain"
        style={{ height: logoHeight, width: 'auto', maxWidth: 'none', objectFit: 'contain', display: 'block' }} 
      />
    </div>
  );
};
`;

fs.writeFileSync(path.join(process.cwd(), 'src/components/UnimarLogo.tsx'), code);
console.log('Successfully embedded logo PNG as Base64. Data length:', dataUri.length);
