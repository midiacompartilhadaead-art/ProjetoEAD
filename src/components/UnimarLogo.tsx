import React from 'react';

interface UnimarLogoProps {
  colorMode?: 'blue' | 'white';
  className?: string;
  height?: number | string;
  showBackground?: boolean;
}

export const UnimarLogo: React.FC<UnimarLogoProps> = ({
  colorMode = 'blue',
  className = '',
  height = 36,
  showBackground = false,
}) => {
  const isWhite = colorMode === 'white';
  const brandColor = isWhite ? '#ffffff' : '#0074b8';

  return (
    <div 
      className={`inline-flex items-center justify-center select-none max-w-full ${className}`}
      style={{ height: typeof height === 'number' ? `${height}px` : height }}
    >
      <svg
        viewBox="0 0 460 85"
        preserveAspectRatio="xMinYMid meet"
        className="h-full w-auto max-w-full object-contain block shrink-0"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Transparent Background Box (Optional background if explicitly requested) */}
        {showBackground && (
          <rect width="460" height="85" fill={isWhite ? "rgba(255,255,255,0.15)" : "#0074b8"} rx="8" />
        )}

        <g transform="translate(-2, -2)">
          {/* Diagonal Stripes on left stem of U */}
          <g stroke={brandColor} strokeWidth="4.5" strokeLinecap="square">
            <line x1="8" y1="68" x2="52" y2="12" />
            <line x1="16" y1="68" x2="60" y2="12" />
            <line x1="24" y1="68" x2="68" y2="12" />
            <line x1="32" y1="68" x2="76" y2="12" />
          </g>

          {/* Letter U */}
          <path fill={brandColor} d="M 28 10 L 48 10 L 48 48 C 48 58 56 65 67 65 C 78 65 86 58 86 48 L 86 10 L 106 10 L 106 48 C 106 70 88 82 67 82 C 46 82 28 70 28 48 Z" />

          {/* Letter n */}
          <path fill={brandColor} d="M 115 30 L 133 30 L 133 38 C 139 32 148 28 158 28 C 174 28 184 37 184 53 L 184 80 L 165 80 L 165 55 C 165 46 159 42 151 42 C 143 42 137 47 137 57 L 137 80 L 115 80 Z" />

          {/* Letter i */}
          <path fill={brandColor} d="M 192 30 L 210 30 L 210 80 L 192 80 Z M 201 11 C 207 11 212 16 212 22 C 212 28 207 33 201 33 C 195 33 190 28 190 22 C 190 16 195 11 201 11 Z" />

          {/* Letter m */}
          <path fill={brandColor} d="M 218 30 L 236 30 L 236 38 C 241 32 249 28 257 28 C 266 28 273 32 277 39 C 283 32 292 28 302 28 C 317 28 326 37 326 53 L 326 80 L 308 80 L 308 55 C 308 46 303 42 296 42 C 289 42 283 47 283 57 L 283 80 L 265 80 L 265 55 C 265 46 260 42 253 42 C 246 42 240 47 240 57 L 240 80 L 218 80 Z" />

          {/* Letter a */}
          <path fill={brandColor} d="M 335 53 C 335 38 346 28 363 28 C 375 28 383 33 388 41 L 388 30 L 406 30 L 406 80 L 388 80 L 388 71 C 383 78 374 82 362 82 C 345 82 335 71 335 53 Z M 388 55 C 388 46 381 40 371 40 C 361 40 354 46 354 55 C 354 64 361 70 371 70 C 381 70 388 64 388 55 Z" />

          {/* Letter r */}
          <path fill={brandColor} d="M 416 30 L 434 30 L 434 42 C 439 33 448 28 459 29 L 459 48 C 450 47 439 52 439 63 L 439 80 L 416 80 Z" />
        </g>
      </svg>
    </div>
  );
};
